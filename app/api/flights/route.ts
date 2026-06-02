import { NextResponse } from "next/server";
import { cabinToClassCode, parseDurationToMinutes } from "@/lib/flightSearch";
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

const MOCK_AIRLINES = [
    { code: "AI", name: "Air India" },
    { code: "6E", name: "IndiGo" },
    { code: "UK", name: "Vistara" },
    { code: "SG", name: "SpiceJet" },
    { code: "G8", name: "Go First" },
];

function normalizeFareType(raw: unknown): string {
    const s = String(raw || "PUB").toUpperCase();
    if (s.includes("CORP")) return "CORP";
    if (s.includes("STU") || s.includes("STUDENT")) return "STU";
    if (s.includes("DEF") || s.includes("DEFENCE") || s.includes("DEFENSE")) return "DEF";
    return "PUB";
}

function mapBackendFlight(flight: any, idx: number, searchKey: string) {
    const firstSeg = flight.segments?.[0];
    const lastSeg = flight.segments?.[flight.segments.length - 1];
    const depDate = firstSeg ? parseUatDateTime(firstSeg.departure_datetime) : new Date();
    const arrDate = lastSeg ? parseUatDateTime(lastSeg.arrival_datetime) : new Date();

    const primaryFare = flight.fares?.[0] || {};
    const priceDetails = primaryFare.price_details || {};
    const totalPrice = priceDetails.total_amount || 3500;
    const taxAmount = priceDetails.tax_amount || Math.round(totalPrice * 0.15);
    const baseAmount =
        priceDetails.basic_amount ??
        priceDetails.base_amount ??
        totalPrice - taxAmount;
    const fareId = primaryFare.fare_id || `fare-${idx}`;

    const airlineCode = firstSeg?.airline_code || flight.airline_code || "FL";
    const flightNumber = firstSeg?.flight_number || `${100 + idx}`;
    const shortId = `${airlineCode}-${flightNumber}`.toUpperCase();

    const baggageRaw =
        primaryFare.baggage_allowance ||
        primaryFare.check_in_baggage ||
        primaryFare.baggage ||
        firstSeg?.baggage_allowance ||
        "";
    const baggageStr = formatBaggageLabel(baggageRaw);
    const hasBaggage = /kg|kilo|bag|\b(5|7|15|20|23|25|30)\b/i.test(baggageStr);

    const fareType =
        primaryFare.fare_type ||
        primaryFare.fare_category ||
        primaryFare.fare_basis_type ||
        "PUB";

    const equipment =
        firstSeg?.aircraft_type ||
        firstSeg?.equipment ||
        firstSeg?.aircraft ||
        null;

    const durationStr = firstSeg?.duration || "2h 30m";
    const cabinClass =
        firstSeg?.cabin_class ||
        primaryFare.cabin_class ||
        primaryFare.class_of_service ||
        "Economy";
    const foodRaw =
        primaryFare.food_onboard ??
        firstSeg?.food_onboard ??
        primaryFare.meal_included ??
        firstSeg?.meal_included;
    const { meal_available: mealFromFood, food_onboard: foodOnboard, meal_included } =
        parseFoodOnboardFromApi(foodRaw);
    const mealOptionsRaw =
        primaryFare.meal_options ??
        primaryFare.meals ??
        primaryFare.ssr_meals ??
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
        fare_type: normalizeFareType(fareType),
        has_baggage: hasBaggage,
        baggage_label: baggageStr || undefined,
        equipment: equipment || undefined,
        cabin_class: cabinClass,
        ticket_time_limit_hours: primaryFare.ticket_time_limit || primaryFare.ttl_hours || 24,
        meal_available: mealAvailable,
        food_onboard: foodOnboard,
        meal_options: mealAvailable ? mealOptions : undefined,
        search_key: searchKey,
        flight_key: flight.flight_key,
        fare_id: fareId,
    };
}

