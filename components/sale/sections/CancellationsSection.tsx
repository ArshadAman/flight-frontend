"use client";

import React, { useState } from "react";
import { Search, RefreshCw, AlertCircle, CheckCircle2, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface CancellationItem {
  id: string;
  pnr: string;
  passenger: string;
  route: string;
  flightDate: string;
  originalFare: number;
  penalty: number;
  refundable: number;
  requestDate: string;
  status: "Pending" | "Approved" | "Processed" | "Rejected";
  reason: string;
}

const initialCancellations: CancellationItem[] = [
  {
    id: "CAN-9011",
    pnr: "K2M9N4",
    passenger: "Rahul Roy",
    route: "CCU → DEL",
    flightDate: "2026-10-24",
    originalFare: 4999,
    penalty: 1500,
    refundable: 3499,
    requestDate: "2026-10-15 14:20",
    status: "Pending",
    reason: "Personal medical emergency",
  },
  {
    id: "CAN-9008",
    pnr: "L9P4V2",
    passenger: "Sunita Joshi",
    route: "DEL → BOM",
    flightDate: "2026-10-21",
    originalFare: 8400,
    penalty: 2500,
    refundable: 5900,
    requestDate: "2026-10-14 10:15",
    status: "Processed",
    reason: "Meeting rescheduled by client",
  },
  {
    id: "CAN-9004",
    pnr: "Z7R3Q1",
    passenger: "Karan Malhotra",
    route: "BOM → GOI",
    flightDate: "2026-10-19",
    originalFare: 5400,
    penalty: 5400,
    refundable: 0,
    requestDate: "2026-10-13 18:40",
    status: "Rejected",
    reason: "Non-refundable promo ticket cancelled within 4 hours",
  },
];

export function CancellationsSection() {
  const [items, setItems] = useState<CancellationItem[]>(initialCancellations);
  const [activeTab, setActiveTab] = useState<string>("All");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<CancellationItem | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const filtered = items.filter((item) => {
    if (activeTab !== "All" && item.status !== activeTab) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        item.pnr.toLowerCase().includes(q) ||
        item.passenger.toLowerCase().includes(q) ||
        item.route.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleProcessRefund = (action: "Approved" | "Rejected" | "Processed") => {
    if (!selected) return;
    setItems((prev) =>
      prev.map((i) => (i.id === selected.id ? { ...i, status: action } : i))
    );
    setToast(`Cancellation #${selected.id} has been marked as ${action}.`);
    setSelected(null);
    setTimeout(() => setToast(null), 3000);
  };

  return (
    <div className="space-y-5">
      {toast && (
        <div className="rounded-lg bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-md">
          ✓ {toast}
        </div>
      )}

      <div>
        <h2 className="text-xl font-black text-[#1c304a]">Cancellations & Refunds</h2>
        <p className="text-xs text-slate-500">
          Review passenger cancellation requests, airline penalties, and process client wallet refunds.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-[10px] border border-[#e8ebef] bg-white p-4 shadow-sm">
          <p className="text-[11px] font-semibold text-slate-400">Total Refund Claims</p>
          <p className="text-xl font-black text-[#1c304a] mt-1">₹18,799</p>
          <span className="text-[10px] text-slate-400">3 claims this week</span>
        </div>
        <div className="rounded-[10px] border border-[#e8ebef] bg-white p-4 shadow-sm">
          <p className="text-[11px] font-semibold text-slate-400">Pending Review</p>
          <p className="text-xl font-black text-amber-600 mt-1">₹3,499</p>
          <span className="text-[10px] text-amber-600 font-bold">1 action required</span>
        </div>
        <div className="rounded-[10px] border border-[#e8ebef] bg-white p-4 shadow-sm">
          <p className="text-[11px] font-semibold text-slate-400">Total Deductions / Penalties</p>
          <p className="text-xl font-black text-slate-700 mt-1">₹9,400</p>
          <span className="text-[10px] text-slate-400">Retained by airlines</span>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2 text-xs font-bold">
          {["All", "Pending", "Approved", "Processed", "Rejected"].map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setActiveTab(t)}
              className={cn(
                "rounded-full px-3 py-1 transition-all",
                activeTab === t
                  ? "bg-[#D60D26] text-white shadow-sm"
                  : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
              )}
            >
              {t}
            </button>
          ))}
        </div>

        <label className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs shadow-sm">
          <Search className="h-3.5 w-3.5 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search PNR or Pax..."
            className="w-36 bg-transparent outline-none sm:w-48"
          />
        </label>
      </div>

      <div className="overflow-hidden rounded-[10px] border border-[#e8ebef] bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-[#e8ebef] bg-slate-50/70 font-semibold text-slate-500 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="px-4 py-3">Claim ID & PNR</th>
                <th className="px-4 py-3">Passenger</th>
                <th className="px-4 py-3">Sector</th>
                <th className="px-4 py-3">Flight Date</th>
                <th className="px-4 py-3">Original Fare</th>
                <th className="px-4 py-3">Penalty</th>
                <th className="px-4 py-3">Refundable</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-[#1c304a]">
              {filtered.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="px-4 py-3 font-semibold">
                    <span className="font-bold text-[#D60D26]">{item.pnr}</span>
                    <p className="text-[10px] text-slate-400">{item.id}</p>
                  </td>
                  <td className="px-4 py-3 font-bold">{item.passenger}</td>
                  <td className="px-4 py-3">{item.route}</td>
                  <td className="px-4 py-3 text-slate-500">{item.flightDate}</td>
                  <td className="px-4 py-3">₹{item.originalFare.toLocaleString("en-IN")}</td>
                  <td className="px-4 py-3 text-rose-600 font-semibold">
                    -₹{item.penalty.toLocaleString("en-IN")}
                  </td>
                  <td className="px-4 py-3 font-black text-emerald-700">
                    ₹{item.refundable.toLocaleString("en-IN")}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 text-[10px] font-bold",
                        item.status === "Pending" && "bg-amber-50 text-amber-700 border border-amber-200",
                        item.status === "Processed" && "bg-emerald-50 text-emerald-700 border border-emerald-200",
                        item.status === "Approved" && "bg-blue-50 text-blue-700 border border-blue-200",
                        item.status === "Rejected" && "bg-rose-50 text-rose-700 border border-rose-200"
                      )}
                    >
                      ● {item.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => setSelected(item)}
                      className="rounded border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-bold text-slate-700 hover:bg-slate-50 hover:text-[#D60D26]"
                    >
                      Review Claim
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-start justify-between border-b pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-400">Review Cancellation</span>
                <h3 className="text-lg font-black text-[#1c304a]">Claim: #{selected.id} (PNR {selected.pnr})</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="rounded-full p-1 text-slate-400 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <p><span className="text-slate-400">Passenger:</span> <strong>{selected.passenger}</strong></p>
              <p><span className="text-slate-400">Route:</span> <strong>{selected.route}</strong> ({selected.flightDate})</p>
              <p><span className="text-slate-400">Reason:</span> {selected.reason}</p>
              <div className="rounded-lg bg-slate-50 p-3 space-y-1 mt-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">Gross Fare:</span>
                  <span>₹{selected.originalFare}</span>
                </div>
                <div className="flex justify-between text-rose-600 font-semibold">
                  <span>Airline Cancellation Penalty:</span>
                  <span>-₹{selected.penalty}</span>
                </div>
                <div className="flex justify-between border-t pt-1 font-bold text-emerald-700">
                  <span>Net Refundable to Client Wallet:</span>
                  <span>₹{selected.refundable}</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 border-t pt-3">
              <button
                type="button"
                onClick={() => handleProcessRefund("Processed")}
                className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-700"
              >
                Approve & Refund
              </button>
              <button
                type="button"
                onClick={() => handleProcessRefund("Rejected")}
                className="rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-rose-700"
              >
                Reject Claim
              </button>
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
