/** Shared group-travel status sets and date helpers */

export const PAYABLE_STATUSES = ["PAYMENT_PENDING", "PARTIALLY_PAID"] as const;

export const BOOKED_STATUSES = [
  "PAID",
  "PNR_CREATED",
  "NAME_SUBMITTED",
  "TICKETED",
  "COMPLETED",
] as const;

export const AIRLINE_LABELS: Record<string, string> = {
  "air-india": "AIR INDIA",
  indigo: "INDIGO",
  vistara: "VISTARA",
  spicejet: "SPICEJET",
  gofirst: "GO FIRST",
};

export function mapAirlinePreference(slug: string): string {
  if (!slug) return "Any";
  return AIRLINE_LABELS[slug] || slug.replace(/-/g, " ").toUpperCase();
}

export function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    NEW_REQUEST: "New Request",
    NEGOTIATION: "Under Negotiation",
    FARE_QUOTED: "Fare Quoted",
    PAYMENT_PENDING: "Payment Pending",
    PARTIALLY_PAID: "Partially Paid",
    PAID: "Paid",
    PNR_CREATED: "PNR Created",
    NAME_SUBMITTED: "Names Submitted",
    TICKETED: "Ticketed",
    COMPLETED: "Completed",
  };
  return labels[status] || status.replace(/_/g, " ");
}

export function isPaidStatus(status: string): boolean {
  return status === "PAID" || status === "Paid";
}
