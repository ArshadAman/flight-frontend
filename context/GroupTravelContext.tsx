"use client";

import React, { createContext, useContext, useState } from "react";

export interface TravelRequest {
  id: string;
  groupName: string;
  requestId: string;
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
  adults: number;
  children: number;
  infants: number;
}

interface GroupTravelContextType {
  requests: TravelRequest[];
  addRequest: (req: TravelRequest) => void;
  updateRequest: (requestId: string, updates: Partial<TravelRequest>) => void;
}

const GroupTravelContext = createContext<GroupTravelContextType | undefined>(undefined);

// Seed with one pre-existing "Payment pending" entry so the view-request page
// always has something to display even before the user submits the form.
const SEED_REQUESTS: TravelRequest[] = [
  {
    id: "seed-1",
    groupName: "Harshit786",
    requestId: "GRP1134718273",
    status: "Payment pending",
    airline: "AIR INDIA",
    requestDate: "01 Aug,25(13:25)",
    validTill: "04 Aug, 25(03:00)",
    origin: "DEL",
    destination: "BKK",
    departureDate: "19 Aug, 25",
    returnDate: "28 Sep, 25",
    passengersGroup: "group1",
    expectedFare: "18000",
    cabin: "economy",
    groupCategory: "Leisure",
    timing: "morning",
    airlinePreference: "air-india",
    adults: 12,
    children: 0,
    infants: 0,
  },
];

export function GroupTravelProvider({ children }: { children: React.ReactNode }) {
  const [requests, setRequests] = useState<TravelRequest[]>(SEED_REQUESTS);

  const addRequest = (req: TravelRequest) => {
    setRequests((prev) => [req, ...prev]);
  };

  const updateRequest = (requestId: string, updates: Partial<TravelRequest>) => {
    setRequests((prev) =>
      prev.map((req) => (req.requestId === requestId ? { ...req, ...updates } : req))
    );
  };

  return (
    <GroupTravelContext.Provider value={{ requests, addRequest, updateRequest }}>
      {children}
    </GroupTravelContext.Provider>
  );
}

export const useGroupTravel = () => {
  const context = useContext(GroupTravelContext);
  if (!context) throw new Error("useGroupTravel must be used within a GroupTravelProvider");
  return context;
};
