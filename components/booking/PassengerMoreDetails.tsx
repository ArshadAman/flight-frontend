"use client";

import { useEffect, useMemo, useState } from "react";
import { Armchair, Utensils } from "lucide-react";
import JsBarcode from "jsbarcode";
import { getPublicApiUrl } from "@/lib/apiConfig";

function parseDate(dateVal: any): Date {
  if (!dateVal) return new Date();
  if (dateVal instanceof Date) return dateVal;
  const d = new Date(dateVal);
  if (!isNaN(d.getTime())) return d;
  
  // Try custom UAT format parse: MM/DD/YYYY HH:MM
  try {
    const [datePart, timePart] = String(dateVal).split(" ");
    if (datePart) {
      const [month, day, year] = datePart.split("/");
      if (month && day && year) {
        let hour = 0, min = 0;
        if (timePart) {
          const [h, m] = timePart.split(":");
          hour = parseInt(h) || 0;
          min = parseInt(m) || 0;
        }
        return new Date(parseInt(year), parseInt(month) - 1, parseInt(day), hour, min);
      }
    }
  } catch (e) {
    console.error("Error parsing date:", dateVal, e);
  }
  return new Date();
}

function formatDate(dateVal: any): string {
  const d = parseDate(dateVal);
  const day = String(d.getDate()).padStart(2, '0');
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const month = months[d.getMonth()];
  const year = d.getFullYear();
  return `${day} ${month} ${year}`;
}

function cleanFlightNumber(fn: any): string {
  if (!fn) return "000";
  const clean = String(fn).replace(/^[A-Za-z0-9]*[A-Za-z][A-Za-z0-9]*[- ]*/, "");
  return clean || String(fn);
}

