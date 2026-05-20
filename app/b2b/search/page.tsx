"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { B2BNavbar } from "@/components/B2BNavbar";
import { B2BFlightSearch } from "@/components/B2BFlightSearch";
import { FlightResults, Flight } from "@/components/FlightResults";
import { SearchLoadingModal } from "@/components/SearchLoadingModal";
import { Footer } from "@/components/Footer";

function B2BSearchResultsContent() {
  const searchParams = useSearchParams();

  const [flights, setFlights] = useState<Flight[]>([]);
  const [returnFlights, setReturnFlights] = useState<Flight[]>([]);
  const [isRoundTrip, setIsRoundTrip] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasSearched, setHasSearched] = useState(false);
  const [fetchError, setFetchError] = useState(false);

  // Read search params
  const origin = searchParams.get("origin") || "";
  const destination = searchParams.get("destination") || "";
  const nonStop = searchParams.get("nonStop") === "true";
  const tripType = searchParams.get("tripType") || "one-way";

  // Fetch flights on mount using URL params
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

  // Handle re-search from the embedded search bar
  const handleSearch = (searchData: { origin: string; destination: string; nonStop: boolean; tripType: string }) => {
    // Update URL params
    const params = new URLSearchParams();
    params.set("origin", searchData.origin);
    params.set("destination", searchData.destination);
    if (searchData.nonStop) params.set("nonStop", "true");
    params.set("tripType", searchData.tripType);
    window.history.replaceState(null, "", `/b2b/search?${params.toString()}`);

    fetchFlights(searchData);
  };

  return (
    <main className="min-h-screen bg-slate-50 flex flex-col overflow-x-hidden w-full max-w-full">
      <B2BNavbar />
      <SearchLoadingModal isOpen={isLoading} />

      {/* Compact search bar at the top */}
      <div className="bg-gradient-to-b from-[#1a1b2e] to-[#2d1f3d] pt-6 pb-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <B2BFlightSearch onSearch={handleSearch} />
        </div>
      </div>

      {/* Results */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 mb-12 flex-1">
        {fetchError ? (
          <div className="text-center py-20 bg-white rounded-[1.5rem] shadow-sm border border-rose-100">
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
          <div className="text-center py-20 bg-white rounded-[1.5rem] shadow-sm border border-slate-100">
            <h3 className="text-[24px] font-[800] text-slate-800 mb-2">Search for flights</h3>
            <p className="text-[16px] text-slate-500 font-medium">Use the search bar above to find the best deals.</p>
          </div>
        ) : null}
      </div>

      <Footer />
    </main>
  );
}

export default function B2BSearchPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
        <SearchLoadingModal isOpen={true} />
      </main>
    }>
      <B2BSearchResultsContent />
    </Suspense>
  );
}
