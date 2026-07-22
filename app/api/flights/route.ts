import { NextResponse } from "next/server";
import { cabinToClassCode, parseDurationToMinutes } from "@/lib/flightSearch";
import { getBackendApiUrl } from "@/lib/apiConfig";

export const dynamic = "force-dynamic";
import {
    formatBaggageLabel,
    parseFoodOnboardFromApi,
    parseMealOptionsFromApi,
} from "@/lib/flight";

const CITY_TO_IATA: Record<string, string> = {
    "new delhi": "DEL",
    "mumbai": "BOM",
    "bangalore": "BLR",
    "chennai": "MAA",
    "kolkata": "CCU",
    "hyderabad": "HYD",
    "pune": "PNQ",
    "ahmedabad": "AMD",
    "goa": "GOI",
    "jaipur": "JAI",
    "cochin": "COK",
    "lucknow": "LKO",
    "guwahati": "GAU",
    "thiruvananthapuram": "TRV",
    "bhubaneswar": "BBI",
    "patna": "PAT",
    "indore": "IDR",
    "chandigarh": "IXC",
    "new york": "JFK",
    "london": "LHR",
    "dubai": "DXB",
    "singapore": "SIN",
    "paris": "CDG",
    "tokyo": "HND",
    "sydney": "SYD",
    "toronto": "YYZ",
    "frankfurt": "FRA",
    "hong kong": "HKG",
    "bangkok": "BKK"
};

function getIataCode(cityOrCode: string): string {
    if (!cityOrCode) return "";
    const clean = cityOrCode.trim().toLowerCase();
    if (clean.length === 3) return clean.toUpperCase();
    return CITY_TO_IATA[clean] || clean.toUpperCase().slice(0, 3);
}

function parseUatDateTime(dateStr: string): Date {
    if (!dateStr) return new Date();
    if (dateStr.includes("T") || (dateStr.includes("-") && !dateStr.includes(" "))) {
        return new Date(dateStr);
    }
    // Expected format: MM/DD/YYYY HH:MM
    const [datePart, timePart] = dateStr.split(" ");
    if (!datePart || !timePart) return new Date();
    const [month, day, year] = datePart.split("/");
    const [hour, min] = timePart.split(":");
    return new Date(parseInt(year), parseInt(month) - 1, parseInt(day), parseInt(hour), parseInt(min));
}

function formatTime12h(date: Date): string {
    let hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    const minutesStr = minutes < 10 ? '0' + minutes : minutes;
    const hoursStr = hours < 10 ? '0' + hours : hours;
    return `${hoursStr}:${minutesStr} ${ampm}`;
}

function normalizeFareType(raw: unknown): string {
    const s = String(raw || "PUB").toUpperCase();
    if (s.includes("CORP") || s === "CP") return "CORP";
    if (s.includes("STU") || s.includes("STUDENT") || s === "SF") return "STU";
    if (s.includes("DEF") || s.includes("DEFENCE") || s.includes("DEFENSE") || s === "DD") return "DEF";
    return "PUB";
}

