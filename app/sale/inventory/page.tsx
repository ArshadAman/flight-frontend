"use client";

import React, { useEffect, useMemo, useState } from "react";
import { SaleNavbar } from "@/components/SaleNavbar";
import { Footer } from "@/components/Footer";
import { Filter, Plus, ArrowRight, X, Plane, ChevronDown, MoreVertical } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

type InventorySegment = {
    segment_id: number;
    airline_code: string;
    airline_name?: string;
    flight_number: string;
    origin: string;
    origin_city?: string;
    origin_terminal?: string;
    destination: string;
    destination_city?: string;
    destination_terminal?: string;
    departure_datetime: string;
    arrival_datetime: string;
    duration?: string;
    stop_over?: string | null;
    return_flight?: boolean;
};

type InventoryFlight = {
    id: string;
    airline_code: string;
    airline_name: string;
    flight_number: string;
    origin: string;
    destination: string;
    departure_datetime: string;
    arrival_datetime: string;
    price: string;
    seats_available: number;
    cabin_class: string;
    duration: string;
    is_refundable: boolean;
    baggage_check_in: string;
    baggage_hand: string;
    apis_required?: boolean;
    policies?: Record<string, string>;
    segments_data: InventorySegment[];
};

type GroupBookingApi = {
    id: string;
    request_id: string;
    group_name: string;
    status: string;
    origin: string;
    destination: string;
    departure_date: string;
    return_date?: string | null;
    trip_type: string;
    cabin_class: string;
    pax_adults: number;
    pax_children: number;
    pax_infants: number;
    expected_fare_per_pax: string;
    airline_preference?: string | null;
    timing_preference?: string | null;
    group_category?: string | null;
    pnr_number?: string | null;
    remarks?: string | null;
    total_paid?: string;
    payment_deadline?: string | null;
    balance_deadline?: string | null;
};

type TicketApi = {
    id: string;
    pnr_number?: string | null;
    ticket_number?: string | null;
    booking_ref?: string | null;
    flight_id?: string | null;
    status: string;
    origin: string;
    destination: string;
    departure_datetime: string;
    arrival_datetime: string;
    travel_type: number;
    airline_code: string;
    airline_name?: string | null;
    flight_number: string;
    cabin_class?: string | null;
    basic_amount?: string;
    tax_amount?: string;
    total_amount: string;
    currency?: string;
    baggage_check_in?: string | null;
    baggage_hand?: string | null;
    is_refundable?: boolean;
    food_onboard?: string | null;
    passengers_data?: any[];
    cancellation_data?: any;
    agent_cancellation_reason?: string;
};

type DrawerDetail = {
    label: string;
    value: string;
};

type DrawerRecord = {
    id: string;
    kind: "booking" | "ticket";
    title: string;
    subtitle: string;
    status: string;
    referenceLabel: string;
    referenceValue: string;
    amountLabel?: string;
    amountValue?: string;
    passengers?: any[];
    cancellationRemarks?: string;
    details: DrawerDetail[];
};

function formatMonthYear(dateString: string) {
    return new Date(dateString).toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
    });
}

function formatDisplayDate(dateString: string) {
    return new Date(dateString).toLocaleDateString("en-US", {
        weekday: "short",
        day: "numeric",
        month: "short",
        year: "2-digit",
    });
}

function formatDisplayDateLong(dateString: string) {
    return new Date(dateString).toLocaleDateString("en-US", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
    });
}

function formatTimeRange(start: string, end: string) {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const startTime = startDate.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
    });
    const endTime = endDate.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
    });
    const plusDay = endDate.toDateString() !== startDate.toDateString() ? "(+1)" : "";

    return `${startTime} - ${endTime}${plusDay}`;
}

function formatFare(amount: string) {
    const value = Number(amount);
    if (Number.isNaN(value)) return `INR ${amount}`;
    return `INR ${value.toFixed(2)}`;
}

function getInventoryReference(id: string) {
    return `INV-${id.slice(0, 8).toUpperCase()}`;
}

function normalizeApiList(data: unknown) {
    if (Array.isArray(data)) {
        return data;
    }

    if (data && typeof data === "object") {
        const payload = data as Record<string, unknown>;
        const candidateKeys = ["results", "data", "items", "bookings", "tickets"];

        for (const key of candidateKeys) {
            const value = payload[key];
            if (Array.isArray(value)) {
                return value;
            }
        }
    }

    return [] as unknown[];
}

function toIsoDate(value: string) {
    return new Date(value).toISOString().slice(0, 10);
}

