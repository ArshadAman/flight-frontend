"use client";

import { use, useState, useEffect } from "react";
import { B2BNavbar } from "@/components/B2BNavbar";
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
import { getPublicApiUrl } from "@/lib/apiConfig";

interface PageProps {
    params: Promise<{ id: string }>;
}

export default function B2BBookingDetailsPage({ params }: PageProps) {
    const resolvedParams = use(params);
    const id = resolvedParams.id;
    const [ticket, setTicket] = useState<any | null>(null);
    const [ssrOpen, setSsrOpen] = useState(false);
    const [ssrDefaultTab, setSsrDefaultTab] = useState<"seats" | "meals" | "assistance">("seats");

    const handleSSRAdded = () => {
        console.log("[B2B BookingDetails Page] SSR updated, refreshing ticket details...");
        fetchTicketDetails();
    };

    const fetchTicketDetails = async () => {
        const token = localStorage.getItem("access_token") || localStorage.getItem("mock-access-token");
        if (!id) return;
        console.log("[B2B BookingDetails Page] Fetching ticket details for ID/PNR:", id);
        
        if (id.startsWith("31241")) {
            console.log("[B2B BookingDetails Page] Target ID is a mockup ID, skipping fetch to render default fallback mockup details.");
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
                    console.log("[B2B BookingDetails Page] Found matched ticket in local storage offline bookings cache:", matched);
                    setTicket(matched);
                    return;
                }
            }
        } catch (err) {
            console.error("[B2B BookingDetails Page Error] Failed to parse offline bookings cache:", err);
        }

        if (!token) {
            console.log("[B2B BookingDetails Page] No authorization token found, skipping live API queries.");
            return;
        }

        try {
            const apiBase = getPublicApiUrl();
            const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);
            
            if (isUuid) {
                console.log("[B2B BookingDetails Page] Target ID is a valid UUID, querying tickets by direct endpoint...");
                const response = await fetch(`${apiBase}/tickets/${id}/`, {
                    headers: {
                        "Authorization": `Bearer ${token}`
                    }
                });
                if (response.ok) {
                    const data = await response.json();
                    console.log("[B2B BookingDetails Page] Direct UUID ticket lookup succeeded:", data);
                    setTicket(data);
                    return;
                }
            }

            // Fallback: search all tickets
            console.log("[B2B BookingDetails Page] Querying ticket lists to find matched PNR/Ticket number...");
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
                    console.log("[B2B BookingDetails Page] Found matched ticket in backend list:", matched);
                    setTicket(matched);
                }
            }
        } catch (err) {
            console.warn("[B2B BookingDetails Page Error] Failed to fetch live ticket details, falling back to mockup:", err);
        }
    };

    useEffect(() => {
        fetchTicketDetails();
    }, [id]);

    return (
        <div className="w-full min-h-screen bg-white flex flex-col font-sans">
            <B2BNavbar />

            {/* Header Banner */}
            <div className="w-full bg-[#F2FBFF] py-10 sm:py-12 border-b border-rose-100">
                <div className="container mx-auto px-4 sm:px-6 lg:px-12 flex flex-col">
                    <h1 className="text-[30px] md:text-[36px] font-[750] text-[#0C2342] tracking-tight mb-2">
                        My booking (B2B)
                    </h1>
                    <div className="flex items-center text-[16px] font-[600] text-gray-500/80 gap-2">
                        <Link href="/b2b" className="hover:text-red-700 transition-colors">Home</Link>
                        <span>→</span>
                        <Link href="/b2b/my-booking" className="hover:text-red-700 transition-colors">My Booking</Link>
                        <span>→</span>
                        <span className="text-gray-600/90">Booking Details</span>
                    </div>
                </div>
            </div>

            <main className="container mx-auto px-4 sm:px-6 lg:px-12 py-10 flex-1 max-w-[1450px]">

                {/* Main Card Container */}
                <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden mb-12">
                    <BookingHeader ticket={ticket} isB2B={true} />
                    <BookingInfo ticket={ticket} />
                    <PassengerDetails ticket={ticket} />
                    <ItineraryDetails ticket={ticket} />
                    <PassengerMoreDetails ticket={ticket} />
                    <PaymentDetails ticket={ticket} isB2B={true} />
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
                    isB2B={true} 
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
