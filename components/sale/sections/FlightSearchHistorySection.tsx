"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Search, Plane, Clock, ArrowRight, User } from "lucide-react";

interface SearchHistoryItem {
  id: string;
  from: string;
  fromCity: string;
  to: string;
  toCity: string;
  tripType: string;
  travelDate: string;
  passengers: string;
  cabin: string;
  searchedAt: string;
  bestPrice: number;
}

const historyData: SearchHistoryItem[] = [
  {
    id: "SRCH-801",
    from: "DEL",
    fromCity: "New Delhi",
    to: "BOM",
    toCity: "Mumbai",
    tripType: "One Way",
    travelDate: "24 Oct 2026",
    passengers: "1 Adult",
    cabin: "Economy",
    searchedAt: "10 mins ago",
    bestPrice: 4999,
  },
  {
    id: "SRCH-802",
    from: "BLR",
    fromCity: "Bengaluru",
    to: "DEL",
    toCity: "New Delhi",
    tripType: "One Way",
    travelDate: "28 Oct 2026",
    passengers: "2 Adults",
    cabin: "Economy",
    searchedAt: "45 mins ago",
    bestPrice: 6299,
  },
  {
    id: "SRCH-803",
    from: "BOM",
    fromCity: "Mumbai",
    to: "GOI",
    toCity: "Goa",
    tripType: "Round Trip",
    travelDate: "1 Nov 2026 - 5 Nov 2026",
    passengers: "2 Adults, 1 Child",
    cabin: "Premium Economy",
    searchedAt: "2 hours ago",
    bestPrice: 7199,
  },
  {
    id: "SRCH-804",
    from: "MAA",
    fromCity: "Chennai",
    to: "CCU",
    toCity: "Kolkata",
    tripType: "One Way",
    travelDate: "15 Nov 2026",
    passengers: "1 Adult",
    cabin: "Economy",
    searchedAt: "Yesterday",
    bestPrice: 5100,
  },
];

export function FlightSearchHistorySection() {
  const [filter, setFilter] = useState("");

  const filtered = historyData.filter(
    (h) =>
      h.from.toLowerCase().includes(filter.toLowerCase()) ||
      h.to.toLowerCase().includes(filter.toLowerCase()) ||
      h.fromCity.toLowerCase().includes(filter.toLowerCase()) ||
      h.toCity.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-[#1c304a]">Flight Search History</h2>
          <p className="text-xs text-slate-500">
            Recent flight queries conducted across your agency account with lowest fare cache.
          </p>
        </div>
        <label className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs shadow-sm">
          <Search className="h-3.5 w-3.5 text-slate-400" />
          <input
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Search route or city..."
            className="w-36 bg-transparent outline-none sm:w-48"
          />
        </label>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {filtered.map((item) => (
          <div
            key={item.id}
            className="rounded-[10px] border border-[#e8ebef] bg-white p-4 shadow-sm hover:border-[#D60D26]/40 transition-colors flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                <span className="flex items-center gap-1 font-semibold text-slate-500">
                  <Clock className="h-3 w-3" /> {item.searchedAt}
                </span>
                <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-700">
                  {item.tripType}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#006aec]">
                  <Plane className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2 text-base font-black text-[#1c304a]">
                    <span>{item.from}</span>
                    <ArrowRight className="h-4 w-4 text-slate-400" />
                    <span>{item.to}</span>
                  </div>
                  <p className="text-xs text-slate-500">
                    {item.fromCity} → {item.toCity}
                  </p>
                </div>
              </div>

              <div className="mt-3 flex flex-wrap gap-2 text-[11px] text-slate-600">
                <span className="rounded bg-slate-50 border border-slate-100 px-2 py-1">
                  📅 {item.travelDate}
                </span>
                <span className="rounded bg-slate-50 border border-slate-100 px-2 py-1">
                  👤 {item.passengers}
                </span>
                <span className="rounded bg-slate-50 border border-slate-100 px-2 py-1">
                  💺 {item.cabin}
                </span>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between border-t pt-3">
              <div>
                <span className="text-[10px] text-slate-400 block">Lowest Fare Found</span>
                <span className="text-sm font-black text-emerald-700">
                  ₹{item.bestPrice.toLocaleString("en-IN")}
                </span>
              </div>
              <Link
                href="/sale/inventory"
                className="flex items-center gap-1 rounded-lg bg-[#D60D26] px-3 py-1.5 text-xs font-bold text-white hover:bg-[#b00b1f] shadow-sm"
              >
                Re-Search Flights
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
