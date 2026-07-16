"use client";

import { useState } from "react";
import { Plane, Printer, FileText, Share2, FileDown, Check } from "lucide-react";

function bookingRef(ticket?: any) {
  if (!ticket) return "XYR9NF";
  if (ticket.status === "PENDING") {
    return ticket.booking_ref || (ticket.id ? String(ticket.id).slice(0, 8).toUpperCase() : "PENDING");
  }
  return ticket.pnr_number || ticket.ticket_number || ticket.booking_ref || "XYR9NF";
}

function formatMoney(amount: unknown, currency = "INR") {
  const n = typeof amount === "string" ? Number(amount) : Number(amount ?? 0);
  if (Number.isNaN(n)) return String(amount ?? "—");
  try {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(n);
  } catch {
    return `₹${n.toLocaleString("en-IN")}`;
  }
}

function formatDateTime(iso?: string) {
  if (!iso) return "—";
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

function openPrintableETicket(ticket?: any) {
  const pnr = bookingRef(ticket);
  const passengers = Array.isArray(ticket?.passengers_data) ? ticket.passengers_data : [];
  const segments = Array.isArray(ticket?.segments_data) ? ticket.segments_data : [];
  const status = ticket?.status || "CONFIRMED";
  const airline = ticket?.airline_name || ticket?.airline_code || "My Travel Deal";
  const flightNo = ticket?.flight_number || "—";
  const route = `${ticket?.origin || "—"} → ${ticket?.destination || "—"}`;

  const passengerRows =
    passengers.length > 0
      ? passengers
          .map((p: Record<string, unknown>, i: number) => {
            const title = String(p.title || "—");
            const first = String(p.first_name || p.firstName || "—");
            const last = String(p.last_name || p.lastName || "—");
            const type = String(p.passenger_type || p.type || "Adult");
            const eticket = String(p.ticket_number || ticket?.ticket_number || pnr);
            const airlinePnr = String(p.pnr || ticket?.pnr_number || pnr);
            return `<tr>
              <td>${i + 1}</td>
              <td>${title}</td>
              <td>${first}</td>
              <td>${last}</td>
              <td>${type}</td>
              <td>${eticket}</td>
              <td>${airlinePnr}</td>
            </tr>`;
          })
          .join("")
      : `<tr><td colspan="7">No passenger data</td></tr>`;

  const segmentRows =
    segments.length > 0
      ? segments
          .map((s: Record<string, unknown>) => {
            return `<tr>
              <td>${String(s.airline_name || s.airline_code || airline)}</td>
              <td>${String(s.flight_number || flightNo)}</td>
              <td>${String(s.origin || ticket?.origin || "—")}</td>
              <td>${String(s.destination || ticket?.destination || "—")}</td>
              <td>${formatDateTime(String(s.departure_datetime || ticket?.departure_datetime || ""))}</td>
              <td>${formatDateTime(String(s.arrival_datetime || ticket?.arrival_datetime || ""))}</td>
            </tr>`;
          })
          .join("")
      : `<tr>
          <td>${airline}</td>
          <td>${flightNo}</td>
          <td>${ticket?.origin || "—"}</td>
          <td>${ticket?.destination || "—"}</td>
          <td>${formatDateTime(ticket?.departure_datetime)}</td>
          <td>${formatDateTime(ticket?.arrival_datetime)}</td>
        </tr>`;

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>E-Ticket ${pnr}</title>
  <style>
    body { font-family: Arial, sans-serif; color: #1c304a; margin: 24px; }
    h1 { font-size: 22px; margin: 0 0 8px; }
    .meta { color: #64748b; font-size: 13px; margin-bottom: 20px; }
    .badge { display: inline-block; border: 1px solid #10b981; color: #059669; padding: 4px 10px; border-radius: 6px; font-size: 12px; font-weight: 700; }
    table { width: 100%; border-collapse: collapse; margin: 12px 0 20px; font-size: 13px; }
    th, td { border: 1px solid #e2e8f0; padding: 8px; text-align: left; }
    th { background: #eef6ff; }
    .section { margin-top: 18px; }
    .note { background: #fff1f2; border: 1px solid #fecdd3; padding: 12px; border-radius: 8px; font-size: 12px; color: #64748b; }
    @media print { button { display: none !important; } body { margin: 12px; } }
  </style>
</head>
<body>
  <button onclick="window.print()" style="margin-bottom:16px;padding:8px 14px;border:1px solid #cbd5e1;border-radius:8px;background:#fff;cursor:pointer;font-weight:700;">Print / Save as PDF</button>
  <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:16px;">
    <div>
      <h1>E-Ticket — My Travel Deal</h1>
      <div class="meta">${airline} · ${flightNo} · ${route}</div>
    </div>
    <div style="text-align:right;">
      <span class="badge">${status}</span>
      <div class="meta" style="margin-top:8px;">PNR: <strong>${pnr}</strong></div>
      <div class="meta">Booked: ${formatDateTime(ticket?.created_at)}</div>
    </div>
  </div>

  <div class="section">
    <h3>Passengers</h3>
    <table>
      <thead>
        <tr>
          <th>No.</th><th>Title</th><th>First Name</th><th>Last Name</th><th>Type</th><th>E-Ticket</th><th>Airlines PNR</th>
        </tr>
      </thead>
      <tbody>${passengerRows}</tbody>
    </table>
  </div>

  <div class="section">
    <h3>Itinerary</h3>
    <table>
      <thead>
        <tr>
          <th>Airline</th><th>Flight</th><th>From</th><th>To</th><th>Departure</th><th>Arrival</th>
        </tr>
      </thead>
      <tbody>${segmentRows}</tbody>
    </table>
  </div>

  <div class="section">
    <h3>Fare</h3>
    <table>
      <tbody>
        <tr><td>Basic</td><td>${formatMoney(ticket?.basic_amount, ticket?.currency || "INR")}</td></tr>
        <tr><td>Tax</td><td>${formatMoney(ticket?.tax_amount, ticket?.currency || "INR")}</td></tr>
        <tr><td><strong>Total</strong></td><td><strong>${formatMoney(ticket?.total_amount, ticket?.currency || "INR")}</strong></td></tr>
      </tbody>
    </table>
  </div>

  <div class="note">
    <strong>Important:</strong> Please carry a valid photo ID. Check flight status 24 hours before departure.
    Carriage is subject to airline conditions of carriage.
  </div>
  <script>window.addEventListener('load', function(){ setTimeout(function(){ window.print(); }, 250); });</script>
</body>
</html>`;

  const win = window.open("", "_blank", "noopener,noreferrer,width=900,height=700");
  if (!win) {
    // Popup blocked — fall back to printing the current page
    window.print();
    return;
  }
  win.document.open();
  win.document.write(html);
  win.document.close();
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
      // User cancelled share sheet — not an error
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
