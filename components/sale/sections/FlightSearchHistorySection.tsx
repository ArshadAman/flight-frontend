"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Search, Plane, Clock, ArrowRight, User, Filter, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

interface FlightSearchItem {
  id: string; // 47522
  agentId: string; // AG-1002
  searchDate: string; // 22, Dec 2021 | 12:30 PM
  segment: string; // DEL → BKK
  travelDate: string; // 24, Dec 2021
  trip: "One-way" | "Round";
  flight: string; // AIR INDIA AI 121
  fareFound: number;
}

const mockSearchHistory: FlightSearchItem[] = [
  {
    id: "47522",
    agentId: "AG-1002",
    searchDate: "22, Dec 2021 | 12:30 PM",
    segment: "DEL → BKK",
    travelDate: "24, Dec 2021",
    trip: "One-way",
    flight: "AIR INDIA AI 121",
    fareFound: 14500,
  },
  {
    id: "23853",
    agentId: "AG-1005",
    searchDate: "22, Dec 2021 | 11:15 AM",
    segment: "DEL → BOM",
    travelDate: "28, Dec 2021",
    trip: "One-way",
    flight: "IndiGo 6E 204",
    fareFound: 5200,
  },
  {
    id: "01272",
    agentId: "AG-1002",
    searchDate: "21, Dec 2021 | 04:45 PM",
    segment: "BOM → GOI",
    travelDate: "05, Jan 2022",
    trip: "Round",
    flight: "Vistara UK 814",
    fareFound: 8400,
  },
  {
    id: "90726",
    agentId: "AG-1008",
    searchDate: "21, Dec 2021 | 02:10 PM",
    segment: "BLR → DEL",
    travelDate: "12, Jan 2022",
    trip: "One-way",
    flight: "Air India AI 502",
    fareFound: 6800,
  },
  {
    id: "90727",
    agentId: "AG-1005",
    searchDate: "20, Dec 2021 | 06:30 PM",
    segment: "MAA → CCU",
    travelDate: "15, Jan 2022",
    trip: "Round",
    flight: "SpiceJet SG 142",
    fareFound: 7100,
  },
];

export function FlightSearchHistorySection() {
  const [filter, setFilter] = useState("");
  const [tripFilter, setTripFilter] = useState<string>("All");

  const filtered = mockSearchHistory.filter((h) => {
    if (tripFilter !== "All" && h.trip !== tripFilter) return false;
    if (filter.trim()) {
      const q = filter.toLowerCase();
      return (
        h.id.toLowerCase().includes(q) ||
        h.agentId.toLowerCase().includes(q) ||
        h.segment.toLowerCase().includes(q) ||
        h.flight.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-[#1c304a]">Flight Search History</h2>
          <p className="text-xs text-slate-500">
            Recent flight queries conducted across your agency account with lowest fare cache.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs shadow-sm">
            <Search className="h-3.5 w-3.5 text-slate-400" />
            <input
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="Search Search ID, Segment..."
              className="w-36 bg-transparent outline-none sm:w-48 text-xs"
            />
          </label>
        </div>
      </div>

      {/* Filter Tabs matching Figma */}
      <div className="flex items-center justify-between border-b border-[#e8ebef] pb-3">
        <div className="flex items-center gap-2">
          {["All", "One-way", "Round"].map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setTripFilter(tab)}
              className={cn(
                "rounded-lg px-3 py-1.5 text-xs font-bold transition-all",
                tripFilter === tab
                  ? "bg-[#1c304a] text-white shadow-sm"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              )}
            >
              {tab}
            </button>
          ))}
          <span className="ml-2 text-xs font-bold text-slate-400">149 Flight Search</span>
        </div>
      </div>

      {/* Table matching Figma columns */}
      <div className="overflow-hidden rounded-[10px] border border-[#e8ebef] bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-[#e8ebef] bg-slate-50/70 font-semibold text-slate-500 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="px-4 py-3">Search ID</th>
                <th className="px-4 py-3">Agent Id</th>
                <th className="px-4 py-3">Search Date</th>
                <th className="px-4 py-3">Segment</th>
                <th className="px-4 py-3">Travel Date</th>
                <th className="px-4 py-3">Trip</th>
                <th className="px-4 py-3">Flight</th>
                <th className="px-4 py-3 text-right">Fare Cache</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-[#1c304a]">
              {filtered.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="px-4 py-3 font-mono font-bold text-[#006aec]">
                    #{item.id}
                  </td>
                  <td className="px-4 py-3 font-mono font-semibold text-slate-700">{item.agentId}</td>
                  <td className="px-4 py-3 text-slate-500">{item.searchDate}</td>
                  <td className="px-4 py-3 font-bold text-[#1c304a]">{item.segment}</td>
                  <td className="px-4 py-3 font-medium text-slate-600">{item.travelDate}</td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 text-[10px] font-bold border",
                        item.trip === "One-way"
                          ? "bg-blue-50 text-blue-700 border-blue-200"
                          : "bg-purple-50 text-purple-700 border-purple-200"
                      )}
                    >
                      {item.trip}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-semibold text-slate-800">{item.flight}</td>
                  <td className="px-4 py-3 text-right font-black text-emerald-700">
                    ₹{item.fareFound.toLocaleString("en-IN")}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/sale/flight/all?origin=${item.segment.split("→")[0]?.trim()}&destination=${item.segment.split("→")[1]?.trim()}`}
                      className="inline-flex items-center gap-1 rounded border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-bold text-slate-700 hover:bg-slate-50 hover:text-[#D60D26]"
                    >
                      Search Again
                      <ArrowRight className="h-3 w-3" />
                    </Link>
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
