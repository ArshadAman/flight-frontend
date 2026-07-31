#!/usr/bin/env python3
"""Patch tickets buy flow so FlyShop failures / mock flights still create PENDING admin tickets."""
from pathlib import Path

ROOT = Path("/root/flight-booking")
SERIALIZER = ROOT / "tickets" / "serializers.py"
VIEWS = ROOT / "tickets" / "views.py"

SNAPSHOT_FIELD = '''
    flight_snapshot = serializers.JSONField(
        required=False,
        default=dict,
        help_text="Optional flight details used when GDS/mock booking falls back to a local PENDING ticket."
    )
'''

HELPER = r'''
def _iata_code(value, fallback="XXX"):
    """Best-effort 3-letter airport code from city name or code."""
    import re
    s = str(value or "").strip()
    if not s:
        return fallback
    if len(s) == 3 and s.isalpha():
        return s.upper()
    m = re.search(r"\(([A-Za-z]{3})\)", s)
    if m:
        return m.group(1).upper()
    m = re.search(r"\b([A-Za-z]{3})\b", s)
    if m and m.group(1).upper() not in {"THE", "AND", "FOR", "AIR"}:
        # Prefer trailing token that looks like IATA when present in "City CODE"
        parts = re.findall(r"\b([A-Za-z]{3})\b", s)
        if parts:
            return parts[-1].upper()
    city_map = {
        "NEW DELHI": "DEL",
        "DELHI": "DEL",
        "MUMBAI": "BOM",
        "BOMBAY": "BOM",
        "BANGALORE": "BLR",
        "BENGALURU": "BLR",
        "CHENNAI": "MAA",
        "KOLKATA": "CCU",
        "HYDERABAD": "HYD",
        "PUNE": "PNQ",
        "GOA": "GOI",
        "AHMEDABAD": "AMD",
        "JAIPUR": "JAI",
        "KOCHI": "COK",
        "COCHIN": "COK",
        "LUCKNOW": "LKO",
        "CHANDIGARH": "IXC",
    }
    key = re.sub(r"\s+", " ", s.upper())
    if key in city_map:
        return city_map[key]
    for name, code in city_map.items():
        if name in key:
            return code
    return (s[:3] or fallback).upper()


def _parse_dt(value, default=None):
    from django.utils import timezone
    from datetime import datetime
    if default is None:
        default = timezone.now() + timezone.timedelta(days=1)
    if not value:
        return default
    if hasattr(value, "year"):
        return value
    s = str(value).strip()
    try:
        dt = datetime.fromisoformat(s.replace("Z", "+00:00"))
        if timezone.is_naive(dt):
            return timezone.make_aware(dt)
        return dt
    except Exception:
        pass
    for fmt in ("%Y-%m-%d %H:%M:%S", "%Y-%m-%d %H:%M", "%m/%d/%Y %H:%M", "%Y-%m-%d"):
        try:
            dt = datetime.strptime(s[:19] if "H" in fmt else s[:10], fmt)
            return timezone.make_aware(dt)
        except Exception:
            continue
    # travel_date only (YYYY-MM-DD) + optional time in snapshot handled by caller
    try:
        dt = datetime.strptime(s[:10], "%Y-%m-%d")
        return timezone.make_aware(dt)
    except Exception:
        return default


def create_pending_ticket_from_snapshot(user, validated_data, snapshot=None, reason="provider_unavailable"):
    """Create a local PENDING ticket visible in admin when FlyShop/mock buy cannot complete."""
    import random
    from decimal import Decimal
    from django.utils import timezone
    from tickets.models import Ticket

    snapshot = snapshot or {}
    passengers = validated_data.get("passengers", []) or []
    passengers_data = []
    for pax in passengers:
        dob_val = pax.get("dob")
        dob_str = dob_val.strftime("%Y-%m-%d") if hasattr(dob_val, "strftime") else (dob_val or None)
        passengers_data.append({
            "title": pax.get("title", "Mr"),
            "first_name": pax.get("first_name"),
            "last_name": pax.get("last_name"),
            "gender": "M" if pax.get("gender") == 0 else "F",
            "dob": dob_str,
            "passport_number": pax.get("passport_number"),
            "pancard_number": pax.get("pancard_number"),
            "outbound_meal": pax.get("outbound_meal"),
            "return_meal": pax.get("return_meal"),
            "meal_code": pax.get("meal_code"),
        })

    origin = _iata_code(snapshot.get("origin") or snapshot.get("origin_city") or "DEL")
    destination = _iata_code(snapshot.get("destination") or snapshot.get("destination_city") or "BOM")
    airline_code = str(snapshot.get("airline_code") or "XX")[:8]
    airline_name = snapshot.get("airline_name") or snapshot.get("airline") or airline_code
    flight_number = str(snapshot.get("flight_number") or snapshot.get("id") or "000")[:20]
    cabin = snapshot.get("cabin_class") or snapshot.get("cabin") or "Economy"
    price = Decimal(str(snapshot.get("price") or snapshot.get("total_amount") or snapshot.get("basic_amount") or 0))
    pax_count = max(len(passengers_data), 1)
    dep = _parse_dt(snapshot.get("departure_datetime") or snapshot.get("travel_date"))
    arr = _parse_dt(snapshot.get("arrival_datetime"), default=dep + timezone.timedelta(hours=2))
    duration = snapshot.get("duration") or ""
    segments = snapshot.get("segments") or snapshot.get("segments_data") or [{
        "segment_id": 0,
        "airline_code": airline_code,
        "airline_name": airline_name,
        "flight_number": flight_number,
        "origin": origin,
        "destination": destination,
        "departure_datetime": dep.isoformat(),
        "arrival_datetime": arr.isoformat(),
        "duration": duration,
        "return_flight": False,
    }]

    booking_ref = validated_data.get("booking_ref") or f"OFF{random.randint(100000, 999999)}"
    pnr_number = f"PNR{random.randint(100000, 999999)}"

    ssr = {"BookingSSRDetails": validated_data.get("booking_ssr_details", []) or []}
    ssr["offline_reason"] = reason
    if validated_data.get("multi_city_group_id"):
        ssr["multi_city_group_id"] = validated_data.get("multi_city_group_id")

    return Ticket.objects.create(
        user=user,
        status=Ticket.STATUS_PENDING,
        pnr_number=pnr_number,
        booking_ref=str(booking_ref)[:20],
        origin=origin,
        destination=destination,
        departure_datetime=dep,
        arrival_datetime=arr,
        travel_type=validated_data.get("travel_type", 0) or 0,
        airline_code=airline_code,
        airline_name=airline_name,
        flight_number=flight_number,
        cabin_class=cabin,
        basic_amount=price,
        tax_amount=Decimal("0.00"),
        total_amount=price * pax_count,
        currency="INR",
        is_refundable=True,
        food_onboard="",
        segments_data=segments,
        passengers_data=passengers_data,
        ssr_data=ssr,
    )
'''


