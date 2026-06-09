"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { format, parseISO } from "date-fns";
import { B2BNavbar } from "@/components/B2BNavbar";
import { FlightResults, Flight } from "@/components/FlightResults";
import { SearchLoadingModal } from "@/components/SearchLoadingModal";
import { Footer } from "@/components/Footer";
import { ArrowUpRight } from "lucide-react";
import { buildFlightsApiQuery } from "@/lib/buildFlightsApiQuery";

function B2BSearchResultsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [flights, setFlights] = useState<Flight[]>([]);
  const [returnFlights, setReturnFlights] = useState<Flight[]>([]);
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
  const departureDate = searchParams.get("departureDate") || "";
  const returnDate = searchParams.get("returnDate") || "";

  const formatDisplayDate = (iso: string) => {
    try {
      return format(parseISO(iso), "dd MMM");
    } catch {
      return iso;
    }
  };

  useEffect(() => {
    if (origin && destination) {
      fetchFlights();
    } else {
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams.toString()]);

  const fetchFlights = async () => {
    setIsLoading(true);
    setHasSearched(true);
    setFetchError(false);

    const isRT = tripType === "round-trip";
    setIsRoundTrip(isRT);

    await new Promise((resolve) => setTimeout(resolve, 2500));

    try {
      const query = buildFlightsApiQuery(searchParams);
      const response = await fetch(`/api/flights?${query}`);
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
      <B2BNavbar />
      <SearchLoadingModal isOpen={isLoading} />

      <div className="w-full bg-gradient-to-r from-[#D60D26] via-[#30060F] to-[#090001] text-white select-none shadow-md border-b border-black/10">
        <div className="max-w-[1440px] mx-auto px-6 py-4 sm:py-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-0">
          <div className="flex flex-col gap-1 w-full sm:w-auto min-w-0">
            <div className="flex items-center gap-2.5 text-[20px] font-bold tracking-wide">
              <span>{origin}</span>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="opacity-90 shrink-0"><circle cx="12" cy="12" r="10"/><path d="M8 12h8"/><path d="m12 8 4 4-4 4"/></svg>
              <span className="truncate">{destination}</span>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-[13px] font-medium opacity-90">
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
              {nonStop && (
                <>
                  <span className="w-[3px] h-[3px] bg-white/60 rounded-full" />
                  <span>Non-stop</span>
                </>
              )}
              {baggageFares && (
                <>
                  <span className="w-[3px] h-[3px] bg-white/60 rounded-full" />
                  <span>Baggage fares</span>
                </>
              )}
              {airlineCode && (
                <>
                  <span className="w-[3px] h-[3px] bg-white/60 rounded-full" />
                  <span>{airlineCode}</span>
                </>
              )}
            </div>
          </div>
          <button
            onClick={() => router.push("/b2b")}
            className="flex items-center gap-1.5 bg-[#D60D26] hover:bg-[#b00b1d] text-white font-[800] tracking-wide text-[14px] px-6 py-2.5 rounded-full transition-colors shadow-sm w-full sm:w-auto justify-center shrink-0"
          >
            Search Again <ArrowUpRight className="w-4 h-4" strokeWidth={3} />
          </button>
        </div>
      </div>

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
            adults={adults}
            children={children}
            infants={infants}
            initialNonStop={nonStop}
            initialBaggageFares={baggageFares}
            initialAirlineCode={airlineCode || undefined}
            initialFareType={studentFare ? "STU" : defenceFare ? "DEF" : corporateFare ? "CORP" : "PUB"}
            searchOrigin={origin}
            searchDestination={destination}
            departureDate={departureDate}
            returnDate={returnDate}
            cabin={cabin}
            tripType={tripType}
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

export default function B2BSearchPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-[#F2FBFF] flex flex-col items-center justify-center">
          <SearchLoadingModal isOpen={true} />
        </main>
      }
    >
      <B2BSearchResultsContent />
    </Suspense>
  );
}
