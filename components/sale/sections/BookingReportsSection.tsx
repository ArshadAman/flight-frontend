"use client";

import React, { useState } from "react";
import { Download, Calendar, Filter, Plane, Users, CheckCircle } from "lucide-react";
import { AdminDonutChart } from "@/components/admin/AdminCharts";

export function BookingReportsSection() {
  const [range, setRange] = useState("Last 30 Days");

  const downloadReport = () => {
    const csv =
      "Sector,Airlines,BookingsCount,RevenueINR,AverageFare,SharePercent\n" +
      "DEL → BOM,IndiGo / AI / Vistara,428,2450000,5724,34.4\n" +
      "BLR → DEL,IndiGo / Vistara,312,1890000,6057,25.1\n" +
      "BOM → GOI,Air India / IndiGo,240,1180000,4916,19.3\n" +
      "MAA → CCU,SpiceJet / IndiGo,145,780000,5379,11.6\n" +
      "Others,All Carriers,120,645000,5375,9.6\n";
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `booking-report-${range.replace(/\s+/g, "-").toLowerCase()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-[#1c304a]">Booking Reports & Analytics</h2>
          <p className="text-xs text-slate-500">
            Sector-wise volume, airline distribution, passenger load, and sales trends.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={range}
            onChange={(e) => setRange(e.target.value)}
            className="rounded-lg border border-[#e8ebef] bg-white px-3 py-1.5 text-xs font-bold text-slate-700 outline-none"
          >
            <option value="Last 7 Days">Last 7 Days</option>
            <option value="Last 30 Days">Last 30 Days</option>
            <option value="Last 90 Days">Last 90 Days</option>
            <option value="Current Financial Year">Current Financial Year</option>
          </select>
          <button
            type="button"
            onClick={downloadReport}
            className="flex items-center gap-1.5 rounded-lg bg-[#006aec] px-3.5 py-1.5 text-xs font-bold text-white hover:bg-[#006aec]/90 shadow-sm"
          >
            <Download className="h-3.5 w-3.5" />
            Export CSV
          </button>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-4">
        <div className="rounded-[10px] border border-[#e8ebef] bg-white p-4 shadow-sm">
          <p className="text-[11px] font-semibold text-slate-400">Total Bookings</p>
          <p className="text-xl font-black text-[#1c304a] mt-1">1,245</p>
          <span className="text-[10px] text-emerald-600 font-bold">↑ 18.6% vs previous period</span>
        </div>
        <div className="rounded-[10px] border border-[#e8ebef] bg-white p-4 shadow-sm">
          <p className="text-[11px] font-semibold text-slate-400">Gross Turnover (GMV)</p>
          <p className="text-xl font-black text-emerald-700 mt-1">₹69,45,000</p>
          <span className="text-[10px] text-slate-400">Total ticket values</span>
        </div>
        <div className="rounded-[10px] border border-[#e8ebef] bg-white p-4 shadow-sm">
          <p className="text-[11px] font-semibold text-slate-400">Average Ticket Price</p>
          <p className="text-xl font-black text-[#1c304a] mt-1">₹5,578</p>
          <span className="text-[10px] text-blue-600 font-bold">Domestic Economy baseline</span>
        </div>
        <div className="rounded-[10px] border border-[#e8ebef] bg-white p-4 shadow-sm">
          <p className="text-[11px] font-semibold text-slate-400">Ticket Issue Success Rate</p>
          <p className="text-xl font-black text-emerald-700 mt-1">98.4%</p>
          <span className="text-[10px] text-slate-400">Instant confirmation</span>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <div className="rounded-[10px] border border-[#e8ebef] bg-white p-4 shadow-sm">
          <h3 className="mb-3 text-xs font-bold uppercase tracking-wide text-[#1c304a]">
            Airline Carrier Distribution
          </h3>
          <AdminDonutChart
            size={150}
            centerLabel="Total Tickets"
            centerValue="1,245"
            segments={[
              { label: "IndiGo (6E)", value: 42, count: 520, color: "#006aec" },
              { label: "Air India (AI)", value: 28, count: 348, color: "#D60D26" },
              { label: "Vistara (UK)", value: 18, count: 224, color: "#9333ea" },
              { label: "SpiceJet (SG)", value: 12, count: 153, color: "#f59e0b" },
            ]}
            showCounts
          />
        </div>

        <div className="rounded-[10px] border border-[#e8ebef] bg-white p-4 shadow-sm">
          <h3 className="mb-3 text-xs font-bold uppercase tracking-wide text-[#1c304a]">
            Top Revenue Sectors
          </h3>
          <div className="space-y-3">
            {[
              { route: "DEL → BOM", flights: 428, rev: "₹24,50,000", pct: 35 },
              { route: "BLR → DEL", flights: 312, rev: "₹18,90,000", pct: 27 },
              { route: "BOM → GOI", flights: 240, rev: "₹11,80,000", pct: 17 },
              { route: "MAA → CCU", flights: 145, rev: "₹7,80,000", pct: 11 },
              { route: "Others", flights: 120, rev: "₹6,45,000", pct: 10 },
            ].map((s) => (
              <div key={s.route} className="flex items-center gap-3 text-xs">
                <div className="w-24 font-bold text-[#1c304a]">{s.route}</div>
                <div className="flex-1 h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div className="h-full rounded-full bg-[#006aec]" style={{ width: `${s.pct}%` }} />
                </div>
                <div className="w-20 text-right font-bold text-slate-700">{s.rev}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
