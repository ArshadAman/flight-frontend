"use client";

import React, { useState } from "react";
import { SaleNavbar } from "@/components/SaleNavbar";
import { Footer } from "@/components/Footer";
import { Bell, Filter, Plus, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function SaleAllFlightsPage() {
    const [activeTab, setActiveTab] = useState("All booking");

    const flightsJuly = [
        { route: "DEL \u2192 MUM", stops: 1, date: "Wed, 26 Jul 25", time: "16:30 - 12:20(+1)", flightNo: "TUA444 / T1", fare: "$150.00", status: "Closed" },
        { route: "DEL \u2192 MUM", stops: 1, date: "Wed, 26 Jul 25", time: "16:30 - 12:20(+1)", flightNo: "TUA444 / T1", fare: "$150.00", status: "Closed" },
        { route: "MUM \u2192 DEL", stops: 0, date: "Wed, 4 Aug 25", time: "16:30 - 12:20(+1)", flightNo: "TUA424 / T1", fare: "$150.00", status: "Closed" },
        { route: "DEL \u2192 MUM", stops: 1, date: "Wed, 26 Jul 25", time: "16:30 - 12:20(+1)", flightNo: "TUA444 / T1", fare: "$150.00", status: "Open" },
    ];

    const flightsAugust = [
        { route: "DEL \u2192 MUM", stops: 1, date: "Wed, 26 Jul 25", time: "16:30 - 12:20(+1)", flightNo: "TUA444 / T1", fare: "$150.00", status: "Open" },
        { route: "DEL \u2192 MUM", stops: 1, date: "Wed, 26 Jul 25", time: "16:30 - 12:20(+1)", flightNo: "TUA444 / T1", fare: "$150.00", status: "Open" },
    ];

    const renderFlightRow = (flight: any, index: number) => (
        <div key={index} className="grid grid-cols-7 gap-4 items-center py-4 border-b border-slate-100 text-[13px] font-medium text-slate-700 hover:bg-slate-50 transition-colors px-6">
            <div className="flex items-center gap-2">
                <span className="font-bold">{flight.route.split(" \u2192 ")[0]}</span>
                <ArrowRight className="w-3 h-3 text-slate-400" />
                <span className="font-bold">{flight.route.split(" \u2192 ")[1]}</span>
                <span className="text-slate-400 text-[12px]">({flight.stops} Stops)</span>
            </div>
            <div>{flight.date}</div>
            <div>{flight.time}</div>
            <div>{flight.flightNo}</div>
            <div className="flex items-center gap-3 text-[14px]">
                <div className="flex items-center gap-1"><span className="text-slate-400">💺</span> 10</div>
                <div className="w-1 h-1 bg-slate-300 rounded-full"></div>
                <div className="flex items-center gap-1"><span className="text-blue-500">💺</span> 8</div>
                <div className="w-1 h-1 bg-slate-300 rounded-full"></div>
                <div className="flex items-center gap-1"><span className="text-slate-400">♿</span> 2</div>
            </div>
            <div className="font-bold">{flight.fare}</div>
            <div>
                <span className={`px-4 py-1.5 rounded-full text-[12px] font-bold border ${flight.status === 'Closed' ? 'bg-slate-100 text-slate-500 border-slate-200' : 'bg-green-50 text-emerald-600 border-green-200'}`}>
                    {flight.status}
                </span>
            </div>
        </div>
    );

    return (
        <div className="w-full min-h-screen bg-slate-50 flex flex-col font-sans">
            <SaleNavbar />

            {/* Dark Red/Blue Secondary Navigation */}
            <div className="w-full bg-gradient-to-r from-[#C1161E] to-[#0F2027] text-white">
                <div className="container mx-auto px-6 lg:px-10 flex justify-between items-center h-14">
                    <div className="flex items-center gap-8 text-[14px] h-full">
                        {[
                            { name: "All booking", count: 7 },
                            { name: "Pending booking", count: 1 },
                            { name: "Bookable" },
                            { name: "Sold Out" },
                            { name: "Export" }
                        ].map((tab) => (
                            <button
                                key={tab.name}
                                onClick={() => setActiveTab(tab.name)}
                                className={`relative h-full flex items-center transition-colors ${activeTab === tab.name ? 'text-white font-bold' : 'text-white/70 hover:text-white'}`}
                            >
                                {tab.name} {tab.count !== undefined ? `(${tab.count})` : ''}
                                {activeTab === tab.name && (
                                    <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-white rounded-full"></div>
                                )}
                            </button>
                        ))}
                    </div>
                    <button className="flex items-center gap-2 text-white/90 hover:text-white transition-colors text-[14px]">
                        <Bell className="w-4 h-4" /> Notification(0)
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <main className="flex-1 w-full flex flex-col items-center">
                <div className="container mx-auto px-6 lg:px-10 py-6 w-full max-w-[1400px]">
                    
                    {/* Header Controls */}
                    <div className="flex justify-between items-center mb-6">
                        <button className="flex items-center gap-2 text-[#C1161E] font-bold hover:bg-rose-50 px-4 py-2 rounded-lg transition-colors">
                            <Filter className="w-5 h-5" /> Filters
                        </button>
                        
                        <Link href="/sale/flight/new" className="bg-[#C1161E] hover:bg-[#a01219] text-white px-6 py-2.5 rounded-full font-bold text-[14px] transition-colors shadow-sm flex items-center gap-2">
                            <Plus className="w-4 h-4" /> New Flight
                        </Link>
                    </div>

                    {/* Flights Table */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mb-8">
                        {/* Table Header */}
                        <div className="grid grid-cols-7 gap-4 px-6 py-4 border-b border-slate-100 bg-white text-slate-400 text-[13px] font-bold">
                            <div>Route</div>
                            <div>Date</div>
                            <div>Dep. & Arr. Time</div>
                            <div>Flight number</div>
                            <div>Number of seats</div>
                            <div>Ticket fare</div>
                            <div>Status</div>
                        </div>

                        {/* July Group */}
                        <div className="bg-[#f4f9fc] px-6 py-3 font-bold text-slate-700 text-[14px]">
                            July, 2025
                        </div>
                        <div className="flex flex-col">
                            {flightsJuly.map((flight, i) => renderFlightRow(flight, i))}
                        </div>

                        {/* August Group */}
                        <div className="bg-[#f4f9fc] px-6 py-3 font-bold text-slate-700 text-[14px]">
                            August, 2025
                        </div>
                        <div className="flex flex-col">
                            {flightsAugust.map((flight, i) => renderFlightRow(flight, i))}
                        </div>

                        {/* Pagination Footer */}
                        <div className="px-6 py-4 flex items-center justify-between border-t border-slate-100 bg-white">
                            <div className="text-slate-500 text-[13px]">
                                <span className="font-bold text-slate-700">1-50</span> on 106 results
                            </div>
                            <div className="flex items-center gap-4">
                                <button className="text-slate-400 font-bold text-[14px] hover:text-slate-600 cursor-not-allowed">Prev</button>
                                <button className="text-slate-800 font-bold text-[14px] border border-slate-300 rounded-full px-6 py-1.5 hover:bg-slate-50 transition-colors">Next</button>
                            </div>
                        </div>
                    </div>

                </div>
            </main>

            <Footer />
        </div>
    );
}
