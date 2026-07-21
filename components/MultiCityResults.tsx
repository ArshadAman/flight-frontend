"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { format, parseISO } from "date-fns";
import { ArrowRight, Check, ArrowUpRight } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { FlightResults, type Flight } from "@/components/FlightResults";
import { SearchLoadingModal } from "@/components/SearchLoadingModal";
import { saveBookingDraft, type BookingDraft } from "@/lib/booking";
import { cn } from "@/lib/utils";

export type MultiCitySegment = {
  origin: string;
  destination: string;
  date: string;
};

type Props = {
  segments: MultiCitySegment[];
  adults?: number;
  children?: number;
  infants?: number;
  cabin?: string;
  initialNonStop?: boolean;
  initialBaggageFares?: boolean;
  initialAirlineCode?: string;
  initialFareType?: "ALL" | "PUB" | "CORP" | "STU" | "DEF";
};

function formatSegDate(iso: string) {
  try {
    return format(parseISO(iso), "dd MMM");
  } catch {
    return iso;
  }
}

export function MultiCityResults({
  segments,
  adults = 1,
  children = 0,
  infants = 0,
  cabin = "Economy",
  initialNonStop = false,
  initialBaggageFares = false,
  initialAirlineCode,
  initialFareType = "ALL",
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const isB2bRoute = pathname?.startsWith("/b2b");

  const [activeLeg, setActiveLeg] = useState(0);
  const [selected, setSelected] = useState<(Flight | null)[]>(() =>
    segments.map(() => null)
  );
  const [flights, setFlights] = useState<Flight[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);

  const current = segments[activeLeg];
  const isLastLeg = activeLeg >= segments.length - 1;

  const priorTotal = useMemo(
    () =>
      selected.reduce((sum, f, i) => (i < activeLeg && f ? sum + f.price : sum), 0),
    [selected, activeLeg]
  );

  const fetchLeg = useCallback(async (seg: MultiCitySegment) => {
    if (!seg?.origin || !seg?.destination) {
      setFlights([]);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setFetchError(false);
    try {
      const params = new URLSearchParams({
        tripType: "one-way",
        origin: seg.origin,
        destination: seg.destination,
        departureDate: seg.date,
        adults: String(adults),
        children: String(children),
        infants: String(infants),
        cabin,
      });
      if (initialNonStop) params.set("nonStop", "true");
      if (initialBaggageFares) params.set("baggageFares", "true");
      if (initialAirlineCode) params.set("airlineCode", initialAirlineCode);
      if (initialFareType === "STU") params.set("studentFare", "true");
      if (initialFareType === "DEF") params.set("defenceFare", "true");
      if (initialFareType === "CORP") params.set("corporateFare", "true");

      const res = await fetch(`/api/flights?${params.toString()}`);
      if (!res.ok) throw new Error("search failed");
      const data = await res.json();
      setFlights(data.flights || []);
    } catch {
      setFetchError(true);
      setFlights([]);
    } finally {
      setIsLoading(false);
    }
  }, [
    adults,
    children,
    infants,
    cabin,
    initialNonStop,
    initialBaggageFares,
    initialAirlineCode,
    initialFareType,
  ]);

  const segmentsKey = segments
    .map((s) => `${s.origin}|${s.destination}|${s.date}`)
    .join(";");

  useEffect(() => {
    setSelected(segments.map(() => null));
    setActiveLeg(0);
    // Reset when the multi-city itinerary in the URL changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [segmentsKey]);

  useEffect(() => {
    if (current) fetchLeg(current);
  }, [activeLeg, current, fetchLeg]);

  const persistAndBook = (legs: Flight[]) => {
    const first = legs[0];
    const last = legs[legs.length - 1];
    const draft: BookingDraft = {
      tripType: "multi-city",
      origin: first.origin,
      destination: last.destination,
      departureDate: segments[0]?.date || first.travel_date || new Date().toISOString().slice(0, 10),
      cabin,
      adults,
      children,
      infants,
      outbound: first,
      multiCityFlights: legs,
      createdAt: new Date().toISOString(),
    };
    saveBookingDraft(draft);
    router.push(isB2bRoute ? "/b2b/book" : "/book");
  };

  const handleContinue = (flight: Flight) => {
    const next = [...selected];
    next[activeLeg] = flight;
    for (let i = activeLeg + 1; i < next.length; i++) next[i] = null;
    setSelected(next);

    if (!isLastLeg) {
      setActiveLeg((i) => i + 1);
      return;
    }

    const all = next.map((f, i) => (i === activeLeg ? flight : f));
    if (all.some((f) => !f)) return;
    persistAndBook(all as Flight[]);
  };

  const goToLeg = (idx: number) => {
    // Only allow jumping to completed legs or the current one
    if (idx > activeLeg) return;
    setActiveLeg(idx);
  };

  return (
    <div className="w-full flex flex-col gap-5">
      <SearchLoadingModal isOpen={isLoading} />

      {/* Sector stepper — Yatra / MMT style */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-4 sm:p-5">
        <p className="text-[13px] font-bold text-slate-500 mb-3 uppercase tracking-wide">
          Select flights for each sector
        </p>
        <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2 sm:gap-3">
          {segments.map((seg, idx) => {
            const picked = selected[idx];
            const isActive = idx === activeLeg;
            const done = Boolean(picked) && idx < activeLeg;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => goToLeg(idx)}
                disabled={idx > activeLeg}
                className={cn(
                  "flex flex-col sm:min-w-[180px] flex-1 text-left rounded-xl border px-4 py-3 transition-all",
                  isActive
                    ? "border-[#D60D26] bg-[#FFF5F6] shadow-sm"
                    : done
                      ? "border-emerald-200 bg-emerald-50/60 cursor-pointer hover:border-emerald-300"
                      : "border-slate-200 bg-slate-50 opacity-70 cursor-not-allowed"
                )}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className={cn(
                      "text-[11px] font-black uppercase tracking-wider",
                      isActive ? "text-[#D60D26]" : done ? "text-emerald-700" : "text-slate-400"
                    )}
                  >
                    Flight {idx + 1}
                  </span>
                  {done && <Check className="w-3.5 h-3.5 text-emerald-600" strokeWidth={3} />}
                </div>
                <div className="flex items-center gap-1.5 text-[14px] font-extrabold text-slate-900">
                  <span className="truncate">{seg.origin}</span>
                  <ArrowRight className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                  <span className="truncate">{seg.destination}</span>
                </div>
                <p className="text-[12px] text-slate-500 font-medium mt-0.5">
                  {formatSegDate(seg.date)}
                  {picked
                    ? ` · ${picked.airline} · ₹${picked.price.toLocaleString("en-IN")}`
                    : isActive
                      ? " · Choose a flight"
                      : ""}
                </p>
              </button>
            );
          })}
        </div>

        {priorTotal > 0 && (
          <p className="mt-3 text-[13px] font-semibold text-slate-600">
            Selected so far: ₹
            {(priorTotal * (adults + children)).toLocaleString("en-IN")}
            <span className="text-slate-400 font-medium"> (fares × travellers)</span>
          </p>
        )}
      </div>

      {fetchError ? (
        <div className="text-center py-16 bg-white rounded-xl shadow-sm border border-rose-100">
          <h3 className="text-[22px] font-[800] text-slate-800 mb-2">Could not load this sector</h3>
          <p className="text-[15px] text-slate-500 font-medium">
            Try again or change dates for Flight {activeLeg + 1}.
          </p>
          <button
            type="button"
            onClick={() => current && fetchLeg(current)}
            className="mt-4 inline-flex items-center gap-1 text-[#D60D26] font-bold text-sm hover:underline"
          >
            Retry <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <FlightResults
          key={`leg-${activeLeg}-${current?.origin}-${current?.destination}-${current?.date}`}
          flights={flights}
          isRoundTrip={false}
          isLoading={isLoading}
          adults={adults}
          children={children}
          infants={infants}
          initialNonStop={initialNonStop}
          initialBaggageFares={initialBaggageFares}
          initialAirlineCode={initialAirlineCode}
          initialFareType={initialFareType}
          cabin={cabin}
          forceSelectMode
          continueButtonLabel={isLastLeg ? "Book Now" : "Select Next Flight"}
          selectionHint={`Flight ${activeLeg + 1}: ${current?.origin} → ${current?.destination}`}
          priorLegsFareTotal={priorTotal}
          onContinueWithSelection={handleContinue}
          listTitle={`Flight ${activeLeg + 1} — ${current?.origin} → ${current?.destination}`}
        />
      )}
    </div>
  );
}
