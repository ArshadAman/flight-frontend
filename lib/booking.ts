import type { Flight } from "@/lib/flight";
import { mealOptionsForFlight } from "@/lib/flight";

export const BOOKING_DRAFT_KEY = "flight_booking_draft";

export type BookingPassenger = {
  id: string;
  pax_type: 0 | 1 | 2;
  label: string;
  title: string;
  first_name: string;
  last_name: string;
  gender: string;
  dob: string;
  outbound_meal: string;
  return_meal: string;
  passport_number?: string;
};

export type BookingDraft = {
  tripType: "one-way" | "round-trip";
  origin: string;
  destination: string;
  departureDate: string;
  returnDate?: string;
  cabin: string;
  adults: number;
  children: number;
  infants: number;
  outbound: Flight;
  returnFlight?: Flight;
  createdAt: string;
};

export function saveBookingDraft(draft: BookingDraft): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(BOOKING_DRAFT_KEY, JSON.stringify(draft));
}

export function loadBookingDraft(): BookingDraft | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(BOOKING_DRAFT_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as BookingDraft;
  } catch {
    return null;
  }
}

export function clearBookingDraft(): void {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(BOOKING_DRAFT_KEY);
}

export function buildInitialPassengers(
  adults: number,
  children: number,
  infants: number
): BookingPassenger[] {
  const list: BookingPassenger[] = [];
  let n = 0;
  const mk = (pax_type: 0 | 1 | 2, label: string, title: string) => ({
    id: `pax-${n++}`,
    pax_type,
    label,
    title,
    first_name: "",
    last_name: "",
    gender: "Male",
    dob: "",
    outbound_meal: "none",
    return_meal: "none",
  });

  for (let i = 0; i < adults; i++) list.push(mk(0, `Adult ${i + 1}`, "MR"));
  for (let i = 0; i < children; i++) list.push(mk(1, `Child ${i + 1}`, "MSTR"));
  for (let i = 0; i < infants; i++) list.push(mk(2, `Infant ${i + 1}`, "MSTR"));
  return list;
}

function mealPriceFromFlight(flight: Flight | undefined, mealId: string): number {
  const options = mealOptionsForFlight(flight);
  return options.find((m) => m.id === mealId)?.price ?? 0;
}

export function computeBookingTotal(
  draft: BookingDraft,
  passengers: BookingPassenger[]
): { subtotal: number; tax: number; meals: number; total: number } {
  const payingPax = draft.adults + draft.children;
  const outboundBase = draft.outbound.price * payingPax;
  const returnBase = draft.returnFlight ? draft.returnFlight.price * payingPax : 0;
  const subtotal = outboundBase + returnBase;
  const tax = Math.round(subtotal * 0.15);

  let meals = 0;
  for (const p of passengers) {
    meals += mealPriceFromFlight(draft.outbound, p.outbound_meal);
    if (draft.tripType === "round-trip" && draft.returnFlight) {
      meals += mealPriceFromFlight(draft.returnFlight, p.return_meal);
    }
  }

  return { subtotal, tax, meals, total: subtotal + tax + meals };
}

type BuyPayload = {
  search_key: string;
  flight_key: string;
  fare_id: string;
  customer_mobile: string;
  passenger_mobile: string;
  passenger_email: string;
  passengers: Array<{
    pax_type: number;
    title: string;
    first_name: string;
    last_name: string;
    gender: number;
    dob: string;
    outbound_meal?: string;
    return_meal?: string;
  }>;
  return_flight_key?: string;
  return_fare_id?: string;
};

