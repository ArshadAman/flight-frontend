"use client";

import { use, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { getApiTicket, type ApiTicket } from "@/lib/admin/tickets-api";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FileDown } from "lucide-react";
import { openPrintableETicket } from "@/lib/eticket";
import { BookingHeader } from "@/components/booking/BookingHeader";
import { BookingInfo } from "@/components/booking/BookingInfo";
import { PassengerDetails } from "@/components/booking/PassengerDetails";
import { ItineraryDetails } from "@/components/booking/ItineraryDetails";
import { PassengerMoreDetails } from "@/components/booking/PassengerMoreDetails";
import { PaymentDetails } from "@/components/booking/PaymentDetails";

/**
 * Admin e-ticket view — same layout/actions as user My Booking details
 * (e-Ticket + Share via BookingHeader).
 */
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

  return (
    <div className="flex min-h-full flex-col bg-[#f4f7fa]">
      <div className="border-b border-[#e8ebef] bg-white px-6 py-4">
        <div className="flex flex-wrap items-center gap-3">
          <Link
            href={`/admin/api-bookings/${id}`}
            className="rounded p-1 text-slate-500 hover:bg-slate-100"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-[#1c304a]">E-Ticket (same as user My Booking)</h1>
            <p className="text-xs text-slate-500">
              {ticket
                ? `${ticket.origin} → ${ticket.destination} · Booked by ${ticket.user_name || ticket.user_email || "—"}`
                : "Loading…"}
            </p>
          </div>
          {ticket && (
            <Button
              size="sm"
              className="h-9 gap-1.5 bg-[#006aec] hover:bg-[#006aec]/90"
              onClick={() => openPrintableETicket(ticket)}
            >
              <FileDown className="h-4 w-4" />
              Print / Download
            </Button>
          )}
        </div>
      </div>

      <div className="flex-1 p-6">
        {!access && (
          <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            Sign in as admin to view this ticket.{" "}
            <button type="button" className="font-medium underline" onClick={openAuthModal}>
              Open login
            </button>
          </div>
        )}

        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {loading || !ticket ? (
          <p className="text-sm text-slate-500">{loading ? "Loading ticket…" : "Ticket not available."}</p>
        ) : (
          <div className="mx-auto max-w-[1450px]">
            <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">
              <BookingHeader ticket={ticket} />
              <BookingInfo ticket={ticket} />
              <PassengerDetails ticket={ticket} />
              <ItineraryDetails ticket={ticket} />
              <PassengerMoreDetails ticket={ticket} />
              <PaymentDetails ticket={ticket} />
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <Button
                variant="outline"
                className="border-[#e8ebef] text-slate-700"
                onClick={() => openPrintableETicket(ticket)}
              >
                Print / Download E-Ticket
              </Button>
              <Button variant="outline" className="border-[#e8ebef] text-slate-700" asChild>
                <Link href={`/admin/api-bookings/${id}`}>Back to booking</Link>
              </Button>
              <Button variant="outline" className="border-[#e8ebef] text-slate-700" asChild>
                <Link href="/admin/api-bookings">All API bookings</Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
