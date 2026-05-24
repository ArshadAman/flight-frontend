"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { FlightResults, Flight } from "@/components/FlightResults";
import { SearchLoadingModal } from "@/components/SearchLoadingModal";
import { Footer } from "@/components/Footer";
import { ArrowUpRight, ArrowRight } from "lucide-react";

function SearchResultsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [flights, setFlights] = useState<Flight[]>([]);
  const [returnFlights, setReturnFlights] = useState<Flight[]>([]);
  const [isRoundTrip, setIsRoundTrip] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasSearched, setHasSearched] = useState(false);
  const [fetchError, setFetchError] = useState(false);

  // Read search params
  const origin = searchParams.get("origin") || "New Delhi";
  const destination = searchParams.get("destination") || "Mumbai";
  const nonStop = searchParams.get("nonStop") === "true";
  const tripType = searchParams.get("tripType") || "one-way";
  const passengers = searchParams.get("passengers") || "1";
  const cabin = searchParams.get("cabin") || "Economy";

  useEffect(() => {
    if (origin && destination) {
      fetchFlights({ origin, destination, nonStop, tripType });
    } else {
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchFlights = async (searchData: { origin: string; destination: string; nonStop: boolean; tripType: string }) => {
    setIsLoading(true);
    setHasSearched(true);
    setFetchError(false);

    const isRT = searchData.tripType === "round-trip";
    setIsRoundTrip(isRT);

    await new Promise((resolve) => setTimeout(resolve, 2500));

    try {
      const params = new URLSearchParams();
      if (searchData.origin) params.append("origin", searchData.origin);
      if (searchData.destination) params.append("destination", searchData.destination);
      if (searchData.nonStop) params.append("nonStop", "true");
      params.append("tripType", searchData.tripType);

      const response = await fetch(`/api/flights?${params.toString()}`);
      if (!response.ok) throw new Error("API call failed");
      const data = await response.json();
      setFlights(data.flights);

      if (isRT && data.returnFlights) {
        setReturnFlights(data.returnFlights);
      } else {
        setReturnFlights([]);
      }
    } catch (error) {
      console.error("Failed to fetch flights", error);
      setFetchError(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#F2FBFF] flex flex-col w-full">
      <Navbar />
      <SearchLoadingModal isOpen={isLoading} />

      {/* Red Route Summary Bar */}
      <div className="w-full bg-[#D60D26] text-white select-none">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 py-4 sm:py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-0">
          <div className="flex flex-col gap-0.5 w-full sm:w-auto min-w-0">
            <div className="flex items-center gap-2.5 text-[17px] font-bold tracking-wide">
              <span>{origin}</span>
              <ArrowRight className="w-4 h-4 opacity-80 shrink-0" />
              <span className="truncate">{destination}</span>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-[12px] font-medium opacity-80">
              <span>01 Oct</span>
              <span className="w-[3px] h-[3px] bg-white/60 rounded-full" />
              <span>{passengers} passenger</span>
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

      {/* Results */}
      <div className="max-w-[1440px] w-full mx-auto px-6 py-6 flex-1">
        {fetchError ? (
          <div className="text-center py-20 bg-white rounded-xl shadow-sm border border-rose-100">
            <h3 className="text-[24px] font-[800] text-slate-800 mb-2">Data currently unavailable</h3>
            <p className="text-[16px] text-slate-500 font-medium">We could not load the flight data at this time. Please try again later.</p>
          </div>
        ) : hasSearched && !isLoading ? (
          <FlightResults
            flights={flights}
            returnFlights={returnFlights}
            isRoundTrip={isRoundTrip}
            isLoading={isLoading}
          />
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
    <Suspense fallback={
      <main className="min-h-screen bg-[#F2FBFF] flex flex-col items-center justify-center">
        <SearchLoadingModal isOpen={true} />
      </main>
    }>
      <SearchResultsContent />
    </Suspense>
  );
}
