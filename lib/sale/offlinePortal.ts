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
  ticket_number?: string | null;
  created_at?: string;
  updated_at?: string;
  departure_datetime?: string;
  passengers_data?: {
    title?: string;
    first_name?: string;
    last_name?: string;
    ticket_number?: string;
  }[];
  agent_flight_inventory?: string | null;
  total_amount?: string | number;
};

export type OfflineHoldRow = {
  id: string;
  inventory: string;
  status: string;
  seats: number;
  created_at?: string;
  updated_at?: string;
  expires_at?: string | null;
  inventory_route?: string;
};

export type FlightListStatus = "Open" | "Closed";

const CITY_BY_CODE: Record<string, { city: string; country: string }> = {
  DEL: { city: "New Delhi", country: "India" },
  BOM: { city: "Mumbai", country: "India" },
  MUM: { city: "Mumbai", country: "India" },
  BLR: { city: "Bangalore", country: "India" },
  MAA: { city: "Chennai", country: "India" },
  CCU: { city: "Kolkata", country: "India" },
  HYD: { city: "Hyderabad", country: "India" },
  PNQ: { city: "Pune", country: "India" },
  AMD: { city: "Ahmedabad", country: "India" },
  GOI: { city: "Goa", country: "India" },
  JAI: { city: "Jaipur", country: "India" },
  COK: { city: "Cochin", country: "India" },
  LKO: { city: "Lucknow", country: "India" },
  GAU: { city: "Guwahati", country: "India" },
  BKK: { city: "Bangkok", country: "Thailand" },
  DXB: { city: "Dubai", country: "United Arab Emirates" },
  SIN: { city: "Singapore", country: "Singapore" },
  LHR: { city: "London", country: "United Kingdom" },
  JFK: { city: "New York", country: "United States" },
};

export function cityLabelFromCode(code?: string | null, fallbackCity?: string | null) {
  const key = String(code || "").toUpperCase();
  if (fallbackCity && fallbackCity.length > 3) return fallbackCity;
  return CITY_BY_CODE[key]?.city || key || "—";
}

export function cityCountryFromCode(code?: string | null, fallbackCity?: string | null) {
  const key = String(code || "").toUpperCase();
  const known = CITY_BY_CODE[key];
  const city = (fallbackCity && fallbackCity.length > 3 ? fallbackCity : known?.city) || key || "—";
  const country = known?.country || "";
  return country ? `${key} ${city}, ${country}` : `${key} ${city}`;
}

export function formatInrPortal(amount: string | number) {
  const value = Number(amount);
  if (Number.isNaN(value)) return `₹ ${amount}`;
  return `₹ ${value.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function passengerBookingLabel(
  passengers?: { first_name?: string; last_name?: string }[] | null
) {
  const pax = passengers || [];
  if (!pax.length) return { count: 1, names: "PASSENGER" };
  const first = `${pax[0]?.first_name || ""}`.trim().toUpperCase() || "PASSENGER";
  if (pax.length === 1) return { count: 1, names: first };
  if (pax.length === 2) {
    const second = `${pax[1]?.first_name || ""}`.trim().toUpperCase() || "PAX";
    return { count: 2, names: `${first} / ${second}` };
  }
  return { count: pax.length, names: `${first}(+${pax.length - 1})` };
}

export function groupPnrFromId(id: string) {
  const clean = id.replace(/-/g, "").toUpperCase();
  return `UYS${clean.slice(0, 5)}`;
}

const MONTH_SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"] as const;
const MONTH_FULL = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const;
const WEEKDAY_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;

export function formatMonthGroupLabel(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return `${MONTH_FULL[d.getMonth()]}, ${d.getFullYear()}`;
}

/** Figma inventory list (drawer open): `Wed, 26Jul25` */
export function formatInventoryListDate(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  const yy = String(d.getFullYear()).slice(-2);
  return `${WEEKDAY_SHORT[d.getDay()]}, ${d.getDate()}${MONTH_SHORT[d.getMonth()]}${yy}`;
}

/** Figma inventory list: `Wed, 26 Jul 25` */
export function formatShortDate(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  const yy = String(d.getFullYear()).slice(-2);
  return `${WEEKDAY_SHORT[d.getDay()]}, ${d.getDate()} ${MONTH_SHORT[d.getMonth()]} ${yy}`;
}

/** Figma booking list: `26July, 25` / `13Dec, 25` (day + month, no space) */
export function formatPortalDayMonthYear(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  const yy = String(d.getFullYear()).slice(-2);
  // Exact Figma casing: July stays "July"; most others use 3-letter short form (Dec).
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "July", "Aug", "Sep", "Oct", "Nov", "Dec"] as const;
  return `${d.getDate()}${months[d.getMonth()]}, ${yy}`;
}

export function formatDisplayDateLong(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function formatTimeRange(start: string, end: string, compact = false) {
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
  if (compact) return `${startTime}-${endTime}${plusDay}`;
  return `${startTime} - ${endTime}${plusDay}`;
}

export function formatPassengerDisplayName(pax?: {
  title?: string;
  first_name?: string;
  last_name?: string;
} | null) {
  if (!pax) return "Passenger";
  const title = (pax.title || "").trim();
  const first = (pax.first_name || "").trim();
  const last = (pax.last_name || "").trim();
  const name = [first, last].filter(Boolean).join(" ");
  if (!name) return "Passenger";
  if (!title) return name;
  const normalized = /[.]$/.test(title) ? title : `${title}.`;
  return `${normalized} ${name}`;
}

/** Group tickets into Figma PNR Booking rows keyed by MTDPNR (booking_ref). */
export function groupPnrBookingRows(tickets: OfflineTicketRow[]) {
  const groups = new Map<
    string,
    {
      mtdPnr: string;
      rows: {
        key: string;
        name: string;
        airlinePnr: string;
        ticketNo: string;
        ticket: OfflineTicketRow;
      }[];
    }
  >();

  for (const ticket of tickets) {
    const mtdPnr =
      ticket.booking_ref ||
      ticket.id.replace(/-/g, "").slice(0, 6).toUpperCase();
    const airlinePnr = ticket.pnr_number || "—";
    const ticketNo = ticket.ticket_number || "—";
    const passengers = ticket.passengers_data?.length
      ? ticket.passengers_data
      : [{ first_name: "Passenger", last_name: "" }];

    if (!groups.has(mtdPnr)) {
      groups.set(mtdPnr, { mtdPnr, rows: [] });
    }
    const group = groups.get(mtdPnr)!;
    passengers.forEach((pax, idx) => {
      group.rows.push({
        key: `${ticket.id}-${idx}`,
        name: formatPassengerDisplayName(pax),
        airlinePnr,
        ticketNo: pax.ticket_number || ticketNo,
        ticket,
      });
    });
  }

  return Array.from(groups.values());
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
