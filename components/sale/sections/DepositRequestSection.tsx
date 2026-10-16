"use client";

import React, { useState } from "react";
import { Plus, Building2, UploadCloud, CheckCircle2, Clock, X, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface DepositReq {
  id: string;
  amount: number;
  mode: string;
  bank: string;
  utr: string;
  date: string;
  status: "Pending" | "Approved" | "Rejected";
  remarks: string;
}

const initialReqs: DepositReq[] = [
  {
    id: "REQ-401",
    amount: 75000,
    mode: "NEFT",
    bank: "HDFC Current A/C (4910)",
    utr: "HDFCN2610167721",
    date: "2026-10-16 12:45",
    status: "Pending",
    remarks: "Advance ticketing deposit for Diwali weekend",
  },
  {
    id: "REQ-398",
    amount: 50000,
    mode: "RTGS",
    bank: "ICICI Main A/C (2094)",
    utr: "ICICR26101589124",
    date: "2026-10-15 16:30",
    status: "Approved",
    remarks: "Regular account top-up",
  },
];

export function DepositRequestSection() {
  const [requests, setRequests] = useState<DepositReq[]>(initialReqs);
  const [modalOpen, setModalOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [mode, setMode] = useState("NEFT");
  const [bank, setBank] = useState("HDFC Bank (A/C: 50200088994910)");
  const [utr, setUtr] = useState("");
  const [remarks, setRemarks] = useState("");
  const [toast, setToast] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !utr) return;
    const newReq: DepositReq = {
      id: `REQ-${Date.now().toString().slice(-3)}`,
      amount: parseFloat(amount),
      mode,
      bank,
      utr: utr.toUpperCase(),
      date: "Just now",
      status: "Pending",
      remarks: remarks || "Wallet top-up remittance",
    };
    setRequests((prev) => [newReq, ...prev]);
    setModalOpen(false);
    setAmount("");
    setUtr("");
    setRemarks("");
    setToast(`Deposit Request #${newReq.id} submitted for verification!`);
    setTimeout(() => setToast(null), 3500);
  };

  return (
    <div className="space-y-5">
      {toast && (
        <div className="rounded-lg bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-md">
          ✓ {toast}
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-[#1c304a]">Deposit Requests</h2>
          <p className="text-xs text-slate-500">
            Submit offline bank transfer receipts (NEFT / RTGS / IMPS / Cash) for wallet credit approval.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-1.5 rounded-lg bg-[#D60D26] px-3.5 py-2 text-xs font-bold text-white hover:bg-[#b00b1f] shadow-sm"
        >
          <Plus className="h-4 w-4" />
          Make Deposit Request
        </button>
      </div>

      <div className="rounded-[10px] border border-blue-100 bg-blue-50/50 p-4">
        <h4 className="text-xs font-bold uppercase tracking-wider text-[#006aec] mb-2">
          Company Bank Accounts for Deposit
        </h4>
        <div className="grid gap-3 text-xs sm:grid-cols-2">
          <div className="rounded-lg bg-white p-3 border border-blue-200">
            <p className="font-bold text-[#1c304a]">HDFC Bank - Current Account</p>
            <p className="text-slate-600">A/C Number: <span className="font-mono font-bold">50200088994910</span></p>
            <p className="text-slate-600">IFSC Code: <span className="font-mono font-bold">HDFC0000120</span> (Connaught Place, New Delhi)</p>
          </div>
          <div className="rounded-lg bg-white p-3 border border-blue-200">
            <p className="font-bold text-[#1c304a]">ICICI Bank - Current Account</p>
            <p className="text-slate-600">A/C Number: <span className="font-mono font-bold">000405012094</span></p>
            <p className="text-slate-600">IFSC Code: <span className="font-mono font-bold">ICIC0000004</span> (Nariman Point, Mumbai)</p>
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-[10px] border border-[#e8ebef] bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-[#e8ebef] bg-slate-50/70 font-semibold text-slate-500 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="px-4 py-3">Request ID</th>
                <th className="px-4 py-3">Submission Date</th>
                <th className="px-4 py-3">Deposit Amount</th>
                <th className="px-4 py-3">Payment Mode</th>
                <th className="px-4 py-3">Beneficiary Bank</th>
                <th className="px-4 py-3">UTR / Bank Ref</th>
                <th className="px-4 py-3">Remarks</th>
                <th className="px-4 py-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-[#1c304a]">
              {requests.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="px-4 py-3 font-mono font-bold text-slate-600">{r.id}</td>
                  <td className="px-4 py-3 text-slate-500 font-medium">{r.date}</td>
                  <td className="px-4 py-3 font-black text-emerald-700 text-sm">
                    ₹{r.amount.toLocaleString("en-IN")}.00
                  </td>
                  <td className="px-4 py-3">
                    <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-700">
                      {r.mode}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-semibold text-slate-700">{r.bank}</td>
                  <td className="px-4 py-3 font-mono text-[11px] text-slate-600">{r.utr}</td>
                  <td className="px-4 py-3 text-slate-500">{r.remarks}</td>
                  <td className="px-4 py-3 text-right">
                    <span
                      className={cn(
                        "rounded-full px-2.5 py-0.5 text-[10px] font-bold inline-block",
                        r.status === "Approved" && "bg-emerald-50 text-emerald-700 border border-emerald-200",
                        r.status === "Pending" && "bg-amber-50 text-amber-700 border border-amber-200",
                        r.status === "Rejected" && "bg-rose-50 text-rose-700 border border-rose-200"
                      )}
                    >
                      ● {r.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <form
            onSubmit={handleSubmit}
            className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl space-y-4"
          >
            <div className="flex items-start justify-between border-b pb-3">
              <h3 className="text-base font-black text-[#1c304a]">Submit Bank Deposit Request</h3>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="rounded-full p-1 text-slate-400 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Deposit Amount (₹)</label>
                <input
                  required
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="e.g. 50000"
                  className="w-full rounded-lg border border-slate-300 p-2.5 text-sm font-bold outline-none focus:border-[#D60D26]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Remittance Mode</label>
                <select
                  value={mode}
                  onChange={(e) => setMode(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 p-2.5 outline-none focus:border-[#D60D26]"
                >
                  <option value="NEFT">NEFT (National Electronic Funds Transfer)</option>
                  <option value="RTGS">RTGS (Real Time Gross Settlement)</option>
                  <option value="IMPS">IMPS (Immediate Payment Service)</option>
                  <option value="UPI">UPI / Virtual Account</option>
                  <option value="Cash Deposit">Bank Branch Cash Deposit</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Company Bank Account</label>
                <select
                  value={bank}
                  onChange={(e) => setBank(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 p-2.5 outline-none focus:border-[#D60D26]"
                >
                  <option value="HDFC Bank (A/C: 50200088994910)">HDFC Bank (A/C: 50200088994910)</option>
                  <option value="ICICI Bank (A/C: 000405012094)">ICICI Bank (A/C: 000405012094)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Bank UTR / Transaction Reference</label>
                <input
                  required
                  value={utr}
                  onChange={(e) => setUtr(e.target.value)}
                  placeholder="e.g. HDFCN2610167721"
                  className="w-full rounded-lg border border-slate-300 p-2.5 font-mono uppercase font-bold outline-none focus:border-[#D60D26]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Notes / Remarks</label>
                <input
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="Optional reference notes"
                  className="w-full rounded-lg border border-slate-300 p-2.5 outline-none focus:border-[#D60D26]"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-lg bg-[#D60D26] px-4 py-1.5 text-xs font-bold text-white hover:bg-[#b00b1f]"
              >
                Submit Request
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
