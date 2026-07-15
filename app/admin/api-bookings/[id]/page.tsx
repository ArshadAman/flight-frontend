"use client";

import { use, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  getApiTicket,
  cancelApiTicket,
  fulfillAgentTicket,
  rejectAgentTicket,
  updateAdminTicketStatus,
  formatTicketDate,
  formatTicketMoney,
  isAdminSession,
  type ApiTicket,
  type ApiTicketStatus,
} from "@/lib/admin/tickets-api";
import { AdminBadge } from "@/components/admin/AdminBadge";
import { AdminConfirmModal } from "@/components/admin/AdminConfirmModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft } from "lucide-react";
import type { AdminStatus } from "@/lib/admin/types";

function mapStatus(s: ApiTicket["status"]): AdminStatus {
  if (s === "CONFIRMED") return "approved";
  if (s === "PENDING") return "pending";
  if (s === "CANCELLED") return "denied";
  return "closed";
}

export default function ApiBookingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { access, user, openAuthModal } = useAuth();
  const admin = isAdminSession(user);
  const [ticket, setTicket] = useState<ApiTicket | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [pnrInput, setPnrInput] = useState("");
  const [ticketNoInput, setTicketNoInput] = useState("");
  const [cancelRemarks, setCancelRemarks] = useState("Cancelled by admin from API Booking");
  const [actionMsg, setActionMsg] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const result = await getApiTicket(id);
    if (!result.ok) {
      setError(result.error);
      setTicket(null);
    } else {
      setTicket(result.ticket);
    }
    setLoading(false);
  }, [id]);

  useEffect(() => {
    if (!access) {
      setLoading(false);
      setError("Login required.");
      return;
    }
    void load();
  }, [access, load]);

  if (!loading && !ticket && error?.toLowerCase().includes("not found")) notFound();

  const handleCancel = async () => {
    if (!ticket) return;
    setBusy(true);
    const result = await cancelApiTicket(ticket.id, {
      remarks: cancelRemarks || "Cancelled by admin from API Booking",
    });
    setBusy(false);
    setCancelOpen(false);
    if (!result.ok) {
      setActionMsg(result.error);
      return;
    }
    setTicket(result.ticket);
    setActionMsg("Booking cancelled. Status is now CANCELLED.");
  };

  const handleStatus = async (status: ApiTicketStatus) => {
    if (!ticket) return;
    setBusy(true);
    const result = await updateAdminTicketStatus(ticket.id, status);
    setBusy(false);
    if (!result.ok) {
      setActionMsg(result.error);
      return;
    }
    setTicket(result.ticket);
    setActionMsg(`Status updated to ${status}.`);
  };

  const handleFulfill = async () => {
    if (!ticket || !pnrInput || !ticketNoInput) {
      setActionMsg("Enter PNR and ticket number.");
      return;
    }
    setBusy(true);
    const result = await fulfillAgentTicket(ticket.id, pnrInput, ticketNoInput);
    setBusy(false);
    if (!result.ok) {
      setActionMsg(result.error);
      return;
    }
    setTicket(result.ticket);
    setActionMsg("Booking fulfilled / confirmed.");
  };

  const handleReject = async () => {
    if (!ticket) return;
    setBusy(true);
    const result = await rejectAgentTicket(ticket.id, "Rejected by admin");
    setBusy(false);
    if (!result.ok) {
      setActionMsg(result.error);
      return;
    }
    setTicket(result.ticket);
    setActionMsg("Agent booking rejected.");
  };

  return (
    <div className="flex min-h-full flex-col">
      <div className="border-b border-[#e8ebef] bg-white px-6 py-5">
        <div className="flex flex-wrap items-center gap-3">
          <Link href="/admin/api-bookings" className="rounded p-1 text-slate-500 hover:bg-slate-100">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-[#1c304a]">
              API Booking · {ticket?.pnr_number || ticket?.booking_ref || id.slice(0, 8)}
            </h1>
            <p className="text-xs text-slate-500">
              {ticket
                ? `${ticket.origin} → ${ticket.destination} · ${ticket.flight_number} · Booked by ${ticket.user_name || ticket.user_email || "—"}`
                : "Loading…"}
            </p>
          </div>
          {ticket && <AdminBadge status={mapStatus(ticket.status)} label={ticket.status} />}
        </div>
      </div>

      <div className="flex-1 space-y-4 p-6">
        {!access && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            Sign in from the main site top bar as admin.{" "}
            <button type="button" className="font-medium underline" onClick={openAuthModal}>
              Open login
            </button>
          </div>
        )}

        {access && !admin && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            Your account is not ADMIN/staff. You can only open your own tickets, not every user-panel booking.
          </div>
        )}

        {error && <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
        {actionMsg && (
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {actionMsg}
          </div>
        )}

        {loading || !ticket ? (
          <p className="text-sm text-slate-500">Loading ticket…</p>
        ) : (
          <>
            <div className="grid gap-4 lg:grid-cols-3">
              <Section title="Flight">
                <KV label="Airline" value={`${ticket.airline_name || ""} (${ticket.airline_code})`} />
                <KV label="Flight" value={ticket.flight_number} />
                <KV label="Route" value={`${ticket.origin} → ${ticket.destination}`} />
                <KV label="Departure" value={formatTicketDate(ticket.departure_datetime)} />
                <KV label="Arrival" value={formatTicketDate(ticket.arrival_datetime)} />
                <KV label="Cabin" value={ticket.cabin_class || "—"} />
                <KV label="Refundable" value={ticket.is_refundable ? "Yes" : "No"} />
              </Section>

              <Section title="Booked by (user panel)">
                <KV label="Name" value={ticket.user_name || "—"} />
                <KV label="Email" value={ticket.user_email || "—"} />
                <KV label="User ID" value={String(ticket.user || "—")} />
                <KV label="PNR" value={ticket.pnr_number || "—"} />
                <KV label="Ticket no." value={ticket.ticket_number || "—"} />
                <KV label="Booking ref" value={ticket.booking_ref || "—"} />
                <KV label="Created" value={formatTicketDate(ticket.created_at)} />
                <KV label="Agent booking" value={ticket.is_agent_booking ? "Yes" : "No"} />
              </Section>

              <Section title="Payment">
                <KV label="Basic" value={formatTicketMoney(ticket.basic_amount, ticket.currency)} />
                <KV label="Tax" value={formatTicketMoney(ticket.tax_amount, ticket.currency)} />
                <KV label="Total" value={formatTicketMoney(ticket.total_amount, ticket.currency)} />
                <KV label="Status" value={ticket.status} />
                <KV label="Baggage check-in" value={ticket.baggage_check_in || "—"} />
                <KV label="Cabin bag" value={ticket.baggage_hand || "—"} />
              </Section>
            </div>

            <Section title="Passengers">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-[#eef6ff] text-xs text-slate-600">
                    <tr>
                      {["#", "Title", "First name", "Last name", "Gender", "DOB"].map((h) => (
                        <th key={h} className="px-3 py-2 font-medium">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {(ticket.passengers_data || []).map((p, i) => (
                      <tr key={i} className="border-t border-[#e8ebef]">
                        <td className="px-3 py-2">{i + 1}</td>
                        <td className="px-3 py-2">{String(p.title || "—")}</td>
                        <td className="px-3 py-2">{String(p.first_name || "—")}</td>
                        <td className="px-3 py-2">{String(p.last_name || "—")}</td>
                        <td className="px-3 py-2">{String(p.gender || "—")}</td>
                        <td className="px-3 py-2">{String(p.dob || "—")}</td>
                      </tr>
                    ))}
                    {!ticket.passengers_data?.length && (
                      <tr>
                        <td colSpan={6} className="px-3 py-4 text-slate-400">
                          No passenger data
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Section>

            <Section title="Segments">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-[#eef6ff] text-xs text-slate-600">
                    <tr>
                      {["Airline", "Flight", "From", "To", "Dep", "Arr", "Duration"].map((h) => (
                        <th key={h} className="px-3 py-2 font-medium">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {(ticket.segments_data || []).map((s, i) => (
                      <tr key={i} className="border-t border-[#e8ebef]">
                        <td className="px-3 py-2">{String(s.airline_name || s.airline_code || "—")}</td>
                        <td className="px-3 py-2 text-[#006aec]">{String(s.flight_number || "—")}</td>
                        <td className="px-3 py-2">{String(s.origin || "—")}</td>
                        <td className="px-3 py-2">{String(s.destination || "—")}</td>
                        <td className="px-3 py-2">{String(s.departure_datetime || "—")}</td>
                        <td className="px-3 py-2">{String(s.arrival_datetime || "—")}</td>
                        <td className="px-3 py-2">{String(s.duration || "—")}</td>
                      </tr>
                    ))}
                    {!ticket.segments_data?.length && (
                      <tr>
                        <td colSpan={7} className="px-3 py-4 text-slate-400">
                          No segment data
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Section>

            {ticket.cancellation_data && Object.keys(ticket.cancellation_data).length > 0 && (
              <Section title="Cancellation / admin history">
                <pre className="overflow-x-auto rounded bg-slate-50 p-3 text-xs text-slate-600">
                  {JSON.stringify(ticket.cancellation_data, null, 2)}
                </pre>
              </Section>
            )}

            <div className="space-y-3 border-t border-[#e8ebef] pt-4">
              {ticket.status !== "CANCELLED" && (
                <div className="flex flex-wrap items-end gap-2">
                  <div className="min-w-[240px] flex-1">
                    <label className="mb-1 block text-xs text-slate-500">Cancel remarks</label>
                    <Input value={cancelRemarks} onChange={(e) => setCancelRemarks(e.target.value)} />
                  </div>
                  <Button
                    variant="outline"
                    className="border-[#D60D26] text-[#D60D26]"
                    disabled={busy}
                    onClick={() => setCancelOpen(true)}
                  >
                    Cancel this booking
                  </Button>
                </div>
              )}

              {admin && (
                <div className="flex flex-wrap gap-2">
                  <span className="mr-2 self-center text-xs text-slate-500">Force status:</span>
                  {(["CONFIRMED", "PENDING", "FAILED", "CANCELLED"] as ApiTicketStatus[]).map((s) => (
                    <Button
                      key={s}
                      size="sm"
                      variant="outline"
                      className="border-[#e8ebef]"
                      disabled={busy || ticket.status === s}
                      onClick={() => void handleStatus(s)}
                    >
                      {s}
                    </Button>
                  ))}
                </div>
              )}

              {ticket.is_agent_booking && ticket.status === "PENDING" && (
                <div className="flex flex-wrap items-center gap-2">
                  <Input
                    placeholder="Airline PNR"
                    className="h-9 w-36"
                    value={pnrInput}
                    onChange={(e) => setPnrInput(e.target.value)}
                  />
                  <Input
                    placeholder="Ticket number"
                    className="h-9 w-40"
                    value={ticketNoInput}
                    onChange={(e) => setTicketNoInput(e.target.value)}
                  />
                  <Button className="bg-emerald-600 hover:bg-emerald-700" disabled={busy} onClick={() => void handleFulfill()}>
                    Fulfill / Confirm
                  </Button>
                  <Button variant="outline" disabled={busy} onClick={() => void handleReject()}>
                    Reject request
                  </Button>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      <AdminConfirmModal
        open={cancelOpen}
        onOpenChange={setCancelOpen}
        variant="deny"
        title="Cancel this API booking?"
        description="This cancels the ticket for the user who booked it (including user-panel bookings). Local status becomes CANCELLED even if GDS is unreachable."
        confirmLabel="Cancel booking"
        onConfirm={() => void handleCancel()}
        loading={busy}
      />
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-[#e8ebef] bg-white p-5 shadow-sm">
      <h3 className="mb-3 text-sm font-semibold text-[#1c304a]">{title}</h3>
      {children}
    </div>
  );
}

function KV({ label, value }: { label: string; value: string }) {
  return (
    <div className="mb-2 flex justify-between gap-3 text-sm">
      <span className="text-slate-400">{label}</span>
      <span className="text-right font-medium text-[#1c304a]">{value}</span>
    </div>
  );
}
