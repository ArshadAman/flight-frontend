"use client";

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

export default function B2BBookingDetailsPage() {
    return (
        <div className="w-full min-h-screen bg-white flex flex-col font-sans">
            <B2BNavbar />

            {/* Header Banner */}
            <div className="w-full bg-[#ebd9dc] py-10 sm:py-12 border-b border-rose-100">
                <div className="container mx-auto px-4 sm:px-6 lg:px-12 flex flex-col">
                    <h1 className="text-[30px] md:text-[36px] font-[750] text-[#555a60] tracking-tight mb-2">
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
                    <BookingHeader isB2B={true} />
                    <BookingInfo />
                    <PassengerDetails />
                    <ItineraryDetails />
                    <PassengerMoreDetails />
                    <PaymentDetails isB2B={true} />
                </div>

                <BookingActions isB2B={true} />

            </main>

            {/* Dark Airplane Banner Section */}
            <HeroBanner />

            <Footer />
        </div >
    );
}
