"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { 
  Armchair, 
  Utensils, 
  Accessibility, 
  CheckCircle2, 
  Loader2, 
  Info, 
  Sparkles, 
  ShoppingBag,
  ArrowRight,
  UserCheck,
  ChevronDown,
  ChevronUp
} from "lucide-react";

interface PassengerData {
  first_name?: string;
  last_name?: string;
  title?: string;
  pax_type?: number;
}

interface BookingTicket {
  id?: string;
  status?: string;
  pnr_number?: string;
  ticket_number?: string;
  passengers_data?: PassengerData[];
  basic_amount?: string | number;
  tax_amount?: string | number;
  total_amount?: string | number;
  segments_data?: any[];
  origin?: string;
  destination?: string;
  flight_number?: string;
  airline_code?: string;
  airline_name?: string;
  ssr_data?: any;
}

interface SSRSelectionProps {
  ticket: BookingTicket | null;
  id: string;
  onSSRAdded?: () => void;
  isOpenExternal?: boolean;
  setIsOpenExternal?: (open: boolean) => void;
  defaultTabExternal?: "seats" | "meals" | "assistance";
}

interface Selection {
  seat?: any;
  meal?: any;
  baggage?: any;
  wheelchair?: any;
}

interface SelectionsState {
  [key: string]: Selection; // Format: "PaxId-SegmentId" -> Selection object
}

