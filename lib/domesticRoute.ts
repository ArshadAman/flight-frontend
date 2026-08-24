/**
 * Domestic (India) route detection.
 *
 * Passport / APIS travel-document capture only applies to international
 * itineraries. An itinerary counts as domestic only when every airport it
 * touches is a known Indian airport — unknown codes fall back to
 * international so we never silently skip document capture on a foreign leg.
 */

const INDIAN_AIRPORT_CODES = new Set<string>([
  "AGR", "AGX", "AIP", "AJL", "AMD", "ATQ", "AYJ",
  "BBI", "BDQ", "BEK", "BEP", "BHJ", "BHO", "BHU", "BKB", "BLR", "BOM", "BUP",
  "CCJ", "CCU", "CDP", "CJB", "CNN", "COK",
  "DAI", "DBD", "DBR", "DED", "DEL", "DGH", "DHM", "DIB", "DIU", "DMU",
  "GAU", "GAY", "GOI", "GOP", "GOX", "GWL",
  "HBX", "HDO", "HGI", "HJR", "HSR", "HSS", "HYD",
  "IDR", "IMF", "ISK",
  "IXA", "IXB", "IXC", "IXD", "IXE", "IXG", "IXH", "IXI", "IXJ", "IXL", "IXM",
  "IXN", "IXP", "IXQ", "IXR", "IXS", "IXT", "IXU", "IXV", "IXW", "IXY", "IXZ",
  "JAI", "JDH", "JGA", "JGB", "JLR", "JRG", "JRH", "JSA",
  "KBK", "KJB", "KLH", "KNU", "KQH", "KTU", "KUU",
  "LKO", "LUH",
  "MAA", "MYQ",
  "NAG", "NDC", "NVY",
  "PAB", "PAT", "PBD", "PGH", "PNQ", "PNY", "PYG",
  "RAJ", "REW", "RGH", "RJA", "RJI", "RPR", "RRK", "RTC", "RUP",
  "SAG", "SDW", "SHL", "SLV", "SSE", "STV", "SXR", "SXV",
  "TCR", "TEI", "TEZ", "TIR", "TJV", "TRV", "TRZ",
  "UDR",
  "VDY", "VGA", "VNS", "VTZ",
  "ZER",
]);

/**
 * Extracts "CCU" from "CCU" or "Kolkata (CCU)". City names without a code
 * (e.g. "New Delhi") return "" rather than a guess, so callers fall back to
 * the IATA codes carried on the flight itself.
 */
export function toAirportCode(raw?: string | null): string {
  if (!raw) return "";
  const value = String(raw).trim();
  const parenthesised = value.match(/\(([A-Za-z]{3})\)\s*$/);
  if (parenthesised) return parenthesised[1].toUpperCase();
  const standalone = value.match(/^[A-Za-z]{3}$/);
  return standalone ? value.toUpperCase() : "";
}

export function isIndianAirport(raw?: string | null): boolean {
  const code = toAirportCode(raw);
  return code ? INDIAN_AIRPORT_CODES.has(code) : false;
}

/** True only when every recognised airport on the itinerary is in India. */
export function isDomesticRoute(airports: Array<string | null | undefined>): boolean {
  const codes = airports.map(toAirportCode).filter(Boolean);
  if (!codes.length) return false;
  return codes.every((code) => INDIAN_AIRPORT_CODES.has(code));
}

type RouteLike = {
  origin?: string | null;
  destination?: string | null;
  segments?: Array<{ origin?: string | null; destination?: string | null }> | null;
};

export function airportsOnRoute(route?: RouteLike | null): string[] {
  if (!route) return [];
  const codes = [route.origin, route.destination];
  for (const seg of route.segments || []) {
    codes.push(seg?.origin, seg?.destination);
  }
  return codes.map(toAirportCode).filter(Boolean);
}

export function isDomesticFlight(flight?: RouteLike | null): boolean {
  return isDomesticRoute(airportsOnRoute(flight));
}

/** Domestic only when every leg of the booking (outbound, return, multi-city) is domestic. */
export function isDomesticItinerary(
  legs: Array<RouteLike | null | undefined>,
  extraAirports: Array<string | null | undefined> = []
): boolean {
  const codes = [
    ...legs.flatMap((leg) => airportsOnRoute(leg)),
    ...extraAirports.map(toAirportCode).filter(Boolean),
  ];
  return isDomesticRoute(codes);
}

/**
 * Passport / APIS capture is required for international itineraries, and also
 * when the agent marked the For Sale listing as APIS-required (even domestic).
 */
export function itineraryRequiresTravelDocs(
  isDomestic: boolean,
  flights: Array<{ apis_required?: boolean } | null | undefined> = []
): boolean {
  if (flights.some((flight) => Boolean(flight?.apis_required))) return true;
  return !isDomestic;
}
