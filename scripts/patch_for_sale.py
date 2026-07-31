#!/usr/bin/env python3
"""Apply For Sale backend upgrades on the VPS flight-booking tree.

Adds:
- AgentFlightInventory.is_published / apis_required / policies
- GET /api/v1/flights/for-sale/ public catalog
- Search fallback to agent inventory when FlyShop fails
- Agent/admin inventory permission fix

Run on the server:
  python3 /tmp/patch_for_sale.py && cd /root/flight-booking && python manage.py migrate flights
  # then restart gunicorn/uwsgi as usual
"""
from pathlib import Path
import re
import textwrap

ROOT = Path("/root/flight-booking")
MODELS = ROOT / "flights" / "models.py"
VIEWS = ROOT / "flights" / "views.py"
URLS = ROOT / "flights" / "urls.py"
SERIALIZERS = ROOT / "flights" / "serializers.py"
SERVICES = ROOT / "flights" / "services.py"
PERMS = ROOT / "accounts" / "permissions.py"
TICKETS = ROOT / "tickets" / "views.py"
MIGRATIONS = ROOT / "flights" / "migrations"


def ensure_model_fields():
    text = MODELS.read_text()
    if "is_published" in text:
        print("models: is_published already present")
        return
    needle = 'help_text="JSON list containing segments details for multi-segment flights."\n    )'
    insert = needle + textwrap.dedent(
        '''

    is_published = models.BooleanField(
        default=True,
        help_text="When True, inventory appears on For Sale and in flight search.",
    )
    apis_required = models.BooleanField(
        default=False,
        help_text="Whether passport/API passenger details are required for booking.",
    )
    policies = models.JSONField(
        null=True,
        blank=True,
        default=dict,
        help_text="Cancellation / change / refund policy text for this inventory.",
    )
'''
    )
    if needle not in text:
        raise SystemExit("models.py: segments field marker not found")
    MODELS.write_text(text.replace(needle, insert, 1))
    print("models: added publish/policy fields")


def write_migration():
    path = MIGRATIONS / "0003_agentflightinventory_publish_policies.py"
    if path.exists():
        print("migration: already exists")
        return
    path.write_text(
        textwrap.dedent(
            '''
            from django.db import migrations, models


            class Migration(migrations.Migration):

                dependencies = [
                    ("flights", "0002_agentflightinventory_segments"),
                ]

                operations = [
                    migrations.AddField(
                        model_name="agentflightinventory",
                        name="is_published",
                        field=models.BooleanField(
                            default=True,
                            help_text="When True, inventory appears on For Sale and in flight search.",
                        ),
                    ),
                    migrations.AddField(
                        model_name="agentflightinventory",
                        name="apis_required",
                        field=models.BooleanField(
                            default=False,
                            help_text="Whether passport/API passenger details are required for booking.",
                        ),
                    ),
                    migrations.AddField(
                        model_name="agentflightinventory",
                        name="policies",
                        field=models.JSONField(
                            blank=True,
                            default=dict,
                            help_text="Cancellation / change / refund policy text for this inventory.",
                            null=True,
                        ),
                    ),
                ]
            '''
        ).lstrip()
    )
    print("migration: wrote 0003")


def patch_permissions():
    text = PERMS.read_text()
    if "is_platform_admin(user)" in text and "role == 'AGENT'" in text and "IsAgentUser" in text:
        if "Allows access to agent users and platform admins" in text:
            print("permissions: already patched")
            return
    old = '''class IsAgentUser(permissions.BasePermission):
    """
    Allows access only to agent users.
    """
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == 'AGENT')
'''
    new = '''class IsAgentUser(permissions.BasePermission):
    """
    Allows access to agent users and platform admins (for inventory ops).
    """
    def has_permission(self, request, view):
        user = request.user
        if not user or not user.is_authenticated:
            return False
        if getattr(user, "role", "") == "AGENT":
            return True
        return is_platform_admin(user)
'''
    if old not in text:
        print("permissions: pattern not found — skip / review manually")
        return
    PERMS.write_text(text.replace(old, new, 1))
    print("permissions: IsAgentUser allows ADMIN")


def main():
    if not ROOT.exists():
        raise SystemExit(f"Missing {ROOT}")
    ensure_model_fields()
    write_migration()
    patch_permissions()
    print(
        "NOTE: Copy updated views.py / urls.py / serializers.py / services.py / tickets/views.py "
        "from the AIRLINE repo backend/ folder, then run migrate + restart."
    )


if __name__ == "__main__":
    main()
