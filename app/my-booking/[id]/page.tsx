"use client";

import { use, useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { HeroBanner } from "@/components/HeroBanner";
import Link from "next/link";
import { BookingHeader } from "@/components/booking/BookingHeader";
import { BookingInfo } from "@/components/booking/BookingInfo";
import { PassengerDetails } from "@/components/booking/PassengerDetails";
import { ItineraryDetails } from "@/components/booking/ItineraryDetails";
import { PassengerMoreDetails } from "@/components/booking/PassengerMoreDetails";
import { PaymentDetails, BookingActions } from "@/components/booking/PaymentDetails";
import SSRSelection from "@/components/booking/SSRSelection";

interface PageProps {
    params: Promise<{ id: string }>;
}

export default function BookingDetailsPage({ params }: PageProps) {
    const resolvedParams = use(params);
    const id = resolvedParams.id;
    const [ticket, setTicket] = useState<any | null>(null);
    const [ssrOpen, setSsrOpen] = useState(false);
    const [ssrDefaultTab, setSsrDefaultTab] = useState<"seats" | "meals" | "assistance">("seats");

    const fetchTicketDetails = async () => {
        const token = localStorage.getItem("access_token") || localStorage.getItem("mock-access-token");
        if (!id) return;
        console.log("[BookingDetails Page] Fetching ticket details for ID/PNR:", id);
        
        if (id.startsWith("31241")) {
            console.log("[BookingDetails Page] Target ID is a mockup ID, skipping fetch to render default fallback mockup details.");
            
            // Try loading from offline cache first even for mockups to display saved SSRs!
            try {
                const stored = localStorage.getItem("offline_bookings");
                if (stored) {
                    const parsed = JSON.parse(stored);
                    const matched = parsed.find((t: any) => 
                        t.id === id || 
                        t.pnr_number === id || 
                        t.ticket_number === id
                    );
                    if (matched) {
                        console.log("[BookingDetails Page] Found mockup ticket in cache with potential ssr_data:", matched);
                        setTicket(matched);
                        return;
                    }
                }
            } catch (err) {
                console.error("[BookingDetails Page Error] Failed to parse offline bookings cache:", err);
            }
            return; 
        }

        // Fast path: check offline bookings in localStorage first
        try {
            const stored = localStorage.getItem("offline_bookings");
            if (stored) {
                const parsed = JSON.parse(stored);
                const matched = parsed.find((t: any) => 
                    t.id === id || 
                    t.pnr_number === id || 
                    t.ticket_number === id
                );
                if (matched) {
                    console.log("[BookingDetails Page] Found matched ticket in local storage offline bookings cache:", matched);
                    setTicket(matched);
                    return;
                }
            }
        } catch (err) {
            console.error("[BookingDetails Page Error] Failed to parse offline bookings cache:", err);
        }

        if (!token) {
            console.log("[BookingDetails Page] No authorization token found, skipping live API queries.");
            return;
        }

        try {
            const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8001/api/v1";
            // If the id is a PNR or ticket number, we first fetch all tickets and filter, 
            // or try to fetch by direct UUID if valid format.
            const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);
            
            if (isUuid) {
                console.log("[BookingDetails Page] Target ID is a valid UUID pattern, querying tickets by direct endpoint...");
                const response = await fetch(`${apiBase}/tickets/${id}/`, {
                    headers: {
                        "Authorization": `Bearer ${token}`
                    }
                });
                if (response.ok) {
                    const data = await response.json();
                    console.log("[BookingDetails Page] Direct UUID ticket lookup succeeded. Ticket data:", data);
                    setTicket(data);
                    return;
                } else {
                    console.warn("[BookingDetails Page] Direct UUID ticket lookup failed with status:", response.status);
                }
            }

            // Fallback: search all tickets for a matching PNR or ticket number
            console.log("[BookingDetails Page] Querying ticket lists to find matched PNR/Ticket number...");
            const listResponse = await fetch(`${apiBase}/tickets/`, {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });
            if (listResponse.ok) {
                const listData = await listResponse.json();
                const tickets = listData.results || listData;
                const matched = tickets.find((t: any) => 
                    t.id === id || 
                    t.pnr_number === id || 
                    t.ticket_number === id
                );
                if (matched) {
                    console.log("[BookingDetails Page] Found matched ticket in backend list search. Ticket data:", matched);
                    setTicket(matched);
                } else {
                    console.log("[BookingDetails Page] No matched ticket found in backend list search.");
                }
            } else {
                console.warn("[BookingDetails Page] Ticket list search failed with status:", listResponse.status);
            }
        } catch (err) {
            console.warn("[BookingDetails Page Error] Failed to fetch live ticket details, falling back to mockups:", err);
        }
    };

    useEffect(() => {
        fetchTicketDetails();
    }, [id]);

    const handleSSRAdded = () => {
        console.log("[BookingDetails Page] SSR updated, refreshing ticket details...");
        fetchTicketDetails();
    };

    return (
        <div className="w-full min-h-screen bg-white flex flex-col font-sans">
            <Navbar />

            {/* Header Banner */}
            <div className="w-full bg-[#ebd9dc] py-10 sm:py-12 border-b border-rose-100">
                <div className="container mx-auto px-4 sm:px-6 lg:px-12 flex flex-col">
                    <h1 className="text-[30px] md:text-[36px] font-[750] text-[#555a60] tracking-tight mb-2">
                        My booking
                    </h1>
                    <div className="flex items-center text-[16px] font-[600] text-gray-500/80 gap-2">
                        <Link href="/" className="hover:text-red-700 transition-colors">Home</Link>
                        <span>→</span>
                        <Link href="/my-booking" className="hover:text-red-700 transition-colors">My Booking</Link>
                        <span>→</span>
                        <span className="text-gray-600/90">Booking Details</span>
                    </div>
                </div>
            </div>

            <main className="container mx-auto px-4 sm:px-6 lg:px-12 py-10 flex-1 max-w-[1450px]">

                {/* Main Card Container */}
                <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden mb-12">
                    <BookingHeader ticket={ticket} />
                    <BookingInfo ticket={ticket} />
                    <PassengerDetails ticket={ticket} />
                    <ItineraryDetails ticket={ticket} />
                    <PassengerMoreDetails ticket={ticket} />
                    <PaymentDetails ticket={ticket} />
                </div>

                {/* SSR Selection Block */}
                <SSRSelection
                    ticket={ticket}
                    id={id}
                    onSSRAdded={handleSSRAdded}
                    isOpenExternal={ssrOpen}
                    setIsOpenExternal={setSsrOpen}
                    defaultTabExternal={ssrDefaultTab}
                />

                <BookingActions
                    ticket={ticket}
                    onCancelled={fetchTicketDetails}
                    onAddBaggageClick={() => {
                        setSsrDefaultTab("assistance");
                        setSsrOpen(true);
                        setTimeout(() => {
                            const el = document.getElementById("ssr-selection-section");
                            if (el) el.scrollIntoView({ behavior: "smooth" });
                        }, 100);
                    }}
                    onModificationClick={() => {
                        setSsrDefaultTab("seats");
                        setSsrOpen(true);
                        setTimeout(() => {
                            const el = document.getElementById("ssr-selection-section");
                            if (el) el.scrollIntoView({ behavior: "smooth" });
                        }, 100);
                    }}
                />

            </main>

            {/* Dark Airplane Banner Section */}
            <HeroBanner />

            <Footer />
        </div >
    );
}
