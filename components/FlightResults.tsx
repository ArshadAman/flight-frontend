"use client";

import React, { useState, useMemo, useCallback, useEffect } from "react";
import { format } from "date-fns";
import {
  ChevronDown,
  ChevronUp,
  SlidersHorizontal,
  Wifi,
  Coffee,
  Plug,
  Accessibility,
  ArrowUpRight,
  CheckCircle2,
  X,
  ArrowRight,
  PlaneTakeoff,
} from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { QuoteModal } from "./QuoteModal";
import { FareTypeModal } from "./FareTypeModal";
import AddOnModal, { BaggageOption as AddOnBaggage } from "./AddOnModal";
import { RulesModal } from "./RulesModal";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { saveBookingDraft, type BookingDraft } from "@/lib/booking";

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
  airline_code?: string;
  fare_type?: string;
  meal_available?: boolean;
  food_onboard?: boolean;
  search_key?: string;
  flight_key?: string;
  fare_id?: string;
  duration_minutes?: number;
  departure_minutes?: number;
  arrival_minutes?: number;
  tax_amount?: number;
  base_amount?: number;
  has_baggage?: boolean;
  baggage_label?: string;
  equipment?: string;
  cabin_class?: string;
  ticket_time_limit_hours?: number;
  travel_date?: string;
  is_agent_flight?: boolean;
  agent_flight_id?: string;
};

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
  initialAirlineCode?: string;
  initialFareType?: "ALL" | "PUB" | "CORP" | "STU" | "DEF";
  cabin?: string;
}

type BaggageOption = {
  id: string;
  title: string;
  description: string;
  price: string;
  note?: string;
};

type TicketWithBaggage = Record<string, unknown> & {
  baggage_check_in?: string;
  baggage_hand?: string;
  selected_baggage_title?: string;
  selected_baggage_price?: string;
  passengers_data?: Array<{
    title?: string;
    first_name?: string;
    last_name?: string;
  }>;
  pnr_number?: string;
  ticket_number?: string;
  airline_name?: string;
  airline_code?: string;
  flight_number?: string;
  total_amount?: string | number;
};

