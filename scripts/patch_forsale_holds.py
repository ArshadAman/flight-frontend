#!/usr/bin/env python3
"""Patch For Sale hold → ticket conversion and waitlist promotion on the VPS backend."""
from pathlib import Path

ROOT = Path("/root/flight-booking")
HOLD_OPS = ROOT / "flights" / "hold_ops.py"
SERIALIZER = ROOT / "tickets" / "serializers.py"
TICKET_VIEWS = ROOT / "tickets" / "views.py"
FLIGHT_VIEWS = ROOT / "flights" / "views.py"

HOLD_OPS_SRC = r'''
"""Seat hold expiry, consumption, and waitlist promotion for offline inventory."""
from __future__ import annotations

from datetime import timedelta

from django.db import transaction
from django.utils import timezone

from .models import AgentFlightInventory, InventoryHold


def expire_stale_holds(inventory: AgentFlightInventory | None = None) -> list[str]:
    """Release expired HOLD seats. Returns inventory ids that changed."""
    now = timezone.now()
    qs = InventoryHold.objects.select_related("inventory").filter(
        status=InventoryHold.STATUS_HOLD,
        expires_at__isnull=False,
        expires_at__lt=now,
    )
    if inventory is not None:
        qs = qs.filter(inventory=inventory)

    changed: list[str] = []
    for hold in qs:
        inv = hold.inventory
        inv.seats_held = max(0, int(inv.seats_held or 0) - int(hold.seats or 0))
        inv.save(update_fields=["seats_held", "updated_at"])
        hold.status = InventoryHold.STATUS_EXPIRED
        hold.save(update_fields=["status", "updated_at"])
        changed.append(str(inv.id))
    return changed


def promote_waitlist(inventory: AgentFlightInventory) -> int:
    """Turn waitlist entries into 24h HOLDs while sellable seats remain."""
    expire_stale_holds(inventory)
    promoted = 0
    while True:
        inventory.refresh_from_db()
        next_wl = (
            InventoryHold.objects.filter(
                inventory=inventory,
                status=InventoryHold.STATUS_WAITLIST,
            )
            .order_by("created_at")
            .first()
        )
        if not next_wl:
            break
        seats = int(next_wl.seats or 1)
        if int(inventory.sellable_seats or 0) < seats:
            break
        inventory.seats_held = int(inventory.seats_held or 0) + seats
        inventory.waitlist_count = max(0, int(inventory.waitlist_count or 0) - seats)
        inventory.save(update_fields=["seats_held", "waitlist_count", "updated_at"])
        next_wl.status = InventoryHold.STATUS_HOLD
        next_wl.expires_at = timezone.now() + timedelta(hours=24)
        next_wl.save(update_fields=["status", "expires_at", "updated_at"])
        promoted += 1
    return promoted


def consume_hold_for_booking(*, hold_id, inventory: AgentFlightInventory, user, pax_count: int):
    """Convert an active HOLD into a booking. Returns (hold, error_response_tuple_or_None)."""
    from rest_framework import status

    expire_stale_holds(inventory)
    try:
        hold = InventoryHold.objects.select_related("inventory").get(id=hold_id)
    except (InventoryHold.DoesNotExist, ValueError, TypeError):
        return None, ({"detail": "Seat hold not found."}, status.HTTP_400_BAD_REQUEST)

    if str(hold.inventory_id) != str(inventory.id):
        return None, ({"detail": "Seat hold does not match this inventory."}, status.HTTP_400_BAD_REQUEST)

    if hold.user_id and user and hold.user_id != getattr(user, "id", None) and not getattr(user, "is_staff", False):
        return None, ({"detail": "This seat hold belongs to another user."}, status.HTTP_403_FORBIDDEN)

    if hold.status == InventoryHold.STATUS_WAITLIST:
        return None, (
            {"detail": "This is a waitlist entry, not a seat hold yet. Wait until a seat is offered."},
            status.HTTP_400_BAD_REQUEST,
        )
    if hold.status != InventoryHold.STATUS_HOLD:
        return None, ({"detail": f"Seat hold is {hold.status} and cannot be booked."}, status.HTTP_400_BAD_REQUEST)

    if hold.expires_at and hold.expires_at < timezone.now():
        expire_stale_holds(inventory)
        return None, ({"detail": "Seat hold has expired. Please hold again or book available seats."}, status.HTTP_400_BAD_REQUEST)

    if int(hold.seats or 0) < pax_count:
        return None, (
            {"detail": f"Hold covers {hold.seats} seat(s); this booking has {pax_count} passenger(s)."},
            status.HTTP_400_BAD_REQUEST,
        )
    if int(inventory.seats_available or 0) < pax_count:
        return None, (
            {"detail": f"Not enough seats available. Only {inventory.seats_available} seats remaining."},
            status.HTTP_400_BAD_REQUEST,
        )

    with transaction.atomic():
        inventory.seats_available = int(inventory.seats_available or 0) - pax_count
        inventory.seats_held = max(0, int(inventory.seats_held or 0) - int(hold.seats or 0))
        inventory.save(update_fields=["seats_available", "seats_held", "updated_at"])
        hold.status = InventoryHold.STATUS_CONFIRMED
        hold.save(update_fields=["status", "updated_at"])
    return hold, None
'''


