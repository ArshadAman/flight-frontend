import { getPublicApiUrl } from "@/lib/apiConfig";
import { mealOptionsForFlight, type Flight } from "@/lib/flight";

export const BOOKING_DRAFT_KEY = "flight_booking_draft";
export const BOOKING_FORM_PROGRESS_KEY = "flight_booking_form_progress";

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
  passport_expiry?: string;
};

export type BookingFormProgress = {
  passengers: BookingPassenger[];
  contactMobile: string;
  contactEmail: string;
};

export type BookingDraft = {
  tripType: "one-way" | "round-trip" | "multi-city";
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
  /** All selected sectors when tripType is multi-city (includes outbound as [0]). */
  multiCityFlights?: Flight[];
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
  sessionStorage.removeItem(BOOKING_FORM_PROGRESS_KEY);
}

export function saveBookingFormProgress(progress: BookingFormProgress): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(BOOKING_FORM_PROGRESS_KEY, JSON.stringify(progress));
  } catch {
    /* ignore quota */
  }
}

export function loadBookingFormProgress(): BookingFormProgress | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(BOOKING_FORM_PROGRESS_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as BookingFormProgress;
  } catch {
    return null;
  }
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
    passport_expiry: "",
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

  let subtotal: number;
  if (draft.tripType === "multi-city" && draft.multiCityFlights?.length) {
    subtotal = draft.multiCityFlights.reduce((sum, f) => sum + f.price * payingPax, 0);
  } else {
    const outboundBase = draft.outbound.price * payingPax;
    const returnBase = draft.returnFlight ? draft.returnFlight.price * payingPax : 0;
    subtotal = outboundBase + returnBase;
  }

  const agentLegs =
    draft.tripType === "multi-city" && draft.multiCityFlights?.length
      ? draft.multiCityFlights.some((f) => f.is_agent_flight)
      : draft.outbound.is_agent_flight || Boolean(draft.returnFlight?.is_agent_flight);

  let tax = 0;
  if (agentLegs) {
    const cabin = (draft.cabin || "").toLowerCase();
    const isPremium = cabin.includes("business") || cabin.includes("first") || cabin.includes("premium");
    const taxRate = isPremium ? 0.12 : 0.05;
    tax = Math.round(subtotal * taxRate);
  } else {
    tax = Math.round(subtotal * 0.15);
  }

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
  flight_snapshot?: Record<string, unknown>;
};

function flightSnapshot(leg: Flight): Record<string, unknown> {
  const travelDate = leg.travel_date || new Date().toISOString().slice(0, 10);
  const departureDatetime = combineTravelDateAndTime(travelDate, leg.departureTime);
  const arrivalDatetime = combineTravelDateAndTime(
    travelDate,
    leg.arrivalTime,
    leg.departureTime
  );
  return {
    origin: leg.origin,
    destination: leg.destination,
    airline: leg.airline,
    airline_name: leg.airline,
    airline_code: leg.airline_code || leg.id.split("-")[0],
    flight_number: leg.id.split("-")[1] || leg.id || "000",
    id: leg.id,
    price: leg.price,
    basic_amount: leg.price,
    total_amount: leg.price,
    duration: leg.duration,
    travel_date: travelDate,
    departure_datetime: departureDatetime,
    arrival_datetime: arrivalDatetime,
    cabin_class: undefined,
    stops: leg.stops,
    segments: leg.segments,
    layovers: leg.layovers,
    via: leg.via,
  };
}

