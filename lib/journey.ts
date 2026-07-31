/**
 * Connecting-flight helpers: normalized segments, layovers and stop labels.
 * The provider sends per-leg durations as "HH:MM" and datetimes as "MM/DD/YYYY HH:MM".
 */

export type FlightSegment = {
  airline_code?: string;
  airline_name?: string;
  flight_number?: string;
  aircraft_type?: string;
  origin: string;
  origin_city?: string;
  origin_terminal?: string;
  destination: string;
  destination_city?: string;
  destination_terminal?: string;
  /** ISO timestamps when the provider supplied parseable datetimes. */
  departure_iso?: string;
  arrival_iso?: string;
  /** Display times, e.g. "07:20 AM". */
  departureTime?: string;
  arrivalTime?: string;
  duration?: string;
  duration_minutes?: number;
};

export type Layover = {
  airport: string;
  city?: string;
  minutes: number;
  /** e.g. "2h 20m", empty when the provider gave no usable times. */
  label: string;
};

export function formatDurationMinutes(minutes?: number | null): string {
  if (minutes == null || !Number.isFinite(minutes) || minutes < 0) return "";
  const total = Math.round(minutes);
  const hours = Math.floor(total / 60);
  const mins = total % 60;
  if (hours && mins) return `${hours}h ${mins}m`;
  if (hours) return `${hours}h`;
  return `${mins}m`;
}

/** Accepts "02:20", "2h 20m", "140m", "PT2H20M" or a raw minute count. */
export function parseDurationMinutes(raw: unknown): number | undefined {
  if (typeof raw === "number" && Number.isFinite(raw)) return raw;
  const value = String(raw ?? "").trim();
  if (!value) return undefined;

  const hhmm = value.match(/^(\d{1,3}):([0-5]\d)$/);
  if (hhmm) return parseInt(hhmm[1], 10) * 60 + parseInt(hhmm[2], 10);

  const iso = value.toUpperCase().match(/^PT(?:(\d+)H)?(?:(\d+)M)?$/);
  if (iso && (iso[1] || iso[2])) {
    return parseInt(iso[1] || "0", 10) * 60 + parseInt(iso[2] || "0", 10);
  }

  const hoursMinutes = value.match(/(\d+)\s*h(?:\s*(\d+)\s*m)?/i);
  if (hoursMinutes) {
    return parseInt(hoursMinutes[1], 10) * 60 + parseInt(hoursMinutes[2] || "0", 10);
  }

  const minutesOnly = value.match(/^(\d+)\s*m(?:in(?:utes)?)?$/i);
  if (minutesOnly) return parseInt(minutesOnly[1], 10);

  return undefined;
}

