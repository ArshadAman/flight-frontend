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
    "corporateFare",
    "srCitizen",
    "airlineCode",
  ] as const;

  for (const key of keys) {
    const value = searchParams.get(key);
    if (value) params.set(key, value);
  }

  // Forward multi-city segment params so the BFF can build trip_segments
  const segCountRaw = searchParams.get("segCount");
  if (segCountRaw) {
    params.set("segCount", segCountRaw);
    const segCount = parseInt(segCountRaw, 10) || 0;
    for (let i = 0; i < segCount; i++) {
      for (const key of [`seg_origin_${i}`, `seg_dest_${i}`, `seg_date_${i}`] as const) {
        const value = searchParams.get(key);
        if (value) params.set(key, value);
      }
    }
  }

  return params.toString();
}