def patch_serializer():
    text = SERIALIZER.read_text()
    if "flight_snapshot" in text:
        print("serializer already patched")
        return
    needle = "    booking_ssr_details = serializers.JSONField(\n        required=False,\n        default=list,\n        help_text=\"Optional list of pre-booking SSR choices, e.g. [{'Pax_Id': 1, 'SSR_Key': '...'}]\"\n    )\n"
    if needle not in text:
        # looser insert before TicketCancelRequestSerializer
        marker = "class TicketCancelRequestSerializer"
        if marker not in text:
            raise SystemExit("Could not find insert point in serializers.py")
        text = text.replace(
            marker,
            SNAPSHOT_FIELD + "\n\n" + marker,
            1,
        )
    else:
        text = text.replace(needle, needle + SNAPSHOT_FIELD, 1)
    SERIALIZER.write_text(text)
    print("serializer patched")


def patch_views():
    text = VIEWS.read_text()
    if "create_pending_ticket_from_snapshot" in text:
        print("views already patched")
        return

    # Insert helpers near top after imports / before class
    class_marker = "class TicketViewSet"
    if class_marker not in text:
        raise SystemExit("TicketViewSet not found")
    text = text.replace(class_marker, HELPER + "\n\n" + class_marker, 1)

    old = """        # Call ProviderService to coordinate external booking & ticketing
        ticket_data = ProviderService.buy_ticket(
            validated_data=serializer.validated_data,
            user=request.user
        )

        flight_key = serializer.validated_data.get('flight_key', '')
        is_local = flight_key and flight_key.startswith('local-')
        ticket_status = Ticket.STATUS_PENDING if is_local else Ticket.STATUS_CONFIRMED

        # Create and save local Ticket record in DB
        ticket = Ticket.objects.create(
            user=request.user,
            status=ticket_status,
            **ticket_data
        )

        # Serialize and return finalized database Ticket record
        response_serializer = self.get_serializer(ticket)
        return Response(
            data=response_serializer.data,
            status=status.HTTP_201_CREATED
        )
"""

    new = """        flight_key = serializer.validated_data.get('flight_key', '') or ''
        snapshot = serializer.validated_data.get('flight_snapshot') or request.data.get('flight_snapshot') or {}

        # Mock / explicit offline keys never hit FlyShop — create PENDING for admin.
        if flight_key.startswith('mock-') or flight_key.startswith('offline-'):
            ticket = create_pending_ticket_from_snapshot(
                request.user,
                serializer.validated_data,
                snapshot,
                reason='mock_or_offline_key',
            )
            response_serializer = self.get_serializer(ticket)
            return Response(data=response_serializer.data, status=status.HTTP_201_CREATED)

        # Call ProviderService to coordinate external booking & ticketing
        try:
            ticket_data = ProviderService.buy_ticket(
                validated_data=serializer.validated_data,
                user=request.user
            )
        except Exception as exc:
            # FlyShop reprice/temp-book often 502s — still record PENDING so admin sees the booking.
            if snapshot or flight_key.startswith('local-'):
                ticket = create_pending_ticket_from_snapshot(
                    request.user,
                    serializer.validated_data,
                    snapshot,
                    reason=f'provider_error:{exc.__class__.__name__}',
                )
                response_serializer = self.get_serializer(ticket)
                return Response(data=response_serializer.data, status=status.HTTP_201_CREATED)
            raise

        is_local = flight_key.startswith('local-')
        ticket_status = Ticket.STATUS_PENDING if is_local else Ticket.STATUS_CONFIRMED

        # Create and save local Ticket record in DB
        ticket = Ticket.objects.create(
            user=request.user,
            status=ticket_status,
            **ticket_data
        )

        # Serialize and return finalized database Ticket record
        response_serializer = self.get_serializer(ticket)
        return Response(
            data=response_serializer.data,
            status=status.HTTP_201_CREATED
        )
"""

    if old not in text:
        raise SystemExit("Could not find ProviderService.buy_ticket block to replace")
    text = text.replace(old, new, 1)
    VIEWS.write_text(text)
    print("views patched")


if __name__ == "__main__":
    patch_serializer()
    patch_views()
    print("done")