export default function SSRSelection({
  ticket,
  id,
  onSSRAdded,
  isOpenExternal,
  setIsOpenExternal,
  defaultTabExternal,
}: SSRSelectionProps) {
  const { logout, openAuthModal } = useAuth();
  const [localIsOpen, setLocalIsOpen] = useState(false);
  const isOpen = isOpenExternal !== undefined ? isOpenExternal : localIsOpen;
  const setIsOpen = setIsOpenExternal !== undefined ? setIsOpenExternal : setLocalIsOpen;

  const [loadingOptions, setLoadingOptions] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // GDS data fetched
  const [seatMaps, setSeatMaps] = useState<any[]>([]);
  const [ssrDetails, setSsrDetails] = useState<any[]>([]);

  // User UI states
  const [activeTab, setActiveTab] = useState<"seats" | "meals" | "assistance">("seats");
  const [activeSegmentIndex, setActiveSegmentIndex] = useState(0);
  const [activePaxId, setActivePaxId] = useState(1); // 1-indexed

  // User selections state
  const [selections, setSelections] = useState<SelectionsState>({});

  useEffect(() => {
    if (defaultTabExternal) {
      setActiveTab(defaultTabExternal);
    }
  }, [defaultTabExternal]);

  // 1. Format Segments
  const segments = ticket?.segments_data && ticket.segments_data.length > 0 
    ? ticket.segments_data.map((seg, idx) => ({
        segment_id: seg.segment_id ?? idx,
        origin: seg.origin || ticket.origin || "DEL",
        destination: seg.destination || ticket.destination || "BOM",
        flight_number: seg.flight_number || ticket.flight_number || "2014",
        airline_code: seg.airline_code || ticket.airline_code || "AI",
        airline_name: seg.airline_name || ticket.airline_name || "Air India"
      }))
    : [{
        segment_id: 0,
        origin: ticket?.origin || "DEL",
        destination: ticket?.destination || "BOM",
        flight_number: ticket?.flight_number || "2014",
        airline_code: ticket?.airline_code || "AI",
        airline_name: ticket?.airline_name || "Air India"
      }];

  // 2. Format Passengers
  const passengers = ticket?.passengers_data && ticket.passengers_data.length > 0
    ? ticket.passengers_data.map((pax, idx) => ({
        pax_id: idx + 1,
        title: (pax.title || "MR").toUpperCase(),
        firstName: (pax.first_name || "Guest").toUpperCase(),
        lastName: (pax.last_name || "User").toUpperCase(),
        type: pax.pax_type === 0 ? "Adult" : pax.pax_type === 1 ? "Child" : "Infant"
      }))
    : [
        { pax_id: 1, title: "MR", firstName: "HARSHIT", lastName: "CHIRGANIA", type: "Adult" },
        { pax_id: 2, title: "MR", firstName: "VAIBHAV", lastName: "ARORA", type: "Adult" }
      ];

  const activeSegment = segments[activeSegmentIndex];
  const activePax = passengers.find(p => p.pax_id === activePaxId) || passengers[0];

  // 3. Load SSR options
  useEffect(() => {
    if (!isOpen || !id) return;

    const fetchSSROptions = async () => {
      setLoadingOptions(true);
      setErrorMessage(null);

      const token = typeof window !== "undefined" ? (localStorage.getItem("access_token") || localStorage.getItem("mock-access-token")) : null;
      const isMockToken = token ? token.startsWith("mock-token") : false;
      const ticketId = ticket?.id || id;
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(ticketId);
      const isPnrPattern = /^[A-Z0-9]{6}$/i.test(ticketId);
      
      const isMockupId = id.startsWith("31241") || isMockToken || !token || (!isUuid && !isPnrPattern);

      if (isMockupId) {
        console.log("[SSRSelection] Using mock SSR options for ID:", id);
        setTimeout(() => {
          const mockData = getMockSSRData();
          setSeatMaps(mockData.AirSeatMaps);
          setSsrDetails(mockData.SSRFlightDetails);
          
          // Pre-populate selections from ticket ssr_data if exists
          if (ticket?.ssr_data) {
            const preSelections = initSelectionsFromSSRData(ticket.ssr_data, mockData.AirSeatMaps, mockData.SSRFlightDetails);
            setSelections(preSelections);
          }
          setLoadingOptions(false);
        }, 800);
        return;
      }

      try {
        const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8001/api/v1";
        const ticketId = ticket?.id || id;
        const res = await fetch(`${apiBase}/tickets/${ticketId}/ssr/`, {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });

        if (res.status === 401 || res.status === 403) {
          logout();
          openAuthModal();
          throw new Error("Your login session has expired. Please sign in again.");
        }

        if (!res.ok) {
          throw new Error(`Failed to load SSR options (Status ${res.status})`);
        }

        const json = await res.json();
        console.log("[SSRSelection] Loaded live GDS SSR options:", json);
        
        const responseData = json.success && json.data ? json.data : json;
        const fetchedSeatMaps = responseData.AirSeatMaps || [];
        const fetchedSsrDetails = responseData.SSRFlightDetails || [];
        
        setSeatMaps(fetchedSeatMaps);
        setSsrDetails(fetchedSsrDetails);

        // Pre-populate selections from ticket ssr_data if exists
        if (ticket?.ssr_data) {
          const preSelections = initSelectionsFromSSRData(ticket.ssr_data, fetchedSeatMaps, fetchedSsrDetails);
          setSelections(preSelections);
        }
      } catch (err: any) {
        console.warn("[SSRSelection Warning] Live SSR fetch failed, loading mock fallback data:", err);
        const mockData = getMockSSRData();
        setSeatMaps(mockData.AirSeatMaps);
        setSsrDetails(mockData.SSRFlightDetails);
        
        if (ticket?.ssr_data) {
          const preSelections = initSelectionsFromSSRData(ticket.ssr_data, mockData.AirSeatMaps, mockData.SSRFlightDetails);
          setSelections(preSelections);
        }
      } finally {
        setLoadingOptions(false);
      }
    };

    fetchSSROptions();
  }, [isOpen, id, ticket?.ssr_data]);

  // Mock generator inside component helper
  const getMockSSRData = () => {
    const flightId = ticket?.id || "5416863216316396891";
    
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

  const initSelectionsFromSSRData = (ssrData: any, seatMaps: any[], ssrDetails: any[]) => {
    const initialSelections: SelectionsState = {};
    if (!ssrData || !ssrData.BookingSSRDetails) return initialSelections;

    ssrData.BookingSSRDetails.forEach((item: any) => {
      const { Pax_Id, SSR_Key, SSR_TypeName, SSR_Code, SSR_Type, Segment_Id } = item;
      
      // Try resolving seat name from fallback mock pattern
      let resolvedSeatName = SSR_TypeName;
      if (!resolvedSeatName && SSR_Key && SSR_Key.startsWith("mock_seat_key_")) {
        const parts = SSR_Key.split("_");
        resolvedSeatName = parts[parts.length - 1]; // e.g. "4A"
      }
      
      // Try resolving meal code from fallback mock pattern
      let resolvedMealCode = SSR_Code;
      if (!resolvedMealCode && SSR_Key && SSR_Key.startsWith("mock_meal_")) {
        if (SSR_Key.includes("_veg_")) resolvedMealCode = "VGML";
        else if (SSR_Key.includes("_jain_")) resolvedMealCode = "JNML";
        else if (SSR_Key.includes("_chicken_")) resolvedMealCode = "NVML";
        else if (SSR_Key.includes("_fruit_")) resolvedMealCode = "FPML";
      }

      const itemSegmentId = Segment_Id ?? 0;

      // Check if it's a seat
      const isSeat = SSR_Type === 3 || resolvedSeatName || (!SSR_Code && SSR_TypeName);

      if (isSeat) {
        // Check seat maps
        let foundSeat: any = null;
        let seatSegmentId = itemSegmentId;
        
        for (const seatMap of seatMaps) {
          for (const segment of (seatMap.Seat_Segments || [])) {
            const segId = segment.Leg_Index ?? 0;
            for (const row of (segment.Seat_Row || [])) {
              for (const seat of (row.Seat_Details || [])) {
                if (seat.SSR_Key === SSR_Key || (seat.SSR_TypeName === resolvedSeatName && resolvedSeatName && segId === seatSegmentId)) {
                  foundSeat = seat;
                  seatSegmentId = segId;
                  break;
                }
              }
              if (foundSeat) break;
            }
            if (foundSeat) break;
          }
          if (foundSeat) break;
        }

        if (foundSeat) {
          const stateKey = `${Pax_Id}-${seatSegmentId}`;
          if (!initialSelections[stateKey]) initialSelections[stateKey] = {};
          initialSelections[stateKey].seat = foundSeat;
          return;
        } else {
          // Robust Fallback: Initialize mock seat so summary/badges render even if seat maps list is empty
          const stateKey = `${Pax_Id}-${itemSegmentId}`;
          if (!initialSelections[stateKey]) initialSelections[stateKey] = {};
          initialSelections[stateKey].seat = {
            SSR_Key: SSR_Key,
            SSR_TypeName: resolvedSeatName || SSR_TypeName || "Seat",
            Total_Amount: 0,
            Currency_Code: "INR",
            Segment_Id: itemSegmentId
          };
          return;
        }
      }

      // Check SSR Details (meals, baggage, wheelchair)
      let foundSSR: any = null;
      let ssrSegmentId = itemSegmentId;
      
      for (const detail of ssrDetails) {
        for (const ssr of (detail.SSRDetails || [])) {
          const segId = ssr.Segment_Id ?? 0;
          if (ssr.SSR_Key === SSR_Key || (ssr.SSR_Code === resolvedMealCode && resolvedMealCode && segId === ssrSegmentId)) {
            foundSSR = ssr;
            ssrSegmentId = segId;
            break;
          }
        }
        if (foundSSR) break;
      }

      if (foundSSR) {
        const stateKey = `${Pax_Id}-${ssrSegmentId}`;
        if (!initialSelections[stateKey]) initialSelections[stateKey] = {};
        
        const typeName = (foundSSR.SSR_TypeName || "").toUpperCase();
        if (typeName === "MEALS") {
          initialSelections[stateKey].meal = foundSSR;
        } else if (typeName === "BAGGAGE" || typeName === "BAGOUTFIRST" || typeName === "FASTFORWARD") {
          initialSelections[stateKey].baggage = foundSSR;
        } else if (typeName === "WHEELCHAIR" || typeName === "WCHR") {
          initialSelections[stateKey].wheelchair = foundSSR;
        }
      } else {
        // Robust Fallback: Initialize minimal fallback SSR details so select dropdown / summary works
        const stateKey = `${Pax_Id}-${itemSegmentId}`;
        if (!initialSelections[stateKey]) initialSelections[stateKey] = {};
        
        const typeName = (SSR_TypeName || "").toUpperCase();
        const placeholderSSR = {
          SSR_Key: SSR_Key,
          SSR_Code: SSR_Code,
          SSR_TypeName: SSR_TypeName,
          SSR_TypeDesc: item.SSR_TypeDesc || SSR_Code || "Add-on",
          Total_Amount: 0,
          Currency_Code: "INR",
          Segment_Id: itemSegmentId
        };
        
        if (SSR_Type === 1 || typeName === "MEALS" || (SSR_Code && (SSR_Code.endsWith("ML") || SSR_Code === "VGAN" || SSR_Code === "VCSW" || SSR_Code === "VBIR"))) {
          initialSelections[stateKey].meal = placeholderSSR;
        } else if (SSR_Type === 0 || typeName === "BAGGAGE" || typeName === "BAGOUTFIRST" || typeName === "FASTFORWARD" || (SSR_Code && SSR_Code.startsWith("EB"))) {
          initialSelections[stateKey].baggage = placeholderSSR;
        } else if (SSR_Type === 4 || typeName === "WHEELCHAIR" || typeName === "WCHR" || SSR_Code === "WCHR") {
          initialSelections[stateKey].wheelchair = placeholderSSR;
        }
      }
    });

    return initialSelections;
  };

  // 4. Selections manipulation handlers
  const handleSelectSeat = (seat: any) => {
    const segmentId = activeSegment.segment_id;
    const stateKey = `${activePaxId}-${segmentId}`;
    
    const updated = { ...selections };
    if (!updated[stateKey]) updated[stateKey] = {};

    // If clicking the same seat, toggle/deselect it
    if (updated[stateKey].seat?.SSR_Key === seat.SSR_Key) {
      delete updated[stateKey].seat;
    } else {
      // Check if this seat was assigned to anyone else on this segment and free it
      Object.keys(updated).forEach(key => {
        const [paxId, segId] = key.split("-");
        if (parseInt(segId) === segmentId && updated[key].seat?.SSR_Key === seat.SSR_Key) {
          delete updated[key].seat;
        }
      });
      updated[stateKey].seat = seat;
    }
    setSelections(updated);
  };

  const handleSelectMeal = (meal: any | null) => {
    const segmentId = activeSegment.segment_id;
    const stateKey = `${activePaxId}-${segmentId}`;
    
    const updated = { ...selections };
    if (!updated[stateKey]) updated[stateKey] = {};

    if (!meal) {
      delete updated[stateKey].meal;
    } else {
      updated[stateKey].meal = meal;
    }
    setSelections(updated);
  };

  const handleSelectBaggage = (baggage: any | null) => {
    const segmentId = activeSegment.segment_id;
    const stateKey = `${activePaxId}-${segmentId}`;
    
    const updated = { ...selections };
    if (!updated[stateKey]) updated[stateKey] = {};

    if (!baggage) {
      delete updated[stateKey].baggage;
    } else {
      updated[stateKey].baggage = baggage;
    }
    setSelections(updated);
  };

  const handleSelectWheelchair = (wheelchair: any | null) => {
    const segmentId = activeSegment.segment_id;
    const stateKey = `${activePaxId}-${segmentId}`;
    
    const updated = { ...selections };
    if (!updated[stateKey]) updated[stateKey] = {};

    if (!wheelchair) {
      delete updated[stateKey].wheelchair;
    } else {
      updated[stateKey].wheelchair = wheelchair;
    }
    setSelections(updated);
  };

  // Get current active selections
  const currentKey = `${activePaxId}-${activeSegment.segment_id}`;
  const currentSelections = selections[currentKey] || {};

  // Calculate pricing
  const basePrice = parseFloat(String(ticket?.total_amount || 12000));
  let ssrFees = 0;
  
  Object.values(selections).forEach((sel) => {
    if (sel.seat) ssrFees += parseFloat(String(sel.seat.Total_Amount || 0));
    if (sel.meal) ssrFees += parseFloat(String(sel.meal.Total_Amount || 0));
    if (sel.baggage) ssrFees += parseFloat(String(sel.baggage.Total_Amount || 0));
    if (sel.wheelchair) ssrFees += parseFloat(String(sel.wheelchair.Total_Amount || 0));
  });

  const totalPrice = basePrice + ssrFees;

  // 5. Submit choices
  const handleConfirmChoices = async () => {
    setSubmitting(true);
    setSubmitStatus("loading");
    setErrorMessage(null);

    // Build payload
    const bookingSSRDetails: any[] = [];
    Object.entries(selections).forEach(([key, sel]) => {
      const [paxIdStr, segmentIdStr] = key.split("-");
      const paxId = parseInt(paxIdStr);
      const segmentId = parseInt(segmentIdStr);

      if (sel.seat?.SSR_Key) {
        bookingSSRDetails.push({ 
          Pax_Id: paxId, 
          SSR_Key: sel.seat.SSR_Key,
          SSR_TypeName: sel.seat.SSR_TypeName,
          SSR_Type: 3,
          Segment_Id: segmentId
        });
      }
      if (sel.meal?.SSR_Key) {
        bookingSSRDetails.push({ 
          Pax_Id: paxId, 
          SSR_Key: sel.meal.SSR_Key,
          SSR_Code: sel.meal.SSR_Code,
          SSR_TypeDesc: sel.meal.SSR_TypeDesc,
          SSR_Type: 1,
          Segment_Id: segmentId
        });
      }
      if (sel.baggage?.SSR_Key) {
        bookingSSRDetails.push({ 
          Pax_Id: paxId, 
          SSR_Key: sel.baggage.SSR_Key,
          SSR_Code: sel.baggage.SSR_Code,
          SSR_TypeDesc: sel.baggage.SSR_TypeDesc,
          SSR_Type: 0,
          Segment_Id: segmentId
        });
      }
      if (sel.wheelchair?.SSR_Key) {
        bookingSSRDetails.push({ 
          Pax_Id: paxId, 
          SSR_Key: sel.wheelchair.SSR_Key,
          SSR_Code: sel.wheelchair.SSR_Code,
          SSR_TypeDesc: sel.wheelchair.SSR_TypeDesc,
          SSR_Type: 4,
          Segment_Id: segmentId
        });
      }
    });

    const token = typeof window !== "undefined" ? (localStorage.getItem("access_token") || localStorage.getItem("mock-access-token")) : null;
    const isMockToken = token ? token.startsWith("mock-token") : false;
    const ticketId = ticket?.id || id;
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(ticketId);
    const isPnrPattern = /^[A-Z0-9]{6}$/i.test(ticketId);
    
    const isMockupId = id.startsWith("31241") || isMockToken || !token || (!isUuid && !isPnrPattern);

    if (isMockupId) {
      // Mock success flow
      setTimeout(() => {
        // Save to offline bookings
        if (typeof window !== "undefined") {
          try {
            const stored = localStorage.getItem("offline_bookings");
            if (stored) {
              const parsed = JSON.parse(stored);
              const updated = parsed.map((t: any) => {
                if (t.id === id || t.pnr_number === id || t.ticket_number === id) {
                  return { ...t, ssr_data: { BookingSSRDetails: bookingSSRDetails } };
                }
                return t;
              });
              localStorage.setItem("offline_bookings", JSON.stringify(updated));
            }
          } catch (e) {
            console.error("Failed to save mock SSR choices to local storage:", e);
          }
        }
        setSubmitStatus("success");
        setSubmitting(false);
        if (onSSRAdded) onSSRAdded();
      }, 1500);
      return;
    }

    try {
      const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8001/api/v1";
      const ticketId = ticket?.id || id;
      const res = await fetch(`${apiBase}/tickets/${ticketId}/ssr/add/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ BookingSSRDetails: bookingSSRDetails })
      });

      if (res.status === 401 || res.status === 403) {
        logout();
        openAuthModal();
        throw new Error("Your login session has expired. Please sign in again.");
      }

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.detail || `Server returned error status ${res.status}`);
      }

      setSubmitStatus("success");
      if (onSSRAdded) onSSRAdded();
    } catch (err: any) {
      console.error("[SSRSelection Error] Failed to confirm GDS choices:", err);
      setErrorMessage(err.message || "An unexpected error occurred while communicating with the airline provider.");
      setSubmitStatus("error");
    } finally {
      setSubmitting(false);
    }
  };

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

  // Filter GDS meals, baggage, wheelchair for active segment
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
    <div id="ssr-selection-section" className="w-full bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden mb-10 transition-all duration-300">
      
      {/* Header Accordion Trigger */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-8 py-6 flex items-center justify-between text-left hover:bg-slate-50/50 transition-colors"
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-600 shadow-sm">
            <Armchair className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-[19px] font-extrabold text-slate-800 tracking-tight">
                Seats & Special Service Requests (SSR)
              </h3>
              <span className="px-2.5 py-0.5 bg-rose-100 text-rose-700 text-[11px] font-black rounded-full uppercase tracking-wider">
                Post-Booking
              </span>
            </div>
            <p className="text-[14px] font-semibold text-slate-500 mt-0.5">
              Select seats, meals, baggage upgrades, and special assistance options
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {ssrFees > 0 && (
            <span className="px-3 py-1 bg-green-50 text-green-700 border border-green-200 text-xs font-bold rounded-lg flex items-center gap-1.5 animate-pulse">
              <ShoppingBag className="w-3.5 h-3.5" />
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
        <div className="border-t border-gray-200 px-8 py-8 bg-slate-50/30">
          {loadingOptions ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <Loader2 className="w-8 h-8 text-rose-600 animate-spin" />
              <p className="text-[14px] font-bold text-slate-500">Retrieving available seat map & meal options from carrier...</p>
            </div>
          ) : submitStatus === "success" ? (
            <div className="flex flex-col items-center justify-center py-12 text-center max-w-xl mx-auto">
              <div className="w-20 h-20 bg-green-50 border border-green-200 rounded-full flex items-center justify-center mb-6 animate-bounce shadow-md">
                <CheckCircle2 className="w-12 h-12 text-green-600" />
              </div>
              <h4 className="text-[22px] font-black text-slate-800 mb-2">SSRs Added Successfully!</h4>
              <p className="text-[15px] font-semibold text-slate-500 mb-8 leading-relaxed">
                Your selected seats, meals, and special assistance upgrades have been confirmed with the carrier and added to your ticket booking.
              </p>

              {/* Selection Summary */}
              <div className="w-full bg-white border border-gray-100 rounded-2xl p-6 shadow-sm mb-8 text-left">
                <h5 className="text-[14px] font-extrabold text-slate-400 uppercase tracking-wider mb-4">Confirmed Details</h5>
                {passengers.map((pax) => {
                  const hasSelection = segments.some((seg) => {
                    const k = `${pax.pax_id}-${seg.segment_id}`;
                    return selections[k]?.seat || selections[k]?.meal || selections[k]?.baggage || selections[k]?.wheelchair;
                  });

                  if (!hasSelection) return null;

                  return (
                    <div key={pax.pax_id} className="mb-4 last:mb-0 border-b last:border-0 border-slate-100 pb-3 last:pb-0">
                      <p className="text-[15px] font-black text-slate-700">
                        {pax.title} {pax.firstName} {pax.lastName}
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                        {segments.map((seg) => {
                          const k = `${pax.pax_id}-${seg.segment_id}`;
                          const sel = selections[k];
                          if (!sel) return null;

                          return (
                            <div key={seg.segment_id} className="text-xs font-semibold text-slate-500">
                              <span className="font-bold text-slate-700">{seg.origin} → {seg.destination}:</span>
                              <ul className="list-disc pl-4 mt-1 space-y-0.5">
                                {sel.seat && <li>Seat: <span className="font-bold text-rose-600">{sel.seat.SSR_TypeName}</span></li>}
                                {sel.meal && <li>Meal: {sel.meal.SSR_TypeDesc}</li>}
                                {sel.baggage && <li>Upgrade: {sel.baggage.SSR_TypeDesc}</li>}
                                {sel.wheelchair && <li>Assistance: {sel.wheelchair.SSR_TypeDesc}</li>}
                              </ul>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>

              <button
                onClick={() => {
                  setSubmitStatus("idle");
                  setIsOpen(false);
                }}
                className="px-8 py-3 bg-slate-800 text-white rounded-full font-bold text-[14px] hover:bg-slate-900 transition shadow-md"
              >
                Done
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* Left Selector Panel */}
              <div className="lg:col-span-8 flex flex-col">
                
                {/* Segment tabs */}
                {segments.length > 1 && (
                  <div className="flex border-b border-gray-200 mb-6 bg-white p-1.5 rounded-2xl shadow-sm">
                    {segments.map((seg, idx) => (
                      <button
                        key={seg.segment_id}
                        onClick={() => {
                          setActiveSegmentIndex(idx);
                        }}
                        className={`flex-1 py-3 px-4 rounded-xl text-[14px] font-extrabold flex items-center justify-center gap-2 transition-all ${
                          activeSegmentIndex === idx
                            ? "bg-slate-800 text-white shadow-sm"
                            : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"
                        }`}
                      >
                        <span>{seg.origin}</span>
                        <ArrowRight className="w-3.5 h-3.5 opacity-60" />
                        <span>{seg.destination}</span>
                        <span className="text-[10px] opacity-75 font-normal">({seg.flight_number})</span>
                      </button>
                    ))}
                  </div>
                )}

                {/* Passenger Selection Bar */}
                <div className="bg-white rounded-2xl p-4 shadow-sm mb-6 border border-gray-100 flex flex-wrap items-center gap-3">
                  <span className="text-[13px] font-black text-slate-400 uppercase tracking-wider pl-1">
                    Assigning for Passenger:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {passengers.map((pax) => {
                      const paxSeat = selections[`${pax.pax_id}-${activeSegment.segment_id}`]?.seat;
                      return (
                        <button
                          key={pax.pax_id}
                          onClick={() => setActivePaxId(pax.pax_id)}
                          className={`px-4 py-2.5 rounded-xl border text-[13px] font-bold transition-all flex items-center gap-2 ${
                            activePaxId === pax.pax_id
                              ? "bg-rose-50 border-rose-200 text-rose-700 shadow-sm shadow-rose-50"
                              : "bg-white border-gray-200 text-slate-600 hover:border-gray-300"
                          }`}
                        >
                          <UserCheck className={`w-4 h-4 ${activePaxId === pax.pax_id ? "text-rose-600" : "text-slate-400"}`} />
                          <span className="tracking-tight">
                            P{pax.pax_id}: {pax.firstName}
                          </span>
                          {paxSeat && (
                            <span className="px-1.5 py-0.5 bg-rose-600 text-white text-[10px] font-black rounded">
                              {paxSeat.SSR_TypeName}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Tabs Menu */}
                <div className="flex border-b border-gray-200 mb-6 gap-2">
                  <button
                    onClick={() => setActiveTab("seats")}
                    className={`py-3 px-6 text-[15px] font-bold border-b-2 transition-all flex items-center gap-2 -mb-[2px] ${
                      activeTab === "seats"
                        ? "border-rose-600 text-rose-600"
                        : "border-transparent text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    <Armchair className="w-4 h-4" />
                    Seat Selection
                  </button>
                  <button
                    onClick={() => setActiveTab("meals")}
                    className={`py-3 px-6 text-[15px] font-bold border-b-2 transition-all flex items-center gap-2 -mb-[2px] ${
                      activeTab === "meals"
                        ? "border-rose-600 text-rose-600"
                        : "border-transparent text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    <Utensils className="w-4 h-4" />
                    Meals Selection
                  </button>
                  <button
                    onClick={() => setActiveTab("assistance")}
                    className={`py-3 px-6 text-[15px] font-bold border-b-2 transition-all flex items-center gap-2 -mb-[2px] ${
                      activeTab === "assistance"
                        ? "border-rose-600 text-rose-600"
                        : "border-transparent text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    <Accessibility className="w-4 h-4" />
                    Assistance & Baggage
                  </button>
                </div>

                {/* Tab Contents */}
                <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm min-h-[380px] flex flex-col">
                  
                  {/* SEATS TAB */}
                  {activeTab === "seats" && (
                    <div className="flex flex-col items-center">
                      <div className="w-full flex justify-between items-center mb-6">
                        <div>
                          <h4 className="text-[16px] font-extrabold text-slate-800">
                            Select seat for {activePax.firstName}
                          </h4>
                          <p className="text-xs font-semibold text-slate-400 mt-0.5">
                            Click on any available seat on the grid below.
                          </p>
                        </div>
                        {/* Seat Map Legend */}
                        <div className="flex items-center gap-4 text-xs font-semibold">
                          <div className="flex items-center gap-1.5">
                            <span className="w-3.5 h-3.5 bg-slate-100 border border-slate-300 rounded"></span>
                            <span className="text-slate-500">Available</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="w-3.5 h-3.5 bg-amber-50 border border-amber-200 rounded"></span>
                            <span className="text-slate-500">Premium</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="w-3.5 h-3.5 bg-slate-200 rounded flex items-center justify-center text-[8px] text-slate-400 font-bold select-none">✕</span>
                            <span className="text-slate-500">Occupied</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="w-3.5 h-3.5 bg-rose-600 border border-rose-700 rounded"></span>
                            <span className="text-slate-500">Selected</span>
                          </div>
                        </div>
                      </div>

                      {seatRows.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                          <Info className="w-8 h-8 mb-2" />
                          <p className="text-sm font-bold">No seat map returned by airline carrier for this segment.</p>
                        </div>
                      ) : (
                        <div className="w-full max-w-lg mx-auto bg-slate-50 border border-slate-200 rounded-3xl p-6 relative">
                          
                          {/* Cabin Header representation */}
                          <div className="w-full border-b border-dashed border-slate-300 pb-4 mb-6 text-center text-xs font-bold text-slate-400 uppercase tracking-widest">
                            ✈️ Front of Aircraft
                          </div>

                          {/* Column label headers */}
                          <div className="grid grid-cols-7 gap-2 mb-4 pr-3 pl-3 text-center text-xs font-black text-slate-400">
                            <div>A</div>
                            <div>B</div>
                            <div>C</div>
                            <div className="text-[9px] font-bold text-slate-300">Aisle</div>
                            <div>D</div>
                            <div>E</div>
                            <div>F</div>
                          </div>

                          {/* Rows Visualizer */}
                          <div className="space-y-3">
                            {seatRows.map((rowObj: any, rIdx: number) => {
                              const seats = rowObj.Seat_Details || [];
                              const rowNo = rIdx + 1;

                              // Sort alphabetically A-F to guarantee alignment
                              const sortedSeats = [...seats].sort((a: any, b: any) => {
                                const letterA = a.SSR_TypeName.slice(-1);
                                const letterB = b.SSR_TypeName.slice(-1);
                                return letterA.localeCompare(letterB);
                              });

                              return (
                                <div key={rIdx} className="grid grid-cols-7 gap-2 items-center text-center">
                                  {/* Render Left: A, B, C */}
                                  {["A", "B", "C"].map((colLetter) => {
                                    const seat = sortedSeats.find(s => s.SSR_TypeName.slice(-1) === colLetter);
                                    return renderSeatButton(seat, colLetter);
                                  })}

                                  {/* Row Number in Middle Column (acting as aisle visual spacer) */}
                                  <div className="text-[12px] font-black text-slate-300 select-none">
                                    {rowNo}
                                  </div>

                                  {/* Render Right: D, E, F */}
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
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <h4 className="text-[16px] font-extrabold text-slate-800 mb-2">
                          Meal Selection for Active Flight Segment
                        </h4>
                        <p className="text-[13px] font-semibold text-slate-400 mb-6">
                          Select a meal for each passenger for this leg of the journey. Special dietary and regional options are available.
                        </p>

                        <div className="space-y-4">
                          {passengers.map((pax) => {
                            const pKey = `${pax.pax_id}-${activeSegment.segment_id}`;
                            const selectedMeal = selections[pKey]?.meal;

                            return (
                              <div key={pax.pax_id} className="flex flex-col md:flex-row md:items-center justify-between border border-slate-100 rounded-xl p-4 hover:bg-slate-50/50 transition-colors">
                                <div className="mb-2 md:mb-0">
                                  <p className="text-[14px] font-extrabold text-slate-700">
                                    {pax.title} {pax.firstName} {pax.lastName}
                                  </p>
                                  <p className="text-xs font-semibold text-slate-400">
                                    Segment: {activeSegment.origin} → {activeSegment.destination}
                                  </p>
                                </div>
                                <div className="w-full md:w-80">
                                  <select
                                    value={selectedMeal?.SSR_Key || ""}
                                    onChange={(e) => {
                                      const key = e.target.value;
                                      if (!key) {
                                        const pKey = `${pax.pax_id}-${activeSegment.segment_id}`;
                                        setSelections(prev => {
                                          const updated = { ...prev };
                                          if (updated[pKey]) delete updated[pKey].meal;
                                          return updated;
                                        });
                                      } else {
                                        const mealObj = mealsOptions.find((o: any) => o.SSR_Key === key);
                                        // Save selection under this pax ID
                                        const pKey = `${pax.pax_id}-${activeSegment.segment_id}`;
                                        setSelections(prev => ({
                                          ...prev,
                                          [pKey]: {
                                            ...(prev[pKey] || {}),
                                            meal: mealObj
                                          }
                                        }));
                                      }
                                    }}
                                    className="w-full h-11 border border-slate-200 rounded-xl px-3 text-[14px] font-bold text-slate-700 bg-white focus:outline-none focus:border-rose-300"
                                  >
                                    <option value="">No Meal (Standard Food on board)</option>
                                    {selectedMeal && !mealsOptions.some((o: any) => o.SSR_Key === selectedMeal.SSR_Key) && (
                                      <option value={selectedMeal.SSR_Key}>
                                        {selectedMeal.SSR_TypeDesc} (Selected)
                                      </option>
                                    )}
                                    {mealsOptions.map((opt: any, idx: number) => (
                                      <option key={`${opt.SSR_Key || opt.SSR_Code || idx}-${idx}`} value={opt.SSR_Key}>
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
                    </div>
                  )}

                  {/* ASSISTANCE & BAGGAGE TAB */}
                  {activeTab === "assistance" && (
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <h4 className="text-[16px] font-extrabold text-slate-800 mb-2">
                          Add Baggage Upgrades & Special Assistance
                        </h4>
                        <p className="text-[13px] font-semibold text-slate-400 mb-6">
                          Purchase additional baggage allowance or request complimentary wheelchair support for airport transit.
                        </p>

                        <div className="space-y-6">
                          {passengers.map((pax) => {
                            const pKey = `${pax.pax_id}-${activeSegment.segment_id}`;
                            const selectedBaggage = selections[pKey]?.baggage;
                            const selectedWheelchair = selections[pKey]?.wheelchair;

                            return (
                              <div key={pax.pax_id} className="border border-slate-100 rounded-xl p-5 hover:bg-slate-50/50 transition-colors">
                                <h5 className="text-[14px] font-extrabold text-slate-700 mb-3 border-b border-slate-100 pb-2">
                                  {pax.title} {pax.firstName} {pax.lastName}
                                </h5>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  {/* Baggage selector */}
                                  <div>
                                    <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-1.5">
                                      Baggage upgrade
                                    </label>
                                    <select
                                      value={selectedBaggage?.SSR_Key || ""}
                                      onChange={(e) => {
                                        const key = e.target.value;
                                        if (!key) {
                                          const pKey = `${pax.pax_id}-${activeSegment.segment_id}`;
                                          setSelections(prev => {
                                            const updated = { ...prev };
                                            if (updated[pKey]) delete updated[pKey].baggage;
                                            return updated;
                                          });
                                        } else {
                                          const baggageObj = baggageOptions.find((o: any) => o.SSR_Key === key);
                                          const pKey = `${pax.pax_id}-${activeSegment.segment_id}`;
                                          setSelections(prev => ({
                                            ...prev,
                                            [pKey]: {
                                              ...(prev[pKey] || {}),
                                              baggage: baggageObj
                                            }
                                          }));
                                        }
                                      }}
                                      className="w-full h-11 border border-slate-200 rounded-xl px-3 text-[13px] font-bold text-slate-700 bg-white focus:outline-none focus:border-rose-300"
                                    >
                                      <option value="">No Extra Baggage Allowance</option>
                                      {selectedBaggage && !baggageOptions.some((o: any) => o.SSR_Key === selectedBaggage.SSR_Key) && (
                                        <option value={selectedBaggage.SSR_Key}>
                                          {selectedBaggage.SSR_TypeDesc} (Selected)
                                        </option>
                                      )}
                                      {baggageOptions.map((opt: any, idx: number) => (
                                        <option key={`${opt.SSR_Key || opt.SSR_Code || idx}-${idx}`} value={opt.SSR_Key}>
                                          {opt.SSR_TypeDesc} (+₹{opt.Total_Amount.toLocaleString("en-IN")})
                                        </option>
                                      ))}
                                    </select>
                                  </div>

                                  {/* Wheelchair toggle */}
                                  <div>
                                    <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-1.5">
                                      Airport Assistance
                                    </label>
                                    <select
                                      value={selectedWheelchair?.SSR_Key || ""}
                                      onChange={(e) => {
                                        const key = e.target.value;
                                        if (!key) {
                                          const pKey = `${pax.pax_id}-${activeSegment.segment_id}`;
                                          setSelections(prev => {
                                            const updated = { ...prev };
                                            if (updated[pKey]) delete updated[pKey].wheelchair;
                                            return updated;
                                          });
                                        } else {
                                          const wheelchairObj = wheelchairOptions.find((o: any) => o.SSR_Key === key);
                                          const pKey = `${pax.pax_id}-${activeSegment.segment_id}`;
                                          setSelections(prev => ({
                                            ...prev,
                                            [pKey]: {
                                              ...(prev[pKey] || {}),
                                              wheelchair: wheelchairObj
                                            }
                                          }));
                                        }
                                      }}
                                      className="w-full h-11 border border-slate-200 rounded-xl px-3 text-[13px] font-bold text-slate-700 bg-white focus:outline-none focus:border-rose-300"
                                    >
                                      <option value="">No Special Assistance Needed</option>
                                      {selectedWheelchair && !wheelchairOptions.some((o: any) => o.SSR_Key === selectedWheelchair.SSR_Key) && (
                                        <option value={selectedWheelchair.SSR_Key}>
                                          {selectedWheelchair.SSR_TypeDesc} (Selected)
                                        </option>
                                      )}
                                      {wheelchairOptions.map((opt: any, idx: number) => (
                                        <option key={`${opt.SSR_Key || opt.SSR_Code || idx}-${idx}`} value={opt.SSR_Key}>
                                          {opt.SSR_TypeDesc} {opt.Total_Amount > 0 ? `(+₹${opt.Total_Amount})` : "(Complimentary)"}
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
                    </div>
                  )}

                </div>
              </div>

              {/* Right Summary & Price Panel */}
              <div className="lg:col-span-4 flex flex-col gap-6">
                
                {/* SSR Choices Summary */}
                <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-sm flex flex-col justify-between h-fit">
                  <div className="mb-6">
                    <h4 className="text-[17px] font-extrabold text-slate-800 mb-4 flex items-center gap-2 pb-3 border-b border-slate-100">
                      <ShoppingBag className="w-5 h-5 text-rose-600" />
                      Summary of Selections
                    </h4>

                    {Object.keys(selections).length === 0 ? (
                      <p className="text-slate-400 text-xs font-semibold py-4 text-center">
                        No extra services or seats selected yet. Choose options from the tabs.
                      </p>
                    ) : (
                      <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1">
                        {passengers.map((pax) => {
                          const paxSelectionsList: any[] = [];
                          
                          segments.forEach((seg) => {
                            const key = `${pax.pax_id}-${seg.segment_id}`;
                            const sel = selections[key];
                            if (sel) {
                              if (sel.seat) paxSelectionsList.push({ type: "Seat", detail: `${seg.origin}-${seg.destination}: Seat ${sel.seat.SSR_TypeName}`, price: sel.seat.Total_Amount });
                              if (sel.meal) paxSelectionsList.push({ type: "Meal", detail: `${seg.origin}-${seg.destination}: ${sel.meal.SSR_TypeDesc}`, price: sel.meal.Total_Amount });
                              if (sel.baggage) paxSelectionsList.push({ type: "Baggage", detail: `${seg.origin}-${seg.destination}: ${sel.baggage.SSR_TypeDesc}`, price: sel.baggage.Total_Amount });
                              if (sel.wheelchair) paxSelectionsList.push({ type: "Assistance", detail: `${seg.origin}-${seg.destination}: ${sel.wheelchair.SSR_TypeDesc}`, price: sel.wheelchair.Total_Amount });
                            }
                          });

                          if (paxSelectionsList.length === 0) return null;

                          return (
                            <div key={pax.pax_id} className="text-xs font-semibold bg-slate-50/50 rounded-xl p-3 border border-slate-100">
                              <p className="font-extrabold text-slate-700 mb-1.5">
                                {pax.title} {pax.firstName}
                              </p>
                              <div className="space-y-1">
                                {paxSelectionsList.map((item, idx) => (
                                  <div key={idx} className="flex justify-between items-center text-slate-500">
                                    <span className="truncate max-w-[180px]">{item.detail}</span>
                                    <span className="text-slate-700 font-bold">₹{item.price.toLocaleString("en-IN")}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Pricing Breakdown */}
                  <div className="border-t border-slate-100 pt-4 space-y-2.5">
                    <div className="flex justify-between items-center pt-1">
                      <span className="text-[14px] font-extrabold text-slate-500">Additional SSR Cost</span>
                      <span className="text-[18px] font-black text-green-600">
                        +₹{ssrFees.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                    <p className="text-[11px] font-semibold text-slate-400 mt-1 leading-normal">
                      The base ticket price was already paid. You will only be charged for any newly selected seats or meal/baggage add-ons.
                    </p>
                  </div>

                  {/* Submission Error Banner */}
                  {submitStatus === "error" && (
                    <div className="mt-4 px-4 py-3 bg-rose-50 border border-rose-100 rounded-xl text-rose-700 text-xs font-bold leading-normal">
                      ❌ {errorMessage || "Failed to confirm GDS options. Please try again."}
                    </div>
                  )}

                  {/* Confirm Choices Button */}
                  <button
                    onClick={handleConfirmChoices}
                    disabled={submitting}
                    className="w-full mt-6 h-12 bg-[#D60D26] hover:bg-[#b00b1d] disabled:bg-rose-400 text-white rounded-full font-black text-[14px] flex items-center justify-center gap-2 transition shadow-lg shadow-rose-200"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Processing SSR modifications...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        Confirm & Modify SSR Choices
                      </>
                    )}
                  </button>
                </div>
              </div>

            </div>
          )}
        </div>
      )}
    </div>
  );

  // Nested Seat Button Renderer
  function renderSeatButton(seat: any, colLetter: string) {
    if (!seat) {
      // Empty slot in seat map segment
      return (
        <div 
          key={colLetter} 
          className="w-9 h-9 bg-slate-100/30 rounded border border-transparent"
        />
      );
    }

    const seatName = seat.SSR_TypeName;
    const isOccupied = seat.SSR_Status !== 0;
    const isPremium = parseInt(seatName) <= 2;
    const price = seat.Total_Amount;

    // Check who has selected this seat
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
        key={colLetter}
        disabled={isOccupied}
        onClick={() => handleSelectSeat(seat)}
        title={`${seatName} ${isOccupied ? "(Occupied)" : `(₹${price} - Click to select)`}`}
        className={`w-10 h-10 rounded-lg text-[10px] font-black tracking-tighter flex flex-col items-center justify-center transition-all ${
          isOccupied
            ? "bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-300"
            : isSelectedByActivePax
            ? "bg-rose-600 text-white border-2 border-rose-700 shadow-md shadow-rose-100 scale-105"
            : isSelectedByOtherPax
            ? "bg-blue-600 text-white border-2 border-blue-700 scale-105"
            : isPremium
            ? "bg-amber-50 text-slate-700 border border-amber-300 hover:border-amber-400 hover:bg-amber-100/50"
            : "bg-white text-slate-700 border border-slate-200 hover:border-slate-300 hover:bg-slate-50"
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
