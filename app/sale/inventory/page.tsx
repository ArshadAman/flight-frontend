"use client";

import React, { useEffect, useMemo, useState } from "react";
import { SaleNavbar } from "@/components/SaleNavbar";
import { Footer } from "@/components/Footer";
import { Filter, Plus, X, Copy, Check, ExternalLink, ChevronDown, ChevronUp, Luggage } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { getPublicApiUrl } from "@/lib/apiConfig";
import { listingStatus } from "@/lib/sale/offlinePortal";
import { OfflinePortalSubNav } from "@/components/sale/OfflinePortalSubNav";
import { OfflineFlightListTable } from "@/components/sale/OfflineFlightListTable";
import { OfflineFlightDetailDrawer } from "@/components/sale/OfflineFlightDetailDrawer";
import {
    OfflinePortalFiltersModal,
    countActiveFilters,
    emptyOfflineFilters,
    type OfflineFilters,
} from "@/components/sale/OfflinePortalFilters";
import type { OfflineTicketRow } from "@/lib/sale/offlinePortal";

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
    seats_held?: number;
    cabin_class: string;
    duration: string;
    is_refundable: boolean;
    baggage_check_in: string;
    baggage_hand: string;
    is_published?: boolean;
    apis_required?: boolean;
    policies?: Record<string, string>;
    group_pnr?: string | null;
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
    agent_flight_inventory?: string | null;
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
    statusLabel: string;
    referenceLabel: string;
    referenceValue: string;
    mtdPnr?: string;
    amountLabel?: string;
    amountValue?: string;
    passengers?: any[];
    cancellationRemarks?: string;
    baggageCheckIn?: string;
    baggageHand?: string;
    details: DrawerDetail[];
};

function formatStatusLabel(status: string) {
    const s = (status || "").toUpperCase();
    if (s === "CONFIRMED") return "Confirmed";
    if (s === "PENDING") return "Pending";
    if (s === "CANCELLED") return "Cancelled";
    return status || "—";
}

/** Figma ticket modal subtitle: `DEL to MUM, 2025 Jul 26, 16:30` */
function formatTicketModalSubtitle(ticket: TicketApi) {
    const d = new Date(ticket.departure_datetime);
    if (Number.isNaN(d.getTime())) return `${ticket.origin} to ${ticket.destination}`;
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const datePart = `${d.getFullYear()} ${months[d.getMonth()]} ${d.getDate()}`;
    const time = d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false });
    return `${ticket.origin} to ${ticket.destination}, ${datePart}, ${time}`;
}

function formatPassengerBorn(dob?: string | null) {
    if (!dob) return null;
    const d = new Date(dob.includes("T") ? dob : `${dob}T00:00:00`);
    if (Number.isNaN(d.getTime())) return dob;
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const yy = String(d.getFullYear()).slice(-2);
    return `${dd}/${mm}/${yy}`;
}

