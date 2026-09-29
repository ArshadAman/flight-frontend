"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, ArrowRightLeft, X, Plane, ChevronLeft, ChevronRight, Check, Clock, Trash2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { getPublicApiUrl } from "@/lib/apiConfig";
import { RouteMapBackground } from "@/components/sale/RouteMapBackground";
import { formatDurationMinutes } from "@/lib/journey";
import { salesClosingFromEnding } from "@/lib/sale/offlinePortal";

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
    /** Optional technical stop airport (Figma: + add technical stop) */
    technicalStop?: string | null;
    aircraftType?: string;
};

type PolicyKey = "cancellation" | "change" | "refund";

const POLICY_FIELDS: { key: PolicyKey; label: string; placeholder: string }[] = [
    { key: "cancellation", label: "Cancellation policy", placeholder: "Add cancellation policy details..." },
    { key: "change", label: "Change policy", placeholder: "Add change policy details..." },
    { key: "refund", label: "Refund policy", placeholder: "Add refund policy details..." },
];

/** Derive IATA-style code from flight number when Flight code field is not shown (e.g. AI-121 → AI). */
function airlineCodeFromFlightNumber(flightNumber: string) {
    const match = flightNumber.trim().toUpperCase().match(/^([A-Z0-9]{2})/);
    return match?.[1] || "";
}

/** Figma: "AI 121(+1)" — space between carrier + number, (+1) on overnight legs. */
function formatFlightNumberLabel(seg: Segment): string {
    const raw = (seg.flightNumber || "").trim().toUpperCase().replace(/[-_]/g, " ").replace(/\s+/g, " ");
    const spaced =
        raw.replace(/^([A-Z0-9]{2})\s*(\d.*)$/, "$1 $2").trim() || "—";
    return seg.plusOneDay ? `${spaced}(+1)` : spaced;
}

function formatScheduledFlightNumbers(segs: Segment[]): string {
    return segs.map(formatFlightNumberLabel).join(" / ");
}

function formatScheduledAirline(segs: Segment[]): string {
    const names = segs
        .map(
            (s) =>
                (s.airlineName || s.airlineCode || airlineCodeFromFlightNumber(s.flightNumber) || "").trim()
        )
        .filter(Boolean);
    const unique = [...new Set(names.map((n) => n.toUpperCase()))];
    return unique.join(" / ") || "—";
}

/** Figma: "23:00-03:00 / 05:00-11:00" */
function formatScheduledTimes(segs: Segment[]): string {
    return segs
        .map((s) => `${s.fromTime || "--:--"}-${s.toTime || "--:--"}`)
        .join(" / ");
}

type ApiSegmentPayload = {
    segment_id: number;
    airline_code: string;
    airline_name: string;
    flight_number: string;
    aircraft_type: string;
    origin: string;
    origin_city: string;
    origin_terminal: string;
    destination: string;
    destination_city: string;
    destination_terminal: string;
    departure_datetime: string;
    arrival_datetime: string;
    duration: string;
    stop_over: string | null;
    technical_stop: string | null;
    return_flight: boolean;
};

/** Build API segment list for one operating date from UI segments. */
function buildApiSegmentsForDate(
    segs: Segment[],
    dateStr: string,
    returnFlight: boolean
): ApiSegmentPayload[] {
    const [year, month, day] = dateStr.split("-").map(Number);
    const depTimeStr = segs[0]?.fromTime || "23:00";
    const [depHour, depMin] = depTimeStr.split(":").map(Number);
    const localDepDate = new Date(year, month - 1, day, depHour, depMin);
    const apiSegments: ApiSegmentPayload[] = [];
    let currentDepDate = new Date(localDepDate);

    for (let i = 0; i < segs.length; i++) {
        const seg = segs[i];
        const [sDepH, sDepM] = (seg.fromTime || "00:00").split(":").map(Number);

        if (i > 0) {
            const prevArrDate = new Date(apiSegments[i - 1].arrival_datetime);
            currentDepDate = new Date(prevArrDate);
            currentDepDate.setHours(sDepH, sDepM, 0, 0);
            if (currentDepDate < prevArrDate) {
                currentDepDate.setDate(currentDepDate.getDate() + 1);
            }
        } else {
            currentDepDate.setHours(sDepH, sDepM, 0, 0);
        }

        const [sArrH, sArrM] = (seg.toTime || "00:00").split(":").map(Number);
        const currentArrDate = new Date(currentDepDate);
        currentArrDate.setHours(sArrH, sArrM, 0, 0);
        if (seg.plusOneDay) {
            currentArrDate.setDate(currentArrDate.getDate() + 1);
        } else if (currentArrDate < currentDepDate) {
            currentArrDate.setDate(currentArrDate.getDate() + 1);
        }

        apiSegments.push({
            segment_id: i,
            airline_code: (
                seg.airlineCode || airlineCodeFromFlightNumber(seg.flightNumber || "")
            )
                .toUpperCase()
                .trim(),
            airline_name: (seg.airlineName || "").trim(),
            flight_number: (seg.flightNumber || "").toUpperCase().trim(),
            aircraft_type: (seg.aircraftType || "Airbus A320").trim(),
            origin: seg.fromCode,
            origin_city: seg.fromCity,
            origin_terminal: seg.fromTerminal,
            destination: seg.toCode,
            destination_city: seg.toCity,
            destination_terminal: seg.toTerminal,
            departure_datetime: currentDepDate.toISOString(),
            arrival_datetime: currentArrDate.toISOString(),
            duration: seg.duration,
            stop_over: null,
            technical_stop: seg.technicalStop?.trim()
                ? seg.technicalStop.trim().toUpperCase()
                : null,
            return_flight: returnFlight,
        });
    }

    for (let i = 0; i < apiSegments.length - 1; i++) {
        const arriveMs = new Date(apiSegments[i].arrival_datetime).getTime();
        const departMs = new Date(apiSegments[i + 1].departure_datetime).getTime();
        const gapMin = Math.round((departMs - arriveMs) / 60000);
        apiSegments[i].stop_over = formatDurationMinutes(gapMin) || null;
    }

    return apiSegments;
}

function validateSegmentsForCreate(segs: Segment[], legLabel: string): string | null {
    if (!segs.length) return `Please schedule the ${legLabel} flight first.`;
    for (let i = 0; i < segs.length; i++) {
        const seg = segs[i];
        if (!seg.fromCode?.trim() || !seg.toCode?.trim()) {
            return `${legLabel} segment ${i + 1} is missing airports.`;
        }
        if (!seg.airlineName?.trim() && !airlineCodeFromFlightNumber(seg.flightNumber || "")) {
            return `Please enter the airline name for ${legLabel} segment ${i + 1}.`;
        }
        if (!seg.flightNumber?.trim()) {
            return `Please enter the flight number for ${legLabel} segment ${i + 1}.`;
        }
    }
    return null;
}

function minutesFromClock(time: string): number {
    const [hours, minutes] = String(time || "00:00").split(":").map(Number);
    return (hours || 0) * 60 + (minutes || 0);
}

function layoverBetween(current: Segment, next: Segment): string {
    let arrival = minutesFromClock(current.toTime);
    let departure = minutesFromClock(next.fromTime);
    if (current.plusOneDay) arrival += 24 * 60;
    if (departure < arrival) departure += 24 * 60;
    return formatDurationMinutes(departure - arrival) || "—";
}

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

/** All dates between start and end (inclusive) that fall on selected weekdays (0=Sun … 6=Sat). */
function getSeriesOperatingDates(
    startIso: string,
    endIso: string,
    weekdays: number[] = []
) {
    const startDate = new Date(`${startIso}T00:00:00`);
    const endDate = new Date(`${endIso}T00:00:00`);
    if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) return [];
    if (endDate < startDate) return [startIso];

    const allowed =
        weekdays.length > 0 ? new Set(weekdays) : new Set([startDate.getDay()]);
    const dates: string[] = [];
    const cursor = new Date(startDate);
    while (cursor <= endDate) {
        if (allowed.has(cursor.getDay())) {
            const y = cursor.getFullYear();
            const m = String(cursor.getMonth() + 1).padStart(2, "0");
            const d = String(cursor.getDate()).padStart(2, "0");
            dates.push(`${y}-${m}-${d}`);
        }
        cursor.setDate(cursor.getDate() + 1);
    }
    return dates;
}

const SERIES_WEEKDAY_OPTIONS: { label: string; day: number }[] = [
    { label: "Sun", day: 0 },
    { label: "Mon", day: 1 },
    { label: "Tue", day: 2 },
    { label: "Wed", day: 3 },
    { label: "Thu", day: 4 },
    { label: "Fri", day: 5 },
    { label: "Sat", day: 6 },
];

