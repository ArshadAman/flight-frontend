"use client";

import React, { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, ArrowRightLeft, X, Plane, ChevronLeft, ChevronRight, Check, Clock, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { getPublicApiUrl } from "@/lib/apiConfig";
import { RouteMapBackground } from "@/components/sale/RouteMapBackground";

type Airport = {
    code: string;
    city: string;
    country: string;
    name: string;
};

type Segment = {
    id: number;
    fromCode: string;
    fromCity: string;
    fromTerminal: string;
    fromTime: string;
    toCode: string;
    toCity: string;
    toTerminal: string;
    toTime: string;
    airlineName: string;
    airlineCode: string;
    flightNumber: string;
    duration: string;
    plusOneDay: boolean;
    isEditing: boolean;
};

type PolicyKey = "cancellation" | "change" | "refund";

const POLICY_FIELDS: { key: PolicyKey; label: string; placeholder: string }[] = [
    { key: "cancellation", label: "Cancellation policy", placeholder: "Add cancellation policy details..." },
    { key: "change", label: "Change policy", placeholder: "Add change policy details..." },
    { key: "refund", label: "Refund policy", placeholder: "Add refund policy details..." },
];

const TERMINAL_OPTIONS = ["Terminal 1", "Terminal 2", "Terminal 3"];

const AIRPORT_COORDS: Record<string, { lat: number; lng: number }> = {
    DEL: { lat: 28.5562, lng: 77.1 },
    BOM: { lat: 19.0896, lng: 72.8656 },
    BLR: { lat: 13.1986, lng: 77.7066 },
    MAA: { lat: 12.9941, lng: 80.1709 },
    CCU: { lat: 22.6546, lng: 88.4467 },
    HYD: { lat: 17.2403, lng: 78.4294 },
    PNQ: { lat: 18.5822, lng: 73.9197 },
    AMD: { lat: 23.0772, lng: 72.6347 },
    GOI: { lat: 15.3808, lng: 73.8314 },
    JAI: { lat: 26.8242, lng: 75.8122 },
    COK: { lat: 10.152, lng: 76.4019 },
    LKO: { lat: 26.7606, lng: 80.8893 },
    GAU: { lat: 26.1061, lng: 91.5859 },
    TRV: { lat: 8.4821, lng: 76.9201 },
    BBI: { lat: 20.2443, lng: 85.8178 },
    PAT: { lat: 25.5913, lng: 85.088 },
    IDR: { lat: 22.7218, lng: 75.8011 },
    IXC: { lat: 30.6735, lng: 76.7885 },
    JFK: { lat: 40.6413, lng: -73.7781 },
    LHR: { lat: 51.47, lng: -0.4543 },
    DXB: { lat: 25.2532, lng: 55.3657 },
    SIN: { lat: 1.3644, lng: 103.9915 },
    CDG: { lat: 49.0097, lng: 2.5479 },
    HND: { lat: 35.5494, lng: 139.7798 },
    SYD: { lat: -33.9399, lng: 151.1753 },
    YYZ: { lat: 43.6777, lng: -79.6248 },
    FRA: { lat: 50.0379, lng: 8.5622 },
    HKG: { lat: 22.308, lng: 113.9185 },
    BKK: { lat: 13.69, lng: 100.7501 },
};

const AIRPORTS: Airport[] = [
    { code: "DEL", city: "New Delhi", country: "India", name: "Indira Gandhi International Airport" },
    { code: "BOM", city: "Mumbai", country: "India", name: "Chhatrapati Shivaji Maharaj International" },
    { code: "BLR", city: "Bangalore", country: "India", name: "Kempegowda International Airport" },
    { code: "MAA", city: "Chennai", country: "India", name: "Chennai International Airport" },
    { code: "CCU", city: "Kolkata", country: "India", name: "Netaji Subhas Chandra Bose International" },
    { code: "HYD", city: "Hyderabad", country: "India", name: "Rajiv Gandhi International Airport" },
    { code: "PNQ", city: "Pune", country: "India", name: "Pune Airport" },
    { code: "AMD", city: "Ahmedabad", country: "India", name: "Sardar Vallabhbhai Patel International" },
    { code: "GOI", city: "Goa", country: "India", name: "Dabolim Airport" },
    { code: "JAI", city: "Jaipur", country: "India", name: "Jaipur International Airport" },
    { code: "COK", city: "Cochin", country: "India", name: "Cochin International Airport" },
    { code: "LKO", city: "Lucknow", country: "India", name: "Chaudhary Charan Singh International" },
    { code: "GAU", city: "Guwahati", country: "India", name: "Lokpriya Gopinath Bordoloi International" },
    { code: "TRV", city: "Thiruvananthapuram", country: "India", name: "Trivandrum International Airport" },
    { code: "BBI", city: "Bhubaneswar", country: "India", name: "Biju Patnaik International Airport" },
    { code: "PAT", city: "Patna", country: "India", name: "Jay Prakash Narayan Airport" },
    { code: "IDR", city: "Indore", country: "India", name: "Devi Ahilya Bai Holkar Airport" },
    { code: "IXC", city: "Chandigarh", country: "India", name: "Chandigarh Airport" },
    { code: "JFK", city: "New York", country: "United States", name: "John F. Kennedy International" },
    { code: "LHR", city: "London", country: "United Kingdom", name: "Heathrow Airport" },
    { code: "DXB", city: "Dubai", country: "United Arab Emirates", name: "Dubai International Airport" },
    { code: "SIN", city: "Singapore", country: "Singapore", name: "Changi Airport" },
    { code: "CDG", city: "Paris", country: "France", name: "Charles de Gaulle Airport" },
    { code: "HND", city: "Tokyo", country: "Japan", name: "Haneda Airport" },
    { code: "SYD", city: "Sydney", country: "Australia", name: "Sydney Kingsford Smith Airport" },
    { code: "YYZ", city: "Toronto", country: "Canada", name: "Toronto Pearson International" },
    { code: "FRA", city: "Frankfurt", country: "Germany", name: "Frankfurt Airport" },
    { code: "HKG", city: "Hong Kong", country: "Hong Kong", name: "Hong Kong International Airport" },
    { code: "BKK", city: "Bangkok", country: "Thailand", name: "Suvarnabhumi Airport" },
];

function formatDateLabel(dateStr: string, options: Intl.DateTimeFormatOptions) {
    return new Date(`${dateStr}T00:00:00`).toLocaleDateString("en-US", options);
}

function getOperatingDateOptions(baseDate: string | null, count = 8) {
    if (!baseDate) return [];

    const startDate = new Date(`${baseDate}T00:00:00`);
    const dates: string[] = [];

    for (let i = 0; i < count; i += 1) {
        const nextDate = new Date(startDate);
        nextDate.setDate(startDate.getDate() + i * 7);
        dates.push(nextDate.toISOString().slice(0, 10));
    }

    return dates;
}

export default function AddPNRPage() {
    const router = useRouter();
    const { access } = useAuth();
    const [step, setStep] = useState(0); // 0 = empty, 1 = filled + dep date, 2 = return date, 3 = schedule screen
    
    const [origin, setOrigin] = useState<Airport | null>(null);
    const [destination, setDestination] = useState<Airport | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [activeInput, setActiveInput] = useState<"origin" | "destination" | null>(null);
    const [selectedDate, setSelectedDate] = useState<string | null>(null); // ISO string YYYY-MM-DD
    const [calendarMonth, setCalendarMonth] = useState(() => { const d = new Date(); return new Date(d.getFullYear(), d.getMonth(), 1); });
    const [returnCalendarMonth, setReturnCalendarMonth] = useState(() => { const d = new Date(); return new Date(d.getFullYear(), d.getMonth() + 1, 1); });
    const [selectedReturnDate, setSelectedReturnDate] = useState<string | null>(null);
    
    // Modal states
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [hasScheduledFlight, setHasScheduledFlight] = useState(false);
    const [modalTab, setModalTab] = useState(1);

    // Baggage State
    const [maxWeight, setMaxWeight] = useState("Weight");
    const [baggagePrice, setBaggagePrice] = useState("");
    const [isFreeBaggage, setIsFreeBaggage] = useState(false);

    // Seats State
    const [availableSeats, setAvailableSeats] = useState("");
    const [seatPrice, setSeatPrice] = useState("");
    const [isRefundable, setIsRefundable] = useState(true);

    // Operating Dates State
    const [selectedOperatingDates, setSelectedOperatingDates] = useState<string[]>([]);
    const [requiresApis, setRequiresApis] = useState(false);
    const [policyTexts, setPolicyTexts] = useState<Record<PolicyKey, string>>({
        cancellation: "",
        change: "",
        refund: "",
    });
    const [openPolicies, setOpenPolicies] = useState<PolicyKey[]>([]);

    const [isSubmitting, setIsSubmitting] = useState(false);

    // Segments state
    const [segments, setSegments] = useState<Segment[]>([
        {
            id: 1,
            fromCode: "DEL", fromCity: "New Delhi", fromTerminal: "Terminal 3", fromTime: "23:00",
            toCode: "BKK", toCity: "Bangkok", toTerminal: "Terminal 3", toTime: "11:00",
            airlineName: "Air India", airlineCode: "AI", flightNumber: "AI-121", duration: "12h 0m",
            plusOneDay: false,
            isEditing: true
        }
    ]);

    // Initialize segments when origin and destination are selected
    useEffect(() => {
        if (origin && destination) {
            setSegments([
                {
                    id: 1,
                    fromCode: origin.code,
                    fromCity: origin.city,
                    fromTerminal: "Terminal 3",
                    fromTime: "23:00",
                    toCode: destination.code,
                    toCity: destination.city,
                    toTerminal: "Terminal 3",
                    toTime: "11:00",
                    airlineName: "",
                    airlineCode: "",
                    flightNumber: "",
                    duration: "12h 0m",
                    plusOneDay: false,
                    isEditing: true
                }
            ]);
        }
    }, [origin, destination]);

    useEffect(() => {
        if (!selectedDate) return;

        setSelectedOperatingDates((currentDates) => {
            if (currentDates.length > 0) return currentDates;
            return [selectedDate];
        });
    }, [selectedDate]);

    useEffect(() => {
        if (isFreeBaggage) {
            setBaggagePrice("0");
        }
    }, [isFreeBaggage]);

    const operatingDateOptions = useMemo(
        () => getOperatingDateOptions(selectedDate),
        [selectedDate]
    );

    const operatingDateGroups = useMemo(() => {
        return operatingDateOptions.reduce((groups, dateStr) => {
            const label = formatDateLabel(dateStr, { month: "long", year: "numeric" });
            groups[label] = groups[label] || [];
            groups[label].push(dateStr);
            return groups;
        }, {} as Record<string, string[]>);
    }, [operatingDateOptions]);

    const selectedWeekdayLabels = useMemo(() => {
        const labels = selectedOperatingDates
            .slice()
            .sort()
            .map((dateStr) => formatDateLabel(dateStr, { weekday: "long" }));
        return Array.from(new Set(labels));
    }, [selectedOperatingDates]);

    const hasUnconfirmedSegments = useMemo(
        () => segments.some((segment) => segment.isEditing),
        [segments]
    );

    const updateSegment = (id: number, field: keyof Segment, value: Segment[keyof Segment]) => {
        setSegments(segments.map(seg => seg.id === id ? { ...seg, [field]: value } : seg));
    };

    const handleAddStopover = () => {
        if (segments.length === 1 && destination) {
            const first = segments[0];
            setSegments([
                {
                    id: 1,
                    fromCode: first.fromCode,
                    fromCity: first.fromCity,
                    fromTerminal: "Terminal 3",
                    fromTime: "23:00",
                    toCode: destination.code,
                    toCity: destination.city,
                    toTerminal: "Terminal 3",
                    toTime: "03:00",
                    airlineName: first.airlineName || "",
                    airlineCode: first.airlineCode || "",
                    flightNumber: "",
                    duration: "4h 0m",
                    plusOneDay: true,
                    isEditing: false
                },
                {
                    id: 2,
                    fromCode: destination.code,
                    fromCity: destination.city,
                    fromTerminal: "Terminal 3",
                    fromTime: "05:00",
                    toCode: first.toCode,
                    toCity: first.toCity,
                    toTerminal: "Terminal 3",
                    toTime: "11:00",
                    airlineName: "",
                    airlineCode: "",
                    flightNumber: "",
                    duration: "4h 30m",
                    plusOneDay: false,
                    isEditing: true
                }
            ]);
        }
    };

    const handleDeleteStop = () => {
        if (origin && destination) {
            const firstSeg = segments[0];
            setSegments([
                {
                    id: 1,
                    fromCode: origin.code,
                    fromCity: origin.city,
                    fromTerminal: "Terminal 3",
                    fromTime: firstSeg?.fromTime || "23:00",
                    toCode: destination.code,
                    toCity: destination.city,
                    toTerminal: "Terminal 3",
                    toTime: segments[segments.length - 1]?.toTime || "11:00",
                    airlineName: firstSeg?.airlineName || "",
                    airlineCode: firstSeg?.airlineCode || "",
                    flightNumber: firstSeg?.flightNumber || "",
                    duration: "12h 0m",
                    plusOneDay: false,
                    isEditing: true
                }
            ]);
        }
    };

    const toggleOperatingDate = (dateStr: string) => {
        if (selectedOperatingDates.includes(dateStr)) {
            setSelectedOperatingDates(selectedOperatingDates.filter(d => d !== dateStr));
        } else {
            setSelectedOperatingDates([...selectedOperatingDates, dateStr].sort());
        }
    };

    const togglePolicyEditor = (policyKey: PolicyKey) => {
        setOpenPolicies((currentPolicies) =>
            currentPolicies.includes(policyKey)
                ? currentPolicies.filter((key) => key !== policyKey)
                : [...currentPolicies, policyKey]
        );
    };

    const handleCreateFlights = async () => {
        if (!access) {
            alert("Unauthorized. Please log in as an agent.");
            return;
        }
        if (!origin || !destination) {
            alert("Origin and destination are required.");
            return;
        }
        if (selectedOperatingDates.length === 0) {
            alert("Please select at least one operating date.");
            return;
        }

        // Validate all segments have required fields
        for (let i = 0; i < segments.length; i++) {
            const seg = segments[i];
            if (!seg.airlineName?.trim()) {
                alert(`Please enter the airline name for segment ${i + 1}.`);
                return;
            }
            if (!seg.airlineCode?.trim()) {
                alert(`Please enter the airline code (e.g. 6E) for segment ${i + 1}.`);
                return;
            }
            if (!seg.flightNumber?.trim()) {
                alert(`Please enter the flight number for segment ${i + 1}.`);
                return;
            }
            if (seg.isEditing) {
                alert(`Segment ${i + 1} is not confirmed yet. Open Flight detail and click "Confirm segment" first.`);
                return;
            }
        }

        setIsSubmitting(true);
        try {
            const apiBase = getPublicApiUrl();

            for (const dateStr of selectedOperatingDates) {
                const [year, month, day] = dateStr.split('-').map(Number);
                const depTimeStr = segments[0]?.fromTime || "23:00";
                const [depHour, depMin] = depTimeStr.split(':').map(Number);
                
                // Create local date object
                const localDepDate = new Date(year, month - 1, day, depHour, depMin);
                const apiSegments = [];

                let currentDepDate = new Date(localDepDate);

                for (let i = 0; i < segments.length; i++) {
                    const seg = segments[i];
                    const [sDepH, sDepM] = seg.fromTime.split(':').map(Number);
                    
                    if (i > 0) {
                        const prevArrStr = apiSegments[i - 1].arrival_datetime;
                        const prevArrDate = new Date(prevArrStr);
                        currentDepDate = new Date(prevArrDate);
                        currentDepDate.setHours(sDepH, sDepM, 0, 0);
                        if (currentDepDate < prevArrDate) {
                            currentDepDate.setDate(currentDepDate.getDate() + 1);
                        }
                    } else {
                        currentDepDate.setHours(sDepH, sDepM, 0, 0);
                    }

                    const [sArrH, sArrM] = seg.toTime.split(':').map(Number);
                    const currentArrDate = new Date(currentDepDate);
                    currentArrDate.setHours(sArrH, sArrM, 0, 0);
                    if (seg.plusOneDay) {
                        currentArrDate.setDate(currentArrDate.getDate() + 1);
                    } else if (currentArrDate < currentDepDate) {
                        currentArrDate.setDate(currentArrDate.getDate() + 1);
                    }

                    apiSegments.push({
                        segment_id: i,
                        airline_code: (seg.airlineCode || "").toUpperCase().trim(),
                        airline_name: (seg.airlineName || "").trim(),
                        flight_number: (seg.flightNumber || "").toUpperCase().trim(),
                        aircraft_type: "Airbus A320",
                        origin: seg.fromCode,
                        origin_city: seg.fromCity,
                        origin_terminal: seg.fromTerminal,
                        destination: seg.toCode,
                        destination_city: seg.toCity,
                        destination_terminal: seg.toTerminal,
                        departure_datetime: currentDepDate.toISOString(),
                        arrival_datetime: currentArrDate.toISOString(),
                        duration: seg.duration,
                        stop_over: i < segments.length - 1 ? "2h 15m" : null,
                        return_flight: false
                    });
                }

                const firstSegDep = apiSegments[0].departure_datetime;
                const lastSegArr = apiSegments[apiSegments.length - 1].arrival_datetime;
                
                const firstMs = new Date(firstSegDep).getTime();
                const lastMs = new Date(lastSegArr).getTime();
                const diffMin = Math.round((lastMs - firstMs) / 60000);
                const totalDurStr = `${Math.floor(diffMin / 60)}h ${diffMin % 60}m`;

                const mainAirlineCode = apiSegments[0].airline_code;
                const mainAirlineName = apiSegments[0].airline_name;
                const mainFlightNumber = apiSegments[0].flight_number;
                const filledPolicies = Object.fromEntries(
                    Object.entries(policyTexts).filter(([, value]) => value.trim())
                );

                const payload = {
                    airline_code: mainAirlineCode,
                    airline_name: mainAirlineName,
                    flight_number: mainFlightNumber,
                    origin: origin.code,
                    destination: destination.code,
                    departure_datetime: firstSegDep,
                    arrival_datetime: lastSegArr,
                    price: parseFloat(seatPrice || "150"),
                    seats_available: parseInt(availableSeats || "10", 10),
                    cabin_class: "Economy",
                    duration: totalDurStr,
                    is_refundable: isRefundable,
                    baggage_check_in: maxWeight !== "Weight" ? maxWeight : "15 kg",
                    baggage_hand: "7 kg",
                    apis_required: requiresApis,
                    policies: filledPolicies,
                    segments: apiSegments
                };

                const res = await fetch(`${apiBase}/flights/inventory/`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${access}`
                    },
                    body: JSON.stringify(payload)
                });

                if (!res.ok) {
                    const errText = await res.text();
                    throw new Error(`Failed to save date ${dateStr}: ${errText}`);
                }
            }

            alert("Successfully created flight inventory!");
            router.push("/sale/inventory");
        } catch (error: unknown) {
            console.error(error);
            const errorMessage = error instanceof Error ? error.message : "Failed to create flight inventory.";
            alert(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    const filteredAirports = AIRPORTS.filter(airport => 
        airport.country.toLowerCase().includes(searchQuery.toLowerCase()) ||
        airport.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
        airport.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        airport.code.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleSelectAirport = (airport: Airport) => {
        if (activeInput === "origin") {
            setOrigin(airport);
            setActiveInput("destination");
            setSearchQuery("");
        } else if (activeInput === "destination") {
            setDestination(airport);
            setActiveInput(null);
            setSearchQuery("");
            if (origin) {
                setStep(1);
            }
        }
    };

    const handleAddFlightDetails = () => {
        if (step > 0 && selectedDate) {
            setSelectedOperatingDates((currentDates) =>
                currentDates.length > 0 ? currentDates : [selectedDate]
            );
            setStep(3);
        } else if (!selectedDate && step > 0) {
            alert("Please select a date from the calendar first.");
        }
    };

    // Real calendar renderer
    const renderCalendar = (
        title: string,
        viewMonth: Date,
        onPrev: () => void,
        onNext: () => void,
        pickedDate: string | null,
        onPickDate: (iso: string) => void,
        highlighted = false
    ) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const year = viewMonth.getFullYear();
        const month = viewMonth.getMonth();
        const monthName = viewMonth.toLocaleString('default', { month: 'long' });
        const firstDayOfWeek = new Date(year, month, 1).getDay(); // 0=Sun
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const daysInPrevMonth = new Date(year, month, 0).getDate();

        const cells: { day: number; iso: string; type: 'prev' | 'curr' | 'next' }[] = [];
        for (let i = firstDayOfWeek - 1; i >= 0; i--) {
            const d = daysInPrevMonth - i;
            const pm = month === 0 ? 11 : month - 1;
            const py = month === 0 ? year - 1 : year;
            cells.push({ day: d, iso: `${py}-${String(pm + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`, type: 'prev' });
        }
        for (let d = 1; d <= daysInMonth; d++) {
            cells.push({ day: d, iso: `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`, type: 'curr' });
        }
        const remaining = 42 - cells.length;
        for (let d = 1; d <= remaining; d++) {
            const nm = month === 11 ? 0 : month + 1;
            const ny = month === 11 ? year + 1 : year;
            cells.push({ day: d, iso: `${ny}-${String(nm + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`, type: 'next' });
        }

        return (
            <div className={`bg-white rounded-xl shadow-2xl border overflow-hidden w-full max-w-[320px] flex flex-col pointer-events-auto shrink-0 ${highlighted ? "border-[#D60D26] ring-2 ring-[#D60D26]/20" : "border-slate-200"}`}>
                <div className="bg-[#121121] text-white text-center py-2.5 text-[12px] font-bold tracking-widest uppercase">
                    {title}
                </div>
                <div className="bg-[#FFE8EE] text-slate-800 flex items-center justify-between px-5 py-3 font-extrabold text-[15px]">
                    <button onClick={onPrev} className="hover:text-[#D60D26] transition-colors p-1 rounded">
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    {monthName} {year}
                    <button onClick={onNext} className="hover:text-[#D60D26] transition-colors p-1 rounded">
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </div>
                <div className="p-5 bg-white">
                    <div className="grid grid-cols-7 text-center text-[13px] font-bold mb-4">
                        {['S','M','T','W','T','F','S'].map((d, i) => (
                            <div key={i} className={i === 0 ? 'text-[#D60D26]' : 'text-slate-600'}>{d}</div>
                        ))}
                    </div>
                    <div className="grid grid-cols-7 text-center text-[14px] gap-y-2">
                        {cells.map((cell, i) => {
                            const cellDate = new Date(cell.iso + 'T00:00:00');
                            const isPast = cellDate < today;
                            const isSelected = pickedDate === cell.iso;
                            const isToday = cell.iso === today.toISOString().slice(0, 10);
                            const isOtherMonth = cell.type !== 'curr';
                            return (
                                <div
                                    key={i}
                                    onClick={() => !isPast && !isOtherMonth && onPickDate(cell.iso)}
                                    className={`rounded-full w-8 h-8 flex items-center justify-center mx-auto font-bold transition-colors ${
                                        isSelected
                                            ? 'bg-[#D60D26] text-white cursor-pointer'
                                            : isOtherMonth
                                            ? 'text-slate-300 font-medium cursor-default'
                                            : isPast
                                            ? 'text-slate-300 cursor-not-allowed'
                                            : isToday
                                            ? 'ring-2 ring-[#D60D26] text-[#D60D26] cursor-pointer hover:bg-rose-50'
                                            : 'text-slate-700 cursor-pointer hover:bg-slate-100'
                                    }`}
                                >
                                    {cell.day}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        );
    };

    const originCoords = origin ? AIRPORT_COORDS[origin.code] ?? null : null;
    const destinationCoords = destination ? AIRPORT_COORDS[destination.code] ?? null : null;

    const handleSwapRoute = () => {
        if (!origin || !destination) return;
        const nextOrigin = destination;
        const nextDestination = origin;
        setOrigin(nextOrigin);
        setDestination(nextDestination);
    };

    return (
        <div className="w-full h-screen flex flex-col bg-[#F2FBFF] overflow-hidden font-sans relative">
            {/* Header */}
            <div className="w-full h-16 bg-gradient-to-r from-[#D60D26] to-[#30060F] text-white flex items-center justify-between px-4 sm:px-6 z-20 shrink-0 shadow-md overflow-x-auto no-scrollbar">
                <button onClick={() => router.back()} className="flex items-center gap-1 sm:gap-2 font-bold text-[14px] sm:text-[15px] hover:text-white/80 transition-colors shrink-0">
                    <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" /> Add flights
                </button>
                <div className="flex items-center gap-1.5 sm:gap-3 text-[11px] sm:text-[14px] shrink-0 mx-auto px-4">
                    <div className="flex flex-col items-center relative">
                        <span className="font-bold">Route</span>
                        <div className="w-1.5 h-1.5 bg-white rounded-full absolute -bottom-1"></div>
                    </div>
                    <ArrowRight className="w-3 h-3 text-white/50" />
                    <div className="flex flex-col items-center relative">
                        <span className={step >= 3 ? "text-white font-bold" : "text-white/70 font-medium"}>Flights</span>
                        {step === 3 && <div className="w-1.5 h-1.5 bg-white rounded-full absolute -bottom-1"></div>}
                    </div>
                    <ArrowRight className="w-3 h-3 text-white/50" />
                    <div className="flex flex-col items-center relative">
                        <span className={step === 4 ? "text-white font-bold" : "text-white/70 font-medium"}>Confirmation</span>
                        {step === 4 && <div className="w-1.5 h-1.5 bg-white rounded-full absolute -bottom-1"></div>}
                    </div>
                </div>
                <div className="hidden md:block w-[120px] shrink-0"></div>
            </div>

            {/* Map Background (Only for steps 0-2) */}
            {step < 3 && (
                <div className="absolute inset-0 z-0 top-16 bottom-[88px]">
                    <RouteMapBackground origin={originCoords} destination={destinationCoords} />
                </div>
            )}

            {/* Step 0-2 View */}
            {step < 3 && (
                <div className="relative z-20 flex-1 overflow-y-auto flex flex-col items-center pt-6 sm:pt-8 pb-24 px-4 pointer-events-none w-full">
                    <div className="bg-white rounded-[20px] shadow-[0_8px_30px_rgba(0,0,0,0.12)] px-5 py-4 sm:px-8 sm:py-5 flex flex-col sm:flex-row items-center gap-4 w-full max-w-[720px] pointer-events-auto relative shrink-0 z-30">
                        <div 
                            className={`w-full sm:flex-1 px-6 py-2 rounded-xl cursor-text transition-colors ${activeInput === "origin" ? "bg-slate-50 ring-2 ring-[#D60D26]/20" : "hover:bg-slate-50"}`}
                            onClick={() => setActiveInput("origin")}
                        >
                            <div className="text-[12px] text-slate-400 font-bold uppercase tracking-wider mb-1">Origin</div>
                            {activeInput === "origin" ? (
                                <input 
                                    autoFocus
                                    type="text" 
                                    className="w-full bg-transparent outline-none font-extrabold text-slate-800 text-[20px] placeholder:text-slate-300"
                                    placeholder="Search country or airport..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            ) : (
                                <div className="font-extrabold text-slate-800 text-[20px] truncate">
                                    {origin ? (
                                        <>
                                            {origin.city}{" "}
                                            <span className="text-[#D60D26]">({origin.code})</span>
                                        </>
                                    ) : (
                                        <span className="text-slate-300">Select Origin</span>
                                    )}
                                </div>
                            )}
                        </div>
                        
                        <button
                            type="button"
                            onClick={handleSwapRoute}
                            disabled={!origin || !destination}
                            className="w-12 h-12 rounded-full border border-[#D60D26] text-[#D60D26] flex items-center justify-center shrink-0 bg-white z-10 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-rose-50 transition-colors"
                            aria-label="Swap origin and destination"
                        >
                            <ArrowRight className="w-5 h-5" />
                        </button>

                        <div 
                            className={`w-full sm:flex-1 px-6 py-2 rounded-xl cursor-text transition-colors ${activeInput === "destination" ? "bg-slate-50 ring-2 ring-[#D60D26]/20" : "hover:bg-slate-50"}`}
                            onClick={() => setActiveInput("destination")}
                        >
                            <div className="text-[12px] text-slate-400 font-bold uppercase tracking-wider mb-1">Destination</div>
                            {activeInput === "destination" ? (
                                <input 
                                    autoFocus
                                    type="text" 
                                    className="w-full bg-transparent outline-none font-extrabold text-slate-800 text-[20px] placeholder:text-slate-300"
                                    placeholder="Search country or airport..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            ) : (
                                <div className="font-extrabold text-slate-800 text-[20px] truncate">
                                    {destination ? (
                                        <>
                                            {destination.city}{" "}
                                            <span className="text-[#D60D26]">({destination.code})</span>
                                        </>
                                    ) : (
                                        <span className="text-slate-300">Select Destination</span>
                                    )}
                                </div>
                            )}
                        </div>

                        {activeInput && (
                            <div className="absolute top-full left-0 mt-4 w-full bg-white rounded-2xl shadow-xl border border-slate-100 max-h-[300px] overflow-y-auto z-50">
                                {filteredAirports.length > 0 ? (
                                    filteredAirports.map((airport, idx) => (
                                        <div 
                                            key={idx}
                                            className="px-6 py-4 hover:bg-slate-50 cursor-pointer flex items-center gap-4 border-b border-slate-50 last:border-0"
                                            onClick={() => handleSelectAirport(airport)}
                                        >
                                            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                                                <Plane className="w-4 h-4 text-slate-400" />
                                            </div>
                                            <div>
                                                <div className="font-bold text-slate-700 text-[16px]">
                                                    {airport.city} <span className="text-[#D60D26]">({airport.code})</span>
                                                </div>
                                                <div className="text-[13px] text-slate-500 font-medium">
                                                    {airport.country} - {airport.name}
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="p-8 text-center text-slate-400 font-medium">
                                        No airports found.
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {step > 0 && (
                        <div className="mt-8 flex flex-col lg:flex-row gap-5 pointer-events-auto animate-in fade-in slide-in-from-bottom-4 duration-500 relative z-20 items-center justify-center w-full max-w-[700px]">
                            {renderCalendar(
                                "FROM",
                                calendarMonth,
                                () => setCalendarMonth(m => new Date(m.getFullYear(), m.getMonth() - 1, 1)),
                                () => setCalendarMonth(m => new Date(m.getFullYear(), m.getMonth() + 1, 1)),
                                selectedDate,
                                (iso) => setSelectedDate(iso)
                            )}
                            {renderCalendar(
                                "TO",
                                returnCalendarMonth,
                                () => setReturnCalendarMonth(m => new Date(m.getFullYear(), m.getMonth() - 1, 1)),
                                () => setReturnCalendarMonth(m => new Date(m.getFullYear(), m.getMonth() + 1, 1)),
                                selectedReturnDate,
                                (iso) => {
                                    setSelectedReturnDate(iso);
                                    setStep(2);
                                },
                                step === 2
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* Step 3 View: Schedule Screen */}
            {step === 3 && (
                <div className="flex-1 bg-[#F2FBFF] flex flex-col items-center w-full relative z-30 overflow-y-auto">
                    {/* Header route text */}
                    <div className="w-full bg-white pt-6 px-10">
                        <div className="font-extrabold text-slate-800 flex items-center gap-3 text-[18px]">
                            {origin?.city || "New Delhi"} <span className="text-slate-400">({origin?.code || "DEL"})</span>
                            <div className="w-6 h-6 rounded-full border border-[#D60D26] flex items-center justify-center">
                                <ArrowRight className="w-3 h-3 text-[#D60D26]" />
                            </div>
                            {destination?.city || "Destination"} <span className="text-slate-400">({destination?.code || "---"})</span>
                        </div>
                    </div>

                    {/* Header Tabs */}
                    <div className="w-full bg-white px-6 sm:px-10 flex items-center gap-8 sm:gap-12 border-b border-slate-200 mt-6 shrink-0 overflow-x-auto whitespace-nowrap no-scrollbar">
                        {(selectedWeekdayLabels.length > 0 ? selectedWeekdayLabels : ["Select operating dates"]).map((label, index) => (
                            <div
                                key={label}
                                className={`font-bold py-4 ${index === 0 ? "text-[#D60D26] border-b-4 border-[#D60D26]" : "text-slate-400"}`}
                            >
                                {label}
                            </div>
                        ))}
                    </div>

                    <div className="w-full max-w-[1100px] px-4 sm:px-10 mt-10 pb-20">
                        {/* Main card */}
                        <div className="bg-white rounded-[24px] shadow-sm border border-slate-200 p-8 mb-6">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="flex items-center gap-2 border border-slate-200 rounded-xl px-4 py-2 font-bold text-slate-700 text-[14px]">
                                    {origin?.code || "---"} <ArrowRight className="w-4 h-4 text-[#D60D26]" /> {destination?.code || "---"}
                                </div>
                                <div className="flex items-center border border-[#D60D26] rounded-xl overflow-hidden font-bold">
                                    <div className="bg-[#D60D26] text-white px-3 py-2 text-[14px]">
                                        {selectedDate ? new Date(selectedDate + 'T00:00:00').toLocaleString('default', { month: 'short' }).toUpperCase() : 'DATE'}
                                    </div>
                                    <div className="bg-white text-[#D60D26] px-3 py-2 text-[14px]">
                                        {selectedDate ? String(new Date(selectedDate + 'T00:00:00').getDate()).padStart(2, '0') : '--'}
                                    </div>
                                </div>
                            </div>

                            <div 
                                onClick={() => setIsModalOpen(true)}
                                className="w-full bg-[#0C2342] rounded-[12px] p-5 flex items-center justify-between text-white cursor-pointer hover:bg-[#0C2342] transition-colors border-2 border-[#090001]"
                            >
                                <div className="flex items-center gap-4">
                                    <Plane className="w-10 h-10 fill-white" />
                                </div>
                                <div className="font-bold text-[18px] flex items-center gap-2">
                                    Schedule A Flights <ArrowRight className="w-5 h-5" />
                                </div>
                            </div>

                            {hasScheduledFlight && (
                                <div className="mt-4 flex items-stretch justify-between bg-white border border-slate-200 rounded-xl shadow-sm relative overflow-x-auto sm:overflow-hidden h-[70px] animate-in slide-in-from-top-2 duration-300">
                                    <div className="w-24 bg-[#D60D26] shrink-0"></div>
                                    <div className="flex-1 flex items-center px-4 sm:px-8 font-bold text-slate-600 text-[14px] justify-between min-w-[500px]">
                                        <div className="w-[180px]">
                                            {segments.map((seg) => `${seg.airlineCode || "-"} ${seg.flightNumber || "-"}`).join(" / ")}
                                        </div>
                                        <div className="w-[150px] text-center">
                                            {segments.map((seg) => seg.airlineName || seg.airlineCode || "-").join(" / ")}
                                        </div>
                                        <div className="w-[200px] text-right">
                                            {segments.map((seg) => `${seg.fromTime}-${seg.toTime}${seg.plusOneDay ? "(+1)" : ""}`).join(" / ")}
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => setHasScheduledFlight(false)} 
                                        className="w-[70px] flex items-center justify-center border-l border-slate-200 hover:bg-slate-50 transition-colors"
                                    >
                                        <X className="w-5 h-5 text-slate-700" />
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="bg-white rounded-[24px] shadow-sm border border-slate-200 p-8 flex items-center justify-center gap-3 text-[#D60D26] font-bold text-[16px]">
                            <ArrowRightLeft className="w-5 h-5" /> No return flight
                        </div>
                    </div>
                </div>
            )}

            {/* Step 4 View: Confirmation Screen */}
            {step === 4 && (
                <div className="flex-1 bg-white flex flex-col w-full relative z-30 overflow-y-auto pt-10 px-4 sm:px-10 pb-20">
                    <div className="w-full max-w-[1400px] mx-auto">
                        <div className="overflow-x-auto">
                        <div className="w-full">
                                <div className="hidden md:grid grid-cols-8 gap-4 text-[13px] font-bold text-slate-400 mb-4 px-4">
                            <div className="col-span-2">Route</div>
                            <div>Date</div>
                            <div>Time</div>
                            <div>Airlines</div>
                            <div>Flight numbers</div>
                            <div>No. of seats</div>
                            <div>Ticket fare</div>
                            <div>APIS</div>
                        </div>
                        
                        <div className="bg-slate-100 px-4 py-2 text-[13px] font-bold text-slate-700">
                            Selected Operating Dates
                        </div>
                        
                        {selectedOperatingDates.map((dateStr, idx) => {
                            const formattedDate = formatDateLabel(dateStr, { weekday: 'short', day: 'numeric', month: 'short', year: '2-digit' });
                            const depTime = segments[0]?.fromTime || "23:00";
                            const arrTime = segments[segments.length - 1]?.toTime || "11:00";
                            const plusOne = segments[segments.length - 1]?.plusOneDay || false;
                            
                            const airlineNames = segments.map(seg => seg.airlineName || seg.airlineCode || "-").join(' / ');
                            const flightNumbers = segments.map(seg => seg.flightNumber || "-").join(' • ');

                            return (
                                <div key={idx} className="border-b border-slate-200 flex flex-col md:grid md:grid-cols-8 gap-2 md:gap-4 items-start md:items-center py-6 px-4 text-[13px] font-bold text-slate-700">
                                    <div className="flex flex-col md:col-span-2 w-full">
                                        <span className="md:hidden text-slate-400 font-medium mb-1">Route:</span>
                                        <span>{origin?.code} → {destination?.code} <span className="text-slate-400 font-medium">• ({segments.length - 1} Stops)</span></span>
                                    </div>
                                    <div className="flex items-center gap-2 w-full"><span className="md:hidden text-slate-400 font-medium w-20">Date:</span>{formattedDate}</div>
                                    <div className="flex items-center gap-2 w-full"><span className="md:hidden text-slate-400 font-medium w-20">Time:</span>{depTime} - {arrTime}{plusOne ? "(+1)" : ""}</div>
                                    <div className="flex items-center gap-2 w-full"><span className="md:hidden text-slate-400 font-medium w-20">Airlines:</span>{airlineNames}</div>
                                    <div className="flex items-center gap-2 w-full"><span className="md:hidden text-slate-400 font-medium w-20">Flight No:</span>{flightNumbers}</div>
                                    <div className="flex items-center gap-1.5 w-full">
                                        <span className="md:hidden text-slate-400 font-medium w-20">Seats:</span>
                                        <svg className="w-4 h-4 text-slate-400 hidden md:block" fill="currentColor" viewBox="0 0 24 24"><path d="M4 18v3h2v-3h12v3h2v-3H4zm2-10h12v6H6V8zm0-4h12v2H6V4z"/></svg>
                                        {availableSeats || "10"}
                                    </div>
                                    <div className="text-[14px] flex items-center gap-2 w-full"><span className="md:hidden text-slate-400 font-medium w-20 text-[13px]">Fare:</span>INR {seatPrice || "00.00"}</div>
                                    <div className="flex items-center gap-2 w-full">
                                        <span className="md:hidden text-slate-400 font-medium w-20">APIS:</span>
                                        <span className={`rounded-full px-5 py-1.5 text-[12px] font-bold ${requiresApis ? "border border-green-300 text-green-500 bg-green-50" : "border border-slate-300 text-slate-500 bg-slate-50"}`}>
                                            {requiresApis ? "Required" : "Not required"}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Bottom Footer */}
            <div className="w-full min-h-[88px] py-4 bg-white border-t border-slate-200 flex flex-col sm:flex-row gap-4 items-center justify-between px-4 sm:px-10 z-30 shrink-0 shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
                {step < 3 ? (
                    <>
                        <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 w-full sm:w-auto">
                            {step > 0 && (
                                <>
                                    <button className="w-full sm:w-auto flex items-center justify-center gap-2 text-[#D60D26] font-bold hover:bg-rose-50 px-4 py-2 rounded-lg transition-colors text-[15px]">
                                        <X className="w-4 h-4" /> Add flight series
                                    </button>
                                    <div className="hidden sm:block w-px h-6 bg-slate-300"></div>
                                    <button className="w-full sm:w-auto text-slate-500 font-bold hover:text-slate-700 underline underline-offset-4 text-[15px] decoration-2">
                                        How flight series work
                                    </button>
                                </>
                            )}
                        </div>
                        <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 w-full sm:w-auto mt-2 sm:mt-0">
                            {step >= 1 && !selectedReturnDate && (
                                <button
                                    onClick={() => setStep(2)}
                                    className="w-full sm:w-auto justify-center border border-[#D60D26] text-[#D60D26] hover:bg-rose-50 rounded-full px-4 sm:px-8 py-3.5 font-bold text-[14px] sm:text-[15px] flex items-center gap-2 transition-colors"
                                >
                                    <ArrowRightLeft className="w-4 h-4" /> Add return flight
                                </button>
                            )}
                            <button 
                                onClick={handleAddFlightDetails}
                                className={`w-full sm:w-auto justify-center rounded-full px-4 sm:px-10 py-3.5 font-bold text-[14px] sm:text-[15px] flex items-center gap-2 transition-colors ${
                                    step > 0 && selectedDate 
                                        ? 'bg-[#D60D26] hover:bg-[#30060F] text-white shadow-md cursor-pointer' 
                                        : 'bg-[#FFA8B3] text-white cursor-not-allowed'
                                }`}
                            >
                                Add Flights Details <ArrowRight className="w-5 h-5" />
                            </button>
                        </div>
                    </>
                ) : (
                    <>
                        <button onClick={() => setStep(step - 1)} className="w-full sm:w-auto justify-center border border-slate-300 text-slate-600 font-bold hover:bg-slate-50 px-4 sm:px-8 py-3.5 rounded-full transition-colors text-[14px] sm:text-[15px]">
                            Change The Route
                        </button>
                        {step === 3 ? (
                            <button 
                                onClick={() => { if (hasScheduledFlight) setStep(4); }}
                                className={`w-full sm:w-auto justify-center px-4 sm:px-10 py-3.5 rounded-full font-bold text-[14px] sm:text-[15px] transition-colors flex items-center gap-2 ${
                                    hasScheduledFlight ? 'bg-[#D60D26] text-white hover:bg-[#30060F] shadow-md' : 'bg-[#FFA8B3] text-white cursor-not-allowed'
                                }`}
                            >
                                Check And Confirm <ArrowRight className="w-5 h-5" />
                            </button>
                        ) : (
                            <button 
                                onClick={handleCreateFlights}
                                disabled={isSubmitting}
                                className={`w-full sm:w-auto justify-center bg-[#D60D26] text-white hover:bg-[#30060F] shadow-md px-10 py-3.5 rounded-full font-bold text-[15px] transition-colors flex items-center gap-2 ${
                                    isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
                                }`}
                            >
                                {isSubmitting ? "Creating..." : "Create Flights"} <ArrowRight className="w-4 h-4" />
                            </button>
                        )}
                    </>
                )}
            </div>
            
            {/* Click outside handler for dropdown */}
            {activeInput && (
                <div 
                    className="fixed inset-0 z-10 pointer-events-auto"
                    onClick={() => setActiveInput(null)}
                />
            )}

            {/* Modal for "Schedule A Flights" */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 pointer-events-auto animate-in fade-in duration-200 p-4">
                    <div className="bg-white rounded-3xl w-full max-w-[900px] max-h-[90vh] shadow-2xl overflow-hidden flex flex-col">
                        {/* Modal Header */}
                        <div className="bg-gradient-to-r from-[#D60D26] to-[#30060F] text-white p-6 relative shrink-0">
                            <button onClick={() => setIsModalOpen(false)} className="absolute top-6 right-6 hover:bg-white/20 p-1 rounded-full transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                            <div className="font-bold text-[16px] mb-1">New flights</div>
                            <div className="font-extrabold text-[18px] flex items-center gap-2">
                                {origin?.city || "New Delhi"} ({origin?.code || "DEL"}) 
                                <div className="w-5 h-5 rounded-full border border-white flex items-center justify-center mx-1">
                                    <ArrowRight className="w-3 h-3 text-white" />
                                </div> 
                                {destination?.city || "Destination"} ({destination?.code || "---"})
                            </div>
                        </div>

                        {/* Modal Tabs */}
                        <div className="flex items-center justify-start sm:justify-center gap-8 sm:gap-12 border-b border-slate-100 font-bold text-[14px] pt-4 shrink-0 bg-white z-10 overflow-x-auto whitespace-nowrap px-6">
                            {[1, 2, 3, 4, 5].map((tab) => (
                                <button 
                                    key={tab}
                                    onClick={() => setModalTab(tab)}
                                    className={`pb-4 px-2 transition-colors ${modalTab === tab ? "text-[#D60D26] border-b-2 border-[#D60D26]" : "text-slate-400 hover:text-slate-600"}`}
                                >
                                    {tab}. {["Flight detail", "Baggages", "Seats", "Dates", "Policies"][tab - 1]}
</button>
                            ))}
                        </div>

                        {/* Modal Body */}
                        <div className="flex-1 overflow-y-auto overflow-x-hidden bg-white p-8">
                            {modalTab === 1 && (
                                <div className="flex gap-6 overflow-x-auto pb-4 items-start w-full min-w-0 custom-horizontal-scrollbar">
                                    {segments.map((seg, index) => {
                                        const nextDayNeeded = (from: string, to: string) => {
                                            if (!from || !to) return false;
                                            const [fH, fM] = from.split(':').map(Number);
                                            const [tH, tM] = to.split(':').map(Number);
                                            if (tH < fH) return true;
                                            if (tH === fH && tM < fM) return true;
                                            return false;
                                        };
                                        const getSegDuration = (from: string, to: string, p1: boolean) => {
                                            if (!from || !to) return "2h 0m";
                                            const [fH, fM] = from.split(':').map(Number);
                                            const [tH, tM] = to.split(':').map(Number);
                                            let diff = (tH * 60 + tM) - (fH * 60 + fM);
                                            if (p1) diff += 24 * 60;
                                            else if (diff < 0) diff += 24 * 60;
                                            return `${Math.floor(diff / 60)}h ${diff % 60}m`;
                                        };
                                        const requiresNextDay = nextDayNeeded(seg.fromTime, seg.toTime);
                                        const isConfirmable = !requiresNextDay || seg.plusOneDay;
                                        const calculatedDuration = getSegDuration(seg.fromTime, seg.toTime, !!seg.plusOneDay);

                                        if (seg.isEditing) {
                                            return (
                                                /* ══ EDITING: open form, no card border, takes remaining width ══ */
                                                <div key={seg.id} className="flex-1 min-w-[480px] animate-in fade-in duration-300">
                                                    {/* Timeline */}
                                                    <div className="flex items-center relative mb-8">
                                                        <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 border-t-2 border-dashed border-slate-300 z-0"></div>
                                                        <div className="w-4 h-4 rounded-full border-[3px] border-slate-800 bg-white relative z-10 shrink-0"></div>
                                                        <div className="flex-1"></div>
                                                        <Plane className="w-5 h-5 text-slate-400 relative z-10 bg-white shrink-0" />
                                                        <div className="flex-1"></div>
                                                        {segments.length === 1 && (
                                                            <button className="relative z-10 flex flex-col items-center cursor-pointer group mx-2" onClick={handleAddStopover}>
                                                                <div className="w-7 h-7 bg-white border-2 border-[#D60D26] text-[#D60D26] rounded-full flex items-center justify-center text-xl leading-none font-bold shadow-sm group-hover:bg-rose-50">+</div>
                                                                <span className="text-[#D60D26] font-bold text-[11px] mt-1 whitespace-nowrap underline underline-offset-2">Add a stop over</span>
                                                            </button>
                                                        )}
                                                        <div className="flex-1"></div>
                                                        <Plane className="w-5 h-5 text-slate-400 relative z-10 bg-white shrink-0" />
                                                        <div className="flex-1"></div>
                                                        <div className="relative z-10 flex items-center justify-center w-5 h-5 bg-white border-2 border-slate-800 rounded-full shrink-0">
                                                            <svg className="w-2.5 h-2.5 text-slate-800" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                                                        </div>
                                                    </div>

                                                    {/* Two-column form */}
                                                    <div className="flex gap-8">
                                                        {/* LEFT: departure */}
                                                        <div className="flex-1 space-y-5">
                                                            <div className="flex gap-3">
                                                                <div className="w-[130px] shrink-0">
                                                                    <label className="text-[12px] font-bold text-slate-500 mb-1.5 block">{seg.fromCode} local time</label>
                                                                    <div className="border border-slate-200 rounded-xl px-3 py-2.5 flex items-center gap-2 shadow-sm">
                                                                        <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                                                                        <input type="text" className="w-full font-bold text-slate-700 outline-none bg-transparent text-[14px]" value={seg.fromTime} onChange={(e) => updateSegment(seg.id, 'fromTime', e.target.value)} />
                                                                    </div>
                                                                </div>
                                                                <div className="flex-1">
                                                                    <label className="text-[12px] font-bold text-slate-500 mb-1.5 block">Airport</label>
                                                                    <input type="text" className="w-full border border-slate-200 rounded-xl px-3 py-2.5 bg-slate-50 font-semibold text-slate-500 outline-none shadow-sm text-[14px]" value={`${seg.fromCode} (${seg.fromCity})`} readOnly />
                                                                </div>
                                                            </div>
                                                            <div className="flex gap-3">
                                                                <div className="flex-[2]">
                                                                    <label className="text-[12px] font-bold text-slate-500 mb-1.5 block">Airline</label>
                                                                    <input type="text" className="w-full border border-slate-200 rounded-xl px-3 py-2.5 font-semibold text-slate-700 outline-none shadow-sm text-[14px]" value={seg.airlineName || ""} onChange={(e) => updateSegment(seg.id, 'airlineName', e.target.value)} placeholder="Airline" />
                                                                </div>
                                                                <div className="flex-1">
                                                                    <label className="text-[12px] font-bold text-slate-500 mb-1.5 block">Flight code</label>
                                                                    <input type="text" className="w-full border border-slate-200 rounded-xl px-3 py-2.5 font-bold text-slate-700 outline-none shadow-sm text-[14px] uppercase" value={seg.airlineCode || ""} onChange={(e) => updateSegment(seg.id, 'airlineCode', e.target.value.toUpperCase())} placeholder="e.g. 6E" />
                                                                </div>
                                                            </div>
                                                            <div className="text-[12px] font-bold text-slate-400 mt-0.5 cursor-pointer hover:text-slate-600">+ add technical stop</div>
                                                            <div className="flex gap-3">
                                                                <div className="flex-1">
                                                                    <label className="text-[12px] font-bold text-slate-500 mb-1.5 block">Flight number</label>
                                                                    <input type="text" className="w-full border border-slate-200 rounded-xl px-3 py-2.5 font-bold text-slate-700 outline-none shadow-sm text-[14px] uppercase" value={seg.flightNumber || ""} onChange={(e) => updateSegment(seg.id, 'flightNumber', e.target.value.toUpperCase())} placeholder="– – – –" />
                                                                </div>
                                                                <div className="flex-1">
                                                                    <label className="text-[12px] font-bold text-slate-500 mb-1.5 block">Terminal</label>
                                                                    <select className="w-full border border-slate-200 rounded-xl px-3 py-2.5 font-semibold text-slate-700 appearance-none bg-white outline-none shadow-sm text-[14px]" value={seg.fromTerminal} onChange={(e) => updateSegment(seg.id, 'fromTerminal', e.target.value)}>
                                                                        {TERMINAL_OPTIONS.map((terminal) => (
                                                                            <option key={terminal}>{terminal}</option>
                                                                        ))}
                                                                    </select>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* RIGHT: arrival */}
                                                        <div className="flex-1 space-y-5">
                                                            <div className="flex gap-3">
                                                                <div className="flex-1">
                                                                    <label className="text-[12px] font-bold text-slate-500 mb-1.5 block">Airport</label>
                                                                    <input type="text" className="w-full border border-slate-200 rounded-xl px-3 py-2.5 bg-slate-50 font-semibold text-slate-500 outline-none shadow-sm text-[14px]" value={`${seg.toCode} (${seg.toCity})`} readOnly />
                                                                </div>
                                                                <div className="w-[130px] shrink-0">
                                                                    <label className="text-[12px] font-bold text-slate-500 mb-1.5 block">{seg.toCode} local time</label>
                                                                    <div className="border border-slate-200 rounded-xl px-3 py-2.5 flex items-center gap-2 shadow-sm">
                                                                        <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                                                                        <input type="text" className="w-full font-bold text-slate-700 outline-none bg-transparent text-[14px]" value={seg.toTime} onChange={(e) => updateSegment(seg.id, 'toTime', e.target.value)} />
                                                                    </div>
                                                                    <label className="flex items-center gap-2 mt-2 cursor-pointer">
                                                                        <input type="checkbox" checked={!!seg.plusOneDay} onChange={(e) => updateSegment(seg.id, 'plusOneDay', e.target.checked)} className="w-4 h-4 rounded border-slate-300 accent-[#D60D26] cursor-pointer" />
                                                                        <span className="text-[12px] font-bold text-slate-600">+1 day</span>
                                                                    </label>
                                                                </div>
                                                            </div>
                                                            <div>
                                                                <label className="text-[12px] font-bold text-slate-500 mb-1.5 block">Terminal</label>
                                                                <select className="w-full border border-slate-200 rounded-xl px-3 py-2.5 font-semibold text-slate-700 appearance-none bg-white outline-none shadow-sm text-[14px]" value={seg.toTerminal} onChange={(e) => updateSegment(seg.id, 'toTerminal', e.target.value)}>
                                                                    {TERMINAL_OPTIONS.map((terminal) => (
                                                                        <option key={terminal}>{terminal}</option>
                                                                    ))}
                                                                </select>
                                                            </div>
                                                            <div>
                                                                {isConfirmable ? (
                                                                    <div className="space-y-2">
                                                                        <div className="text-[12px] font-bold text-blue-500 flex items-center gap-1.5">
                                                                            <Clock className="w-3.5 h-3.5" /> Calculated flight duration : <span className="text-blue-600">{calculatedDuration}</span>
                                                                        </div>
                                                                        <button onClick={() => setSegments(segments.map(s => s.id === seg.id ? { ...s, isEditing: false, duration: calculatedDuration } : s))} className="w-full bg-green-50 text-green-600 border border-green-100 font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 text-[14px] hover:bg-green-100 transition-colors">
                                                                            <Check className="w-4 h-4" /> Confirm segment
                                                                        </button>
                                                                    </div>
                                                                ) : (
                                                                    <div className="space-y-2">
                                                                        <div className="text-[12px] font-bold text-amber-500">It seems that the arrival is the day after. Just click on <span className="underline cursor-pointer" onClick={() => updateSegment(seg.id, 'plusOneDay', true)}>+1 day to correct it</span></div>
                                                                        <button className="w-full bg-slate-100 text-slate-400 font-bold py-3.5 rounded-xl text-[14px] cursor-not-allowed">Confirm segment</button>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        }

                                        /* ══ CONFIRMED: portrait card, fixed 420px ══ */
                                        return (
                                            <div key={seg.id} className="w-[420px] shrink-0 flex flex-col animate-in fade-in duration-300">
                                                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                                                    {/* Timeline bar */}
                                                    <div className="flex items-center px-5 pt-5 pb-2 relative">
                                                        <div className="absolute left-5 right-5 top-[calc(1.25rem+10px)] border-t-2 border-dashed border-slate-300 z-0"></div>
                                                        <div className="w-4 h-4 rounded-full border-[3px] border-slate-800 bg-white relative z-10 shrink-0"></div>
                                                        <div className="flex-1"></div>
                                                        <Plane className="w-5 h-5 text-slate-400 relative z-10 bg-white shrink-0" />
                                                        <div className="flex-1"></div>
                                                        {index === segments.length - 1 ? (
                                                            <div className="relative z-10 flex items-center justify-center w-5 h-5 bg-white border-2 border-slate-800 rounded-full shrink-0">
                                                                <svg className="w-2.5 h-2.5 text-slate-800" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                                                            </div>
                                                        ) : (
                                                            <div className="w-4 h-4 rounded-full bg-slate-800 relative z-10 shrink-0"></div>
                                                        )}
                                                    </div>

                                                    {/* Card body */}
                                                    <div className="px-5 pb-3">
                                                        <div className="flex justify-between items-start">
                                                            <div>
                                                                <div className="font-bold text-slate-800 text-[14px]">{seg.fromCity}, {seg.fromCode}</div>
                                                                <div className="text-[12px] text-slate-400 mb-2">{seg.fromTerminal}</div>
                                                                <div className="border border-slate-200 rounded-lg px-2.5 py-1 text-[13px] font-bold text-slate-700 inline-block">{seg.fromTime}</div>
                                                            </div>
                                                            <div className="flex flex-col items-center px-2 mt-1">
                                                                <div className="w-9 h-9 bg-[#D60D26] rounded-xl mb-1 flex items-center justify-center shrink-0">
                                                                    <Plane className="w-5 h-5 text-white" />
                                                                </div>
                                                                <div className="text-[11px] text-slate-600 font-bold text-center">{seg.airlineName || "–"} ({seg.airlineCode} {seg.flightNumber})</div>
                                                                <div className="text-[12px] text-blue-500 font-bold mt-0.5 flex items-center gap-1"><Clock className="w-3 h-3" />{seg.duration}</div>
                                                            </div>
                                                            <div className="text-right">
                                                                <div className="font-bold text-slate-800 text-[14px]">{seg.toCity}, {seg.toCode}</div>
                                                                <div className="text-[12px] text-slate-400 mb-2">{seg.toTerminal}</div>
                                                                <div className="border border-slate-200 rounded-lg px-2.5 py-1 text-[13px] font-bold text-slate-700 inline-block">{seg.toTime}{seg.plusOneDay && <span className="text-[#D60D26] ml-1 text-[11px]">+1</span>}</div>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <button onClick={() => updateSegment(seg.id, 'isEditing', true)} className="w-full bg-slate-50 text-slate-500 text-[13px] font-bold py-3 border-t border-slate-200 hover:bg-slate-100 transition-colors">
                                                        Edit segment
                                                    </button>
                                                </div>

                                                {/* Below-card badges */}
                                                {index < segments.length - 1 && (
                                                    <div className="mt-2 bg-rose-50 border border-rose-100 rounded-xl px-4 py-2.5 flex justify-between items-center">
                                                        <div className="text-[12px] font-bold text-slate-700 flex items-center gap-1.5"><Clock className="w-4 h-4" /> Layover 02 h 15 min</div>
                                                        <button onClick={handleDeleteStop} className="text-[12px] font-bold text-slate-500 flex items-center gap-1 hover:text-[#D60D26] transition-colors"><Trash2 className="w-3.5 h-3.5" /> Delete stop</button>
                                                    </div>
                                                )}
                                                {index === segments.length - 1 && segments.length > 1 && (
                                                    <div className="mt-2 bg-rose-50 border border-rose-100 rounded-xl px-4 py-2.5">
                                                        <div className="text-[12px] font-bold text-slate-700 flex items-center gap-1.5"><Clock className="w-4 h-4" /> Total journey destination {calculatedDuration}</div>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            {modalTab === 2 && (
                                <div className="flex items-center justify-center py-10 animate-in fade-in duration-300">
                                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm w-full max-w-[500px] overflow-hidden">
                                        <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 font-bold text-slate-700 text-[15px]">
                                            Checked Baggage
                                        </div>
                                        <div className="p-6">
                                            <div className="flex flex-col sm:flex-row gap-4 mb-5">
                                                <div className="flex-1">
                                                    <label className="text-[12px] font-bold text-slate-500 mb-1.5 block">Maximum weight (Kg)</label>
                                                    <select 
                                                        value={maxWeight}
                                                        onChange={(e) => setMaxWeight(e.target.value)}
                                                        className="w-full border border-slate-200 rounded-lg p-3.5 text-slate-700 font-medium outline-none bg-white shadow-sm"
                                                    >
                                                        <option>Weight</option>
                                                        <option>15 kg</option>
                                                        <option>20 kg</option>
                                                        <option>25 kg</option>
                                                    </select>
                                                </div>
                                                <div className="flex-1">
                                                    <label className="text-[12px] font-bold text-slate-500 mb-1.5 block">Price (INR)</label>
                                                    <div className="relative">
                                                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-medium">Rs</span>
                                                        <input 
                                                            type="text" 
                                                            placeholder="00.00"
                                                            value={baggagePrice}
                                                            onChange={(e) => setBaggagePrice(e.target.value)}
                                                            disabled={isFreeBaggage}
                                                            className={`w-full border border-slate-200 rounded-lg p-3.5 pl-8 text-slate-700 font-medium outline-none shadow-sm ${isFreeBaggage ? "bg-slate-100 cursor-not-allowed" : ""}`}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                            <label className="flex items-center gap-2.5 cursor-pointer">
                                                <input 
                                                    type="checkbox" 
                                                    checked={isFreeBaggage}
                                                    onChange={(e) => setIsFreeBaggage(e.target.checked)}
                                                    className="w-5 h-5 rounded border-slate-300 text-[#D60D26] focus:ring-[#D60D26] cursor-pointer"
                                                />
                                                <span className="text-[14px] font-bold text-slate-600 select-none">Free checked baggage</span>
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {modalTab === 3 && (
                                <div className="flex items-center justify-center py-10 animate-in fade-in duration-300">
                                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm w-full max-w-[500px] overflow-hidden">
                                        <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 font-bold text-slate-700 text-[15px]">
                                            Seats and price
                                        </div>
                                        <div className="p-6">
                                            <div className="text-blue-600 font-bold text-[13px] mb-6 leading-relaxed">
                                                By default for all flights - can be changed flights per flights after
                                            </div>
                                            <div className="flex flex-col sm:flex-row gap-4">
                                                <div className="flex-1">
                                                    <label className="text-[12px] font-bold text-slate-500 mb-1.5 block">Available seats</label>
                                                    <div className="relative">
                                                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                                                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M4 18v3h2v-3h12v3h2v-3H4zm2-10h12v6H6V8zm0-4h12v2H6V4z"/></svg>
                                                        </span>
                                                        <input 
                                                            type="text" 
                                                            placeholder="00"
                                                            value={availableSeats}
                                                            onChange={(e) => setAvailableSeats(e.target.value)}
                                                            className="w-full border border-slate-200 rounded-lg p-3.5 pl-11 text-slate-700 font-medium outline-none shadow-sm"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="flex-1">
                                                    <label className="text-[12px] font-bold text-slate-500 mb-1.5 block">Ticket Price (INR)</label>
                                                    <div className="relative">
                                                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-medium">Rs</span>
                                                        <input 
                                                            type="text" 
                                                            placeholder="00.00"
                                                            value={seatPrice}
                                                            onChange={(e) => setSeatPrice(e.target.value)}
                                                            className="w-full border border-slate-200 rounded-lg p-3.5 pl-8 text-slate-700 font-medium outline-none shadow-sm"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                            <label className="mt-5 flex items-center gap-2.5 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={isRefundable}
                                                    onChange={(e) => setIsRefundable(e.target.checked)}
                                                    className="h-5 w-5 rounded border-slate-300 accent-[#D60D26] cursor-pointer"
                                                />
                                                <span className="text-[14px] font-bold text-slate-600 select-none">Fare is refundable</span>
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {modalTab === 4 && (
                                <div className="flex items-center justify-center py-10 animate-in fade-in duration-300">
                                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm w-full max-w-[500px] overflow-hidden">
                                        <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 font-bold text-slate-700 text-[15px]">
                                            Operating dates
                                        </div>
                                        <div className="flex flex-col">
                                            {Object.keys(operatingDateGroups).length === 0 ? (
                                                <div className="p-6 text-sm font-medium text-slate-500">
                                                    Pick a departure date first to generate operating dates.
                                                </div>
                                            ) : (
                                                Object.entries(operatingDateGroups).map(([monthLabel, dates]) => (
                                                    <div key={monthLabel}>
                                                        <div className="bg-[#F2FBFF] px-6 py-2.5 text-[13px] font-bold text-slate-600">{monthLabel}</div>
                                                        <div className="p-6 flex flex-wrap gap-4">
                                                            {dates.map((dateStr) => {
                                                                const isChecked = selectedOperatingDates.includes(dateStr);
                                                                return (
                                                                    <div
                                                                        key={dateStr}
                                                                        onClick={() => toggleOperatingDate(dateStr)}
                                                                        className="bg-rose-50 rounded-lg p-3 flex flex-col items-center gap-2.5 cursor-pointer border border-rose-100 w-20 hover:bg-rose-100 transition-colors"
                                                                    >
                                                                        <span className="text-[12px] font-bold text-slate-800">
                                                                            {formatDateLabel(dateStr, { weekday: "short", day: "numeric" })}
                                                                        </span>
                                                                        <div className={`w-[22px] h-[22px] rounded shadow-sm flex items-center justify-center ${isChecked ? "bg-[#D60D26]" : "border border-slate-300 bg-white"}`}>
                                                                            {isChecked && <Check className="w-3.5 h-3.5 text-white" />}
                                                                        </div>
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {modalTab === 5 && (
                                <div className="flex items-center justify-center py-10 animate-in fade-in duration-300">
                                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm w-full max-w-[550px] overflow-hidden">
                                        <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 font-bold text-slate-700 text-[15px]">
                                            Policies / Terms & Conditions
                                        </div>
                                        <div className="p-6 flex flex-col gap-4">
                                            {POLICY_FIELDS.map((policy) => {
                                                const hasValue = Boolean(policyTexts[policy.key].trim());
                                                const isOpen = openPolicies.includes(policy.key);

                                                return (
                                                    <div key={policy.key} className="border-l-4 border-slate-800 bg-slate-50 p-4 rounded-r-lg shadow-sm">
                                                        <div className="flex items-center justify-between gap-4">
                                                            <div className="font-bold text-[14px] text-slate-700">
                                                                {policy.label}
                                                            </div>
                                                            <button
                                                                type="button"
                                                                onClick={() => togglePolicyEditor(policy.key)}
                                                                className="text-[#D60D26] font-bold text-[13px] flex items-center gap-1 hover:text-[#30060F]"
                                                            >
                                                                <div className="w-4 h-4 bg-[#D60D26] text-white rounded-full flex items-center justify-center text-[16px] leading-none pb-0.5">
                                                                    {isOpen ? "-" : "+"}
                                                                </div>
                                                                {hasValue ? (isOpen ? "Hide" : "Edit") : "Add"}
                                                            </button>
                                                        </div>
                                                        {isOpen && (
                                                            <textarea
                                                                value={policyTexts[policy.key]}
                                                                onChange={(e) => setPolicyTexts((currentPolicies) => ({
                                                                    ...currentPolicies,
                                                                    [policy.key]: e.target.value,
                                                                }))}
                                                                placeholder={policy.placeholder}
                                                                className="mt-3 min-h-[96px] w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none shadow-sm"
                                                            />
                                                        )}
                                                        {hasValue && !isOpen && (
                                                            <p className="mt-3 text-sm text-slate-600 leading-relaxed">
                                                                {policyTexts[policy.key]}
                                                            </p>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="p-4 sm:p-6 bg-slate-50 border-t border-slate-100 flex flex-row items-center justify-between gap-3 sm:gap-4 shrink-0">
                            <button 
                                onClick={() => setModalTab(Math.max(1, modalTab - 1))}
                                disabled={modalTab === 1}
                                className={`flex-1 w-full border-2 font-bold py-3.5 sm:py-4 text-[14px] sm:text-[16px] rounded-xl transition-colors ${modalTab === 1 ? 'border-slate-100 text-slate-300 cursor-not-allowed' : 'border-slate-200 text-slate-500 hover:bg-slate-200 hover:text-slate-800 shadow-sm'}`}
                            >
                                Back Step
                            </button>
                            <button 
                                onClick={() => {
                                    if (modalTab < 5) {
                                        setModalTab(modalTab + 1);
                                    } else if (!hasUnconfirmedSegments) {
                                        setIsConfirmModalOpen(true);
                                    }
                                }}
                                disabled={modalTab === 5 && hasUnconfirmedSegments}
                                className={`flex-1 w-full text-white font-bold py-3.5 sm:py-4 text-[14px] sm:text-[16px] rounded-xl transition-colors flex items-center justify-center gap-1 sm:gap-2 shadow-md ${
                                    modalTab === 5 && hasUnconfirmedSegments
                                        ? "bg-[#FFA8B3] cursor-not-allowed"
                                        : "bg-[#D60D26] hover:bg-[#30060F]"
                                }`}
                            >
                                {modalTab === 5 ? "Finish" : "Next Step"} {modalTab < 5 && <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />}
                            </button>
                        </div>
                        {hasUnconfirmedSegments && (
                            <div className="px-6 pb-5 text-sm font-medium text-amber-600 bg-slate-50">
                                Confirm the segment in 1. Flight detail before finishing this flight.
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Confirm APIS Modal */}
            {isConfirmModalOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm pointer-events-auto animate-in fade-in duration-200 p-4">
                    <div className="bg-white rounded-2xl w-full max-w-[600px] shadow-2xl overflow-hidden flex flex-col">
                        <div className="bg-slate-50 border-b border-slate-100 p-5 font-bold text-[16px] text-slate-700">
                            Confirm this flight
                        </div>
                        <div className="p-8 pb-12 flex items-start gap-4">
                            <label className="flex items-start gap-4 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={requiresApis}
                                    onChange={(e) => setRequiresApis(e.target.checked)}
                                    className="mt-1 h-5 w-5 rounded border-slate-300 accent-[#D60D26] cursor-pointer"
                                />
                                <div>
                                    <div className="font-bold text-[16px] text-slate-800 mb-1.5">Flight requires APIS</div>
                                    <div className="text-[14px] text-slate-500 font-medium">
                                        Turn this on only if the passenger must provide passport-face information.
                                    </div>
                                </div>
                            </label>
                        </div>
                        <div className="p-6 border-t border-slate-100 flex items-center justify-between gap-4 bg-slate-50/50">
                            <button 
                                onClick={() => setIsConfirmModalOpen(false)} 
                                className="flex-1 border-2 border-slate-200 text-slate-600 font-bold py-3.5 rounded-xl hover:bg-slate-100 transition-colors"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={() => {
                                    setIsConfirmModalOpen(false);
                                    setIsModalOpen(false);
                                    setHasScheduledFlight(true);
                                }} 
                                className="flex-1 bg-[#D60D26] text-white font-bold py-3.5 rounded-xl hover:bg-[#30060F] transition-colors flex items-center justify-center gap-2 shadow-sm"
                            >
                                Confirm Flight <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
