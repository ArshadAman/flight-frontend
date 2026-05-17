import { NextResponse } from "next/server";

// Helper to generate dynamic mock flights between any specific city pair
function generateMockFlights(origin: string, destination: string, count: number = 4) {
    if (!origin || !destination) return [];

    const airlines = ["SkyHigh Airlines", "Air Express", "GlobeTrotter", "Vayu Jet", "Cloud Nine Air"];
    const basePrices = [3200, 3800, 4500, 5100, 6200, 7500];

    // Seed variations slightly based on string length so same city pair looks somewhat consistent
    const seed = origin.length + destination.length;

    return Array.from({ length: count }).map((_, i) => {
        const airline = airlines[(seed + i) % airlines.length];
        const basePrice = basePrices[(seed + i * 2) % basePrices.length];
        const stops = i % 3 === 0 ? 1 : 0; // Every 3rd flight has 1 stop

        // Vary times and duration
        const depHour = 6 + (i * 3); // 6 AM, 9 AM, 12 PM, 3 PM...
        const depPeriod = depHour >= 12 ? "PM" : "AM";
        const displayDepHour = depHour > 12 ? depHour - 12 : depHour;

        const durationHours = 2 + (i % 2); // 2 or 3 hours
        const durationMins = 15 + (i * 15 % 60);

        const arrHour = depHour + durationHours;
        const arrPeriod = arrHour >= 12 && arrHour < 24 ? "PM" : "AM";
        const displayArrHour = arrHour > 12 ? (arrHour === 24 ? 12 : arrHour - 12) : arrHour;

        return {
            id: `FL-${origin.substring(0, 3).toUpperCase()}-${destination.substring(0, 3).toUpperCase()}-${100 + i}`,
            airline,
            origin: origin.charAt(0).toUpperCase() + origin.slice(1).toLowerCase(), // title case
            destination: destination.charAt(0).toUpperCase() + destination.slice(1).toLowerCase(),
            departureTime: `${displayDepHour.toString().padStart(2, '0')}:${durationMins.toString().padStart(2, '0')} ${depPeriod}`,
            arrivalTime: `${displayArrHour.toString().padStart(2, '0')}:${((durationMins + 30) % 60).toString().padStart(2, '0')} ${arrPeriod}`,
            duration: `${durationHours}h ${durationMins}m`,
            price: basePrice + (stops === 0 ? 500 : 0) + (Math.floor(Math.random() * 500)), // dynamic slight price variation
            stops,
        };
    });
}

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const origin = searchParams.get("origin")?.toLowerCase() || "";
    const destination = searchParams.get("destination")?.toLowerCase() || "";
    const nonStop = searchParams.get("nonStop") === "true";
    const tripType = searchParams.get("tripType") || "one-way";

    let outboundFlights = generateMockFlights(origin, destination, 5);

    if (nonStop) {
        outboundFlights = outboundFlights.filter(f => f.stops === 0);
    }

    let returnFlights: any[] = [];

    if (tripType === "round-trip") {
        returnFlights = generateMockFlights(destination, origin, 4);
        if (nonStop) {
            returnFlights = returnFlights.filter(f => f.stops === 0);
        }
    }

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 600));

    return NextResponse.json({
        flights: outboundFlights,
        returnFlights: tripType === "round-trip" ? returnFlights : undefined
    });
}
