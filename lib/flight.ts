export type MealOption = {
  id: string;
  name: string;
  price: number;
  description?: string;
};

export const DEFAULT_MEAL_OPTIONS: MealOption[] = [
  { id: "none", name: "No meal", price: 0, description: "Standard — no pre-order" },
  { id: "veg", name: "Vegetarian meal", price: 249, description: "VGML" },
  { id: "nonveg", name: "Non-vegetarian meal", price: 299, description: "NVML" },
  { id: "jain", name: "Jain meal", price: 249, description: "JNML" },
];

/**
 * Search API `food_onboard` codes: P = paid/pre-order, F = free/included, N/A = none.
 */
export function parseFoodOnboardFromApi(raw: unknown): {
  meal_available: boolean;
  food_onboard: boolean;
  meal_included: boolean;
} {
  if (raw === true || raw === 1) {
    return { meal_available: true, food_onboard: true, meal_included: false };
  }
  if (raw === false || raw === 0 || raw == null) {
    return { meal_available: false, food_onboard: false, meal_included: false };
  }
  const code = String(raw).trim().toUpperCase();
  if (code === "F") {
    return { meal_available: true, food_onboard: true, meal_included: true };
  }
  if (code === "P") {
    return { meal_available: true, food_onboard: true, meal_included: false };
  }
  if (code === "N/A" || code === "NA" || code === "N" || code === "NO") {
    return { meal_available: false, food_onboard: false, meal_included: false };
  }
  // Unknown provider code — treat as meals offered rather than hiding UI.
  if (code.length > 0 && code !== "FALSE") {
    return { meal_available: true, food_onboard: true, meal_included: false };
  }
  return { meal_available: false, food_onboard: false, meal_included: false };
}

export function formatBaggageLabel(raw: unknown): string {
  if (!raw) return "";
  if (typeof raw === "string") return raw;
  if (typeof raw !== "object") return String(raw);
  const b = raw as Record<string, unknown>;
  const checkIn = b.check_in ?? b.checkIn ?? b.check_in_baggage;
  const hand = b.hand ?? b.cabin ?? b.hand_baggage;
  const parts: string[] = [];
  if (checkIn) parts.push(`Check-in: ${checkIn}`);
  if (hand) parts.push(`Cabin: ${hand}`);
  return parts.join(" · ") || JSON.stringify(raw);
}

/** Parse meal list from backend fare / segment (shape varies by provider). */
export function parseMealOptionsFromApi(raw: unknown): MealOption[] {
  const none: MealOption = {
    id: "none",
    name: "No meal",
    price: 0,
    description: "No pre-order",
  };

  if (!raw) return [none];

  const list = Array.isArray(raw) ? raw : [];
  if (!list.length) return [none];

  const parsed: MealOption[] = [none];

  for (const item of list) {
    if (!item || typeof item !== "object") continue;
    const o = item as Record<string, unknown>;
    const code = String(
      o.meal_code ?? o.code ?? o.ssr_code ?? o.id ?? o.meal_type ?? ""
    ).toLowerCase();
    if (!code || code === "none") continue;

    const name = String(
      o.meal_name ?? o.name ?? o.description ?? o.label ?? code
    );
    const price = Number(
      o.price ?? o.amount ?? o.meal_price ?? o.total_amount ?? 0
    );
    const description = o.meal_description
      ? String(o.meal_description)
      : o.fare_basis
        ? String(o.fare_basis)
        : undefined;

    parsed.push({
      id: code,
      name,
      price: Number.isFinite(price) ? price : 0,
      description,
    });
  }

  return parsed.length > 1 ? parsed : [none];
}

export function mealOptionsForFlight(flight?: {
  meal_options?: MealOption[];
  meal_available?: boolean;
  food_onboard?: boolean;
}): MealOption[] {
  if (flight?.meal_options?.length) return flight.meal_options;
  if (flight?.meal_available || flight?.food_onboard) return DEFAULT_MEAL_OPTIONS;
  return [DEFAULT_MEAL_OPTIONS[0]];
}

export type Flight = {
  id: string;
  airline: string;
  airline_code?: string;
  origin: string;
  destination: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  duration_minutes?: number;
  departure_minutes?: number;
  arrival_minutes?: number;
  price: number;
  tax_amount?: number;
  base_amount?: number;
  stops: number;
  fare_type?: string;
  has_baggage?: boolean;
  baggage_label?: string;
  equipment?: string;
  cabin_class?: string;
  ticket_time_limit_hours?: number;
  meal_available?: boolean;
  food_onboard?: boolean;
  meal_options?: MealOption[];
  search_key?: string;
  flight_key?: string;
  fare_id?: string;
  travel_date?: string;
  leg?: "outbound" | "return";
  is_agent_flight?: boolean;
  agent_flight_id?: string;
};
