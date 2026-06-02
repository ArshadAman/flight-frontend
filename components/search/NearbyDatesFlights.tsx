"use client";

import type { Flight } from "@/lib/flight";
import { format, parseISO } from "date-fns";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

type DateGroup = {
  date: string;
  flights: Flight[];
  loading?: boolean;
};

type Props = {
  groups: DateGroup[];
  onSelectFlight: (flight: Flight, date: string) => void;
  selectedFlightKey?: string;
};

export function NearbyDatesFlights({ groups, onSelectFlight, selectedFlightKey }: Props) {
  const [open, setOpen] = useState<Record<string, boolean>>({});

  if (!groups.length) return null;

  return (
    <div className="mt-10 flex flex-col gap-4">
      <h3 className="text-lg font-black text-slate-800">Flights on the next 3 days</h3>
      <p className="text-sm text-slate-500 -mt-2">Alternative departures after your selected date</p>
      {groups.map((g) => {
        const isOpen = open[g.date] ?? false;
        const label = format(parseISO(g.date), "EEEE, d MMM yyyy");
        return (
          <div key={g.date} className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
            <button
              type="button"
              className="w-full flex items-center justify-between px-5 py-4 bg-[#F4F7FC] hover:bg-slate-100 transition-colors"
              onClick={() => setOpen((o) => ({ ...o, [g.date]: !isOpen }))}
            >
              <span className="font-bold text-slate-800">{label}</span>
              <span className="text-sm text-slate-500 mr-2">
                {g.loading ? "Loading…" : `${g.flights.length} flights`}
              </span>
              {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </button>
            {isOpen && (
              <div className="p-4 flex flex-col gap-3">
                {g.loading && (
                  <p className="text-center text-slate-400 py-4 text-sm">Loading flights…</p>
                )}
                {!g.loading && g.flights.length === 0 && (
                  <p className="text-center text-slate-400 py-4 text-sm">No flights on this date</p>
                )}
                {g.flights.slice(0, 5).map((f) => {
                  const key = f.flight_key || f.id;
                  const selected = key === selectedFlightKey;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => onSelectFlight(f, g.date)}
                      className={`w-full text-left flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl border transition-colors ${
                        selected
                          ? "border-[#D60D26] bg-red-50"
                          : "border-slate-100 hover:border-slate-300"
                      }`}
                    >
                      <div>
                        <span className="font-black text-[#D60D26] text-sm">{f.airline}</span>
                        <p className="font-bold text-slate-800">
                          {f.departureTime} → {f.arrivalTime} · {f.duration}
                        </p>
                        <p className="text-xs text-slate-500">
                          {f.stops === 0 ? "Non-stop" : `${f.stops} stop(s)`}
                          {f.meal_available ? " · Meals available" : ""}
                        </p>
                      </div>
                      <span className="text-xl font-black text-slate-900">
                        ₹{f.price.toLocaleString("en-IN")}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
