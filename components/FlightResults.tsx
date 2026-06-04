"use client";

import React, { useState, useMemo, useCallback, useEffect } from "react";
import {
  ChevronDown,
  ChevronUp,
  SlidersHorizontal,
  Wifi,
  Coffee,
  Plug,
  Accessibility,
  ArrowUpRight,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { QuoteModal } from "./QuoteModal";
import { FareTypeModal } from "./FareTypeModal";
import AddOnModal, { BaggageOption as AddOnBaggage } from "./AddOnModal";
import { RulesModal } from "./RulesModal";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { DEPARTURE_TIME_SLOTS } from "@/lib/flightSearch";
import type { Flight } from "@/lib/flight";
import { saveBookingDraft, type BookingDraft } from "@/lib/booking";

export type { Flight };

interface FlightResultsProps {
  flights: Flight[];
  returnFlights?: Flight[];
  isRoundTrip?: boolean;
  isLoading: boolean;
  adults?: number;
  children?: number;
  infants?: number;
  initialNonStop?: boolean;
  initialBaggageFares?: boolean;
  initialFareType?: "ALL" | "PUB" | "CORP" | "STU" | "DEF";
  initialAirlineCode?: string;
  searchOrigin?: string;
  searchDestination?: string;
  departureDate?: string;
  returnDate?: string;
  cabin?: string;
  tripType?: string;
}

type BaggageOption = {
  id: string;
  title: string;
  description: string;
  price: string;
  note?: string;
};

export function FlightResults({
  flights,
  returnFlights = [],
  isRoundTrip = false,
  isLoading,
  adults = 1,
  children = 0,
  infants = 0,
  initialNonStop = false,
  initialBaggageFares = false,
  initialAirlineCode,
  initialFareType = "ALL",
  searchOrigin = "",
  searchDestination = "",
  departureDate = "",
  returnDate = "",
  cabin = "Economy",
  tripType = "one-way",
}: FlightResultsProps) {

  const { user, openAuthModal } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const isB2bRoute = pathname?.startsWith("/b2b");

  const allFlights = useMemo(() => [...flights, ...returnFlights], [flights, returnFlights]);

  const priceBounds = useMemo(() => {
    const prices = allFlights.map((f) => f.price);
    if (prices.length === 0) return { min: 0, max: 15000 };
    return { min: Math.min(...prices), max: Math.max(...prices) };
  }, [allFlights]);

  const availableAirlines = useMemo(() => {
    const map = new Map<string, string>();
    allFlights.forEach((f) => {
      const code = f.airline_code || f.id.split("-")[0];
      if (code) map.set(code, f.airline);
    });
    return Array.from(map.entries()).map(([code, name]) => ({ code, name }));
  }, [allFlights]);

  const availableEquipment = useMemo(() => {
    const set = new Set<string>();
    allFlights.forEach((f) => {
      if (f.equipment) set.add(f.equipment);
    });
    return Array.from(set);
  }, [allFlights]);

  const maxDurationBound = useMemo(() => {
    const durations = allFlights.map((f) => f.duration_minutes ?? 180);
    if (durations.length === 0) return 480;
    return Math.max(...durations, 180);
  }, [allFlights]);

  // Real-time interactive filter states
  const [nonStopOnly, setNonStopOnly] = useState(initialNonStop);
  const [baggageOnly, setBaggageOnly] = useState(initialBaggageFares);
  const [fareType, setFareType] = useState<"ALL" | "PUB" | "CORP" | "STU" | "DEF">(initialFareType);
  const [maxPrice, setMaxPrice] = useState(priceBounds.max);
  const [minPrice, setMinPrice] = useState(priceBounds.min);
  const [maxDurationMinutes, setMaxDurationMinutes] = useState(maxDurationBound);

  useEffect(() => {
    if (initialFareType) {
      setFareType(initialFareType);
    }
  }, [initialFareType]);

  const handleFareTypeChange = (newType: "ALL" | "PUB" | "CORP" | "STU" | "DEF") => {
    setFareType(newType);
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      params.delete("studentFare");
      params.delete("defenceFare");
      params.delete("corporateFare");

      if (newType === "STU") {
        params.set("studentFare", "true");
      } else if (newType === "DEF") {
        params.set("defenceFare", "true");
      } else if (newType === "CORP") {
        params.set("corporateFare", "true");
      }

      router.push(`${pathname}?${params.toString()}`);
    }
  };
  const [maxTicketHours, setMaxTicketHours] = useState(48);
  const [selectedStops, setSelectedStops] = useState<{ [key: number]: boolean }>({
    0: true,
    1: true,
    2: true,
  });
  const [selectedAirlines, setSelectedAirlines] = useState<Record<string, boolean>>({});
  const [selectedEquipment, setSelectedEquipment] = useState<Record<string, boolean>>({});
  const [selectedDepartureSlots, setSelectedDepartureSlots] = useState<Record<string, boolean>>({
    early: true,
    morning: true,
    afternoon: true,
    evening: true,
  });
  const [selectedArrivalSlots, setSelectedArrivalSlots] = useState<Record<string, boolean>>({
    early: true,
    morning: true,
    afternoon: true,
    evening: true,
  });

  useEffect(() => {
    setMaxPrice(priceBounds.max);
    setMinPrice(priceBounds.min);
  }, [priceBounds.max, priceBounds.min]);

  useEffect(() => {
    setMaxDurationMinutes(maxDurationBound);
  }, [maxDurationBound]);

  useEffect(() => {
    if (initialAirlineCode) {
      setSelectedAirlines({ [initialAirlineCode]: true });
    } else if (availableAirlines.length) {
      const all: Record<string, boolean> = {};
      availableAirlines.forEach((a) => {
        all[a.code] = true;
      });
      setSelectedAirlines(all);
    }
  }, [initialAirlineCode, availableAirlines]);

  useEffect(() => {
    if (availableEquipment.length) {
      const all: Record<string, boolean> = {};
      availableEquipment.forEach((eq) => {
        all[eq] = true;
      });
      setSelectedEquipment(all);
    }
  }, [availableEquipment]);
  const [activeSort, setActiveSort] = useState("Recommended");
  const [sortOpen, setSortOpen] = useState(false);
  const [quoteModalOpen, setQuoteModalOpen] = useState(false);
  const [fareTypeModalOpen, setFareTypeModalOpen] = useState(false);
  const [addOnModalOpen, setAddOnModalOpen] = useState(false);
  const [rulesModalOpen, setRulesModalOpen] = useState(false);
  const [selectedBaggageOption, setSelectedBaggageOption] = useState<AddOnBaggage | null>(null);
  const [selectedOutbound, setSelectedOutbound] = useState<Flight | null>(null);
  const [selectedReturn, setSelectedReturn] = useState<Flight | null>(null);
  const [selectionError, setSelectionError] = useState<string | null>(null);

  // Accordion active state trackers
  const [filtersOpen, setFiltersOpen] = useState({
    general: true,
    airlines: true,
    baggage: true,
    fareType: true,
    ticketLimit: true,
    maxTime: true,
    price: true,
    stops: true,
    equipment: true,
    times: true,
  });

  const toggleFilter = (key: keyof typeof filtersOpen) => {
    setFiltersOpen(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const resolveBaggageDetails = (option: BaggageOption | null) => {
    if (!option) {
      return {
        baggage_check_in: undefined,
        baggage_hand: undefined,
        selected_baggage_title: undefined,
        selected_baggage_price: undefined,
      };
    }

    if (option.id.startsWith("cabin")) {
      return {
        baggage_check_in: undefined,
        baggage_hand: option.title,
        selected_baggage_title: option.title,
        selected_baggage_price: option.price,
      };
    }

    if (option.id.startsWith("child") || option.id.startsWith("infant")) {
      return {
        baggage_check_in: option.title,
        baggage_hand: undefined,
        selected_baggage_title: option.title,
        selected_baggage_price: option.price,
      };
    }

    return {
      baggage_check_in: option.title,
      baggage_hand: undefined,
      selected_baggage_title: option.title,
      selected_baggage_price: option.price,
    };
  };

  const handleStopToggle = (stopCount: number) => {
    setSelectedStops((prev) => ({
      ...prev,
      [stopCount]: !prev[stopCount],
    }));
  };

  const matchesTimeSlot = (minutes: number | undefined, slots: Record<string, boolean>) => {
    const activeSlots = DEPARTURE_TIME_SLOTS.filter((s) => slots[s.id]);
    if (!activeSlots.length) return false;
    if (minutes === undefined) return true;
    return activeSlots.some((s) => minutes >= s.min && minutes < s.max);
  };

  const processFlights = useCallback(
    (flightList: Flight[]) => {
      let result = [...flightList];

      if (nonStopOnly) {
        result = result.filter((f) => f.stops === 0);
      }

      const anyStopSelected = selectedStops[0] || selectedStops[1] || selectedStops[2];
      if (anyStopSelected) {
        result = result.filter((f) => {
          if (f.stops === 0 && selectedStops[0]) return true;
          if (f.stops === 1 && selectedStops[1]) return true;
          if (f.stops >= 2 && selectedStops[2]) return true;
          return false;
        });
      }

      if (baggageOnly) {
        result = result.filter((f) => f.has_baggage);
      }

      if (fareType !== "ALL") {
        result = result.filter((f) => (f.fare_type || "PUB") === fareType);
      }

      result = result.filter((f) => f.price >= minPrice && f.price <= maxPrice);

      result = result.filter((f) => {
        const dur = f.duration_minutes ?? 9999;
        return dur <= maxDurationMinutes;
      });

      result = result.filter((f) => {
        const limit = f.ticket_time_limit_hours ?? 24;
        return limit <= maxTicketHours;
      });

      if (availableAirlines.length > 0) {
        const airlineKeys = Object.keys(selectedAirlines).filter((k) => selectedAirlines[k]);
        if (airlineKeys.length === 0) {
          result = [];
        } else if (airlineKeys.length < availableAirlines.length) {
          result = result.filter((f) => {
            const code = f.airline_code || f.id.split("-")[0];
            return airlineKeys.includes(code);
          });
        }
      }

      if (availableEquipment.length > 0) {
        const equipmentKeys = Object.keys(selectedEquipment).filter((k) => selectedEquipment[k]);
        if (equipmentKeys.length === 0) {
          result = [];
        } else if (equipmentKeys.length < availableEquipment.length) {
          result = result.filter((f) => f.equipment && equipmentKeys.includes(f.equipment));
        }
      }

      result = result.filter((f) => matchesTimeSlot(f.departure_minutes, selectedDepartureSlots));
      result = result.filter((f) => matchesTimeSlot(f.arrival_minutes, selectedArrivalSlots));

      if (activeSort === "Cheapest" || activeSort === "Price: Low to High") {
        result.sort((a, b) => a.price - b.price);
      } else if (activeSort === "Fastest") {
        result.sort(
          (a, b) =>
            (a.duration_minutes ?? 9999) - (b.duration_minutes ?? 9999)
        );
      }

      return result;
    },
    [
      activeSort,
      availableAirlines.length,
      availableEquipment.length,
      baggageOnly,
      fareType,
      maxDurationMinutes,
      maxPrice,
      maxTicketHours,
      minPrice,
      nonStopOnly,
      selectedAirlines,
      selectedArrivalSlots,
      selectedDepartureSlots,
      selectedEquipment,
      selectedStops,
    ]
  );

  const filteredOutbound = useMemo(() => processFlights(flights), [flights, processFlights]);
  const filteredReturn = useMemo(() => processFlights(returnFlights), [returnFlights, processFlights]);

  const persistDraftAndNavigate = (outbound: Flight, returnFlight?: Flight) => {
    const draft: BookingDraft = {
      tripType: isRoundTrip ? "round-trip" : "one-way",
      origin: searchOrigin,
      destination: searchDestination,
      departureDate: departureDate || new Date().toISOString().slice(0, 10),
      returnDate: isRoundTrip ? returnDate : undefined,
      cabin,
      adults,
      children,
      infants,
      outbound,
      returnFlight,
      createdAt: new Date().toISOString(),
    };
    saveBookingDraft(draft);
    router.push(isB2bRoute ? "/b2b/book" : "/book");
  };

  const handleSelectFlight = (flight: Flight, isReturnLeg: boolean) => {
    setSelectionError(null);
    if (isReturnLeg) {
      setSelectedReturn(flight);
    } else {
      setSelectedOutbound(flight);
    }
  };

  const handleContinueToBook = () => {
    if (!user) {
      openAuthModal();
      return;
    }
    if (!selectedOutbound) {
      setSelectionError("Please select an outbound flight.");
      return;
    }
    if (isRoundTrip && !selectedReturn) {
      setSelectionError("Please select a return flight to book round-trip.");
      return;
    }
    persistDraftAndNavigate(selectedOutbound, selectedReturn ?? undefined);
  };

  const handleQuickBookOneWay = (flight: Flight) => {
    if (!user) {
      openAuthModal();
      return;
    }
    setSelectedOutbound(flight);
    persistDraftAndNavigate(flight);
  };

  const canContinue = Boolean(selectedOutbound && (!isRoundTrip || selectedReturn));
  const totalSelectedPrice =
    (selectedOutbound?.price ?? 0) + (selectedReturn?.price ?? 0);

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

    const selectedFlight = isReturnFlight ? selectedReturn : selectedOutbound;

    return (
      <div className="w-full overflow-x-auto pb-4 -mx-4 px-4 sm:mx-0 sm:px-0">
        <div className="flex flex-col gap-6 min-w-[800px] lg:min-w-0">
          {title && (
            <h3 className="text-xl font-bold text-[#121121] mb-2 bg-white px-5 py-3.5 rounded-xl border border-slate-100 shadow-sm inline-block self-start sticky left-0 sm:static">
              {title}
            </h3>
          )}

          {flightList.map((flight, idx) => {
            const taxAmount = Math.round(flight.price * 0.15);
            const uniqueKey = `${flight.flight_key || flight.id}-${idx}`;

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
                key={uniqueKey}
                className="bg-white border border-slate-200 rounded-2xl shadow-[0_4px_16px_rgba(0,0,0,0.02)] overflow-hidden hover:shadow-md transition-shadow duration-300"
              >

              {/* Horizontal Top Header Row (Figma specs: Light blue-grey background) */}
              <div className="bg-[#F4F7FC] flex flex-wrap lg:flex-nowrap items-stretch border-b border-slate-200 select-none rounded-t-2xl">
                
                {/* Price block */}
                <div className="flex items-center px-6 py-4 border-r border-slate-200 min-w-[200px]">
                  <span className="text-[#121121] font-black text-[26px] tracking-tight">
                    ₹{flight.price.toLocaleString("en-IN")}
                  </span>
                  <span className="text-[12px] font-medium text-slate-500 ml-2 mt-1">
                    <span className="text-slate-400">Incl. </span>INR {taxAmount}<span className="text-slate-400">tax</span>
                  </span>
                </div>

                {/* Airline Name */}
                <div className="flex items-center px-6 py-4 border-r border-slate-200 min-w-[180px] justify-center gap-1.5">
                  <span className="text-[#D60D26] font-[800] text-[15px] tracking-wider uppercase">
                    {flight.airline}
                  </span>
                  {/* Small swoosh/bird icon placeholder */}
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="#D60D26" className="opacity-80">
                    <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/>
                  </svg>
                </div>

                {/* Stop Indicator */}
                <div className="flex items-center px-6 py-4 border-r border-slate-200 min-w-[140px] justify-center">
                  <span className="text-[#121121] text-[13px] font-[800]">
                    {flight.stops === 0 ? "Non-Stop" : `Stops: ${flight.stops}`}
                  </span>
                </div>

                {/* Right aligned Badges */}
                <div className="flex items-center px-6 py-4 gap-2.5 flex-1 justify-end">
                  {/* PUB Badge */}
                  <span className="bg-[#377BD7] text-white text-[11px] font-bold px-2.5 py-1 rounded shadow-sm tracking-wide">
                    {flight.fare_type === "STU"
                      ? "Student Fare"
                      : flight.fare_type === "DEF"
                        ? "Defence Fare"
                        : flight.fare_type === "CORP"
                          ? "Corporate Fare"
                          : "Public Fare (PUB)"}
                  </span>
                  
                  {/* Suitcase Baggage Badge */}
                  <span className="bg-[#D60D26] text-white text-[11px] font-bold px-2 py-1 rounded shadow-sm tracking-wide flex items-center gap-1">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M20 7H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7V5a3 3 0 00-6 0v2" />
                    </svg>
                    25K
                  </span>

                  {/* TKT Badge */}
                  <span className="border border-slate-400 text-slate-700 bg-transparent text-[11px] font-bold px-2 py-1 rounded">
                    TKT
                  </span>
                  {/* FEE Badge */}
                  <span className="border border-slate-400 text-slate-700 bg-transparent text-[11px] font-bold px-2 py-1 rounded">
                    FEE
                  </span>

                  {!isB2bRoute && !isRoundTrip && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleQuickBookOneWay(flight);
                      }}
                      className="bg-[#D60D26] hover:bg-[#b00b1d] text-white rounded-[8px] px-5 py-2 font-bold text-[14px] shadow-sm transition-transform active:scale-95 flex items-center justify-center gap-1.5 ml-4"
                    >
                      Book Now <ArrowUpRight className="w-4 h-4" strokeWidth={3} />
                    </button>
                  )}
                  {!isB2bRoute && isRoundTrip && (flight.meal_available || flight.food_onboard) && (
                    <span className="text-[11px] font-bold text-green-700 ml-2">Meals</span>
                  )}
                </div>

              </div>

                {/* White Body Segment list */}
                <div className="flex flex-col bg-white">
                  {segments.map((seg, sIdx) => (
                    <div
                      key={sIdx}
                      onClick={() => {
                        if (isB2bRoute) {
                          handleSelectFlight(flight, isReturnFlight);
                        } else {
                          handleSelectFlight(flight, isReturnFlight);
                        }
                      }}
                      className="grid grid-cols-[auto_1fr_1.2fr_1fr_1fr_1.5fr_1fr_1fr_auto] gap-x-4 gap-y-2 items-center px-6 py-5 border-b border-slate-100 hover:bg-slate-50/60 transition-colors last:border-b-0 cursor-pointer"
                    >

                      {/* Radio circle selector */}
                      <div className="flex items-center justify-center pr-2">
                        <div className={cn("w-[15px] h-[15px] rounded-full border flex items-center justify-center transition-colors", (selectedFlight?.flight_key || selectedFlight?.id) === uniqueKey ? "border-[#D60D26]" : "border-slate-300")}>
                          <div className={cn("w-[9px] h-[9px] rounded-full transition-colors", (selectedFlight?.flight_key || selectedFlight?.id) === uniqueKey ? "bg-[#D60D26]" : "bg-transparent")}></div>
                        </div>
                      </div>

                      <span className="text-[12px] font-[600] text-slate-600 truncate">{seg.code}</span>
                      <span className="text-[12px] font-[600] text-[#121121] truncate">{seg.date}</span>
                      <span className="text-[12px] font-[600] text-[#121121] truncate">{seg.route}</span>
                      <span className="text-[12px] font-[600] text-[#121121] truncate">{seg.class}</span>
                      <span className="text-[12px] font-[600] text-[#121121] truncate">{seg.timing}</span>
                      <span className="text-[12px] font-[600] text-[#121121] truncate">{seg.duration}</span>
                      <span className="text-[12px] font-[600] text-slate-400 truncate">{seg.seatsCode}</span>

                      {/* Amenities block */}
                      <div className="flex items-center justify-end gap-3 text-[#8A92A6]">
                        {/* Passenger Seat */}
                        <svg className="w-[16px] h-[16px] hover:text-slate-600 cursor-help transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="8" cy="5" r="1.5" fill="currentColor" stroke="none" />
                          <path d="M8 8v5a1.5 1.5 0 0 0 1.5 1.5h3.5l3 4.5" />
                          <path d="M5 9l1 6a2 2 0 0 0 2 2h4" />
                        </svg>
                        
                        {/* USB Plug */}
                        <svg className="w-[16px] h-[16px] hover:text-slate-600 cursor-help transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="19" r="1.5" fill="currentColor" stroke="none" />
                          <path d="M12 17.5V5" />
                          <path d="M9 8l3-3 3 3" />
                          <path d="M12 14h-2a2 2 0 0 1-2-2V9" />
                          <circle cx="8" cy="7.5" r="1.5" fill="currentColor" stroke="none" />
                          <path d="M12 12h2a2 2 0 0 0 2-2V8" />
                          <rect x="14.5" y="5" width="3" height="3" fill="currentColor" stroke="none" />
                        </svg>
                        
                        {/* Food Tray */}
                        <svg className="w-[16px] h-[16px] hover:text-slate-600 cursor-help transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M3 11h18" />
                          <path d="M5 11a7 7 0 0 1 14 0" />
                          <path d="M12 4v-1.5" />
                          <path d="M5 11v6a2 2 0 0 0 2 2h5l5-3.5" />
                          <path d="M9 15h4l2.5-1.5" />
                          <path d="M8 15v4" />
                        </svg>
                      </div>

                    </div>
                  ))}
                </div>

                {/* Action Bar when selected */}
                {(selectedFlight?.flight_key || selectedFlight?.id) === uniqueKey && isB2bRoute && (
                  <div className="bg-[#F2FBFF] px-6 py-4 flex flex-wrap items-center gap-4 border-t border-[#F2FBFF] animate-in slide-in-from-top-1 fade-in duration-200">
                    <button
                      onClick={() => {
                        if (!selectedOutbound) return;
                        if (isRoundTrip && !selectedReturn) {
                          setSelectionError("Select return flight first.");
                          return;
                        }
                        persistDraftAndNavigate(selectedOutbound, selectedReturn ?? undefined);
                      }}
                      className="bg-[#D60D26] hover:bg-[#D60D26] text-white rounded-[100px] px-8 h-[40px] font-bold text-[14px] flex items-center justify-center gap-2 shadow-sm transition-transform active:scale-95"
                    >
                      Continue to book <ArrowUpRight className="w-4 h-4" strokeWidth={3} />
                    </button>
                    <button
                      onClick={() => setQuoteModalOpen(true)}
                      className="min-w-[120px] border border-[#0C2342] bg-transparent text-[#0C2342] rounded-[100px] px-6 h-[40px] font-bold text-[14px] hover:bg-white/50 transition-colors shadow-sm"
                    >
                      Quote
                    </button>
                    <button
                      onClick={() => setFareTypeModalOpen(true)}
                      className="min-w-[120px] border border-[#0C2342] bg-transparent text-[#0C2342] rounded-[100px] px-6 h-[40px] font-bold text-[14px] hover:bg-white/50 transition-colors shadow-sm"
                    >
                      Fare Type
                    </button>
                    <button
                      onClick={() => setAddOnModalOpen(true)}
                      className="min-w-[120px] border border-[#0C2342] bg-transparent text-[#0C2342] rounded-[100px] px-6 h-[40px] font-bold text-[14px] hover:bg-white/50 transition-colors shadow-sm"
                    >
                      Add On
                    </button>
                    <button
                      onClick={() => setRulesModalOpen(true)}
                      className="min-w-[120px] border border-[#0C2342] bg-transparent text-[#0C2342] rounded-[100px] px-6 h-[40px] font-bold text-[14px] hover:bg-white/50 transition-colors shadow-sm"
                    >
                      Rules
                    </button>
                  </div>
                )}

              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 w-full max-w-[1440px] mx-auto select-none mt-4 animate-in fade-in slide-in-from-bottom-2 duration-300">

      {/* Left Column: Accordion Filters Panel */}
      <aside className="w-full lg:w-[285px] shrink-0">
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5 flex flex-col sticky top-24">

          <div className="flex items-center gap-2.5 text-[15px] font-[800] text-[#121121] pb-4 border-b border-slate-100 mb-2">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#D60D26" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
            </svg>
            <span>Filters :</span>
          </div>

          <div className="flex flex-col">

            {/* General */}
            <div className="border-b border-slate-100 py-3">
              <button
                onClick={() => toggleFilter('general')}
                className="w-full flex items-center justify-between text-[15px] font-[750] text-[#121121] py-1"
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

            {/* Airlines */}
            <div className="border-b border-slate-100 py-3">
              <button
                onClick={() => toggleFilter("airlines")}
                className="w-full flex items-center justify-between text-[15px] font-[750] text-[#121121] py-1"
              >
                <span>Airlines</span>
                {filtersOpen.airlines ? <ChevronUp className="w-4.5 h-4.5 text-slate-400" /> : <ChevronDown className="w-4.5 h-4.5 text-slate-400" />}
              </button>
              {filtersOpen.airlines && (
                <div className="mt-3 flex flex-col gap-2 px-1 max-h-[180px] overflow-y-auto animate-in fade-in duration-200">
                  {availableAirlines.length === 0 ? (
                    <span className="text-xs text-slate-400">No airlines in results</span>
                  ) : (
                    availableAirlines.map((a) => (
                      <label key={a.code} className="flex items-center gap-2.5 cursor-pointer text-sm font-semibold text-slate-600">
                        <input
                          type="checkbox"
                          checked={selectedAirlines[a.code] ?? true}
                          onChange={() =>
                            setSelectedAirlines((prev) => ({ ...prev, [a.code]: !prev[a.code] }))
                          }
                          className="rounded border-slate-300 text-primary w-4.5 h-4.5"
                        />
                        <span>{a.name} ({a.code})</span>
                      </label>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* Baggage */}
            <div className="border-b border-slate-100 py-3">
              <button
                onClick={() => toggleFilter('baggage')}
                className="w-full flex items-center justify-between text-[15px] font-[750] text-[#121121] py-1"
              >
                <span>Baggage</span>
                {filtersOpen.baggage ? <ChevronUp className="w-4.5 h-4.5 text-slate-400" /> : <ChevronDown className="w-4.5 h-4.5 text-slate-400" />}
              </button>
              {filtersOpen.baggage && (
                <div className="mt-3 flex flex-col gap-2 px-1 animate-in fade-in duration-200">
                  <label className="flex items-center gap-2.5 cursor-pointer text-sm font-semibold text-slate-600">
                    <input
                      type="checkbox"
                      checked={baggageOnly}
                      onChange={(e) => setBaggageOnly(e.target.checked)}
                      className="rounded border-slate-300 text-primary w-4.5 h-4.5"
                    />
                    <span>Baggage fares only</span>
                  </label>
                  <label className="flex items-center gap-2.5 cursor-pointer text-sm font-semibold text-slate-600">
                    <input
                      type="checkbox"
                      checked={!baggageOnly}
                      onChange={() => setBaggageOnly(false)}
                      className="rounded border-slate-300 text-primary w-4.5 h-4.5"
                    />
                    <span>Show all fares</span>
                  </label>
                </div>
              )}
            </div>

            {/* Fare type */}
            <div className="border-b border-slate-100 py-3">
              <button
                onClick={() => toggleFilter('fareType')}
                className="w-full flex items-center justify-between text-[15px] font-[750] text-[#121121] py-1"
              >
                <span>Fare type</span>
                {filtersOpen.fareType ? <ChevronUp className="w-4.5 h-4.5 text-slate-400" /> : <ChevronDown className="w-4.5 h-4.5 text-slate-400" />}
              </button>
              {filtersOpen.fareType && (
                <div className="mt-3 flex flex-col gap-2.5 px-1 animate-in fade-in duration-200">
                  {(["ALL", "PUB", "CORP", "STU", "DEF"] as const).map((type) => (
                    <label key={type} className="flex items-center gap-2.5 cursor-pointer text-sm font-semibold text-slate-600">
                      <input
                        type="radio"
                        name="fareType"
                        checked={fareType === type}
                        onChange={() => handleFareTypeChange(type)}
                        className="text-primary focus:ring-primary w-4 h-4"
                      />
                      <span>
                        {type === "ALL"
                          ? "All fares"
                          : type === "PUB"
                            ? "Public Fare (PUB)"
                            : type === "CORP"
                              ? "Corporate Fare"
                              : type === "STU"
                                ? "Student Fare"
                                : "Defence Fare"}
                      </span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Ticket time limit */}
            <div className="border-b border-slate-100 py-3">
              <button
                onClick={() => toggleFilter('ticketLimit')}
                className="w-full flex items-center justify-between text-[15px] font-[750] text-[#121121] py-1"
              >
                <span>Ticket time limit</span>
                {filtersOpen.ticketLimit ? <ChevronUp className="w-4.5 h-4.5 text-slate-400" /> : <ChevronDown className="w-4.5 h-4.5 text-slate-400" />}
              </button>
              {filtersOpen.ticketLimit && (
                <div className="mt-3 flex flex-col px-1 animate-in fade-in duration-200">
                  <input
                    type="range"
                    min={6}
                    max={72}
                    step={6}
                    value={maxTicketHours}
                    onChange={(e) => setMaxTicketHours(parseInt(e.target.value, 10))}
                    className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary"
                  />
                  <div className="flex justify-between text-xs font-bold text-slate-500 mt-2">
                    <span>6h</span>
                    <span>Within {maxTicketHours}h</span>
                  </div>
                </div>
              )}
            </div>

            {/* Max. time travel */}
            <div className="border-b border-slate-100 py-3">
              <button
                onClick={() => toggleFilter('maxTime')}
                className="w-full flex items-center justify-between text-[15px] font-[750] text-[#121121] py-1"
              >
                <span>Max. time travel</span>
                {filtersOpen.maxTime ? <ChevronUp className="w-4.5 h-4.5 text-slate-400" /> : <ChevronDown className="w-4.5 h-4.5 text-slate-400" />}
              </button>
              {filtersOpen.maxTime && (
                <div className="mt-3 flex flex-col px-1 animate-in fade-in duration-200">
                  <input
                    type="range"
                    min={60}
                    max={maxDurationBound}
                    step={15}
                    value={maxDurationMinutes}
                    onChange={(e) => setMaxDurationMinutes(parseInt(e.target.value, 10))}
                    className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary"
                  />
                  <div className="flex justify-between text-xs font-bold text-slate-500 mt-2">
                    <span>1h</span>
                    <span>Max {Math.floor(maxDurationMinutes / 60)}h {maxDurationMinutes % 60}m</span>
                  </div>
                </div>
              )}
            </div>

            {/* Price */}
            <div className="border-b border-slate-100 py-3">
              <button
                onClick={() => toggleFilter('price')}
                className="w-full flex items-center justify-between text-[15px] font-[750] text-[#121121] py-1"
              >
                <span>Price</span>
                {filtersOpen.price ? <ChevronUp className="w-4.5 h-4.5 text-slate-400" /> : <ChevronDown className="w-4.5 h-4.5 text-slate-400" />}
              </button>
              {filtersOpen.price && (
                <div className="mt-3 flex flex-col gap-3 px-1 animate-in fade-in duration-200">
                  <div>
                    <label className="text-xs font-bold text-slate-500">Min price</label>
                    <input
                      type="range"
                      min={priceBounds.min}
                      max={priceBounds.max}
                      value={minPrice}
                      onChange={(e) => setMinPrice(parseInt(e.target.value, 10))}
                      className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary mt-1"
                    />
                    <span className="text-xs font-bold text-slate-500">₹{minPrice.toLocaleString("en-IN")}</span>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500">Max price</label>
                    <input
                      type="range"
                      min={priceBounds.min}
                      max={priceBounds.max}
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(parseInt(e.target.value, 10))}
                      className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary mt-1"
                    />
                    <span className="text-xs font-bold text-slate-500">₹{maxPrice.toLocaleString("en-IN")}</span>
                  </div>
                </div>
              )}
            </div>

            {/* No. of stops */}
            <div className="border-b border-slate-100 py-3">
              <button
                onClick={() => toggleFilter('stops')}
                className="w-full flex items-center justify-between text-[15px] font-[750] text-[#121121] py-1"
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
                className="w-full flex items-center justify-between text-[15px] font-[750] text-[#121121] py-1"
              >
                <span>Equipment</span>
                {filtersOpen.equipment ? <ChevronUp className="w-4.5 h-4.5 text-slate-400" /> : <ChevronDown className="w-4.5 h-4.5 text-slate-400" />}
              </button>
              {filtersOpen.equipment && (
                <div className="mt-3 flex flex-col gap-2 px-1 max-h-[160px] overflow-y-auto animate-in fade-in duration-200">
                  {availableEquipment.length === 0 ? (
                    <span className="text-xs text-slate-400">No equipment data</span>
                  ) : (
                    availableEquipment.map((eq) => (
                      <label key={eq} className="flex items-center gap-2.5 cursor-pointer text-sm font-semibold text-slate-600">
                        <input
                          type="checkbox"
                          checked={selectedEquipment[eq] ?? true}
                          onChange={() =>
                            setSelectedEquipment((prev) => ({ ...prev, [eq]: !prev[eq] }))
                          }
                          className="rounded border-slate-300 text-primary w-4.5 h-4.5"
                        />
                        <span>{eq}</span>
                      </label>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* Departure & arrival time */}
            <div className="py-3">
              <button
                onClick={() => toggleFilter('times')}
                className="w-full flex items-center justify-between text-[15px] font-[750] text-[#121121] py-1"
              >
                <span>Departure & arrival time</span>
                {filtersOpen.times ? <ChevronUp className="w-4.5 h-4.5 text-slate-400" /> : <ChevronDown className="w-4.5 h-4.5 text-slate-400" />}
              </button>
              {filtersOpen.times && (
                <div className="mt-3 flex flex-col gap-4 px-1 animate-in fade-in duration-200">
                  <div>
                    <p className="text-xs font-bold text-slate-500 mb-2">Departure</p>
                    {DEPARTURE_TIME_SLOTS.map((slot) => (
                      <label key={`dep-${slot.id}`} className="flex items-center gap-2.5 cursor-pointer text-sm font-semibold text-slate-600 mb-1.5">
                        <input
                          type="checkbox"
                          checked={selectedDepartureSlots[slot.id] ?? true}
                          onChange={() =>
                            setSelectedDepartureSlots((prev) => ({
                              ...prev,
                              [slot.id]: !prev[slot.id],
                            }))
                          }
                          className="rounded border-slate-300 text-primary w-4.5 h-4.5"
                        />
                        <span>{slot.label}</span>
                      </label>
                    ))}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-500 mb-2">Arrival</p>
                    {DEPARTURE_TIME_SLOTS.map((slot) => (
                      <label key={`arr-${slot.id}`} className="flex items-center gap-2.5 cursor-pointer text-sm font-semibold text-slate-600 mb-1.5">
                        <input
                          type="checkbox"
                          checked={selectedArrivalSlots[slot.id] ?? true}
                          onChange={() =>
                            setSelectedArrivalSlots((prev) => ({
                              ...prev,
                              [slot.id]: !prev[slot.id],
                            }))
                          }
                          className="rounded border-slate-300 text-primary w-4.5 h-4.5"
                        />
                        <span>{slot.label}</span>
                      </label>
                    ))}
                  </div>
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
              <span>Sort by: <span className="text-[#121121] font-[900]">{activeSort}</span></span>
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

        {selectionError && (
          <p className="text-sm font-bold text-[#D60D26] mt-4">{selectionError}</p>
        )}

      </section>

      {!isB2bRoute && (
        <div className="fixed bottom-0 left-0 right-0 z-[90] bg-white border-t border-slate-200 shadow-[0_-8px_30px_rgba(0,0,0,0.08)] px-4 py-4">
          <div className="max-w-[1440px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-sm">
              {isRoundTrip ? (
                <p className="font-semibold text-slate-700">
                  {selectedOutbound ? "✓ Outbound selected" : "Select outbound"}
                  {" · "}
                  {selectedReturn ? "✓ Return selected" : "Select return"}
                </p>
              ) : (
                <p className="font-semibold text-slate-700">
                  {selectedOutbound ? "Flight selected" : "Select a flight to continue"}
                </p>
              )}
              {canContinue && (
                <p className="text-xs text-slate-500 mt-0.5">
                  Total from ₹{(totalSelectedPrice * (adults + children)).toLocaleString("en-IN")} (excl. taxes on booking page)
                </p>
              )}
            </div>
            <button
              type="button"
              disabled={!canContinue}
              onClick={handleContinueToBook}
              className={cn(
                "w-full sm:w-auto px-10 py-3.5 rounded-full font-bold text-white flex items-center justify-center gap-2 transition-all",
                canContinue
                  ? "bg-[#D60D26] hover:bg-[#b00b1d] shadow-lg"
                  : "bg-slate-300 cursor-not-allowed"
              )}
            >
              {isRoundTrip ? "Continue — book both flights" : "Continue to booking"}
              <ArrowUpRight className="w-5 h-5" strokeWidth={2.5} />
            </button>
          </div>
        </div>
      )}

      <div className="h-24" />

      <QuoteModal isOpen={quoteModalOpen} onClose={() => setQuoteModalOpen(false)} />

      <FareTypeModal isOpen={fareTypeModalOpen} onClose={() => setFareTypeModalOpen(false)} />
      <AddOnModal
        isOpen={addOnModalOpen}
        onClose={() => setAddOnModalOpen(false)}
        onApply={(option: BaggageOption | null) => setSelectedBaggageOption(option)}
        initialSelectedOptionId={selectedBaggageOption?.id || null}
      />
      <RulesModal isOpen={rulesModalOpen} onClose={() => setRulesModalOpen(false)} />


    </div>
  );
}
