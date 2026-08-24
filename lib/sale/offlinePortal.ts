export type OfflineInventoryRow = {
  id: string;
  origin: string;
  destination: string;
  airline_code: string;
  airline_name?: string;
  flight_number: string;
  departure_datetime: string;
  arrival_datetime: string;
  price: string | number;
  seats_available: number;
  seats_held?: number;
  is_published?: boolean;
  is_refundable?: boolean;
  baggage_check_in?: string;
  baggage_hand?: string;
  duration?: string;
  cabin_class?: string;
  apis_required?: boolean;
  policies?: Record<string, string>;
  segments_data?: {
    segment_id?: number;
    origin?: string;
    origin_city?: string;
    origin_terminal?: string;
    destination?: string;
    destination_city?: string;
    destination_terminal?: string;
    departure_datetime?: string;
    arrival_datetime?: string;
    duration?: string;
    stop_over?: string | null;
    flight_number?: string;
  }[];
};

export type OfflineTicketRow = {
  id: string;
  status: string;
  origin?: string;
  destination?: string;
  flight_number?: string;
  pnr_number?: string | null;
  booking_ref?: string | null;
  created_at?: string;
  updated_at?: string;
  departure_datetime?: string;
  passengers_data?: { first_name?: string; last_name?: string }[];
  agent_flight_inventory?: string | null;
  total_amount?: string | number;
};

export type OfflineHoldRow = {
  id: string;
  inventory: string;
  status: string;
  seats: number;
};

export type FlightListStatus = "Open" | "Closed";

export function groupPnrFromId(id: string) {
  const clean = id.replace(/-/g, "").toUpperCase();
  return `UYS${clean.slice(0, 5)}`;
}

export function formatMonthGroupLabel(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

export function formatShortDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "2-digit",
  });
}

export function formatDisplayDateLong(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function formatTimeRange(start: string, end: string) {
  const startDate = new Date(start);
  const endDate = new Date(end);
  const startTime = startDate.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  const endTime = endDate.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  const plusDay = endDate.toDateString() !== startDate.toDateString() ? "(+1)" : "";
  return `${startTime} - ${endTime}${plusDay}`;
}

export function formatFareInr(amount: string | number) {
  const value = Number(amount);
  if (Number.isNaN(value)) return `INR ${amount}`;
  return `INR ${value.toFixed(2)}`;
}

/** Figma offline portal displays USD-style fares (e.g. $150.00). */
export function formatFarePortal(amount: string | number) {
  const value = Number(amount);
  if (Number.isNaN(value)) return `$${amount}`;
  return `$${value.toFixed(2)}`;
}

export function stopCount(row: OfflineInventoryRow) {
  const n = row.segments_data?.length ?? 1;
  return Math.max(0, n - 1);
}

export function flightNumberLabel(row: OfflineInventoryRow) {
  const terminal = row.segments_data?.[0]?.origin_terminal?.replace(/terminal\s*/i, "T") || "T1";
  return `${row.flight_number} / ${terminal}`;
}

export function seatStats(
  row: OfflineInventoryRow,
  bookedCount: number
) {
  const total = Number(row.seats_available) || 0;
  const held = Number(row.seats_held) || 0;
  const sold = bookedCount;
  const available = Math.max(0, total - held - sold);
  return { total, held, sold, available };
}

export function listingStatus(
  row: OfflineInventoryRow,
  bookedCount: number
): FlightListStatus {
  const { available } = seatStats(row, bookedCount);
  if (row.is_published === false) return "Closed";
  if (available <= 0) return "Closed";
  return "Open";
}

export function groupInventoryByMonth<T extends { departure_datetime: string }>(rows: T[]) {
  const map = new Map<string, T[]>();
  for (const row of rows) {
    const key = formatMonthGroupLabel(row.departure_datetime);
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(row);
  }
  return Array.from(map.entries());
}

export function unwrapApiList<T>(data: unknown): T[] {
  if (Array.isArray(data)) return data as T[];
  if (data && typeof data === "object") {
    const payload = data as Record<string, unknown>;
    for (const key of ["results", "data", "items", "inventory", "flights", "tickets"]) {
      const value = payload[key];
      if (Array.isArray(value)) return value as T[];
    }
  }
  return [];
}