export default function AddPNRPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    /** GPNR only for Add PNR flow — not for Add / New Flight. */
    const isPnrMode = searchParams.get("mode") === "pnr";
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
    const [seriesMode, setSeriesMode] = useState(false);
    /** Weekdays included in a flight series (0=Sun … 6=Sat). */
    const [seriesWeekdays, setSeriesWeekdays] = useState<number[]>([]);
    /** Round-trip: show second calendar + schedule return leg. Independent of series. */
    const [returnMode, setReturnMode] = useState(false);
    /** Which leg is focused on the Route step when return is enabled. */
    const [routeLeg, setRouteLeg] = useState<"outbound" | "return">("outbound");
    const [seriesInfoOpen, setSeriesInfoOpen] = useState(false);
    const [editingAirport, setEditingAirport] = useState<{
        segmentId: number;
        field: "from" | "to";
        query: string;
    } | null>(null);
    
    // Modal states
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [hasScheduledFlight, setHasScheduledFlight] = useState(false);
    const [hasScheduledReturnFlight, setHasScheduledReturnFlight] = useState(false);
    const [scheduledOutbound, setScheduledOutbound] = useState<Segment[] | null>(null);
    const [scheduledReturn, setScheduledReturn] = useState<Segment[] | null>(null);
    const [modalTab, setModalTab] = useState(1);
    const [schedulingLeg, setSchedulingLeg] = useState<"outbound" | "return">("outbound");
    const outboundSegmentsRef = useRef<Segment[] | null>(null);
    const returnSegmentsRef = useRef<Segment[] | null>(null);

    // Baggage State
    const [maxWeight, setMaxWeight] = useState("Weight");
    const [handBaggage, setHandBaggage] = useState("7 kg");
    const [baggagePrice, setBaggagePrice] = useState("");
    const [isFreeBaggage, setIsFreeBaggage] = useState(true);

    // Seats State
    const [availableSeats, setAvailableSeats] = useState("");
    const [seatPrice, setSeatPrice] = useState("");
    const [groupPnr, setGroupPnr] = useState("");
    const [isRefundable, setIsRefundable] = useState(true);
    const [cabinClass, setCabinClass] = useState("Economy");
    const [salesEndHours, setSalesEndHours] = useState("56");
    const [salesEndUnit, setSalesEndUnit] = useState<"hours" | "days">("hours");

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

    // Initialize / refresh segments when route airports change (not on every object identity change)
    useEffect(() => {
        if (!origin || !destination) return;
        setHasScheduledFlight(false);
        setHasScheduledReturnFlight(false);
        setScheduledOutbound(null);
        setScheduledReturn(null);
        outboundSegmentsRef.current = null;
        returnSegmentsRef.current = null;
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
                isEditing: true,
            },
        ]);
    }, [origin?.code, destination?.code]);

    useEffect(() => {
        if (!selectedDate) return;

        if (seriesMode && selectedReturnDate) {
            setSelectedOperatingDates(
                getSeriesOperatingDates(selectedDate, selectedReturnDate, seriesWeekdays)
            );
            return;
        }

        setSelectedOperatingDates((currentDates) => {
            if (currentDates.length > 0 && !seriesMode) return currentDates;
            return [selectedDate];
        });
    }, [selectedDate, selectedReturnDate, seriesMode, seriesWeekdays]);

    const showBothCalendars = seriesMode || returnMode;

    const seriesAvailableSet = useMemo(() => {
        if (!seriesMode) return new Set<string>();
        return new Set(selectedOperatingDates);
    }, [seriesMode, selectedOperatingDates]);

    const toggleSeriesWeekday = (day: number) => {
        setSeriesWeekdays((prev) => {
            const next = prev.includes(day)
                ? prev.filter((d) => d !== day)
                : [...prev, day].sort((a, b) => a - b);
            // Keep at least one weekday selected
            return next.length > 0 ? next : prev;
        });
    };

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

    const applyAirportToSegment = (airport: Airport) => {
        if (!editingAirport) return;
        const { segmentId, field } = editingAirport;
        setSegments((prev) => {
            const idx = prev.findIndex((s) => s.id === segmentId);
            return prev.map((seg, i) => {
                if (seg.id === segmentId) {
                    return field === "from"
                        ? { ...seg, fromCode: airport.code, fromCity: airport.city }
                        : { ...seg, toCode: airport.code, toCity: airport.city };
                }
                // Stopover Place on leg N becomes departure of leg N+1 (e.g. BOM → BOM)
                if (field === "to" && idx >= 0 && i === idx + 1) {
                    return { ...seg, fromCode: airport.code, fromCity: airport.city };
                }
                return seg;
            });
        });
        setEditingAirport(null);
    };

    const confirmSegment = (segmentId: number, duration: string) => {
        setSegments((prev) => {
            const idx = prev.findIndex((s) => s.id === segmentId);
            if (idx < 0) return prev;
            const confirmed = prev[idx];
            return prev.map((seg, i) => {
                if (i === idx) {
                    return { ...seg, isEditing: false, duration };
                }
                // Chain: next leg must depart from this leg's arrival (stopover)
                if (i === idx + 1 && confirmed.toCode) {
                    return {
                        ...seg,
                        fromCode: confirmed.toCode,
                        fromCity: confirmed.toCity,
                        isEditing: true,
                    };
                }
                return seg;
            });
        });
        setEditingAirport(null);
    };

    const handleAddFlightSeries = () => {
        if (!origin || !destination) {
            alert("Select origin and destination first.");
            return;
        }

        if (seriesMode) {
            setSeriesMode(false);
            setSeriesWeekdays([]);
            if (!returnMode) {
                setSelectedReturnDate(null);
                if (step === 2) setStep(1);
            }
            if (selectedDate) {
                setSelectedOperatingDates([selectedDate]);
            }
            return;
        }

        // One-way → series: reveal both FROM + TO calendars (Figma dual-calendar state)
        setSeriesMode(true);
        if (step < 1) setStep(1);
        else setStep(Math.max(step, 1));

        const seedWeekday = selectedDate
            ? new Date(`${selectedDate}T00:00:00`).getDay()
            : 0;
        setSeriesWeekdays([seedWeekday]);

        // Default TO month = month after FROM (or same month if FROM picked)
        if (selectedDate) {
            const [y, m] = selectedDate.split("-").map(Number);
            setReturnCalendarMonth(new Date(y, m - 1, 1));
        } else {
            setReturnCalendarMonth(
                new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 1)
            );
        }

        if (selectedDate && selectedReturnDate) {
            setSelectedOperatingDates(
                getSeriesOperatingDates(selectedDate, selectedReturnDate, [seedWeekday])
            );
        }
    };

    const handleAddReturnFlight = () => {
        if (!origin || !destination) {
            alert("Select origin and destination first.");
            return;
        }

        // Stay on Route step — show return leg UI here (Figma), not later on Flights
        setReturnMode(true);
        setRouteLeg("return");
        if (step < 1) setStep(1);
        else if (step >= 3) setStep(1);
        else setStep(1);

        setReturnCalendarMonth(
            selectedDate
                ? new Date(
                      Number(selectedDate.slice(0, 4)),
                      Number(selectedDate.slice(5, 7)) - 1,
                      1
                  )
                : new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 1)
        );
    };

    const handleAddStopover = () => {
        if (segments.length === 1 && origin && destination) {
            const first = segments[0];
            // First leg: origin → stopover Place (empty until user picks).
            // Second leg: stopover → final destination (locked).
            setSegments([
                {
                    id: 1,
                    fromCode: origin.code,
                    fromCity: origin.city,
                    fromTerminal: first.fromTerminal || "Terminal 3",
                    fromTime: first.fromTime || "23:00",
                    toCode: "",
                    toCity: "",
                    toTerminal: "Terminal 3",
                    toTime: "00:00",
                    airlineName: first.airlineName || "",
                    airlineCode: first.airlineCode || "",
                    flightNumber: first.flightNumber || "",
                    duration: "",
                    plusOneDay: false,
                    isEditing: true,
                },
                {
                    id: 2,
                    fromCode: "",
                    fromCity: "",
                    fromTerminal: "Terminal 3",
                    fromTime: "05:00",
                    toCode: destination.code,
                    toCity: destination.city,
                    toTerminal: "Terminal 3",
                    toTime: first.toTime || "11:00",
                    airlineName: "",
                    airlineCode: "",
                    flightNumber: "",
                    duration: "",
                    plusOneDay: false,
                    isEditing: false,
                },
            ]);
            setEditingAirport(null);
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

        const outboundSegs = scheduledOutbound || outboundSegmentsRef.current || segments;
        const outboundErr = validateSegmentsForCreate(outboundSegs, "outbound");
        if (outboundErr) {
            alert(outboundErr);
            return;
        }

        const returnSegs =
            returnMode
                ? scheduledReturn || returnSegmentsRef.current || null
                : null;

        if (returnMode) {
            if (!selectedReturnDate) {
                alert("Please select a return date.");
                return;
            }
            if (!hasScheduledReturnFlight || !returnSegs?.length) {
                alert("Please schedule the return flight first.");
                return;
            }
            const returnErr = validateSegmentsForCreate(returnSegs, "return");
            if (returnErr) {
                alert(returnErr);
                return;
            }
        }

        const filledPolicies = Object.fromEntries(
            Object.entries(policyTexts).filter(([, value]) => value.trim())
        );
        if (!isFreeBaggage && baggagePrice.trim()) {
            filledPolicies.baggage_price = baggagePrice.trim();
        }
        const checkInBaggage = maxWeight !== "Weight" ? maxWeight : "15 kg";
        const sharedFare = {
            price: parseFloat(seatPrice || "150"),
            seats_available: parseInt(availableSeats || "10", 10),
            cabin_class: cabinClass || "Economy",
            is_refundable: isRefundable,
            baggage_check_in: checkInBaggage,
            baggage_hand: handBaggage || "7 kg",
            apis_required: requiresApis,
            policies: filledPolicies,
            group_pnr: isPnrMode ? groupPnr.trim().toUpperCase() : "",
        };

        const apiBase = getPublicApiUrl();

        const postInventory = async (
            dateStr: string,
            segs: Segment[],
            routeOrigin: Airport,
            routeDestination: Airport,
            isReturn: boolean
        ) => {
            const apiSegments = buildApiSegmentsForDate(segs, dateStr, isReturn);
            const firstSegDep = apiSegments[0].departure_datetime;
            const lastSegArr = apiSegments[apiSegments.length - 1].arrival_datetime;
            const firstMs = new Date(firstSegDep).getTime();
            const lastMs = new Date(lastSegArr).getTime();
            const diffMin = Math.round((lastMs - firstMs) / 60000);
            const totalDurStr = `${Math.floor(diffMin / 60)}h ${diffMin % 60}m`;
            const salesClosing = salesClosingFromEnding(
                firstSegDep,
                Number(salesEndHours) || 0,
                salesEndUnit
            );

            const payload = {
                airline_code: apiSegments[0].airline_code,
                airline_name: apiSegments[0].airline_name,
                flight_number: apiSegments[0].flight_number,
                origin: routeOrigin.code,
                destination: routeDestination.code,
                departure_datetime: firstSegDep,
                arrival_datetime: lastSegArr,
                duration: totalDurStr,
                sales_closing_datetime: salesClosing,
                segments: apiSegments,
                ...sharedFare,
            };

            const res = await fetch(`${apiBase}/flights/inventory/`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${access}`,
                },
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                const errText = await res.text();
                const leg = isReturn ? "return" : "outbound";
                throw new Error(`Failed to save ${leg} for ${dateStr}: ${errText}`);
            }
        };

        setIsSubmitting(true);
        try {
            // Outbound inventory — one row per operating date
            for (const dateStr of selectedOperatingDates) {
                await postInventory(dateStr, outboundSegs, origin, destination, false);
            }

            // Return inventory — separate row(s), swapped route, return segments
            if (returnMode && returnSegs && selectedReturnDate) {
                const returnDates =
                    seriesMode && selectedOperatingDates.length > 1
                        ? // Pair each outbound series date with the same offset from first outbound → return date
                          (() => {
                              const out0 = new Date(`${selectedOperatingDates[0]}T00:00:00`).getTime();
                              const ret0 = new Date(`${selectedReturnDate}T00:00:00`).getTime();
                              const gapDays = Math.round((ret0 - out0) / 86400000);
                              return selectedOperatingDates.map((d) => {
                                  const base = new Date(`${d}T00:00:00`);
                                  base.setDate(base.getDate() + gapDays);
                                  const y = base.getFullYear();
                                  const m = String(base.getMonth() + 1).padStart(2, "0");
                                  const day = String(base.getDate()).padStart(2, "0");
                                  return `${y}-${m}-${day}`;
                              });
                          })()
                        : [selectedReturnDate];

                for (const dateStr of returnDates) {
                    await postInventory(dateStr, returnSegs, destination, origin, true);
                }
            }

            const createdLegs = returnMode ? "outbound and return" : "outbound";
            alert(`Successfully created ${createdLegs} flight inventory!`);
            router.push("/sale/inventory");
        } catch (error: unknown) {
            console.error(error);
            const errorMessage =
                error instanceof Error ? error.message : "Failed to create flight inventory.";
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

    const openScheduleModal = (leg: "outbound" | "return") => {
        // Persist the other leg's segments before switching form data
        if (schedulingLeg === "outbound") {
            outboundSegmentsRef.current = segments;
        } else {
            returnSegmentsRef.current = segments;
        }

        setSchedulingLeg(leg);
        setModalTab(1); // always start at Flight detail (avoid landing on Policies)
        setEditingAirport(null);

        if (leg === "return" && origin && destination) {
            const saved = returnSegmentsRef.current;
            if (saved?.length) {
                setSegments(saved.map((s) => ({ ...s, isEditing: true })));
            } else {
                setSegments([
                    {
                        id: 1,
                        fromCode: destination.code,
                        fromCity: destination.city,
                        fromTerminal: "Terminal 3",
                        fromTime: "23:00",
                        toCode: origin.code,
                        toCity: origin.city,
                        toTerminal: "Terminal 3",
                        toTime: "11:00",
                        airlineName: "",
                        airlineCode: "",
                        flightNumber: "",
                        duration: "12h 0m",
                        plusOneDay: false,
                        isEditing: true,
                    },
                ]);
            }
        } else if (leg === "outbound") {
            const saved = outboundSegmentsRef.current;
            if (saved?.length) {
                setSegments(saved);
            }
        }

        setIsModalOpen(true);
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
        highlighted = false,
        availableDates?: Set<string>
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
                    <button type="button" onClick={onPrev} className="hover:text-[#D60D26] transition-colors p-1 rounded">
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    {monthName} {year}
                    <button type="button" onClick={onNext} className="hover:text-[#D60D26] transition-colors p-1 rounded">
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
                            const isAvailable =
                                !isSelected &&
                                Boolean(availableDates?.has(cell.iso)) &&
                                cell.type === "curr";
                            const isToday = cell.iso === today.toISOString().slice(0, 10);
                            const isOtherMonth = cell.type !== 'curr';
                            return (
                                <div
                                    key={i}
                                    onClick={() => !isPast && !isOtherMonth && onPickDate(cell.iso)}
                                    className={`rounded-full w-8 h-8 flex items-center justify-center mx-auto font-bold transition-colors ${
                                        isSelected
                                            ? 'bg-[#D60D26] text-white cursor-pointer'
                                            : isAvailable
                                            ? 'bg-[#2B7BB9] text-white cursor-pointer hover:bg-[#246a9e]'
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

    const displayOrigin = routeLeg === "return" && origin && destination ? destination : origin;
    const displayDestination = routeLeg === "return" && origin && destination ? origin : destination;
    const originCoords = displayOrigin ? AIRPORT_COORDS[displayOrigin.code] ?? null : null;
    const destinationCoords = displayDestination
        ? AIRPORT_COORDS[displayDestination.code] ?? null
        : null;

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
                    <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" /> {isPnrMode ? "Add PNR" : "Add flights"}
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

            {/* Return leg tabs — fixed under header, not part of scroll */}
            {step < 3 && returnMode && origin && destination && (
                <div className="relative z-30 shrink-0 w-full bg-white/95 backdrop-blur-sm border-b border-slate-200 shadow-sm">
                    <div className="w-full max-w-[720px] mx-auto px-4 flex items-center gap-6 sm:gap-10">
                        <button
                            type="button"
                            onClick={() => setRouteLeg("outbound")}
                            className={`py-3.5 text-[14px] sm:text-[15px] font-bold transition-colors border-b-4 ${
                                routeLeg === "outbound"
                                    ? "text-slate-900 border-[#D60D26]"
                                    : "text-slate-400 border-transparent hover:text-slate-600"
                            }`}
                        >
                            {origin.city} → {destination.city}
                        </button>
                        <button
                            type="button"
                            onClick={() => setRouteLeg("return")}
                            className={`py-3.5 text-[14px] sm:text-[15px] font-bold transition-colors border-b-4 ${
                                routeLeg === "return"
                                    ? "text-slate-900 border-[#D60D26]"
                                    : "text-slate-400 border-transparent hover:text-slate-600"
                            }`}
                        >
                            {destination.city} → {origin.city}
                        </button>
                    </div>
                </div>
            )}

            {/* Step 0-2 View — Route section */}
            {step < 3 && (
                <div className="relative z-20 flex-1 overflow-y-auto flex flex-col items-center pt-4 sm:pt-6 pb-24 px-4 pointer-events-none w-full min-h-0">
                    <div className="bg-white rounded-[20px] shadow-[0_8px_30px_rgba(0,0,0,0.12)] px-5 py-4 sm:px-8 sm:py-5 flex flex-col sm:flex-row items-center gap-4 w-full max-w-[720px] pointer-events-auto relative shrink-0 z-30">
                        <div 
                            className={`w-full sm:flex-1 px-6 py-2 rounded-xl cursor-text transition-colors ${activeInput === "origin" && routeLeg === "outbound" ? "bg-slate-50 ring-2 ring-[#D60D26]/20" : "hover:bg-slate-50"}`}
                            onClick={() => {
                                if (routeLeg === "return") return;
                                setActiveInput("origin");
                            }}
                        >
                            <div className="text-[12px] text-slate-400 font-bold uppercase tracking-wider mb-1">Origin</div>
                            {activeInput === "origin" && routeLeg === "outbound" ? (
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
                                    {displayOrigin ? (
                                        <>
                                            {displayOrigin.city}{" "}
                                            <span className="text-[#D60D26]">({displayOrigin.code})</span>
                                        </>
                                    ) : (
                                        <span className="text-slate-300">Select Origin</span>
                                    )}
                                </div>
                            )}
                        </div>
                        
                        <button
                            type="button"
                            onClick={() => {
                                if (returnMode) {
                                    setRouteLeg((leg) => (leg === "outbound" ? "return" : "outbound"));
                                    return;
                                }
                                handleSwapRoute();
                            }}
                            disabled={!origin || !destination}
                            className="w-12 h-12 rounded-full border border-[#D60D26] text-[#D60D26] flex items-center justify-center shrink-0 bg-white z-10 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-rose-50 transition-colors"
                            aria-label={returnMode ? "Switch flight leg" : "Swap origin and destination"}
                        >
                            <ArrowRightLeft className="w-5 h-5" />
                        </button>

                        <div 
                            className={`w-full sm:flex-1 px-6 py-2 rounded-xl cursor-text transition-colors ${activeInput === "destination" && routeLeg === "outbound" ? "bg-slate-50 ring-2 ring-[#D60D26]/20" : "hover:bg-slate-50"}`}
                            onClick={() => {
                                if (routeLeg === "return") return;
                                setActiveInput("destination");
                            }}
                        >
                            <div className="text-[12px] text-slate-400 font-bold uppercase tracking-wider mb-1">Destination</div>
                            {activeInput === "destination" && routeLeg === "outbound" ? (
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
                                    {displayDestination ? (
                                        <>
                                            {displayDestination.city}{" "}
                                            <span className="text-[#D60D26]">({displayDestination.code})</span>
                                        </>
                                    ) : (
                                        <span className="text-slate-300">Select Destination</span>
                                    )}
                                </div>
                            )}
                        </div>

                        {activeInput && routeLeg === "outbound" && (
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
                        <div className="mt-8 flex flex-col gap-4 pointer-events-auto animate-in fade-in slide-in-from-bottom-4 duration-500 relative z-20 items-center justify-center w-full max-w-[700px]">
                            <div className="flex flex-col lg:flex-row gap-5 items-center justify-center w-full">
                            {renderCalendar(
                                seriesMode || returnMode ? "FROM" : "DEPARTURE",
                                calendarMonth,
                                () => setCalendarMonth(m => new Date(m.getFullYear(), m.getMonth() - 1, 1)),
                                () => setCalendarMonth(m => new Date(m.getFullYear(), m.getMonth() + 1, 1)),
                                selectedDate,
                                (iso) => {
                                    setSelectedDate(iso);
                                    if (seriesMode) {
                                        const day = new Date(`${iso}T00:00:00`).getDay();
                                        const days = seriesWeekdays.length > 0 ? seriesWeekdays : [day];
                                        if (seriesWeekdays.length === 0) setSeriesWeekdays([day]);
                                        if (selectedReturnDate && selectedReturnDate >= iso) {
                                            setSelectedOperatingDates(
                                                getSeriesOperatingDates(iso, selectedReturnDate, days)
                                            );
                                        }
                                    } else {
                                        setSelectedOperatingDates([iso]);
                                    }
                                },
                                false,
                                seriesMode ? seriesAvailableSet : undefined
                            )}
                            {showBothCalendars &&
                                renderCalendar(
                                    seriesMode || returnMode ? "TO" : "RETURN",
                                    returnCalendarMonth,
                                    () => setReturnCalendarMonth(m => new Date(m.getFullYear(), m.getMonth() - 1, 1)),
                                    () => setReturnCalendarMonth(m => new Date(m.getFullYear(), m.getMonth() + 1, 1)),
                                    selectedReturnDate,
                                    (iso) => {
                                        setSelectedReturnDate(iso);
                                        if (returnMode && !seriesMode) setStep(1);
                                        if (seriesMode && selectedDate) {
                                            const start = selectedDate <= iso ? selectedDate : iso;
                                            const end = selectedDate <= iso ? iso : selectedDate;
                                            if (selectedDate > iso) {
                                                setSelectedDate(start);
                                                setSelectedReturnDate(end);
                                            }
                                            const days =
                                                seriesWeekdays.length > 0
                                                    ? seriesWeekdays
                                                    : [new Date(`${start}T00:00:00`).getDay()];
                                            if (seriesWeekdays.length === 0) setSeriesWeekdays(days);
                                            setSelectedOperatingDates(
                                                getSeriesOperatingDates(start, end, days)
                                            );
                                        }
                                    },
                                    returnMode || seriesMode,
                                    seriesMode ? seriesAvailableSet : undefined
                                )}
                            </div>

                            {seriesMode && (
                                <div className="w-full max-w-[640px] bg-slate-100 rounded-xl px-4 py-3 flex flex-wrap items-center justify-center gap-3 sm:gap-5">
                                    {SERIES_WEEKDAY_OPTIONS.map(({ label, day }) => {
                                        const checked = seriesWeekdays.includes(day);
                                        return (
                                            <label
                                                key={day}
                                                className="flex items-center gap-2 cursor-pointer select-none"
                                            >
                                                <button
                                                    type="button"
                                                    onClick={() => toggleSeriesWeekday(day)}
                                                    className={`w-5 h-5 rounded-[4px] border flex items-center justify-center transition-colors ${
                                                        checked
                                                            ? "bg-[#D60D26] border-[#D60D26] text-white"
                                                            : "bg-white border-slate-300"
                                                    }`}
                                                    aria-pressed={checked}
                                                    aria-label={label}
                                                >
                                                    {checked && <Check className="w-3.5 h-3.5" />}
                                                </button>
                                                <span className="text-[13px] font-bold text-slate-700">
                                                    {label}
                                                </span>
                                            </label>
                                        );
                                    })}
                                </div>
                            )}

                            {seriesMode && selectedDate && selectedReturnDate && (
                                <div className="text-[12px] font-semibold text-slate-500 text-center">
                                    {selectedOperatingDates.length} available date
                                    {selectedOperatingDates.length === 1 ? "" : "s"} in series
                                    <span className="mx-2 text-slate-300">·</span>
                                    <span className="inline-flex items-center gap-1.5">
                                        <span className="w-2.5 h-2.5 rounded-full bg-[#D60D26]" /> range
                                    </span>
                                    <span className="mx-2 text-slate-300">·</span>
                                    <span className="inline-flex items-center gap-1.5">
                                        <span className="w-2.5 h-2.5 rounded-full bg-[#2B7BB9]" /> available
                                    </span>
                                </div>
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

                    {/* Header Tabs — Figma: full weekday row */}
                    <div className="w-full bg-white px-6 sm:px-10 flex items-center gap-6 sm:gap-10 border-b border-slate-200 mt-6 shrink-0 overflow-x-auto whitespace-nowrap no-scrollbar">
                        {(
                          ["Sundays", "Mondays", "Tuesdays", "Wednesdays", "Thursdays", "Fridays", "Saturdays"] as const
                        ).map((label) => {
                            const weekdayName = label.slice(0, -1); // Sunday, Monday, ...
                            const isActive =
                              selectedWeekdayLabels.length === 0
                                ? label === "Sundays"
                                : selectedWeekdayLabels.some((w) => w === weekdayName);
                            const hasDates = selectedWeekdayLabels.some((w) => w === weekdayName);
                            return (
                              <div
                                key={label}
                                className={`font-bold py-4 text-[14px] ${
                                  isActive
                                    ? "text-[#D60D26] border-b-4 border-[#D60D26]"
                                    : hasDates
                                      ? "text-slate-700"
                                      : "text-slate-300"
                                }`}
                              >
                                {label}
                              </div>
                            );
                        })}
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
                                {seriesMode && (
                                    <span className="rounded-full bg-rose-50 border border-rose-100 text-[#D60D26] text-[12px] font-bold px-3 py-1">
                                        Series · {selectedOperatingDates.length} date{selectedOperatingDates.length === 1 ? "" : "s"}
                                    </span>
                                )}
                            </div>

                            <div 
                                onClick={() => openScheduleModal("outbound")}
                                className="w-full bg-[#0C2342] rounded-[12px] p-5 flex items-center justify-between text-white cursor-pointer hover:bg-[#0C2342] transition-colors border-2 border-[#090001]"
                            >
                                <div className="flex items-center gap-4">
                                    <Plane className="w-10 h-10 fill-white" />
                                </div>
                                <div className="font-bold text-[18px] flex items-center gap-2">
                                    Schedule A Flights <ArrowRight className="w-5 h-5" />
                                </div>
                            </div>

                            {hasScheduledFlight && (scheduledOutbound || segments).length > 0 && (
                                <div className="mt-4 flex items-stretch justify-between bg-white border border-slate-200 rounded-xl shadow-sm relative overflow-x-auto sm:overflow-hidden min-h-[70px] animate-in slide-in-from-top-2 duration-300">
                                    <div className="w-1.5 bg-[#D60D26] shrink-0 rounded-l-xl" />
                                    <div className="flex-1 flex items-center px-4 sm:px-8 font-bold text-slate-700 text-[14px] justify-between gap-4 min-w-[520px] py-3">
                                        <div className="min-w-[160px] tracking-tight">
                                            {formatScheduledFlightNumbers(scheduledOutbound || segments)}
                                        </div>
                                        <div className="min-w-[120px] text-center uppercase tracking-wide">
                                            {formatScheduledAirline(scheduledOutbound || segments)}
                                        </div>
                                        <div className="min-w-[200px] text-right tabular-nums">
                                            {formatScheduledTimes(scheduledOutbound || segments)}
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setHasScheduledFlight(false);
                                            setScheduledOutbound(null);
                                            outboundSegmentsRef.current = null;
                                        }}
                                        className="w-[70px] flex items-center justify-center border-l border-slate-200 hover:bg-slate-50 transition-colors shrink-0"
                                    >
                                        <X className="w-5 h-5 text-slate-700" />
                                    </button>
                                </div>
                            )}

                            {!returnMode && (
                                <div className="mt-8 flex flex-col items-center justify-center gap-2 text-slate-400">
                                    <div className="relative w-10 h-10 flex items-center justify-center">
                                        <Plane className="w-8 h-8 opacity-40" />
                                        <span className="absolute inset-0 flex items-center justify-center text-[#D60D26] text-2xl font-light leading-none">×</span>
                                    </div>
                                    <span className="text-[14px] font-semibold">No return flight</span>
                                </div>
                            )}
                        </div>

                        {returnMode && (
                            <div className="bg-white rounded-[24px] shadow-sm border border-slate-200 p-8 mb-6">
                                <div className="flex flex-wrap items-center gap-4 mb-6">
                                    <div className="flex items-center gap-2 border border-slate-200 rounded-xl px-4 py-2 font-bold text-slate-700 text-[14px]">
                                        {destination?.code || "---"}{" "}
                                        <ArrowRight className="w-4 h-4 text-[#D60D26]" />{" "}
                                        {origin?.code || "---"}
                                    </div>
                                    <div className="flex items-center border border-[#D60D26] rounded-xl overflow-hidden font-bold">
                                        <div className="bg-[#D60D26] text-white px-3 py-2 text-[14px]">
                                            {selectedReturnDate
                                                ? new Date(selectedReturnDate + "T00:00:00")
                                                      .toLocaleString("default", { month: "short" })
                                                      .toUpperCase()
                                                : "DATE"}
                                        </div>
                                        <div className="bg-white text-[#D60D26] px-3 py-2 text-[14px]">
                                            {selectedReturnDate
                                                ? String(
                                                      new Date(selectedReturnDate + "T00:00:00").getDate()
                                                  ).padStart(2, "0")
                                                : "--"}
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setStep(1);
                                            setRouteLeg("return");
                                        }}
                                        className="inline-flex items-center gap-2 text-[14px] font-bold text-[#D60D26] hover:underline"
                                    >
                                        <ArrowRightLeft className="w-4 h-4" /> Check return flight
                                    </button>
                                    {hasScheduledReturnFlight && (
                                        <span className="text-[13px] font-bold text-emerald-600">
                                            Return flight scheduled
                                        </span>
                                    )}
                                </div>

                                <button
                                    type="button"
                                    onClick={() => openScheduleModal("return")}
                                    className="w-full bg-[#0C2342] rounded-[12px] p-5 flex items-center justify-between text-white cursor-pointer hover:opacity-95 transition-opacity border-2 border-[#090001]"
                                >
                                    <Plane className="w-10 h-10 fill-white" />
                                    <div className="font-bold text-[18px] flex items-center gap-2">
                                        Schedule A Return Flights <ArrowRight className="w-5 h-5" />
                                    </div>
                                </button>

                                {hasScheduledReturnFlight && (scheduledReturn || returnSegmentsRef.current || segments).length > 0 && (
                                    <div className="mt-4 flex items-stretch justify-between bg-white border border-slate-200 rounded-xl shadow-sm relative overflow-x-auto sm:overflow-hidden min-h-[70px] animate-in slide-in-from-top-2 duration-300">
                                        <div className="w-1.5 bg-[#D60D26] shrink-0 rounded-l-xl" />
                                        <div className="flex-1 flex items-center px-4 sm:px-8 font-bold text-slate-700 text-[14px] justify-between gap-4 min-w-[520px] py-3">
                                            <div className="min-w-[160px] tracking-tight">
                                                {formatScheduledFlightNumbers(
                                                    scheduledReturn || returnSegmentsRef.current || segments
                                                )}
                                            </div>
                                            <div className="min-w-[120px] text-center uppercase tracking-wide">
                                                {formatScheduledAirline(
                                                    scheduledReturn || returnSegmentsRef.current || segments
                                                )}
                                            </div>
                                            <div className="min-w-[200px] text-right tabular-nums">
                                                {formatScheduledTimes(
                                                    scheduledReturn || returnSegmentsRef.current || segments
                                                )}
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setHasScheduledReturnFlight(false);
                                                setScheduledReturn(null);
                                                returnSegmentsRef.current = null;
                                            }}
                                            className="w-[70px] flex items-center justify-center border-l border-slate-200 hover:bg-slate-50 transition-colors shrink-0"
                                        >
                                            <X className="w-5 h-5 text-slate-700" />
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
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
                            Outbound
                        </div>
                        
                        {selectedOperatingDates.map((dateStr, idx) => {
                            const formattedDate = formatDateLabel(dateStr, { weekday: 'short', day: 'numeric', month: 'short', year: '2-digit' });
                            const displaySegs = scheduledOutbound || segments;
                            const airlineNames = formatScheduledAirline(displaySegs);
                            const flightNumbers = formatScheduledFlightNumbers(displaySegs);

                            return (
                                <div key={`out-${idx}`} className="border-b border-slate-200 flex flex-col md:grid md:grid-cols-8 gap-2 md:gap-4 items-start md:items-center py-6 px-4 text-[13px] font-bold text-slate-700">
                                    <div className="flex flex-col md:col-span-2 w-full">
                                        <span className="md:hidden text-slate-400 font-medium mb-1">Route:</span>
                                        <span>{origin?.code} → {destination?.code} <span className="text-slate-400 font-medium">• ({Math.max(0, displaySegs.length - 1)} Stops)</span></span>
                                    </div>
                                    <div className="flex items-center gap-2 w-full"><span className="md:hidden text-slate-400 font-medium w-20">Date:</span>{formattedDate}</div>
                                    <div className="flex items-center gap-2 w-full"><span className="md:hidden text-slate-400 font-medium w-20">Time:</span>{formatScheduledTimes(displaySegs)}</div>
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

                        {returnMode && selectedReturnDate && (scheduledReturn || returnSegmentsRef.current) && (
                            <>
                                <div className="bg-slate-100 px-4 py-2 text-[13px] font-bold text-slate-700 mt-4">
                                    Return
                                </div>
                                {(() => {
                                    const returnSegs = scheduledReturn || returnSegmentsRef.current || [];
                                    const returnDates =
                                        seriesMode && selectedOperatingDates.length > 1
                                            ? (() => {
                                                  const out0 = new Date(
                                                      `${selectedOperatingDates[0]}T00:00:00`
                                                  ).getTime();
                                                  const ret0 = new Date(
                                                      `${selectedReturnDate}T00:00:00`
                                                  ).getTime();
                                                  const gapDays = Math.round((ret0 - out0) / 86400000);
                                                  return selectedOperatingDates.map((d) => {
                                                      const base = new Date(`${d}T00:00:00`);
                                                      base.setDate(base.getDate() + gapDays);
                                                      const y = base.getFullYear();
                                                      const m = String(base.getMonth() + 1).padStart(2, "0");
                                                      const day = String(base.getDate()).padStart(2, "0");
                                                      return `${y}-${m}-${day}`;
                                                  });
                                              })()
                                            : [selectedReturnDate];

                                    return returnDates.map((dateStr, idx) => {
                                        const formattedDate = formatDateLabel(dateStr, {
                                            weekday: "short",
                                            day: "numeric",
                                            month: "short",
                                            year: "2-digit",
                                        });
                                        return (
                                            <div
                                                key={`ret-${idx}`}
                                                className="border-b border-slate-200 flex flex-col md:grid md:grid-cols-8 gap-2 md:gap-4 items-start md:items-center py-6 px-4 text-[13px] font-bold text-slate-700"
                                            >
                                                <div className="flex flex-col md:col-span-2 w-full">
                                                    <span className="md:hidden text-slate-400 font-medium mb-1">
                                                        Route:
                                                    </span>
                                                    <span>
                                                        {destination?.code} → {origin?.code}{" "}
                                                        <span className="text-slate-400 font-medium">
                                                            • ({Math.max(0, returnSegs.length - 1)} Stops)
                                                        </span>
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2 w-full">
                                                    <span className="md:hidden text-slate-400 font-medium w-20">
                                                        Date:
                                                    </span>
                                                    {formattedDate}
                                                </div>
                                                <div className="flex items-center gap-2 w-full">
                                                    <span className="md:hidden text-slate-400 font-medium w-20">
                                                        Time:
                                                    </span>
                                                    {formatScheduledTimes(returnSegs)}
                                                </div>
                                                <div className="flex items-center gap-2 w-full">
                                                    <span className="md:hidden text-slate-400 font-medium w-20">
                                                        Airlines:
                                                    </span>
                                                    {formatScheduledAirline(returnSegs)}
                                                </div>
                                                <div className="flex items-center gap-2 w-full">
                                                    <span className="md:hidden text-slate-400 font-medium w-20">
                                                        Flight No:
                                                    </span>
                                                    {formatScheduledFlightNumbers(returnSegs)}
                                                </div>
                                                <div className="flex items-center gap-1.5 w-full">
                                                    <span className="md:hidden text-slate-400 font-medium w-20">
                                                        Seats:
                                                    </span>
                                                    {availableSeats || "10"}
                                                </div>
                                                <div className="text-[14px] flex items-center gap-2 w-full">
                                                    <span className="md:hidden text-slate-400 font-medium w-20 text-[13px]">
                                                        Fare:
                                                    </span>
                                                    INR {seatPrice || "00.00"}
                                                </div>
                                                <div className="flex items-center gap-2 w-full">
                                                    <span className="md:hidden text-slate-400 font-medium w-20">
                                                        APIS:
                                                    </span>
                                                    <span
                                                        className={`rounded-full px-5 py-1.5 text-[12px] font-bold ${
                                                            requiresApis
                                                                ? "border border-green-300 text-green-500 bg-green-50"
                                                                : "border border-slate-300 text-slate-500 bg-slate-50"
                                                        }`}
                                                    >
                                                        {requiresApis ? "Required" : "Not required"}
                                                    </span>
                                                </div>
                                            </div>
                                        );
                                    });
                                })()}
                            </>
                        )}
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
                                    <button
                                        type="button"
                                        onClick={handleAddFlightSeries}
                                        className={`w-full sm:w-auto flex items-center justify-center gap-2 font-bold hover:bg-rose-50 px-4 py-2 rounded-lg transition-colors text-[15px] ${
                                            seriesMode ? "text-emerald-600 bg-emerald-50" : "text-[#D60D26]"
                                        }`}
                                    >
                                        {seriesMode ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}{" "}
                                        {seriesMode ? "Flight series on" : "Add flight series"}
                                    </button>
                                    <div className="hidden sm:block w-px h-6 bg-slate-300"></div>
                                    <button
                                        type="button"
                                        onClick={() => setSeriesInfoOpen(true)}
                                        className="w-full sm:w-auto text-slate-500 font-bold hover:text-slate-700 underline underline-offset-4 text-[15px] decoration-2"
                                    >
                                        How flight series work
                                    </button>
                                </>
                            )}
                        </div>
                        <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 w-full sm:w-auto mt-2 sm:mt-0">
                            {step >= 1 && !returnMode && (
                                <button
                                    type="button"
                                    onClick={handleAddReturnFlight}
                                    className="w-full sm:w-auto justify-center border border-[#D60D26] text-[#D60D26] hover:bg-rose-50 rounded-full px-4 sm:px-8 py-3.5 font-bold text-[14px] sm:text-[15px] flex items-center gap-2 transition-colors"
                                >
                                    <ArrowRightLeft className="w-4 h-4" /> Add return flight
                                </button>
                            )}
                            {step >= 1 && returnMode && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setReturnMode(false);
                                        setRouteLeg("outbound");
                                        setHasScheduledReturnFlight(false);
                                        if (!seriesMode) {
                                            setSelectedReturnDate(null);
                                        }
                                    }}
                                    className="w-full sm:w-auto justify-center border border-emerald-500 text-emerald-600 bg-emerald-50 hover:bg-emerald-100 rounded-full px-4 sm:px-8 py-3.5 font-bold text-[14px] sm:text-[15px] flex items-center gap-2 transition-colors"
                                >
                                    <Check className="w-4 h-4" /> Return flight on
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
                                type="button"
                                onClick={() => {
                                    if (!hasScheduledFlight) return;
                                    if (returnMode && !hasScheduledReturnFlight) {
                                        alert("Please schedule the return flight first.");
                                        return;
                                    }
                                    setStep(4);
                                }}
                                className={`w-full sm:w-auto justify-center px-4 sm:px-10 py-3.5 rounded-full font-bold text-[14px] sm:text-[15px] transition-colors flex items-center gap-2 ${
                                    hasScheduledFlight && (!returnMode || hasScheduledReturnFlight)
                                        ? "bg-[#D60D26] text-white hover:bg-[#30060F] shadow-md"
                                        : "bg-[#FFA8B3] text-white cursor-not-allowed"
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
                    <div className="bg-white rounded-3xl w-full max-w-[960px] max-h-[90vh] shadow-2xl overflow-hidden flex flex-col">
                        {/* Modal Header */}
                        <div className="bg-gradient-to-r from-[#D60D26] to-[#30060F] text-white p-6 relative shrink-0">
                            <button onClick={() => setIsModalOpen(false)} className="absolute top-6 right-6 hover:bg-white/20 p-1 rounded-full transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                            <div className="font-bold text-[16px] mb-1">
                                {schedulingLeg === "return" ? "Return flight" : "New flights"}
                                {seriesMode ? " · Series" : ""}
                            </div>
                            <div className="font-extrabold text-[18px] flex items-center gap-2">
                                {schedulingLeg === "return"
                                    ? (destination?.city || "Destination")
                                    : (origin?.city || "New Delhi")}{" "}
                                ({schedulingLeg === "return"
                                    ? (destination?.code || "---")
                                    : (origin?.code || "DEL")})
                                <div className="w-5 h-5 rounded-full border border-white flex items-center justify-center mx-1">
                                    <ArrowRight className="w-3 h-3 text-white" />
                                </div>
                                {schedulingLeg === "return"
                                    ? (origin?.city || "Origin")
                                    : (destination?.city || "Destination")}{" "}
                                ({schedulingLeg === "return"
                                    ? (origin?.code || "---")
                                    : (destination?.code || "---")})
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
                                    {tab}. {["Flight detail", "Baggages", isPnrMode ? "Seats & GPNR" : "Seats", "Dates", "Policies"][tab - 1]}
</button>
                            ))}
                        </div>

                        {/* Modal Body */}
                        <div className="flex-1 overflow-y-auto overflow-x-hidden bg-white p-5 sm:p-8 min-h-0">
                            {modalTab === 1 && (
                                <div className="flex flex-col gap-8 w-full min-w-0">
                                    {/* Editing forms — full width so they aren't crushed beside confirmed cards */}
                                    {segments.some((s) => s.isEditing) && (
                                        <div className="flex flex-col gap-8 w-full">
                                            {segments.map((seg, index) => {
                                                if (!seg.isEditing) return null;
                                                const nextDayNeeded = (from: string, to: string) => {
                                                    if (!from || !to) return false;
                                                    const [fH, fM] = from.split(":").map(Number);
                                                    const [tH, tM] = to.split(":").map(Number);
                                                    if (tH < fH) return true;
                                                    if (tH === fH && tM < fM) return true;
                                                    return false;
                                                };
                                                const getSegDuration = (from: string, to: string, p1: boolean) => {
                                                    if (!from || !to) return "2h 0m";
                                                    const [fH, fM] = from.split(":").map(Number);
                                                    const [tH, tM] = to.split(":").map(Number);
                                                    let diff = tH * 60 + tM - (fH * 60 + fM);
                                                    if (p1) diff += 24 * 60;
                                                    else if (diff < 0) diff += 24 * 60;
                                                    return `${Math.floor(diff / 60)}h ${diff % 60}m`;
                                                };
                                                const requiresNextDay = nextDayNeeded(seg.fromTime, seg.toTime);
                                                const hasAirports = Boolean(seg.fromCode?.trim() && seg.toCode?.trim());
                                                const isConfirmable =
                                                    hasAirports && (!requiresNextDay || seg.plusOneDay);
                                                const calculatedDuration = getSegDuration(
                                                    seg.fromTime,
                                                    seg.toTime,
                                                    !!seg.plusOneDay
                                                );
                                                const placeOpen =
                                                    editingAirport?.segmentId === seg.id &&
                                                    editingAirport.field === "to";

                                                return (
                                                    <div
                                                        key={`edit-${seg.id}`}
                                                        className={`w-full max-w-3xl mx-auto animate-in fade-in duration-300 ${
                                                            placeOpen ? "pb-52" : ""
                                                        }`}
                                                    >
                                                        <div className="text-[13px] font-bold text-slate-500 mb-4">
                                                            Segment {index + 1}
                                                            {segments.length > 1
                                                                ? index === 0
                                                                    ? " · Origin → stopover"
                                                                    : " · Stopover → destination"
                                                                : ""}
                                                        </div>

                                                        {/* Timeline */}
                                                        <div className="flex items-center relative mb-8 px-1">
                                                            <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 border-t-2 border-dashed border-slate-300 z-0" />
                                                            <div className="w-4 h-4 rounded-full border-[3px] border-slate-800 bg-white relative z-10 shrink-0" />
                                                            <div className="flex-1" />
                                                            <Plane className="w-5 h-5 text-slate-400 relative z-10 bg-white shrink-0" />
                                                            <div className="flex-1" />
                                                            {segments.length === 1 ? (
                                                                <button
                                                                    type="button"
                                                                    className="relative z-10 flex flex-col items-center cursor-pointer group mx-2"
                                                                    onClick={handleAddStopover}
                                                                >
                                                                    <div className="w-7 h-7 bg-white border-2 border-[#D60D26] text-[#D60D26] rounded-full flex items-center justify-center text-xl leading-none font-bold shadow-sm group-hover:bg-rose-50">
                                                                        +
                                                                    </div>
                                                                    <span className="text-[#D60D26] font-bold text-[11px] mt-1 whitespace-nowrap underline underline-offset-2">
                                                                        Add a stop over
                                                                    </span>
                                                                </button>
                                                            ) : (
                                                                <div
                                                                    className="w-4 h-4 rounded-full bg-slate-800 relative z-10 shrink-0 mx-2"
                                                                    title="Stop over"
                                                                />
                                                            )}
                                                            <div className="flex-1" />
                                                            <Plane className="w-5 h-5 text-slate-400 relative z-10 bg-white shrink-0" />
                                                            <div className="flex-1" />
                                                            <div className="relative z-10 flex items-center justify-center w-5 h-5 bg-white border-2 border-slate-800 rounded-full shrink-0">
                                                                <svg
                                                                    className="w-2.5 h-2.5 text-slate-800"
                                                                    fill="none"
                                                                    viewBox="0 0 24 24"
                                                                    stroke="currentColor"
                                                                >
                                                                    <path
                                                                        strokeLinecap="round"
                                                                        strokeLinejoin="round"
                                                                        strokeWidth="3"
                                                                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                                                                    />
                                                                    <path
                                                                        strokeLinecap="round"
                                                                        strokeLinejoin="round"
                                                                        strokeWidth="3"
                                                                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                                                                    />
                                                                </svg>
                                                            </div>
                                                        </div>

                                                        {/* Two-column form — stacks on narrow widths */}
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10">
                                                            {/* LEFT: departure */}
                                                            <div className="space-y-4">
                                                                <div className="grid grid-cols-[110px_1fr] gap-3">
                                                                    <div>
                                                                        <label className="text-[12px] font-bold text-slate-500 mb-1.5 block truncate">
                                                                            {seg.fromCode || "—"} local time
                                                                        </label>
                                                                        <div className="border border-slate-200 rounded-xl px-3 py-2.5 flex items-center gap-2 shadow-sm">
                                                                            <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                                                                            <input
                                                                                type="text"
                                                                                className="w-full font-bold text-slate-700 outline-none bg-transparent text-[14px]"
                                                                                value={seg.fromTime}
                                                                                onChange={(e) =>
                                                                                    updateSegment(
                                                                                        seg.id,
                                                                                        "fromTime",
                                                                                        e.target.value
                                                                                    )
                                                                                }
                                                                            />
                                                                        </div>
                                                                    </div>
                                                                    <div>
                                                                        <label className="text-[12px] font-bold text-slate-500 mb-1.5 block">
                                                                            Airport
                                                                        </label>
                                                                        <div className="w-full border border-slate-200 rounded-xl px-3 py-2.5 bg-slate-50 font-semibold text-slate-700 text-[14px] cursor-not-allowed truncate">
                                                                            {seg.fromCode
                                                                                ? `${seg.fromCode} (${seg.fromCity})`
                                                                                : "Place"}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <div>
                                                                    <label className="text-[12px] font-bold text-slate-500 mb-1.5 block">
                                                                        Airline
                                                                    </label>
                                                                    <input
                                                                        type="text"
                                                                        className="w-full border border-slate-200 rounded-xl px-3 py-2.5 font-semibold text-slate-700 outline-none shadow-sm text-[14px]"
                                                                        value={seg.airlineName || ""}
                                                                        onChange={(e) =>
                                                                            updateSegment(
                                                                                seg.id,
                                                                                "airlineName",
                                                                                e.target.value
                                                                            )
                                                                        }
                                                                        placeholder="Airline"
                                                                    />
                                                                </div>
                                                                {seg.technicalStop != null ? (
                                                                    <div className="space-y-1.5">
                                                                        <div className="flex items-center justify-between">
                                                                            <label className="text-[12px] font-bold text-slate-500">
                                                                                Technical stop
                                                                            </label>
                                                                            <button
                                                                                type="button"
                                                                                className="text-[12px] font-bold text-[#2B7BB9] hover:underline"
                                                                                onClick={() =>
                                                                                    updateSegment(
                                                                                        seg.id,
                                                                                        "technicalStop",
                                                                                        null
                                                                                    )
                                                                                }
                                                                            >
                                                                                − remove
                                                                            </button>
                                                                        </div>
                                                                        <input
                                                                            type="text"
                                                                            className="w-full border border-slate-200 rounded-xl px-3 py-2.5 font-semibold text-slate-700 outline-none shadow-sm text-[14px]"
                                                                            value={seg.technicalStop}
                                                                            onChange={(e) =>
                                                                                updateSegment(
                                                                                    seg.id,
                                                                                    "technicalStop",
                                                                                    e.target.value
                                                                                )
                                                                            }
                                                                            placeholder="Airport code e.g. DOH"
                                                                        />
                                                                    </div>
                                                                ) : (
                                                                    <button
                                                                        type="button"
                                                                        className="text-[12px] font-bold text-[#2B7BB9] hover:underline text-left"
                                                                        onClick={() =>
                                                                            updateSegment(seg.id, "technicalStop", "")
                                                                        }
                                                                    >
                                                                        + add technical stop
                                                                    </button>
                                                                )}
                                                                <div className="grid grid-cols-2 gap-3">
                                                                    <div>
                                                                        <label className="text-[12px] font-bold text-slate-500 mb-1.5 block">
                                                                            Flight number
                                                                        </label>
                                                                        <input
                                                                            type="text"
                                                                            className="w-full border border-slate-200 rounded-xl px-3 py-2.5 font-bold text-slate-700 outline-none shadow-sm text-[14px] uppercase"
                                                                            value={seg.flightNumber || ""}
                                                                            onChange={(e) =>
                                                                                updateSegment(
                                                                                    seg.id,
                                                                                    "flightNumber",
                                                                                    e.target.value.toUpperCase()
                                                                                )
                                                                            }
                                                                            placeholder="----"
                                                                        />
                                                                    </div>
                                                                    <div>
                                                                        <label className="text-[12px] font-bold text-slate-500 mb-1.5 block">
                                                                            Terminal
                                                                        </label>
                                                                        <input
                                                                            type="text"
                                                                            className="w-full border border-slate-200 rounded-xl px-3 py-2.5 font-semibold text-slate-700 outline-none shadow-sm text-[14px]"
                                                                            value={seg.fromTerminal}
                                                                            onChange={(e) =>
                                                                                updateSegment(
                                                                                    seg.id,
                                                                                    "fromTerminal",
                                                                                    e.target.value
                                                                                )
                                                                            }
                                                                            placeholder="Terminal 3"
                                                                        />
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            {/* RIGHT: arrival */}
                                                            <div className="space-y-4 relative z-20">
                                                                <div className="grid grid-cols-[1fr_110px] gap-3">
                                                                    <div className="relative">
                                                                        <label className="text-[12px] font-bold text-slate-500 mb-1.5 block">
                                                                            Airport
                                                                        </label>
                                                                        {index === segments.length - 1 ? (
                                                                            <div className="w-full border border-slate-200 rounded-xl px-3 py-2.5 bg-slate-50 font-semibold text-slate-700 text-[14px] cursor-not-allowed truncate">
                                                                                {seg.toCode} {seg.toCity}
                                                                            </div>
                                                                        ) : (
                                                                            <>
                                                                                <input
                                                                                    type="text"
                                                                                    className="w-full border border-slate-200 rounded-xl px-3 py-2.5 bg-white font-semibold text-slate-700 outline-none shadow-sm text-[14px] focus:border-[#D60D26]"
                                                                                    value={
                                                                                        placeOpen
                                                                                            ? editingAirport!.query
                                                                                            : seg.toCode
                                                                                              ? `${seg.toCode} ${seg.toCity}`
                                                                                              : ""
                                                                                    }
                                                                                    onFocus={() =>
                                                                                        setEditingAirport({
                                                                                            segmentId: seg.id,
                                                                                            field: "to",
                                                                                            query: seg.toCode
                                                                                                ? `${seg.toCode} ${seg.toCity}`
                                                                                                : "",
                                                                                        })
                                                                                    }
                                                                                    onChange={(e) =>
                                                                                        setEditingAirport({
                                                                                            segmentId: seg.id,
                                                                                            field: "to",
                                                                                            query: e.target.value,
                                                                                        })
                                                                                    }
                                                                                    placeholder="Place"
                                                                                />
                                                                                {placeOpen && (
                                                                                    <div className="absolute z-50 left-0 right-0 top-full mt-1 max-h-44 overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-2xl">
                                                                                        {AIRPORTS.filter((a) => {
                                                                                            const q =
                                                                                                editingAirport!.query.toLowerCase();
                                                                                            if (!q) return true;
                                                                                            return (
                                                                                                a.code
                                                                                                    .toLowerCase()
                                                                                                    .includes(q) ||
                                                                                                a.city
                                                                                                    .toLowerCase()
                                                                                                    .includes(q) ||
                                                                                                a.name
                                                                                                    .toLowerCase()
                                                                                                    .includes(q)
                                                                                            );
                                                                                        })
                                                                                            .slice(0, 8)
                                                                                            .map((airport) => (
                                                                                                <button
                                                                                                    key={`to-${airport.code}`}
                                                                                                    type="button"
                                                                                                    onClick={() =>
                                                                                                        applyAirportToSegment(
                                                                                                            airport
                                                                                                        )
                                                                                                    }
                                                                                                    className="w-full text-left px-3 py-2.5 hover:bg-rose-50 text-[13px] border-b border-slate-50 last:border-0"
                                                                                                >
                                                                                                    <span className="font-bold text-slate-800">
                                                                                                        {airport.city}{" "}
                                                                                                        <span className="text-[#D60D26]">
                                                                                                            ({airport.code})
                                                                                                        </span>
                                                                                                    </span>
                                                                                                    <div className="text-[11px] text-slate-500">
                                                                                                        {airport.name}
                                                                                                    </div>
                                                                                                </button>
                                                                                            ))}
                                                                                    </div>
                                                                                )}
                                                                            </>
                                                                        )}
                                                                    </div>
                                                                    <div>
                                                                        <label className="text-[12px] font-bold text-slate-500 mb-1.5 block truncate">
                                                                            {seg.toCode || "—"} local time
                                                                        </label>
                                                                        <div className="border border-slate-200 rounded-xl px-3 py-2.5 flex items-center gap-2 shadow-sm">
                                                                            <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                                                                            <input
                                                                                type="text"
                                                                                className="w-full font-bold text-slate-700 outline-none bg-transparent text-[14px]"
                                                                                value={seg.toTime}
                                                                                onChange={(e) =>
                                                                                    updateSegment(
                                                                                        seg.id,
                                                                                        "toTime",
                                                                                        e.target.value
                                                                                    )
                                                                                }
                                                                            />
                                                                        </div>
                                                                        <label className="flex items-center gap-2 mt-2 cursor-pointer">
                                                                            <input
                                                                                type="checkbox"
                                                                                checked={!!seg.plusOneDay}
                                                                                onChange={(e) =>
                                                                                    updateSegment(
                                                                                        seg.id,
                                                                                        "plusOneDay",
                                                                                        e.target.checked
                                                                                    )
                                                                                }
                                                                                className="w-4 h-4 rounded border-slate-300 accent-[#D60D26] cursor-pointer"
                                                                            />
                                                                            <span className="text-[12px] font-bold text-slate-600">
                                                                                + 1 day
                                                                            </span>
                                                                        </label>
                                                                    </div>
                                                                </div>
                                                                <div>
                                                                    <label className="text-[12px] font-bold text-slate-500 mb-1.5 block">
                                                                        Terminal
                                                                    </label>
                                                                    <input
                                                                        type="text"
                                                                        className="w-full border border-slate-200 rounded-xl px-3 py-2.5 font-semibold text-slate-700 outline-none shadow-sm text-[14px]"
                                                                        value={seg.toTerminal}
                                                                        onChange={(e) =>
                                                                            updateSegment(
                                                                                seg.id,
                                                                                "toTerminal",
                                                                                e.target.value
                                                                            )
                                                                        }
                                                                        placeholder="Terminal 3"
                                                                    />
                                                                </div>
                                                                <div className="relative z-10">
                                                                    {isConfirmable ? (
                                                                        <button
                                                                            type="button"
                                                                            onClick={() =>
                                                                                confirmSegment(
                                                                                    seg.id,
                                                                                    calculatedDuration
                                                                                )
                                                                            }
                                                                            className="w-full bg-[#E8F4FC] text-[#2B7BB9] border border-[#D0E8F7] font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 text-[14px] hover:bg-[#D9EEF9] transition-colors"
                                                                        >
                                                                            <Check className="w-4 h-4" /> Confirm
                                                                            segment
                                                                        </button>
                                                                    ) : (
                                                                        <div className="space-y-2">
                                                                            <div className="text-[12px] font-bold text-amber-600 leading-snug">
                                                                                {!hasAirports
                                                                                    ? "Select the stopover airport (Place) before confirming."
                                                                                    : "Arrival looks like the next day — tick "}
                                                                                {hasAirports && (
                                                                                    <span
                                                                                        className="underline cursor-pointer"
                                                                                        onClick={() =>
                                                                                            updateSegment(
                                                                                                seg.id,
                                                                                                "plusOneDay",
                                                                                                true
                                                                                            )
                                                                                        }
                                                                                    >
                                                                                        +1 day to correct it
                                                                                    </span>
                                                                                )}
                                                                            </div>
                                                                            <button
                                                                                type="button"
                                                                                disabled
                                                                                className="w-full bg-[#E8F4FC] text-[#A8C9DE] font-bold py-3.5 rounded-xl text-[14px] cursor-not-allowed"
                                                                            >
                                                                                Confirm segment
                                                                            </button>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}

                                    {/* Confirmed cards — own row, no collision with the edit form */}
                                    {segments.some((s) => !s.isEditing) && (
                                        <div className="flex gap-5 overflow-x-auto pb-2 items-start w-full min-w-0">
                                            {segments.map((seg, index) => {
                                                if (seg.isEditing) return null;
                                                const getSegDuration = (from: string, to: string, p1: boolean) => {
                                                    if (!from || !to) return "2h 0m";
                                                    const [fH, fM] = from.split(":").map(Number);
                                                    const [tH, tM] = to.split(":").map(Number);
                                                    let diff = tH * 60 + tM - (fH * 60 + fM);
                                                    if (p1) diff += 24 * 60;
                                                    else if (diff < 0) diff += 24 * 60;
                                                    return `${Math.floor(diff / 60)}h ${diff % 60}m`;
                                                };
                                                const calculatedDuration = getSegDuration(
                                                    seg.fromTime,
                                                    seg.toTime,
                                                    !!seg.plusOneDay
                                                );

                                                return (
                                                    <div
                                                        key={seg.id}
                                                        className="w-[360px] shrink-0 flex flex-col animate-in fade-in duration-300 relative"
                                                    >
                                                        {index > 0 && !segments[index - 1]?.isEditing && (
                                                            <div className="absolute -left-3 top-[calc(1.25rem+10px)] w-6 border-t-2 border-dashed border-slate-300 z-0 pointer-events-none" />
                                                        )}
                                                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                                                            <div className="flex items-center px-5 pt-5 pb-2 relative">
                                                                <div className="absolute left-5 right-5 top-[calc(1.25rem+10px)] border-t-2 border-dashed border-slate-300 z-0" />
                                                                {index === 0 ? (
                                                                    <div className="w-4 h-4 rounded-full border-[3px] border-slate-800 bg-white relative z-10 shrink-0" />
                                                                ) : (
                                                                    <div className="w-4 h-4 rounded-full bg-slate-800 relative z-10 shrink-0" title="Stop over" />
                                                                )}
                                                                <div className="flex-1" />
                                                                <Plane className="w-5 h-5 text-slate-400 relative z-10 bg-white shrink-0" />
                                                                <div className="flex-1" />
                                                                {index === segments.length - 1 ? (
                                                                    <div className="relative z-10 flex items-center justify-center w-5 h-5 bg-white border-2 border-slate-800 rounded-full shrink-0">
                                                                        <svg
                                                                            className="w-2.5 h-2.5 text-slate-800"
                                                                            fill="none"
                                                                            viewBox="0 0 24 24"
                                                                            stroke="currentColor"
                                                                        >
                                                                            <path
                                                                                strokeLinecap="round"
                                                                                strokeLinejoin="round"
                                                                                strokeWidth="3"
                                                                                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                                                                            />
                                                                            <path
                                                                                strokeLinecap="round"
                                                                                strokeLinejoin="round"
                                                                                strokeWidth="3"
                                                                                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                                                                            />
                                                                        </svg>
                                                                    </div>
                                                                ) : (
                                                                    <div className="w-4 h-4 rounded-full bg-slate-800 relative z-10 shrink-0" />
                                                                )}
                                                            </div>
                                                            <div className="px-5 pb-3">
                                                                <div className="flex justify-between items-start gap-2">
                                                                    <div className="min-w-0">
                                                                        <div className="font-bold text-slate-800 text-[14px] truncate">
                                                                            {seg.fromCity}, {seg.fromCode}
                                                                        </div>
                                                                        <div className="text-[12px] text-slate-400 mb-2">
                                                                            {seg.fromTerminal}
                                                                        </div>
                                                                        <div className="border border-slate-200 rounded-lg px-2.5 py-1 text-[13px] font-bold text-slate-700 inline-block">
                                                                            {seg.fromTime}
                                                                        </div>
                                                                    </div>
                                                                    <div className="flex flex-col items-center px-1 mt-1 shrink-0">
                                                                        <div className="w-9 h-9 bg-[#D60D26] rounded-xl mb-1 flex items-center justify-center">
                                                                            <Plane className="w-5 h-5 text-white" />
                                                                        </div>
                                                                        <div className="text-[11px] text-slate-600 font-bold text-center max-w-[100px] truncate">
                                                                            {seg.airlineName || "–"} (
                                                                            {seg.flightNumber || "—"})
                                                                        </div>
                                                                        <div className="text-[12px] text-blue-500 font-bold mt-0.5 flex items-center gap-1">
                                                                            <Clock className="w-3 h-3" />
                                                                            {seg.duration}
                                                                        </div>
                                                                    </div>
                                                                    <div className="text-right min-w-0">
                                                                        <div className="font-bold text-slate-800 text-[14px] truncate">
                                                                            {seg.toCity}, {seg.toCode}
                                                                        </div>
                                                                        <div className="text-[12px] text-slate-400 mb-2">
                                                                            {seg.toTerminal}
                                                                        </div>
                                                                        <div className="border border-slate-200 rounded-lg px-2.5 py-1 text-[13px] font-bold text-slate-700 inline-block">
                                                                            {seg.toTime}
                                                                            {seg.plusOneDay && (
                                                                                <span className="text-[#D60D26] ml-1 text-[11px]">
                                                                                    +1
                                                                                </span>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    setSegments((prev) =>
                                                                        prev.map((s, i) => {
                                                                            if (s.id !== seg.id) return s;
                                                                            const prevSeg =
                                                                                i > 0 ? prev[i - 1] : null;
                                                                            return {
                                                                                ...s,
                                                                                isEditing: true,
                                                                                ...(prevSeg?.toCode
                                                                                    ? {
                                                                                          fromCode: prevSeg.toCode,
                                                                                          fromCity: prevSeg.toCity,
                                                                                      }
                                                                                    : {}),
                                                                            };
                                                                        })
                                                                    );
                                                                }}
                                                                className="w-full bg-slate-50 text-slate-500 text-[13px] font-bold py-3 border-t border-slate-200 hover:bg-slate-100 transition-colors"
                                                            >
                                                                Edit segment
                                                            </button>
                                                        </div>
                                                        {index < segments.length - 1 &&
                                                            !segments[index + 1]?.isEditing && (
                                                                <div className="mt-2 bg-slate-100 border border-slate-200 rounded-xl px-4 py-2.5 flex justify-between items-center">
                                                                    <div className="text-[12px] font-bold text-slate-700 flex items-center gap-1.5">
                                                                        <Clock className="w-4 h-4" /> Layover{" "}
                                                                        {layoverBetween(seg, segments[index + 1])}
                                                                    </div>
                                                                    <button
                                                                        type="button"
                                                                        onClick={handleDeleteStop}
                                                                        className="text-[12px] font-bold text-slate-500 flex items-center gap-1 hover:text-[#D60D26] transition-colors"
                                                                    >
                                                                        <Trash2 className="w-3.5 h-3.5" /> Delete
                                                                        stop
                                                                    </button>
                                                                </div>
                                                            )}
                                                        {index === segments.length - 1 &&
                                                            segments.length > 1 && (
                                                                <div className="mt-2 bg-slate-100 border border-slate-200 rounded-xl px-4 py-2.5">
                                                                    <div className="text-[12px] font-bold text-slate-700 flex items-center gap-1.5">
                                                                        <Clock className="w-4 h-4" /> Total
                                                                        journey destination {calculatedDuration}
                                                                    </div>
                                                                </div>
                                                            )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
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
                                            <div className="mt-5">
                                                <label className="text-[12px] font-bold text-slate-500 mb-1.5 block">Hand baggage</label>
                                                <select
                                                    value={handBaggage}
                                                    onChange={(e) => setHandBaggage(e.target.value)}
                                                    className="w-full border border-slate-200 rounded-lg p-3.5 text-slate-700 font-medium outline-none bg-white shadow-sm"
                                                >
                                                    <option>7 kg</option>
                                                    <option>8 kg</option>
                                                    <option>10 kg</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {modalTab === 3 && (
                                <div className="flex flex-col items-center justify-center gap-6 py-8 animate-in fade-in duration-300">
                                    {isPnrMode && (
                                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm w-full max-w-[500px] overflow-hidden">
                                        <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 font-bold text-slate-700 text-[15px]">
                                            Add GPNR
                                        </div>
                                        <div className="p-6">
                                            <input
                                                type="text"
                                                value={groupPnr}
                                                onChange={(e) =>
                                                    setGroupPnr(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ""))
                                                }
                                                placeholder="GPNR"
                                                maxLength={32}
                                                className="w-full border border-slate-200 rounded-lg p-3.5 text-slate-700 font-bold tracking-wide outline-none shadow-sm uppercase focus:border-[#D60D26]"
                                            />
                                            <p className="mt-2 text-[12px] text-slate-400 font-medium">
                                                Optional group PNR for this inventory. Leave blank to auto-generate.
                                            </p>
                                        </div>
                                    </div>
                                    )}

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
                                                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-medium">₹</span>
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
                                            <div className="mt-4">
                                                <label className="text-[12px] font-bold text-slate-500 mb-1.5 block">Cabin class</label>
                                                <select
                                                    value={cabinClass}
                                                    onChange={(e) => setCabinClass(e.target.value)}
                                                    className="w-full border border-slate-200 rounded-lg p-3.5 text-slate-700 font-medium outline-none bg-white shadow-sm"
                                                >
                                                    <option>Economy</option>
                                                    <option>Premium Economy</option>
                                                    <option>Business</option>
                                                    <option>First</option>
                                                </select>
                                            </div>
                                            <div className="mt-4">
                                                <label className="text-[12px] font-bold text-slate-500 mb-1.5 block">Sales ending</label>
                                                <div className="text-[12px] text-slate-500 mb-2">End selling before departure</div>
                                                <div className="flex items-center gap-2">
                                                    <input
                                                        type="number"
                                                        min={0}
                                                        value={salesEndHours}
                                                        onChange={(e) => setSalesEndHours(e.target.value)}
                                                        className="w-20 border border-slate-200 rounded-lg px-3 py-2.5 text-[13px] font-bold text-slate-800"
                                                    />
                                                    <select
                                                        value={salesEndUnit}
                                                        onChange={(e) => setSalesEndUnit(e.target.value as "hours" | "days")}
                                                        className="border border-slate-200 rounded-lg px-3 py-2.5 text-[13px] font-bold text-slate-700 bg-white"
                                                    >
                                                        <option value="hours">hours</option>
                                                        <option value="days">days</option>
                                                    </select>
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

                        <div className="shrink-0 bg-slate-50 border-t border-slate-100">
                            <div className="p-4 sm:p-6 flex flex-row items-center justify-between gap-3 sm:gap-4">
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
                            <div className="px-6 pb-4 text-[13px] font-medium text-amber-600 leading-snug">
                                Confirm the segment in 1. Flight detail before finishing this flight.
                            </div>
                        )}
                        </div>
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
                                    if (schedulingLeg === "return") {
                                        returnSegmentsRef.current = segments;
                                        setScheduledReturn(segments);
                                        setHasScheduledReturnFlight(true);
                                        if (outboundSegmentsRef.current) {
                                            setSegments(outboundSegmentsRef.current);
                                            setSchedulingLeg("outbound");
                                        }
                                    } else {
                                        outboundSegmentsRef.current = segments;
                                        setScheduledOutbound(segments);
                                        setHasScheduledFlight(true);
                                    }
                                    setEditingAirport(null);
                                    setModalTab(1);
                                }} 
                                className="flex-1 bg-[#D60D26] text-white font-bold py-3.5 rounded-xl hover:bg-[#30060F] transition-colors flex items-center justify-center gap-2 shadow-sm"
                            >
                                Confirm Flight <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {seriesInfoOpen && (
                <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 p-4">
                    <div className="bg-white rounded-2xl w-full max-w-[520px] shadow-2xl overflow-hidden">
                        <div className="bg-rose-50 px-6 py-4 flex items-start justify-between">
                            <h3 className="font-extrabold text-[17px] text-slate-800">How flight series work</h3>
                            <button type="button" onClick={() => setSeriesInfoOpen(false)} className="p-1 rounded-full hover:bg-white/70">
                                <X className="w-5 h-5 text-slate-600" />
                            </button>
                        </div>
                        <div className="px-6 py-5 text-[14px] text-slate-600 space-y-3 leading-relaxed">
                            <p>
                                A flight series creates the same schedule across multiple operating dates
                                (for example every Monday between your FROM and TO dates).
                            </p>
                            <p>
                                On a one-way route, click <span className="font-bold text-[#D60D26]">Add flight series</span> to
                                show both calendars. Pick the series start on <span className="font-bold">FROM</span> and the
                                series end on <span className="font-bold">TO</span>.
                            </p>
                            <p>
                                Each matching weekday in that range becomes its own inventory row with the same seats, fare, and policies.
                            </p>
                        </div>
                        <div className="px-6 pb-6">
                            <button
                                type="button"
                                onClick={() => {
                                    setSeriesInfoOpen(false);
                                    handleAddFlightSeries();
                                }}
                                className="w-full bg-[#D60D26] hover:bg-[#30060F] text-white font-bold py-3 rounded-full"
                            >
                                Enable flight series
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {editingAirport && (
                <div
                    className="fixed inset-0 z-20"
                    onClick={() => setEditingAirport(null)}
                />
            )}
        </div>
    );
}
