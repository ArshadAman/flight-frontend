import type { Flight } from "@/lib/flight";
import { formatBaggageLabel } from "@/lib/flight";
import { unwrapList } from "@/lib/apiEnvelope";
import { layoversFromSegments, normalizeSegments, viaAirports } from "@/lib/journey";

export type ForSaleInventoryItem = {
  id: string;
  airline_code: string;
  airline_name: string;
  flight_number: string;
  origin: string;
  destination: string;
  departure_datetime: string;
  arrival_datetime: string;
  price: number | string;
  seats_available: number;
  seats_held?: number;
  waitlist_count?: number;
  sellable_seats?: number;
  cabin_class?: string;
  duration?: string;
  is_refundable?: boolean;
  baggage_check_in?: string;
  baggage_hand?: string;
  apis_required?: boolean;
  policies?: Record<string, string> | null;
  segments_data?: Array<Record<string, unknown>> | null;
  flight_key?: string;
  fare_id?: string;
  search_key?: string;
  agent?: string;
  agent_username?: string;
};

function formatTime12h(iso: string): string {
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return d.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  } catch {
    return iso;
  }
}

/** Map public For Sale inventory row → booking Flight draft shape. */
export function forSaleItemToFlight(item: ForSaleInventoryItem): Flight {
  const price = Number(item.price) || 0;
  const baggage = formatBaggageLabel({
    check_in: item.baggage_check_in,
    hand: item.baggage_hand,
  });
  const travelDate = item.departure_datetime
    ? new Date(item.departure_datetime).toISOString().slice(0, 10)
    : new Date().toISOString().slice(0, 10);
  const segments = normalizeSegments(item.segments_data);

  return {
    id: `${item.airline_code || "XX"}-${item.flight_number || item.id}`,
    airline: item.airline_name || item.airline_code || "Airline",
    airline_code: item.airline_code,
    origin: item.origin,
    destination: item.destination,
    departureTime: formatTime12h(item.departure_datetime),
    arrivalTime: formatTime12h(item.arrival_datetime),
    duration: item.duration || "—",
    price,
    tax_amount: 0,
    base_amount: price,
    stops: Math.max(0, (item.segments_data?.length || 1) - 1),
    segments: segments.length ? segments : undefined,
    layovers: layoversFromSegments(segments),
    via: viaAirports(segments),
    fare_type: "PUB",
    has_baggage: Boolean(item.baggage_check_in || item.baggage_hand),
    baggage_label: baggage || undefined,
    cabin_class: item.cabin_class || "Economy",
    meal_available: true,
    food_onboard: true,
    search_key: item.search_key || `agent-marketplace-${item.id}`,
    flight_key: item.flight_key || `agent-${item.id}`,
    fare_id: item.fare_id || `agent-fare-${item.id}`,
    travel_date: travelDate,
    is_agent_flight: true,
    agent_flight_id: String(item.id),
    apis_required: Boolean(item.apis_required),
    seats_available: item.sellable_seats ?? item.seats_available,
  };
}

export async function fetchForSaleInventory(params?: {
  origin?: string;
  destination?: string;
}): Promise<ForSaleInventoryItem[]> {
  const qs = new URLSearchParams();
  if (params?.origin) qs.set("origin", params.origin);
  if (params?.destination) qs.set("destination", params.destination);
  const suffix = qs.toString() ? `?${qs.toString()}` : "";
  const res = await fetch(`/api/inventory/for-sale${suffix}`, { cache: "no-store" });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `Failed to load For Sale inventory (${res.status})`);
  }
  const json = await res.json();
  return unwrapList<ForSaleInventoryItem>(json);
}
