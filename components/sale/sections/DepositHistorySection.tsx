"use client";

import React, { useEffect, useState } from "react";
import { Download, Search, CheckCircle2, Clock, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { getPublicApiUrl } from "@/lib/apiConfig";

interface DepositEntry {
  id: string;
  date: string;
  amount: number;
  mode: "NEFT" | "RTGS" | "IMPS" | "UPI" | "Payment Gateway";
  bank: string;
  utr: string;
  status: "Approved" | "Pending" | "Rejected";
}

const history: DepositEntry[] = [
  {
    id: "DEP-9012",
    date: "2026-10-15 16:30",
    amount: 50000,
    mode: "NEFT",
    bank: "HDFC Bank (A/C ...4910)",
    utr: "HDFCN26101589124",
    status: "Approved",
  },
  {
    id: "DEP-9005",
    date: "2026-10-11 11:15",
    amount: 100000,
    mode: "RTGS",
    bank: "ICICI Bank (A/C ...2094)",
    utr: "ICICR26101100918",
    status: "Approved",
  },
  {
    id: "DEP-8991",
    date: "2026-10-04 14:00",
    amount: 25000,
    mode: "UPI",
    bank: "Axis Bank Virtual VPA",
    utr: "UPI-AXS-991204192",
    status: "Approved",
  },
  {
    id: "DEP-8970",
    date: "2026-09-25 09:20",
    amount: 15000,
    mode: "IMPS",
    bank: "State Bank of India",
    utr: "SBIN991820491",
    status: "Rejected",
  },
];

export function DepositHistorySection() {
  const { access } = useAuth();
  const [items, setItems] = useState<DepositEntry[]>(history);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!access) return;
    const fetchHistory = async () => {
      try {
        const apiBase = getPublicApiUrl();
        const res = await fetch(`${apiBase}/payments/deposit-requests/`, {
          headers: { Authorization: `Bearer ${access}` },
        });
        if (res.ok) {
          const data = await res.json();
          const list = Array.isArray(data) ? data : data?.results || [];
          if (list.length > 0) {
            const mapped: DepositEntry[] = list.map((d: any) => ({
              id: d.request_id || d.id,
              date: d.created_at ? new Date(d.created_at).toLocaleString("en-IN", { dateStyle: "short", timeStyle: "short" }) : "Recently",
              amount: Number(d.amount) || 0,
              mode: (d.payment_mode as any) || "NEFT",
              bank: d.bank_name || "HDFC Bank (A/C ...4910)",
              utr: d.utr_number || "—",
              status: d.status === "APPROVED" ? "Approved" : d.status === "REJECTED" ? "Rejected" : "Pending",
            }));
            setItems(mapped);
          }
        }
      } catch {
        /* fallback */
      }
    };
    void fetchHistory();
  }, [access]);

  const filtered = items.filter(
    (i) =>
      i.id.toLowerCase().includes(search.toLowerCase()) ||
      i.utr.toLowerCase().includes(search.toLowerCase()) ||
      i.bank.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-[#1c304a]">Deposit History</h2>
          <p className="text-xs text-slate-500">
            Historical records of agency wallet top-up transactions, bank remittances, and verification status.
          </p>
        </div>
        <label className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs shadow-sm">
          <Search className="h-3.5 w-3.5 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search UTR, Bank, Ref..."
            className="w-36 bg-transparent outline-none sm:w-48"
          />
        </label>
      </div>

      <div className="overflow-hidden rounded-[10px] border border-[#e8ebef] bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-[#e8ebef] bg-slate-50/70 font-semibold text-slate-500 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="px-4 py-3">Deposit ID</th>
                <th className="px-4 py-3">Date & Time</th>
                <th className="px-4 py-3">Remitted Amount</th>
                <th className="px-4 py-3">Payment Mode</th>
                <th className="px-4 py-3">Bank Account</th>
                <th className="px-4 py-3">UTR / Ref Number</th>
                <th className="px-4 py-3 text-right">Verification Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-[#1c304a]">
              {filtered.map((d) => (
                <tr key={d.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="px-4 py-3 font-mono font-bold text-slate-600">{d.id}</td>
                  <td className="px-4 py-3 text-slate-500 font-medium">{d.date}</td>
                  <td className="px-4 py-3 font-black text-emerald-700 text-sm">
                    ₹{d.amount.toLocaleString("en-IN")}.00
                  </td>
                  <td className="px-4 py-3">
                    <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-700">
                      {d.mode}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-semibold text-slate-700">{d.bank}</td>
                  <td className="px-4 py-3 font-mono text-[11px] text-slate-600">{d.utr}</td>
                  <td className="px-4 py-3 text-right">
                    <span
                      className={cn(
                        "rounded-full px-2.5 py-0.5 text-[10px] font-bold inline-block",
                        d.status === "Approved" && "bg-emerald-50 text-emerald-700 border border-emerald-200",
                        d.status === "Pending" && "bg-amber-50 text-amber-700 border border-amber-200",
                        d.status === "Rejected" && "bg-rose-50 text-rose-700 border border-rose-200"
                      )}
                    >
                      ● {d.status}
                    </span>
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
