"use client";

import { useRef } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { FlightSearch } from "@/components/FlightSearch";
import { SearchLoadingModal } from "@/components/SearchLoadingModal";
import { PromoBanner } from "@/components/PromoBanner";
import { DestinationCard } from "@/components/DestinationCard";
import { PopularFlights } from "@/components/PopularFlights";
import { Footer } from "@/components/Footer";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { RedUnderline } from "@/components/ui/red-underline";
import { ShieldIcon, CheckmarkIcon, SupportClockIcon, HeadsetIcon } from "@/components/icons";

export default function Home() {
  const router = useRouter();
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

  const handleSearch = (searchData: { origin: string; destination: string; nonStop: boolean; travellers: any; cabin: string; tripType: string }) => {
    const params = new URLSearchParams();
    params.set("origin", searchData.origin);
    params.set("destination", searchData.destination);
    if (searchData.nonStop) params.set("nonStop", "true");
    params.set("tripType", searchData.tripType);
    const totalPax = (searchData.travellers?.adults || 1) + (searchData.travellers?.children || 0) + (searchData.travellers?.infants || 0);
    params.set("passengers", String(totalPax));
    params.set("cabin", searchData.cabin || "Economy");
    router.push(`/search?${params.toString()}`);
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
        <FlightSearch onSearch={handleSearch} />
      </Hero>

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

      {/* Popular Flights Section */}
      <PopularFlights />

      {/* Footer Implementation */}
      <Footer />
    </main>
  );
}
