"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export interface GroupQuote {
  id: string;
  quote_option_id: string;
  airline: string;
  flight_number: string;
  departure_time: string;
  arrival_time: string;
  fare_per_pax: string;
  tax_per_pax: string;
  deposit_per_pax: string;
  payment_deadline: string;
  balance_deadline: string;
  terms_and_conditions?: string;
  is_selected: boolean;
}

export interface GroupPassenger {
  id?: string;
  first_name: string;
  last_name: string;
  gender: string;
  date_of_birth: string;
  passport_number?: string;
}

export interface GroupChangeRequest {
  id: string;
  change_request_id: string;
  change_type: "UPSIZE" | "DOWNSIZE";
  pax_delta: number;
  status: "PENDING_REVIEW" | "APPROVED" | "REJECTED";
  agent_notes?: string;
  admin_remarks?: string;
  adjusted_fare_per_pax?: string;
}

export interface TravelRequest {
  id: string;
  requestId: string;
  groupName: string;
  status: string;
  airline: string;
  requestDate: string;
  validTill?: string;
  origin: string;
  destination: string;
  departureDate: string;
  returnDate: string;
  passengersGroup: string;
  expectedFare: string;
  cabin: string;
  groupCategory: string;
  timing: string;
  airlinePreference: string;
  tripType?: string;
  adults: number;
  children: number;
  infants: number;
  pnrNumber?: string;
  totalPaid: string;
  paymentDeadline?: string;
  balanceDeadline?: string;
  quotes: GroupQuote[];
  passengers: GroupPassenger[];
  changeRequests: GroupChangeRequest[];
}

interface GroupTravelContextType {
  requests: TravelRequest[];
  loading: boolean;
  refreshRequests: (role?: "AGENT" | "ADMIN") => Promise<void>;
  addRequest: (req: any) => Promise<TravelRequest | null>;
  negotiateRequest: (bookingId: string, remarks: string) => Promise<boolean>;
  acceptQuote: (bookingId: string, quoteOptionId: string) => Promise<boolean>;
  recordPayment: (bookingId: string, amount: string) => Promise<boolean>;
  uploadPassengers: (bookingId: string, passengers: GroupPassenger[]) => Promise<boolean>;
  createChangeRequest: (bookingId: string, changeType: "UPSIZE" | "DOWNSIZE", paxDelta: number, notes: string) => Promise<boolean>;
  resolveChangeRequest: (bookingId: string, crId: string, status: "APPROVED" | "REJECTED", remarks: string, adjustedFare?: string) => Promise<boolean>;
  uploadQuotes: (bookingId: string, quotes: any[]) => Promise<boolean>;
  issueTicket: (bookingId: string, pnrNumber: string) => Promise<boolean>;
  completeBooking: (bookingId: string) => Promise<boolean>;
  updateRequest: (bookingId: string, updates: any, role?: "AGENT" | "ADMIN") => Promise<boolean>;
}

const GroupTravelContext = createContext<GroupTravelContextType | undefined>(undefined);

// Helper formats
function formatDate(dateStr?: string) {
  if (!dateStr) return "";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const pad = (n: number) => n.toString().padStart(2, "0");
    const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    return `${pad(d.getDate())} ${months[d.getMonth()]},${String(d.getFullYear()).slice(2)}(${pad(d.getHours())}:${pad(d.getMinutes())})`;
  } catch (e) {
    return dateStr;
  }
}

function formatDateToHuman(dateStr: string): string {
  if (!dateStr) return "";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const pad = (n: number) => n.toString().padStart(2, "0");
    const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    return `${pad(d.getDate())} ${months[d.getMonth()]}, ${String(d.getFullYear()).slice(2)}`;
  } catch (e) {
    return dateStr;
  }
}