export async function submitFlightBooking(
  leg: Flight,
  returnLeg: Flight | undefined,
  contact: { mobile: string; email: string },
  passengers: BookingPassenger[],
  token: string | null,
  bookingSSRDetails: any[] = []
): Promise<{ ok: true; tickets: unknown[] } | { ok: false; error: string }> {
  const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8001/api/v1";

  const paxPayload = passengers.map((p) => ({
    pax_type: p.pax_type,
    title: p.title,
    first_name: p.first_name,
    last_name: p.last_name,
    gender: p.gender === "Male" ? 0 : 1,
    dob: p.dob,
    ...(p.outbound_meal && p.outbound_meal !== "none"
      ? { outbound_meal: p.outbound_meal, meal_code: p.outbound_meal }
      : {}),
    ...(returnLeg && p.return_meal && p.return_meal !== "none"
      ? { return_meal: p.return_meal }
      : {}),
  }));

  const body: BuyPayload & { booking_ssr_details?: any[] } = {
    search_key: leg.search_key || "mock-search-key",
    flight_key: leg.flight_key || "mock-flight-key",
    fare_id: leg.fare_id || "mock-fare-id",
    customer_mobile: contact.mobile,
    passenger_mobile: contact.mobile,
    passenger_email: contact.email,
    passengers: paxPayload,
    booking_ssr_details: bookingSSRDetails
  };

  if (returnLeg) {
    body.return_flight_key = returnLeg.flight_key;
    body.return_fare_id = returnLeg.fare_id;
  }

  try {
    const res = await fetch(`${apiBase}/tickets/buy/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      let data = await res.json();
      if (data && data.success && data.data !== undefined) {
        data = data.data;
      }
      return { ok: true, tickets: Array.isArray(data) ? data : [data] };
    }
  } catch {
    /* fall through to sequential legs */
  }

  // Try booking outbound then return separately
  const tickets: unknown[] = [];
  try {
    const outRes = await fetch(`${apiBase}/tickets/buy/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({
        ...body,
        return_flight_key: undefined,
        return_fare_id: undefined,
      }),
    });
    if (outRes.ok) {
      let data = await outRes.json();
      if (data && data.success && data.data !== undefined) {
        data = data.data;
      }
      tickets.push(data);
    }
    else if (returnLeg) throw new Error("Outbound booking failed");

    if (returnLeg) {
      const retRes = await fetch(`${apiBase}/tickets/buy/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          search_key: returnLeg.search_key || body.search_key,
          flight_key: returnLeg.flight_key,
          fare_id: returnLeg.fare_id,
          customer_mobile: contact.mobile,
          passenger_mobile: contact.mobile,
          passenger_email: contact.email,
          passengers: paxPayload,
        }),
      });
      if (retRes.ok) {
        let data = await retRes.json();
        if (data && data.success && data.data !== undefined) {
          data = data.data;
        }
        tickets.push(data);
      }
      else throw new Error("Return booking failed");
    }

    if (tickets.length) return { ok: true, tickets };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Booking failed" };
  }

  return { ok: false, error: "Unable to complete booking with the provider" };
}

export function buildOfflineTicket(
  draft: BookingDraft,
  passengers: BookingPassenger[],
  leg: Flight,
  legLabel: string
) {
  const pnr = `PNR${Math.floor(100000 + Math.random() * 900000)}`;
  return {
    id: `ticket-${Math.random().toString(36).slice(2, 11)}`,
    pnr_number: pnr,
    ticket_number: `ETKT-${Math.floor(1000000 + Math.random() * 9000000)}`,
    status: "CONFIRMED",
    origin: leg.origin,
    destination: leg.destination,
    airline_name: leg.airline,
    airline_code: leg.airline_code || leg.id.split("-")[0],
    flight_number: leg.id.split("-")[1] || "000",
    cabin_class: draft.cabin,
    total_amount: leg.price * (draft.adults + draft.children),
    food_onboard: leg.meal_available ?? leg.food_onboard ?? false,
    passengers_data: passengers.map((p) => ({
      title: p.title,
      first_name: p.first_name,
      last_name: p.last_name,
      outbound_meal: p.outbound_meal,
      return_meal: p.return_meal,
    })),
    leg_label: legLabel,
    departure_display: leg.departureTime,
    arrival_display: leg.arrivalTime,
    duration: leg.duration,
    created_at: new Date().toISOString(),
  };
}
