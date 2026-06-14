"use client";

import { useEffect, useState, useMemo } from "react";
import { 
  Armchair, 
  Utensils, 
  Accessibility, 
  Loader2, 
  Info, 
  ShoppingBag,
  ArrowRight,
  UserCheck,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { type Flight } from "@/lib/flight";
import { type BookingPassenger } from "@/lib/booking";

interface PreBookingSSRSelectionProps {
  searchKey: string;
  outbound: Flight;
  returnFlight?: Flight;
  passengers: BookingPassenger[];
  onChange: (selections: SelectionsState) => void;
}

export interface Selection {
  seat?: any;
  meal?: any;
  baggage?: any;
  wheelchair?: any;
}

export interface SelectionsState {
  [key: string]: Selection; // Format: "PaxId-SegmentId" -> Selection object
}

export default function PreBookingSSRSelection({ 
  searchKey, 
  outbound, 
  returnFlight, 
  passengers, 
  onChange 
}: PreBookingSSRSelectionProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [loadingOptions, setLoadingOptions] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // GDS data fetched
  const [seatMaps, setSeatMaps] = useState<any[]>([]);
  const [ssrDetails, setSsrDetails] = useState<any[]>([]);

  // User UI states
  const [activeTab, setActiveTab] = useState<"seats" | "meals" | "assistance">("seats");
  const [activeSegmentIndex, setActiveSegmentIndex] = useState(0);
  const [activePaxId, setActivePaxId] = useState(1); // 1-indexed (index + 1)

  // User selections state
  const [selections, setSelections] = useState<SelectionsState>({});

  // 1. Format Segments
  const segments = useMemo(() => {
    const list = [
      {
        segment_id: 0,
        origin: outbound.origin,
        destination: outbound.destination,
        flight_number: outbound.id.split("-")[1] || "2014",
        airline_code: outbound.airline_code || "AI",
        airline_name: outbound.airline
      }
    ];
    if (returnFlight) {
      list.push({
        segment_id: 1,
        origin: returnFlight.origin,
        destination: returnFlight.destination,
        flight_number: returnFlight.id.split("-")[1] || "2014",
        airline_code: returnFlight.airline_code || "AI",
        airline_name: returnFlight.airline
      });
    }
    return list;
  }, [outbound, returnFlight]);

  // 2. Format Passengers
  const formattedPassengers = useMemo(() => {
    return passengers.map((p, idx) => ({
      pax_id: idx + 1,
      title: p.title || "MR",
      firstName: (p.first_name || `Passenger ${idx + 1}`).toUpperCase(),
      lastName: (p.last_name || "").toUpperCase(),
      type: p.pax_type === 0 ? "Adult" : p.pax_type === 1 ? "Child" : "Infant"
    }));
  }, [passengers]);

  const activeSegment = segments[activeSegmentIndex];
  const activePax = formattedPassengers.find(p => p.pax_id === activePaxId) || formattedPassengers[0];

  // 3. Load SSR options
  useEffect(() => {
    if (!isOpen || !searchKey) return;

    const fetchSSROptions = async () => {
      setLoadingOptions(true);
      setErrorMessage(null);

      // Check if this is a mockup search
      const isMockupSearch = searchKey.startsWith("mock");

      if (isMockupSearch) {
        setTimeout(() => {
          const mockData = getMockSSRData();
          setSeatMaps(mockData.AirSeatMaps);
          setSsrDetails(mockData.SSRFlightDetails);
          setLoadingOptions(false);
        }, 800);
        return;
      }

      try {
        const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8001/api/v1";
        const res = await fetch(`${apiBase}/flights/ssr/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            search_key: searchKey,
            flight_key: outbound.flight_key
          })
        });

        if (!res.ok) {
          throw new Error(`Failed to load SSR options (Status ${res.status})`);
        }

        const json = await res.json();
        const responseData = json.success && json.data ? json.data : json;
        setSeatMaps(responseData.AirSeatMaps || []);
        setSsrDetails(responseData.SSRFlightDetails || []);
      } catch (err: any) {
        console.warn("[PreBookingSSRSelection Warning] Live SSR fetch failed, loading mock fallback data:", err);
        const mockData = getMockSSRData();
        setSeatMaps(mockData.AirSeatMaps);
        setSsrDetails(mockData.SSRFlightDetails);
      } finally {
        setLoadingOptions(false);
      }
    };

    fetchSSROptions();
  }, [isOpen, searchKey, outbound.flight_key]);

  // Mock generator helper
  const getMockSSRData = () => {
    const flightId = outbound.id;
    
    const AirSeatMaps = segments.map((seg) => {
      const segmentId = seg.segment_id;
      const rows = [];
      const occupiedSeats = new Set(["1A", "1D", "2F", "3B", "4C", "4D", "6A", "7E", "9B", "10F"]);
      
      for (let r = 1; r <= 10; r++) {
        const seatDetails = ["A", "B", "C", "D", "E", "F"].map((col) => {
          const seatName = `${r}${col}`;
          const isOccupied = occupiedSeats.has(seatName);
          const isPremium = r <= 2;
          const amount = isPremium ? (col === "B" || col === "E" ? 699 : 899) : 399;
          
          return {
            ApplicablePaxTypes: [0, 1],
            Currency_Code: "INR",
            Flight_ID: flightId,
            Leg_Index: segmentId,
            SSR_Code: null,
            SSR_Key: `mock_seat_key_${segmentId}_${seatName}`,
            SSR_Status: isOccupied ? 1 : 0,
            SSR_Type: 3,
            SSR_TypeDesc: `SEAT - ${seatName}`,
            SSR_TypeName: seatName,
            Segment_Id: segmentId,
            Segment_Wise: true,
            Total_Amount: amount
          };
        });
        rows.push({ Seat_Details: seatDetails });
      }

      return {
        Flight_Id: flightId,
        Seat_Segments: [
          {
            Leg_Index: segmentId,
            Seat_Row: rows
          }
        ]
      };
    });

    const SSRFlightDetails = segments.map((seg) => {
      const segmentId = seg.segment_id;
      
      const mealOptions = [
        {
          SSR_Code: "JNML",
          SSR_Key: `mock_meal_jain_${segmentId}`,
          SSR_Status: 0,
          SSR_Type: 1,
          SSR_TypeDesc: "Jain Hot Meal",
          SSR_TypeName: "MEALS",
          Segment_Id: segmentId,
          Total_Amount: 250,
          Currency_Code: "INR"
        },
        {
          SSR_Code: "VGML",
          SSR_Key: `mock_meal_veg_${segmentId}`,
          SSR_Status: 0,
          SSR_Type: 1,
          SSR_TypeDesc: "Vegetarian Hot Meal",
          SSR_TypeName: "MEALS",
          Segment_Id: segmentId,
          Total_Amount: 250,
          Currency_Code: "INR"
        },
        {
          SSR_Code: "NVML",
          SSR_Key: `mock_meal_chicken_${segmentId}`,
          SSR_Status: 0,
          SSR_Type: 1,
          SSR_TypeDesc: "Chicken Hot Meal",
          SSR_TypeName: "MEALS",
          Segment_Id: segmentId,
          Total_Amount: 350,
          Currency_Code: "INR"
        },
        {
          SSR_Code: "FPML",
          SSR_Key: `mock_meal_fruit_${segmentId}`,
          SSR_Status: 0,
          SSR_Type: 1,
          SSR_TypeDesc: "Fruit Platter",
          SSR_TypeName: "MEALS",
          Segment_Id: segmentId,
          Total_Amount: 250,
          Currency_Code: "INR"
        }
      ];

      const baggageOptions = [
        {
          SSR_Code: "EB05",
          SSR_Key: `mock_baggage_5_${segmentId}`,
          SSR_Status: 0,
          SSR_Type: 0,
          SSR_TypeDesc: "Prepaid Excess Baggage 5kg",
          SSR_TypeName: "BAGGAGE",
          Segment_Id: segmentId,
          Total_Amount: 1900,
          Currency_Code: "INR"
        },
        {
          SSR_Code: "EB10",
          SSR_Key: `mock_baggage_10_${segmentId}`,
          SSR_Status: 0,
          SSR_Type: 0,
          SSR_TypeDesc: "Prepaid Excess Baggage 10kg",
          SSR_TypeName: "BAGGAGE",
          Segment_Id: segmentId,
          Total_Amount: 3800,
          Currency_Code: "INR"
        },
        {
          SSR_Code: "EB15",
          SSR_Key: `mock_baggage_15_${segmentId}`,
          SSR_Status: 0,
          SSR_Type: 0,
          SSR_TypeDesc: "Prepaid Excess Baggage 15kg",
          SSR_TypeName: "BAGGAGE",
          Segment_Id: segmentId,
          Total_Amount: 5700,
          Currency_Code: "INR"
        }
      ];

      const assistanceOptions = [
        {
          SSR_Code: "WCHR",
          SSR_Key: `mock_wheelchair_${segmentId}`,
          SSR_Status: 0,
          SSR_Type: 4,
          SSR_TypeDesc: "Wheelchair Assistance",
          SSR_TypeName: "WHEELCHAIR",
          Segment_Id: segmentId,
          Total_Amount: 0,
          Currency_Code: "INR"
        }
      ];

      return {
        SSRDetails: [...mealOptions, ...baggageOptions, ...assistanceOptions]
      };
    });

    return { AirSeatMaps, SSRFlightDetails };
  };

  // Selections updates bubbling
  const updateSelections = (newSelections: SelectionsState) => {
    setSelections(newSelections);
    onChange(newSelections);
  };

  const handleSelectSeat = (seat: any) => {
    const segmentId = activeSegment.segment_id;
    const stateKey = `${activePaxId}-${segmentId}`;
    
    const updated = { ...selections };
    if (!updated[stateKey]) updated[stateKey] = {};

    if (updated[stateKey].seat?.SSR_Key === seat.SSR_Key) {
      delete updated[stateKey].seat;
    } else {
      // Clear seat if previously selected by someone else on this segment
      Object.keys(updated).forEach(key => {
        const [_, segId] = key.split("-");
        if (parseInt(segId) === segmentId && updated[key].seat?.SSR_Key === seat.SSR_Key) {
          delete updated[key].seat;
        }
      });
      updated[stateKey].seat = seat;
    }
    updateSelections(updated);
  };

  const handleSelectMeal = (meal: any | null, paxId: number) => {
    const segmentId = activeSegment.segment_id;
    const stateKey = `${paxId}-${segmentId}`;
    
    const updated = { ...selections };
    if (!updated[stateKey]) updated[stateKey] = {};

    if (!meal) {
      delete updated[stateKey].meal;
    } else {
      updated[stateKey].meal = meal;
    }
    updateSelections(updated);
  };

  const handleSelectBaggage = (baggage: any | null, paxId: number) => {
    const segmentId = activeSegment.segment_id;
    const stateKey = `${paxId}-${segmentId}`;
    
    const updated = { ...selections };
    if (!updated[stateKey]) updated[stateKey] = {};

    if (!baggage) {
      delete updated[stateKey].baggage;
    } else {
      updated[stateKey].baggage = baggage;
    }
    updateSelections(updated);
  };

  const handleSelectWheelchair = (wheelchair: any | null, paxId: number) => {
    const segmentId = activeSegment.segment_id;
    const stateKey = `${paxId}-${segmentId}`;
    
    const updated = { ...selections };
    if (!updated[stateKey]) updated[stateKey] = {};

    if (!wheelchair) {
      delete updated[stateKey].wheelchair;
    } else {
      updated[stateKey].wheelchair = wheelchair;
    }
    updateSelections(updated);
  };

  // Selections calculation
  let ssrFees = 0;
  Object.values(selections).forEach((sel) => {
    if (sel.seat) ssrFees += parseFloat(String(sel.seat.Total_Amount || 0));
    if (sel.meal) ssrFees += parseFloat(String(sel.meal.Total_Amount || 0));
    if (sel.baggage) ssrFees += parseFloat(String(sel.baggage.Total_Amount || 0));
    if (sel.wheelchair) ssrFees += parseFloat(String(sel.wheelchair.Total_Amount || 0));
  });

  // Find GDS seats for active segment
  const segmentSeatMapObj = seatMaps.find(
    (map) => 
      map.Seat_Segments && 
      map.Seat_Segments.some((seg: any) => (seg.Leg_Index ?? 0) === activeSegment.segment_id)
  );
  
  const segmentSeatSegment = segmentSeatMapObj?.Seat_Segments?.find(
    (seg: any) => (seg.Leg_Index ?? 0) === activeSegment.segment_id
  );

  const seatRows = segmentSeatSegment?.Seat_Row || [];

  // Filter available items for active segment
  const segmentSsrObj = ssrDetails[activeSegment.segment_id] || ssrDetails[0];

  const availableSSRs = segmentSsrObj?.SSRDetails || [];
  const mealsOptions = availableSSRs.filter((ssr: any) => (ssr.SSR_TypeName || "").toUpperCase() === "MEALS");
  const baggageOptions = availableSSRs.filter((ssr: any) => {
    const name = (ssr.SSR_TypeName || "").toUpperCase();
    return name === "BAGGAGE" || name === "BAGOUTFIRST" || name === "FASTFORWARD";
  });
  const wheelchairOptions = availableSSRs.filter((ssr: any) => {
    const name = (ssr.SSR_TypeName || "").toUpperCase();
    return name === "WHEELCHAIR" || name === "WCHR";
  });

  return (
    <div className="w-full bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden mb-6 transition-all duration-300">
      
      {/* Header Accordion Trigger */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-slate-50/50 transition-colors"
      >
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-rose-50 rounded-xl flex items-center justify-center text-rose-600 shadow-sm">
            <Armchair className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-[17px] font-extrabold text-slate-800 tracking-tight">
                Select Seats, Meals & Baggage Add-ons
              </h3>
              <span className="px-2 py-0.5 bg-rose-100 text-rose-700 text-[10px] font-black rounded-full uppercase tracking-wider">
                Pre-Booking
              </span>
            </div>
            <p className="text-[13px] font-semibold text-slate-500 mt-0.5">
              Secure onboard meals, wheelchair support, and specific flight seats now
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {ssrFees > 0 && (
            <span className="px-2.5 py-0.5 bg-green-50 text-green-700 border border-green-200 text-xs font-bold rounded-lg flex items-center gap-1">
              <ShoppingBag className="w-3 h-3" />
              +₹{ssrFees.toLocaleString("en-IN")} Added
            </span>
          )}
          {isOpen ? (
            <ChevronUp className="w-5 h-5 text-slate-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-slate-400" />
          )}
        </div>
      </button>

      {/* Accordion Content */}
      {isOpen && (
        <div className="border-t border-slate-200 px-6 py-6 bg-slate-50/20">
          {loadingOptions ? (
            <div className="flex flex-col items-center justify-center py-12 gap-2">
              <Loader2 className="w-6 h-6 text-rose-600 animate-spin" />
              <p className="text-[13px] font-bold text-slate-500">Retrieving available seat map & meal options from GDS...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Left Selector Panel */}
              <div className="lg:col-span-8 flex flex-col">
                
                {/* Segment tabs */}
                {segments.length > 1 && (
                  <div className="flex border-b border-slate-200 mb-4 bg-white p-1 rounded-xl shadow-sm">
                    {segments.map((seg, idx) => (
                      <button
                        type="button"
                        key={seg.segment_id}
                        onClick={() => {
                          setActiveSegmentIndex(idx);
                        }}
                        className={`flex-1 py-2 px-3 rounded-lg text-[13px] font-extrabold flex items-center justify-center gap-2 transition-all ${
                          activeSegmentIndex === idx
                            ? "bg-slate-800 text-white shadow-sm"
                            : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"
                        }`}
                      >
                        <span>{seg.origin}</span>
                        <ArrowRight className="w-3.5 h-3.5 opacity-60" />
                        <span>{seg.destination}</span>
                        <span className="text-[9px] opacity-75 font-normal">({seg.flight_number})</span>
                      </button>
                    ))}
                  </div>
                )}

                {/* Passenger Selection Bar */}
                <div className="bg-white rounded-xl p-3 shadow-sm mb-4 border border-slate-100 flex flex-wrap items-center gap-2">
                  <span className="text-[11px] font-black text-slate-400 uppercase tracking-wider pl-1">
                    Assigning for Passenger:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {formattedPassengers.map((p) => {
                      const paxSeat = selections[`${p.pax_id}-${activeSegment.segment_id}`]?.seat;
                      return (
                        <button
                          type="button"
                          key={p.pax_id}
                          onClick={() => setActivePaxId(p.pax_id)}
                          className={`px-3 py-2 rounded-lg border text-[12px] font-bold transition-all flex items-center gap-1.5 ${
                            activePaxId === p.pax_id
                              ? "bg-rose-50 border-rose-200 text-rose-700 shadow-sm"
                              : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
                          }`}
                        >
                          <UserCheck className={`w-3.5 h-3.5 ${activePaxId === p.pax_id ? "text-rose-600" : "text-slate-400"}`} />
                          <span>
                            P{p.pax_id}: {p.firstName}
                          </span>
                          {paxSeat && (
                            <span className="px-1 py-0.2 bg-rose-600 text-white text-[9px] font-black rounded">
                              {paxSeat.SSR_TypeName}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Tabs Menu */}
                <div className="flex border-b border-slate-200 mb-4 gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveTab("seats")}
                    className={`py-2 px-4 text-[13px] font-bold border-b-2 transition-all flex items-center gap-1.5 -mb-[2px] ${
                      activeTab === "seats"
                        ? "border-rose-600 text-rose-600"
                        : "border-transparent text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    <Armchair className="w-4 h-4" />
                    Seats
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("meals")}
                    className={`py-2 px-4 text-[13px] font-bold border-b-2 transition-all flex items-center gap-1.5 -mb-[2px] ${
                      activeTab === "meals"
                        ? "border-rose-600 text-rose-600"
                        : "border-transparent text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    <Utensils className="w-4 h-4" />
                    Meals
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("assistance")}
                    className={`py-2 px-4 text-[13px] font-bold border-b-2 transition-all flex items-center gap-1.5 -mb-[2px] ${
                      activeTab === "assistance"
                        ? "border-rose-600 text-rose-600"
                        : "border-transparent text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    <Accessibility className="w-4 h-4" />
                    Baggage & Assistance
                  </button>
                </div>

                {/* Tab Contents */}
                <div className="bg-white rounded-xl border border-slate-100 p-4 shadow-sm min-h-[300px] flex flex-col justify-between">
                  
                  {/* SEATS TAB */}
                  {activeTab === "seats" && (
                    <div className="flex flex-col items-center">
                      <div className="w-full flex justify-between items-center mb-4">
                        <h4 className="text-[14px] font-extrabold text-slate-800">
                          Select seat for P{activePaxId} ({activePax.firstName})
                        </h4>
                        <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400">
                          <span className="w-2.5 h-2.5 bg-slate-100 border border-slate-300 rounded inline-block"></span> Avail
                          <span className="w-2.5 h-2.5 bg-amber-50 border border-amber-200 rounded inline-block"></span> Prem
                          <span className="w-2.5 h-2.5 bg-rose-600 rounded inline-block"></span> Select
                        </div>
                      </div>

                      {seatRows.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                          <Info className="w-6 h-6 mb-1" />
                          <p className="text-xs font-bold">No seat map returned by airline carrier for this segment.</p>
                        </div>
                      ) : (
                        <div className="w-full max-w-sm mx-auto bg-slate-50 border border-slate-200 rounded-2xl p-4">
                          <div className="w-full border-b border-dashed border-slate-300 pb-2 mb-4 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            ✈️ Front of Aircraft
                          </div>

                          <div className="grid grid-cols-7 gap-1.5 mb-2 text-center text-[10px] font-black text-slate-400">
                            <div>A</div>
                            <div>B</div>
                            <div>C</div>
                            <div className="text-[8px] font-bold text-slate-300">Aisle</div>
                            <div>D</div>
                            <div>E</div>
                            <div>F</div>
                          </div>

                          <div className="space-y-1.5">
                            {seatRows.map((rowObj: any, rIdx: number) => {
                              const seats = rowObj.Seat_Details || [];
                              const rowNo = rIdx + 1;
                              const sortedSeats = [...seats].sort((a: any, b: any) => {
                                const letterA = a.SSR_TypeName.slice(-1);
                                const letterB = b.SSR_TypeName.slice(-1);
                                return letterA.localeCompare(letterB);
                              });

                              return (
                                <div key={rIdx} className="grid grid-cols-7 gap-1.5 items-center text-center">
                                  {["A", "B", "C"].map((colLetter) => {
                                    const seat = sortedSeats.find(s => s.SSR_TypeName.slice(-1) === colLetter);
                                    return renderSeatButton(seat, colLetter);
                                  })}
                                  <div className="text-[10px] font-black text-slate-300 select-none">
                                    {rowNo}
                                  </div>
                                  {["D", "E", "F"].map((colLetter) => {
                                    const seat = sortedSeats.find(s => s.SSR_TypeName.slice(-1) === colLetter);
                                    return renderSeatButton(seat, colLetter);
                                  })}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* MEALS TAB */}
                  {activeTab === "meals" && (
                    <div className="flex-1 flex flex-col">
                      <h4 className="text-[14px] font-extrabold text-slate-800 mb-1">
                        Meal Selection
                      </h4>
                      <p className="text-[12px] font-semibold text-slate-400 mb-4">
                        Select an onboard meal for each passenger for this flight leg.
                      </p>

                      <div className="space-y-3">
                        {formattedPassengers.map((p) => {
                          const pKey = `${p.pax_id}-${activeSegment.segment_id}`;
                          const selectedMeal = selections[pKey]?.meal;

                          return (
                            <div key={p.pax_id} className="flex flex-col md:flex-row md:items-center justify-between border border-slate-100 rounded-xl p-3 hover:bg-slate-50/50 transition-colors">
                              <div>
                                <p className="text-[13px] font-extrabold text-slate-700">
                                  P{p.pax_id}: {p.firstName}
                                </p>
                                <p className="text-[11px] font-semibold text-slate-400">
                                  Segment: {activeSegment.origin} → {activeSegment.destination}
                                </p>
                              </div>
                              <div className="w-full md:w-64 mt-2 md:mt-0">
                                <select
                                  value={selectedMeal?.SSR_Key || ""}
                                  onChange={(e) => {
                                    const key = e.target.value;
                                    const mealObj = mealsOptions.find((o: any) => o.SSR_Key === key) || null;
                                    handleSelectMeal(mealObj, p.pax_id);
                                  }}
                                  className="w-full h-10 border border-slate-200 rounded-xl px-3 text-[13px] font-bold text-slate-700 bg-white focus:outline-none focus:border-rose-300"
                                >
                                  <option value="">No Meal (Standard Food on board)</option>
                                  {mealsOptions.map((opt: any) => (
                                    <option key={opt.SSR_Key} value={opt.SSR_Key}>
                                      {opt.SSR_TypeDesc} {opt.Total_Amount > 0 ? `(+₹${opt.Total_Amount})` : "(Free)"}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* ASSISTANCE & BAGGAGE TAB */}
                  {activeTab === "assistance" && (
                    <div className="flex-1 flex flex-col">
                      <h4 className="text-[14px] font-extrabold text-slate-800 mb-1">
                        Excess Baggage & Airport Assistance
                      </h4>
                      <p className="text-[12px] font-semibold text-slate-400 mb-4">
                        Add baggage upgrades or request wheelchair assistance during airport transit.
                      </p>

                      <div className="space-y-4">
                        {formattedPassengers.map((p) => {
                          const pKey = `${p.pax_id}-${activeSegment.segment_id}`;
                          const selectedBaggage = selections[pKey]?.baggage;
                          const selectedWheelchair = selections[pKey]?.wheelchair;

                          return (
                            <div key={p.pax_id} className="border border-slate-100 rounded-xl p-4 hover:bg-slate-50/50 transition-colors">
                              <h5 className="text-[13px] font-extrabold text-slate-700 mb-3 border-b border-slate-100 pb-1.5">
                                P{p.pax_id}: {p.firstName}
                              </h5>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">
                                    Baggage upgrade
                                  </label>
                                  <select
                                    value={selectedBaggage?.SSR_Key || ""}
                                    onChange={(e) => {
                                      const key = e.target.value;
                                      const baggageObj = baggageOptions.find((o: any) => o.SSR_Key === key) || null;
                                      handleSelectBaggage(baggageObj, p.pax_id);
                                    }}
                                    className="w-full h-10 border border-slate-200 rounded-xl px-3 text-[12px] font-bold text-slate-700 bg-white focus:outline-none"
                                  >
                                    <option value="">No Extra Baggage</option>
                                    {baggageOptions.map((opt: any) => (
                                      <option key={opt.SSR_Key} value={opt.SSR_Key}>
                                        {opt.SSR_TypeDesc} (+₹{opt.Total_Amount})
                                      </option>
                                    ))}
                                  </select>
                                </div>

                                <div>
                                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">
                                    Airport Assistance
                                  </label>
                                  <select
                                    value={selectedWheelchair?.SSR_Key || ""}
                                    onChange={(e) => {
                                      const key = e.target.value;
                                      const wheelchairObj = wheelchairOptions.find((o: any) => o.SSR_Key === key) || null;
                                      handleSelectWheelchair(wheelchairObj, p.pax_id);
                                    }}
                                    className="w-full h-10 border border-slate-200 rounded-xl px-3 text-[12px] font-bold text-slate-700 bg-white focus:outline-none"
                                  >
                                    <option value="">No Assistance Needed</option>
                                    {wheelchairOptions.map((opt: any) => (
                                      <option key={opt.SSR_Key} value={opt.SSR_Key}>
                                        {opt.SSR_TypeDesc} {opt.Total_Amount > 0 ? `(+₹${opt.Total_Amount})` : "(Free)"}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                </div>
              </div>

              {/* Right Summary Panel */}
              <div className="lg:col-span-4 flex flex-col gap-4">
                
                {/* SSR Choices Summary */}
                <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex flex-col justify-between h-fit">
                  <div className="mb-4">
                    <h4 className="text-[15px] font-extrabold text-slate-800 mb-3 flex items-center gap-1.5 pb-2 border-b border-slate-100">
                      <ShoppingBag className="w-4 h-4 text-rose-600" />
                      Add-on Summary
                    </h4>

                    {Object.keys(selections).length === 0 ? (
                      <p className="text-slate-400 text-[11px] font-semibold py-3 text-center">
                        No add-on services or seats selected yet.
                      </p>
                    ) : (
                      <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
                        {formattedPassengers.map((p) => {
                          const paxSelectionsList: any[] = [];
                          
                          segments.forEach((seg) => {
                            const key = `${p.pax_id}-${seg.segment_id}`;
                            const sel = selections[key];
                            if (sel) {
                              if (sel.seat) paxSelectionsList.push({ detail: `${seg.origin}-${seg.destination}: Seat ${sel.seat.SSR_TypeName}`, price: sel.seat.Total_Amount });
                              if (sel.meal) paxSelectionsList.push({ detail: `${seg.origin}-${seg.destination}: ${sel.meal.SSR_TypeDesc}`, price: sel.meal.Total_Amount });
                              if (sel.baggage) paxSelectionsList.push({ detail: `${seg.origin}-${seg.destination}: ${sel.baggage.SSR_TypeDesc}`, price: sel.baggage.Total_Amount });
                              if (sel.wheelchair) paxSelectionsList.push({ detail: `${seg.origin}-${seg.destination}: ${sel.wheelchair.SSR_TypeDesc}`, price: sel.wheelchair.Total_Amount });
                            }
                          });

                          if (paxSelectionsList.length === 0) return null;

                          return (
                            <div key={p.pax_id} className="text-[11px] font-semibold bg-slate-50/50 rounded-lg p-2.5 border border-slate-100">
                              <p className="font-extrabold text-slate-700 mb-1">
                                {p.title} {p.firstName}
                              </p>
                              <div className="space-y-0.5">
                                {paxSelectionsList.map((item: any, idx: number) => (
                                  <div key={idx} className="flex justify-between items-center text-slate-500">
                                    <span className="truncate max-w-[150px]">{item.detail}</span>
                                    <span className="text-slate-700 font-bold">₹{item.price}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  <div className="border-t border-slate-100 pt-3">
                    <div className="flex justify-between items-center text-xs font-bold text-slate-400 uppercase tracking-wider">
                      <span>Total SSR Additions</span>
                      <span className="text-green-600 font-extrabold">+₹{ssrFees.toLocaleString("en-IN")}</span>
                    </div>
                  </div>
                </div>

              </div>

            </div>
          )}
        </div>
      )}
    </div>
  );

  // Seat button rendering helper
  function renderSeatButton(seat: any, colLetter: string) {
    if (!seat) {
      return (
        <div 
          key={colLetter} 
          className="w-8 h-8 bg-slate-100/30 rounded border border-transparent"
        />
      );
    }

    const seatName = seat.SSR_TypeName;
    const isOccupied = seat.SSR_Status !== 0;
    const isPremium = parseInt(seatName) <= 2;
    const price = seat.Total_Amount;

    let selectedByPaxId = 0;
    Object.entries(selections).forEach(([key, sel]) => {
      if (sel.seat?.SSR_Key === seat.SSR_Key) {
        const [paxIdStr] = key.split("-");
        selectedByPaxId = parseInt(paxIdStr);
      }
    });

    const isSelectedByActivePax = selectedByPaxId === activePaxId;
    const isSelectedByOtherPax = selectedByPaxId > 0 && !isSelectedByActivePax;

    return (
      <button
        key={seat.SSR_Key || colLetter}
        type="button"
        disabled={isOccupied}
        onClick={() => handleSelectSeat(seat)}
        title={`${seatName} ${isOccupied ? "(Occupied)" : `(₹${price})`}`}
        className={`w-8 h-8 rounded-md text-[9px] font-black tracking-tighter flex flex-col items-center justify-center transition-all ${
          isOccupied
            ? "bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-300"
            : isSelectedByActivePax
            ? "bg-rose-600 text-white border border-rose-700 shadow-sm scale-105"
            : isSelectedByOtherPax
            ? "bg-blue-600 text-white border border-blue-700 scale-105"
            : isPremium
            ? "bg-amber-50 text-slate-700 border border-amber-200 hover:bg-amber-100"
            : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
        }`}
      >
        {isSelectedByActivePax ? (
          <span>P{activePaxId}</span>
        ) : isSelectedByOtherPax ? (
          <span>P{selectedByPaxId}</span>
        ) : isOccupied ? (
          <span className="opacity-50 select-none">✕</span>
        ) : (
          <span>{colLetter}</span>
        )}
      </button>
    );
  }
}
