"use client";

import React, { useEffect, useState } from "react";
import { Download, Search, Calendar, ArrowUpRight, ArrowDownLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { getPublicApiUrl } from "@/lib/apiConfig";

interface LedgerEntry {
  id: string;
  date: string;
  particulars: string;
  ref: string;
  type: "Credit" | "Debit";
  amount: number;
  balance: number;
}

const initialLedger: LedgerEntry[] = [
  {
    id: "TXN-9092",
    date: "2026-10-16 10:15",
    particulars: "Ticket Issuance - DEL to BOM (IndiGo)",
    ref: "PNR: X7K9M2",
    type: "Debit",
    amount: 11450,
    balance: 124500,
  },
  {
    id: "TXN-9091",
    date: "2026-10-15 16:30",
    particulars: "Bank Deposit Approved (NEFT Ref: UTR881920)",
    ref: "DEP-002",
    type: "Credit",
    amount: 50000,
    balance: 135950,
  },
  {
    id: "TXN-9090",
    date: "2026-10-15 11:20",
    particulars: "Full Refund Credited - Cancelled PNR L9P4V2",
    ref: "CAN-9008",
    type: "Credit",
    amount: 5900,
    balance: 85950,
  },
  {
    id: "TXN-9089",
    date: "2026-10-14 09:40",
    particulars: "Ticket Issuance - BLR to DEL (Air India)",
    ref: "PNR: P3N8L1",
    type: "Debit",
    amount: 6200,
    balance: 80050,
  },
  {
    id: "TXN-9088",
    date: "2026-10-13 14:00",
    particulars: "Opening Balance Carried Forward",
    ref: "SYS-INIT",
    type: "Credit",
    amount: 86250,
    balance: 86250,
  },
];

export function LedgerSection() {
  const { access } = useAuth();
  const [entries, setEntries] = useState<LedgerEntry[]>(initialLedger);
  const [liveBalance, setLiveBalance] = useState<number | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!access) return;
    fetch(`${getPublicApiUrl()}/payments/wallet/`, {
      headers: { Authorization: `Bearer ${access}` },
    })
      .then((r) => r.json())
      .then((data) => {
        const bal = parseFloat(data.balance || data.wallet_balance || (data.data && data.data.balance));
        if (!isNaN(bal)) setLiveBalance(bal);
      })
      .catch(() => {});
  }, [access]);

  const filtered = entries.filter(
    (e) =>
      e.particulars.toLowerCase().includes(search.toLowerCase()) ||
      e.ref.toLowerCase().includes(search.toLowerCase()) ||
      e.id.toLowerCase().includes(search.toLowerCase())
  );

  const exportCSV = () => {
    const header = "TxnID,Date,Particulars,Reference,Type,Amount,RunningBalance\n";
    const rows = filtered
      .map(
        (e) =>
          `"${e.id}","${e.date}","${e.particulars}","${e.ref}","${e.type}",${e.amount},${e.balance}`
      )
      .join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "account-ledger-statement.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-[#1c304a]">Financial Account Ledger</h2>
          <p className="text-xs text-slate-500">
            Real-time statement of debits, credits, ticket issuances, and available wallet balance.
          </p>
        </div>
        <button
          type="button"
          onClick={exportCSV}
          className="flex items-center gap-1.5 rounded-lg border border-[#e8ebef] bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-sm"
        >
          <Download className="h-3.5 w-3.5" />
          Download Statement CSV
        </button>
      </div>

      <div className="grid gap-3 sm:grid-cols-4">
        <div className="rounded-[10px] border border-[#e8ebef] bg-white p-4 shadow-sm">
          <p className="text-[11px] font-semibold text-slate-400">Available Balance</p>
          <p className="text-xl font-black text-emerald-700 mt-1">
            {liveBalance !== null ? `₹${liveBalance.toLocaleString("en-IN")}.00` : "₹1,24,500.00"}
          </p>
          <span className="text-[10px] text-emerald-600 font-bold">● Active INR Wallet</span>
        </div>
        <div className="rounded-[10px] border border-[#e8ebef] bg-white p-4 shadow-sm">
          <p className="text-[11px] font-semibold text-slate-400">Total Credits (This Month)</p>
          <p className="text-xl font-black text-[#1c304a] mt-1">+₹55,900.00</p>
          <span className="text-[10px] text-slate-400">Bank deposits & refunds</span>
        </div>
        <div className="rounded-[10px] border border-[#e8ebef] bg-white p-4 shadow-sm">
          <p className="text-[11px] font-semibold text-slate-400">Total Debits (This Month)</p>
          <p className="text-xl font-black text-rose-600 mt-1">-₹17,650.00</p>
          <span className="text-[10px] text-slate-400">Flight ticket issuances</span>
        </div>
        <div className="rounded-[10px] border border-[#e8ebef] bg-white p-4 shadow-sm">
          <p className="text-[11px] font-semibold text-slate-400">Credit Overdraft Limit</p>
          <p className="text-xl font-black text-[#006aec] mt-1">₹5,00,000.00</p>
          <span className="text-[10px] text-blue-600 font-bold">Approved credit line</span>
        </div>
      </div>

      <div className="overflow-hidden rounded-[10px] border border-[#e8ebef] bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-[#e8ebef] bg-slate-50/70 font-semibold text-slate-500 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="px-4 py-3">Transaction Date</th>
                <th className="px-4 py-3">Description / Particulars</th>
                <th className="px-4 py-3">Reference / PNR</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3 text-right">Running Balance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-[#1c304a]">
              {filtered.map((e) => (
                <tr key={e.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="px-4 py-3 text-slate-500 font-medium">{e.date}</td>
                  <td className="px-4 py-3 font-semibold">{e.particulars}</td>
                  <td className="px-4 py-3 font-mono font-bold text-slate-600">{e.ref}</td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        "rounded px-2 py-0.5 text-[10px] font-bold",
                        e.type === "Credit" ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"
                      )}
                    >
                      {e.type === "Credit" ? "+ CREDIT" : "- DEBIT"}
                    </span>
                  </td>
                  <td
                    className={cn(
                      "px-4 py-3 font-bold",
                      e.type === "Credit" ? "text-emerald-700" : "text-rose-600"
                    )}
                  >
                    {e.type === "Credit" ? "+" : "-"}₹{e.amount.toLocaleString("en-IN")}
                  </td>
                  <td className="px-4 py-3 text-right font-black text-slate-900">
                    ₹{e.balance.toLocaleString("en-IN")}.00
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