function mapBackendFlight(flight: any, fare: any, idx: number, searchKey: string) {
    const firstSeg = flight.segments?.[0];
    const lastSeg = flight.segments?.[flight.segments.length - 1];
    const depDate = firstSeg ? parseUatDateTime(firstSeg.departure_datetime) : new Date();
    const arrDate = lastSeg ? parseUatDateTime(lastSeg.arrival_datetime) : new Date();

    const priceDetails = fare.price_details || {};
    const totalPrice = priceDetails.total_amount || 3500;
    const taxAmount = priceDetails.tax_amount || Math.round(totalPrice * 0.15);
    const baseAmount =
        priceDetails.basic_amount ??
        priceDetails.base_amount ??
        totalPrice - taxAmount;
    const fareId = fare.fare_id || `fare-${idx}`;

    const airlineCode = (firstSeg?.airline_code || flight.airline_code || "FL").toUpperCase();
    let flightNumber = String(firstSeg?.flight_number || `${100 + idx}`).trim();
    
    // Clean up double airline code prefix if present in the flight number (e.g. "6E-2012" -> "2012")
    const cleanAirline = airlineCode.toUpperCase();
    const cleanFlight = flightNumber.toUpperCase().replace(/\s+/g, "").replace(/-/g, "");
    if (cleanFlight.startsWith(cleanAirline)) {
        const suffix = flightNumber.slice(cleanAirline.length);
        flightNumber = suffix.startsWith("-") ? suffix.slice(1) : suffix;
    }

    // Clean up common fare type suffixes if present in the flight number (e.g. "6E-6676-PUB" -> "6676")
    const fareSuffixes = ["-PUB", "-STU", "-DEF", "-CORP", "PUB", "STU", "DEF", "CORP"];
    for (const fs of fareSuffixes) {
        if (flightNumber.toUpperCase().endsWith(fs)) {
            flightNumber = flightNumber.slice(0, -fs.length);
            if (flightNumber.endsWith("-")) {
                flightNumber = flightNumber.slice(0, -1);
            }
            break;
        }
    }

    const baggageRaw =
        fare.baggage_allowance ||
        fare.check_in_baggage ||
        fare.baggage ||
        firstSeg?.baggage_allowance ||
        "";
    const baggageStr = formatBaggageLabel(baggageRaw);
    const hasBaggage = /kg|kilo|bag|\b(5|7|15|20|23|25|30)\b/i.test(baggageStr);

    const fareTypeRaw =
        fare.fare_type ||
        fare.fare_category ||
        fare.fare_basis_type ||
        "PUB";
    
    const normalizedFare = normalizeFareType(fareTypeRaw);
    const shortId = `${airlineCode}-${flightNumber}-${normalizedFare}`.toUpperCase();

    const equipment =
        firstSeg?.aircraft_type ||
        firstSeg?.equipment ||
        firstSeg?.aircraft ||
        null;

    const durationStr = firstSeg?.duration || "2h 30m";
    const cabinClass =
        firstSeg?.cabin_class ||
        fare.cabin_class ||
        fare.class_of_service ||
        "Economy";
    const foodRaw =
        fare.food_onboard ??
        firstSeg?.food_onboard ??
        fare.meal_included ??
        firstSeg?.meal_included;
    const { meal_available: mealFromFood, food_onboard: foodOnboard, meal_included } =
        parseFoodOnboardFromApi(foodRaw);
    const mealOptionsRaw =
        fare.meal_options ??
        fare.meals ??
        fare.ssr_meals ??
        firstSeg?.meal_options ??
        [];
    const mealOptions = parseMealOptionsFromApi(mealOptionsRaw);
    const hasApiMealList = mealOptions.length > 1;
    const mealAvailable =
        mealFromFood || hasApiMealList || Boolean(meal_included);

    return {
        id: shortId,
        airline: firstSeg?.airline_name || flight.airline_code || "Airline",
        airline_code: airlineCode,
        origin: flight.origin,
        destination: flight.destination,
        departureTime: formatTime12h(depDate),
        arrivalTime: formatTime12h(arrDate),
        duration: durationStr,
        duration_minutes: parseDurationToMinutes(durationStr),
        departure_minutes: depDate.getHours() * 60 + depDate.getMinutes(),
        arrival_minutes: arrDate.getHours() * 60 + arrDate.getMinutes(),
        price: totalPrice,
        tax_amount: taxAmount,
        base_amount: baseAmount,
        stops: Math.max(0, (flight.segments?.length || 1) - 1),
        fare_type: normalizedFare,
        has_baggage: hasBaggage,
        baggage_label: baggageStr || undefined,
        equipment: equipment || undefined,
        cabin_class: cabinClass,
        ticket_time_limit_hours: fare.ticket_time_limit || fare.ttl_hours || 24,
        meal_available: mealAvailable,
        food_onboard: foodOnboard,
        meal_options: mealAvailable ? mealOptions : undefined,
        search_key: searchKey,
        flight_key: flight.flight_key,
        fare_id: fareId,
        is_agent_flight: flight.is_agent_flight || false,
        agent_flight_id: flight.agent_flight_id || undefined,
        travel_date: depDate.toISOString().slice(0, 10),
    };
}

