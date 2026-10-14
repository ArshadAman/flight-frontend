"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Plane } from "lucide-react";
import { B2BNavbar } from "@/components/B2BNavbar";
import { Footer } from "@/components/Footer";
import { BookingSubnav } from "@/components/b2b/BookingSubnav";
import { fetchGroupBookings, type GroupBookingRow } from "@/lib/b2b/groupBookings";

function bars(value: string) {
  const bits = (value || "PNR").split("").flatMap((char) => char.charCodeAt(0).toString(2).padStart(7, "0").split(""));
  return bits.slice(0, 70);
}

function titleFor(gender?: string) {
  if ((gender || "").toUpperCase().startsWith("F")) return "MS";
  return "MR";
}

function money(value?: string) {
  const n = Number(value || 0);
  return Number.isFinite(n) ? n.toFixed(2) : "0.00";
}

export function BookingDocuments({ mode }: { mode: "download" | "print" }) {
  const search = useSearchParams();
  const requestedId = search.get("id") || "";
  const [rows, setRows] = useState<GroupBookingRow[]>([]);
  const [activeId, setActiveId] = useState(requestedId);

  useEffect(() => {
    fetchGroupBookings().then((list) => {
      setRows(list);
      const match = list.find((row) => row.id === requestedId || row.request_id === requestedId || row.pnr_number === requestedId);
      setActiveId(match?.id || list[0]?.id || "");
    });
  }, [requestedId]);

  const active = useMemo(() => rows.find((row) => row.id === activeId), [rows, activeId]);
  const quote = active?.quotes?.find((item) => item.is_selected) || active?.quotes?.[0];
  const pax = active?.passengers?.length
    ? active.passengers
    : [{ first_name: active?.group_name || "Group", last_name: "Lead", gender: "M" }];
  const fare = money(quote?.fare_per_pax);
  const tax = money(quote?.tax_per_pax);
  const total = (Number(fare) + Number(tax)).toFixed(2);
  const confirmed = ["TICKETED", "COMPLETED", "PAID", "PNR_CREATED"].includes(active?.status || "");

  const share = async () => {
    if (!active) return;
    const text = `E-Ticket ${active.pnr_number || active.request_id} ${active.origin}-${active.destination}`;
    if (navigator.share) {
      await navigator.share({ title: "E-Ticket", text }).catch(() => undefined);
      return;
    }
    await navigator.clipboard.writeText(text);
  };

  const email = () => {
    if (!active) return;
    const body = encodeURIComponent(`E-Ticket ${active.request_id}\n${active.origin} to ${active.destination}\nPNR ${active.pnr_number || "pending"}`);
    window.location.href = `mailto:?subject=${encodeURIComponent("E-Ticket " + (active.pnr_number || active.request_id))}&body=${body}`;
  };

  return (
    <div className="min-h-screen bg-[#F7F8FA] flex flex-col">
      <div className="print:hidden">
        <B2BNavbar />
        <BookingSubnav />
      </div>
      <main className="flex-1 container mx-auto max-w-5xl px-4 py-6">
        <select
          value={activeId}
          onChange={(event) => setActiveId(event.target.value)}
          className="print:hidden mb-4 w-full rounded-xl border bg-white px-4 py-3"
        >
          {rows.length === 0 && <option value="">No group bookings yet</option>}
          {rows.map((row) => (
            <option key={row.id} value={row.id}>
              {row.request_id} · {row.origin}-{row.destination} · {row.pnr_number || row.status}
            </option>
          ))}
        </select>

        {active && (
          <article className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-4 border-b pb-5">
              <div className="flex gap-3">
                <div className="flex h-14 w-16 items-center justify-center rounded bg-slate-100 text-xs text-slate-400">Logo</div>
                <div className="text-sm">
                  <p className="font-semibold text-[#1c304a]">My Travel Deal</p>
                  <p className="text-xs text-slate-500">Agent group desk</p>
                  <p className="text-xs text-slate-500">support@mytraveldeal.com</p>
                </div>
              </div>
              <p className="text-2xl font-bold text-[#1c304a]">{mode === "print" ? "Print- Ticket" : "E - Ticket"}</p>
              <div className="text-right text-xs text-slate-500">
                <span className={`inline-block rounded-full border px-3 py-1 text-sm font-semibold ${confirmed ? "border-emerald-500 text-emerald-600" : "border-amber-400 text-amber-600"}`}>
                  {confirmed ? "Confirm" : active.status}
                </span>
                <p className="mt-2">Booking reference number: <b className="text-[#1c304a]">{active.pnr_number || active.request_id}</b></p>
                <p>Booking date: <b className="text-[#1c304a]">{(active.created_at || "").slice(0, 10) || "—"}</b></p>
              </div>
            </div>

            <h3 className="mt-5 mb-2 text-sm font-semibold">Passengers details:</h3>
            <div className="overflow-x-auto rounded-lg border">
              <table className="w-full text-left text-sm">
                <thead className="bg-[#eef6ff] text-xs text-slate-600">
                  <tr>
                    {["No.", "Title", "First Name", "Last Name", "Passenger Type", "E-Ticket Number", "Airlines PNR"].map((head) => (
                      <th key={head} className="px-3 py-2 font-medium">{head}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {pax.map((person, index) => (
                    <tr key={`${person.first_name}-${index}`} className="border-t">
                      <td className="px-3 py-2">{index + 1}</td>
                      <td className="px-3 py-2">{titleFor(person.gender)}</td>
                      <td className="px-3 py-2">{person.first_name}</td>
                      <td className="px-3 py-2">{person.last_name}</td>
                      <td className="px-3 py-2">Adult</td>
                      <td className="px-3 py-2">{person.passport_number || "—"}</td>
                      <td className="px-3 py-2">{active.pnr_number || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <h3 className="mt-5 mb-2 text-sm font-semibold">Itinerary details:</h3>
            <div className="rounded-lg border p-4">
              <div className="mb-4 flex flex-wrap gap-4 text-xs text-slate-500">
                <span>{quote?.airline || active.airline_preference || "Airline"}</span>
                <span>{quote?.flight_number || "—"}</span>
                <span>{active.departure_date}</span>
                <span>{active.origin} - {active.destination}</span>
                <span>Economy</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-lg font-bold">{active.origin}</p>
                  <p className="text-xs text-slate-500">Departure</p>
                </div>
                <div className="flex flex-1 flex-col items-center">
                  <Plane className="h-5 w-5 text-[#D60D26]" />
                  <p className="text-xs font-semibold text-[#D60D26]">{quote?.airline || "Group"} {quote?.flight_number || ""}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold">{active.destination}</p>
                  <p className="text-xs text-slate-500">{active.return_date ? `Return ${active.return_date}` : "Arrival"}</p>
                </div>
              </div>
            </div>

            <h3 className="mt-5 mb-2 text-sm font-semibold">More details</h3>
            <p className="text-sm font-bold">{pax[0]?.first_name} {pax[0]?.last_name}</p>
            <div className="mt-2 flex items-end justify-between gap-4 text-sm">
              <p>Baggage 15 Kg · Seat — · Meal Included</p>
              <div className="flex h-14 items-end gap-px" aria-hidden>
                {bars(active.pnr_number || active.request_id).map((bit, index) => (
                  <span key={index} className={bit === "1" ? "h-14 w-[2px] bg-black" : "h-8 w-[1px] bg-black"} />
                ))}
              </div>
            </div>

            <h3 className="mt-5 mb-2 text-sm font-semibold">Payments</h3>
            <table className="w-full text-left text-sm">
              <thead className="bg-[#eef6ff] text-xs">
                <tr>
                  {["No.", "Pax", "Price", "Tax", "Ticket fee", "Total Amount"].map((head) => (
                    <th key={head} className="px-3 py-2 font-medium">{head}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr className="border-t">
                  <td className="px-3 py-2">1</td>
                  <td className="px-3 py-2">{pax[0]?.first_name} {pax[0]?.last_name}</td>
                  <td className="px-3 py-2">${fare}</td>
                  <td className="px-3 py-2">${tax}</td>
                  <td className="px-3 py-2">$0.00</td>
                  <td className="px-3 py-2">${total}</td>
                </tr>
              </tbody>
            </table>
            <p className="mt-3 text-xs text-slate-600">Paid on booking: ₹{active.total_paid}. Proof: {active.has_payment_proof ? active.payment_proof_name || "uploaded" : "none"}.</p>
            <p className="mt-3 rounded bg-rose-50 p-3 text-xs text-[#D60D26]">
              Important: This is an electronic ticket. Passengers must carry a valid photo ID. Please check flight status at least 24 hours before departure.
            </p>

            <div className="print:hidden mt-6 flex flex-wrap gap-2">
              <button type="button" onClick={() => window.print()} className="rounded-full border px-4 py-2 text-sm font-bold">{mode === "print" ? "Print" : "Print E-Ticket"}</button>
              <button type="button" onClick={share} className="rounded-full border px-4 py-2 text-sm font-bold">Share E-Ticket</button>
              <button type="button" onClick={email} className="rounded-full border px-4 py-2 text-sm font-bold">Email E-Ticket</button>
              <button type="button" onClick={() => window.print()} className="rounded-full bg-[#D60D26] px-4 py-2 text-sm font-bold text-white">Generate PDF</button>
            </div>
          </article>
        )}
      </main>
      <div className="print:hidden"><Footer /></div>
    </div>
  );
}
