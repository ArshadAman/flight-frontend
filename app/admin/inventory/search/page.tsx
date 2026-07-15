"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { buildFlightSearchQuery } from "@/lib/flightSearch";
import { format, addDays } from "date-fns";

const tripTypes = ["One Way", "Round Trip", "Multi City"] as const;

const CITIES = [
  { city: "New Delhi", code: "DEL" },
  { city: "Mumbai", code: "BOM" },
  { city: "Bangalore", code: "BLR" },
  { city: "Chennai", code: "MAA" },
  { city: "Hyderabad", code: "HYD" },
  { city: "Kolkata", code: "CCU" },
  { city: "Goa", code: "GOI" },
  { city: "Pune", code: "PNQ" },
];

export default function InventorySearchPage() {
  const router = useRouter();
  const [tripType, setTripType] = useState<(typeof tripTypes)[number]>("One Way");
  const [nonStop, setNonStop] = useState(false);
  const [originIdx, setOriginIdx] = useState(0);
  const [destIdx, setDestIdx] = useState(1);
  const [depDate, setDepDate] = useState(format(addDays(new Date(), 7), "yyyy-MM-dd"));
  const [retDate, setRetDate] = useState(format(addDays(new Date(), 14), "yyyy-MM-dd"));
  const [cabin, setCabin] = useState("Economy");
  const [adults, setAdults] = useState(1);
  const [airline, setAirline] = useState("");

  const origin = CITIES[originIdx];
  const dest = CITIES[destIdx];

  const tripParam = useMemo(() => {
    if (tripType === "Round Trip") return "round-trip" as const;
    if (tripType === "Multi City") return "multi-city" as const;
    return "one-way" as const;
  }, [tripType]);

  const onSearch = () => {
    const qs = buildFlightSearchQuery({
      origin: origin.code,
      destination: dest.code,
      nonStop,
      baggageFares: false,
      studentFareSearch: false,
      defenceFareSearch: false,
      srCitizenSearch: false,
      travellers: { adults, children: 0, infants: 0 },
      cabin,
      tripType: tripParam,
      departureDate: new Date(depDate),
      returnDate: tripParam === "round-trip" ? new Date(retDate) : undefined,
      airlineCode: airline || undefined,
    });
    router.push(`/admin/inventory/results?${qs.toString()}`);
  };

  return (
    <div className="flex min-h-full flex-col">
      <AdminPageHeader title="Supplier Inventory" />
      <div className="flex flex-1 flex-col items-center px-6 py-8">
        <div className="w-full max-w-5xl rounded-2xl bg-[#eef6ff] px-8 py-7">
          <div className="mb-6 flex flex-wrap gap-6">
            {tripTypes.map((type) => (
              <label key={type} className="flex cursor-pointer items-center gap-2 text-sm text-[#1c304a]">
                <input
                  type="radio"
                  name="tripType"
                  checked={tripType === type}
                  onChange={() => setTripType(type)}
                  className="h-4 w-4 accent-[#006aec]"
                />
                {type}
              </label>
            ))}
          </div>

          <div className="grid grid-cols-1 items-end gap-x-4 gap-y-6 md:grid-cols-[1fr_auto_1fr_1fr_1fr_1fr]">
            <div>
              <p className="mb-1 text-xs text-slate-400">Departure From</p>
              <select
                className="w-full border-b border-slate-300 bg-transparent pb-2 text-sm font-bold text-[#1c304a] outline-none"
                value={originIdx}
                onChange={(e) => setOriginIdx(Number(e.target.value))}
              >
                {CITIES.map((c, i) => (
                  <option key={c.code} value={i}>
                    {c.city} ({c.code})
                  </option>
                ))}
              </select>
            </div>
            <div className="mb-3 flex justify-center">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#006aec] text-white">
                <ArrowRight className="h-4 w-4" />
              </span>
            </div>
            <div>
              <p className="mb-1 text-xs text-slate-400">Going To</p>
              <select
                className="w-full border-b border-slate-300 bg-transparent pb-2 text-sm font-bold text-[#1c304a] outline-none"
                value={destIdx}
                onChange={(e) => setDestIdx(Number(e.target.value))}
              >
                {CITIES.map((c, i) => (
                  <option key={c.code} value={i}>
                    {c.city} ({c.code})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <p className="mb-1 text-xs text-slate-400">Departure Date</p>
              <Input
                type="date"
                value={depDate}
                onChange={(e) => setDepDate(e.target.value)}
                className="h-9 border-0 border-b border-slate-300 bg-transparent px-0 shadow-none focus-visible:ring-0"
              />
            </div>
            {tripType === "One Way" ? (
              <div className="pb-1">
                <p className="text-xs text-slate-400">Return Date</p>
                <button
                  type="button"
                  className="mt-1 text-left text-sm font-medium text-[#006aec]"
                  onClick={() => setTripType("Round Trip")}
                >
                  Book Round Trip To Save Extra
                </button>
              </div>
            ) : (
              <div>
                <p className="mb-1 text-xs text-slate-400">Return Date</p>
                <Input
                  type="date"
                  value={retDate}
                  onChange={(e) => setRetDate(e.target.value)}
                  className="h-9 border-0 border-b border-slate-300 bg-transparent px-0 shadow-none focus-visible:ring-0"
                />
              </div>
            )}
            <div>
              <p className="mb-1 text-xs text-slate-400">Cabin / Airline</p>
              <div className="flex gap-2">
                <select
                  className="flex-1 border-b border-slate-300 bg-transparent pb-2 text-sm font-bold outline-none"
                  value={cabin}
                  onChange={(e) => setCabin(e.target.value)}
                >
                  {["Economy", "Premium Economy", "Business", "First"].map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
                <Input
                  placeholder="Airline (opt)"
                  value={airline}
                  onChange={(e) => setAirline(e.target.value)}
                  className="h-9 w-28 border-0 border-b border-slate-300 bg-transparent px-0 shadow-none"
                />
              </div>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-6">
            <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-[#1c304a]">
              <input
                type="checkbox"
                checked={nonStop}
                onChange={(e) => setNonStop(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 accent-[#006aec]"
              />
              Non-Stops Flights
            </label>
            <label className="flex items-center gap-2 text-sm text-[#1c304a]">
              Adults
              <Input
                type="number"
                min={1}
                max={9}
                value={adults}
                onChange={(e) => setAdults(Number(e.target.value) || 1)}
                className="h-8 w-16"
              />
            </label>
          </div>
        </div>

        <Button
          className="mt-8 h-12 gap-2 rounded-full bg-[#006aec] px-10 text-base font-semibold hover:bg-[#006aec]/90"
          onClick={onSearch}
        >
          Search
          <ArrowUpRight className="h-5 w-5" />
        </Button>
        <p className={cn("mt-3 text-xs text-slate-400")}>
          Live search via `/api/flights` → backend `/api/v1/flights/search/`
        </p>
      </div>
    </div>
  );
}
