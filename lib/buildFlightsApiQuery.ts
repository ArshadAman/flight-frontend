/** Builds query string for GET /api/flights from URL search params */
export function buildFlightsApiQuery(searchParams: URLSearchParams): string {
  const params = new URLSearchParams();
  const keys = [
    "origin",
    "destination",
    "nonStop",
    "tripType",
    "departureDate",
    "returnDate",
    "adults",
    "children",
    "infants",
    "cabin",
    "baggageFares",
    "studentFare",
    "defenceFare",
    "srCitizen",
    "airlineCode",
  ] as const;

  for (const key of keys) {
    const value = searchParams.get(key);
    if (value) params.set(key, value);
  }

  return params.toString();
}
