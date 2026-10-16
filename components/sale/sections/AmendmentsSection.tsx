"use client";

import React, { useState } from "react";
import { Search, ArrowRight, RefreshCw, CheckCircle2, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface AmendmentItem {
  id: string;
  pnr: string;
  passenger: string;
  type: "Date Change" | "Sector Change" | "Name Correction";
  oldDetails: string;
  newDetails: string;
  fareDiff: number;
  reissueFee: number;
  totalPayable: number;
  requestDate: string;
  status: "Pending" | "Approved" | "Rejected";
}

const initialAmendments: AmendmentItem[] = [
  {
    id: "AMD-101",
    pnr: "X7K9M2",
    passenger: "Amit Sharma",
    type: "Date Change",
    oldDetails: "DEL → BOM (20 Oct, 06:15)",
    newDetails: "DEL → BOM (22 Oct, 18:30)",
    fareDiff: 1200,
    reissueFee: 800,
    totalPayable: 2000,
    requestDate: "2026-10-16 09:30",
    status: "Pending",
  },
  {
    id: "AMD-102",
    pnr: "P3N8L1",
    passenger: "Sneha Reddy",
    type: "Name Correction",
    oldDetails: "Sneha Reddi",
    newDetails: "Sneha Reddy (as per Passport)",
    fareDiff: 0,
    reissueFee: 500,
    totalPayable: 500,
    requestDate: "2026-10-15 17:10",
    status: "Approved",
  },
  {
    id: "AMD-103",
    pnr: "Q5R2T9",
    passenger: "Vikram Patel",
    type: "Sector Change",
    oldDetails: "MAA → CCU",
    newDetails: "MAA → DEL",
    fareDiff: 2400,
    reissueFee: 1500,
    totalPayable: 3900,
    requestDate: "2026-10-14 11:00",
    status: "Approved",
  },
];

export function AmendmentsSection() {
  const [items, setItems] = useState<AmendmentItem[]>(initialAmendments);
  const [activeTab, setActiveTab] = useState<string>("All");
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState<string | null>(null);

  const handleUpdate = (id: string, status: "Approved" | "Rejected") => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status } : item))
    );
    setToast(`Amendment #${id} set to ${status}.`);
    setTimeout(() => setToast(null), 3000);
  };

  const filtered = items.filter((item) => {
    if (activeTab !== "All" && item.status !== activeTab) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        item.pnr.toLowerCase().includes(q) ||
        item.passenger.toLowerCase().includes(q) ||
        item.type.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-5">
      {toast && (
        <div className="rounded-lg bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-md">
          ✓ {toast}
        </div>
      )}

      <div>
        <h2 className="text-xl font-black text-[#1c304a]">Amendments & Reissue</h2>
        <p className="text-xs text-slate-500">
          Process flight date changes, route modifications, and passenger name correction requests.
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2 text-xs font-bold">
          {["All", "Pending", "Approved", "Rejected"].map((t) => (
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
            placeholder="Search PNR or amendment..."
            className="w-36 bg-transparent outline-none sm:w-48"
          />
        </label>
      </div>

      <div className="overflow-hidden rounded-[10px] border border-[#e8ebef] bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-[#e8ebef] bg-slate-50/70 font-semibold text-slate-500 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="px-4 py-3">Req ID & PNR</th>
                <th className="px-4 py-3">Passenger</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Original Flight</th>
                <th className="px-4 py-3">Requested Modification</th>
                <th className="px-4 py-3">Fare Diff + Fee</th>
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
                  <td className="px-4 py-3">
                    <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-700">
                      {item.type}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-500">{item.oldDetails}</td>
                  <td className="px-4 py-3 font-semibold text-blue-700">{item.newDetails}</td>
                  <td className="px-4 py-3 font-bold text-emerald-700">
                    ₹{item.totalPayable.toLocaleString("en-IN")}
                    <p className="text-[10px] text-slate-400 font-normal">
                      (₹{item.fareDiff} diff + ₹{item.reissueFee} fee)
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 text-[10px] font-bold",
                        item.status === "Pending" && "bg-amber-50 text-amber-700 border border-amber-200",
                        item.status === "Approved" && "bg-emerald-50 text-emerald-700 border border-emerald-200",
                        item.status === "Rejected" && "bg-rose-50 text-rose-700 border border-rose-200"
                      )}
                    >
                      ● {item.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {item.status === "Pending" ? (
                      <div className="flex justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => handleUpdate(item.id, "Approved")}
                          className="rounded bg-emerald-600 px-2 py-1 text-[11px] font-bold text-white hover:bg-emerald-700"
                        >
                          Approve
                        </button>
                        <button
                          type="button"
                          onClick={() => handleUpdate(item.id, "Rejected")}
                          className="rounded border border-slate-300 bg-white px-2 py-1 text-[11px] font-bold text-slate-700 hover:bg-slate-100"
                        >
                          Decline
                        </button>
                      </div>
                    ) : (
                      <span className="text-[11px] font-bold text-slate-400">Processed</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