/** "KOLKATA (CCU)" → "Kolkata" */
export function formatCityLabel(raw?: string | null): string | undefined {
  if (!raw) return undefined;
  const withoutCode = raw.replace(/\s*\([A-Z]{3}\)\s*$/i, "").trim();
  if (!withoutCode) return undefined;
  if (withoutCode !== withoutCode.toUpperCase()) return withoutCode;
  return withoutCode
    .toLowerCase()
    .split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function toMillis(iso?: string): number | undefined {
  if (!iso) return undefined;
  const ms = new Date(iso).getTime();
  return Number.isFinite(ms) ? ms : undefined;
}

/** Handles ISO timestamps and the provider's "MM/DD/YYYY HH:MM" format. */
export function parseFlightDateTime(raw?: string | null): Date | undefined {
  if (!raw) return undefined;
  const value = String(raw).trim();
  if (!value) return undefined;

  const uat = value.match(/^(\d{2})\/(\d{2})\/(\d{4})\s+(\d{1,2}):(\d{2})$/);
  if (uat) {
    return new Date(
      parseInt(uat[3], 10),
      parseInt(uat[1], 10) - 1,
      parseInt(uat[2], 10),
      parseInt(uat[4], 10),
      parseInt(uat[5], 10)
    );
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed;
}

export function formatTime12h(date?: Date | null): string | undefined {
  if (!date || Number.isNaN(date.getTime())) return undefined;
  let hours = date.getHours();
  const minutes = date.getMinutes();
  const suffix = hours >= 12 ? "PM" : "AM";
  hours = hours % 12 || 12;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")} ${suffix}`;
}

/** Normalizes provider / agent-inventory segment rows into {@link FlightSegment}. */
export function normalizeSegments(raw?: Array<Record<string, unknown>> | null): FlightSegment[] {
  if (!Array.isArray(raw) || !raw.length) return [];

  return raw.map((entry) => {
    const seg = (entry || {}) as Record<string, any>;
    const departure = parseFlightDateTime(seg.departure_datetime || seg.departure);
    const arrival = parseFlightDateTime(seg.arrival_datetime || seg.arrival);
    const gapMinutes =
      departure && arrival
        ? Math.max(0, Math.round((arrival.getTime() - departure.getTime()) / 60000))
        : undefined;
    const minutes = parseDurationMinutes(seg.duration) ?? gapMinutes;

    const airlineCode = String(seg.airline_code || "").toUpperCase().trim();
    const flightNumber = String(seg.flight_number || "").trim();
    const displayFlightNumber = flightNumber
      ? airlineCode && !flightNumber.toUpperCase().startsWith(airlineCode)
        ? `${airlineCode}-${flightNumber}`
        : flightNumber
      : undefined;

    return {
      airline_code: airlineCode || undefined,
      airline_name: seg.airline_name || undefined,
      flight_number: displayFlightNumber,
      aircraft_type: seg.aircraft_type || undefined,
      origin: String(seg.origin || "").toUpperCase(),
      origin_city: seg.origin_city || undefined,
      origin_terminal: seg.origin_terminal || undefined,
      destination: String(seg.destination || "").toUpperCase(),
      destination_city: seg.destination_city || undefined,
      destination_terminal: seg.destination_terminal || undefined,
      departure_iso: departure?.toISOString(),
      arrival_iso: arrival?.toISOString(),
      departureTime: formatTime12h(departure),
      arrivalTime: formatTime12h(arrival),
      duration: formatDurationMinutes(minutes) || undefined,
      duration_minutes: minutes,
    };
  });
}

export function layoversFromSegments(segments?: FlightSegment[] | null): Layover[] {
  if (!segments || segments.length < 2) return [];

  const result: Layover[] = [];
  for (let i = 0; i < segments.length - 1; i += 1) {
    const arriving = segments[i];
    const departing = segments[i + 1];
    const arrivalMs = toMillis(arriving.arrival_iso);
    const departureMs = toMillis(departing.departure_iso);
    const gap =
      arrivalMs != null && departureMs != null
        ? Math.round((departureMs - arrivalMs) / 60000)
        : 0;
    const minutes = gap > 0 ? gap : 0;

    result.push({
      airport: departing.origin || arriving.destination,
      city: formatCityLabel(departing.origin_city || arriving.destination_city),
      minutes,
      label: formatDurationMinutes(minutes),
    });
  }
  return result;
}

export function viaAirports(segments?: FlightSegment[] | null): string[] {
  if (!segments || segments.length < 2) return [];
  return segments.slice(0, -1).map((seg, i) => segments[i + 1]?.origin || seg.destination).filter(Boolean);
}

/** e.g. "Non-stop", "1 stop via CCU", "2 stops via CCU, MAA" */
export function stopsLabel(stops: number, via?: string[] | null): string {
  if (!stops || stops < 1) return "Non-stop";
  const noun = stops === 1 ? "stop" : "stops";
  const codes = (via || []).filter(Boolean);
  return codes.length ? `${stops} ${noun} via ${codes.join(", ")}` : `${stops} ${noun}`;
}

/** e.g. "Layover 2h 20m at CCU" — one entry per connection. */
export function layoverLabels(layovers?: Layover[] | null): string[] {
  return (layovers || []).map((l) =>
    l.label ? `Layover ${l.label} at ${l.airport}` : `Layover at ${l.airport}`
  );
}
