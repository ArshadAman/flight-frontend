#!/usr/bin/env python3
from pathlib import Path

p = Path("/root/flight-booking/tickets/views.py")
t = p.read_text()

start = t.find("def _iata_code(value, fallback=\"XXX\"):")
end = t.find("def _parse_dt(", start)
if start < 0 or end < 0:
    raise SystemExit("helpers not found")

replacement = '''def _iata_code(value, fallback="XXX"):
    """Best-effort 3-letter airport code from city name or code."""
    import re
    s = str(value or "").strip()
    if not s:
        return fallback
    if len(s) == 3 and s.isalpha():
        return s.upper()
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
    key = re.sub(r"\\s+", " ", s.upper())
    if key in city_map:
        return city_map[key]
    for name, code in city_map.items():
        if name in key:
            return code
    m = re.search(r"\\(([A-Za-z]{3})\\)", s)
    if m:
        return m.group(1).upper()
    parts = re.findall(r"\\b([A-Za-z]{3})\\b", s)
    skip = {"THE", "AND", "FOR", "AIR", "NEW"}
    for part in reversed(parts):
        if part.upper() not in skip:
            return part.upper()
    return (s[:3] or fallback).upper()


'''

t = t[:start] + replacement + t[end:]
p.write_text(t)
print("iata fixed")
