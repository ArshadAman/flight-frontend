"use client";

import React, { useState } from "react";
import { Search, User, Globe, Award, Calendar, Eye, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface Traveller {
  id: string;
  name: string;
  gender: string;
  dob: string;
  nationality: string;
  passport: string;
  frequentFlyer: string;
  totalTrips: number;
  lastTrip: string;
  recentRoutes: string[];
}

const travellers: Traveller[] = [
  {
    id: "TRV-001",
    name: "Amit Sharma",
    gender: "Male",
    dob: "1988-05-14",
    nationality: "Indian",
    passport: "Z9482103",
    frequentFlyer: "6E (IndiGo) #8841209",
    totalTrips: 14,
    lastTrip: "2026-10-10",
    recentRoutes: ["DEL → BOM", "BOM → DEL", "DEL → BLR"],
  },
  {
    id: "TRV-002",
    name: "Sneha Reddy",
    gender: "Female",
    dob: "1994-11-22",
    nationality: "Indian",
    passport: "K3391802",
    frequentFlyer: "AI (Air India) #9012391",
    totalTrips: 8,
    lastTrip: "2026-09-28",
    recentRoutes: ["BLR → DEL", "DEL → HYD"],
  },
  {
    id: "TRV-003",
    name: "Vikram Patel",
    gender: "Male",
    dob: "1982-02-09",
    nationality: "Indian",
    passport: "M7194012",
    frequentFlyer: "UK (Vistara) #Club-774",
    totalTrips: 22,
    lastTrip: "2026-10-04",
    recentRoutes: ["BOM → GOI", "MAA → CCU", "DEL → BOM"],
  },
  {
    id: "TRV-004",
    name: "Neha Gupta",
    gender: "Female",
    dob: "1991-08-17",
    nationality: "Indian",
    passport: "V8190241",
    frequentFlyer: "None",
    totalTrips: 5,
    lastTrip: "2026-08-19",
    recentRoutes: ["BOM → GOI"],
  },
];

export function TravellerProfileSection() {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Traveller | null>(null);

  const filtered = travellers.filter(
    (t) =>
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.passport.toLowerCase().includes(search.toLowerCase()) ||
      t.frequentFlyer.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-[#1c304a]">Traveller Profiles</h2>
          <p className="text-xs text-slate-500">
            Corporate & frequent passenger directory with passport, loyalty cards, and booking history.
          </p>
        </div>
        <label className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs shadow-sm">
          <Search className="h-3.5 w-3.5 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, passport..."
            className="w-36 bg-transparent outline-none sm:w-48"
          />
        </label>
      </div>

      <div className="overflow-hidden rounded-[10px] border border-[#e8ebef] bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-[#e8ebef] bg-slate-50/70 font-semibold text-slate-500 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="px-4 py-3">Traveller Name</th>
                <th className="px-4 py-3">Gender & DOB</th>
                <th className="px-4 py-3">Passport No.</th>
                <th className="px-4 py-3">Frequent Flyer #</th>
                <th className="px-4 py-3">Total Flights</th>
                <th className="px-4 py-3">Last Trip</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-[#1c304a]">
              {filtered.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="px-4 py-3 font-bold">
                    <div className="flex items-center gap-2">
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 font-bold text-slate-600">
                        {t.name.slice(0, 1)}
                      </div>
                      <span>{t.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {t.gender} · {t.dob}
                  </td>
                  <td className="px-4 py-3 font-mono font-semibold text-slate-700">{t.passport}</td>
                  <td className="px-4 py-3 font-semibold text-blue-700">{t.frequentFlyer}</td>
                  <td className="px-4 py-3 font-bold text-slate-800">{t.totalTrips} Trips</td>
                  <td className="px-4 py-3 text-slate-500">{t.lastTrip}</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => setSelected(t)}
                      className="rounded border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-bold text-slate-700 hover:bg-slate-50 hover:text-[#D60D26]"
                    >
                      View Travels
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
                <span className="text-[10px] font-bold uppercase text-slate-400">Traveller History</span>
                <h3 className="text-lg font-black text-[#1c304a]">{selected.name}</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="rounded-full p-1 text-slate-400 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="rounded-lg bg-slate-50 p-3 space-y-1">
                <p><span className="text-slate-400">Passport:</span> <strong>{selected.passport}</strong> ({selected.nationality})</p>
                <p><span className="text-slate-400">Date of Birth:</span> <strong>{selected.dob}</strong></p>
                <p><span className="text-slate-400">Loyalty Program:</span> <strong>{selected.frequentFlyer}</strong></p>
                <p><span className="text-slate-400">Total Bookings Completed:</span> <strong>{selected.totalTrips}</strong></p>
              </div>

              <div>
                <p className="font-bold text-slate-700 mb-2">Recent Travel Routes:</p>
                <div className="space-y-1">
                  {selected.recentRoutes.map((r, i) => (
                    <div key={i} className="flex items-center justify-between rounded border border-slate-100 p-2 text-xs font-semibold">
                      <span>✈️ {r}</span>
                      <span className="text-emerald-700 text-[10px]">Confirmed & Flown</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t">
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
