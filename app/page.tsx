"use client";

import { useState, useRef } from "react";
import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { FlightSearch } from "@/components/FlightSearch";
import { FlightResults, Flight } from "@/components/FlightResults";
import { PromoBanner } from "@/components/PromoBanner";
import { DestinationCard } from "@/components/DestinationCard";
import { Footer } from "@/components/Footer";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { RedUnderline } from "@/components/ui/red-underline";
import { ShieldIcon, CheckmarkIcon, SupportClockIcon, HeadsetIcon } from "@/components/icons";

export default function Home() {


  const [flights, setFlights] = useState<Flight[]>([]);
  const [returnFlights, setReturnFlights] = useState<Flight[]>([]);
  const [isRoundTrip, setIsRoundTrip] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [fetchError, setFetchError] = useState(false);

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -340, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 340, behavior: 'smooth' });
    }
  };

  const fetchFlights = async (searchData: { origin: string; destination: string; nonStop: boolean; tripType: string }) => {
    setIsLoading(true);
    setHasSearched(true);
    setFetchError(false);

    const isRT = searchData.tripType === 'round-trip';
    setIsRoundTrip(isRT);

    try {
      const params = new URLSearchParams();
      if (searchData.origin) params.append("origin", searchData.origin);
      if (searchData.destination) params.append("destination", searchData.destination);
      if (searchData.nonStop) params.append("nonStop", "true");
      params.append("tripType", searchData.tripType);

      const response = await fetch(`/api/flights?${params.toString()}`);
      if (!response.ok) {
        throw new Error("API call failed");
      }
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

  const destinations = [
    { city: "Bangkok", tourCount: "1 tour", imageSrc: "/dest_bangkok_1772698690880.png" },
    { city: "Chicago", tourCount: "1 tour", imageSrc: "/dest_chicago_1772698708083.png" },
    { city: "London", tourCount: "1 tour", imageSrc: "/dest_london_1772698761495.png" },
    { city: "Singapore", tourCount: "1 tour", imageSrc: "/dest_singapore_1772698777298.png" },
    { city: "Paris", tourCount: "3 tours", imageSrc: "/dest_london_1772698761495.png" },
    { city: "Dubai", tourCount: "2 tours", imageSrc: "/dest_bangkok_1772698690880.png" },
    { city: "New York", tourCount: "4 tours", imageSrc: "/dest_chicago_1772698708083.png" },
    { city: "Tokyo", tourCount: "2 tours", imageSrc: "/dest_singapore_1772698777298.png" },
  ];

  return (
    <main id="main-content" className="min-h-screen bg-slate-50 flex flex-col overflow-x-hidden w-full max-w-full">
      <Navbar />
      <Hero>
        <FlightSearch onSearch={fetchFlights} />
      </Hero>

      {hasSearched ? (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 mb-12">
          {fetchError ? (
            <div className="text-center py-20 bg-white rounded-[1.5rem] shadow-sm border border-rose-100">
              <h3 className="text-[24px] font-[800] text-slate-800 mb-2">Data currently unavailable</h3>
              <p className="text-[16px] text-slate-500 font-medium">We could not load the flight data at this time. Please try again later.</p>
            </div>
          ) : (
            <div className={`grid gap-8 ${isRoundTrip ? 'grid-cols-1 xl:grid-cols-2' : 'grid-cols-1'}`}>
              <div>
                {isRoundTrip && <h3 className="text-xl font-bold text-slate-900 mb-6 bg-white p-4 rounded-xl border border-slate-100 shadow-sm inline-block">Outbound Flights</h3>}
                <FlightResults flights={flights} isLoading={isLoading} />
              </div>
              {isRoundTrip && (
                <div>
                  <h3 className="text-xl font-bold text-slate-900 mb-6 bg-white p-4 rounded-xl border border-slate-100 shadow-sm inline-block">Return Flights</h3>
                  <FlightResults flights={returnFlights} isLoading={isLoading} />
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        <>
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-12">
            <div className="text-center mb-10 mt-12">
              <h2 className="text-2xl font-bold text-primary tracking-widest uppercase mb-2 flex items-center justify-center gap-3 text-slate-600">
                <Logo />
                WHY CHOOSE US
              </h2>
              <div className="relative inline-block mt-1">
                <h3 className="text-2xl md:text-4xl lg:text-5xl font-extrabold text-slate-700 pb-3">
                  Making Your Journeys Simple, Safe, And Affordable
                </h3>
                {/* Red Curved Underline Fake SVG Graphic */}
                <RedUnderline />
              </div>
            </div>
          </div>

          {/* Why Choose Us 3 Cards Panel */}
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-[1200px] mb-16">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">

              {/* Card 1 */}
              <div className="flex bg-white rounded-[10px] border border-slate-200 overflow-hidden h-[140px] shadow-sm">
                <div className="w-[125px] bg-[#fbebef] flex items-center justify-center shrink-0">
                  <div className="relative w-20 h-20">
                    <ShieldIcon className="w-full h-full drop-shadow-sm" />
                    <div className="absolute inset-0 flex items-center justify-center top-[-3px]">
                      <CheckmarkIcon className="w-8 h-8" />
                    </div>
                  </div>
                </div>
                <div className="flex-1 px-5 py-3 flex flex-col justify-center bg-white">
                  <h4 className="text-[19px] font-bold text-[#333] mb-0.5 leading-tight tracking-[0.01em]">Best Price Gurantee</h4>
                  <p className="text-[16px] text-[#888] leading-[1.35]">
                    Lorem Ipsum Dolor Sit Amet Cotetur.
                    <br />
                    Tincidunt Curabitur Amet.
                  </p>
                </div>
              </div>

              {/* Card 2 */}
              <div className="flex bg-white rounded-[10px] border border-slate-200 overflow-hidden h-[140px] shadow-sm">
                <div className="w-[125px] bg-[#fbebef] flex items-center justify-center shrink-0">
                  <div className="relative w-16 h-16 flex flex-col items-center">
                    <div className="w-16 h-12 bg-[#8ca8ca] rounded-sm relative flex flex-col overflow-hidden shadow-inner">
                      <div className="h-[20px] w-full bg-[#df2d3b] flex items-center justify-around px-2 pt-0.5">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      </div>
                      <div className="flex-1 w-full bg-[#d0e1f9] flex items-center justify-center">
                        <span className="text-[7px] font-bold text-[#145b98] tracking-[0.1em] leading-none mt-0.5">BOOKING</span>
                      </div>
                    </div>
                    <div className="w-5 h-[3px] bg-slate-300"></div>
                    <div className="w-12 h-1.5 bg-[#8ca8ca] rounded-sm"></div>
                  </div>
                </div>
                <div className="flex-1 px-5 py-3 flex flex-col justify-center bg-white">
                  <h4 className="text-[19px] font-bold text-[#333] mb-0.5 leading-tight tracking-[0.01em]">Easy &amp; Quick Booking</h4>
                  <p className="text-[16px] text-[#888] leading-[1.35]">
                    Lorem Ipsum Dolor Sit Amet Cotetur.
                    <br />
                    Tincidunt Curabitur Amet.
                  </p>
                </div>
              </div>

              {/* Card 3 */}
              <div className="flex bg-white rounded-[10px] border border-slate-200 overflow-hidden h-[140px] shadow-sm">
                <div className="w-[125px] bg-[#fbebef] flex items-center justify-center shrink-0">
                  <div className="relative w-[68px] h-[68px]">
                    <SupportClockIcon className="w-full h-full drop-shadow-sm" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-[#df2d3b] font-black text-[18px] ml-[3px] mt-[4px] transform -rotate-12 leading-none">24<span className="text-[10px]">/7</span></span>
                    </div>
                    <div className="absolute top-[-5px] right-[-8px]">
                      <HeadsetIcon className="w-[32px] h-[32px] rounded-full bg-white p-[3px] shadow-sm" />
                    </div>
                  </div>
                </div>
                <div className="flex-1 px-5 py-3 flex flex-col justify-center bg-white">
                  <h4 className="text-[19px] font-bold text-[#333] mb-0.5 leading-tight tracking-[0.01em]">Customer Care 24/7</h4>
                  <p className="text-[16px] text-[#888] leading-[1.35]">
                    Lorem Ipsum Dolor Sit Amet Cotetur.
                    <br />
                    Tincidunt Curabitur Amet.
                  </p>
                </div>
              </div>

            </div>
          </div>

          {/* Promotional Banner */}
          <PromoBanner />

          {/* Popular Destinations Grid Section */}
          <section className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-[1200px] pt-12 pb-4 mb-20">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-10">
              <div className="relative">
                <h2 className="text-2xl font-semibold text-primary text-slate-700 tracking-widest uppercase mb-6 flex items-center gap-2">
                  <Logo />
                  POPULAR DESTINATIONS
                </h2>
                <div className="relative inline-block">
                  <h3 className="text-2xl sm:text-3xl md:text-[42px] font-extrabold text-slate-700 leading-tight">
                    Discover Your Next Dream Destination
                  </h3>
                  <RedUnderline />
                </div>
              </div>

              <div className="hidden sm:flex gap-4">
                <button
                  onClick={scrollLeft}
                  aria-label="Scroll left"
                  className="w-12 h-12 rounded-full border border-slate-200 flex items-center justify-center text-slate-400 bg-slate-50 hover:bg-slate-200 transition-colors shadow-sm"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={scrollRight}
                  aria-label="Scroll right"
                  className="w-12 h-12 rounded-full border border-primary flex items-center justify-center text-white bg-primary hover:bg-primary/90 transition-colors shadow-md shadow-primary/20"
                >
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Carousel Container */}
            <div className="relative group w-full overflow-hidden">
              <div
                ref={scrollContainerRef}
                className="flex overflow-x-auto scrollbar-hide snap-x snap-mandatory gap-6 pb-6 pt-2 transition-all duration-300 px-4 sm:px-0"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                {destinations.map((dest, i) => (
                  <div
                    key={i}
                    className="min-w-[85vw] sm:min-w-[290px] snap-start shrink-0"
                  >
                    <DestinationCard
                      city={dest.city}
                      tourCount={dest.tourCount}
                      imageSrc={dest.imageSrc}
                      href={`/destinations/${dest.city.toLowerCase().replace(" ", "-")}`}
                    />
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Footer Implementation */}
          <Footer />
        </>
      )}
    </main>
  );
}