def patch_hold_ops():
    HOLD_OPS.write_text(HOLD_OPS_SRC.lstrip("\n"))
    print("wrote", HOLD_OPS)


def patch_serializer():
    text = SERIALIZER.read_text()
    marker = '''    flight_snapshot = serializers.JSONField(
        required=False,
        default=dict,
        help_text="Optional flight details used when GDS/mock booking falls back to a local PENDING ticket."
    )
'''
    extra = '''    hold_id = serializers.UUIDField(
        required=False,
        allow_null=True,
        help_text="Optional For Sale inventory hold to convert into this ticket."
    )
'''
    if "hold_id = serializers.UUIDField" in text:
        print("serializer already has hold_id")
        return
    if marker not in text:
        raise SystemExit("flight_snapshot marker not found in tickets/serializers.py")
    SERIALIZER.write_text(text.replace(marker, marker + "\n" + extra, 1))
    print("patched", SERIALIZER)


OLD_SEAT = '''            passengers = serializer.validated_data.get('passengers', [])
            pax_count = len(passengers)
            sellable = getattr(af, "sellable_seats", af.seats_available)
            if sellable < pax_count:
                return Response(
                    {'detail': f'Not enough seats available. Only {sellable} seats remaining.'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Decrement seats
            af.seats_available -= pax_count
            af.save()
'''

NEW_SEAT = '''            passengers = serializer.validated_data.get('passengers', [])
            pax_count = len(passengers)

            from flights.hold_ops import consume_hold_for_booking, expire_stale_holds, promote_waitlist
            expire_stale_holds(af)

            if getattr(af, "apis_required", False):
                missing = [p for p in passengers if not str(p.get("passport_number") or "").strip()]
                if missing:
                    return Response(
                        {'detail': 'Passport / APIS details are required for this inventory.'},
                        status=status.HTTP_400_BAD_REQUEST
                    )

            hold_id = serializer.validated_data.get('hold_id') or request.data.get('hold_id')
            if hold_id:
                _hold, hold_err = consume_hold_for_booking(
                    hold_id=hold_id, inventory=af, user=request.user, pax_count=pax_count
                )
                if hold_err:
                    payload, code = hold_err
                    return Response(payload, status=code)
            else:
                sellable = getattr(af, "sellable_seats", af.seats_available)
                if sellable < pax_count:
                    return Response(
                        {'detail': f'Not enough seats available. Only {sellable} seats remaining.'},
                        status=status.HTTP_400_BAD_REQUEST
                    )
                af.seats_available -= pax_count
                af.save(update_fields=['seats_available', 'updated_at'])
'''

OLD_USER_CANCEL = '''            inventory = ticket.agent_flight_inventory
            inventory.seats_available += pax_count
            inventory.save(update_fields=['seats_available', 'updated_at'])
            gds_cancelled = True
'''

NEW_USER_CANCEL = '''            inventory = ticket.agent_flight_inventory
            inventory.seats_available += pax_count
            inventory.save(update_fields=['seats_available', 'updated_at'])
            try:
                from flights.hold_ops import promote_waitlist
                promote_waitlist(inventory)
            except Exception:
                pass
            gds_cancelled = True
'''

OLD_AGENT_CANCEL = '''        inventory.seats_available += pax_count
        inventory.save(update_fields=['seats_available', 'updated_at'])

        # Update ticket status & cancellation details
'''

NEW_AGENT_CANCEL = '''        inventory.seats_available += pax_count
        inventory.save(update_fields=['seats_available', 'updated_at'])
        try:
            from flights.hold_ops import promote_waitlist
            promote_waitlist(inventory)
        except Exception:
            pass

        # Update ticket status & cancellation details
'''


def patch_ticket_views():
    text = TICKET_VIEWS.read_text()
    if "consume_hold_for_booking" in text:
        print("ticket views already patched for holds")
    else:
        if OLD_SEAT not in text:
            raise SystemExit("agent seat decrement block not found in tickets/views.py")
        text = text.replace(OLD_SEAT, NEW_SEAT, 1)
    if "promote_waitlist(inventory)" not in text:
        if OLD_USER_CANCEL not in text:
            raise SystemExit("user cancel inventory restore not found")
        text = text.replace(OLD_USER_CANCEL, NEW_USER_CANCEL, 1)
        if OLD_AGENT_CANCEL not in text:
            raise SystemExit("agent-cancel inventory restore not found")
        text = text.replace(OLD_AGENT_CANCEL, NEW_AGENT_CANCEL, 1)
    TICKET_VIEWS.write_text(text)
    print("patched", TICKET_VIEWS)


