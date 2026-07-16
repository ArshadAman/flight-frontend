"use client";

import { useState } from "react";
import { Plane, Printer, FileText, Share2, FileDown, Check } from "lucide-react";
import { openPrintableETicket } from "@/lib/eticket";

function bookingRef(ticket?: any) {
  if (!ticket) return "XYR9NF";
  if (ticket.status === "PENDING") {
    return ticket.booking_ref || (ticket.id ? String(ticket.id).slice(0, 8).toUpperCase() : "PENDING");
  }
  return ticket.pnr_number || ticket.ticket_number || ticket.booking_ref || "XYR9NF";
}

async function shareBooking(ticket?: any) {
  const pnr = bookingRef(ticket);
  const url = typeof window !== "undefined" ? window.location.href : "";
  const title = `My Travel Deal booking ${pnr}`;
  const text = `Flight booking ${pnr}: ${ticket?.origin || ""} → ${ticket?.destination || ""} (${ticket?.flight_number || ""})`;

  if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
    try {
      await navigator.share({ title, text, url });
      return { ok: true as const, mode: "share" as const };
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") {
        return { ok: true as const, mode: "cancelled" as const };
      }
    }
  }

  try {
    await navigator.clipboard.writeText(url);
    return { ok: true as const, mode: "copied" as const };
  } catch {
    return { ok: false as const, mode: "failed" as const };
  }
}

export function BookingHeader({ ticket, isB2B = false }: { ticket?: any; isB2B?: boolean }) {
  const [shareMsg, setShareMsg] = useState<string | null>(null);
  const displayPnr =
    ticket?.status === "PENDING"
      ? `Booking Ref: ${ticket?.booking_ref || (ticket?.id ? ticket.id.slice(0, 8).toUpperCase() : "PENDING")}`
      : ticket?.pnr_number || "XYR9NF";

  const handleETicket = () => {
    openPrintableETicket(ticket);
  };

  const handleShare = async () => {
    const result = await shareBooking(ticket);
    if (result.mode === "copied") {
      setShareMsg("Link copied");
      window.setTimeout(() => setShareMsg(null), 2000);
    } else if (result.mode === "failed") {
      setShareMsg("Could not share");
      window.setTimeout(() => setShareMsg(null), 2000);
    }
  };

  return (
    <div className="bg-[#FFFFFF] px-6 py-4 flex flex-col md:flex-row justify-between items-start md:items-center border-b border-rose-100 gap-4">
      <div className="flex items-center gap-2">
        <Plane className="w-6 h-6 text-[#D60D26] rotate-45" strokeWidth={2.5} />
        <h2 className="text-[24px] font-[800] text-gray-800 ml-2">{displayPnr}</h2>
        <span className="text-[18px] font-[600] text-gray-500 ml-1">
          ({ticket?.travel_type === 1 ? "Round Trip" : "Outbound"})
        </span>
      </div>

      <div className="relative flex items-center gap-3">
        {isB2B && (
          <button
            type="button"
            onClick={handleETicket}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-300 rounded-md text-[15px] font-[700] text-gray-600 hover:text-[#D60D26] hover:border-red-200 transition-colors shadow-sm"
          >
            <Printer className="w-4 h-4" /> Print ticket
          </button>
        )}
        <button
          type="button"
          onClick={handleETicket}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-300 rounded-md text-[15px] font-[700] text-gray-600 hover:text-[#D60D26] hover:border-red-200 transition-colors shadow-sm"
        >
          <FileText className="w-4 h-4" /> e-Ticket
        </button>
        <button
          type="button"
          onClick={() => void handleShare()}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-300 rounded-md text-[15px] font-[700] text-[#D60D26] hover:bg-red-50 transition-colors shadow-sm"
        >
          <Share2 className="w-4 h-4" /> Share
        </button>
        {isB2B && (
          <button
            type="button"
            onClick={handleETicket}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-300 rounded-md text-[15px] font-[700] text-[#D60D26] hover:bg-red-50 transition-colors shadow-sm"
          >
            <FileDown className="w-4 h-4" /> pdf
          </button>
        )}
        {shareMsg && (
          <span className="absolute -bottom-7 right-0 flex items-center gap-1 rounded-md bg-slate-800 px-2 py-1 text-[11px] font-semibold text-white">
            <Check className="h-3 w-3" />
            {shareMsg}
          </span>
        )}
      </div>
    </div>
  );
}
