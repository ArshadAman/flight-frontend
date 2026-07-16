/** Flight change rules shared by My Booking + Admin API Booking */

export type FlightTimingTicket = {
  departure_datetime?: string | null;
  status?: string | null;
};

/** True once current time is at/after scheduled departure (boarding/travel started). */
export function hasFlightDeparted(ticket?: FlightTimingTicket | null): boolean {
  if (!ticket?.departure_datetime) return false;
  const dep = new Date(ticket.departure_datetime);
  if (Number.isNaN(dep.getTime())) return false;
  return Date.now() >= dep.getTime();
}

export function canCancelOrModifyBooking(ticket?: FlightTimingTicket | null): {
  allowed: boolean;
  reason?: string;
} {
  if (!ticket) return { allowed: false, reason: "Booking not found." };
  if (ticket.status === "CANCELLED") {
    return { allowed: false, reason: "This booking is already cancelled." };
  }
  if (hasFlightDeparted(ticket)) {
    return {
      allowed: false,
      reason: "This flight has already departed. Cancel, modification, and edits are no longer available.",
    };
  }
  return { allowed: true };
}

export function formatMoneyInr(amount: unknown) {
  const n = typeof amount === "string" ? Number(amount) : Number(amount ?? 0);
  if (Number.isNaN(n)) return "—";
  return `₹${n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