function passengerGenderLabel(gender?: string | number | null) {
    if (gender === 0 || gender === "0") return "Male";
    if (gender === 1 || gender === "1") return "Female";
    if (gender == null || gender === "") return null;
    const g = String(gender).toUpperCase();
    if (g === "M" || g === "MALE") return "Male";
    if (g === "F" || g === "FEMALE") return "Female";
    return String(gender);
}

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
        statusLabel: formatStatusLabel(booking.status),
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
    const mtdPnr = (ticket.booking_ref || ticket.pnr_number || ticket.id.replace(/-/g, "").slice(0, 6)).toUpperCase();
    const titlePnr = (ticket.pnr_number || ticket.booking_ref || mtdPnr).toUpperCase();

    return {
        id: ticket.id,
        kind: "ticket",
        title: titlePnr,
        subtitle: formatTicketModalSubtitle(ticket),
        status: ticket.status,
        statusLabel: formatStatusLabel(ticket.status),
        referenceLabel: "MTDPNR reference",
        referenceValue: mtdPnr,
        mtdPnr,
        amountLabel: "Total amount",
        amountValue: formatFare(ticket.total_amount),
        passengers: ticket.passengers_data || [],
        cancellationRemarks: ticket.cancellation_data?.remarks || ticket.agent_cancellation_reason || "",
        baggageCheckIn: ticket.baggage_check_in || "",
        baggageHand: ticket.baggage_hand || "",
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
    const { access, refreshAccess, openAuthModal } = useAuth();
    const [inventoryFlights, setInventoryFlights] = useState<InventoryFlight[]>([]);
    const [tickets, setTickets] = useState<TicketApi[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);
    const [selectedFlight, setSelectedFlight] = useState<InventoryFlight | null>(null);
    const [selectedBooking, setSelectedBooking] = useState<DrawerRecord | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editSeats, setEditSeats] = useState("");
    const [editPrice, setEditPrice] = useState("");
    const [editPolicies, setEditPolicies] = useState<Record<string, string>>({
        cancellation: "",
        change: "",
        refund: "",
    });
    const [inventorySaving, setInventorySaving] = useState(false);

    // Booking actions state
    const [pnrNumber, setPnrNumber] = useState("");
    const [ticketNumber, setTicketNumber] = useState("");
    const [cancelRemarks, setCancelRemarks] = useState("");
    const [fulfillingTicketId, setFulfillingTicketId] = useState<string | null>(null);
    const [cancellingTicketId, setCancellingTicketId] = useState<string | null>(null);
    const [actionError, setActionError] = useState<string | null>(null);
    const [actionSuccess, setActionSuccess] = useState<string | null>(null);
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [inventoryTab, setInventoryTab] = useState("All PNR");
    const [filtersOpen, setFiltersOpen] = useState(false);
    const [filters, setFilters] = useState<OfflineFilters>(emptyOfflineFilters);
    const [expandedPassengerIdx, setExpandedPassengerIdx] = useState<number | null>(null);
    const [pnrCopied, setPnrCopied] = useState(false);

    const handleFulfillSubmit = async (ticketId: string) => {
        setActionError(null);
        setActionSuccess(null);
        if (!pnrNumber.trim() || !ticketNumber.trim()) {
            setActionError("Please enter both PNR and Ticket numbers.");
            return;
        }

        try {
            const apiBase = getPublicApiUrl();
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
                const issued = ticketNumber.trim();
                const passengers = (prev.passengers || []).map((pax: Record<string, unknown>) => ({
                    ...pax,
                    ticket_number: (pax.ticket_number as string) || issued,
                }));
                return {
                    ...prev,
                    status: "CONFIRMED",
                    title: pnrNumber.trim(),
                    passengers,
                    details: prev.details.map(d => d.label === "Ticket number" ? { ...d, value: issued } : d)
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
            const apiBase = getPublicApiUrl();
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

    const patchInventory = async (flightId: string, body: Record<string, unknown>) => {
        if (!access) {
            openAuthModal();
            throw new Error("Please sign in as an agent.");
        }
        const apiBase = getPublicApiUrl();
        const res = await fetch(`${apiBase}/flights/inventory/${flightId}/`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${access}`,
            },
            body: JSON.stringify(body),
        });
        if (!res.ok) {
            const errData = await res.json().catch(() => ({}));
            throw new Error(
                (errData as { detail?: string }).detail || `Update failed (${res.status})`
            );
        }
        return res.json();
    };

    const handleTogglePublish = async (flight: InventoryFlight) => {
        setActionError(null);
        setActionSuccess(null);
        setInventorySaving(true);
        try {
            const next = !(flight.is_published !== false);
            const updated = await patchInventory(flight.id, { is_published: next });
            setInventoryFlights((prev) =>
                prev.map((f) =>
                    f.id === flight.id
                        ? { ...f, is_published: updated.is_published ?? next }
                        : f
                )
            );
            setSelectedFlight((prev) =>
                prev && prev.id === flight.id
                    ? { ...prev, is_published: updated.is_published ?? next }
                    : prev
            );
            setActionSuccess(next ? "Listing published to For Sale." : "Listing unpublished.");
        } catch (err: any) {
            setActionError(err.message || "Failed to update publish status");
        } finally {
            setInventorySaving(false);
        }
    };

    const handleSaveInventoryEdits = async () => {
        if (!selectedFlight) return;
        const seats = Number(editSeats);
        const price = Number(editPrice);
        if (!Number.isFinite(seats) || seats < 0) {
            setActionError("Enter a valid seat count.");
            return;
        }
        if (!Number.isFinite(price) || price < 0) {
            setActionError("Enter a valid price.");
            return;
        }
        setActionError(null);
        setActionSuccess(null);
        setInventorySaving(true);
        try {
            const policies: Record<string, string> = {};
            for (const key of ["cancellation", "change", "refund"] as const) {
                const val = (editPolicies[key] || "").trim();
                if (val) policies[key] = val;
            }
            const updated = await patchInventory(selectedFlight.id, {
                seats_available: seats,
                price,
                policies,
            });
            const nextFlight: InventoryFlight = {
                ...selectedFlight,
                seats_available: updated.seats_available ?? seats,
                price: String(updated.price ?? price),
                policies: updated.policies ?? policies,
            };
            setInventoryFlights((prev) =>
                prev.map((f) => (f.id === selectedFlight.id ? nextFlight : f))
            );
            setSelectedFlight(nextFlight);
            setIsEditModalOpen(false);
            setActionSuccess("Inventory seats/price updated.");
        } catch (err: any) {
            setActionError(err.message || "Failed to update inventory");
        } finally {
            setInventorySaving(false);
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
                const apiBase = getPublicApiUrl();
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
                    setSelectedFlight((prev) => {
                        if (!prev) return prev;
                        const next = flights.find((f) => String(f.id) === String(prev.id));
                        return next ? (next as InventoryFlight) : prev;
                    });
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
    }, [access, refreshTrigger]);

    useEffect(() => {
        if (!access) {
            setTickets([]);
            return;
        }

        const controller = new AbortController();

        const loadTickets = async () => {
            try {
                const apiBase = getPublicApiUrl();
                const request = (token: string | null) => fetch(`${apiBase}/tickets/`, {
                    headers: { Authorization: `Bearer ${token}` },
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
                if (!response.ok) return;
                setTickets(normalizeApiList(body) as TicketApi[]);
            } catch {
                if (!controller.signal.aborted) setTickets([]);
            }
        };

        void loadTickets();
        return () => controller.abort();
    }, [access, refreshAccess, refreshTrigger]);

    const bookedByInventory = useMemo(() => {
        const map = new Map<string, number>();
        for (const ticket of tickets) {
            if (!ticket.agent_flight_inventory || ticket.status === "CANCELLED") continue;
            const key = String(ticket.agent_flight_inventory);
            map.set(key, (map.get(key) || 0) + 1);
        }
        return map;
    }, [tickets]);

    const inventoryTabCounts = useMemo(() => {
        let open = 0;
        for (const flight of inventoryFlights) {
            const booked = bookedByInventory.get(String(flight.id)) || 0;
            if (listingStatus(flight, booked) === "Open") open += 1;
        }
        return { all: inventoryFlights.length, open };
    }, [inventoryFlights, bookedByInventory]);

    const visibleFlights = useMemo(() => {
        if (inventoryTab !== "Open for sale") return inventoryFlights;
        return inventoryFlights.filter((flight) => {
            const booked = bookedByInventory.get(String(flight.id)) || 0;
            return listingStatus(flight, booked) === "Open";
        });
    }, [inventoryFlights, inventoryTab, bookedByInventory]);

    const filteredInventoryRows = useMemo(() => {
        return visibleFlights.filter((flight) => {
            const booked = bookedByInventory.get(String(flight.id)) || 0;
            const status = listingStatus(flight, booked);
            if (filters.origin && flight.origin.toUpperCase() !== filters.origin.trim().toUpperCase()) return false;
            if (filters.destination && flight.destination.toUpperCase() !== filters.destination.trim().toUpperCase()) return false;
            if (filters.status === "open" && status !== "Open") return false;
            if (filters.status === "closed" && status !== "Closed") return false;
            return true;
        });
    }, [visibleFlights, filters, bookedByInventory]);

    const offlineTickets = useMemo<OfflineTicketRow[]>(
        () =>
            tickets.map((t) => ({
                id: t.id,
                status: t.status,
                origin: t.origin,
                destination: t.destination,
                flight_number: t.flight_number,
                pnr_number: t.pnr_number,
                booking_ref: t.booking_ref,
                departure_datetime: t.departure_datetime,
                passengers_data: t.passengers_data,
                agent_flight_inventory: t.agent_flight_inventory,
                total_amount: t.total_amount,
            })),
        [tickets]
    );

    return (
        <div className="w-full min-h-screen bg-background flex flex-col font-sans">
            <SaleNavbar />

            <OfflinePortalSubNav
                variant="inventory"
                activeTab={inventoryTab}
                onTabChange={setInventoryTab}
                inventoryTabs={[
                    { name: "All PNR", count: inventoryTabCounts.all },
                    { name: "Open for sale", count: inventoryTabCounts.open },
                ]}
            />

            {/* Main Content with Drawer Flex */}
            <div className="flex-1 w-full flex overflow-hidden relative">
                <main className={`flex-1 overflow-y-auto transition-all duration-300 flex flex-col items-center ${selectedFlight ? 'xl:pr-[450px]' : ''}`}>
                    <div className="container mx-auto px-6 lg:px-10 py-6 w-full max-w-[1400px]">
                    
                    {/* Header Controls */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 w-full">
                        <button
                            type="button"
                            onClick={() => setFiltersOpen(true)}
                            className="flex items-center gap-2 text-[#D60D26] font-bold hover:bg-rose-50 px-4 py-2 rounded-lg transition-colors w-full sm:w-auto justify-center border border-rose-100 sm:border-transparent"
                        >
                            <Filter className="w-5 h-5" /> Filters
                            {countActiveFilters(filters) > 0 && (
                                <span className="bg-[#D60D26] text-white text-[11px] font-bold px-2 py-0.5 rounded-full">
                                    {countActiveFilters(filters)}
                                </span>
                            )}
                        </button>
                        
                        <div className="flex items-center gap-3 w-full sm:w-auto">
                            <button
                                type="button"
                                onClick={() => {
                                    if (!access) { openAuthModal(); return; }
                                    const api = getPublicApiUrl();
                                    const url = `${api}/flights/inventory/export/`;
                                    const a = document.createElement("a");

                                    a.href = url;
                                    a.setAttribute("download", `inventory-${new Date().toISOString().slice(0,10)}.csv`);
                                    // attach auth token as header isn't possible for anchor — open in new tab with token in URL if supported, else use fetch
                                    fetch(url, { headers: { Authorization: `Bearer ${access}` } })
                                        .then(r => r.blob())
                                        .then(blob => {
                                            const blobUrl = URL.createObjectURL(blob);
                                            const link = document.createElement("a");
                                            link.href = blobUrl;
                                            link.download = `inventory-${new Date().toISOString().slice(0,10)}.csv`;
                                            document.body.appendChild(link);
                                            link.click();
                                            link.remove();
                                            URL.revokeObjectURL(blobUrl);
                                        })
                                        .catch(() => alert("Export failed."));
                                }}
                                className="flex items-center gap-2 border border-slate-300 text-slate-700 hover:bg-slate-50 px-5 py-2.5 rounded-full font-bold text-[14px] transition-colors"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5m0 0l5-5m-5 5V4" /></svg>
                                Export
                            </button>
                            <Link href="/sale/inventory/new" className="bg-[#D60D26] hover:bg-[#b80b20] text-white px-6 py-2.5 rounded-full font-bold text-[14px] transition-colors shadow-sm flex items-center justify-center gap-2">
                                <Plus className="w-4 h-4" /> Add PNR
                            </Link>
                        </div>
                    </div>

                    {!isLoading && !access && (
                        <div className="rounded-xl border border-amber-100 bg-amber-50 px-5 py-4 text-amber-800 text-sm font-medium mb-6 w-full">
                            <button type="button" className="underline font-bold" onClick={openAuthModal}>Sign in</button> as an agent to manage inventory.
                        </div>
                    )}

                    {loadError && (
                        <div className="rounded-xl border border-rose-100 bg-rose-50 px-5 py-4 text-rose-700 text-sm font-medium mb-6 w-full">{loadError}</div>
                    )}

                    {isLoading ? (
                        <div className="py-16 text-center text-slate-500 font-medium w-full">Loading inventory…</div>
                    ) : (
                        <OfflineFlightListTable
                            rows={filteredInventoryRows}
                            variant="inventory"
                            seatDisplay="compact"
                            selectedId={selectedFlight?.id}
                            onSelect={(row) => setSelectedFlight(row as InventoryFlight)}
                            bookedByInventory={bookedByInventory}
                        />
                    )}

                </div>
            </main>

            {selectedFlight && (
                <OfflineFlightDetailDrawer
                    flight={selectedFlight}
                    tickets={offlineTickets}
                    bookedCount={bookedByInventory.get(String(selectedFlight.id)) || 0}
                    onClose={() => setSelectedFlight(null)}
                    onPublishToggle={() => void handleTogglePublish(selectedFlight)}
                    publishing={inventorySaving}
                    drawerVariant="inventory"
                    allowBookNow={inventoryTab === "Open for sale"}
                    onEditInventory={() => {
                        setEditSeats(String(selectedFlight.seats_available));
                        setEditPrice(String(selectedFlight.price));
                        setEditPolicies({
                            cancellation: selectedFlight.policies?.cancellation || "",
                            change: selectedFlight.policies?.change || "",
                            refund: selectedFlight.policies?.refund || "",
                        });
                        setIsEditModalOpen(true);
                    }}
                    onTicketSelect={(ticket) => {
                        const full = tickets.find((t) => t.id === ticket.id);
                        if (full) {
                            setSelectedBooking(buildTicketRecord(full));
                            setActionError(null);
                            setActionSuccess(null);
                            setFulfillingTicketId(null);
                            setCancellingTicketId(null);
                            setExpandedPassengerIdx(null);
                            setPnrCopied(false);
                        }
                    }}
                    onInventoryUpdated={() => setRefreshTrigger((p) => p + 1)}
                />
            )}
            </div>

            {/* Booking Details Modal — Figma Ticket */}
            {selectedBooking && (
                <div className="fixed inset-0 z-[60] overflow-y-auto bg-black/40 backdrop-blur-sm animate-in fade-in duration-200 p-4 flex justify-center items-start md:items-center">
                    <div className="bg-white rounded-2xl w-full max-w-[520px] shadow-2xl overflow-hidden flex flex-col my-8 md:my-auto max-h-[85vh]">
                        <div
                            className={`p-6 relative shrink-0 border-b ${
                                selectedBooking.status === "CONFIRMED"
                                    ? "bg-[#EAF7EE] border-emerald-100"
                                    : selectedBooking.status === "CANCELLED"
                                      ? "bg-rose-50 border-rose-100"
                                      : "bg-[#F2FBFF] border-slate-100"
                            }`}
                        >
                            <button
                                type="button"
                                onClick={() => setSelectedBooking(null)}
                                className="absolute top-6 right-6 text-slate-500 hover:bg-white/50 p-1 rounded-full"
                            >
                                <X className="w-5 h-5" />
                            </button>
                            <div className="flex items-baseline gap-2 mb-1 pr-8">
                                <span className="font-extrabold text-[20px] text-slate-900">{selectedBooking.title}</span>
                                <span
                                    className={`font-bold text-[16px] ${
                                        selectedBooking.status === "CONFIRMED"
                                            ? "text-emerald-700"
                                            : selectedBooking.status === "CANCELLED"
                                              ? "text-[#D60D26]"
                                              : "text-slate-600"
                                    }`}
                                >
                                    {selectedBooking.statusLabel}
                                </span>
                            </div>
                            <div className="text-slate-600 font-medium text-[13px]">{selectedBooking.subtitle}</div>
                        </div>

                        <div className="p-6 overflow-y-auto bg-white flex-1 space-y-7">
                            {/* General information */}
                            <div>
                                <div className="font-bold text-[15px] text-slate-800 mb-4">General information</div>
                                <div className="space-y-3.5">
                                    <div className="flex items-center justify-between gap-3">
                                        <div className="flex items-center gap-2 text-[13px] font-bold text-slate-600">
                                            <span className="w-3.5 h-3.5 rounded-[3px] bg-[#D60D26] shrink-0" />
                                            MTDPNR reference
                                        </div>
                                        <button
                                            type="button"
                                            onClick={async () => {
                                                const value = selectedBooking.mtdPnr || selectedBooking.referenceValue;
                                                try {
                                                    await navigator.clipboard.writeText(value);
                                                    setPnrCopied(true);
                                                    window.setTimeout(() => setPnrCopied(false), 1600);
                                                } catch {
                                                    setActionError("Could not copy PNR");
                                                }
                                            }}
                                            className="inline-flex items-center gap-1.5 font-bold text-[13px] text-[#2B7BB9] underline underline-offset-2 hover:text-[#1f5f8f]"
                                            title="Copy PNR"
                                        >
                                            {selectedBooking.mtdPnr || selectedBooking.referenceValue}
                                            {pnrCopied ? (
                                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                                            ) : (
                                                <Copy className="w-3.5 h-3.5" />
                                            )}
                                        </button>
                                    </div>
                                    {selectedBooking.kind === "ticket" && (
                                        <div className="flex items-center justify-between gap-3">
                                            <div className="flex items-center gap-2 text-[13px] font-bold text-slate-600">
                                                <Luggage className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                                                Reservation
                                            </div>
                                            <Link
                                                href={`/my-booking/${selectedBooking.id}`}
                                                className="inline-flex items-center gap-1.5 font-bold text-[13px] text-[#2B7BB9] underline underline-offset-2 hover:text-[#1f5f8f]"
                                            >
                                                Check reservation
                                                <ExternalLink className="w-3.5 h-3.5" />
                                            </Link>
                                        </div>
                                    )}
                                    {selectedBooking.amountValue && (
                                        <div className="flex items-center justify-between gap-3">
                                            <div className="text-[13px] font-bold text-slate-600">{selectedBooking.amountLabel}</div>
                                            <div className="font-bold text-slate-800 text-[13px]">{selectedBooking.amountValue}</div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Passengers */}
                            {selectedBooking.passengers && selectedBooking.passengers.length > 0 && (
                                <div>
                                    <div className="font-bold text-[15px] text-slate-800 mb-4">Passengers</div>
                                    <div className="space-y-3">
                                        {selectedBooking.passengers.map((pax: any, idx: number) => {
                                            const open = expandedPassengerIdx === idx;
                                            const gender = passengerGenderLabel(pax.gender);
                                            const born = formatPassengerBorn(pax.dob || pax.date_of_birth);
                                            const meta = [gender, born ? `Born ${born}` : null].filter(Boolean).join(" • ");
                                            return (
                                                <div
                                                    key={idx}
                                                    className="rounded-xl border border-slate-200 bg-white overflow-hidden"
                                                >
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            setExpandedPassengerIdx(open ? null : idx)
                                                        }
                                                        className="w-full flex items-center justify-between gap-3 px-4 py-3.5 text-left hover:bg-slate-50"
                                                    >
                                                        <div>
                                                            <div className="font-bold text-[14px] text-slate-800">
                                                                {[pax.title, pax.first_name, pax.last_name]
                                                                    .filter(Boolean)
                                                                    .join(" ")}
                                                            </div>
                                                            {meta && (
                                                                <div className="text-[12px] text-slate-500 font-medium mt-0.5">
                                                                    {meta}
                                                                </div>
                                                            )}
                                                        </div>
                                                        {open ? (
                                                            <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" />
                                                        ) : (
                                                            <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                                                        )}
                                                    </button>
                                                    {open && (
                                                        <div className="px-4 pb-4 pt-0 space-y-2 text-[12px] font-medium text-slate-600 border-t border-slate-100">
                                                            {(pax.contact_number || pax.phone) && (
                                                                <div className="pt-3">
                                                                    <div className="text-slate-400 mb-0.5">Contact Number</div>
                                                                    <div className="text-slate-800 font-bold">
                                                                        {pax.contact_number || pax.phone}
                                                                    </div>
                                                                </div>
                                                            )}
                                                            {pax.passport_number && (
                                                                <div>
                                                                    <div className="text-slate-400 mb-0.5">Passport</div>
                                                                    <div className="text-slate-800 font-bold">
                                                                        {pax.passport_number}
                                                                    </div>
                                                                </div>
                                                            )}
                                                            {pax.ticket_number && (
                                                                <div>
                                                                    <div className="text-slate-400 mb-0.5">Ticket No.</div>
                                                                    <div className="text-slate-800 font-bold">
                                                                        {pax.ticket_number}
                                                                    </div>
                                                                </div>
                                                            )}
                                                            {!pax.contact_number &&
                                                                !pax.phone &&
                                                                !pax.passport_number &&
                                                                !pax.ticket_number && (
                                                                    <div className="pt-3 text-slate-400">
                                                                        No extra passenger details on file.
                                                                    </div>
                                                                )}
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Ancillaries */}
                            {selectedBooking.kind === "ticket" && (
                                <div>
                                    <div className="font-bold text-[15px] text-slate-800 mb-4">Ancillaries</div>
                                    <div className="flex items-center justify-between py-2">
                                        <div className="flex items-center gap-3">
                                            <Luggage className="w-5 h-5 text-slate-500" />
                                            <div>
                                                <div className="font-bold text-slate-700 text-[14px]">Checked baggage</div>
                                                <div className="text-[12px] text-slate-400 font-medium mt-0.5">
                                                    {selectedBooking.baggageCheckIn
                                                        ? `${Math.max(selectedBooking.passengers?.length || 1, 1)} * ${selectedBooking.baggageCheckIn} • Free`
                                                        : "Not specified"}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="font-bold text-[#2B7BB9] text-[12px] tracking-wide">INCLUDED</div>
                                    </div>
                                    {selectedBooking.baggageHand && (
                                        <div className="flex items-center justify-between py-2">
                                            <div className="flex items-center gap-3">
                                                <Luggage className="w-5 h-5 text-slate-500" />
                                                <div>
                                                    <div className="font-bold text-slate-700 text-[14px]">Hand baggage</div>
                                                    <div className="text-[12px] text-slate-400 font-medium mt-0.5">
                                                        {`${Math.max(selectedBooking.passengers?.length || 1, 1)} * ${selectedBooking.baggageHand} • Free`}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="font-bold text-[#2B7BB9] text-[12px] tracking-wide">INCLUDED</div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {actionSuccess && (
                                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-[13px] font-semibold">
                                    {actionSuccess}
                                </div>
                            )}
                            {actionError && (
                                <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-[13px] font-semibold">
                                    {actionError}
                                </div>
                            )}

                            {/* Ticket agent actions (pending / cancelled) */}
                            {selectedBooking.kind === "ticket" && (
                                <div className="space-y-4">
                                    {selectedBooking.status === "PENDING" && (
                                        <div className="border-t border-slate-100 pt-4 space-y-4">
                                            {fulfillingTicketId !== selectedBooking.id &&
                                                cancellingTicketId !== selectedBooking.id && (
                                                    <div className="flex justify-end gap-3">
                                                        <button
                                                            type="button"
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
                                                            type="button"
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

                                            {fulfillingTicketId === selectedBooking.id && (
                                                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-4 shadow-sm">
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
                                                            type="button"
                                                            onClick={() => setFulfillingTicketId(null)}
                                                            className="text-slate-500 hover:text-slate-700 font-bold rounded-lg px-4 py-2 text-xs"
                                                        >
                                                            Cancel
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleFulfillSubmit(selectedBooking.id)}
                                                            className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold px-6 py-2 text-xs"
                                                        >
                                                            Issue Tickets
                                                        </button>
                                                    </div>
                                                </div>
                                            )}

                                            {cancellingTicketId === selectedBooking.id && (
                                                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-4 shadow-sm">
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
                                                            type="button"
                                                            onClick={() => setCancellingTicketId(null)}
                                                            className="text-slate-500 hover:text-slate-700 font-bold rounded-lg px-4 py-2 text-xs"
                                                        >
                                                            Cancel
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleCancelSubmit(selectedBooking.id)}
                                                            className="bg-[#D60D26] hover:bg-rose-700 text-white rounded-lg font-bold px-6 py-2 text-xs"
                                                        >
                                                            Confirm Rejection
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}

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
            {isEditModalOpen && selectedFlight && (
                <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-200 p-4">
                    <div className="bg-white rounded-2xl w-full max-w-[450px] shadow-2xl overflow-hidden flex flex-col">
                        <div className="bg-rose-50 p-5 relative shrink-0">
                            <button onClick={() => setIsEditModalOpen(false)} className="absolute top-5 right-5 text-slate-500 hover:bg-white/50 p-1 rounded-full transition-colors"><X className="w-5 h-5" /></button>
                            <h2 className="font-extrabold text-[18px] text-slate-800">Edit seats, price & policies</h2>
                        </div>
                        <div className="p-6 space-y-4">
                            <label className="block text-xs font-bold uppercase tracking-wide text-slate-500">
                                Seats available
                                <input
                                    type="number"
                                    min={0}
                                    value={editSeats}
                                    onChange={(e) => setEditSeats(e.target.value)}
                                    className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-800"
                                />
                            </label>
                            <label className="block text-xs font-bold uppercase tracking-wide text-slate-500">
                                Price (INR)
                                <input
                                    type="number"
                                    min={0}
                                    step="0.01"
                                    value={editPrice}
                                    onChange={(e) => setEditPrice(e.target.value)}
                                    className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-800"
                                />
                            </label>
                            {(["cancellation", "change", "refund"] as const).map((key) => (
                                <label key={key} className="block text-xs font-bold uppercase tracking-wide text-slate-500">
                                    {key} policy
                                    <textarea
                                        value={editPolicies[key] || ""}
                                        onChange={(e) =>
                                            setEditPolicies((prev) => ({ ...prev, [key]: e.target.value }))
                                        }
                                        rows={2}
                                        className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-800"
                                        placeholder={`Add ${key} policy...`}
                                    />
                                </label>
                            ))}
                            <button
                                type="button"
                                disabled={inventorySaving}
                                onClick={() => void handleSaveInventoryEdits()}
                                className="w-full rounded-full bg-[#D60D26] hover:bg-[#b80b20] text-white font-bold py-3 disabled:opacity-60"
                            >
                                {inventorySaving ? "Saving…" : "Save changes"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <Footer />
            <OfflinePortalFiltersModal
                open={filtersOpen}
                onClose={() => setFiltersOpen(false)}
                value={filters}
                onApply={setFilters}
            />
        </div>
    );
}
