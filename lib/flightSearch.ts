import { format } from "date-fns";

export type TravellerCounts = {
  adults: number;
  children: number;
  infants: number;
};

export type FlightSearchFormData = {
  origin: string;
  destination: string;
  nonStop: boolean;
  baggageFares: boolean;
  studentFareSearch: boolean;
  defenceFareSearch: boolean;
  srCitizenSearch: boolean;
  corporateFareSearch?: boolean;
  travellers: TravellerCounts;
  cabin: string;
  tripType: "one-way" | "round-trip" | "multi-city";
  departureDate?: Date;
  returnDate?: Date;
  airlineCode?: string;
  tripSegments?: Array<{ origin: string; destination: string; travelDate: Date }>;
};


export function cabinToClassCode(cabin: string): string {
  if (cabin === "Prem. Economy" || cabin === "Premium Economy" || cabin === "Premium") {
    return "1";
  }
  if (cabin === "Business") return "2";
  if (cabin === "First" || cabin === "First Class") return "3";
  return "0";
}

export function formatDateParam(date?: Date): string | undefined {
  if (!date) return undefined;
  return format(date, "yyyy-MM-dd");
}

/** Default return date: 3 days after departure (round-trip) */
export function defaultReturnDate(departure: Date): Date {
  const d = new Date(departure);
  d.setDate(d.getDate() + 3);
  return d;
}

export function buildFlightSearchQuery(data: FlightSearchFormData): URLSearchParams {
  const params = new URLSearchParams();
  params.set("origin", data.origin);
  params.set("destination", data.destination);
  params.set("tripType", data.tripType);
  params.set("cabin", data.cabin || "Economy");
  params.set("adults", String(data.travellers.adults));
  params.set("children", String(data.travellers.children));
  params.set("infants", String(data.travellers.infants));
  const totalPax =
    data.travellers.adults + data.travellers.children + data.travellers.infants;
  params.set("passengers", String(totalPax));

  if (data.nonStop) params.set("nonStop", "true");
  if (data.baggageFares) params.set("baggageFares", "true");
  if (data.studentFareSearch) params.set("studentFare", "true");
  if (data.defenceFareSearch) params.set("defenceFare", "true");
  if (data.srCitizenSearch) params.set("srCitizen", "true");
  if (data.corporateFareSearch) params.set("corporateFare", "true");

  const dep = formatDateParam(data.departureDate);
  if (dep) params.set("departureDate", dep);

  if (data.tripType === "round-trip") {
    const ret =
      formatDateParam(data.returnDate) ||
      (data.departureDate ? formatDateParam(defaultReturnDate(data.departureDate)) : undefined);
    if (ret) params.set("returnDate", ret);
  }

  if (data.tripType === "multi-city" && data.tripSegments && data.tripSegments.length > 0) {
    data.tripSegments.forEach((seg, idx) => {
      params.set(`seg_origin_${idx}`, seg.origin);
      params.set(`seg_dest_${idx}`, seg.destination);
      const segDate = formatDateParam(seg.travelDate);
      if (segDate) params.set(`seg_date_${idx}`, segDate);
    });
    params.set("segCount", String(data.tripSegments.length));
  }

  if (data.airlineCode?.trim()) {
    params.set("airlineCode", data.airlineCode.trim().toUpperCase());
  }

  return params;
}

export function parseTimeToMinutes(time12h: string): number {
  const match = time12h.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
  if (!match) return 0;
  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const period = match[3].toUpperCase();
  if (period === "PM" && hours !== 12) hours += 12;
  if (period === "AM" && hours === 12) hours = 0;
  return hours * 60 + minutes;
}

export function parseDurationToMinutes(duration: string): number {
  const parts = duration.match(/(\d+)\s*h(?:\s*(\d+)\s*m)?/i);
  if (!parts) return 9999;
  const hrs = parseInt(parts[1], 10) || 0;
  const mins = parseInt(parts[2], 10) || 0;
  return hrs * 60 + mins;
}

export const DEPARTURE_TIME_SLOTS = [
  { id: "early", label: "Early morning (12am – 6am)", min: 0, max: 360 },
  { id: "morning", label: "Morning (6am – 12pm)", min: 360, max: 720 },
  { id: "afternoon", label: "Afternoon (12pm – 6pm)", min: 720, max: 1080 },
  { id: "evening", label: "Evening (6pm – 12am)", min: 1080, max: 1440 },
] as const;

export const POPULAR_AIRLINES = [
  { code: "AI", name: "Air India" },
  { code: "6E", name: "IndiGo" },
  { code: "UK", name: "Vistara" },
  { code: "SG", name: "SpiceJet" },
  { code: "G8", name: "Go First" },
  { code: "IX", name: "Air India Express" },
];