export async function submitFlightBooking(
  leg: Flight,
  returnLeg: Flight | undefined,
  contact: { mobile: string; email: string },
  passengers: BookingPassenger[],
  token: string | null,
  bookingSSRDetails: any[] = [],
  extras?: {
    multiCityGroupId?: string;
    itineraryFlights?: Flight[];
    travelType?: number;
    bookingRef?: string;
  }
): Promise<{ ok: true; tickets: unknown[] } | { ok: false; error: string }> {
  const apiBase = getPublicApiUrl();

  if (!leg.flight_key || !leg.search_key || !leg.fare_id) {
    return {
      ok: false,
      error: "Missing live flight keys from the airline API. Please search again and select a real fare.",
    };
  }

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

  const itineraryMeta =
    extras?.multiCityGroupId && extras.itineraryFlights?.length
      ? [
          {
            SSR_Type: "MULTI_CITY_ITINERARY",
            multi_city_group_id: extras.multiCityGroupId,
            booking_ref: extras.bookingRef,
            sectors: extras.itineraryFlights.map((f, i) => flightToSegment(f, i)),
          },
        ]
      : [];

  const body: BuyPayload & {
    booking_ssr_details?: any[];
    travel_type?: number;
    booking_ref?: string;
    multi_city_group_id?: string;
    itinerary_segments?: ReturnType<typeof flightToSegment>[];
  } = {
    search_key: leg.search_key || "",
    flight_key: leg.flight_key || "",
    fare_id: leg.fare_id || "",
    customer_mobile: contact.mobile,
    passenger_mobile: contact.mobile,
    passenger_email: contact.email,
    passengers: paxPayload,
    booking_ssr_details: [...bookingSSRDetails, ...itineraryMeta],
    flight_snapshot: flightSnapshot(leg),
  };

  if (extras?.travelType != null) body.travel_type = extras.travelType;
  if (extras?.bookingRef) body.booking_ref = extras.bookingRef;
  if (extras?.multiCityGroupId) body.multi_city_group_id = extras.multiCityGroupId;
  if (extras?.itineraryFlights?.length) {
    body.itinerary_segments = extras.itineraryFlights.map((f, i) => flightToSegment(f, i));
  }

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
        flight_snapshot: flightSnapshot(leg),
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
          flight_key: returnLeg.flight_key || "",
          fare_id: returnLeg.fare_id || "",
          customer_mobile: contact.mobile,
          passenger_mobile: contact.mobile,
          passenger_email: contact.email,
          passengers: paxPayload,
          booking_ssr_details: body.booking_ssr_details,
          travel_type: body.travel_type,
          flight_snapshot: flightSnapshot(returnLeg),
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

export function flightToSegment(leg: Flight, index: number) {
  const travelDate =
    leg.travel_date || new Date().toISOString().slice(0, 10);
  const departureDatetime = combineTravelDateAndTime(travelDate, leg.departureTime);
  const arrivalDatetime = combineTravelDateAndTime(
    travelDate,
    leg.arrivalTime,
    leg.departureTime
  );
  return {
    segment_id: index,
    leg_label: `Flight ${index + 1}`,
    origin: leg.origin,
    destination: leg.destination,
    origin_city: leg.origin,
    destination_city: leg.destination,
    departure_datetime: departureDatetime,
    arrival_datetime: arrivalDatetime,
    duration: leg.duration,
    airline_name: leg.airline,
    airline_code: leg.airline_code || leg.id.split("-")[0],
    flight_number: leg.id.split("-")[1] || leg.id || "000",
    travel_date: travelDate,
    price: leg.price,
  };
}

export function buildOfflineTicket(
  draft: BookingDraft,
  passengers: BookingPassenger[],
  leg: Flight,
  legLabel: string,
  opts?: {
    multiCityGroupId?: string;
    bookingRef?: string;
    itineraryFlights?: Flight[];
  }
) {
  const pnr = `PNR${Math.floor(100000 + Math.random() * 900000)}`;
  const travelDate =
    leg.travel_date ||
    draft.departureDate ||
    new Date().toISOString().slice(0, 10);
  const departureDatetime = combineTravelDateAndTime(travelDate, leg.departureTime);
  const arrivalDatetime = combineTravelDateAndTime(
    travelDate,
    leg.arrivalTime,
    leg.departureTime
  );

  const itinerary = opts?.itineraryFlights?.length
    ? opts.itineraryFlights.map((f, i) => flightToSegment(f, i))
    : [
        {
          segment_id: 0,
          leg_label: legLabel,
          origin: leg.origin,
          destination: leg.destination,
          origin_city: leg.origin,
          destination_city: leg.destination,
          departure_datetime: departureDatetime,
          arrival_datetime: arrivalDatetime,
          duration: leg.duration,
          airline_name: leg.airline,
          airline_code: leg.airline_code || leg.id.split("-")[0],
          flight_number: leg.id.split("-")[1] || leg.id || "000",
          travel_date: travelDate,
          price: leg.price,
        },
      ];

  const bookingRef = opts?.bookingRef || pnr;

  return {
    id: `ticket-${Math.random().toString(36).slice(2, 11)}`,
    pnr_number: pnr,
    ticket_number: `ETKT-${Math.floor(1000000 + Math.random() * 9000000)}`,
    booking_ref: bookingRef,
    multi_city_group_id: opts?.multiCityGroupId,
    status: "CONFIRMED",
    origin: leg.origin,
    destination: leg.destination,
    departure_datetime: departureDatetime,
    arrival_datetime: arrivalDatetime,
    travel_type: draft.tripType === "multi-city" ? 2 : draft.tripType === "round-trip" ? 1 : 0,
    airline_name: leg.airline,
    airline_code: leg.airline_code || leg.id.split("-")[0],
    flight_number: leg.id.split("-")[1] || leg.id || "000",
    cabin_class: draft.cabin,
    basic_amount: String(leg.price * (draft.adults + draft.children)),
    tax_amount: "0",
    total_amount: String(leg.price * (draft.adults + draft.children)),
    currency: "INR",
    food_onboard: leg.meal_available ?? leg.food_onboard ?? false,
    passengers_data: passengers.map((p) => ({
      title: p.title,
      first_name: p.first_name,
      last_name: p.last_name,
      dob: p.dob,
      outbound_meal: p.outbound_meal,
      return_meal: p.return_meal,
    })),
    segments_data: itinerary,
    ssr_data: {
      multi_city_group_id: opts?.multiCityGroupId,
      BookingSSRDetails: opts?.multiCityGroupId
        ? [
            {
              SSR_Type: "MULTI_CITY_ITINERARY",
              multi_city_group_id: opts.multiCityGroupId,
              booking_ref: bookingRef,
              sectors: itinerary,
            },
          ]
        : [],
    },
    leg_label: legLabel,
    departure_display: leg.departureTime,
    arrival_display: leg.arrivalTime,
    duration: leg.duration,
    travel_date: travelDate,
    created_at: new Date().toISOString(),
  };
}

/** Build ISO datetime from yyyy-MM-dd + "06:15 AM" / "23:30" style time. */
function combineTravelDateAndTime(
  dateIso: string,
  timeStr: string,
  depTimeForOvernight?: string
): string {
  const datePart = String(dateIso || "").slice(0, 10);
  const ymd = /^(\d{4})-(\d{2})-(\d{2})$/.exec(datePart);
  const mins = parseClockToMinutes(timeStr);
  if (!ymd || mins == null) {
    // Fall back to noon on travel date so UI never shows Invalid Date
    if (ymd) {
      return new Date(Number(ymd[1]), Number(ymd[2]) - 1, Number(ymd[3]), 12, 0, 0).toISOString();
    }
    return new Date().toISOString();
  }

  let dayOffset = 0;
  if (depTimeForOvernight) {
    const depMins = parseClockToMinutes(depTimeForOvernight);
    if (depMins != null && mins < depMins) dayOffset = 1; // arrives next calendar day
  }

  const y = Number(ymd[1]);
  const m = Number(ymd[2]) - 1;
  const d = Number(ymd[3]) + dayOffset;
  const hours = Math.floor(mins / 60);
  const minutes = mins % 60;
  return new Date(y, m, d, hours, minutes, 0).toISOString();
}

function parseClockToMinutes(raw: string): number | null {
  const s = String(raw || "").trim();
  if (!s) return null;
  const m12 = s.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (m12) {
    let h = parseInt(m12[1], 10);
    const min = parseInt(m12[2], 10);
    const period = m12[3].toUpperCase();
    if (period === "PM" && h !== 12) h += 12;
    if (period === "AM" && h === 12) h = 0;
    return h * 60 + min;
  }
  const m24 = s.match(/^(\d{1,2}):(\d{2})$/);
  if (m24) {
    return parseInt(m24[1], 10) * 60 + parseInt(m24[2], 10);
  }
  return null;
}