// Mock generator for SSR options to ensure offline/mock bookings work seamlessly
function getMockSSRData(ticket: any, segments: any[]) {
  const flightId = ticket?.id || "5416863216316396891";
  
  const AirSeatMaps = segments.map((seg) => {
    const segmentId = seg.segment_id;
    const rows = [];
    const occupiedSeats = new Set(["1A", "1D", "2F", "3B", "4C", "4D", "6A", "7E", "9B", "10F"]);
    
    for (let r = 1; r <= 10; r++) {
      const seatDetails = ["A", "B", "C", "D", "E", "F"].map((col) => {
        const seatName = `${r}${col}`;
        const isOccupied = occupiedSeats.has(seatName);
        const amount = r <= 2 ? 899 : 399;
        
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

    return {
      SSRDetails: [...mealOptions]
    };
  });

  return { AirSeatMaps, SSRFlightDetails };
}

export function PassengerMoreDetails({ ticket }: { ticket?: any }) {
  const hasLivePassengers = ticket && ticket.passengers_data && ticket.passengers_data.length > 0;
  const displayTicketPnr = ticket?.status === "PENDING" ? "PENDING" : (ticket?.pnr_number || ticket?.ticket_number || "XYR9NF");
  const checkinBaggage = ticket?.baggage_check_in || "25Kg";

  const [ssrDetails, setSsrDetails] = useState<any[]>([]);
  const [seatMaps, setSeatMaps] = useState<any[]>([]);

  // Format Segments
  const segments = useMemo(() => {
    let outbound: any[] = [];
    let return_segments: any[] = [];

    if (ticket && Array.isArray(ticket.segments_data) && ticket.segments_data.length > 0) {
      outbound = ticket.segments_data.filter((seg: any) => seg.return_flight === false || !seg.return_flight);
      return_segments = ticket.segments_data.filter((seg: any) => seg.return_flight === true);
    }

    if (outbound.length === 0) {
      outbound = [{
        segment_id: 0,
        departure_datetime: ticket?.departure_datetime || new Date().toISOString(),
        airline_code: ticket?.airline_code || "AI",
        flight_number: ticket?.flight_number || "2014",
        origin: ticket?.origin || "DEL",
        destination: ticket?.destination || "BOM",
        return_flight: false
      }];
    } else {
      outbound = outbound.map((seg, idx) => ({
        segment_id: seg.segment_id ?? idx,
        departure_datetime: seg.departure_datetime || ticket?.departure_datetime || new Date().toISOString(),
        airline_code: seg.airline_code || ticket?.airline_code || "AI",
        flight_number: seg.flight_number || ticket?.flight_number || "2014",
        origin: seg.origin || ticket?.origin || "DEL",
        destination: seg.destination || ticket?.destination || "BOM",
        return_flight: false
      }));
    }

    if (ticket?.travel_type === 1 && return_segments.length === 0) {
      return_segments = [{
        segment_id: outbound.length,
        departure_datetime: ticket?.arrival_datetime || new Date(new Date(ticket?.departure_datetime || Date.now()).getTime() + 24 * 60 * 60 * 1000).toISOString(),
        airline_code: ticket?.airline_code || "AI",
        flight_number: ticket?.flight_number || "2014",
        origin: ticket?.destination || "BOM",
        destination: ticket?.origin || "DEL",
        return_flight: true
      }];
    } else {
      return_segments = return_segments.map((seg, idx) => ({
        segment_id: seg.segment_id ?? (outbound.length + idx),
        departure_datetime: seg.departure_datetime || ticket?.arrival_datetime || new Date().toISOString(),
        airline_code: seg.airline_code || ticket?.airline_code || "AI",
        flight_number: seg.flight_number || ticket?.flight_number || "2014",
        origin: seg.origin || ticket?.destination || "BOM",
        destination: seg.destination || ticket?.origin || "DEL",
        return_flight: true
      }));
    }

    return [...outbound, ...return_segments];
  }, [ticket]);

  // Fetch GDS/mock SSR options on mount/ticket change
  useEffect(() => {
    if (!ticket || !ticket.id) return;
    const isMockupId = ticket.id.startsWith("31241");
    const token = typeof window !== "undefined" ? localStorage.getItem("access_token") || localStorage.getItem("mock-access-token") : null;

    if (isMockupId || !token) {
      const mockData = getMockSSRData(ticket, segments);
      setSsrDetails(mockData.SSRFlightDetails);
      setSeatMaps(mockData.AirSeatMaps);
      return;
    }

    const fetchSSR = async () => {
      try {
        const apiBase = getPublicApiUrl();
        const res = await fetch(`${apiBase}/tickets/${ticket.id}/ssr/`, {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });
        if (res.ok) {
          const data = await res.json();
          setSsrDetails(data.SSRFlightDetails || []);
          setSeatMaps(data.AirSeatMaps || []);
        } else {
          const mockData = getMockSSRData(ticket, segments);
          setSsrDetails(mockData.SSRFlightDetails);
          setSeatMaps(mockData.AirSeatMaps);
        }
      } catch (err) {
        console.warn("Failed to fetch GDS SSR, using mockup fallbacks:", err);
        const mockData = getMockSSRData(ticket, segments);
        setSsrDetails(mockData.SSRFlightDetails);
        setSeatMaps(mockData.AirSeatMaps);
      }
    };

    fetchSSR();
  }, [ticket, segments]);

  const passengers = useMemo(() => {
    // Extract outbound and return segments for barcode construction
    const outbound = segments.filter((seg) => !seg.return_flight);
    const return_segments = segments.filter((seg) => seg.return_flight);

    const basePassengers = hasLivePassengers
      ? ticket.passengers_data.map((pax: any, idx: number) => ({
          no: idx + 1,
          firstName: (pax.first_name || "GUEST").toUpperCase().trim(),
          lastName: (pax.last_name || "PASSENGER").toUpperCase().trim(),
          name: `${pax.title || "MR"}. ${pax.first_name || ""} ${pax.last_name || ""}`.toUpperCase().trim(),
          eticket: displayTicketPnr
        }))
      : [
          { no: 1, firstName: "HARSHIT", lastName: "CHIRGANIA", name: "MR. HARSHIT CHIRGANIA", eticket: displayTicketPnr },
          { no: 2, firstName: "VAIBHAV", lastName: "ARORA", name: "MR. VAIBHAV ARORA", eticket: displayTicketPnr }
        ];

    return basePassengers.map((pax: any) => {
      // Construct dynamic barcode string
      const paxName = `${pax.lastName}/${pax.firstName}`;
      const pnr = displayTicketPnr;
      
      const firstLegDepartureDate = formatDate(outbound[0].departure_datetime);
      const secondLegDepartureDate = formatDate(outbound[1]?.departure_datetime || outbound[0].departure_datetime);
      const carrierCode = outbound[0].airline_code || "AI";
      const firstFlightLegNumber = cleanFlightNumber(outbound[0].flight_number);
      const secondFlightLegNumber = cleanFlightNumber(outbound[1]?.flight_number || outbound[0].flight_number);
      const departureStation = outbound[0].origin || "DEL";
      const arrivalStation = outbound[outbound.length - 1].destination || "BOM";

      let barcodeString = `${paxName} ${pnr} ${firstLegDepartureDate} ${secondLegDepartureDate} ${carrierCode} ${firstFlightLegNumber} ${secondFlightLegNumber} ...`;

      try {
        barcodeString = `${paxName} ${pnr} ${firstLegDepartureDate} ${secondLegDepartureDate} ${carrierCode} ${firstFlightLegNumber} ${secondFlightLegNumber} ${departureStation} ${arrivalStation}`;
      } catch (err) {
        console.error("Barcode format error:", err);
      }

      if (ticket?.travel_type === 1 && return_segments.length > 0) {
        const firstLegDepartureDateofReturnSegment = formatDate(return_segments[0].departure_datetime);
        const secondLegDepartureDateofReturnSegment = formatDate(return_segments[1]?.departure_datetime || return_segments[0].departure_datetime);
        const carrierCodeReturn = return_segments[0].airline_code || "AI";
        const firstFlightLegNumberofReturnSegment = cleanFlightNumber(return_segments[0].flight_number);
        const secondFlightLegNumberofReturnSegment = cleanFlightNumber(return_segments[1]?.flight_number || return_segments[0].flight_number);
        const departureStationofReturnSegment = return_segments[0].origin || "BOM";
        const arrivalStationofReturnSegment = return_segments[return_segments.length - 1].destination || "DEL";

        barcodeString += ` ${firstLegDepartureDateofReturnSegment} ${secondLegDepartureDateofReturnSegment} ${carrierCodeReturn} ${firstFlightLegNumberofReturnSegment} ${secondFlightLegNumberofReturnSegment} ${departureStationofReturnSegment} ${arrivalStationofReturnSegment}`;
      }

      return {
        ...pax,
        barcodeString
      };
    });
  }, [ticket, hasLivePassengers, displayTicketPnr, segments]);

  useEffect(() => {
    passengers.forEach((p: any) => {
      try {
        const element = document.getElementById(`barcode-${p.no}`);
        if (element && p.barcodeString) {
          JsBarcode(element, p.barcodeString, {
            format: "CODE128",
            width: 1.5,
            height: 50,
            displayValue: false
          });
        }
      } catch (err) {
        console.error("JsBarcode generation failed:", err);
      }
    });
  }, [passengers]);

  // Helper to lookup post-booking selection from ticket.ssr_data
  const getSelectedSSRItem = (paxId: number, segmentId: number, type: "seat" | "meal") => {
    if (!ticket?.ssr_data || !ticket.ssr_data.BookingSSRDetails) return null;
    
    const paxSsrDetails = ticket.ssr_data.BookingSSRDetails.filter((d: any) => d.Pax_Id === paxId);
    
    for (const item of paxSsrDetails) {
      const { SSR_Key, SSR_TypeName, SSR_Code, SSR_Type, Segment_Id } = item;
      const itemSegmentId = Segment_Id ?? segmentId;
      
      if (itemSegmentId !== segmentId) continue;

      if (type === "seat") {
        let resolvedSeatName = SSR_TypeName;
        if (!resolvedSeatName && SSR_Key && SSR_Key.startsWith("mock_seat_key_")) {
          const parts = SSR_Key.split("_");
          resolvedSeatName = parts[parts.length - 1]; // e.g. "4A"
        }

        for (const seatMap of seatMaps) {
          for (const segment of (seatMap.Seat_Segments || [])) {
            const segId = segment.Leg_Index ?? 0;
            if (segId === segmentId) {
              for (const row of (segment.Seat_Row || [])) {
                for (const seat of (row.Seat_Details || [])) {
                  if (seat.SSR_Key === SSR_Key || (seat.SSR_TypeName === resolvedSeatName && resolvedSeatName)) {
                    return seat;
                  }
                }
              }
            }
          }
        }
      }
      
      if (type === "meal") {
        let resolvedMealCode = SSR_Code;
        if (!resolvedMealCode && SSR_Key && SSR_Key.startsWith("mock_meal_")) {
          if (SSR_Key.includes("_veg_")) resolvedMealCode = "VGML";
          else if (SSR_Key.includes("_jain_")) resolvedMealCode = "JNML";
          else if (SSR_Key.includes("_chicken_")) resolvedMealCode = "NVML";
          else if (SSR_Key.includes("_fruit_")) resolvedMealCode = "FPML";
        }

        for (const detail of ssrDetails) {
          for (const ssr of (detail.SSRDetails || [])) {
            const segId = ssr.Segment_Id ?? 0;
            const isMeal = (ssr.SSR_TypeName || "").toUpperCase() === "MEALS";
            if (isMeal && segId === segmentId) {
              if (ssr.SSR_Key === SSR_Key || (ssr.SSR_Code === resolvedMealCode && resolvedMealCode)) {
                return ssr;
              }
            }
          }
        }
      }
    }
    return null;
  };

  const getMealFriendlyName = (code: string) => {
    const c = String(code).toLowerCase();
    if (c === "veg" || c === "vgml") return "Vegetarian Meal";
    if (c === "nonveg" || c === "nvml") return "Non-Vegetarian Meal";
    if (c === "jain" || c === "jnml") return "Jain Meal";
    if (c === "fruit" || c === "fpml") return "Fruit Platter";
    return code;
  };

  const resolveMealForPaxSegment = (paxId: number, paxObj: any, segmentId: number, isReturn: boolean) => {
    // 1. Check post-booking ssr_data
    const postMeal = getSelectedSSRItem(paxId, segmentId, "meal");
    if (postMeal) {
      return {
        name: postMeal.SSR_TypeDesc || postMeal.SSR_Code || "Special Meal",
        code: postMeal.SSR_Code || "SPML",
      };
    }
    
    // 2. Check pre-booking passengers_data
    if (paxObj) {
      const code = isReturn ? paxObj.return_meal : (paxObj.outbound_meal || paxObj.meal_code);
      if (code && code !== "none") {
        return {
          name: getMealFriendlyName(code),
          code: code.toUpperCase(),
        };
      }
    }
    
    return null;
  };

  const resolveSeatForPaxSegment = (paxId: number, segmentId: number, paxIndex: number) => {
    const postSeat = getSelectedSSRItem(paxId, segmentId, "seat");
    if (postSeat) {
      return postSeat.SSR_TypeName || postSeat.SSR_TypeDesc;
    }
    return `17${String.fromCharCode(65 + paxIndex)}`;
  };

  const getMealBadges = (nameOrCode: string) => {
    const val = String(nameOrCode).toLowerCase();
    if (val.includes("veg") || val.includes("vegetarian") || val.includes("daliya") || val.includes("jain") || val.includes("fruit") || val.includes("vgml") || val.includes("jnml")) {
      return ["VEG"];
    }
    if (val.includes("non-veg") || val.includes("chicken") || val.includes("nvml") || val.includes("nv")) {
      return ["N/V"];
    }
    return [];
  };

  return (
    <>
      <div className="w-full bg-[#F2FBFF] px-8 py-3.5 border-y border-gray-200">
        <h3 className="text-[17px] font-[750] text-[#0C2342] tracking-tight">More details:</h3>
      </div>

      <div className="p-8 flex flex-col gap-8">
        {passengers.map((p: any) => (
          <div key={p.no} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6 border-b border-gray-100 pb-8 last:border-b-0 last:pb-0">
            <div className="col-span-1 sm:col-span-2 md:col-span-4 lg:col-span-4 flex flex-col gap-4">
              <h4 className="text-[17px] font-[800] text-gray-800 tracking-tight">{p.name}</h4>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pr-10">
                <div className="col-span-1">
                  <span className="text-[14px] font-[700] text-gray-400 block mb-2">Baggage</span>
                  <div className="flex flex-col gap-1">
                    <div className="w-14 h-8 rounded border border-[#D60D26] flex items-center justify-center text-[#D60D26] shadow-sm bg-red-50 text-[13px] font-bold">{checkinBaggage}</div>
                    <span className="text-[13px] font-[600] text-gray-500">Check in bag</span>
                  </div>
                </div>

                <div className="col-span-1 md:col-span-3">
                  <span className="text-[14px] font-[700] text-gray-400 block mb-2">Segment Preferences (Seats & Meals)</span>
                  <div className="flex flex-col gap-3">
                    {segments.map((seg: any) => {
                      const isReturn = seg.return_flight === true;
                      const paxId = p.no;
                      const paxObj = hasLivePassengers ? ticket.passengers_data[p.no - 1] : null;
                      
                      const resolvedMeal = resolveMealForPaxSegment(paxId, paxObj, seg.segment_id, isReturn);
                      const resolvedSeat = resolveSeatForPaxSegment(paxId, seg.segment_id, p.no - 1);
                      const badges = resolvedMeal ? getMealBadges(resolvedMeal.name || resolvedMeal.code) : [];

                      return (
                        <div key={seg.segment_id} className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/60 p-4 rounded-2xl border border-slate-100/80">
                          <div className="text-[13px] font-extrabold text-slate-500 uppercase tracking-wider min-w-[130px]">
                            {seg.origin} → {seg.destination}
                          </div>
                          
                          <div className="flex flex-1 flex-col sm:flex-row sm:items-center gap-4 sm:gap-12">
                            {/* Seat */}
                            <div className="flex items-center gap-2">
                              <Armchair className="w-4 h-4 text-blue-600/80" fill="currentColor" strokeWidth={1} />
                              <span className="text-[13px] font-[750] text-gray-700">Seat {resolvedSeat}</span>
                            </div>

                            {/* Meal */}
                            <div className="flex items-center gap-2">
                              <Utensils className="w-4 h-4 text-emerald-600/80" strokeWidth={2} />
                              <div className="flex items-center gap-2">
                                {badges.map((b) => (
                                  <span key={b} className={`px-1.5 py-0.5 rounded text-[10px] font-black tracking-tight ${
                                    b === "VEG" ? "border border-green-200 bg-green-50 text-green-700" : "border border-red-200 bg-red-50 text-red-700"
                                  }`}>
                                    {b}
                                  </span>
                                ))}
                                <span className="text-[13px] font-[600] text-gray-600">
                                  {resolvedMeal ? resolvedMeal.name : "Standard food onboard"}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>
            </div>

            <div className="col-span-1 flex flex-col justify-end">
              <span className="text-[14px] font-[700] text-gray-400 block mb-2">Barcode</span>
              <div className="w-full h-16 bg-white border border-gray-200 flex items-center justify-center mt-1 rounded p-1">
                <svg id={`barcode-${p.no}`} className="w-full h-full max-h-12"></svg>
              </div>
              <span className="text-[14px] font-[900] text-gray-800 text-center tracking-widest mt-1">{p.eticket}</span>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
