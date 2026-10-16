"use client";

import React, { useState } from "react";
import { Download, IndianRupee, TrendingUp, Receipt, ShieldCheck } from "lucide-react";

export function FinancialReportsSection() {
  const [year, setYear] = useState("FY 2026 - 2027");

  const downloadReport = () => {
    const csv =
      "Month,GrossTurnover,AirlineCost,GrossProfit,CommissionEarned,TDSDeducted,NetPayout\n" +
      "October 2026,6945000,6125000,820000,345000,17250,327750\n" +
      "September 2026,5820000,5140000,680000,290000,14500,275500\n" +
      "August 2026,6100000,5390000,710000,305000,15250,289750\n" +
      "July 2026,5400000,4780000,620000,270000,13500,256500\n";
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `financial-statement-${year.replace(/\s+/g, "").toLowerCase()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-[#1c304a]">Financial Profit & Loss Reports</h2>
          <p className="text-xs text-slate-500">
            Monthly gross margins, commission earnings, tax deductions (TDS), and commercial statements.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={year}
            onChange={(e) => setYear(e.target.value)}
            className="rounded-lg border border-[#e8ebef] bg-white px-3 py-1.5 text-xs font-bold text-slate-700 outline-none"
          >
            <option value="FY 2026 - 2027">FY 2026 - 2027</option>
            <option value="FY 2025 - 2026">FY 2025 - 2026</option>
          </select>
          <button
            type="button"
            onClick={downloadReport}
            className="flex items-center gap-1.5 rounded-lg bg-[#006aec] px-3.5 py-1.5 text-xs font-bold text-white hover:bg-[#006aec]/90 shadow-sm"
          >
            <Download className="h-3.5 w-3.5" />
            Export Statement CSV
          </button>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-4">
        <div className="rounded-[10px] border border-[#e8ebef] bg-white p-4 shadow-sm">
          <p className="text-[11px] font-semibold text-slate-400">Total Agency Gross Profit</p>
          <p className="text-xl font-black text-emerald-700 mt-1">₹8,20,000</p>
          <span className="text-[10px] text-emerald-600 font-bold">11.8% Gross Margin</span>
        </div>
        <div className="rounded-[10px] border border-[#e8ebef] bg-white p-4 shadow-sm">
          <p className="text-[11px] font-semibold text-slate-400">Commissions Earned</p>
          <p className="text-xl font-black text-[#006aec] mt-1">₹3,45,000</p>
          <span className="text-[10px] text-blue-600 font-bold">Direct carrier incentives</span>
        </div>
        <div className="rounded-[10px] border border-[#e8ebef] bg-white p-4 shadow-sm">
          <p className="text-[11px] font-semibold text-slate-400">TDS Deducted (Sec 194H)</p>
          <p className="text-xl font-black text-amber-600 mt-1">₹17,250</p>
          <span className="text-[10px] text-slate-400">5% standard rate</span>
        </div>
        <div className="rounded-[10px] border border-[#e8ebef] bg-white p-4 shadow-sm">
          <p className="text-[11px] font-semibold text-slate-400">Net Commission Payout</p>
          <p className="text-xl font-black text-[#1c304a] mt-1">₹3,27,750</p>
          <span className="text-[10px] text-emerald-600 font-bold">● Transferred to Wallet</span>
        </div>
      </div>

      <div className="overflow-hidden rounded-[10px] border border-[#e8ebef] bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-[#e8ebef] bg-slate-50/70 font-semibold text-slate-500 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="px-4 py-3">Financial Month</th>
                <th className="px-4 py-3">Gross Turnover</th>
                <th className="px-4 py-3">Net Airline Cost</th>
                <th className="px-4 py-3">Gross Margin</th>
                <th className="px-4 py-3">Commission</th>
                <th className="px-4 py-3">TDS (5%)</th>
                <th className="px-4 py-3 text-right">Net Payout</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-[#1c304a]">
              {[
                { month: "October 2026", gmv: 6945000, cost: 6125000, profit: 820000, comm: 345000, tds: 17250, net: 327750 },
                { month: "September 2026", gmv: 5820000, cost: 5140000, profit: 680000, comm: 290000, tds: 14500, net: 275500 },
                { month: "August 2026", gmv: 6100000, cost: 5390000, profit: 710000, comm: 305000, tds: 15250, net: 289750 },
                { month: "July 2026", gmv: 5400000, cost: 4780000, profit: 620000, comm: 270000, tds: 13500, net: 256500 },
              ].map((row) => (
                <tr key={row.month} className="hover:bg-slate-50/70 transition-colors">
                  <td className="px-4 py-3 font-bold text-[#1c304a]">{row.month}</td>
                  <td className="px-4 py-3 font-semibold">₹{row.gmv.toLocaleString("en-IN")}</td>
                  <td className="px-4 py-3 text-slate-600">₹{row.cost.toLocaleString("en-IN")}</td>
                  <td className="px-4 py-3 font-bold text-emerald-700">₹{row.profit.toLocaleString("en-IN")}</td>
                  <td className="px-4 py-3 font-semibold text-blue-700">₹{row.comm.toLocaleString("en-IN")}</td>
                  <td className="px-4 py-3 text-rose-600">-₹{row.tds.toLocaleString("en-IN")}</td>
                  <td className="px-4 py-3 text-right font-black text-emerald-700 text-sm">
                    ₹{row.net.toLocaleString("en-IN")}
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
