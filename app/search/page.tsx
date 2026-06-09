"use client";

import { useState, useEffect, Suspense, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { format, parseISO, addDays } from "date-fns";
import { Navbar } from "@/components/Navbar";
import { FlightResults, Flight } from "@/components/FlightResults";
import { SearchLoadingModal } from "@/components/SearchLoadingModal";
import { Footer } from "@/components/Footer";
import { FlexibleDatesBar } from "@/components/search/FlexibleDatesBar";
import { NearbyDatesFlights } from "@/components/search/NearbyDatesFlights";
import { ArrowUpRight, ArrowRight } from "lucide-react";
import { buildFlightsApiQuery } from "@/lib/buildFlightsApiQuery";

function SearchResultsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [flights, setFlights] = useState<Flight[]>([]);
  const [returnFlights, setReturnFlights] = useState<Flight[]>([]);
  const [nearbyGroups, setNearbyGroups] = useState<
    { date: string; flights: Flight[]; loading: boolean }[]
  >([]);
  const [isRoundTrip, setIsRoundTrip] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasSearched, setHasSearched] = useState(false);
  const [fetchError, setFetchError] = useState(false);

  const origin = searchParams.get("origin") || "New Delhi";
  const destination = searchParams.get("destination") || "Mumbai";
  const nonStop = searchParams.get("nonStop") === "true";
  const baggageFares = searchParams.get("baggageFares") === "true";
  const studentFare = searchParams.get("studentFare") === "true";
  const defenceFare = searchParams.get("defenceFare") === "true";
  const corporateFare = searchParams.get("corporateFare") === "true";
  const airlineCode = searchParams.get("airlineCode") || "";
  const tripType = searchParams.get("tripType") || "one-way";
  const passengers = searchParams.get("passengers") || "1";
  const cabin = searchParams.get("cabin") || "Economy";
  const adults = parseInt(searchParams.get("adults") || "1", 10);
  const children = parseInt(searchParams.get("children") || "0", 10);
  const infants = parseInt(searchParams.get("infants") || "0", 10);
  const departureDate =
    searchParams.get("departureDate") || format(new Date(), "yyyy-MM-dd");
  const returnDate = searchParams.get("returnDate") || "";

  const formatDisplayDate = (iso: string) => {
    try {
      return format(parseISO(iso), "dd MMM");
    } catch {
      return iso;
    }
  };

  const fetchForParams = useCallback(
    async (params: URLSearchParams, main = true) => {
      const query = buildFlightsApiQuery(params);
      const response = await fetch(`/api/flights?${query}`);
      if (!response.ok) throw new Error("API call failed");
      const data = await response.json();
      if (main) {
        setFlights(data.flights || []);
        const isRT = params.get("tripType") === "round-trip";
        setIsRoundTrip(isRT);
        if (isRT && data.returnFlights) {
          setReturnFlights(data.returnFlights);
        } else {
          setReturnFlights([]);
        }
      }
      return data.flights as Flight[];
    },
    []
  );

  const loadNearbyDates = useCallback(
    async (baseDep: string) => {
      const groups = [1, 2, 3].map((offset) => ({
        date: format(addDays(parseISO(baseDep), offset), "yyyy-MM-dd"),
        flights: [] as Flight[],
        loading: true,
      }));
      setNearbyGroups(groups);

      for (const offset of [1, 2, 3]) {
        const dateStr = format(addDays(parseISO(baseDep), offset), "yyyy-MM-dd");
        const p = new URLSearchParams(searchParams.toString());
        p.set("departureDate", dateStr);
        try {
          const list = await fetchForParams(p, false);
          setNearbyGroups((prev) =>
            prev.map((g) =>
              g.date === dateStr ? { ...g, flights: list || [], loading: false } : g
            )
          );
        } catch {
          setNearbyGroups((prev) =>
            prev.map((g) =>
              g.date === dateStr ? { ...g, flights: [], loading: false } : g
            )
          );
        }
      }
    },
    [fetchForParams, searchParams]
  );

  useEffect(() => {
    const run = async () => {
      if (!origin || !destination) {
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      setHasSearched(true);
      setFetchError(false);
      await new Promise((r) => setTimeout(r, 1200));
      try {
        await fetchForParams(searchParams, true);
        await loadNearbyDates(departureDate);
      } catch {
        setFetchError(true);
      } finally {
        setIsLoading(false);
      }
    };
    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams.toString()]);

  const onDateSelect = (iso: string) => {
    const p = new URLSearchParams(searchParams.toString());
    p.set("departureDate", iso);
    router.push(`/search?${p.toString()}`);
  };

  const onNearbySelect = (flight: Flight, date: string) => {
    const p = new URLSearchParams(searchParams.toString());
    p.set("departureDate", date);
    router.push(`/search?${p.toString()}`);
  };

  return (
    <main className="min-h-screen bg-[#F2FBFF] flex flex-col w-full">
      <Navbar />
      <SearchLoadingModal isOpen={isLoading} />

      <div className="w-full bg-[#D60D26] text-white select-none">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 py-4 sm:py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-0">
          <div className="flex flex-col gap-0.5 w-full sm:w-auto min-w-0">
            <div className="flex items-center gap-2.5 text-[17px] font-bold tracking-wide">
              <span>{origin}</span>
              <ArrowRight className="w-4 h-4 opacity-80 shrink-0" />
              <span className="truncate">{destination}</span>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-[12px] font-medium opacity-80">
              {departureDate && <span>{formatDisplayDate(departureDate)}</span>}
              {returnDate && tripType === "round-trip" && (
                <>
                  <span className="w-[3px] h-[3px] bg-white/60 rounded-full" />
                  <span>Return {formatDisplayDate(returnDate)}</span>
                </>
              )}
              <span className="w-[3px] h-[3px] bg-white/60 rounded-full" />
              <span>{passengers} passenger{passengers !== "1" ? "s" : ""}</span>
              <span className="w-[3px] h-[3px] bg-white/60 rounded-full" />
              <span>{cabin}</span>
            </div>
          </div>
          <button
            onClick={() => router.push("/")}
            className="flex items-center gap-2 bg-[#D60D26] hover:bg-[#D60D26] text-white font-bold text-[14px] px-6 py-2.5 rounded-lg transition-colors shadow-sm w-full sm:w-auto justify-center shrink-0"
          >
            Search Again <ArrowUpRight className="w-4 h-4" strokeWidth={2.5} />
          </button>
        </div>
      </div>

      <div className="max-w-[1440px] w-full mx-auto px-6 py-6 flex-1 pb-32">
        {!isLoading && departureDate && (
          <div className="mb-6">
            <p className="text-sm font-bold text-slate-600 mb-3">Flexible dates</p>
            <FlexibleDatesBar
              baseDate={departureDate}
              selectedDate={departureDate}
              onSelect={onDateSelect}
            />
          </div>
        )}

        {fetchError ? (
          <div className="text-center py-20 bg-white rounded-xl shadow-sm border border-rose-100">
            <h3 className="text-[24px] font-[800] text-slate-800 mb-2">Data currently unavailable</h3>
            <p className="text-[16px] text-slate-500 font-medium">We could not load the flight data at this time. Please try again later.</p>
          </div>
        ) : hasSearched && !isLoading ? (
          <>
            <FlightResults
              flights={flights}
              returnFlights={returnFlights}
              isRoundTrip={isRoundTrip}
              isLoading={isLoading}
              adults={adults}
              children={children}
              infants={infants}
            />
            <NearbyDatesFlights
              groups={nearbyGroups}
              onSelectFlight={onNearbySelect}
            />
          </>
        ) : !isLoading ? (
          <div className="text-center py-20 bg-white rounded-xl shadow-sm border border-slate-100">
            <h3 className="text-[24px] font-[800] text-slate-800 mb-2">Search for flights</h3>
            <p className="text-[16px] text-slate-500 font-medium">Use the search bar above to find the best deals.</p>
          </div>
        ) : null}
      </div>

      <Footer />
    </main>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-[#F2FBFF] flex flex-col items-center justify-center">
          <SearchLoadingModal isOpen={true} />
        </main>
      }
    >
      <SearchResultsContent />
    </Suspense>
  );
}
