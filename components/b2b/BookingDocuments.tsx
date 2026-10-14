"use client";

import { useEffect, useMemo, useState } from "react";
import { B2BNavbar } from "@/components/B2BNavbar";
import { Footer } from "@/components/Footer";
import { fetchGroupBookings, type GroupBookingRow } from "@/lib/b2b/groupBookings";

export function BookingDocuments({ mode }: { mode: "download" | "print" }) {
  const [rows, setRows] = useState<GroupBookingRow[]>([]);
  const [activeId, setActiveId] = useState("");

  useEffect(() => {
    fetchGroupBookings().then((list) => {
      const ticketed = list.filter((row) => row.pnr_number || ["TICKETED", "COMPLETED", "PAID", "PNR_CREATED"].includes(row.status));
      setRows(ticketed);
      if (ticketed[0]) setActiveId(ticketed[0].id);
    });
  }, []);

  const active = useMemo(() => rows.find((row) => row.id === activeId), [rows, activeId]);

  const printDoc = () => window.print();

  const shareDoc = async () => {
    if (!active) return;
    const text = `Ticket ${active.request_id} ${active.origin}-${active.destination} PNR ${active.pnr_number || "pending"}`;
    if (navigator.share) {
      await navigator.share({ title: "Ticket", text }).catch(() => undefined);
      return;
    }
    await navigator.clipboard.writeText(text);
  };

  return (
    <div className="min-h-screen bg-[#F2FBFF] flex flex-col">
      <div className="print:hidden">
        <B2BNavbar />
      </div>
      <main className="flex-1 container mx-auto px-4 sm:px-8 py-8 max-w-4xl">
        <div className="print:hidden flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
          <div>
            <h1 className="text-[28px] font-extrabold text-[#0C2342]">
              {mode === "download" ? "Ticket & invoice" : "Print / share ticket"}
            </h1>
            <p className="text-slate-500">Pulled from your group bookings.</p>
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={printDoc} className="bg-[#D60D26] text-white rounded-full px-5 py-2 font-bold">
              {mode === "download" ? "Download PDF" : "Print"}
            </button>
            {mode === "print" && (
              <button type="button" onClick={shareDoc} className="border border-slate-200 bg-white rounded-full px-5 py-2 font-bold">
                Share
              </button>
            )}
          </div>
        </div>

        <select
          value={activeId}
          onChange={(event) => setActiveId(event.target.value)}
          className="print:hidden mb-6 w-full border border-slate-200 rounded-2xl px-4 py-3 bg-white"
        >
          {rows.length === 0 && <option value="">No ticketed bookings yet</option>}
          {rows.map((row) => (
            <option key={row.id} value={row.id}>
              {row.request_id} · {row.origin}-{row.destination} · {row.pnr_number || row.status}
            </option>
          ))}
        </select>

        {active && (
          <article id="ticket-sheet" className="bg-white rounded-3xl border border-slate-200 p-8 print:border-0 print:rounded-none">
            <div className="flex justify-between items-start border-b border-slate-100 pb-4 mb-6">
              <div>
                <p className="text-xs font-bold tracking-widest text-[#D60D26]">MY TRAVEL DEAL</p>
                <h2 className="text-2xl font-extrabold text-[#0C2342]">{active.group_name}</h2>
              </div>
              <div className="text-right text-sm">
                <p className="text-slate-400">PNR</p>
                <p className="text-xl font-black">{active.pnr_number || "PENDING"}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
              <div><p className="text-slate-400">From</p><p className="font-bold text-lg">{active.origin}</p></div>
              <div><p className="text-slate-400">To</p><p className="font-bold text-lg">{active.destination}</p></div>
              <div><p className="text-slate-400">Depart</p><p className="font-bold">{active.departure_date}</p></div>
              <div><p className="text-slate-400">Return</p><p className="font-bold">{active.return_date || "—"}</p></div>
              <div><p className="text-slate-400">Request</p><p className="font-bold">{active.request_id}</p></div>
              <div><p className="text-slate-400">Status</p><p className="font-bold">{active.status}</p></div>
              <div><p className="text-slate-400">Passengers</p><p className="font-bold">{active.pax_adults + active.pax_children + active.pax_infants}</p></div>
              <div><p className="text-slate-400">Paid</p><p className="font-bold">₹{active.total_paid}</p></div>
            </div>
            <p className="mt-8 text-xs text-slate-400">
              Proof on file: {active.has_payment_proof ? active.payment_proof_name || "uploaded" : "none"}
            </p>
          </article>
        )}
      </main>
      <div className="print:hidden">
        <Footer />
      </div>
    </div>
  );
}