const DEPARTURE_TIME_SLOTS = [
  { id: "early", label: "Early Morning (Before 8 AM)", min: 0, max: 480 },
  { id: "morning", label: "Morning (8 AM - 12 PM)", min: 480, max: 720 },
  { id: "afternoon", label: "Afternoon (12 PM - 4 PM)", min: 720, max: 960 },
  { id: "evening", label: "Evening (After 4 PM)", min: 960, max: 1440 },
];

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
  cabin = "Economy",
}: FlightResultsProps) {

  const { user, openAuthModal } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isB2bRoute = pathname?.startsWith('/b2b');

  const tripType = searchParams?.get('tripType');
  const searchOrigin = searchParams?.get('origin');
  const searchDestination = searchParams?.get('destination');
  const departureDate = searchParams?.get('date');
  const returnDate = searchParams?.get('returnDate');

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
  const [fareType, setFareType] = useState<"ALL" | "PUB" | "CORP" | "STU" | "DEF">(initialFareType as any);
  const [maxPrice, setMaxPrice] = useState(priceBounds.max);
  const [minPrice, setMinPrice] = useState(priceBounds.min);
  const [maxDurationMinutes, setMaxDurationMinutes] = useState(maxDurationBound);
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

  const matchesTimeSlot = (minutes: number | undefined, slots: Record<string, boolean>) => {
    const activeSlots = DEPARTURE_TIME_SLOTS.filter((s) => slots[s.id]);
    if (!activeSlots.length) return false;
    if (minutes === undefined) return true;
    return activeSlots.some((s) => minutes >= s.min && minutes < s.max);
  };

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
  const [selectedOutboundId, setSelectedOutboundId] = useState<string | null>(null);
  const [selectedReturnId, setSelectedReturnId] = useState<string | null>(null);

  // B2C Consumer Booking States
  const [selectionError, setSelectionError] = useState<string | null>(null);

  const selectedOutbound = useMemo(() => {
    if (!selectedOutboundId) return null;
    const found = flights.find((f, idx) => `${f.flight_key || f.id}-${idx}` === selectedOutboundId);
    if (found) return found;
    return flights.find(f => f.id === selectedOutboundId || f.flight_key === selectedOutboundId) || null;
  }, [flights, selectedOutboundId]);

  const selectedReturn = useMemo(() => {
    if (!selectedReturnId) return null;
    const found = returnFlights.find((f, idx) => `${f.flight_key || f.id}-${idx}` === selectedReturnId);
    if (found) return found;
    return returnFlights.find(f => f.id === selectedReturnId || f.flight_key === selectedReturnId) || null;
  }, [returnFlights, selectedReturnId]);

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
    setSelectedStops(prev => ({
      ...prev,
      [stopCount]: !prev[stopCount]
    }));
  };

  // Helper to filter and sort list of flights dynamically
  const processFlights = useCallback((flightList: Flight[]) => {
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
        result = result.filter((f) => f.is_agent_flight || (f.fare_type || "PUB") === fareType);
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
  }, [activeSort, maxPrice, nonStopOnly, selectedStops]);

  const filteredOutbound = useMemo(() => processFlights(flights), [flights, processFlights]);
  const filteredReturn = useMemo(() => processFlights(returnFlights), [returnFlights, processFlights]);

  // Handle book click
  const persistDraftAndNavigate = (outbound: Flight, returnFlight?: Flight) => {
    const draft: BookingDraft = {
      tripType: isRoundTrip ? "round-trip" : "one-way",
      origin: searchOrigin || outbound.origin,
      destination: searchDestination || outbound.destination,
      departureDate: departureDate || outbound.travel_date || new Date().toISOString().slice(0, 10),
      returnDate: isRoundTrip ? (returnDate || returnFlight?.travel_date) : undefined,
      cabin: cabin || "Economy",
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

  const handleBookClick = (flight: Flight) => {
    if (!user) {
      console.log("[FlightResults] User unauthenticated, opening AuthModal.");
      openAuthModal();
      return;
    }
    persistDraftAndNavigate(flight);
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
      <div className="w-full overflow-x-auto pb-4 -mx-4 px-4 sm:mx-0 sm:px-0">
        <div className="flex flex-col gap-6 min-w-[800px] lg:min-w-0">
          {title && (
            <h3 className="text-xl font-bold text-[#121121] mb-2 bg-white px-5 py-3.5 rounded-xl border border-slate-100 shadow-sm inline-block self-start sticky left-0 sm:static">
              {title}
            </h3>
          )}

          {flightList.map((flight, idx) => {
            const taxAmount = flight.is_agent_flight ? 0 : Math.round(flight.price * 0.15);
            const uniqueKey = `${flight.flight_key || flight.id}-${idx}`;
            const flightIdentifier = flight.flight_key || flight.id;
            const isSelected = currentSelectedId === uniqueKey;

            // Determine mock legs for segments display (if stops > 0, show 2 connected rows!)
            const segmentsCount = flight.stops > 0 ? 2 : 1;
            const segments = Array.from({ length: segmentsCount }).map((_, sIdx) => {
              const isSecondLeg = sIdx === 1;
              return {
                code: isSecondLeg ? `AI-${flight.id.split('-').pop() || '102'}` : flight.id,
                date: flight.travel_date
                  ? new Date(`${flight.travel_date}T00:00:00`).toLocaleDateString("en-US", { weekday: 'short', day: 'numeric', month: 'short', year: '2-digit' })
                  : "Wed, 01 Oct 25",
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
                  {!flight.is_agent_flight && (
                    <span className="text-[12px] font-medium text-slate-500 ml-2 mt-1">
                      <span className="text-slate-400">Incl. </span>INR {taxAmount}<span className="text-slate-400">tax</span>
                    </span>
                  )}
                </div>

                  {/* Airline Name and Logo */}
                  <div className="flex items-center px-6 py-4 border-r border-slate-200 min-w-[180px] justify-center gap-2">
                    <div className="flex items-center justify-center shrink-0 h-12 w-12">
                      <img
                        src={`/airlines/${flight.airline_code || flight.id.split('-')[0]}.png`}
                        alt={flight.airline}
                        className="max-h-full max-w-full object-contain"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                          if (fallback) fallback.style.display = 'block';
                        }}
                      />
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="#D60D26" className="opacity-80 hidden">
                        <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
                      </svg>
                    </div>
                    <span className="text-[#D60D26] font-[800] text-[15px] tracking-wider uppercase">
                      {flight.airline}
                    </span>
                  </div>

                  {/* Stop Indicator */}
                  <div className="flex items-center px-6 py-4 border-r border-slate-200 min-w-[140px] justify-center">
                    <span className="text-[#121121] text-[13px] font-[800]">
                      {flight.stops === 0 ? "Non-Stop" : `Stops: ${flight.stops}`}
                    </span>
                  </div>

                {/* Right aligned Badges */}
                <div className="flex items-center px-6 py-4 gap-2.5 flex-1 justify-end">
                  {flight.is_agent_flight && (
                    <span className="bg-[#D60D26] text-white text-[11px] font-black px-2.5 py-1 rounded shadow-sm tracking-wide uppercase flex items-center gap-1 animate-pulse">
                      ★ Exclusive Agent Deal
                    </span>
                  )}
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
                          handleBookClick(flight);
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
                        if (isB2bRoute || isRoundTrip) {
                          setCurrentSelectedId(uniqueKey);
                        }
                      }}
                      className="grid grid-cols-[auto_1fr_1.2fr_1fr_1fr_1.5fr_1fr_1fr_auto] gap-x-4 gap-y-2 items-center px-6 py-5 border-b border-slate-100 hover:bg-slate-50/60 transition-colors last:border-b-0 cursor-pointer"
                    >

                      {/* Radio circle selector */}
                      <div className="flex items-center justify-center pr-2">
                        <div className={cn("w-[15px] h-[15px] rounded-full border flex items-center justify-center transition-colors", isSelected ? "border-[#D60D26]" : "border-slate-300")}>
                          <div className={cn("w-[9px] h-[9px] rounded-full transition-colors", isSelected ? "bg-[#D60D26]" : "bg-transparent")}></div>
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
                {isSelected && isB2bRoute && (
                  <div className="bg-[#F2FBFF] px-6 py-4 flex flex-wrap items-center gap-4 border-t border-[#F2FBFF] animate-in slide-in-from-top-1 fade-in duration-200">
                    <button
                      onClick={() => {
                        const out = isReturnFlight ? (selectedOutbound || null) : flight;
                        const ret = isReturnFlight ? flight : (selectedReturn || undefined);
                        persistDraftAndNavigate(out || flight, ret || undefined);
                      }}
                      className="bg-[#D60D26] hover:bg-[#D60D26] text-white rounded-[100px] px-8 h-[40px] font-bold text-[14px] flex items-center justify-center gap-2 shadow-sm transition-transform active:scale-95"
                    >
                      Book Now <ArrowUpRight className="w-4 h-4" strokeWidth={3} />
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

  const renderMultiCityMatrix = () => {
    const dates1 = Array.from({ length: 5 }).map((_, i) => {
      const d = new Date(departureDate || Date.now());
      d.setDate(d.getDate() + i - 2);
      return d;
    });
    
    const dates2 = Array.from({ length: 5 }).map((_, i) => {
      const d = new Date(returnDate || Date.now());
      d.setDate(d.getDate() + i - 2);
      return d;
    });

    const oCode = (searchOrigin || "DEL").substring(0, 3).toUpperCase();
    const dCode = (searchDestination || "BOM").substring(0, 3).toUpperCase();
    const rCode = "BKK";

    return (
      <div className="w-full mt-6 mb-12 animate-in fade-in slide-in-from-bottom-2 duration-300">
        <div className="border-[2px] border-[#377BD7] bg-white overflow-hidden w-full overflow-x-auto rounded-sm">
          <div className="min-w-[800px] flex flex-col">
            {/* Header Row */}
            <div className="grid grid-cols-[1.2fr_1fr_1fr_1fr_1fr_1fr] border-b border-[#377BD7]/30">
              {/* Top Left Cell */}
              <div className="relative bg-[#F9EDED] flex flex-col p-4 justify-between border-r border-[#377BD7]/30">
                 <div className="flex items-center gap-1 text-[12px] font-black text-[#121121] self-end z-10">
                   {oCode} <ArrowRight className="w-3 h-3 text-[#D60D26]" /> {dCode} <PlaneTakeoff className="w-3.5 h-3.5 text-slate-400" />
                 </div>
                 <div className="flex items-center gap-1 text-[12px] font-black text-[#121121] self-start mt-8 z-10">
                   {rCode} <ArrowRight className="w-3 h-3 text-[#D60D26]" /> {oCode} <PlaneTakeoff className="w-3.5 h-3.5 text-slate-400" />
                 </div>
                 <svg className="absolute inset-0 w-full h-full pointer-events-none" preserveAspectRatio="none">
                   <line x1="0" y1="0" x2="100%" y2="100%" stroke="#e2e8f0" strokeWidth="1.5" />
                 </svg>
              </div>

              {/* Col Headers */}
              {dates1.map((d, i) => (
                <div key={i} className="bg-[#F9EDED] flex flex-col items-center justify-center p-3 border-r border-[#377BD7]/30 last:border-r-0">
                  <span className="text-[15px] font-[900] text-[#121121]">{format(d, "dd MMM, yy")}</span>
                  <span className="text-[13px] font-medium text-slate-500 mt-0.5">{format(d, "EEEE")}</span>
                </div>
              ))}
            </div>

            {/* Rows */}
            {dates2.map((d2, rIdx) => (
              <div key={rIdx} className="grid grid-cols-[1.2fr_1fr_1fr_1fr_1fr_1fr] border-b border-[#377BD7]/30 last:border-b-0">
                {/* Row Header */}
                <div className="bg-[#F9EDED] flex flex-col items-center justify-center p-3 border-r border-[#377BD7]/30">
                  <span className="text-[15px] font-[900] text-[#121121]">{format(d2, "dd MMM, yy")}</span>
                  <span className="text-[13px] font-medium text-slate-500 mt-0.5">{format(d2, "EEEE")}</span>
                </div>

                {/* Data Cells */}
                {dates1.map((d1, cIdx) => {
                  const seed = rIdx * 5 + cIdx;
                  const isNull = (rIdx === 1 && cIdx === 1) || (rIdx === 1 && cIdx === 3) || 
                                 (rIdx === 2 && cIdx === 0) || (rIdx === 2 && cIdx === 4) ||
                                 (rIdx === 3 && cIdx === 1);
                  
                  if (isNull || flights.length === 0) {
                    return (
                      <div key={cIdx} className="bg-white flex items-center justify-center p-3 border-r border-[#377BD7]/30 last:border-r-0 min-h-[100px]">
                         <div className="w-5 h-5 rounded-full bg-[#D60D26] text-white font-bold text-[13px] flex items-center justify-center shadow-sm">i</div>
                      </div>
                    );
                  }

                  const flight = flights[seed % flights.length];
                  const stopsText = flight.stops === 0 ? "Non-Stop" : `0${flight.stops} Stop`;

                  return (
                    <div key={cIdx} className="bg-white flex flex-col items-center justify-center p-3 border-r border-[#377BD7]/30 last:border-r-0 min-h-[100px] cursor-pointer hover:bg-slate-50 transition-colors">
                      <span className="text-[11px] font-bold text-slate-500 tracking-wider mb-1 uppercase">{flight.airline}</span>
                      <span className="text-[20px] font-black text-[#121121] tracking-tight">
                        ₹{flight.price.toLocaleString("en-IN")}
                      </span>
                      <span className="text-[10px] font-[800] text-[#D60D26] bg-rose-50 px-2 py-0.5 rounded-full mt-2 border border-rose-100">{stopsText}</span>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const canContinue = Boolean(selectedOutbound && (!isRoundTrip || selectedReturn));
  const totalSelectedPrice = (selectedOutbound?.price ?? 0) + (selectedReturn?.price ?? 0);

  if (tripType === "multi-city") {
    return (
      <div className="w-full max-w-[1440px] mx-auto select-none mt-4 px-4 sm:px-0">
        {renderMultiCityMatrix()}
      </div>
    );
  }

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
                className="w-full flex items-center justify-between text-[15px] font-[750] text-[#121121] py-1"
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
                className="w-full flex items-center justify-between text-[15px] font-[750] text-[#121121] py-1"
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
                className="w-full flex items-center justify-between text-[15px] font-[750] text-[#121121] py-1"
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
                className="w-full flex items-center justify-between text-[15px] font-[750] text-[#121121] py-1"
              >
                <span>Price</span>
                {filtersOpen.price ? <ChevronUp className="w-4.5 h-4.5 text-slate-400" /> : <ChevronDown className="w-4.5 h-4.5 text-slate-400" />}
              </button>
              {filtersOpen.price && (
                <div className="mt-3 flex flex-col px-1 animate-in fade-in duration-200">
                  <input
                    type="range"
                    min="3000"
                    max="12000"
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
                <div className="mt-3 text-xs font-semibold text-slate-400 px-1 animate-in fade-in duration-200">
                  Filter by airplane model.
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

      {/* Render QuoteModal for B2B */}
      <QuoteModal isOpen={quoteModalOpen} onClose={() => setQuoteModalOpen(false)} />

      {/* Render Additional Info Modals for B2B */}
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
