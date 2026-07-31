"use client";

import React, { useState, useMemo, useCallback, useEffect } from "react";
import { format, parseISO } from "date-fns";
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
} from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { QuoteModal } from "./QuoteModal";
import { FareTypeModal } from "./FareTypeModal";
import AddOnModal, { BaggageOption as AddOnBaggage } from "./AddOnModal";
import { RulesModal } from "./RulesModal";
import { cn } from "@/lib/utils";
import { saveBookingDraft, type BookingDraft } from "@/lib/booking";
import { layoversFromSegments, stopsLabel, viaAirports, type FlightSegment, type Layover } from "@/lib/journey";

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
  segments?: FlightSegment[];
  layovers?: Layover[];
  via?: string[];
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
  /** Yatra-style multi-city: select a flight then continue (no instant Book Now). */
  forceSelectMode?: boolean;
  continueButtonLabel?: string;
  selectionHint?: string;
  /** Per-traveller fare already chosen on earlier multi-city legs. */
  priorLegsFareTotal?: number;
  onContinueWithSelection?: (flight: Flight) => void;
  /** Fired when user picks a flight (radio) in select mode — for live multi-city summary. */
  onSelectFlight?: (flight: Flight) => void;
  listTitle?: string;
  /** Hide built-in sticky bar (parent owns Yatra-style multi-city footer). */
  hideStickyBar?: boolean;
  /** Force card dates when API omits travel_date (per multi-city sector). */
  legTravelDate?: string;
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
  forceSelectMode = false,
  continueButtonLabel,
  selectionHint,
  priorLegsFareTotal = 0,
  onContinueWithSelection,
  onSelectFlight,
  listTitle,
  hideStickyBar = false,
  legTravelDate,
}: FlightResultsProps) {
  const selectMode = isRoundTrip || forceSelectMode;

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isB2bRoute = pathname?.startsWith('/b2b');

  const tripType = searchParams?.get('tripType');
  const searchOrigin = searchParams?.get('origin');
  const searchDestination = searchParams?.get('destination');
  const departureDate = searchParams?.get('departureDate') || searchParams?.get('date');
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

  const availableAirlinesKey = useMemo(
    () => availableAirlines.map((a) => a.code).sort().join("|"),
    [availableAirlines]
  );

  const availableEquipment = useMemo(() => {
    const set = new Set<string>();
    allFlights.forEach((f) => {
      if (f.equipment) set.add(f.equipment);
    });
    return Array.from(set);
  }, [allFlights]);

  const availableEquipmentKey = useMemo(
    () => [...availableEquipment].sort().join("|"),
    [availableEquipment]
  );

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
      setSelectedAirlines((prev) => {
        const next = { [initialAirlineCode]: true };
        const prevKeys = Object.keys(prev);
        if (prevKeys.length === 1 && prev[initialAirlineCode]) return prev;
        return next;
      });
      return;
    }
    if (!availableAirlinesKey) return;
    setSelectedAirlines((prev) => {
      const next: Record<string, boolean> = {};
      availableAirlinesKey.split("|").forEach((code) => {
        if (code) next[code] = true;
      });
      const prevKeys = Object.keys(prev).sort().join("|");
      const nextKeys = Object.keys(next).sort().join("|");
      if (prevKeys === nextKeys && prevKeys.split("|").every((k) => prev[k] === next[k])) {
        return prev;
      }
      return next;
    });
  }, [initialAirlineCode, availableAirlinesKey]);

  useEffect(() => {
    if (!availableEquipmentKey) return;
    setSelectedEquipment((prev) => {
      const next: Record<string, boolean> = {};
      availableEquipmentKey.split("|").forEach((eq) => {
        if (eq) next[eq] = true;
      });
      const prevKeys = Object.keys(prev).sort().join("|");
      if (prevKeys === availableEquipmentKey) return prev;
      return next;
    });
  }, [availableEquipmentKey]);

  const effectiveSelectedAirlines = useMemo(() => {
    if (Object.keys(selectedAirlines).length > 0) return selectedAirlines;
    if (initialAirlineCode) return { [initialAirlineCode]: true };
    const all: Record<string, boolean> = {};
    availableAirlines.forEach((a) => {
      all[a.code] = true;
    });
    return all;
  }, [selectedAirlines, availableAirlines, initialAirlineCode]);

  const effectiveSelectedEquipment = useMemo(() => {
    if (Object.keys(selectedEquipment).length > 0) return selectedEquipment;
    const all: Record<string, boolean> = {};
    availableEquipment.forEach((eq) => {
      all[eq] = true;
    });
    return all;
  }, [selectedEquipment, availableEquipment]);

  const [activeSort, setActiveSort] = useState("Cheapest");
  const [sortOpen, setSortOpen] = useState(false);
  const [quoteModalOpen, setQuoteModalOpen] = useState(false);
  const [fareTypeModalOpen, setFareTypeModalOpen] = useState(false);
  const [addOnModalOpen, setAddOnModalOpen] = useState(false);
  const [rulesModalOpen, setRulesModalOpen] = useState(false);
  const [selectedBaggageOption, setSelectedBaggageOption] = useState<AddOnBaggage | null>(null);
  const [selectedOutboundId, setSelectedOutboundId] = useState<string | null>(null);
  const [selectedReturnId, setSelectedReturnId] = useState<string | null>(null);
  /** Mobile: Yatra-style Outbound | Return tabs for round-trip. */
  const [rtMobileTab, setRtMobileTab] = useState<"outbound" | "return">("outbound");

  // B2C Consumer Booking States
  const [selectionError, setSelectionError] = useState<string | null>(null);

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

  // Filter + sort flights (all filter state must be in the dependency list)
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
        result = result.filter(
          (f) => f.is_agent_flight || (f.fare_type || "PUB") === fareType
        );
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
        const airlineKeys = Object.keys(effectiveSelectedAirlines).filter(
          (k) => effectiveSelectedAirlines[k]
        );
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
        const equipmentKeys = Object.keys(effectiveSelectedEquipment).filter(
          (k) => effectiveSelectedEquipment[k]
        );
        if (equipmentKeys.length === 0) {
          result = [];
        } else if (equipmentKeys.length < availableEquipment.length) {
          result = result.filter(
            (f) => f.equipment && equipmentKeys.includes(f.equipment)
          );
        }
      }

      result = result.filter((f) =>
        matchesTimeSlot(f.departure_minutes, selectedDepartureSlots)
      );
      result = result.filter((f) =>
        matchesTimeSlot(f.arrival_minutes, selectedArrivalSlots)
      );

      if (activeSort === "Cheapest" || activeSort === "Price: Low to High") {
        result.sort((a, b) => a.price - b.price);
      } else if (activeSort === "Fastest") {
        result.sort(
          (a, b) =>
            (a.duration_minutes ?? 9999) - (b.duration_minutes ?? 9999)
        );
      }
      // "Recommended" keeps API order

      return result;
    },
    [
      activeSort,
      nonStopOnly,
      selectedStops,
      baggageOnly,
      fareType,
      minPrice,
      maxPrice,
      maxDurationMinutes,
      maxTicketHours,
      availableAirlines,
      availableEquipment,
      effectiveSelectedAirlines,
      effectiveSelectedEquipment,
      selectedDepartureSlots,
      selectedArrivalSlots,
    ]
  );

  const filteredOutbound = useMemo(() => processFlights(flights), [flights, processFlights]);
  const filteredReturn = useMemo(() => processFlights(returnFlights), [returnFlights, processFlights]);

  // Resolve against the same filtered lists used for card keys (sort/filter changes indices).
  const resolveSelectedFlight = (
    list: Flight[],
    selectedId: string | null
  ): Flight | null => {
    if (!selectedId) return null;
    const byKey = list.find((f, idx) => `${f.flight_key || f.id}-${idx}` === selectedId);
    if (byKey) return byKey;
    const bare = selectedId.replace(/-\d+$/, "");
    return (
      list.find((f) => f.flight_key === selectedId || f.id === selectedId) ||
      list.find((f) => f.flight_key === bare || f.id === bare) ||
      null
    );
  };

  const selectedOutbound = useMemo(
    () => resolveSelectedFlight(filteredOutbound, selectedOutboundId),
    [filteredOutbound, selectedOutboundId]
  );

  const selectedReturn = useMemo(
    () => resolveSelectedFlight(filteredReturn, selectedReturnId),
    [filteredReturn, selectedReturnId]
  );

  // Pre-select first flight in each leg (Yatra-style) when lists load / filters clear selection
  useEffect(() => {
    if (!isRoundTrip) return;
    if (filteredOutbound.length === 0) {
      setSelectedOutboundId(null);
      return;
    }
    const stillValid = filteredOutbound.some(
      (f, idx) => `${f.flight_key || f.id}-${idx}` === selectedOutboundId
    );
    if (!stillValid) {
      const f = filteredOutbound[0];
      setSelectedOutboundId(`${f.flight_key || f.id}-0`);
    }
  }, [isRoundTrip, filteredOutbound, selectedOutboundId]);

  useEffect(() => {
    if (!isRoundTrip) return;
    if (filteredReturn.length === 0) {
      setSelectedReturnId(null);
      return;
    }
    const stillValid = filteredReturn.some(
      (f, idx) => `${f.flight_key || f.id}-${idx}` === selectedReturnId
    );
    if (!stillValid) {
      const f = filteredReturn[0];
      setSelectedReturnId(`${f.flight_key || f.id}-0`);
    }
  }, [isRoundTrip, filteredReturn, selectedReturnId]);

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
    persistDraftAndNavigate(flight);
  };

  const handleContinueToBook = () => {
    if (!selectedOutbound) {
      setSelectionError("Please select a flight.");
      return;
    }
    if (forceSelectMode && onContinueWithSelection) {
      onContinueWithSelection(selectedOutbound);
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

            // One row per flight. Do NOT invent a reverse second leg — that made
            // multi-city look like a single flight going everywhere.
            const effectiveTravelDate = flight.travel_date || legTravelDate;
            const displayDate = effectiveTravelDate
              ? format(parseISO(effectiveTravelDate), "EEE, d MMM yy")
              : "—";
            const routeLabel = `${flight.origin} ➔ ${flight.destination}`;
            const legs = flight.segments || [];
            const legLayovers = flight.layovers?.length ? flight.layovers : layoversFromSegments(legs);
            const viaCodes = flight.via?.length ? flight.via : viaAirports(legs);
            const stopsText = stopsLabel(flight.stops, viaCodes);
            // One row per real leg so connections are visible; fall back to the whole journey.
            const segments =
              legs.length > 1
                ? legs.map((leg, legIdx) => ({
                    code: leg.flight_number || flight.id,
                    date: displayDate,
                    route: `${leg.origin} ➔ ${leg.destination}`,
                    class: flight.cabin_class || "E1/Economy",
                    timing: `${leg.departureTime || "—"} - ${leg.arrivalTime || "—"}`,
                    duration: leg.duration || "",
                    seatsCode:
                      legIdx < legs.length - 1 && legLayovers[legIdx]
                        ? `Layover ${legLayovers[legIdx].label || "—"}`
                        : "Final leg",
                  }))
                : [
                    {
                      code: flight.id,
                      date: displayDate,
                      route: routeLabel,
                      class: flight.cabin_class || "E1/Economy",
                      timing: `${flight.departureTime} - ${flight.arrivalTime}`,
                      duration: flight.duration,
                      seatsCode: stopsText,
                    },
                  ];

            return (
              <div
                key={uniqueKey}
                role={selectMode ? "button" : undefined}
                tabIndex={selectMode ? 0 : undefined}
                onClick={() => {
                  if (!(isB2bRoute || selectMode)) return;
                  setCurrentSelectedId(uniqueKey);
                  if (!isReturnFlight && onSelectFlight) {
                    console.log("[FlightResults] card select", {
                      uniqueKey,
                      flightId: flight.id,
                      forceSelectMode,
                      route: `${flight.origin}->${flight.destination}`,
                      travel_date: flight.travel_date || legTravelDate,
                    });
                    onSelectFlight({
                      ...flight,
                      travel_date: flight.travel_date || legTravelDate || flight.travel_date,
                    });
                  }
                }}
                onKeyDown={(e) => {
                  if (!selectMode) return;
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setCurrentSelectedId(uniqueKey);
                    if (!isReturnFlight && onSelectFlight) {
                      onSelectFlight({
                        ...flight,
                        travel_date: flight.travel_date || legTravelDate || flight.travel_date,
                      });
                    }
                  }
                }}
                className={cn(
                  "bg-white border border-slate-200 rounded-2xl shadow-[0_4px_16px_rgba(0,0,0,0.02)] overflow-hidden hover:shadow-md transition-shadow duration-300",
                  selectMode && "cursor-pointer",
                  isSelected && forceSelectMode && "ring-2 ring-[#D60D26] ring-offset-1"
                )}
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
                  <div className="flex flex-col items-center justify-center px-6 py-4 border-r border-slate-200 min-w-[160px] text-center">
                    <span className="text-[#121121] text-[13px] font-[800]">{stopsText}</span>
                    {legLayovers.length > 0 && (
                      <span className="text-[11px] font-semibold text-slate-400 mt-0.5">
                        Layover {legLayovers.map((l) => l.label || "—").join(" + ")}
                      </span>
                    )}
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

                    {!isB2bRoute && !selectMode && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleBookClick(flight);
                        }}
                        className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-5 py-2 font-bold text-sm shadow-sm transition-transform active:scale-95 flex items-center justify-center gap-1.5 ml-4"
                      >
                        Book Now <ArrowUpRight className="w-4 h-4" strokeWidth={3} />
                      </button>
                    )}
                    {!isB2bRoute && forceSelectMode && isSelected && (
                      <span className="ml-4 bg-emerald-500 text-white text-[12px] font-bold px-4 py-1.5 rounded-full">
                        Selected
                      </span>
                    )}
                    {!isB2bRoute && selectMode && !forceSelectMode && (flight.meal_available || flight.food_onboard) && (
                      <span className="text-[11px] font-bold text-green-700 ml-2">Meals</span>
                    )}
                  </div>

                </div>
                {/* White Body Segment list */}
                <div className="flex flex-col bg-white">
                  {segments.map((seg, sIdx) => (
                    <div
                      key={sIdx}
                      onClick={(e) => {
                        // Card already handles selection; stop duplicate bubbling noise
                        e.stopPropagation();
                        if (isB2bRoute || selectMode) {
                          setCurrentSelectedId(uniqueKey);
                          if (!isReturnFlight && onSelectFlight) {
                            onSelectFlight({
                              ...flight,
                              travel_date: flight.travel_date || legTravelDate || flight.travel_date,
                            });
                          }
                        }
                      }}
                      className="grid grid-cols-[auto_1fr_1.2fr_1fr_1fr_1.5fr_1fr_1fr_auto] gap-x-4 gap-y-2 items-center px-6 py-5 border-b border-slate-100 hover:bg-slate-50/60 transition-colors last:border-b-0 cursor-pointer"
                    >

                      {/* Radio circle selector — one per flight, not per leg */}
                      <div className="flex items-center justify-center pr-2">
                        {sIdx === 0 ? (
                          <div className={cn("w-[15px] h-[15px] rounded-full border flex items-center justify-center transition-colors", isSelected ? "border-[#D60D26]" : "border-slate-300")}>
                            <div className={cn("w-[9px] h-[9px] rounded-full transition-colors", isSelected ? "bg-[#D60D26]" : "bg-transparent")}></div>
                          </div>
                        ) : (
                          <div className="w-[15px] h-[15px]" />
                        )}
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
                      className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-8 h-10 font-bold text-sm flex items-center justify-center gap-2 shadow-sm transition-transform active:scale-95"
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

  /** Yatra-style compact cards for side-by-side / tabbed round-trip. */
  const renderRoundTripColumn = (
    flightList: Flight[],
    isReturnFlight: boolean,
    columnTitle: string,
    columnSub: string
  ) => {
    const currentSelectedId = isReturnFlight ? selectedReturnId : selectedOutboundId;
    const setCurrentSelectedId = isReturnFlight ? setSelectedReturnId : setSelectedOutboundId;

    return (
      <div className="flex min-h-0 flex-col">
        <div className="mb-3 sticky top-0 z-10 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
          <p className="text-[15px] font-black text-[#121121]">{columnTitle}</p>
          <p className="text-[12px] font-semibold text-slate-500">{columnSub}</p>
        </div>

        {flightList.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-white px-4 py-10 text-center text-sm font-bold text-slate-400">
            No flights match filters
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {flightList.map((flight, idx) => {
              const uniqueKey = `${flight.flight_key || flight.id}-${idx}`;
              const isSelected = currentSelectedId === uniqueKey;
              const airlineCode = flight.airline_code || flight.id.split("-")[0];
              const flightNo = flight.id.includes("-")
                ? flight.id
                : `${airlineCode}-${flight.id}`;
              const travelDate = flight.travel_date || (isReturnFlight ? returnDate : departureDate);
              let dateLabel = "—";
              if (travelDate) {
                try {
                  dateLabel = format(parseISO(travelDate), "d MMM");
                } catch {
                  dateLabel = travelDate;
                }
              }
              const cardVia = flight.via?.length ? flight.via : viaAirports(flight.segments);
              const cardLayovers = flight.layovers?.length
                ? flight.layovers
                : layoversFromSegments(flight.segments);
              const cardStopsLabel = stopsLabel(flight.stops, cardVia);

              return (
                <button
                  key={uniqueKey}
                  type="button"
                  onClick={() => setCurrentSelectedId(uniqueKey)}
                  className={cn(
                    "w-full text-left bg-white rounded-xl border overflow-hidden transition-all shadow-sm hover:shadow-md",
                    isSelected
                      ? "border-[#377BD7] ring-1 ring-[#377BD7]"
                      : "border-slate-200"
                  )}
                >
                  <div className="flex items-start justify-between gap-3 px-3.5 pt-3.5 pb-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center">
                        <img
                          src={`/airlines/${airlineCode}.png`}
                          alt={flight.airline}
                          className="max-h-full max-w-full object-contain"
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                          }}
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-[13px] font-bold text-[#121121]">{flight.airline}</p>
                        <p className="truncate text-[11px] font-semibold text-slate-500">{flightNo}</p>
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-2.5">
                      <span className="text-[18px] font-black tracking-tight text-[#121121]">
                        ₹{flight.price.toLocaleString("en-IN")}
                      </span>
                      <span
                        className={cn(
                          "flex h-[18px] w-[18px] items-center justify-center rounded-full border-2",
                          isSelected ? "border-[#D60D26]" : "border-slate-300"
                        )}
                        aria-hidden
                      >
                        <span
                          className={cn(
                            "h-[10px] w-[10px] rounded-full",
                            isSelected ? "bg-[#D60D26]" : "bg-transparent"
                          )}
                        />
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 px-3.5 pb-3.5 pt-1">
                    <div className="min-w-0">
                      <p className="truncate text-[12px] font-bold text-[#121121]">
                        {flight.origin}
                      </p>
                      <p className="text-[20px] font-black leading-tight text-[#121121]">
                        {flight.departureTime}
                      </p>
                      <p className="text-[11px] font-semibold text-slate-500">{dateLabel}</p>
                    </div>

                    <div className="flex flex-col items-center px-1 text-center">
                      <span className="text-[11px] font-bold text-slate-500">{flight.duration}</span>
                      <div className="my-1 h-px w-14 bg-slate-300" />
                      <span className="text-[11px] font-semibold text-slate-400">{cardStopsLabel}</span>
                      {cardLayovers.length > 0 && (
                        <span className="text-[10px] font-semibold text-slate-400">
                          Layover {cardLayovers.map((l) => l.label || "—").join(" + ")}
                        </span>
                      )}
                    </div>

                    <div className="min-w-0 text-right">
                      <p className="truncate text-[12px] font-bold text-[#121121]">
                        {flight.destination}
                      </p>
                      <p className="text-[20px] font-black leading-tight text-[#121121]">
                        {flight.arrivalTime}
                      </p>
                      <p className="text-[11px] font-semibold text-slate-500">{dateLabel}</p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  const canContinue = Boolean(selectedOutbound && (!isRoundTrip || selectedReturn));
  const totalSelectedPrice =
    (selectedOutbound?.price ?? 0) + (selectedReturn?.price ?? 0) + priorLegsFareTotal;

  const outboundColumnTitle = `${searchOrigin || filteredOutbound[0]?.origin || "Outbound"} → ${searchDestination || filteredOutbound[0]?.destination || ""}`;
  const returnColumnTitle = `${searchDestination || filteredReturn[0]?.origin || "Return"} → ${searchOrigin || filteredReturn[0]?.destination || ""}`;
  const outboundColumnSub = departureDate
    ? (() => {
        try {
          return format(parseISO(departureDate), "EEE, d MMM yyyy");
        } catch {
          return departureDate;
        }
      })()
    : "Departure";
  const returnColumnSub = returnDate
    ? (() => {
        try {
          return format(parseISO(returnDate), "EEE, d MMM yyyy");
        } catch {
          return returnDate;
        }
      })()
    : "Return";

  return (
    <div className="flex flex-col lg:flex-row gap-8 w-full max-w-[1440px] mx-auto select-none mt-4 animate-in fade-in slide-in-from-bottom-2 duration-300">

      {/* Left Column: Accordion Filters Panel */}
      <aside className="w-full lg:w-[285px] shrink-0 lg:self-start">
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm sticky top-24 max-h-[calc(100dvh-6.5rem)] flex flex-col overflow-hidden">

          <div className="flex items-center gap-2.5 text-[15px] font-[800] text-[#121121] p-5 pb-4 border-b border-slate-100 shrink-0">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#D60D26" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
            </svg>
            <span>Filters :</span>
          </div>

          <div className="flex flex-col overflow-y-auto overscroll-contain p-5 pt-2 min-h-0">

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
                    min={priceBounds.min}
                    max={priceBounds.max || 15000}
                    value={Math.min(maxPrice, priceBounds.max || 15000)}
                    onChange={(e) => setMaxPrice(parseInt(e.target.value, 10))}
                    className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary"
                  />
                  <div className="flex justify-between text-xs font-bold text-slate-500 mt-2">
                    <span>₹{priceBounds.min.toLocaleString("en-IN")}</span>
                    <span>Max: ₹{Math.min(maxPrice, priceBounds.max || 15000).toLocaleString("en-IN")}</span>
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

        {/* Flight Lists — round-trip: Yatra side-by-side (desktop) + tabs (mobile) */}
        {isRoundTrip ? (
          <div className="flex flex-col gap-4">
            {/* Mobile tabs */}
            <div className="lg:hidden">
              <div className="mb-3 grid grid-cols-2 gap-1 rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
                <button
                  type="button"
                  onClick={() => setRtMobileTab("outbound")}
                  className={cn(
                    "rounded-lg px-3 py-2.5 text-[13px] font-bold transition-colors",
                    rtMobileTab === "outbound"
                      ? "bg-[#377BD7] text-white shadow-sm"
                      : "text-slate-600 hover:bg-slate-50"
                  )}
                >
                  Outbound
                  {selectedOutbound ? " ✓" : ""}
                </button>
                <button
                  type="button"
                  onClick={() => setRtMobileTab("return")}
                  className={cn(
                    "rounded-lg px-3 py-2.5 text-[13px] font-bold transition-colors",
                    rtMobileTab === "return"
                      ? "bg-[#377BD7] text-white shadow-sm"
                      : "text-slate-600 hover:bg-slate-50"
                  )}
                >
                  Return
                  {selectedReturn ? " ✓" : ""}
                </button>
              </div>
              {rtMobileTab === "outbound"
                ? renderRoundTripColumn(
                    filteredOutbound,
                    false,
                    outboundColumnTitle,
                    outboundColumnSub
                  )
                : renderRoundTripColumn(
                    filteredReturn,
                    true,
                    returnColumnTitle,
                    returnColumnSub
                  )}
            </div>

            {/* Desktop: two columns like Yatra */}
            <div className="hidden lg:grid lg:grid-cols-2 lg:gap-4 lg:items-start">
              {renderRoundTripColumn(
                filteredOutbound,
                false,
                outboundColumnTitle,
                outboundColumnSub
              )}
              {renderRoundTripColumn(
                filteredReturn,
                true,
                returnColumnTitle,
                returnColumnSub
              )}
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-8">
            {renderFlightCards(filteredOutbound, false, listTitle)}
          </div>
        )}

        {selectionError && (
          <p className="text-sm font-bold text-[#D60D26] mt-4">{selectionError}</p>
        )}

      </section>

      {!hideStickyBar &&
        (selectMode || forceSelectMode || isRoundTrip) && (
        <div className="fixed bottom-0 left-0 right-0 z-[90] bg-white border-t border-slate-200 shadow-[0_-8px_30px_rgba(0,0,0,0.08)] px-4 py-4">
          <div className="max-w-[1440px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-sm w-full sm:w-auto min-w-0">
              {forceSelectMode ? (
                <p className="font-semibold text-slate-700">
                  {selectionHint || "Select a flight for this sector"}
                  {selectedOutbound ? " · ✓ Selected" : ""}
                </p>
              ) : isRoundTrip ? (
                <div className="flex flex-col gap-0.5">
                  <p className="font-semibold text-slate-700">
                    {selectedOutbound
                      ? `${selectedOutbound.origin} → ${selectedOutbound.destination} · ${selectedOutbound.departureTime}`
                      : "Select outbound"}
                    {"  ·  "}
                    {selectedReturn
                      ? `${selectedReturn.origin} → ${selectedReturn.destination} · ${selectedReturn.departureTime}`
                      : "Select return"}
                  </p>
                  {canContinue && (
                    <p className="text-xs text-slate-500">
                      Combined from ₹{(totalSelectedPrice * (adults + children)).toLocaleString("en-IN")}
                    </p>
                  )}
                </div>
              ) : (
                <p className="font-semibold text-slate-700">
                  {selectedOutbound ? "Flight selected" : "Select a flight to continue"}
                </p>
              )}
              {canContinue && !isRoundTrip && (
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
              {continueButtonLabel ||
                (isRoundTrip ? "Book Now" : "Continue to booking")}
              <ArrowUpRight className="w-5 h-5" strokeWidth={2.5} />
            </button>
          </div>
        </div>
      )}

      {(selectMode || forceSelectMode || isRoundTrip) && !hideStickyBar && <div className="h-24" />}

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