OLD_FOR_SALE_GET = '''    def get(self, request, *args, **kwargs):
        qs = AgentFlightInventory.objects.filter(
            departure_datetime__gte=timezone.now(),
        ).select_related("agent").order_by("departure_datetime")
'''

NEW_FOR_SALE_GET = '''    def get(self, request, *args, **kwargs):
        from flights.hold_ops import expire_stale_holds, promote_waitlist
        changed = expire_stale_holds()
        for inv_id in set(changed):
            try:
                promote_waitlist(AgentFlightInventory.objects.get(id=inv_id))
            except AgentFlightInventory.DoesNotExist:
                pass
        qs = AgentFlightInventory.objects.filter(
            departure_datetime__gte=timezone.now(),
        ).select_related("agent").order_by("departure_datetime")
'''

OLD_HOLD_CREATE = '''        prefer_waitlist = str(request.data.get("prefer_waitlist") or "").lower() in {"1", "true", "yes"}

        try:
            inv = AgentFlightInventory.objects.get(id=inventory_id)
'''

NEW_HOLD_CREATE = '''        prefer_waitlist = str(request.data.get("prefer_waitlist") or "").lower() in {"1", "true", "yes"}

        try:
            inv = AgentFlightInventory.objects.get(id=inventory_id)
        except AgentFlightInventory.DoesNotExist:
            return Response({"detail": "Inventory not found."}, status=status.HTTP_404_NOT_FOUND)

        from flights.hold_ops import expire_stale_holds
        expire_stale_holds(inv)

        try:
            inv = AgentFlightInventory.objects.get(id=inventory_id)
'''

# The above would duplicate the DoesNotExist handler. Do a simpler insert after get.

OLD_HOLD_AFTER_GET = '''        try:
            inv = AgentFlightInventory.objects.get(id=inventory_id)
        except AgentFlightInventory.DoesNotExist:
            return Response({"detail": "Inventory not found."}, status=status.HTTP_404_NOT_FOUND)

        if not inv.is_published or not inv.is_enabled or inventory_is_restricted(inv):
'''

NEW_HOLD_AFTER_GET = '''        try:
            inv = AgentFlightInventory.objects.get(id=inventory_id)
        except AgentFlightInventory.DoesNotExist:
            return Response({"detail": "Inventory not found."}, status=status.HTTP_404_NOT_FOUND)

        from flights.hold_ops import expire_stale_holds
        expire_stale_holds(inv)
        inv.refresh_from_db()

        if not inv.is_published or not inv.is_enabled or inventory_is_restricted(inv):
'''

OLD_HOLD_CANCEL_END = '''        hold.status = InventoryHold.STATUS_CANCELLED
        hold.save(update_fields=["status", "updated_at"])
        return Response(InventoryHoldSerializer(hold).data)
'''

NEW_HOLD_CANCEL_END = '''        hold.status = InventoryHold.STATUS_CANCELLED
        hold.save(update_fields=["status", "updated_at"])
        try:
            from flights.hold_ops import promote_waitlist
            promote_waitlist(inv)
        except Exception:
            pass
        return Response(InventoryHoldSerializer(hold).data)
'''


def patch_flight_views():
    text = FLIGHT_VIEWS.read_text()
    if "expire_stale_holds()" not in text:
        if OLD_FOR_SALE_GET not in text:
            raise SystemExit("PublicForSaleInventoryView.get marker not found")
        text = text.replace(OLD_FOR_SALE_GET, NEW_FOR_SALE_GET, 1)
    if "expire_stale_holds(inv)" not in text:
        if OLD_HOLD_AFTER_GET not in text:
            raise SystemExit("hold create get() marker not found")
        text = text.replace(OLD_HOLD_AFTER_GET, NEW_HOLD_AFTER_GET, 1)
    if "promote_waitlist(inv)" not in text:
        if OLD_HOLD_CANCEL_END not in text:
            raise SystemExit("hold cancel end marker not found")
        text = text.replace(OLD_HOLD_CANCEL_END, NEW_HOLD_CANCEL_END, 1)
    FLIGHT_VIEWS.write_text(text)
    print("patched", FLIGHT_VIEWS)


if __name__ == "__main__":
    patch_hold_ops()
    patch_serializer()
    patch_ticket_views()
    patch_flight_views()
    print("ok")