function formatHumanToDate(humanStr: string): string {
  if (!humanStr) return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(humanStr)) return humanStr;
  try {
    const cleaned = humanStr.replace(",", "").trim();
    const parts = cleaned.split(/\s+/);
    if (parts.length < 3) return humanStr;
    const day = parseInt(parts[0], 10);
    const monthStr = parts[1].toLowerCase();
    let year = parseInt(parts[2], 10);
    if (year < 100) year += 2000;
    const months: Record<string, number> = {
      jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
      jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11
    };
    const month = months[monthStr.slice(0, 3)] ?? 0;
    const d = new Date(year, month, day);
    if (isNaN(d.getTime())) return humanStr;
    const pad = (n: number) => n.toString().padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  } catch (e) {
    return humanStr;
  }
}

export function GroupTravelProvider({ children }: { children: React.ReactNode }) {
  const [requests, setRequests] = useState<TravelRequest[]>([]);
  const [loading, setLoading] = useState(true);

  // Reads the JWT from localStorage so every API call is authenticated
  const getAuthHeaders = (): Record<string, string> => {
    if (typeof window === "undefined") return {};
    const token = localStorage.getItem("access_token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const mapBackendToFrontend = (req: any): TravelRequest => {
    const adults = req.pax_adults || 0;
    const childrenCount = req.pax_children || 0;
    const infants = req.pax_infants || 0;
    const departureHuman = formatDateToHuman(req.departure_date);
    const returnHuman = formatDateToHuman(req.return_date);
    const requestDateHuman = formatDate(req.created_at);
    const validTillHuman = req.payment_deadline ? formatDate(req.payment_deadline) : undefined;
    
    const cabinMap: Record<string, string> = {
      ECONOMY: "economy",
      PREMIUM: "premium",
      BUSINESS: "business"
    };

    return {
      id: String(req.id),
      requestId: req.request_id || "",
      groupName: req.group_name || "",
      status: req.status || "NEW_REQUEST",
      airline: req.airline_preference || "Any",
      requestDate: requestDateHuman,
      validTill: validTillHuman,
      origin: req.origin || "",
      destination: req.destination || "",
      departureDate: departureHuman,
      returnDate: returnHuman,
      passengersGroup: (adults + childrenCount) > 10 ? "group2" : "group1",
      expectedFare: String(req.expected_fare_per_pax || "0"),
      cabin: cabinMap[req.cabin_class] || "economy",
      tripType: req.trip_type || "ROUND_TRIP",
      groupCategory: req.group_category || "",
      timing: req.timing_preference?.toLowerCase() || "morning",
      airlinePreference: req.airline_preference || "",
      adults,
      children: childrenCount,
      infants,
      pnrNumber: req.pnr_number || "",
      totalPaid: String(req.total_paid || "0.00"),
      paymentDeadline: req.payment_deadline || "",
      balanceDeadline: req.balance_deadline || "",
      quotes: req.quotes || [],
      passengers: req.passengers || [],
      changeRequests: (req.change_requests || []).map((cr: any) => ({
        id: String(cr.id),
        change_request_id: cr.change_request_id,
        change_type: cr.change_type,
        pax_delta: cr.pax_delta,
        status: cr.status,
        agent_notes: cr.agent_notes,
        admin_remarks: cr.admin_remarks,
        adjusted_fare_per_pax: cr.adjusted_fare_per_pax ? String(cr.adjusted_fare_per_pax) : undefined
      }))
    };
  };

  const refreshRequests = async (role: "AGENT" | "ADMIN" = "AGENT") => {
    try {
      setLoading(true);
      const response = await fetch("/api/group-bookings/", {
        method: "GET",
        headers: {
          "X-Mock-Role": role,
          ...getAuthHeaders(),
        },
      });
      if (response.ok) {
        const data = await response.json();
        const rawList = Array.isArray(data) ? data : (data.results || data.data || []);
        const mapped = rawList.map(mapBackendToFrontend);
        setRequests(mapped);
      }
    } catch (e) {
      console.error("Failed to fetch group requests:", e);
    } finally {
      setLoading(false);
    }
  };

  const resolveDbId = (bookingId: string) => {
    const req = requests.find(r => r.requestId === bookingId || r.id === bookingId);
    return req ? req.id : bookingId;
  };

  const addRequest = async (req: any) => {
    try {
      const response = await fetch("/api/group-bookings/create/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Mock-Role": "AGENT",
          ...getAuthHeaders(),
        },
        body: JSON.stringify({
          group_name: req.groupName,
          origin: req.origin,
          destination: req.destination,
          departure_date: formatHumanToDate(req.departureDate),
          return_date: req.returnDate ? formatHumanToDate(req.returnDate) : null,
          trip_type: req.tripType || "ROUND_TRIP",
          cabin_class: req.cabin?.toUpperCase() || 'ECONOMY',
          pax_adults: req.adults,
          pax_children: req.children,
          pax_infants: req.infants,
          expected_fare_per_pax: parseFloat(req.expectedFare) || 0,
          airline_preference: req.airlinePreference,
          timing_preference: req.timing?.toUpperCase() || 'MORNING',
          group_category: req.groupCategory,
          remarks: req.remarks || "",
        }),
      });
      if (!response.ok) {
        throw new Error(await response.text());
      }
      const data = await response.json();
      await refreshRequests("AGENT");
      return mapBackendToFrontend(data);
    } catch (e) {
      console.error("Error adding request:", e);
      return null;
    }
  };

  const negotiateRequest = async (bookingId: string, remarks: string) => {
    try {
      const dbId = resolveDbId(bookingId);
      const response = await fetch(`/api/group-bookings/${dbId}/negotiate/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Mock-Role": "AGENT",
          ...getAuthHeaders(),
        },
        body: JSON.stringify({ remarks }),
      });
      if (!response.ok) throw new Error(await response.text());
      await refreshRequests("AGENT");
      return true;
    } catch (e) {
      console.error("Error negotiating request:", e);
      return false;
    }
  };

  const acceptQuote = async (bookingId: string, quoteOptionId: string) => {
    try {
      const dbId = resolveDbId(bookingId);
      const response = await fetch(`/api/group-bookings/${dbId}/accept/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Mock-Role": "AGENT",
          ...getAuthHeaders(),
        },
        body: JSON.stringify({ quote_option_id: quoteOptionId }),
      });
      if (!response.ok) throw new Error(await response.text());
      await refreshRequests("AGENT");
      return true;
    } catch (e) {
      console.error("Error accepting quote:", e);
      return false;
    }
  };

  const recordPayment = async (bookingId: string, amount: string) => {
    try {
      const dbId = resolveDbId(bookingId);
      const response = await fetch(`/api/group-bookings/${dbId}/payment/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Mock-Role": "AGENT",
          ...getAuthHeaders(),
        },
        body: JSON.stringify({ amount }),
      });
      if (!response.ok) throw new Error(await response.text());
      await refreshRequests("AGENT");
      return true;
    } catch (e) {
      console.error("Error recording payment:", e);
      return false;
    }
  };

  const uploadPassengers = async (bookingId: string, passengers: GroupPassenger[]) => {
    try {
      const dbId = resolveDbId(bookingId);
      const response = await fetch(`/api/group-bookings/${dbId}/passengers/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Mock-Role": "AGENT",
          ...getAuthHeaders(),
        },
        body: JSON.stringify(passengers),
      });
      if (!response.ok) throw new Error(await response.text());
      await refreshRequests("AGENT");
      return true;
    } catch (e) {
      console.error("Error uploading passengers:", e);
      return false;
    }
  };

  const createChangeRequest = async (bookingId: string, changeType: "UPSIZE" | "DOWNSIZE", paxDelta: number, notes: string) => {
    try {
      const dbId = resolveDbId(bookingId);
      const response = await fetch(`/api/group-bookings/${dbId}/change-request/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Mock-Role": "AGENT",
          ...getAuthHeaders(),
        },
        body: JSON.stringify({
          change_type: changeType,
          pax_delta: paxDelta,
          agent_notes: notes,
        }),
      });
      if (!response.ok) throw new Error(await response.text());
      await refreshRequests("AGENT");
      return true;
    } catch (e) {
      console.error("Error creating change request:", e);
      return false;
    }
  };

  const resolveChangeRequest = async (bookingId: string, crId: string, status: "APPROVED" | "REJECTED", remarks: string, adjustedFare?: string) => {
    try {
      const dbId = resolveDbId(bookingId);
      const response = await fetch(`/api/group-bookings/${dbId}/change-request/${crId}/resolve/`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "X-Mock-Role": "ADMIN",
          ...getAuthHeaders(),
        },
        body: JSON.stringify({
          status,
          admin_remarks: remarks,
          adjusted_fare_per_pax: adjustedFare ? parseFloat(adjustedFare) : undefined,
        }),
      });
      if (!response.ok) throw new Error(await response.text());
      await refreshRequests("ADMIN");
      return true;
    } catch (e) {
      console.error("Error resolving change request:", e);
      return false;
    }
  };

  const uploadQuotes = async (bookingId: string, quotes: any[]) => {
    try {
      const dbId = resolveDbId(bookingId);
      const response = await fetch(`/api/group-bookings/${dbId}/quote/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Mock-Role": "ADMIN",
          ...getAuthHeaders(),
        },
        body: JSON.stringify(quotes),
      });
      if (!response.ok) throw new Error(await response.text());
      await refreshRequests("ADMIN");
      return true;
    } catch (e) {
      console.error("Error uploading quotes:", e);
      return false;
    }
  };

  const issueTicket = async (bookingId: string, pnrNumber: string) => {
    try {
      const dbId = resolveDbId(bookingId);
      const response = await fetch(`/api/group-bookings/${dbId}/ticket/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Mock-Role": "ADMIN",
        },
        body: JSON.stringify({ pnr_number: pnrNumber }),
      });
      if (!response.ok) throw new Error(await response.text());
      await refreshRequests("ADMIN");
      return true;
    } catch (e) {
      console.error("Error issuing ticket:", e);
      return false;
    }
  };

  const updateRequest = async (bookingId: string, updates: any, role: "AGENT" | "ADMIN" = "AGENT") => {
    try {
      const dbId = resolveDbId(bookingId);
      const payload: any = {};
      if (updates.status !== undefined) payload.status = updates.status;
      if (updates.expectedFare !== undefined) payload.expected_fare_per_pax = parseFloat(updates.expectedFare) || 0;
      if (updates.adults !== undefined) payload.pax_adults = updates.adults;
      if (updates.children !== undefined) payload.pax_children = updates.children;
      if (updates.infants !== undefined) payload.pax_infants = updates.infants;
      if (updates.pnrNumber !== undefined) payload.pnr_number = updates.pnrNumber;
      if (updates.totalPaid !== undefined) payload.total_paid = parseFloat(updates.totalPaid) || 0;
      
      const response = await fetch(`/api/group-bookings/${dbId}/`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "X-Mock-Role": role,
        },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error(await response.text());
      await refreshRequests("AGENT");
      return true;
    } catch (e) {
      console.error("Error updating request:", e)
      return false;
    }
  };

  const completeBooking = async (bookingId: string) => {
    try {
      const dbId = resolveDbId(bookingId);
      const response = await fetch(`/api/group-bookings/${dbId}/complete/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Mock-Role": "ADMIN",
        },
      });
      if (!response.ok) throw new Error(await response.text());
      await refreshRequests("ADMIN");
      return true;
    } catch (e) {
      console.error("Error completing booking:", e);
      return false;
    }
  };

  // Load agent requests on mount
  useEffect(() => {
    refreshRequests("AGENT");
  }, []);

  return (
    <GroupTravelContext.Provider
      value={{
        requests,
        loading,
        refreshRequests,
        addRequest,
        negotiateRequest,
        acceptQuote,
        recordPayment,
        uploadPassengers,
        createChangeRequest,
        resolveChangeRequest,
        uploadQuotes,
        issueTicket,
        completeBooking,
        updateRequest
      }}
    >
      {children}
    </GroupTravelContext.Provider>
  );
}

export const useGroupTravel = () => {
  const context = useContext(GroupTravelContext);
  if (!context) throw new Error("useGroupTravel must be used within a GroupTravelProvider");
  return context;
};