type LiveSearchFilters = {
    studentFareSearch: boolean;
    defenceFareSearch: boolean;
    corporateFareSearch: boolean;
    isB2b: boolean;
    nonStop: boolean;
    baggageFaresOnly: boolean;
    airlineCodeParam: string;
};

async function fetchBackendSearch(backendUrl: string, postPayload: Record<string, unknown>) {
    const response = await fetch(`${backendUrl}/api/v1/flights/search/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(postPayload),
        cache: "no-store",
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Backend search failed with status ${response.status}: ${errorText}`);
    }

    let backendResult = await response.json();
    if (backendResult && backendResult.data && !backendResult.flights) {
        backendResult = backendResult.data;
    }
    if (!backendResult || !backendResult.flights) {
        throw new Error(`Backend returned unsuccessful search: ${JSON.stringify(backendResult)}`);
    }
    return backendResult as { search_key?: string; flights: any[] };
}

function mapAndFilterLiveFlights(
    backendResult: { search_key?: string; flights: any[] },
    filters: LiveSearchFilters
) {
    const searchKey = backendResult.search_key || "";
    const allFaresMapped: any[] = [];
    backendResult.flights.forEach((flight: any, idx: number) => {
        if (flight.fares && flight.fares.length > 0) {
            flight.fares.forEach((fare: any) => {
                allFaresMapped.push(mapBackendFlight(flight, fare, idx, searchKey));
            });
        } else {
            allFaresMapped.push(mapBackendFlight(flight, {}, idx, searchKey));
        }
    });

    const cheapestByFlightKey = new Map<string, any>();
    for (const f of allFaresMapped) {
        const parts = (f.id || "").split("-");
        const key = `${parts[0]}-${parts[1]}-${f.origin}-${f.destination}`;
        const existing = cheapestByFlightKey.get(key);
        if (!existing || f.price < existing.price) {
            cheapestByFlightKey.set(key, f);
        }
    }
    let mapped: any[] = Array.from(cheapestByFlightKey.values());

    if (filters.studentFareSearch) {
        mapped = mapped.filter((f) => f.is_agent_flight || f.fare_type === "STU");
    } else if (filters.defenceFareSearch) {
        mapped = mapped.filter((f) => f.is_agent_flight || f.fare_type === "DEF");
    } else if (filters.corporateFareSearch) {
        mapped = mapped.filter((f) => f.is_agent_flight || f.fare_type === "CORP");
    } else if (filters.isB2b) {
        mapped = mapped.filter((f) => f.is_agent_flight || f.fare_type === "CORP" || f.fare_type === "PUB");
    } else {
        mapped = mapped.filter((f) => f.is_agent_flight || f.fare_type === "PUB");
    }

    if (filters.nonStop) mapped = mapped.filter((f) => f.stops === 0);
    if (filters.baggageFaresOnly) mapped = mapped.filter((f) => f.has_baggage);
    if (filters.airlineCodeParam) {
        mapped = mapped.filter((f) => f.airline_code?.toUpperCase() === filters.airlineCodeParam);
    }

    return mapped;
}

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const originStr = searchParams.get("origin") || "";
    const destinationStr = searchParams.get("destination") || "";
    const nonStop = searchParams.get("nonStop") === "true";
    const tripType = searchParams.get("tripType") || "one-way";
    const departureDate = searchParams.get("departureDate") || "2026-03-11";
    const returnDate = searchParams.get("returnDate") || "";
    const adults = parseInt(searchParams.get("adults") || "1", 10);
    const children = parseInt(searchParams.get("children") || "0", 10);
    const infants = parseInt(searchParams.get("infants") || "0", 10);
    const cabin = searchParams.get("cabin") || "Economy";
    const airlineCodeParam = (searchParams.get("airlineCode") || "").trim().toUpperCase();
    const baggageFaresOnly = searchParams.get("baggageFares") === "true";
    const studentFareSearch = searchParams.get("studentFare") === "true";
    const defenceFareSearch = searchParams.get("defenceFare") === "true";
    const corporateFareSearch = searchParams.get("corporateFare") === "true";
    const srCitizenSearch = searchParams.get("srCitizen") === "true";

    const referer = request.headers.get("referer") || "";
    const isB2b = referer.includes("/b2b") || searchParams.get("isB2b") === "true";

    console.log("[BFF Flight Search API GET] Parsed params:", {
        studentFareSearch,
        defenceFareSearch,
        corporateFareSearch,
        isB2b,
        rawUrl: request.url
    });

    const originIata = getIataCode(originStr);
    const destinationIata = getIataCode(destinationStr);
    const cabinCode = cabinToClassCode(cabin);

    const backendUrl = getBackendApiUrl();

    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const todayStr = `${yyyy}-${mm}-${dd}`;

    let finalTravelDate = departureDate;
    let finalReturnDate = returnDate;

    if (departureDate < todayStr) {
        // Automatically push travel date to 7 days in the future
        const futureTravel = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        const fY = futureTravel.getFullYear();
        const fM = String(futureTravel.getMonth() + 1).padStart(2, '0');
        const fD = String(futureTravel.getDate()).padStart(2, '0');
        finalTravelDate = `${fY}-${fM}-${fD}`;

        // Also adjust return date to be 3 days after new travel date if round-trip
        if (tripType === "round-trip" && returnDate) {
            const futureReturn = new Date(futureTravel.getTime() + 3 * 24 * 60 * 60 * 1000);
            const rY = futureReturn.getFullYear();
            const rM = String(futureReturn.getMonth() + 1).padStart(2, '0');
            const rD = String(futureReturn.getDate()).padStart(2, '0');
            finalReturnDate = `${rY}-${rM}-${rD}`;
        }
    } else if (tripType === "round-trip" && returnDate && returnDate < departureDate) {
        // If return date is before departure date, push return date to 3 days after departure date
        const depDateObj = new Date(departureDate);
        const futureReturn = new Date(depDateObj.getTime() + 3 * 24 * 60 * 60 * 1000);
        const rY = futureReturn.getFullYear();
        const rM = String(futureReturn.getMonth() + 1).padStart(2, '0');
        const rD = String(futureReturn.getDate()).padStart(2, '0');
        finalReturnDate = `${rY}-${rM}-${rD}`;
    } else if (tripType === "round-trip" && returnDate && returnDate === departureDate) {
        // Same-day return often fails FlyShop validation — bump return +1 day
        const depDateObj = new Date(departureDate + "T12:00:00");
        const futureReturn = new Date(depDateObj.getTime() + 24 * 60 * 60 * 1000);
        const rY = futureReturn.getFullYear();
        const rM = String(futureReturn.getMonth() + 1).padStart(2, '0');
        const rD = String(futureReturn.getDate()).padStart(2, '0');
        finalReturnDate = `${rY}-${rM}-${rD}`;
    } else if (tripType === "round-trip" && !finalReturnDate) {
        const depDateObj = new Date(finalTravelDate);
        const futureReturn = new Date(depDateObj.getTime() + 3 * 24 * 60 * 60 * 1000);
        const rY = futureReturn.getFullYear();
        const rM = String(futureReturn.getMonth() + 1).padStart(2, '0');
        const rD = String(futureReturn.getDate()).padStart(2, '0');
        finalReturnDate = `${rY}-${rM}-${rD}`;
    }

    // Build multi-city segments if applicable
    const segCount = parseInt(searchParams.get("segCount") || "0", 10);
    const isMultiCity = tripType === "multi-city" && segCount >= 2;

    const filters: LiveSearchFilters = {
        studentFareSearch,
        defenceFareSearch,
        corporateFareSearch,
        isB2b,
        nonStop,
        baggageFaresOnly,
        airlineCodeParam,
    };

    const basePaxPayload = {
        adult_count: adults,
        child_count: children,
        infant_count: infants,
        class_of_travel: cabinCode,
        airline_code: airlineCodeParam,
        student_fare_search: studentFareSearch,
        defence_fare_search: defenceFareSearch,
        sr_citizen_search: srCitizenSearch,
    };

    let postPayload: Record<string, unknown>;

    if (isMultiCity) {
        const today2 = new Date();
        const tripSegments = Array.from({ length: segCount }, (_, idx) => {
            const segOriginRaw = searchParams.get(`seg_origin_${idx}`) || "";
            const segDestRaw = searchParams.get(`seg_dest_${idx}`) || "";
            let segDate = searchParams.get(`seg_date_${idx}`) || finalTravelDate;
            // Auto-adjust past dates
            if (segDate < `${today2.getFullYear()}-${String(today2.getMonth()+1).padStart(2,'0')}-${String(today2.getDate()).padStart(2,'0')}`) {
                const futureDate = new Date(Date.now() + (7 + idx * 3) * 24 * 60 * 60 * 1000);
                segDate = `${futureDate.getFullYear()}-${String(futureDate.getMonth()+1).padStart(2,'0')}-${String(futureDate.getDate()).padStart(2,'0')}`;
            }
            return {
                origin: getIataCode(segOriginRaw),
                destination: getIataCode(segDestRaw),
                travel_date: segDate,
            };
        });
        postPayload = {
            travel_type: 2,
            trip_segments: tripSegments,
            ...basePaxPayload,
        };
        console.log("[BFF] Multi-city payload built:", postPayload);
    } else {
        // Always one-way to FlyShop. Round-trip uses two one-way calls (provider RT search returns 9999).
        postPayload = {
            origin: originIata,
            destination: destinationIata,
            travel_date: finalTravelDate,
            return_date: null,
            ...basePaxPayload,
        };
    }

    console.log(`BFF Request to backend search URL: ${backendUrl}/api/v1/flights/search/ with payload:`, postPayload);

    try {
        if (tripType === "round-trip" && !isMultiCity) {
            const returnPayload = {
                origin: destinationIata,
                destination: originIata,
                travel_date: finalReturnDate || finalTravelDate,
                return_date: null,
                ...basePaxPayload,
            };
            console.log("[BFF] Round-trip: dual one-way live searches", { outbound: postPayload, inbound: returnPayload });

            const [outResult, retResult] = await Promise.all([
                fetchBackendSearch(backendUrl, postPayload),
                fetchBackendSearch(backendUrl, returnPayload),
            ]);

            const outboundFlights = mapAndFilterLiveFlights(outResult, filters);
            const returnFlights = mapAndFilterLiveFlights(retResult, filters);

            console.log("[BFF Flight Search API] Round-trip live counts:", {
                outbound: outboundFlights.length,
                return: returnFlights.length,
            });

            return NextResponse.json({
                flights: outboundFlights,
                returnFlights,
                source: "api",
            });
        }

        const backendResult = await fetchBackendSearch(backendUrl, postPayload);
        const mapped = mapAndFilterLiveFlights(backendResult, filters);

        // Multi-city / one-way: if provider marks return segments, split (rare for one-way).
        let outboundFlights = mapped.filter((f: any) => {
            const origFlight = backendResult.flights.find((of: any) => of.flight_key === f.flight_key);
            if (!origFlight?.segments) return true;
            return origFlight.segments.every((s: any) => !s.return_flight);
        });

        if (outboundFlights.length === 0) outboundFlights = mapped;

        console.log("[BFF Flight Search API] Successfully fetched live flights:", {
            origin: originIata,
            destination: destinationIata,
            tripType,
            departureDate,
            outboundCount: outboundFlights.length,
            sampleOutbound: outboundFlights[0] || null,
        });

        return NextResponse.json({
            flights: outboundFlights,
            source: "api",
        });

    } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown search error";
        console.error("[BFF Flight Search API] Live search failed (no mock fallback):", message);
        return NextResponse.json(
            {
                flights: [],
                returnFlights: tripType === "round-trip" ? [] : undefined,
                source: "api",
                error: "Unable to load live flights from the airline provider. Please try again.",
                detail: message,
            },
            { status: 502 }
        );
    }
}
