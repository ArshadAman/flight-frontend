"use client";

import { B2BNavbar } from "@/components/B2BNavbar";
import { Footer } from "@/components/Footer";
import { HeroBanner } from "@/components/HeroBanner";
import { Plane, Trash2, Clock, ChevronRight } from "lucide-react";
import Link from "next/link";

const BookingCard = ({
    bookingNo,
    date,
    from,
    fromCode,
    to,
    toCode,
    terminal,
    flight,
    price,
    passengers
}: {
    bookingNo: string;
    date: string;
    from: string;
    fromCode: string;
    to: string;
    toCode: string;
    terminal: string;
    flight: string;
    price: string;
    passengers: Array<{ name: string, age: number }>;
}) => (
    <div className="bg-white rounded-[1.5rem] shadow-sm border border-rose-50 overflow-hidden mb-8">
        {/* Card Header */}
        <div className="bg-[#fff5f6] px-8 py-5 flex justify-between items-center border-b border-rose-100">
            <div className="flex items-center gap-6 text-[15px] font-[600] text-gray-400 tracking-wide">
                <div className="flex items-center gap-2">
                    <Plane className="w-5 h-5 text-primary rotate-45" />
                    <span>Booking No. <b className="text-gray-700 tracking-tighter ml-1">{bookingNo}</b></span>
                </div>
                <span>Booking Date: <b className="text-gray-700 tracking-tighter ml-1">{date}</b></span>
            </div>
            <div className="flex items-center gap-3">
                <Link href={`/b2b/my-booking/${bookingNo}`} className="flex items-center gap-1 text-[14px] font-[700] text-primary hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors">
                    <span>View Details</span>
                    <ChevronRight className="w-[16px] h-[16px]" strokeWidth={3} />
                </Link>
                <div className="w-[1px] h-4 bg-gray-200"></div>
                <button className="flex items-center gap-1.5 text-[14px] font-[600] text-gray-400 hover:text-primary px-2 py-1.5 transition-colors">
                    <Trash2 className="w-[18px] h-[18px]" strokeWidth={2.5} />
                    <span>Delete</span>
                </button>
            </div>
        </div>

        {/* Card Body */}
        <div className="p-8 flex flex-col lg:flex-row gap-8">
            {/* Route Info */}
            <div className="flex-1 bg-[#f8f9fa] rounded-2xl p-10 flex items-center justify-between relative">
                <div className="text-center w-[120px]">
                    <h3 className="text-[22px] font-[800] text-[#1e2329] tracking-tight">{from}, {fromCode}</h3>
                    <p className="text-[14px] font-[600] text-gray-400 mt-1">Terminal {terminal}</p>
                    <span className="inline-block mt-4 px-3 py-1 bg-white border border-gray-200 rounded text-[13px] font-[800] text-gray-700">{fromCode === "DEL" ? "23:00" : "10:00"}</span>
                </div>

                {/* Plane Path Line */}
                <div className="flex-1 px-4 flex flex-col items-center">
                    <div className="w-full flex items-center gap-0">
                        <div className="h-2 w-2 bg-white border-[2px] border-gray-300 rounded-full z-10"></div>
                        <div className="h-[2px] flex-1 border-t-2 border-dashed border-gray-300"></div>
                        <Plane className="w-6 h-6 text-gray-400 rotate-90 mx-2 flex-shrink-0" />
                        <div className="h-[2px] flex-1 border-t-2 border-dashed border-gray-300"></div>
                        <div className="h-2 w-2 bg-gray-800 rounded-full z-10"></div>
                    </div>
                    <div className="mt-6 flex flex-col items-center">
                        <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center mb-2 shadow-sm">
                          <span className="text-white text-[13px] font-[900] tracking-tighter">AI</span>
                        </div>
                        <p className="text-[13px] font-[800] text-gray-700 tracking-tight">{flight}</p>
                        <div className="flex items-center gap-1.5 text-blue-600 text-[13px] font-[700] mt-1 relative">
                            <Clock className="w-3.5 h-3.5" strokeWidth={2.5} />
                            <span>4 hr</span>
                        </div>
                    </div>
                </div>

                <div className="text-center w-[120px]">
                    <h3 className="text-[22px] font-[800] text-[#1e2329] tracking-tight">{to}, {toCode}</h3>
                    <p className="text-[14px] font-[600] text-gray-400 mt-1">Terminal {terminal}</p>
                    <span className="inline-block mt-4 px-3 py-1 bg-white border border-gray-200 rounded text-[13px] font-[800] text-gray-700">{toCode === "DEL" ? "23:00" : "03:00"}</span>
                </div>
            </div>

            {/* Payment & Passengers */}
            <div className="w-full lg:w-[320px] flex flex-col gap-6 pt-2">
                <div className="flex justify-between items-center px-1">
                    <span className="text-[16px] font-[600] text-gray-400">Payment:</span>
                    <span className="text-[22px] font-[800] text-[#1e2329]">$ {price}</span>
                </div>
                <div className="bg-[#f0f2f5] rounded-2xl p-6 flex-1">
                    <h4 className="font-[750] text-[#1e2329] text-[16px] mb-5 tracking-tight">Passengers: {passengers.length < 10 ? `0${passengers.length}` : passengers.length}</h4>
                    <div className="space-y-4">
                        {passengers.map((p, i: number) => (
                            <div key={i} className="flex justify-between text-[15px] font-[600] text-gray-500">
                                <span>{p.name}</span>
                                <span>{p.age}yr</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    </div>
);

export default function B2BMyBooking() {
    const bookings = [
        {
            no: "3124123522421",
            date: "October 12, 2025",
            from: "New Delhi", fromCode: "DEL",
            to: "Bangkok", toCode: "BKK",
            terminal: "3", flight: "Air India (AI 121)",
            price: "2,063.00",
            passengers: [{ name: "Harshit chirgania", age: 23 }, { name: "Vaibhav Arora", age: 43 }]
        },
        {
            no: "3124123522421",
            date: "October 12, 2025",
            from: "New Delhi", fromCode: "DEL",
            to: "Bombay", toCode: "BOM",
            terminal: "3", flight: "Air India (AI 121)",
            price: "2,063.00",
            passengers: [{ name: "Harshit chirgania", age: 23 }, { name: "Vaibhav Arora", age: 43 }]
        }
    ];

    return (
        <div className="w-full min-h-screen bg-white flex flex-col font-sans">
            <B2BNavbar />

            {/* Header Banner */}
            <div className="w-full bg-[#ebd9dc] py-14 sm:py-16 border-b border-rose-100">
                <div className="container mx-auto px-4 sm:px-6 lg:px-12 flex flex-col">
                    <h1 className="text-[32px] md:text-[38px] font-[700] text-[#555a60] tracking-tight mb-3">
                        My booking (B2B)
                    </h1>
                    <div className="flex items-center text-[15px] font-[600] text-gray-500/80 gap-2">
                        <Link href="/b2b" className="hover:text-red-700 transition-colors">Home</Link>
                        <span>→</span>
                        <span className="text-gray-600/90">My Booking</span>
                    </div>
                </div>
            </div>

            <main className="container mx-auto px-4 sm:px-6 lg:px-12 py-16 flex-1 max-w-[1450px]">
                <div className="flex justify-between items-center mb-10">
                    <span className="font-[800] text-[18px] text-[#1e2329] tracking-tight">Showing {bookings.length < 10 ? `0${bookings.length}` : bookings.length}</span>
                    <div className="flex items-center gap-3 text-[15px]">
                        <span className="text-gray-400 font-[600]">Sort by</span>
                        <span className="font-[750] text-[#1e2329] flex items-center gap-1 cursor-pointer hover:text-red-600 transition-colors">
                            Recommended <ChevronRight className="w-4 h-4 rotate-90" strokeWidth={3} />
                        </span>
                    </div>
                </div>

                <div className="flex flex-col gap-4 mb-16">
                    {bookings.map((b, i) => (
                        <BookingCard
                            key={i}
                            bookingNo={b.no}
                            date={b.date}
                            from={b.from}
                            fromCode={b.fromCode}
                            to={b.to}
                            toCode={b.toCode}
                            terminal={b.terminal}
                            flight={b.flight}
                            price={b.price}
                            passengers={b.passengers}
                        />
                    ))}
                </div>

            </main>

            {/* Dark Airplane Banner Section */}
            <HeroBanner />

            <Footer />
        </div>
    );
}
