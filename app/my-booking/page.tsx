"use client";

import { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { HeroBanner } from "@/components/HeroBanner";
import { Plane, Clock, ChevronRight, AlertCircle } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { fetchWithAuth } from "@/lib/api";

// ─── Status config ────────────────────────────────────────────────────────────
const statusConfig: Record<string, { label: string; dot: string; badge: string }> = {
    CONFIRMED: {
        label: "Confirmed",
        dot: "bg-emerald-500",
        badge: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    },
    CANCELLED: {
        label: "Cancelled",
        dot: "bg-rose-500",
        badge: "bg-rose-50 text-rose-700 border border-rose-200",
    },
    PENDING: {
        label: "Pending",
        dot: "bg-amber-400 animate-pulse",
        badge: "bg-amber-50 text-amber-700 border border-amber-200",
    },
    FAILED: {
        label: "Failed",
        dot: "bg-gray-400",
        badge: "bg-gray-100 text-gray-600 border border-gray-200",
    },
};

// ─── API ticket shape (matches backend TicketSerializer) ──────────────────────
type ApiTicket = {
    id: string;
    user: string;
    pnr_number: string | null;
    ticket_number: string | null;
    booking_ref: string | null;
    flight_id: string | null;
    status: "CONFIRMED" | "CANCELLED" | "PENDING" | "FAILED";
    origin: string;
    destination: string;
    departure_datetime: string;
    arrival_datetime: string;
    travel_type: number;
    airline_code: string;
    airline_name: string | null;
    flight_number: string;
    cabin_class: string | null;
    basic_amount: string;
    tax_amount: string;
    total_amount: string;
    currency: string;
    baggage_check_in: string | null;
    baggage_hand: string | null;
    is_refundable: boolean;
    food_onboard: string | null;
    segments_data: Array<{
        origin: string;
        destination: string;
        origin_city?: string;
        destination_city?: string;
        departure_datetime: string;
        arrival_datetime: string;
        duration?: string;
        airline_name?: string;
        flight_number?: string;
        origin_terminal?: string;
        destination_terminal?: string;
    }>;
    passengers_data: Array<{
        title?: string;
        first_name?: string;
        last_name?: string;
        dob?: string | null;
        gender?: string;
    }>;
    ssr_data: Record<string, unknown>;
    cancellation_data: Record<string, unknown>;
    created_at: string;
    updated_at: string;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatDate(iso: string) {
    try {
        return new Date(iso).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
        });
    } catch {
        return iso;
    }
}

function formatTime(iso: string) {
    try {
        return new Date(iso).toLocaleTimeString("en-IN", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
        });
    } catch {
        return "—";
    }
}

function formatCurrency(amount: string, currency: string) {
    const num = parseFloat(amount);
    if (isNaN(num)) return amount;
    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: currency || "INR",
        maximumFractionDigits: 0,
    }).format(num);
}

function calcDuration(dep: string, arr: string) {
    try {
        const diff = new Date(arr).getTime() - new Date(dep).getTime();
        if (diff <= 0) return "";
        const h = Math.floor(diff / 3600000);
        const m = Math.floor((diff % 3600000) / 60000);
        return `${h}h ${m}m`;
    } catch {
        return "";
    }
}

function passengerAge(dob: string | null | undefined) {
    if (!dob) return null;
    try {
        const diff = Date.now() - new Date(dob).getTime();
        return Math.floor(diff / (365.25 * 24 * 3600000));
    } catch {
        return null;
    }
}

