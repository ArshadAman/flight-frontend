import type { BookingDraft } from "@/lib/booking";

export const SALE_BOOK_SEAT_PATH = "/sale/book/seat";
export const SALE_BOOK_PASSENGERS_PATH = "/sale/book/passengers";
export const SALE_BOOK_PAYMENT_PATH = "/sale/book/payment";

export const OFFLINE_SEAT_SELECTION_KEY = "offline_book_seat_selection";

export type OfflineSeatSelection = {
  selectedSeats: string[];
  adults: number;
  children: number;
  infants: number;
};

export function loadOfflineSeatSelection(): OfflineSeatSelection | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(OFFLINE_SEAT_SELECTION_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as OfflineSeatSelection;
  } catch {
    return null;
  }
}

export function saveOfflineSeatSelection(selection: OfflineSeatSelection): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(OFFLINE_SEAT_SELECTION_KEY, JSON.stringify(selection));
}

export function clearOfflineSeatSelection(): void {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(OFFLINE_SEAT_SELECTION_KEY);
}

export function defaultSeatSelection(draft: BookingDraft): OfflineSeatSelection {
  return {
    selectedSeats: [],
    adults: Math.max(1, draft.adults),
    children: draft.children,
    infants: draft.infants,
  };
}

export function applySeatSelectionToDraft(
  draft: BookingDraft,
  selection: OfflineSeatSelection
): BookingDraft {
  return {
    ...draft,
    adults: selection.adults,
    children: selection.children,
    infants: selection.infants,
  };
}

/** Deterministic pseudo-random occupied seats for the seat-map preview. */
export function occupiedSeatsForFlight(flightId: string, totalSeats = 180): Set<string> {
  const cols = ["A", "B", "C", "D", "E", "F"];
  const occupied = new Set<string>();
  let seed = 0;
  for (let i = 0; i < flightId.length; i++) seed += flightId.charCodeAt(i);
  const rows = Math.min(30, Math.ceil(totalSeats / cols.length));
  const target = Math.floor(rows * cols.length * 0.42);
  for (let n = 0; occupied.size < target && n < rows * cols.length * 2; n++) {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    const row = (seed % rows) + 1;
    const col = cols[seed % cols.length];
    occupied.add(`${row}${col}`);
  }
  return occupied;
}
