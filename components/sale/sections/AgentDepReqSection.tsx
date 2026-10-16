"use client";

import React, { useState } from "react";
import { Search, Building2, Check, X, Clock, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";

interface SubAgentReq {
  id: string;
  agentName: string;
  agencyCode: string;
  amount: number;
  requestedAt: string;
  paymentMode: string;
  referenceNo: string;
  currentBalance: number;
  status: "Pending" | "Approved" | "Rejected";
}

const initialAgentReqs: SubAgentReq[] = [
  {
    id: "ADEP-101",
    agentName: "Ajay Travels Pvt Ltd",
    agencyCode: "AGT-901",
    amount: 50000,
    requestedAt: "Today, 11:20 AM",
    paymentMode: "IMPS",
    referenceNo: "IMPS8829104",
    currentBalance: 12400,
    status: "Pending",
  },
  {
    id: "ADEP-100",
    agentName: "Harshit Holiday Planners",
    agencyCode: "AGT-902",
    amount: 100000,
    requestedAt: "Yesterday, 04:15 PM",
    paymentMode: "NEFT",
    referenceNo: "NEFT261015091",
    currentBalance: 48900,
    status: "Approved",
  },
  {
    id: "ADEP-099",
    agentName: "Lokesh Flights & Cargo",
    agencyCode: "AGT-905",
    amount: 25000,
    requestedAt: "14 Oct 2026",
    paymentMode: "UPI",
    referenceNo: "UPI992019401",
    currentBalance: 3200,
    status: "Approved",
  },
];

export function AgentDepReqSection() {
  const [reqs, setReqs] = useState<SubAgentReq[]>(initialAgentReqs);
  const [toast, setToast] = useState<string | null>(null);

  const handleAction = (id: string, action: "Approved" | "Rejected") => {
    setReqs((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: action } : r))
    );
    setToast(`Deposit Request ${id} marked as ${action}.`);
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
        <h2 className="text-xl font-black text-[#1c304a]">Agent Deposit Requests</h2>
        <p className="text-xs text-slate-500">
          Review top-up requests received from sub-agencies and allocate wallet balances.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-[10px] border border-[#e8ebef] bg-white p-4 shadow-sm">
          <p className="text-[11px] font-semibold text-slate-400">Pending Agent Top-Ups</p>
          <p className="text-xl font-black text-amber-600 mt-1">₹50,000</p>
          <span className="text-[10px] text-amber-600 font-bold">1 pending approval</span>
        </div>
        <div className="rounded-[10px] border border-[#e8ebef] bg-white p-4 shadow-sm">
          <p className="text-[11px] font-semibold text-slate-400">Total Allocated This Month</p>
          <p className="text-xl font-black text-emerald-700 mt-1">₹1,75,000</p>
          <span className="text-[10px] text-slate-400">Sub-agent wallet credits</span>
        </div>
        <div className="rounded-[10px] border border-[#e8ebef] bg-white p-4 shadow-sm">
          <p className="text-[11px] font-semibold text-slate-400">Active Sub-Agencies</p>
          <p className="text-xl font-black text-slate-700 mt-1">8 Partners</p>
          <span className="text-[10px] text-blue-600 font-bold">Connected via B2B</span>
        </div>
      </div>

      <div className="overflow-hidden rounded-[10px] border border-[#e8ebef] bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-[#e8ebef] bg-slate-50/70 font-semibold text-slate-500 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="px-4 py-3">Req ID</th>
                <th className="px-4 py-3">Agency Name & Code</th>
                <th className="px-4 py-3">Requested Amount</th>
                <th className="px-4 py-3">Payment Mode</th>
                <th className="px-4 py-3">UTR / Ref No.</th>
                <th className="px-4 py-3">Current Balance</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-[#1c304a]">
              {reqs.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="px-4 py-3 font-mono font-bold text-slate-600">{r.id}</td>
                  <td className="px-4 py-3 font-bold">
                    <p className="text-[#1c304a]">{r.agentName}</p>
                    <p className="text-[10px] text-slate-400 font-normal">{r.agencyCode}</p>
                  </td>
                  <td className="px-4 py-3 font-black text-emerald-700 text-sm">
                    ₹{r.amount.toLocaleString("en-IN")}
                  </td>
                  <td className="px-4 py-3">
                    <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-700">
                      {r.paymentMode}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono text-[11px] text-slate-600">{r.referenceNo}</td>
                  <td className="px-4 py-3 font-semibold text-slate-600">
                    ₹{r.currentBalance.toLocaleString("en-IN")}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 text-[10px] font-bold inline-block",
                        r.status === "Approved" && "bg-emerald-50 text-emerald-700 border border-emerald-200",
                        r.status === "Pending" && "bg-amber-50 text-amber-700 border border-amber-200",
                        r.status === "Rejected" && "bg-rose-50 text-rose-700 border border-rose-200"
                      )}
                    >
                      ● {r.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {r.status === "Pending" ? (
                      <div className="flex justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => handleAction(r.id, "Approved")}
                          className="rounded bg-emerald-600 px-2.5 py-1 text-[11px] font-bold text-white hover:bg-emerald-700"
                        >
                          Approve
                        </button>
                        <button
                          type="button"
                          onClick={() => handleAction(r.id, "Rejected")}
                          className="rounded border border-slate-300 bg-white px-2 py-1 text-[11px] font-bold text-slate-700 hover:bg-slate-100"
                        >
                          Reject
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
