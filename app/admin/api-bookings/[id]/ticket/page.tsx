"use client";

import { use, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import {
  getApiTicket,
  formatTicketMoney,
  type ApiTicket,
} from "@/lib/admin/tickets-api";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Briefcase, Plane, Utensils, Armchair } from "lucide-react";

function statusLabel(status: ApiTicket["status"]) {
  if (status === "CONFIRMED") return "Confirm";
  if (status === "PENDING") return "Pending";
  if (status === "CANCELLED") return "Cancelled";
  return status;
}

function statusClass(status: ApiTicket["status"]) {
  if (status === "CONFIRMED") return "border-emerald-500 text-emerald-600";
  if (status === "PENDING") return "border-amber-500 text-amber-600";
  if (status === "CANCELLED") return "border-red-500 text-red-600";
  return "border-slate-400 text-slate-600";
}

function formatShortDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("en-GB", {
      weekday: "short",
      day: "2-digit",
      month: "short",
      year: "2-digit",
    });
  } catch {
    return iso;
  }
}

function formatTime(iso: string) {
  try {
    return new Date(iso).toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  } catch {
    return "—";
  }
}

function formatBookingDate(iso: string) {
  try {
    return new Date(iso)
      .toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
      .replace(/ /g, "/")
      .toUpperCase();
  } catch {
    return iso;
  }
}

function paxName(p: Record<string, unknown>) {
  const title = String(p.title || "").replace(/\.$/, "");
  const first = String(p.first_name || p.firstName || "").toUpperCase();
  const last = String(p.last_name || p.lastName || "").toUpperCase();
  return { title: title ? `${title}.` : "—", first: first || "—", last: last || "—" };
}

