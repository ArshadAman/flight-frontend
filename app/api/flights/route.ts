import { NextResponse } from "next/server";

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

// Fallback mock generator in case the backend is down
function generateMockFlights(origin: string, destination: string, count: number = 4) {
    if (!origin || !destination) return [];

    const airlines = ["SkyHigh Airlines", "Air Express", "GlobeTrotter", "Vayu Jet", "Cloud Nine Air"];
    const basePrices = [3200, 3800, 4500, 5100, 6200, 7500];

    const seed = origin.length + destination.length;

    return Array.from({ length: count }).map((_, i) => {
        const airline = airlines[(seed + i) % airlines.length];
        const basePrice = basePrices[(seed + i * 2) % basePrices.length];
        const stops = i % 3 === 0 ? 1 : 0; 

        const depHour = 6 + (i * 3); 
        const depPeriod = depHour >= 12 ? "PM" : "AM";
        const displayDepHour = depHour > 12 ? depHour - 12 : depHour;

        const durationHours = 2 + (i % 2); 
        const durationMins = 15 + (i * 15 % 60);

        const arrHour = depHour + durationHours;
        const arrPeriod = arrHour >= 12 && arrHour < 24 ? "PM" : "AM";
        const displayArrHour = arrHour > 12 ? (arrHour === 24 ? 12 : arrHour - 12) : arrHour;

        return {
            id: `FL-${origin.substring(0, 3).toUpperCase()}-${destination.substring(0, 3).toUpperCase()}-${100 + i}`,
            airline,
            origin: origin.charAt(0).toUpperCase() + origin.slice(1).toLowerCase(), 
            destination: destination.charAt(0).toUpperCase() + destination.slice(1).toLowerCase(),
            departureTime: `${displayDepHour.toString().padStart(2, '0')}:${durationMins.toString().padStart(2, '0')} ${depPeriod}`,
            arrivalTime: `${displayArrHour.toString().padStart(2, '0')}:${((durationMins + 30) % 60).toString().padStart(2, '0')} ${arrPeriod}`,
            duration: `${durationHours}h ${durationMins}m`,
            price: basePrice + (stops === 0 ? 500 : 0) + (Math.floor(Math.random() * 500)), 
            stops,
            search_key: "mock-search-key",
            flight_key: `mock-flight-${i}`,
            fare_id: `mock-fare-${i}`
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

    const originIata = getIataCode(originStr);
    const destinationIata = getIataCode(destinationStr);

    // Map cabin strings to backend cabin codes ("0" = Economy, etc.)
    let cabinCode = "0";
    if (cabin === "Prem. Economy" || cabin === "Premium Economy" || cabin === "Premium") {
        cabinCode = "1";
    } else if (cabin === "Business") {
        cabinCode = "2";
    } else if (cabin === "First" || cabin === "First Class") {
        cabinCode = "3";
    }

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
        airline_code: ""
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
        
        // Map backend nested format to flat Flight format
        let outboundMapped = backendResult.data.flights.map((flight: any, idx: number) => {
            const firstSeg = flight.segments[0];
            const lastSeg = flight.segments[flight.segments.length - 1];
            const depDate = firstSeg ? parseUatDateTime(firstSeg.departure_datetime) : new Date();
            const arrDate = lastSeg ? parseUatDateTime(lastSeg.arrival_datetime) : new Date();

            const primaryFare = flight.fares[0] || {};
            const totalPrice = primaryFare.price_details?.total_amount || 3500;
            const fareId = primaryFare.fare_id || `fare-${idx}`;

            const airlineCode = firstSeg?.airline_code || flight.airline_code || "FL";
            const flightNumber = firstSeg?.flight_number || `${100 + idx}`;
            const shortId = `${airlineCode}-${flightNumber}`.toUpperCase();

            return {
                id: shortId,
                airline: firstSeg?.airline_name || flight.airline_code || "Airline",
                origin: flight.origin,
                destination: flight.destination,
                departureTime: formatTime12h(depDate),
                arrivalTime: formatTime12h(arrDate),
                duration: firstSeg?.duration || "2h 30m",
                price: totalPrice,
                stops: flight.segments.length - 1,
                search_key: searchKey,
                flight_key: flight.flight_key,
                fare_id: fareId
            };
        });

        if (nonStop) {
            outboundMapped = outboundMapped.filter((f: any) => f.stops === 0);
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
        if (nonStop) {
            outboundMock = outboundMock.filter(f => f.stops === 0);
        }

        let returnMock: any[] = [];
        if (tripType === "round-trip") {
            returnMock = generateMockFlights(destinationStr, originStr, 4);
            if (nonStop) {
                returnMock = returnMock.filter(f => f.stops === 0);
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
