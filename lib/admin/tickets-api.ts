import { getPublicApiUrl } from "@/lib/apiConfig";
import { fetchWithAuth } from "@/lib/api";

export type ApiTicketStatus = "PENDING" | "CONFIRMED" | "FAILED" | "CANCELLED";

export type ApiTicket = {
  id: string;
  user: string;
  user_email?: string;
  user_name?: string;
  passenger_count?: number;
  is_agent_booking?: boolean;
  agent_flight_inventory: string | null;
  agent_cancellation_reason: string | null;
  pnr_number: string | null;
  ticket_number: string | null;
  booking_ref: string | null;
  flight_id: string | null;
  status: ApiTicketStatus;
  origin: string;
  destination: string;
  departure_datetime: string;
  arrival_datetime: string;
  travel_type: number;
  airline_code: string;
  airline_name: string | null;
  flight_number: string;
  cabin_class: string | null;
  basic_amount: string | number;
  tax_amount: string | number;
  total_amount: string | number;
  currency: string;
  baggage_check_in: string | null;
  baggage_hand: string | null;
  is_refundable: boolean;
  food_onboard: string | null;
  segments_data: Array<Record<string, unknown>>;
  passengers_data: Array<Record<string, unknown>>;
  ssr_data: Record<string, unknown>;
  cancellation_data: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  gds_cancelled?: boolean;
  gds_error?: string;
};

function unwrapData<T>(payload: unknown): T {
  if (!payload || typeof payload !== "object") return payload as T;
  const body = payload as Record<string, unknown>;
  if ("data" in body && body.data !== undefined) return body.data as T;
  return payload as T;
}

function getStoredAccess(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("access_token");
}

async function refreshAccessToken(): Promise<boolean> {
  if (typeof window === "undefined") return false;
  const refresh = localStorage.getItem("refresh_token");
  if (!refresh) return false;
  try {
    const res = await fetch(`${getPublicApiUrl()}/auth/refresh/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh }),
    });
    if (!res.ok) return false;
    const json = unwrapData<{ access?: string }>(await res.json());
    if (json.access) {
      localStorage.setItem("access_token", json.access);
      return true;
    }
  } catch {
    return false;
  }
  return false;
}

async function ticketsFetch(path: string, init: RequestInit = {}) {
  return fetchWithAuth(
    `${getPublicApiUrl()}${path}`,
    init,
    getStoredAccess,
    refreshAccessToken
  );
}

export async function listApiTickets(params?: {
  status?: string;
  search?: string;
  origin?: string;
  destination?: string;
  pnr?: string;
}): Promise<{ ok: true; tickets: ApiTicket[] } | { ok: false; error: string; status?: number }> {
  const qs = new URLSearchParams();
  if (params?.status && params.status !== "ALL") qs.set("status", params.status);
  if (params?.search) qs.set("search", params.search);
  if (params?.origin) qs.set("origin", params.origin);
  if (params?.destination) qs.set("destination", params.destination);
  if (params?.pnr) qs.set("pnr", params.pnr);
  const suffix = qs.toString() ? `?${qs.toString()}` : "";

  try {
    const res = await ticketsFetch(`/tickets/${suffix}`);
    if (res.status === 401) {
      return { ok: false, error: "Login required. Sign in from the main site top bar as admin.", status: 401 };
    }
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return { ok: false, error: (err as { detail?: string }).detail || `Failed to load tickets (${res.status})`, status: res.status };
    }
    const data = unwrapData<ApiTicket[] | { results: ApiTicket[] }>(await res.json());
    const tickets = Array.isArray(data) ? data : Array.isArray(data?.results) ? data.results : [];
    return { ok: true, tickets };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Network error" };
  }
}

export async function getApiTicket(
  id: string
): Promise<{ ok: true; ticket: ApiTicket } | { ok: false; error: string; status?: number }> {
  try {
    const res = await ticketsFetch(`/tickets/${id}/`);
    if (res.status === 401) {
      return { ok: false, error: "Login required.", status: 401 };
    }
    if (!res.ok) {
      return { ok: false, error: `Ticket not found (${res.status})`, status: res.status };
    }
    const ticket = unwrapData<ApiTicket>(await res.json());
    return { ok: true, ticket };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Network error" };
  }
}

export async function cancelApiTicket(
  id: string,
  opts?: { remarks?: string; cancellation_type?: 0 | 1 }
): Promise<{ ok: true; ticket: ApiTicket } | { ok: false; error: string }> {
  try {
    const res = await ticketsFetch(`/tickets/${id}/cancel/`, {
      method: "POST",
      body: JSON.stringify({
        remarks: opts?.remarks || "Cancelled by admin",
        cancellation_type: opts?.cancellation_type ?? 0,
        cancel_code: "005",
      }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return { ok: false, error: (err as { detail?: string }).detail || "Cancel failed" };
    }
    return { ok: true, ticket: unwrapData<ApiTicket>(await res.json()) };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Network error" };
  }
}

export async function fulfillAgentTicket(
  id: string,
  pnr_number: string,
  ticket_number: string
): Promise<{ ok: true; ticket: ApiTicket } | { ok: false; error: string }> {
  try {
    const res = await ticketsFetch(`/tickets/${id}/agent-fulfill/`, {
      method: "POST",
      body: JSON.stringify({ pnr_number, ticket_number }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return { ok: false, error: (err as { detail?: string }).detail || "Fulfill failed" };
    }
    return { ok: true, ticket: unwrapData<ApiTicket>(await res.json()) };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Network error" };
  }
}

export async function rejectAgentTicket(
  id: string,
  remarks?: string
): Promise<{ ok: true; ticket: ApiTicket } | { ok: false; error: string }> {
  try {
    const res = await ticketsFetch(`/tickets/${id}/agent-cancel/`, {
      method: "POST",
      body: JSON.stringify({ remarks: remarks || "Rejected by admin" }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return { ok: false, error: (err as { detail?: string }).detail || "Reject failed" };
    }
    return { ok: true, ticket: unwrapData<ApiTicket>(await res.json()) };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Network error" };
  }
}

export function formatTicketMoney(amount: string | number, currency = "INR") {
  const n = typeof amount === "string" ? Number(amount) : amount;
  if (Number.isNaN(n)) return String(amount);
  try {
    return new Intl.NumberFormat("en-IN", { style: "currency", currency, maximumFractionDigits: 0 }).format(n);
  } catch {
    return `₹${n.toLocaleString("en-IN")}`;
  }
}

export function formatTicketDate(iso: string) {
  try {
    return new Date(iso).toLocaleString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

export async function updateAdminTicketStatus(
  id: string,
  status: ApiTicketStatus,
  remarks?: string
): Promise<{ ok: true; ticket: ApiTicket } | { ok: false; error: string }> {
  try {
    const res = await ticketsFetch(`/tickets/${id}/admin-status/`, {
      method: "POST",
      body: JSON.stringify({
        status,
        remarks: remarks || `Status set to ${status} by admin`,
      }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return { ok: false, error: (err as { detail?: string }).detail || "Status update failed" };
    }
    return { ok: true, ticket: unwrapData<ApiTicket>(await res.json()) };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Network error" };
  }
}

export function isAdminSession(user: {
  role?: string;
  is_staff?: boolean;
  is_superuser?: boolean;
} | null): boolean {
  if (!user) return false;
  return Boolean(user.is_superuser || user.is_staff || user.role === "ADMIN");
}