// Fallback mock generator in case the backend is down
function generateMockFlights(origin: string, destination: string, count: number = 4) {
    if (!origin || !destination) return [];

    const basePrices = [3200, 3800, 4500, 5100, 6200, 7500];
    const equipmentTypes = ["Boeing 737", "Airbus A320", "Boeing 787", "ATR 72"];
    const seed = origin.length + destination.length;

    return Array.from({ length: count }).map((_, i) => {
        const airlineMeta = MOCK_AIRLINES[(seed + i) % MOCK_AIRLINES.length];
        const basePrice = basePrices[(seed + i * 2) % basePrices.length];
        const stops = i % 3 === 0 ? 1 : 0;

        const depHour = 6 + (i * 3);
        const depPeriod = depHour >= 12 ? "PM" : "AM";
        const displayDepHour = depHour > 12 ? depHour - 12 : depHour;

        const durationHours = 2 + (i % 2);
        const durationMins = 15 + (i * 15 % 60);
        const durationStr = `${durationHours}h ${durationMins}m`;

        const arrHour = depHour + durationHours;
        const arrPeriod = arrHour >= 12 && arrHour < 24 ? "PM" : "AM";
        const displayArrHour = arrHour > 12 ? (arrHour === 24 ? 12 : arrHour - 12) : arrHour;

        return {
            id: `${airlineMeta.code}-${100 + i}`,
            airline: airlineMeta.name,
            airline_code: airlineMeta.code,
            origin: origin.charAt(0).toUpperCase() + origin.slice(1).toLowerCase(),
            destination: destination.charAt(0).toUpperCase() + destination.slice(1).toLowerCase(),
            departureTime: `${displayDepHour.toString().padStart(2, "0")}:${durationMins.toString().padStart(2, "0")} ${depPeriod}`,
            arrivalTime: `${displayArrHour.toString().padStart(2, "0")}:${((durationMins + 30) % 60).toString().padStart(2, "0")} ${arrPeriod}`,
            duration: durationStr,
            duration_minutes: durationHours * 60 + durationMins,
            departure_minutes: depHour * 60 + durationMins,
            arrival_minutes: arrHour * 60 + ((durationMins + 30) % 60),
            price: basePrice + (stops === 0 ? 500 : 0) + (Math.floor(Math.random() * 500)),
            stops,
            fare_type: i % 4 === 0 ? "CORP" : "PUB",
            has_baggage: i % 2 === 0,
            baggage_label: i % 2 === 0 ? "15kg" : undefined,
            equipment: equipmentTypes[i % equipmentTypes.length],
            ticket_time_limit_hours: i % 2 === 0 ? 12 : 24,
            cabin_class: "Economy",
            meal_available: i % 3 !== 0,
            food_onboard: i % 2 === 0,
            meal_options:
                i % 3 !== 0
                    ? parseMealOptionsFromApi([
                          { meal_code: "veg", meal_name: "Vegetarian", price: 249 },
                          { meal_code: "nonveg", meal_name: "Non-veg", price: 299 },
                      ])
                    : undefined,
            tax_amount: Math.round((basePrice + (stops === 0 ? 500 : 0)) * 0.15),
            base_amount: basePrice,
            search_key: "mock-search-key",
            flight_key: `mock-flight-${i}`,
            fare_id: `mock-fare-${i}`,
        };
    });
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
    const srCitizenSearch = searchParams.get("srCitizen") === "true";

    const originIata = getIataCode(originStr);
    const destinationIata = getIataCode(destinationStr);
    const cabinCode = cabinToClassCode(cabin);

    const backendUrl = process.env.BACKEND_API_URL || "http://localhost:8000";

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
    } else if (tripType === "round-trip" && !finalReturnDate) {
        const depDateObj = new Date(finalTravelDate);
        const futureReturn = new Date(depDateObj.getTime() + 3 * 24 * 60 * 60 * 1000);
        const rY = futureReturn.getFullYear();
        const rM = String(futureReturn.getMonth() + 1).padStart(2, '0');
        const rD = String(futureReturn.getDate()).padStart(2, '0');
        finalReturnDate = `${rY}-${rM}-${rD}`;
    }

    const postPayload = {
        origin: originIata,
        destination: destinationIata,
        travel_date: finalTravelDate,
        return_date: (tripType === "round-trip" && finalReturnDate) ? finalReturnDate : null,
        adult_count: adults,
        child_count: children,
        infant_count: infants,
        class_of_travel: cabinCode,
        airline_code: airlineCodeParam,
        student_fare_search: studentFareSearch,
        defence_fare_search: defenceFareSearch,
        sr_citizen_search: srCitizenSearch,
    };

    console.log(`BFF Request to backend search URL: ${backendUrl}/api/v1/flights/search/ with payload:`, postPayload);

    try {
        let response;
        if (backendUrl.includes("web")) {
            // Try calling the Docker network service first, fallback to localhost
            try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 1000); // 1-second timeout

                response = await fetch(`${backendUrl}/api/v1/flights/search/`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(postPayload),
                    signal: controller.signal
                });
                clearTimeout(timeoutId);
            } catch (dockerErr: any) {
                console.warn(`Failed to reach web:8000 quickly (Error: ${dockerErr?.message || dockerErr}). Retrying with localhost:8000...`);
                response = await fetch(`http://localhost:8000/api/v1/flights/search/`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(postPayload)
                });
            }
        } else {
            // Direct query to local host backend without any timeout/fallback
            response = await fetch(`${backendUrl}/api/v1/flights/search/`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(postPayload)
            });
        }

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Backend search failed with status ${response.status}: ${errorText}`);
        }

        const backendResult = await response.json();
        
        if (!backendResult.success || !backendResult.data || !backendResult.data.flights) {
            throw new Error(`Backend returned unsuccessful search: ${JSON.stringify(backendResult)}`);
        }

        const searchKey = backendResult.data.search_key;
        
        let outboundMapped = backendResult.data.flights.map((flight: any, idx: number) =>
            mapBackendFlight(flight, idx, searchKey)
        );

        if (nonStop) {
            outboundMapped = outboundMapped.filter((f: any) => f.stops === 0);
        }
        if (baggageFaresOnly) {
            outboundMapped = outboundMapped.filter((f: any) => f.has_baggage);
        }
        if (airlineCodeParam) {
            outboundMapped = outboundMapped.filter(
                (f: any) => f.airline_code?.toUpperCase() === airlineCodeParam
            );
        }

        // For round-trip, we split the backend results. The backend normalization returns return flights mixed in or separate.
        // Let's check segments of the returned flights: if a flight has return_flight: true in segments, it's a return flight.
        let outboundFlights = outboundMapped.filter((f: any) => {
            // Find backend flight structure for this flight
            const origFlight = backendResult.data.flights.find((of: any) => of.flight_key === f.flight_key);
            return origFlight?.segments.every((s: any) => !s.return_flight);
        });

        let returnFlights = outboundMapped.filter((f: any) => {
            const origFlight = backendResult.data.flights.find((of: any) => of.flight_key === f.flight_key);
            return origFlight?.segments.some((s: any) => s.return_flight);
        });

        // Fallback: If return flights list is empty but trip type is round-trip, let's auto-generate some mock return flights using search
        if (tripType === "round-trip" && returnFlights.length === 0) {
            returnFlights = generateMockFlights(destinationStr, originStr, 3);
        }

        const liveResponse = {
            flights: outboundFlights.length > 0 ? outboundFlights : outboundMapped,
            returnFlights: tripType === "round-trip" ? returnFlights : undefined
        };
        console.log("[BFF Flight Search API] Successfully fetched and mapped live flights from backend:", {
            origin: originIata,
            destination: destinationIata,
            tripType,
            departureDate,
            outboundCount: liveResponse.flights.length,
            returnCount: liveResponse.returnFlights?.length || 0,
            sampleOutbound: liveResponse.flights[0] || null
        });
        return NextResponse.json(liveResponse);

    } catch (error) {
        console.error("[BFF Flight Search API] Failed to fetch live flights, falling back to mock flights. Error:", error);
        
        let outboundMock = generateMockFlights(originStr, destinationStr, 5);
        if (nonStop) outboundMock = outboundMock.filter((f) => f.stops === 0);
        if (baggageFaresOnly) outboundMock = outboundMock.filter((f) => f.has_baggage);
        if (airlineCodeParam) {
            outboundMock = outboundMock.filter(
                (f) => f.airline_code?.toUpperCase() === airlineCodeParam
            );
        }

        let returnMock: any[] = [];
        if (tripType === "round-trip") {
            returnMock = generateMockFlights(destinationStr, originStr, 4);
            if (nonStop) returnMock = returnMock.filter((f) => f.stops === 0);
            if (baggageFaresOnly) returnMock = returnMock.filter((f) => f.has_baggage);
            if (airlineCodeParam) {
                returnMock = returnMock.filter(
                    (f) => f.airline_code?.toUpperCase() === airlineCodeParam
                );
            }
        }

        const mockResponse = {
            flights: outboundMock,
            returnFlights: tripType === "round-trip" ? returnMock : undefined
        };
        console.log("[BFF Flight Search API] Returning simulated/mock flight results fallback:", {
            origin: originIata,
            destination: destinationIata,
            tripType,
            departureDate,
            outboundCount: mockResponse.flights.length,
            returnCount: mockResponse.returnFlights?.length || 0,
            sampleOutbound: mockResponse.flights[0] || null
        });
        return NextResponse.json(mockResponse);
    }
}