function formatReadableDate(value: string) {
    return new Date(value).toLocaleDateString("en-US", {
        weekday: "short",
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
}

function buildBookingRecord(booking: GroupBookingApi): DrawerRecord {
    const totalPax = booking.pax_adults + booking.pax_children + booking.pax_infants;
    const expectedFare = Number(booking.expected_fare_per_pax || 0);
    const totalEstimate = Number.isNaN(expectedFare) ? booking.expected_fare_per_pax : formatFare(String(expectedFare * totalPax));

    return {
        id: booking.id,
        kind: "booking",
        title: booking.group_name,
        subtitle: `${booking.origin} → ${booking.destination}`,
        status: booking.status,
        referenceLabel: "Request ID",
        referenceValue: booking.request_id,
        amountLabel: "Est. value",
        amountValue: totalEstimate,
        details: [
            { label: "Trip type", value: booking.trip_type },
            { label: "Cabin class", value: booking.cabin_class },
            { label: "Passengers", value: `${totalPax} pax` },
            { label: "Departure date", value: formatReadableDate(booking.departure_date) },
            { label: "Airline preference", value: booking.airline_preference || "Any" },
            { label: "PNR", value: booking.pnr_number || "Not issued yet" },
            { label: "Paid", value: booking.total_paid ? formatFare(booking.total_paid) : formatFare("0") },
        ],
    };
}

function buildTicketRecord(ticket: TicketApi): DrawerRecord {
    const referenceValue = ticket.pnr_number || ticket.ticket_number || ticket.booking_ref || ticket.id;

    return {
        id: ticket.id,
        kind: "ticket",
        title: ticket.pnr_number || ticket.ticket_number || "Ticket",
        subtitle: `${ticket.origin} → ${ticket.destination}`,
        status: ticket.status,
        referenceLabel: ticket.pnr_number ? "PNR" : "Booking Ref",
        referenceValue,
        amountLabel: "Total amount",
        amountValue: formatFare(ticket.total_amount),
        passengers: ticket.passengers_data || [],
        cancellationRemarks: ticket.cancellation_data?.remarks || ticket.agent_cancellation_reason || "",
        details: [
            { label: "Flight number", value: ticket.flight_number },
            { label: "Airline", value: ticket.airline_name || ticket.airline_code || "Unknown" },
            { label: "Cabin class", value: ticket.cabin_class || "Unknown" },
            { label: "Departure", value: formatDisplayDateLong(ticket.departure_datetime) },
            { label: "Arrival", value: formatDisplayDateLong(ticket.arrival_datetime) },
            { label: "Ticket number", value: ticket.ticket_number || "Not issued" },
            { label: "Baggage", value: `${ticket.baggage_check_in || "-"} / ${ticket.baggage_hand || "-"}` },
        ],
    };
}

function normalizeInventoryFlights(data: unknown): InventoryFlight[] | null {
    if (Array.isArray(data)) {
        return data as InventoryFlight[];
    }

    if (data && typeof data === "object") {
        const payload = data as Record<string, unknown>;
        const candidateKeys = ["results", "data", "items", "inventory", "flights"];

        for (const key of candidateKeys) {
            const value = payload[key];
            if (Array.isArray(value)) {
                return value as InventoryFlight[];
            }
        }

        const maybeFlight = payload as Partial<InventoryFlight>;
        if (
            typeof maybeFlight.id === "string" &&
            typeof maybeFlight.origin === "string" &&
            typeof maybeFlight.destination === "string" &&
            typeof maybeFlight.departure_datetime === "string"
        ) {
            return [maybeFlight as InventoryFlight];
        }
    }

    return null;
}

function extractInventoryErrorMessage(data: unknown): string | null {
    if (!data || typeof data !== "object") {
        return null;
    }

    const payload = data as Record<string, unknown>;
    const detail = payload.detail;

    return typeof detail === "string" ? detail : null;
}

export default function InventoryPage() {
    const { access, refreshAccess } = useAuth();
    const [inventoryFlights, setInventoryFlights] = useState<InventoryFlight[]>([]);
    const [groupBookings, setGroupBookings] = useState<GroupBookingApi[]>([]);
    const [tickets, setTickets] = useState<TicketApi[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);
    const [selectedFlight, setSelectedFlight] = useState<InventoryFlight | null>(null);
    const [activeDrawerTab, setActiveDrawerTab] = useState("Segment");
    const [selectedBooking, setSelectedBooking] = useState<DrawerRecord | null>(null);
    const [drawerDataLoading, setDrawerDataLoading] = useState(true);
    const [drawerDataError, setDrawerDataError] = useState<string | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    // Booking actions state
    const [pnrNumber, setPnrNumber] = useState("");
    const [ticketNumber, setTicketNumber] = useState("");
    const [cancelRemarks, setCancelRemarks] = useState("");
    const [fulfillingTicketId, setFulfillingTicketId] = useState<string | null>(null);
    const [cancellingTicketId, setCancellingTicketId] = useState<string | null>(null);
    const [actionError, setActionError] = useState<string | null>(null);
    const [actionSuccess, setActionSuccess] = useState<string | null>(null);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const handleFulfillSubmit = async (ticketId: string) => {
        setActionError(null);
        setActionSuccess(null);
        if (!pnrNumber.trim() || !ticketNumber.trim()) {
            setActionError("Please enter both PNR and Ticket numbers.");
            return;
        }

        try {
            const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8001/api/v1";
            const res = await fetch(`${apiBase}/tickets/${ticketId}/agent-fulfill/`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${access}`,
                },
                body: JSON.stringify({
                    pnr_number: pnrNumber.trim(),
                    ticket_number: ticketNumber.trim(),
                }),
            });

            if (!res.ok) {
                const errData = await res.json().catch(() => ({}));
                throw new Error(errData.detail || "Fulfillment failed.");
            }

            setActionSuccess("Booking request fulfilled and PNR issued!");
            setFulfillingTicketId(null);
            setPnrNumber("");
            setTicketNumber("");
            setSelectedBooking(prev => {
                if (!prev) return null;
                return {
                    ...prev,
                    status: "CONFIRMED",
                    title: pnrNumber.trim(),
                    details: prev.details.map(d => d.label === "Ticket number" ? { ...d, value: ticketNumber.trim() } : d)
                };
            });
            setRefreshTrigger(prev => prev + 1);
        } catch (err: any) {
            setActionError(err.message || "Fulfillment failed");
        }
    };

    const handleCancelSubmit = async (ticketId: string) => {
        setActionError(null);
        setActionSuccess(null);
        if (!cancelRemarks.trim()) {
            setActionError("Please enter a reason for cancellation.");
            return;
        }

        try {
            const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8001/api/v1";
            const res = await fetch(`${apiBase}/tickets/${ticketId}/agent-cancel/`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${access}`,
                },
                body: JSON.stringify({
                    remarks: cancelRemarks.trim(),
                }),
            });

            if (!res.ok) {
                const errData = await res.json().catch(() => ({}));
                throw new Error(errData.detail || "Cancellation failed.");
            }

            setActionSuccess("Booking request rejected / cancelled.");
            setCancellingTicketId(null);
            setCancelRemarks("");
            setSelectedBooking(prev => {
                if (!prev) return null;
                return {
                    ...prev,
                    status: "CANCELLED",
                    cancellationRemarks: cancelRemarks.trim()
                };
            });
            setRefreshTrigger(prev => prev + 1);
        } catch (err: any) {
            setActionError(err.message || "Cancellation failed");
        }
    };

    useEffect(() => {
        if (!access) {
            setIsLoading(false);
            return;
        }

        const controller = new AbortController();

        const loadInventory = async () => {
            setIsLoading(true);
            setLoadError(null);

            try {
                const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8001/api/v1";
                const fetchInventory = (token: string) => fetch(`${apiBase}/flights/inventory/`, {
                    headers: {
                        "Authorization": `Bearer ${token}`,
                    },
                    signal: controller.signal,
                });

                let response = await fetchInventory(access);

                if (response.status === 401) {
                    const refreshed = await refreshAccess();
                    if (refreshed) {
                        const retryToken = window.localStorage.getItem("access_token") || access;
                        response = await fetchInventory(retryToken);
                    }
                }

                if (!response.ok) {
                    const errorBody = await response.json().catch(() => null);
                    const errorMessage = extractInventoryErrorMessage(errorBody)
                        || (response.status === 401
                            ? "Your session expired. Please sign in again to view inventory."
                            : `Failed to load inventory (${response.status}).`);
                    throw new Error(errorMessage);
                }

                const data: unknown = await response.json();
                const flights = normalizeInventoryFlights(data);

                if (flights) {
                    setInventoryFlights(flights);
                    return;
                }

                const errorMessage = extractInventoryErrorMessage(data);
                if (errorMessage) {
                    throw new Error(errorMessage);
                }

                setInventoryFlights([]);
            } catch (error: unknown) {
                if (controller.signal.aborted) return;
                const errorMessage = error instanceof Error ? error.message : "Failed to load inventory.";
                setLoadError(errorMessage);
                setInventoryFlights([]);
            } finally {
                if (!controller.signal.aborted) {
                    setIsLoading(false);
                }
            }
        };

        loadInventory();

        return () => controller.abort();
    }, [access]);

    useEffect(() => {
        if (!access) {
            setGroupBookings([]);
            setTickets([]);
            setDrawerDataLoading(false);
            return;
        }

        const controller = new AbortController();

        const fetchAuthedJson = async (path: string) => {
            const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8001/api/v1";
            const request = (token: string | null) => fetch(`${apiBase}${path}`, {
                headers: {
                    "Authorization": `Bearer ${token}`,
                },
                signal: controller.signal,
            });

            let response = await request(access);

            if (response.status === 401) {
                const refreshed = await refreshAccess();
                if (refreshed) {
                    const retryToken = window.localStorage.getItem("access_token") || access;
                    response = await request(retryToken);
                }
            }

            const body = await response.json().catch(() => null);
            if (!response.ok) {
                const message = extractInventoryErrorMessage(body) || `Failed to load drawer data (${response.status}).`;
                throw new Error(message);
            }

            return body;
        };

        const loadDrawerData = async () => {
            setDrawerDataLoading(true);
            setDrawerDataError(null);

            try {
                const [bookingsResult, ticketsResult] = await Promise.allSettled([
                    fetchAuthedJson("/bookings/group-bookings/"),
                    fetchAuthedJson("/tickets/"),
                ]);

                if (bookingsResult.status === "fulfilled") {
                    setGroupBookings(normalizeApiList(bookingsResult.value) as GroupBookingApi[]);
                } else {
                    setGroupBookings([]);
                }

                if (ticketsResult.status === "fulfilled") {
                    setTickets(normalizeApiList(ticketsResult.value) as TicketApi[]);
                } else {
                    setTickets([]);
                }

                if (bookingsResult.status === "rejected" && ticketsResult.status === "rejected") {
                    throw new Error(bookingsResult.reason instanceof Error ? bookingsResult.reason.message : "Failed to load drawer data.");
                }
            } catch (error: unknown) {
                if (controller.signal.aborted) return;
                const errorMessage = error instanceof Error ? error.message : "Failed to load drawer data.";
                setDrawerDataError(errorMessage);
                setGroupBookings([]);
                setTickets([]);
            } finally {
                if (!controller.signal.aborted) {
                    setDrawerDataLoading(false);
                }
            }
        };

        loadDrawerData();

        return () => controller.abort();
    }, [access, refreshAccess, refreshTrigger]);

    const groupedFlights = useMemo(() => {
        return inventoryFlights.reduce((groups, flight) => {
            const monthKey = formatMonthYear(flight.departure_datetime);
            groups[monthKey] = groups[monthKey] || [];
            groups[monthKey].push(flight);
            return groups;
        }, {} as Record<string, InventoryFlight[]>);
    }, [inventoryFlights]);

    const selectedFlightDate = selectedFlight ? toIsoDate(selectedFlight.departure_datetime) : null;

    const drawerBookingRecords = useMemo(() => {
        if (!selectedFlightDate || !selectedFlight) return [];

        const bookingsFiltered = groupBookings
            .filter((booking) => booking.origin === selectedFlight.origin && booking.destination === selectedFlight.destination && booking.departure_date === selectedFlightDate)
            .map(buildBookingRecord);

        const ticketsFiltered = tickets
            .filter((ticket) => ticket.origin === selectedFlight.origin && ticket.destination === selectedFlight.destination && toIsoDate(ticket.departure_datetime) === selectedFlightDate)
            .map(buildTicketRecord);

        return [...bookingsFiltered, ...ticketsFiltered];
    }, [groupBookings, tickets, selectedFlight, selectedFlightDate]);

    const selectedSegments = selectedFlight?.segments_data?.length
        ? selectedFlight.segments_data
        : [];

    const renderFlightRow = (flight: InventoryFlight) => (
        <div 
            key={flight.id}
            onClick={() => { setSelectedFlight(flight); setActiveDrawerTab("Segment"); }}
            className={`grid grid-cols-[1fr_1.5fr_1fr_1fr_1fr_1fr_1fr_1fr_auto] gap-4 items-center py-4 border-b border-slate-100 text-[13px] font-medium transition-colors px-6 cursor-pointer ${selectedFlight === flight ? 'bg-rose-50 border-l-2 border-l-[#D60D26]' : 'text-slate-700 hover:bg-slate-50'}`}
        >
            <div className="font-bold text-slate-800">{getInventoryReference(flight.id)}</div>
            <div className="flex items-center gap-1">
                <span className="font-bold">{flight.origin}</span>
                <ArrowRight className="w-3 h-3 text-slate-400" />
                <span className="font-bold">{flight.destination}</span>
                <span className="text-slate-400 text-[12px] font-medium">({Math.max(0, (flight.segments_data?.length || 1) - 1)})</span>
            </div>
            <div className="text-slate-800">{formatDisplayDate(flight.departure_datetime)}</div>
            <div className="text-slate-800">{formatTimeRange(flight.departure_datetime, flight.arrival_datetime)}</div>
            <div className="font-bold text-slate-800">{flight.flight_number}</div>
            <div className="flex items-center gap-1 font-bold text-slate-700"><span className="text-slate-400">💺</span> {flight.seats_available}</div>
            <div className="font-bold text-slate-800">{formatFare(flight.price)}</div>
            <div>
                <span className="px-4 py-1.5 rounded-full text-[12px] font-bold border bg-green-50 text-emerald-600 border-green-200">
                    Open
                </span>
            </div>
            <div className="text-slate-400 hover:text-slate-600 transition-colors flex justify-end">
                <MoreVertical className="w-5 h-5" />
            </div>
        </div>
    );

    return (
        <div className="w-full min-h-screen bg-slate-50 flex flex-col font-sans">
            <SaleNavbar />

            {/* Main Content with Drawer Flex */}
            <div className="flex-1 w-full flex overflow-hidden relative">
                <main className={`flex-1 overflow-y-auto transition-all duration-300 flex flex-col items-center ${selectedFlight ? 'xl:pr-[450px]' : ''}`}>
                    <div className="container mx-auto px-6 lg:px-10 py-6 w-full max-w-[1400px]">
                    
                    {/* Header Controls */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 w-full">
                        <button className="flex items-center gap-2 text-[#D60D26] font-bold hover:bg-rose-50 px-4 py-2 rounded-lg transition-colors w-full sm:w-auto justify-center border border-rose-100 sm:border-transparent">
                            <Filter className="w-5 h-5" /> Filters
                        </button>
                        
                        <Link href="/sale/inventory/new" className="bg-[#D60D26] hover:bg-[#D60D26] text-white px-6 py-2.5 rounded-full font-bold text-[14px] transition-colors shadow-sm flex items-center justify-center gap-2 w-full sm:w-auto">
                            <Plus className="w-4 h-4" /> Add Inventory
                        </Link>
                    </div>

                    {/* Flights Table */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mb-8">
                        <div className="overflow-x-auto no-scrollbar">
                            <div className="w-full min-w-[1000px]">
                                {/* Table Header */}
                                <div className="grid grid-cols-[1fr_1.5fr_1fr_1fr_1fr_1fr_1fr_1fr_auto] gap-4 px-6 py-4 border-b border-slate-100 bg-white text-slate-400 text-[13px] font-bold">
                                    <div>Inventory Ref</div>
                                    <div>Route</div>
                                    <div>Dep. Date</div>
                                    <div>Dep. & Arr.</div>
                                    <div>Flight number</div>
                                    <div>No. of seats</div>
                                    <div>Ticket price</div>
                                    <div>Status</div>
                                    <div className="w-5"></div>
                                </div>

                                {isLoading && (
                                    <div className="px-6 py-10 text-center text-slate-500 font-medium">
                                        Loading real inventory...
                                    </div>
                                )}

                                {!isLoading && loadError && (
                                    <div className="px-6 py-10 text-center text-rose-600 font-medium">
                                        {loadError}
                                    </div>
                                )}

                                {!isLoading && !loadError && inventoryFlights.length === 0 && (
                                    <div className="px-6 py-10 text-center text-slate-500 font-medium">
                                        No inventory flights found yet.
                                    </div>
                                )}

                                {!isLoading && !loadError && Object.entries(groupedFlights).map(([monthLabel, flights]) => (
                                    <div key={monthLabel}>
                                        <div className="bg-[#F2FBFF] px-6 py-3 font-bold text-slate-700 text-[14px]">
                                            {monthLabel}
                                        </div>
                                        <div className="flex flex-col">
                                            {flights.map((flight) => renderFlightRow(flight))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Pagination Footer */}
                        <div className="px-6 py-4 flex items-center justify-between border-t border-slate-100 bg-white">
                            <div className="text-slate-500 text-[13px]">
                                <span className="font-bold text-slate-700">{inventoryFlights.length}</span> real inventory results
                            </div>
                            <div className="flex items-center gap-4">
                                <button className="text-slate-400 font-bold text-[14px] hover:text-slate-600 cursor-not-allowed">Prev</button>
                                <button className="text-slate-800 font-bold text-[14px] border border-slate-300 rounded-full px-6 py-1.5 hover:bg-slate-50 transition-colors">Next</button>
                            </div>
                        </div>
                    </div>

                </div>
            </main>

            {/* Right Drawer */}
            {selectedFlight && (
                <div className="w-full xl:w-[450px] bg-white border-l border-slate-200 fixed top-0 xl:top-[96px] right-0 bottom-0 z-50 xl:z-40 flex flex-col shadow-2xl animate-in slide-in-from-right duration-300">
                    <div className="p-6 bg-slate-50 border-b border-slate-200 flex items-start justify-between shrink-0">
                        <div>
                            <div className="font-bold text-[16px] text-slate-800 flex items-center gap-2">
                                {selectedFlight.origin} <ArrowRight className="w-4 h-4 text-[#D60D26]" /> {selectedFlight.destination}
                            </div>
                            <div className="text-[13px] text-slate-500 mt-1">{formatDisplayDateLong(selectedFlight.departure_datetime)}</div>
                        </div>
                        <button onClick={() => setSelectedFlight(null)} className="hover:bg-slate-200 p-1 rounded-full transition-colors"><X className="w-5 h-5 text-slate-700" /></button>
                    </div>
                    
                    <div className="flex items-center border-b border-slate-200 shrink-0 bg-white px-2 overflow-x-auto no-scrollbar">
                        {[
                            { key: "Segment", label: "Segment" },
                            { key: "Inventory", label: "Inventory" },
                            { key: "Bookings", label: `Bookings (${drawerBookingRecords.length})` },
                        ].map((tab) => (
                            <button 
                                key={tab.key} 
                                onClick={() => setActiveDrawerTab(tab.key)} 
                                className={`flex-1 px-4 py-4 font-bold text-[13px] whitespace-nowrap transition-colors ${activeDrawerTab === tab.key ? 'text-[#D60D26] bg-rose-50 border-b-2 border-[#D60D26]' : 'text-slate-600 hover:bg-slate-50'}`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {activeDrawerTab === "Segment" && (
                        <>
                            <div className="flex-1 overflow-y-auto p-6 bg-white">
                                {selectedSegments.map((segment, index) => (
                                    <div key={`${selectedFlight.id}-${segment.segment_id}`} className="mb-8">
                                        <div className="font-bold text-[16px] text-slate-800 mb-6">
                                            {segment.origin} <span className="text-slate-400 font-medium">{segment.origin_city || ""}</span>
                                        </div>

                                        <div className="flex gap-4 relative mb-6">
                                            <div className="w-px bg-slate-300 absolute left-1.5 top-2 bottom-2"></div>
                                            <div className="w-3 h-3 rounded-full bg-slate-800 relative z-10 shrink-0 mt-1"></div>
                                            <div className="flex-1">
                                                <div className="text-[13px] text-slate-700 font-bold mb-4">
                                                    {new Date(segment.departure_datetime).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false })}
                                                    <span className="text-[#D60D26] mx-1">•</span>
                                                    {segment.origin}
                                                    <span className="text-[#D60D26] mx-1">•</span>
                                                    {segment.origin_terminal || "Terminal"}
                                                </div>

                                                <div className="flex items-center gap-4 py-6">
                                                    <div className="w-8 h-8 bg-[#D60D26] rounded flex items-center justify-center shrink-0 shadow-sm relative -ml-[22px]">
                                                        <Plane className="w-4 h-4 text-white -rotate-45" />
                                                    </div>
                                                    <div className="flex items-center gap-4 text-[13px] font-bold text-blue-600">
                                                        <span>{segment.duration || selectedFlight.duration}</span>
                                                        {segment.stop_over && (
                                                            <button className="flex items-center gap-1 text-[#D60D26] underline underline-offset-2">
                                                                {segment.stop_over} <ChevronDown className="w-4 h-4" />
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex gap-4 relative mb-8">
                                            <div className="w-3 h-3 rounded-full border-2 border-slate-800 bg-white relative z-10 shrink-0 mt-1"></div>
                                            <div className="flex-1">
                                                <div className="text-[13px] text-slate-700 font-bold">
                                                    {new Date(segment.arrival_datetime).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false })}
                                                    <span className="text-[#D60D26] mx-1">•</span>
                                                    {segment.destination}
                                                    <span className="text-[#D60D26] mx-1">•</span>
                                                    {segment.destination_terminal || "Terminal"}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="font-bold text-[16px] text-slate-800 mt-2">
                                            {segment.destination} <span className="text-slate-400 font-medium">{segment.destination_city || ""}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="p-6 border-t border-slate-100 bg-slate-50 flex flex-col items-center gap-2 shrink-0">
                                <button className="text-slate-400 font-bold flex items-center gap-2 text-[14px] cursor-not-allowed">
                                    Cancel Flight <X className="w-4 h-4" />
                                </button>
                                <div className="text-[12px] text-slate-400">Only open & pending flight can be cancel</div>
                            </div>
                        </>
                    )}

                    {activeDrawerTab === "Inventory" && (
                        <div className="flex-1 overflow-y-auto p-6 space-y-10 bg-white">
                            {/* Baggage */}
                            <div>
                                <div className="font-bold text-[15px] text-slate-800 mb-4">Baggage</div>
                                <div className="text-[13px] font-bold text-slate-700 mb-2 flex items-center gap-2">
                                    <svg className="w-4 h-4 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
                                    Checked baggage options
                                </div>
                                <input 
                                    type="text" 
                                    value={`${selectedFlight.baggage_check_in || "23 kg"}, ${selectedFlight.baggage_hand || "7 kg"} hand, ${selectedFlight.is_refundable ? "Refundable" : "Non-refundable"}`} 
                                    readOnly 
                                    className="w-full border border-slate-200 rounded-lg p-3 text-[14px] font-bold text-slate-600 bg-white shadow-sm outline-none" 
                                />
                            </div>

                            {/* Tickets Volume */}
                            <div>
                                <div className="flex items-center justify-between mb-4">
                                    <div className="font-bold text-[15px] text-slate-800">Tickets Volume</div>
                                    <button onClick={() => setIsEditModalOpen(true)} className="flex items-center gap-1 text-[13px] font-bold text-slate-400 hover:text-slate-600">
                                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg> Edit
                                    </button>
                                </div>
                                <div className="grid grid-cols-3 gap-3">
                                    <div className="border border-slate-200 rounded-xl p-4 flex flex-col items-center justify-center bg-white shadow-sm">
                                        <div className="font-bold text-[#D60D26] text-[18px]">{selectedFlight.seats_available}</div>
                                        <div className="text-[12px] font-medium text-slate-500 mt-1">Available</div>
                                    </div>
                                </div>
                            </div>

                            {/* Price */}
                            <div>
                                <div className="font-bold text-[15px] text-slate-800 mb-4">Price</div>
                                <div className="flex items-center gap-2 text-[#D60D26] font-bold text-[13px] mb-4">
                                    <ArrowRight className="w-4 h-4" /> ONE WAY
                                </div>
                                <label className="text-[12px] font-bold text-slate-500 mb-1.5 block">Price (INR)</label>
                                <div className="relative">
                                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-medium">₹</span>
                                    <input type="text" value={Number(selectedFlight.price).toFixed(2)} readOnly className="w-full border border-slate-200 rounded-lg p-3.5 pl-8 text-[14px] font-bold text-slate-600 bg-white shadow-sm outline-none" />
                                </div>
                            </div>
                        </div>
                    )}

                    {activeDrawerTab === "Bookings" && (
                        <div className="flex-1 overflow-y-auto p-6 bg-white">
                            <div className="font-bold text-[15px] text-slate-800 mb-4">Bookings</div>
                            {drawerDataLoading && (
                                <div className="text-slate-500 font-medium text-[13px]">Loading live bookings...</div>
                            )}
                            {!drawerDataLoading && drawerDataError && (
                                <div className="text-rose-600 font-medium text-[13px]">{drawerDataError}</div>
                            )}
                            {!drawerDataLoading && !drawerDataError && drawerBookingRecords.length === 0 && (
                                <div className="text-slate-500 font-medium text-[13px]">No live bookings found for this route.</div>
                            )}
                            <div className="space-y-4">
                                {!drawerDataLoading && !drawerDataError && drawerBookingRecords.map((record) => (
                                    <button
                                        key={record.id}
                                        onClick={() => {
                                            setSelectedBooking(record);
                                            setActionError(null);
                                            setActionSuccess(null);
                                            setFulfillingTicketId(null);
                                            setCancellingTicketId(null);
                                        }}
                                        className="w-full text-left cursor-pointer hover:bg-slate-50 p-3 rounded-xl transition-colors border border-transparent hover:border-slate-100"
                                    >
                                        <div className="flex items-center justify-between gap-3 mb-1.5">
                                            <div className="flex items-center gap-2 font-bold text-slate-700 text-[14px]">
                                                {record.title}
                                                <span className="text-slate-500 font-normal">({record.subtitle})</span>
                                            </div>
                                            <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${
                                                record.status === "CONFIRMED" || record.status === "SUCCESS"
                                                    ? "bg-emerald-50 text-emerald-600 border-emerald-200"
                                                    : record.status === "PENDING"
                                                    ? "bg-amber-50 text-amber-600 border-amber-200"
                                                    : "bg-slate-50 text-slate-500 border-slate-200"
                                            }`}>
                                                {record.status}
                                            </span>
                                        </div>
                                        <div className="text-[13px] font-medium text-slate-500 flex flex-wrap items-center gap-x-2 gap-y-1">
                                            <span>{record.referenceLabel}: {record.referenceValue}</span>
                                            {record.amountValue && (
                                                <>
                                                    <span className="text-slate-300">•</span>
                                                    <span>{record.amountValue}</span>
                                                </>
                                            )}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
            </div>

            {/* Booking Details Modal */}
            {selectedBooking && (
                <div className="fixed inset-0 z-[60] overflow-y-auto bg-black/40 backdrop-blur-sm animate-in fade-in duration-200 p-4 flex justify-center items-start md:items-center">
                    <div className="bg-white rounded-2xl w-full max-w-[550px] shadow-2xl overflow-hidden flex flex-col my-8 md:my-auto max-h-[85vh]">
                        <div className="bg-[#F2FBFF] p-6 relative shrink-0 border-b border-green-100">
                            <button onClick={() => setSelectedBooking(null)} className="absolute top-6 right-6 text-slate-500 hover:bg-white/50 p-1 rounded-full"><X className="w-5 h-5" /></button>
                            <div className="flex items-center gap-3 mb-2">
                                <span className="font-extrabold text-[20px] text-slate-800">{selectedBooking.title}</span>
                                <span className="text-emerald-600 font-bold text-[14px]">{selectedBooking.status}</span>
                            </div>
                            <div className="text-slate-500 font-medium text-[13px]">{selectedBooking.subtitle}</div>
                        </div>
                        
                        <div className="p-6 overflow-y-auto bg-white flex-1 space-y-8">
                            <div>
                                <div className="font-bold text-[15px] text-slate-800 mb-4">Details</div>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between py-2.5 border-b border-slate-100">
                                        <div className="flex items-center gap-2 text-[13px] font-bold text-slate-600">
                                            <div className="w-3 h-3 bg-slate-300 rounded-sm"></div> {selectedBooking.referenceLabel}
                                        </div>
                                        <div className="font-bold text-slate-800 text-[13px]">{selectedBooking.referenceValue}</div>
                                    </div>
                                    {selectedBooking.amountValue && (
                                        <div className="flex items-center justify-between py-2.5 border-b border-slate-100">
                                            <div className="flex items-center gap-2 text-[13px] font-bold text-slate-600">
                                                <div className="w-3 h-3 bg-[#D60D26] rounded-sm"></div> {selectedBooking.amountLabel}
                                            </div>
                                            <div className="font-bold text-slate-800 text-[13px]">{selectedBooking.amountValue}</div>
                                        </div>
                                    )}
                                    {selectedBooking.details.map((detail) => (
                                        <div key={detail.label} className="flex items-center justify-between py-2.5 border-b border-slate-100">
                                            <div className="flex items-center gap-2 text-[13px] font-bold text-slate-600">
                                                <div className="w-3 h-3 bg-slate-200 rounded-sm"></div> {detail.label}
                                            </div>
                                            <div className="font-bold text-slate-800 text-[13px] text-right">{detail.value}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Passenger Manifest */}
                            {selectedBooking.passengers && selectedBooking.passengers.length > 0 && (
                                <div>
                                    <div className="font-bold text-[15px] text-slate-800 mb-4">Passenger Manifest</div>
                                    <div className="space-y-3">
                                        {selectedBooking.passengers.map((pax: any, idx: number) => (
                                            <div key={idx} className="bg-slate-50 rounded-xl p-3 border border-slate-200/60 text-xs font-semibold">
                                                <span className="text-[#0C2342] font-black block text-[13px] mb-1">
                                                    {pax.title} {pax.first_name} {pax.last_name}
                                                </span>
                                                <div className="flex flex-wrap gap-4 text-slate-500 mt-1">
                                                    <span>Gender: {pax.gender === "M" ? "Male" : "Female"}</span>
                                                    {pax.dob && <span>DOB: {pax.dob}</span>}
                                                    {pax.passport_number && (
                                                        <span>Passport: {pax.passport_number}</span>
                                                    )}
                                                    {pax.pancard_number && (
                                                        <span>PAN: {pax.pancard_number}</span>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Booking Type */}
                            <div>
                                <div className="font-bold text-[15px] text-slate-800 mb-4">Booking Type</div>
                                <div className="border border-slate-200 rounded-xl p-4 flex items-center justify-between bg-slate-50 shadow-sm">
                                    <div>
                                        <div className="font-bold text-slate-700 text-[14px]">{selectedBooking.kind === "booking" ? "Group Booking Request" : "Individual Ticket Booking"}</div>
                                        <div className="text-[12px] text-slate-400 mt-1 font-medium">Live data from the backend API</div>
                                    </div>
                                </div>
                            </div>

                            {/* Ancillaries / Status */}
                            <div>
                                <div className="font-bold text-[15px] text-slate-800 mb-4">Ancillaries</div>
                                <div className="flex items-center justify-between py-2 border-b border-slate-100">
                                    <div className="flex items-center gap-3">
                                        <svg className="w-5 h-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
                                        <div>
                                            <div className="font-bold text-slate-700 text-[14px]">Reference status</div>
                                            <div className="text-[12px] text-slate-400 font-medium mt-0.5">{selectedBooking.status}</div>
                                        </div>
                                    </div>
                                    <div className="font-bold text-blue-600 text-[12px]">LIVE</div>
                                </div>
                            </div>

                            {/* Action Feedback Messages */}
                            {actionSuccess && (
                                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-[13px] font-semibold flex items-center gap-2">
                                    <span>✅</span> {actionSuccess}
                                </div>
                            )}
                            {actionError && (
                                <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-850 text-[13px] font-semibold flex items-center gap-2">
                                    <span>⚠️</span> {actionError}
                                </div>
                            )}

                            {/* Ticket Specific Interactive Agent Panel */}
                            {selectedBooking.kind === "ticket" && (
                                <div className="space-y-4">
                                    {/* Pending controls */}
                                    {selectedBooking.status === "PENDING" && (
                                        <div className="border-t border-slate-100 pt-4 space-y-4">
                                            {fulfillingTicketId !== selectedBooking.id && cancellingTicketId !== selectedBooking.id && (
                                                <div className="flex justify-end gap-3">
                                                    <button
                                                        onClick={() => {
                                                            setCancellingTicketId(selectedBooking.id);
                                                            setFulfillingTicketId(null);
                                                            setCancelRemarks("");
                                                            setActionError(null);
                                                            setActionSuccess(null);
                                                        }}
                                                        className="border border-rose-200 text-[#D60D26] hover:bg-rose-50 rounded-xl font-bold px-6 py-2.5 text-xs transition-colors"
                                                    >
                                                        Reject Booking
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            setFulfillingTicketId(selectedBooking.id);
                                                            setCancellingTicketId(null);
                                                            setPnrNumber("");
                                                            setTicketNumber("");
                                                            setActionError(null);
                                                            setActionSuccess(null);
                                                        }}
                                                        className="bg-[#0C2342] hover:bg-slate-800 text-white rounded-xl font-bold px-8 py-2.5 text-xs transition-colors"
                                                    >
                                                        Fulfill Request
                                                    </button>
                                                </div>
                                            )}

                                            {/* Fulfill Input Form */}
                                            {fulfillingTicketId === selectedBooking.id && (
                                                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 animate-in fade-in duration-300 space-y-4 shadow-sm">
                                                    <h5 className="text-xs font-black text-[#0C2342] uppercase tracking-wider">
                                                        Fulfill Seat Purchase
                                                    </h5>
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                        <div>
                                                            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                                                                Airline PNR
                                                            </label>
                                                            <input
                                                                type="text"
                                                                value={pnrNumber}
                                                                onChange={(e) => setPnrNumber(e.target.value)}
                                                                placeholder="e.g. Z9FB32"
                                                                className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2 font-semibold text-sm focus:outline-none text-[#0C2342] uppercase"
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                                                                Ticket Number
                                                            </label>
                                                            <input
                                                                type="text"
                                                                value={ticketNumber}
                                                                onChange={(e) => setTicketNumber(e.target.value)}
                                                                placeholder="e.g. 982-1249301290"
                                                                className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2 font-semibold text-sm focus:outline-none text-[#0C2342]"
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="flex justify-end gap-2 pt-2">
                                                        <button
                                                            onClick={() => setFulfillingTicketId(null)}
                                                            className="text-slate-500 hover:text-slate-700 font-bold rounded-lg px-4 py-2 text-xs transition-colors"
                                                        >
                                                            Cancel
                                                        </button>
                                                        <button
                                                            onClick={() => handleFulfillSubmit(selectedBooking.id)}
                                                            className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold px-6 py-2 text-xs transition-colors"
                                                        >
                                                            Issue Tickets
                                                        </button>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Rejection Form */}
                                            {cancellingTicketId === selectedBooking.id && (
                                                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 animate-in fade-in duration-300 space-y-4 shadow-sm">
                                                    <h5 className="text-xs font-black text-[#0C2342] uppercase tracking-wider">
                                                        Reject Booking Request
                                                    </h5>
                                                    <div>
                                                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                                                            Reason for Rejection / Remarks
                                                        </label>
                                                        <input
                                                            type="text"
                                                            value={cancelRemarks}
                                                            onChange={(e) => setCancelRemarks(e.target.value)}
                                                            placeholder="e.g. Seats sold out / flight schedule changed"
                                                            className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2.5 font-semibold text-sm focus:outline-none text-[#0C2342]"
                                                        />
                                                    </div>
                                                    <div className="flex justify-end gap-2 pt-2">
                                                        <button
                                                            onClick={() => setCancellingTicketId(null)}
                                                            className="text-slate-500 hover:text-slate-700 font-bold rounded-lg px-4 py-2 text-xs transition-colors"
                                                        >
                                                            Cancel
                                                        </button>
                                                        <button
                                                            onClick={() => handleCancelSubmit(selectedBooking.id)}
                                                            className="bg-[#D60D26] hover:bg-rose-700 text-white rounded-lg font-bold px-6 py-2 text-xs transition-colors"
                                                        >
                                                            Confirm Rejection
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Confirmed details banner */}
                                    {selectedBooking.status === "CONFIRMED" && (
                                        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl p-4">
                                            <span className="text-emerald-600 block uppercase font-black tracking-wider text-[9px] mb-1.5">
                                                Issued Ticket Details
                                            </span>
                                            <div className="space-y-1.5 mt-1 text-[#0C2342] text-xs font-bold">
                                                <div>Airline PNR: <span className="font-extrabold text-[13px] uppercase text-slate-800">{selectedBooking.title || "N/A"}</span></div>
                                                <div>Ticket Number: <span className="font-extrabold text-[13px] text-slate-800">{selectedBooking.details.find(d => d.label === "Ticket number")?.value || "N/A"}</span></div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Cancelled details banner */}
                                    {selectedBooking.status === "CANCELLED" && (
                                        <div className="bg-rose-50 border border-rose-200 text-rose-800 rounded-xl p-4">
                                            <span className="text-[#D60D26] block uppercase font-black tracking-wider text-[9px] mb-1.5">
                                                Cancellation / Rejection Reason
                                            </span>
                                            <p className="text-slate-700 text-[13px] font-semibold mt-1 leading-relaxed">
                                                {selectedBooking.cancellationRemarks || "Rejected / Cancelled by Agent."}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Modal */}
            {isEditModalOpen && (
                <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-200 p-4">
                    <div className="bg-white rounded-2xl w-full max-w-[450px] shadow-2xl overflow-hidden flex flex-col">
                        <div className="bg-rose-50 p-5 relative shrink-0">
                            <button onClick={() => setIsEditModalOpen(false)} className="absolute top-5 right-5 text-slate-500 hover:bg-white/50 p-1 rounded-full transition-colors"><X className="w-5 h-5" /></button>
                            <h2 className="font-extrabold text-[18px] text-slate-800">Change seats volume</h2>
                        </div>
                        <div className="p-6">
                            <div className="mb-6">
                                <div className="font-bold text-slate-800 text-[14px] mb-1">If you want go with new GPNR</div>
                                <div className="text-[13px] text-slate-500 flex items-center gap-1.5">
                                    To change the seat volume: <button className="text-[#D60D26] font-bold hover:underline">Add booking ref</button>
                                </div>
                            </div>
                            <div className="w-full h-px bg-slate-200 mb-6"></div>
                            <div>
                                <div className="font-bold text-slate-800 text-[14px] mb-1">If you want go with same GPNR</div>
                                <div className="text-[13px] text-slate-500 flex items-center gap-1.5">
                                    To change the seat volume: <button className="text-blue-600 font-bold hover:underline">Edit now</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <Footer />
        </div>
    );
}
