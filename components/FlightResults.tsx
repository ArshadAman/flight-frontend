"use client";

import React, { useState, useMemo } from "react";
import { 
  ChevronDown, 
  ChevronUp, 
  SlidersHorizontal, 
  Wifi, 
  Coffee, 
  Plug, 
  Accessibility, 
  Clock, 
  PlaneTakeoff,
  ArrowUpRight
} from "lucide-react";
import { usePathname } from "next/navigation";
import { QuoteModal } from "./QuoteModal";
import { FareTypeModal } from "./FareTypeModal";
import { AddOnModal } from "./AddOnModal";
import { RulesModal } from "./RulesModal";
import { cn } from "@/lib/utils";

export type Flight = {
  id: string;
  airline: string;
  origin: string;
  destination: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  price: number;
  stops: number;
};

interface FlightResultsProps {
  flights: Flight[];
  returnFlights?: Flight[];
  isRoundTrip?: boolean;
  isLoading: boolean;
}

export function FlightResults({ 
  flights, 
  returnFlights = [], 
  isRoundTrip = false, 
  isLoading 
}: FlightResultsProps) {
  
  // Real-time interactive filter states
  const [nonStopOnly, setNonStopOnly] = useState(false);
  const [fareType, setFareType] = useState("PUB");
  const [maxPrice, setMaxPrice] = useState(12000);
  const [selectedStops, setSelectedStops] = useState<{ [key: number]: boolean }>({
    0: true,
    1: true,
    2: true
  });
  const [activeSort, setActiveSort] = useState("Recommended");
  const [sortOpen, setSortOpen] = useState(false);
  const [quoteModalOpen, setQuoteModalOpen] = useState(false);
  const [fareTypeModalOpen, setFareTypeModalOpen] = useState(false);
  const [addOnModalOpen, setAddOnModalOpen] = useState(false);
  const [rulesModalOpen, setRulesModalOpen] = useState(false);
  const [selectedOutboundId, setSelectedOutboundId] = useState<string | null>(null);
  const [selectedReturnId, setSelectedReturnId] = useState<string | null>(null);

  const pathname = usePathname();
  const isB2bRoute = pathname?.startsWith('/b2b');

  // Accordion active state trackers
  const [filtersOpen, setFiltersOpen] = useState({
    general: true,
    baggage: false,
    fareType: true,
    ticketLimit: false,
    maxTime: false,
    price: true,
    stops: true,
    equipment: false,
    times: false
  });

  const toggleFilter = (key: keyof typeof filtersOpen) => {
    setFiltersOpen(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleStopToggle = (stopCount: number) => {
    setSelectedStops(prev => ({
      ...prev,
      [stopCount]: !prev[stopCount]
    }));
  };

  // Helper to filter and sort list of flights dynamically
  const processFlights = (flightList: Flight[]) => {
    let result = [...flightList];

    // 1. Non-stop filter
    if (nonStopOnly) {
      result = result.filter(f => f.stops === 0);
    }

    // 2. Stops selection filter
    result = result.filter(f => {
      if (f.stops === 0 && !selectedStops[0]) return false;
      if (f.stops === 1 && !selectedStops[1]) return false;
      if (f.stops >= 2 && !selectedStops[2]) return false;
      return true;
    });

    // 3. Price slider filter
    result = result.filter(f => f.price <= maxPrice);

    // 4. Dynamic sorting
    if (activeSort === "Cheapest") {
      result.sort((a, b) => a.price - b.price);
    } else if (activeSort === "Fastest") {
      // Sort simple duration approximation (e.g. 2h 15m)
      const getMins = (dur: string) => {
        const parts = dur.match(/\d+/g);
        if (!parts) return 999;
        const hrs = parseInt(parts[0]) || 0;
        const mins = parseInt(parts[1]) || 0;
        return hrs * 60 + mins;
      };
      result.sort((a, b) => getMins(a.duration) - getMins(b.duration));
    } else if (activeSort === "Price: Low to High") {
      result.sort((a, b) => a.price - b.price);
    }

    return result;
  };

  const filteredOutbound = useMemo(() => processFlights(flights), [flights, nonStopOnly, selectedStops, maxPrice, activeSort]);
  const filteredReturn = useMemo(() => processFlights(returnFlights), [returnFlights, nonStopOnly, selectedStops, maxPrice, activeSort]);

  if (isLoading) {
    return (
      <div className="w-full flex justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (flights.length === 0) {
    return (
      <div className="w-full text-center py-16 bg-white rounded-3xl shadow-sm border border-slate-100 p-8">
        <h3 className="text-xl font-bold text-slate-700">No flights found</h3>
        <p className="text-slate-500 mt-2">Try adjusting your search criteria</p>
      </div>
    );
  }

  // Common flight list renderer
  const renderFlightCards = (flightList: Flight[], isReturnFlight: boolean, title?: string) => {
    if (flightList.length === 0) {
      return (
        <div className="w-full text-center py-12 bg-white border border-slate-200 rounded-2xl mb-6">
          <p className="text-slate-400 font-bold text-sm">No matches found for current filter selections.</p>
        </div>
      );
    }

    const currentSelectedId = isReturnFlight ? selectedReturnId : selectedOutboundId;
    const setCurrentSelectedId = isReturnFlight ? setSelectedReturnId : setSelectedOutboundId;

    return (
      <div className="flex flex-col gap-6">
        {title && (
          <h3 className="text-xl font-bold text-[#0B132B] mb-2 bg-white px-5 py-3.5 rounded-xl border border-slate-100 shadow-sm inline-block self-start">
            {title}
          </h3>
        )}

        {flightList.map((flight) => {
          const taxAmount = Math.round(flight.price * 0.15);
          
          // Determine mock legs for segments display (if stops > 0, show 2 connected rows!)
          const segmentsCount = flight.stops > 0 ? 2 : 1;
          const segments = Array.from({ length: segmentsCount }).map((_, sIdx) => {
            const isSecondLeg = sIdx === 1;
            return {
              code: isSecondLeg ? `AI-${flight.id.split('-').pop() || '102'}` : flight.id,
              date: "Wed, 01 Oct 25",
              route: isSecondLeg 
                ? `${flight.destination.substring(0, 3).toUpperCase()} ➔ ${flight.origin.substring(0, 3).toUpperCase()}`
                : `${flight.origin.substring(0, 3).toUpperCase()} ➔ ${flight.destination.substring(0, 3).toUpperCase()}`,
              class: "E1/Economy",
              timing: isSecondLeg ? "11:30PM - 02:15AM" : `${flight.departureTime} - ${flight.arrivalTime}`,
              duration: flight.duration,
              seatsCode: isSecondLeg ? "0/32N" : `${sIdx}/32N`
            };
          });

          return (
            <div 
              key={flight.id}
              className="bg-white border border-slate-200 rounded-2xl shadow-[0_4px_16px_rgba(0,0,0,0.02)] overflow-hidden hover:shadow-md transition-shadow duration-300"
            >
              
              {/* Horizontal Top Header Row (Figma specs: Light blue-grey background) */}
              <div className="bg-[#EEF2F7] px-6 py-4 flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 select-none">
                
                {/* Price block */}
                <div className="flex items-baseline">
                  <span className="text-[#0B132B] font-[900] text-[25px] tracking-tight">
                    ₹{flight.price.toLocaleString('en-IN')}
                  </span>
                  <span className="text-[12px] font-[750] text-[#6B7280] ml-2 tracking-wide uppercase">
                    Incl. ₹{taxAmount.toLocaleString('en-IN')} tax
                  </span>
                </div>

                {/* Airline Name */}
                <div className="text-primary italic font-[1000] text-[21px] tracking-widest leading-none drop-shadow-[0_1px_1px_rgba(223,27,36,0.15)]">
                  {flight.airline.toUpperCase()}
                </div>

                {/* Stop Indicator */}
                <div className="text-slate-600 text-[14px] font-[800] tracking-wide uppercase bg-slate-200/60 px-3 py-1 rounded-md">
                  {flight.stops === 0 ? "Non-Stop" : `Stops: ${flight.stops}`}
                </div>

                {/* Right aligned Badges */}
                <div className="flex items-center gap-2 shrink-0">
                  {/* PUB Badge */}
                  <span className="bg-[#1D70B8] text-white text-[11px] font-[900] px-2.5 py-1 rounded select-none tracking-wider">
                    PUB
                  </span>
                  
                  {/* Suitcase Baggage Badge */}
                  <span className="bg-[#DF1B24] text-white text-[11px] font-[900] px-2.5 py-1 rounded select-none tracking-wider flex items-center gap-1">
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M20 7H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7V5a3 3 0 00-6 0v2" />
                    </svg>
                    25K
                  </span>

                  {/* TKT Badge */}
                  <span className="border border-slate-300 text-slate-500 bg-white text-[11px] font-[800] px-2 py-0.5 rounded select-none">
                    FARE TYPES
                  </span>
                  <span className="border border-slate-300 text-slate-500 bg-white text-[11px] font-[800] px-2 py-0.5 rounded select-none">FEE</span>
                </div>

              </div>

              {/* White Body Segment list */}
              <div className="flex flex-col bg-white">
                {segments.map((seg, sIdx) => (
                  <div 
                    key={sIdx}
                    onClick={() => {
                      if (isB2bRoute) {
                        setCurrentSelectedId(flight.id);
                      }
                    }}
                    className="grid grid-cols-[auto_1fr_1.1fr_1.1fr_1fr] md:grid-cols-[40px_1fr_1.5fr_1.8fr_1fr_1.2fr_auto] gap-4 items-center px-6 py-4 border-b border-slate-100 hover:bg-slate-50/60 transition-colors last:border-b-0 cursor-pointer"
                  >
                    
                    {/* Radio circle selector */}
                    <div className="flex justify-center items-center">
                      <div 
                        className={cn("w-5 h-5 rounded-full border flex items-center justify-center transition-colors", currentSelectedId === flight.id ? "border-[#DE0A26]" : "border-slate-300")}
                      >
                        <div className={cn("w-2.5 h-2.5 rounded-full transition-colors", currentSelectedId === flight.id ? "bg-[#DE0A26]" : "bg-transparent")}></div>
                      </div>
                    </div>

                    {/* Flight identifier */}
                    <div className="flex flex-col min-w-[70px]">
                      <span className="text-[15px] font-[900] text-slate-800">{seg.code}</span>
                      <span className="text-[12px] font-bold text-slate-400 mt-0.5">{seg.date}</span>
                    </div>

                    {/* Route */}
                    <div className="flex flex-col min-w-[90px]">
                      <span className="text-[15px] font-[900] text-slate-800">{seg.route}</span>
                      <span className="text-[12px] font-bold text-slate-400 mt-0.5">{seg.class}</span>
                    </div>

                    {/* Times */}
                    <div className="flex flex-col min-w-[130px]">
                      <span className="text-[15px] font-[900] text-slate-800 tracking-tight">{seg.timing}</span>
                      <span className="text-[12px] font-bold text-slate-400 mt-0.5">Dep. Times</span>
                    </div>

                    {/* Duration */}
                    <div className="flex flex-col min-w-[70px]">
                      <span className="text-[15px] font-[900] text-slate-800">{seg.duration}</span>
                      <span className="text-[12px] font-bold text-slate-400 mt-0.5">Flight Time</span>
                    </div>

                    {/* Seats Left */}
                    <div className="flex flex-col min-w-[60px]">
                      <span className="text-[15px] font-[900] text-slate-800">{seg.seatsCode}</span>
                      <span className="text-[12px] font-bold text-[#FF6B00] mt-0.5">Seats Left</span>
                    </div>

                    {/* Amenities block */}
                    <div className="flex items-center gap-2.5 text-slate-400 pl-4 border-l border-slate-100 h-8">
                      <Accessibility className="w-4 h-4 hover:text-slate-600 cursor-help transition-colors" strokeWidth={2.5} />
                      <Plug className="w-4 h-4 hover:text-slate-600 cursor-help transition-colors" strokeWidth={2.5} />
                      <Wifi className="w-4 h-4 hover:text-slate-600 cursor-help transition-colors" strokeWidth={2.5} />
                      <Coffee className="w-4 h-4 hover:text-slate-600 cursor-help transition-colors" strokeWidth={2.5} />
                    </div>

                  </div>
                ))}
              </div>

              {/* Action Bar when selected */}
              {currentSelectedId === flight.id && isB2bRoute && (
                <div className="bg-[#FBEBEF] px-6 py-4 flex flex-wrap items-center gap-4 border-t border-[#f4d9df] animate-in slide-in-from-top-1 fade-in duration-200">
                  <button 
                    onClick={() => window.location.href = '/b2b/book'} 
                    className="bg-[#DE0A26] hover:bg-[#C1161E] text-white rounded-[100px] px-8 h-[40px] font-bold text-[14px] flex items-center justify-center gap-2 shadow-sm transition-transform active:scale-95"
                  >
                    Book Now <ArrowUpRight className="w-4 h-4" strokeWidth={3} />
                  </button>
                  <button 
                    onClick={() => setQuoteModalOpen(true)} 
                    className="min-w-[120px] border border-[#102A4A] bg-transparent text-[#102A4A] rounded-[100px] px-6 h-[40px] font-bold text-[14px] hover:bg-white/50 transition-colors shadow-sm"
                  >
                    Quote
                  </button>
                  <button 
                    onClick={() => setFareTypeModalOpen(true)} 
                    className="min-w-[120px] border border-[#102A4A] bg-transparent text-[#102A4A] rounded-[100px] px-6 h-[40px] font-bold text-[14px] hover:bg-white/50 transition-colors shadow-sm"
                  >
                    Fare Type
                  </button>
                  <button 
                    onClick={() => setAddOnModalOpen(true)} 
                    className="min-w-[120px] border border-[#102A4A] bg-transparent text-[#102A4A] rounded-[100px] px-6 h-[40px] font-bold text-[14px] hover:bg-white/50 transition-colors shadow-sm"
                  >
                    Add On
                  </button>
                  <button 
                    onClick={() => setRulesModalOpen(true)} 
                    className="min-w-[120px] border border-[#102A4A] bg-transparent text-[#102A4A] rounded-[100px] px-6 h-[40px] font-bold text-[14px] hover:bg-white/50 transition-colors shadow-sm"
                  >
                    Rules
                  </button>
                </div>
              )}

            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 w-full max-w-[1440px] mx-auto select-none mt-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
      
      {/* Left Column: Accordion Filters Panel */}
      <aside className="w-full lg:w-[285px] shrink-0">
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5 flex flex-col sticky top-24">
          
          <div className="flex items-center gap-2 text-[17px] font-[900] text-[#0B132B] pb-4 border-b border-slate-100 mb-2">
            <SlidersHorizontal className="w-4.5 h-4.5 text-primary stroke-[2.5px]" />
            <span>Filters :</span>
          </div>

          <div className="flex flex-col">
            
            {/* General */}
            <div className="border-b border-slate-100 py-3">
              <button 
                onClick={() => toggleFilter('general')}
                className="w-full flex items-center justify-between text-[15px] font-[750] text-[#0B132B] py-1"
              >
                <span>General</span>
                {filtersOpen.general ? <ChevronUp className="w-4.5 h-4.5 text-slate-400" /> : <ChevronDown className="w-4.5 h-4.5 text-slate-400" />}
              </button>
              {filtersOpen.general && (
                <div className="mt-3 flex flex-col gap-2.5 px-1 animate-in fade-in duration-200">
                  <label className="flex items-center gap-2.5 cursor-pointer text-sm font-semibold text-slate-600 hover:text-slate-800">
                    <input 
                      type="checkbox" 
                      checked={nonStopOnly}
                      onChange={(e) => setNonStopOnly(e.target.checked)}
                      className="rounded border-slate-300 text-primary focus:ring-primary w-4.5 h-4.5" 
                    />
                    <span>Non-stop flights only</span>
                  </label>
                </div>
              )}
            </div>

            {/* Baggage */}
            <div className="border-b border-slate-100 py-3">
              <button 
                onClick={() => toggleFilter('baggage')}
                className="w-full flex items-center justify-between text-[15px] font-[750] text-[#0B132B] py-1"
              >
                <span>Baggage</span>
                {filtersOpen.baggage ? <ChevronUp className="w-4.5 h-4.5 text-slate-400" /> : <ChevronDown className="w-4.5 h-4.5 text-slate-400" />}
              </button>
              {filtersOpen.baggage && (
                <div className="mt-3 flex flex-col gap-2 px-1 animate-in fade-in duration-200">
                  <label className="flex items-center gap-2.5 cursor-pointer text-sm font-semibold text-slate-600">
                    <input type="checkbox" className="rounded border-slate-300 text-primary w-4.5 h-4.5" />
                    <span>Cabin Baggage Included</span>
                  </label>
                </div>
              )}
            </div>

            {/* Fare type */}
            <div className="border-b border-slate-100 py-3">
              <button 
                onClick={() => toggleFilter('fareType')}
                className="w-full flex items-center justify-between text-[15px] font-[750] text-[#0B132B] py-1"
              >
                <span>Fare type</span>
                {filtersOpen.fareType ? <ChevronUp className="w-4.5 h-4.5 text-slate-400" /> : <ChevronDown className="w-4.5 h-4.5 text-slate-400" />}
              </button>
              {filtersOpen.fareType && (
                <div className="mt-3 flex flex-col gap-2.5 px-1 animate-in fade-in duration-200">
                  <label className="flex items-center gap-2.5 cursor-pointer text-sm font-semibold text-slate-600">
                    <input 
                      type="radio" 
                      name="fareType" 
                      checked={fareType === "PUB"} 
                      onChange={() => setFareType("PUB")}
                      className="text-primary focus:ring-primary w-4 h-4" 
                    />
                    <span>Public Fare (PUB)</span>
                  </label>
                  <label className="flex items-center gap-2.5 cursor-pointer text-sm font-semibold text-slate-600">
                    <input 
                      type="radio" 
                      name="fareType" 
                      checked={fareType === "CORP"} 
                      onChange={() => setFareType("CORP")}
                      className="text-primary focus:ring-primary w-4 h-4" 
                    />
                    <span>Corporate Fare</span>
                  </label>
                </div>
              )}
            </div>

            {/* Ticket time limit */}
            <div className="border-b border-slate-100 py-3">
              <button 
                onClick={() => toggleFilter('ticketLimit')}
                className="w-full flex items-center justify-between text-[15px] font-[750] text-[#0B132B] py-1"
              >
                <span>Ticket time limit</span>
                {filtersOpen.ticketLimit ? <ChevronUp className="w-4.5 h-4.5 text-slate-400" /> : <ChevronDown className="w-4.5 h-4.5 text-slate-400" />}
              </button>
              {filtersOpen.ticketLimit && (
                <div className="mt-3 text-xs font-semibold text-slate-400 px-1 animate-in fade-in duration-200">
                  Filter by ticket timings.
                </div>
              )}
            </div>

            {/* Max. time travel */}
            <div className="border-b border-slate-100 py-3">
              <button 
                onClick={() => toggleFilter('maxTime')}
                className="w-full flex items-center justify-between text-[15px] font-[750] text-[#0B132B] py-1"
              >
                <span>Max. time travel</span>
                {filtersOpen.maxTime ? <ChevronUp className="w-4.5 h-4.5 text-slate-400" /> : <ChevronDown className="w-4.5 h-4.5 text-slate-400" />}
              </button>
              {filtersOpen.maxTime && (
                <div className="mt-3 text-xs font-semibold text-slate-400 px-1 animate-in fade-in duration-200">
                  Filter by travel limits.
                </div>
              )}
            </div>

            {/* Price */}
            <div className="border-b border-slate-100 py-3">
              <button 
                onClick={() => toggleFilter('price')}
                className="w-full flex items-center justify-between text-[15px] font-[750] text-[#0B132B] py-1"
              >
                <span>Price</span>
                {filtersOpen.price ? <ChevronUp className="w-4.5 h-4.5 text-slate-400" /> : <ChevronDown className="w-4.5 h-4.5 text-slate-400" />}
              </button>
              {filtersOpen.price && (
                <div className="mt-3 flex flex-col px-1 animate-in fade-in duration-200">
                  <input 
                    type="range" 
                    min="3000" 
                    max="10000" 
                    value={maxPrice} 
                    onChange={(e) => setMaxPrice(parseInt(e.target.value))}
                    className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary" 
                  />
                  <div className="flex justify-between text-xs font-bold text-slate-500 mt-2">
                    <span>₹3,000</span>
                    <span>Max: ₹{maxPrice.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              )}
            </div>

            {/* No. of stops */}
            <div className="border-b border-slate-100 py-3">
              <button 
                onClick={() => toggleFilter('stops')}
                className="w-full flex items-center justify-between text-[15px] font-[750] text-[#0B132B] py-1"
              >
                <span>No. of stops</span>
                {filtersOpen.stops ? <ChevronUp className="w-4.5 h-4.5 text-slate-400" /> : <ChevronDown className="w-4.5 h-4.5 text-slate-400" />}
              </button>
              {filtersOpen.stops && (
                <div className="mt-3 flex flex-col gap-2.5 px-1 animate-in fade-in duration-200">
                  <label className="flex items-center gap-2.5 cursor-pointer text-sm font-semibold text-slate-600">
                    <input 
                      type="checkbox" 
                      checked={selectedStops[0]} 
                      onChange={() => handleStopToggle(0)}
                      className="rounded border-slate-300 text-primary w-4.5 h-4.5" 
                    />
                    <span>Non-Stop</span>
                  </label>
                  <label className="flex items-center gap-2.5 cursor-pointer text-sm font-semibold text-slate-600">
                    <input 
                      type="checkbox" 
                      checked={selectedStops[1]} 
                      onChange={() => handleStopToggle(1)}
                      className="rounded border-slate-300 text-primary w-4.5 h-4.5" 
                    />
                    <span>1 Stop</span>
                  </label>
                  <label className="flex items-center gap-2.5 cursor-pointer text-sm font-semibold text-slate-600">
                    <input 
                      type="checkbox" 
                      checked={selectedStops[2]} 
                      onChange={() => handleStopToggle(2)}
                      className="rounded border-slate-300 text-primary w-4.5 h-4.5" 
                    />
                    <span>2+ Stops</span>
                  </label>
                </div>
              )}
            </div>

            {/* Equipment */}
            <div className="border-b border-slate-100 py-3">
              <button 
                onClick={() => toggleFilter('equipment')}
                className="w-full flex items-center justify-between text-[15px] font-[750] text-[#0B132B] py-1"
              >
                <span>Equipment</span>
                {filtersOpen.equipment ? <ChevronUp className="w-4.5 h-4.5 text-slate-400" /> : <ChevronDown className="w-4.5 h-4.5 text-slate-400" />}
              </button>
              {filtersOpen.equipment && (
                <div className="mt-3 text-xs font-semibold text-slate-400 px-1 animate-in fade-in duration-200">
                  Filter by airplane model.
                </div>
              )}
            </div>

            {/* Departure & arrival time */}
            <div className="py-3">
              <button 
                onClick={() => toggleFilter('times')}
                className="w-full flex items-center justify-between text-[15px] font-[750] text-[#0B132B] py-1"
              >
                <span>Departure & arrival time</span>
                {filtersOpen.times ? <ChevronUp className="w-4.5 h-4.5 text-slate-400" /> : <ChevronDown className="w-4.5 h-4.5 text-slate-400" />}
              </button>
              {filtersOpen.times && (
                <div className="mt-3 text-xs font-semibold text-slate-400 px-1 animate-in fade-in duration-200">
                  Configure specific hours.
                </div>
              )}
            </div>

          </div>
        </div>
      </aside>

      {/* Right Column: Search Results */}
      <section className="flex-1 flex flex-col">
        
        {/* Results Header */}
        <div className="flex justify-between items-center mb-6">
          <p className="text-[17px] font-[800] text-slate-700">
            Showing <span className="text-primary font-black">{filteredOutbound.length + (isRoundTrip ? filteredReturn.length : 0)}</span> of <span className="text-primary font-black">{flights.length + (isRoundTrip ? returnFlights.length : 0)} flights</span>
          </p>

          {/* Sort Menu */}
          <div className="relative">
            <button 
              onClick={() => setSortOpen(!sortOpen)}
              className="flex items-center gap-1.5 text-[15px] font-[750] text-slate-700 bg-white border border-slate-200 rounded-xl px-4 py-2 hover:bg-slate-50 transition shadow-sm"
            >
              <span>Sort by: <span className="text-[#0B132B] font-[900]">{activeSort}</span></span>
              <ChevronDown className="w-4 h-4 text-slate-400" />
            </button>
            {sortOpen && (
              <div className="absolute right-0 mt-1.5 w-52 bg-white border border-slate-200 rounded-xl shadow-lg py-2 z-40 animate-in fade-in slide-in-from-top-1 duration-150">
                {['Recommended', 'Cheapest', 'Fastest', 'Price: Low to High'].map((opt) => (
                  <button
                    key={opt}
                    onClick={() => {
                      setActiveSort(opt);
                      setSortOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-sm font-semibold hover:bg-slate-50 transition-colors ${activeSort === opt ? 'text-primary' : 'text-slate-600'}`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Flight Lists Grid */}
        <div className="flex flex-col gap-8">
          
          {/* Outbound Flights list */}
          {renderFlightCards(filteredOutbound, false, isRoundTrip ? "Outbound Flights" : undefined)}

          {/* Return Flights list */}
          {isRoundTrip && renderFlightCards(filteredReturn, true, "Return Flights")}

        </div>

      </section>

      {/* Render QuoteModal for B2B */}
      <QuoteModal isOpen={quoteModalOpen} onClose={() => setQuoteModalOpen(false)} />
      
      {/* Render Additional Info Modals for B2B */}
      <FareTypeModal isOpen={fareTypeModalOpen} onClose={() => setFareTypeModalOpen(false)} />
      <AddOnModal isOpen={addOnModalOpen} onClose={() => setAddOnModalOpen(false)} />
      <RulesModal isOpen={rulesModalOpen} onClose={() => setRulesModalOpen(false)} />

    </div>
  );
}