// ─── Ticket card ──────────────────────────────────────────────────────────────
function TicketCard({ ticket }: { ticket: ApiTicket }) {
    const cfg = statusConfig[ticket.status] || statusConfig["CONFIRMED"];
    const duration = calcDuration(ticket.departure_datetime, ticket.arrival_datetime);
    const passengers = ticket.passengers_data ?? [];

    return (
        <div className="bg-white rounded-[1.5rem] shadow-sm border border-rose-50 overflow-hidden mb-8">
            {/* Header */}
            <div className="bg-[#fff5f6] px-8 py-5 flex justify-between items-center border-b border-rose-100 flex-wrap gap-3">
                <div className="flex items-center gap-5 flex-wrap text-[15px] font-[600] text-gray-400 tracking-wide">
                    <div className="flex items-center gap-2">
                        <Plane className="w-5 h-5 text-primary rotate-45" />
                        <span>
                            Booking Ref:{" "}
                            <b className="text-gray-700 tracking-tighter ml-1">
                                {ticket.booking_ref || ticket.ticket_number || ticket.id.slice(0, 8).toUpperCase()}
                            </b>
                        </span>
                    </div>
                    {ticket.pnr_number && (
                        <span>
                            PNR: <b className="text-gray-700 tracking-tighter ml-1">{ticket.pnr_number}</b>
                        </span>
                    )}
                    <span>
                        Booked:{" "}
                        <b className="text-gray-700 tracking-tighter ml-1">{formatDate(ticket.created_at)}</b>
                    </span>
                    <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[12px] font-[800] tracking-tight ${cfg.badge}`}
                    >
                        <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                        {cfg.label}
                    </span>
                </div>
                <Link
                    href={`/my-booking/${ticket.id}`}
                    className="flex items-center gap-1 text-[14px] font-[700] text-primary hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors"
                >
                    <span>View Details</span>
                    <ChevronRight className="w-[16px] h-[16px]" strokeWidth={3} />
                </Link>
            </div>

            {/* Body */}
            <div className="p-8 flex flex-col lg:flex-row gap-8">
                {/* Route info */}
                <div className="flex-1 bg-[#f8f9fa] rounded-2xl p-8 flex items-center justify-between relative">
                    {/* Origin */}
                    <div className="text-center min-w-[110px]">
                        <p className="text-[28px] font-[900] text-[#1e2329] tracking-tight leading-none">
                            {ticket.origin}
                        </p>
                        <p className="text-[13px] font-[600] text-gray-400 mt-1">
                            {ticket.segments_data?.[0]?.origin_city || ticket.origin}
                        </p>
                        <span className="inline-block mt-3 px-3 py-1 bg-white border border-gray-200 rounded text-[13px] font-[800] text-gray-700">
                            {formatTime(ticket.departure_datetime)}
                        </span>
                        <p className="text-[12px] text-gray-400 mt-1">{formatDate(ticket.departure_datetime)}</p>
                    </div>

                    {/* Flight line */}
                    <div className="flex-1 px-4 flex flex-col items-center">
                        <div className="w-full flex items-center">
                            <div className="h-2 w-2 bg-white border-[2px] border-gray-300 rounded-full z-10" />
                            <div className="h-[2px] flex-1 border-t-2 border-dashed border-gray-300" />
                            <Plane className="w-6 h-6 text-gray-400 rotate-90 mx-2 flex-shrink-0" />
                            <div className="h-[2px] flex-1 border-t-2 border-dashed border-gray-300" />
                            <div className="h-2 w-2 bg-gray-800 rounded-full z-10" />
                        </div>
                        <div className="mt-5 flex flex-col items-center">
                            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center mb-2 shadow-sm">
                                <span className="text-white text-[12px] font-[900] tracking-tighter">
                                    {ticket.airline_code}
                                </span>
                            </div>
                            <p className="text-[13px] font-[800] text-gray-700 tracking-tight">
                                {ticket.airline_name || ticket.airline_code} {ticket.flight_number}
                            </p>
                            {duration && (
                                <div className="flex items-center gap-1.5 text-blue-600 text-[13px] font-[700] mt-1">
                                    <Clock className="w-3.5 h-3.5" strokeWidth={2.5} />
                                    <span>{duration}</span>
                                </div>
                            )}
                            {ticket.cabin_class && (
                                <p className="text-[12px] text-gray-400 mt-0.5">{ticket.cabin_class}</p>
                            )}
                        </div>
                    </div>

                    {/* Destination */}
                    <div className="text-center min-w-[110px]">
                        <p className="text-[28px] font-[900] text-[#1e2329] tracking-tight leading-none">
                            {ticket.destination}
                        </p>
                        <p className="text-[13px] font-[600] text-gray-400 mt-1">
                            {ticket.segments_data?.[ticket.segments_data.length - 1]?.destination_city ||
                                ticket.destination}
                        </p>
                        <span className="inline-block mt-3 px-3 py-1 bg-white border border-gray-200 rounded text-[13px] font-[800] text-gray-700">
                            {formatTime(ticket.arrival_datetime)}
                        </span>
                        <p className="text-[12px] text-gray-400 mt-1">{formatDate(ticket.arrival_datetime)}</p>
                    </div>
                </div>

                {/* Payment & passengers */}
                <div className="w-full lg:w-[300px] flex flex-col gap-5 pt-1">
                    {/* Amount */}
                    <div className="flex justify-between items-center px-1">
                        <span className="text-[16px] font-[600] text-gray-400">Total Paid:</span>
                        <span className="text-[22px] font-[800] text-[#1e2329]">
                            {formatCurrency(ticket.total_amount, ticket.currency)}
                        </span>
                    </div>

                    {/* Baggage pills */}
                    {(ticket.baggage_check_in || ticket.baggage_hand) && (
                        <div className="flex gap-2 flex-wrap px-1">
                            {ticket.baggage_check_in && (
                                <span className="text-[12px] font-[700] bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-1 rounded-full">
                                    ✈ Check-in: {ticket.baggage_check_in}
                                </span>
                            )}
                            {ticket.baggage_hand && (
                                <span className="text-[12px] font-[700] bg-purple-50 text-purple-700 border border-purple-200 px-2.5 py-1 rounded-full">
                                    👜 Cabin: {ticket.baggage_hand}
                                </span>
                            )}
                        </div>
                    )}

                    {/* Passengers */}
                    <div className="bg-[#f0f2f5] rounded-2xl p-5 flex-1">
                        <h4 className="font-[750] text-[#1e2329] text-[15px] mb-4 tracking-tight">
                            Passengers:{" "}
                            {passengers.length < 10 ? `0${passengers.length}` : passengers.length}
                        </h4>
                        <div className="space-y-3">
                            {passengers.map((p, i) => {
                                const age = passengerAge(p.dob);
                                return (
                                    <div
                                        key={i}
                                        className="flex justify-between text-[14px] font-[600] text-gray-500"
                                    >
                                        <span>
                                            {p.title ? `${p.title} ` : ""}
                                            {p.first_name || ""} {p.last_name || ""}
                                        </span>
                                        {age !== null && <span>{age}yr</span>}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function MyBooking() {
    const { access, refreshAccess } = useAuth();
    const [tickets, setTickets] = useState<ApiTicket[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!access) {
            setLoading(false);
            return;
        }

        const fetchTickets = async () => {
            try {
                const apiBase = (
                    process.env.NEXT_PUBLIC_API_URL || "http://localhost:8001/api/v1"
                ).replace(/\/$/, "");

                const res = await fetchWithAuth(
                    `${apiBase}/tickets/`,
                    { method: "GET" },
                    () => access,
                    refreshAccess,
                );

                if (!res.ok) {
                    console.warn("[MyBooking] tickets fetch failed:", res.status);
                    setError(`Failed to load bookings (${res.status}).`);
                    return;
                }

                const payload = await res.json();
                // API wraps in { success, message, data: [...] }
                const raw = Array.isArray(payload)
                    ? payload
                    : Array.isArray(payload?.data)
                    ? payload.data
                    : payload?.results ?? [];

                setTickets(raw as ApiTicket[]);
            } catch (err) {
                console.error("[MyBooking] fetch error:", err);
                setError("Something went wrong loading your bookings.");
            } finally {
                setLoading(false);
            }
        };

        fetchTickets();
    }, [access, refreshAccess]);

    return (
        <div className="w-full min-h-screen bg-white flex flex-col font-sans">
            <Navbar />

            {/* Header Banner */}
            <div className="w-full bg-[#ebd9dc] py-14 sm:py-16 border-b border-rose-100">
                <div className="container mx-auto px-4 sm:px-6 lg:px-12 flex flex-col">
                    <h1 className="text-[32px] md:text-[38px] font-[700] text-[#555a60] tracking-tight mb-3">
                        My booking
                    </h1>
                    <div className="flex items-center text-[15px] font-[600] text-gray-500/80 gap-2">
                        <Link href="/" className="hover:text-red-700 transition-colors">
                            Home
                        </Link>
                        <span>→</span>
                        <span className="text-gray-600/90">My Booking</span>
                    </div>
                </div>
            </div>

            <main className="container mx-auto px-4 sm:px-6 lg:px-12 py-16 flex-1 max-w-[1450px]">
                <div className="flex justify-between items-center mb-10">
                    <span className="font-[800] text-[18px] text-[#1e2329] tracking-tight">
                        Showing{" "}
                        {tickets.length < 10 ? `0${tickets.length}` : tickets.length}
                    </span>
                    <div className="flex items-center gap-3 text-[15px]">
                        <span className="text-gray-400 font-[600]">Sort by</span>
                        <span className="font-[750] text-[#1e2329] flex items-center gap-1 cursor-pointer hover:text-red-600 transition-colors">
                            Newest first{" "}
                            <ChevronRight className="w-4 h-4 rotate-90" strokeWidth={3} />
                        </span>
                    </div>
                </div>

                {loading ? (
                    <div className="mb-16 rounded-2xl border border-rose-100 bg-white p-10 text-center text-gray-500">
                        <div className="flex items-center justify-center gap-3 text-[16px] font-[600]">
                            <Plane className="w-5 h-5 text-primary animate-bounce rotate-45" />
                            Loading your bookings…
                        </div>
                    </div>
                ) : error ? (
                    <div className="mb-16 rounded-2xl border border-rose-100 bg-white p-10 text-center">
                        <div className="flex items-center justify-center gap-2 text-rose-600 text-[15px] font-[600]">
                            <AlertCircle className="w-5 h-5" />
                            {error}
                        </div>
                    </div>
                ) : !access ? (
                    <div className="mb-16 rounded-2xl border border-rose-100 bg-white p-10 text-center">
                        <h3 className="text-[20px] font-[800] text-[#1e2329]">Please log in</h3>
                        <p className="mt-2 text-[15px] text-gray-500">
                            Sign in to view your flight bookings.
                        </p>
                    </div>
                ) : tickets.length === 0 ? (
                    <div className="mb-16 rounded-2xl border border-rose-100 bg-white p-10 text-center">
                        <h3 className="text-[20px] font-[800] text-[#1e2329]">No bookings found</h3>
                        <p className="mt-2 text-[15px] text-gray-500">
                            Once you book a flight, it will appear here.
                        </p>
                    </div>
                ) : (
                    <div className="flex flex-col gap-4 mb-16">
                        {tickets.map((ticket) => (
                            <TicketCard key={ticket.id} ticket={ticket} />
                        ))}
                    </div>
                )}
            </main>

            <HeroBanner />
            <Footer />
        </div>
    );
}
