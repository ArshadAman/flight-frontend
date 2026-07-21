"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { format, parseISO } from "date-fns";
import { ArrowRight, ArrowUpRight } from "lucide-react";
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

const CITY_CODES: Record<string, string> = {
  "new delhi": "DEL",
  delhi: "DEL",
  mumbai: "BOM",
  bangalore: "BLR",
  bengaluru: "BLR",
  chennai: "MAA",
  kolkata: "CCU",
  hyderabad: "HYD",
  pune: "PNQ",
  ahmedabad: "AMD",
  goa: "GOI",
  jaipur: "JAI",
  cochin: "COK",
  kochi: "COK",
  lucknow: "LKO",
  guwahati: "GAU",
  indore: "IDR",
  chandigarh: "IXC",
  patna: "PAT",
  bhubaneswar: "BBI",
};

function airportCode(city: string): string {
  const raw = (city || "").trim();
  if (/^[A-Z]{3}$/i.test(raw)) return raw.toUpperCase();
  const known = CITY_CODES[raw.toLowerCase()];
  if (known) return known;
  return raw.slice(0, 3).toUpperCase();
}

function formatSegDate(iso: string, pattern = "dd MMM") {
  try {
    return format(parseISO(iso), pattern);
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
  const payingPax = adults + children;

  const [activeLeg, setActiveLeg] = useState(0);
  const [selected, setSelected] = useState<(Flight | null)[]>(() =>
    segments.map(() => null)
  );
  const [flights, setFlights] = useState<Flight[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);

  const current = segments[activeLeg];
  const isLastLeg = activeLeg >= segments.length - 1;

  const totalFare = useMemo(() => {
    return selected.reduce((sum, f) => sum + (f?.price ?? 0), 0) * payingPax;
  }, [selected, payingPax]);

  const allSelected = selected.every(Boolean) && selected.length === segments.length;
  const canContinue = Boolean(selected[activeLeg]);

  const fetchLeg = useCallback(
    async (seg: MultiCitySegment) => {
      if (!seg?.origin || !seg?.destination || !seg?.date) {
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
        // Stamp each result with THIS sector's cities + date so cards never
        // inherit the wrong multi-city URL date (e.g. leg-1 date on leg 2).
        const stamped: Flight[] = (data.flights || []).map((f: Flight) => ({
          ...f,
          origin: f.origin || seg.origin,
          destination: f.destination || seg.destination,
          travel_date: seg.date,
        }));
        setFlights(stamped);
      } catch {
        setFetchError(true);
        setFlights([]);
      } finally {
        setIsLoading(false);
      }
    },
    [
      adults,
      children,
      infants,
      cabin,
      initialNonStop,
      initialBaggageFares,
      initialAirlineCode,
      initialFareType,
    ]
  );

  const segmentsKey = segments
    .map((s) => `${s.origin}|${s.destination}|${s.date}`)
    .join(";");

  useEffect(() => {
    setSelected(segments.map(() => null));
    setActiveLeg(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [segmentsKey]);

  useEffect(() => {
    if (!current) return;
    fetchLeg(current);
    // Depend on stable key + activeLeg — not the segment object identity
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeLeg, segmentsKey, fetchLeg]);

  const persistAndBook = (legs: Flight[]) => {
    const first = legs[0];
    const last = legs[legs.length - 1];
    const draft: BookingDraft = {
      tripType: "multi-city",
      origin: segments[0]?.origin || first.origin,
      destination: segments[segments.length - 1]?.destination || last.destination,
      departureDate: segments[0]?.date || first.travel_date || new Date().toISOString().slice(0, 10),
      cabin,
      adults,
      children,
      infants,
      outbound: first,
      multiCityFlights: legs.map((leg, i) => ({
        ...leg,
        travel_date: segments[i]?.date || leg.travel_date,
        origin: segments[i]?.origin || leg.origin,
        destination: segments[i]?.destination || leg.destination,
      })),
      createdAt: new Date().toISOString(),
    };
    saveBookingDraft(draft);
    router.push(isB2bRoute ? "/b2b/book" : "/book");
  };

  const onPickFlight = (flight: Flight) => {
    const next = [...selected];
    next[activeLeg] = {
      ...flight,
      travel_date: current?.date || flight.travel_date,
      origin: current?.origin || flight.origin,
      destination: current?.destination || flight.destination,
    };
    for (let i = activeLeg + 1; i < next.length; i++) next[i] = null;
    setSelected(next);
  };

  const handleContinue = () => {
    const flight = selected[activeLeg];
    if (!flight) return;

    if (!isLastLeg) {
      setActiveLeg((i) => i + 1);
      return;
    }

    if (!selected.every(Boolean)) return;
    persistAndBook(selected as Flight[]);
  };

  const goToLeg = (idx: number) => {
    // Allow revisit of any completed leg, or the next unfinished one
    const maxReachable = selected.findIndex((f) => !f);
    const limit = maxReachable === -1 ? segments.length - 1 : maxReachable;
    if (idx > limit) return;
    setActiveLeg(idx);
  };

  return (
    <div className="w-full flex flex-col gap-4 pb-36">
      <SearchLoadingModal isOpen={isLoading} />

      {/* Yatra-style sector tabs */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="flex overflow-x-auto">
          {segments.map((seg, idx) => {
            const isActive = idx === activeLeg;
            const picked = selected[idx];
            const maxReachable = selected.findIndex((f) => !f);
            const limit = maxReachable === -1 ? segments.length - 1 : maxReachable;
            const reachable = idx <= limit;

            return (
              <button
                key={idx}
                type="button"
                onClick={() => goToLeg(idx)}
                disabled={!reachable}
                className={cn(
                  "flex-1 min-w-[200px] px-5 py-4 text-left border-b-2 transition-colors",
                  isActive && "border-blue-600 bg-blue-50",
                  !isActive && picked && "border-transparent bg-white hover:bg-slate-50",
                  !isActive && !picked && "border-transparent bg-slate-50/80 opacity-60 cursor-not-allowed"
                )}
              >
                <p
                  className={cn(
                    "text-[13px] font-extrabold truncate",
                    isActive ? "text-blue-600" : "text-slate-800"
                  )}
                >
                  {seg.origin} ({airportCode(seg.origin)}) - {seg.destination} (
                  {airportCode(seg.destination)})
                </p>
                <p className="text-[12px] text-slate-500 font-medium mt-0.5">
                  {formatSegDate(seg.date)}
                  {picked ? " · Selected" : isActive ? " · Choose flight" : ""}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      <p className="text-[14px] font-bold text-slate-600 px-1">
        Showing flights for{" "}
        <span className="text-slate-900">
          {current?.origin} → {current?.destination}
        </span>{" "}
        on <span className="text-slate-900">{formatSegDate(current?.date || "", "EEE, dd MMM yyyy")}</span>
        <span className="text-slate-400 font-medium"> — pick one flight for this sector only</span>
      </p>

      {fetchError ? (
        <div className="text-center py-16 bg-white rounded-xl shadow-sm border border-rose-100">
          <h3 className="text-[22px] font-[800] text-slate-800 mb-2">Could not load this sector</h3>
          <p className="text-[15px] text-slate-500 font-medium">
            Try again for Flight {activeLeg + 1} ({current?.origin} → {current?.destination} on{" "}
            {formatSegDate(current?.date || "")}).
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
          hideStickyBar
          legTravelDate={current?.date}
          onSelectFlight={onPickFlight}
          listTitle={undefined}
        />
      )}

      {/* Yatra-style sticky summary: every sector side-by-side */}
      <div className="fixed bottom-0 left-0 right-0 z-[90] bg-white border-t border-slate-200 shadow-[0_-8px_30px_rgba(0,0,0,0.1)]">
        <div className="max-w-[1440px] mx-auto px-4 py-3 flex flex-col lg:flex-row items-stretch lg:items-center gap-3 lg:gap-4">
          <div className="flex-1 flex overflow-x-auto gap-0 divide-x divide-slate-200">
            {segments.map((seg, idx) => {
              const picked = selected[idx];
              return (
                <div
                  key={idx}
                  className={cn(
                    "min-w-[200px] flex-1 px-4 py-1",
                    idx === activeLeg && "bg-blue-50"
                  )}
                >
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">
                    Flight {idx + 1} · {formatSegDate(seg.date)}
                  </p>
                  {picked ? (
                    <>
                      <p className="text-[13px] font-extrabold text-slate-900 truncate">
                        {picked.airline} {picked.id}
                      </p>
                      <p className="text-[12px] font-semibold text-slate-600 flex items-center gap-1">
                        {airportCode(seg.origin)}
                        <ArrowRight className="w-3 h-3" />
                        {airportCode(seg.destination)}
                        <span className="text-slate-400 font-medium ml-1">
                          {picked.departureTime} – {picked.arrivalTime}
                        </span>
                      </p>
                    </>
                  ) : (
                    <p className="text-[13px] font-semibold text-slate-400 mt-1">
                      {idx === activeLeg ? "Select a flight above" : "Pending"}
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between lg:justify-end gap-4 shrink-0 border-t lg:border-t-0 border-slate-100 pt-3 lg:pt-0">
            <div className="text-right">
              <p className="text-[11px] font-bold text-slate-400 uppercase">Total Fare</p>
              <p className="text-[22px] font-black text-slate-900 leading-none">
                ₹{totalFare.toLocaleString("en-IN")}
              </p>
            </div>
            <button
              type="button"
              disabled={!canContinue || (isLastLeg && !allSelected && !selected[activeLeg])}
              onClick={handleContinue}
              className={cn(
                "px-8 py-3.5 rounded-full font-bold text-white flex items-center gap-2 transition-all whitespace-nowrap",
                canContinue
                  ? "bg-[#D60D26] hover:bg-[#b00b1d] shadow-lg"
                  : "bg-slate-300 cursor-not-allowed"
              )}
            >
              {isLastLeg ? "Book Now" : "Select Next Flight"}
              <ArrowUpRight className="w-5 h-5" strokeWidth={2.5} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
