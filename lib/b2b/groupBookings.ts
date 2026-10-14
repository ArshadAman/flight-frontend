import { unwrapData, unwrapList } from "@/lib/apiEnvelope";

export type GroupBookingRow = {
  id: string;
  request_id: string;
  group_name: string;
  status: string;
  origin: string;
  destination: string;
  departure_date: string;
  return_date?: string | null;
  pnr_number?: string | null;
  pax_adults: number;
  pax_children: number;
  pax_infants: number;
  total_paid: string;
  has_payment_proof?: boolean;
  payment_proof_name?: string;
  airline_preference?: string | null;
  created_at?: string;
  passengers?: Array<{
    first_name: string;
    last_name: string;
    gender?: string;
    passport_number?: string | null;
  }>;
  quotes?: Array<{
    airline?: string;
    flight_number?: string;
    departure_time?: string;
    arrival_time?: string;
    fare_per_pax?: string;
    tax_per_pax?: string;
    is_selected?: boolean;
  }>;
  service_cases?: Array<{
    id: string;
    case_id: string;
    kind: string;
    step: number;
    status: string;
    payload: Record<string, string>;
    created_at: string;
  }>;
};

function authHeaders(): Record<string, string> {
  if (typeof window === "undefined") return {};
  const token = localStorage.getItem("access_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function fetchGroupBookings(): Promise<GroupBookingRow[]> {
  const res = await fetch("/api/group-bookings/", {
    headers: { ...authHeaders(), "X-Mock-Role": "AGENT" },
    cache: "no-store",
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) return [];
  return unwrapList<GroupBookingRow>(json);
}

export async function submitServiceCase(
  bookingId: string,
  kind: "REBOOK" | "REFUND",
  payload: Record<string, string>
): Promise<{ ok: boolean; caseId?: string; detail?: string }> {
  const res = await fetch(`/api/group-bookings/${bookingId}/service-case/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
      "X-Mock-Role": "AGENT",
    },
    body: JSON.stringify({ kind, step: 6, payload }),
  });
  const json = await res.json().catch(() => ({}));
  const data = unwrapData<{ case_id?: string; detail?: string }>(json);
  if (!res.ok) {
    const detail = (data && data.detail) || (json as { detail?: string }).detail || "Could not save this request.";
    return { ok: false, detail };
  }
  return { ok: true, caseId: data?.case_id };
}