export default function ApiBookingETicketPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { access, openAuthModal } = useAuth();
  const [ticket, setTicket] = useState<ApiTicket | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

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

  const bookingRef =
    ticket?.pnr_number || ticket?.booking_ref || ticket?.ticket_number || id.slice(0, 8).toUpperCase();
  const passengers = ticket?.passengers_data || [];
  const segments =
    ticket?.segments_data?.length
      ? ticket.segments_data
      : ticket
        ? [
            {
              airline_name: ticket.airline_name,
              airline_code: ticket.airline_code,
              flight_number: ticket.flight_number,
              origin: ticket.origin,
              destination: ticket.destination,
              departure_datetime: ticket.departure_datetime,
              arrival_datetime: ticket.arrival_datetime,
              cabin_class: ticket.cabin_class,
              duration: "",
            },
          ]
        : [];

  return (
    <div className="flex min-h-full flex-col">
      <div className="border-b border-[#e8ebef] bg-white px-6 py-5 print:hidden">
        <div className="flex flex-wrap items-center gap-3">
          <Link
            href={`/admin/api-bookings/${id}`}
            className="rounded p-1 text-slate-500 hover:bg-slate-100"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-[#1c304a]">E-Ticket</h1>
            <p className="text-xs text-slate-500">
              {ticket
                ? `${ticket.origin} → ${ticket.destination} · ${bookingRef}`
                : "Loading ticket…"}
            </p>
          </div>
          {ticket && (
            <Button
              size="sm"
              variant="outline"
              className="border-[#e8ebef]"
              onClick={() => window.print()}
            >
              Print E-Ticket
            </Button>
          )}
        </div>
      </div>

      <div className="flex-1 space-y-4 p-6">
        {!access && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            Sign in as admin to view this ticket.{" "}
            <button type="button" className="font-medium underline" onClick={openAuthModal}>
              Open login
            </button>
          </div>
        )}

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {loading || !ticket ? (
          <p className="text-sm text-slate-500">{loading ? "Loading ticket…" : "Ticket not available."}</p>
        ) : (
          <>
            <div className="rounded-xl border border-[#e8ebef] bg-white p-6 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[#e8ebef] pb-5">
                <div className="flex gap-4">
                  <div className="flex h-14 w-20 items-center justify-center rounded bg-[#eef6ff] text-sm font-bold text-[#006aec]">
                    {ticket.airline_code || "—"}
                  </div>
                  <div>
                    <p className="font-semibold text-[#1c304a]">
                      {ticket.airline_name || "My Travel Deal"}
                    </p>
                    <p className="text-xs text-slate-500">
                      Booked by {ticket.user_name || ticket.user_email || "—"}
                    </p>
                    <p className="text-xs text-slate-500">{ticket.user_email || ""}</p>
                  </div>
                </div>
                <p className="text-2xl font-bold text-[#1c304a]">E - Ticket</p>
                <div className="text-right">
                  <span
                    className={`inline-block rounded border px-3 py-1 text-sm font-medium ${statusClass(ticket.status)}`}
                  >
                    {statusLabel(ticket.status)}
                  </span>
                  <p className="mt-2 text-xs text-slate-500">
                    Booking reference number:{" "}
                    <span className="font-semibold text-[#1c304a]">{bookingRef}</span>
                  </p>
                  <p className="text-xs text-slate-500">
                    Booking date:{" "}
                    <span className="font-semibold text-[#1c304a]">
                      {formatBookingDate(ticket.created_at)}
                    </span>
                  </p>
                  {ticket.ticket_number && (
                    <p className="text-xs text-slate-500">
                      Ticket no.:{" "}
                      <span className="font-semibold text-[#1c304a]">{ticket.ticket_number}</span>
                    </p>
                  )}
                </div>
              </div>

              <section className="mt-5">
                <h3 className="mb-2 text-sm font-semibold text-[#1c304a]">Passengers Details</h3>
                <div className="overflow-x-auto rounded-lg border border-[#e8ebef]">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-[#eef6ff] text-xs text-slate-600">
                      <tr>
                        {[
                          "No.",
                          "Title",
                          "First Name",
                          "Last Name",
                          "Passenger Type",
                          "E-Ticket Number",
                          "Airlines PNR",
                        ].map((h) => (
                          <th key={h} className="px-3 py-2 font-medium">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {passengers.length === 0 ? (
                        <tr className="border-t border-[#e8ebef]">
                          <td colSpan={7} className="px-3 py-4 text-slate-400">
                            No passenger data
                          </td>
                        </tr>
                      ) : (
                        passengers.map((raw, i) => {
                          const p = raw as Record<string, unknown>;
                          const name = paxName(p);
                          return (
                            <tr key={i} className="border-t border-[#e8ebef]">
                              <td className="px-3 py-2">{i + 1}</td>
                              <td className="px-3 py-2">{name.title}</td>
                              <td className="px-3 py-2">{name.first}</td>
                              <td className="px-3 py-2">{name.last}</td>
                              <td className="px-3 py-2">
                                {String(p.passenger_type || p.type || "Adult")}
                              </td>
                              <td className="px-3 py-2">
                                {String(p.ticket_number || ticket.ticket_number || "—")}
                              </td>
                              <td className="px-3 py-2">
                                {String(p.pnr || ticket.pnr_number || bookingRef)}
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </section>

              <section className="mt-5">
                <h3 className="mb-2 text-sm font-semibold text-[#1c304a]">Itinerary Details</h3>
                <div className="overflow-x-auto rounded-lg border border-[#e8ebef]">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-[#eef6ff] text-xs text-slate-600">
                      <tr>
                        {[
                          "Airline",
                          "Airline Number",
                          "Departure Date",
                          "Travel",
                          "Seat",
                          "Time",
                          "Duration",
                          "Type",
                          "Services",
                        ].map((h) => (
                          <th key={h} className="px-3 py-2 font-medium">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {segments.map((raw, i) => {
                        const s = raw as Record<string, unknown>;
                        const dep = String(s.departure_datetime || ticket.departure_datetime);
                        const arr = String(s.arrival_datetime || ticket.arrival_datetime);
                        const origin = String(s.origin || ticket.origin);
                        const dest = String(s.destination || ticket.destination);
                        const flightNo = String(s.flight_number || ticket.flight_number || "—");
                        return (
                          <tr key={i} className="border-t border-[#e8ebef]">
                            <td className="px-3 py-2">
                              {String(s.airline_name || s.airline_code || ticket.airline_name || "—")}
                            </td>
                            <td className="px-3 py-2">{flightNo}</td>
                            <td className="px-3 py-2">{formatShortDate(dep)}</td>
                            <td className="px-3 py-2">
                              {origin} → {dest}
                            </td>
                            <td className="px-3 py-2">
                              {String(s.seat || ticket.cabin_class || "Economy")}
                            </td>
                            <td className="px-3 py-2">
                              {formatTime(dep)} - {formatTime(arr)}
                            </td>
                            <td className="px-3 py-2">{String(s.duration || "—")}</td>
                            <td className="px-3 py-2">
                              {String(s.cabin_class || ticket.cabin_class || "—")}
                            </td>
                            <td className="px-3 py-2">
                              <span className="flex gap-1 text-slate-400">
                                <Armchair className="h-3.5 w-3.5" />
                                <Utensils className="h-3.5 w-3.5" />
                                <Briefcase className="h-3.5 w-3.5" />
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <div className="mt-4 flex flex-wrap items-center justify-between gap-4 rounded-lg bg-slate-50 px-6 py-4">
                  <div>
                    <p className="font-semibold text-[#1c304a]">{ticket.origin}</p>
                    <p className="mt-1 text-lg font-bold">{formatTime(ticket.departure_datetime)}</p>
                    <p className="text-xs text-slate-500">{formatShortDate(ticket.departure_datetime)}</p>
                  </div>
                  <div className="flex flex-1 flex-col items-center px-4">
                    <div className="flex w-full items-center gap-2">
                      <span className="h-px flex-1 border-t border-dashed border-slate-300" />
                      <Plane className="h-4 w-4 text-[#006aec]" />
                      <span className="h-px flex-1 border-t border-dashed border-slate-300" />
                    </div>
                    <p className="mt-1 text-xs text-slate-500">
                      {ticket.airline_name || ticket.airline_code} ({ticket.flight_number})
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-[#1c304a]">{ticket.destination}</p>
                    <p className="mt-1 text-lg font-bold">{formatTime(ticket.arrival_datetime)}</p>
                    <p className="text-xs text-slate-500">{formatShortDate(ticket.arrival_datetime)}</p>
                  </div>
                </div>
              </section>

              {passengers.map((raw, i) => {
                const p = raw as Record<string, unknown>;
                const name = paxName(p);
                return (
                  <section key={i} className="mt-5">
                    <h3 className="mb-3 text-sm font-semibold text-[#1c304a]">
                      {name.title} {name.first}/{name.last}
                    </h3>
                    <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-6">
                      <div>
                        <p className="text-xs text-slate-400">Baggage</p>
                        <p className="mt-1 font-semibold text-[#D60D26]">
                          {ticket.baggage_check_in || "—"}
                        </p>
                        {ticket.baggage_hand && (
                          <p className="text-[11px] text-slate-400">Cabin: {ticket.baggage_hand}</p>
                        )}
                      </div>
                      <div>
                        <p className="text-xs text-slate-400">Seat</p>
                        <p className="mt-1 font-semibold">{String(p.seat || "—")}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-400">Meal</p>
                        <p className="mt-1 font-semibold">{ticket.food_onboard || "—"}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-400">Refundable</p>
                        <p className="mt-1 font-semibold">{ticket.is_refundable ? "Yes" : "No"}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-400">Cabin</p>
                        <p className="mt-1 font-semibold">{ticket.cabin_class || "—"}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-400">DOB</p>
                        <p className="mt-1 font-semibold">{String(p.dob || "—")}</p>
                      </div>
                    </div>
                  </section>
                );
              })}

              <section className="mt-5">
                <h3 className="mb-2 text-sm font-semibold text-[#1c304a]">Price details :</h3>
                <div className="overflow-x-auto rounded-lg border border-[#e8ebef]">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-[#eef6ff] text-xs text-slate-600">
                      <tr>
                        {["No.", "Pax", "Basic", "Tax", "Total Amount"].map((h) => (
                          <th key={h} className="px-3 py-2 font-medium">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {(passengers.length ? passengers : [{}]).map((raw, i) => {
                        const p = raw as Record<string, unknown>;
                        const name = paxName(p);
                        const label =
                          name.first === "—" && name.last === "—"
                            ? "Passenger"
                            : `${name.last}/${name.first} ${name.title}`;
                        const paxCount = Math.max(passengers.length, 1);
                        const basic = Number(ticket.basic_amount) / paxCount;
                        const tax = Number(ticket.tax_amount) / paxCount;
                        const total = Number(ticket.total_amount) / paxCount;
                        return (
                          <tr key={i} className="border-t border-[#e8ebef]">
                            <td className="px-3 py-2">{i + 1}</td>
                            <td className="px-3 py-2">{label}</td>
                            <td className="px-3 py-2">
                              {formatTicketMoney(basic, ticket.currency)}
                            </td>
                            <td className="px-3 py-2">
                              {formatTicketMoney(tax, ticket.currency)}
                            </td>
                            <td className="px-3 py-2 font-bold">
                              {formatTicketMoney(total, ticket.currency)}
                            </td>
                          </tr>
                        );
                      })}
                      <tr className="border-t border-[#e8ebef] bg-slate-50">
                        <td colSpan={4} className="px-3 py-2 text-right font-medium">
                          Grand total
                        </td>
                        <td className="px-3 py-2 font-bold">
                          {formatTicketMoney(ticket.total_amount, ticket.currency)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </section>

              <div className="mt-5 rounded-lg border border-rose-100 bg-rose-50 px-4 py-3 text-sm">
                <p className="font-semibold text-[#D60D26]">Important:</p>
                <p className="mt-1 text-xs leading-relaxed text-slate-600">
                  Please carry a valid photo ID. Check flight status 24 hours before departure. Carriage is
                  subject to airline conditions of carriage. Travel insurance is recommended.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 print:hidden">
              <Button variant="outline" className="border-[#e8ebef] text-slate-700" onClick={() => window.print()}>
                Print E-Ticket
              </Button>
              <Button variant="outline" className="border-[#e8ebef] text-slate-700" asChild>
                <Link href={`/admin/api-bookings/${id}`}>Back to booking</Link>
              </Button>
              {ticket.status !== "CANCELLED" && (
                <Button variant="outline" className="border-[#D60D26] text-[#D60D26]" asChild>
                  <Link href={`/admin/api-bookings/${id}`}>Cancel / manage</Link>
                </Button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
