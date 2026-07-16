/**
 * Shared printable e-ticket used by end-user My Booking and admin API Booking.
 * Opens a clean standalone document (no sidebar/admin chrome), then print/save PDF.
 */

export type ETicketData = {
  id?: string;
  status?: string;
  pnr_number?: string | null;
  ticket_number?: string | null;
  booking_ref?: string | null;
  airline_name?: string | null;
  airline_code?: string | null;
  flight_number?: string | null;
  origin?: string | null;
  destination?: string | null;
  departure_datetime?: string | null;
  arrival_datetime?: string | null;
  basic_amount?: string | number | null;
  tax_amount?: string | number | null;
  total_amount?: string | number | null;
  currency?: string | null;
  created_at?: string | null;
  passengers_data?: Array<Record<string, unknown>> | null;
  segments_data?: Array<Record<string, unknown>> | null;
};

function bookingRef(ticket?: ETicketData | null) {
  if (!ticket) return "XYR9NF";
  if (ticket.status === "PENDING") {
    return ticket.booking_ref || (ticket.id ? String(ticket.id).slice(0, 8).toUpperCase() : "PENDING");
  }
  return ticket.pnr_number || ticket.ticket_number || ticket.booking_ref || "XYR9NF";
}

function escapeHtml(value: unknown) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
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

function formatDateTime(iso?: string | null) {
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

export function buildETicketHtml(ticket?: ETicketData | null): string {
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
          .map((p, i) => {
            const title = String(p.title || "—");
            const first = String(p.first_name || p.firstName || "—");
            const last = String(p.last_name || p.lastName || "—");
            const type = String(p.passenger_type || p.type || "Adult");
            const eticket = String(p.ticket_number || ticket?.ticket_number || pnr);
            const airlinePnr = String(p.pnr || ticket?.pnr_number || pnr);
            return `<tr>
              <td>${escapeHtml(i + 1)}</td>
              <td>${escapeHtml(title)}</td>
              <td>${escapeHtml(first)}</td>
              <td>${escapeHtml(last)}</td>
              <td>${escapeHtml(type)}</td>
              <td>${escapeHtml(eticket)}</td>
              <td>${escapeHtml(airlinePnr)}</td>
            </tr>`;
          })
          .join("")
      : `<tr><td colspan="7">No passenger data</td></tr>`;

  const segmentRows =
    segments.length > 0
      ? segments
          .map((s) => {
            return `<tr>
              <td>${escapeHtml(String(s.airline_name || s.airline_code || airline))}</td>
              <td>${escapeHtml(String(s.flight_number || flightNo))}</td>
              <td>${escapeHtml(String(s.origin || ticket?.origin || "—"))}</td>
              <td>${escapeHtml(String(s.destination || ticket?.destination || "—"))}</td>
              <td>${escapeHtml(formatDateTime(String(s.departure_datetime || ticket?.departure_datetime || "")))}</td>
              <td>${escapeHtml(formatDateTime(String(s.arrival_datetime || ticket?.arrival_datetime || "")))}</td>
            </tr>`;
          })
          .join("")
      : `<tr>
          <td>${escapeHtml(airline)}</td>
          <td>${escapeHtml(flightNo)}</td>
          <td>${escapeHtml(ticket?.origin || "—")}</td>
          <td>${escapeHtml(ticket?.destination || "—")}</td>
          <td>${escapeHtml(formatDateTime(ticket?.departure_datetime))}</td>
          <td>${escapeHtml(formatDateTime(ticket?.arrival_datetime))}</td>
        </tr>`;

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>E-Ticket ${escapeHtml(pnr)}</title>
  <style>
    body { font-family: Arial, Helvetica, sans-serif; color: #1c304a; margin: 24px; background: #fff; }
    h1 { font-size: 22px; margin: 0 0 8px; }
    h3 { font-size: 14px; margin: 0 0 8px; }
    .meta { color: #64748b; font-size: 13px; margin-bottom: 8px; }
    .badge { display: inline-block; border: 1px solid #10b981; color: #059669; padding: 4px 10px; border-radius: 6px; font-size: 12px; font-weight: 700; }
    table { width: 100%; border-collapse: collapse; margin: 12px 0 20px; font-size: 13px; }
    th, td { border: 1px solid #e2e8f0; padding: 8px; text-align: left; }
    th { background: #eef6ff; }
    .section { margin-top: 18px; }
    .note { background: #fff1f2; border: 1px solid #fecdd3; padding: 12px; border-radius: 8px; font-size: 12px; color: #64748b; }
    .toolbar { margin-bottom: 16px; display: flex; gap: 8px; }
    .toolbar button { padding: 8px 14px; border: 1px solid #cbd5e1; border-radius: 8px; background: #fff; cursor: pointer; font-weight: 700; }
    @media print {
      .toolbar { display: none !important; }
      body { margin: 12px; }
    }
  </style>
</head>
<body>
  <div class="toolbar">
    <button onclick="window.print()">Print / Save as PDF</button>
  </div>
  <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:16px;">
    <div>
      <h1>E-Ticket — My Travel Deal</h1>
      <div class="meta">${escapeHtml(airline)} · ${escapeHtml(flightNo)} · ${escapeHtml(route)}</div>
    </div>
    <div style="text-align:right;">
      <span class="badge">${escapeHtml(status)}</span>
      <div class="meta" style="margin-top:8px;">PNR: <strong>${escapeHtml(pnr)}</strong></div>
      <div class="meta">Booked: ${escapeHtml(formatDateTime(ticket?.created_at))}</div>
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
        <tr><td>Basic</td><td>${escapeHtml(formatMoney(ticket?.basic_amount, ticket?.currency || "INR"))}</td></tr>
        <tr><td>Tax</td><td>${escapeHtml(formatMoney(ticket?.tax_amount, ticket?.currency || "INR"))}</td></tr>
        <tr><td><strong>Total</strong></td><td><strong>${escapeHtml(formatMoney(ticket?.total_amount, ticket?.currency || "INR"))}</strong></td></tr>
      </tbody>
    </table>
  </div>

  <div class="note">
    <strong>Important:</strong> Please carry a valid photo ID. Check flight status 24 hours before departure.
    Carriage is subject to airline conditions of carriage.
  </div>
</body>
</html>`;
}

/** Opens a clean e-ticket window (same as end-user My Booking) and triggers print. */
export function openPrintableETicket(ticket?: ETicketData | null): boolean {
  if (typeof window === "undefined") return false;
  const html = buildETicketHtml(ticket);
  const win = window.open("", "_blank", "noopener,noreferrer,width=900,height=700");
  if (!win) {
    // Popup blocked: write into a blob URL tab instead of printing admin chrome
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const fallback = window.open(url, "_blank", "noopener,noreferrer");
    if (!fallback) {
      alert("Please allow pop-ups to download / print the e-ticket.");
      return false;
    }
    window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
    return true;
  }
  win.document.open();
  win.document.write(html);
  win.document.close();
  win.focus();
  window.setTimeout(() => {
    try {
      win.print();
    } catch {
      // user can still click Print in the opened window
    }
  }, 300);
  return true;
}
