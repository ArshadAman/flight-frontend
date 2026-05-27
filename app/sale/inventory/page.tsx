"use client";

import React, { useState } from "react";
import { SaleNavbar } from "@/components/SaleNavbar";
import { Footer } from "@/components/Footer";
import { Bell, Filter, Plus, ArrowRight, X, Plane, ChevronDown, MoreVertical } from "lucide-react";
import Link from "next/link";

export default function InventoryPage() {
    const [selectedFlight, setSelectedFlight] = useState<any>(null);
    const [activeDrawerTab, setActiveDrawerTab] = useState("Segment");
    const [selectedBooking, setSelectedBooking] = useState<any>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    const flightsJuly = [
        { groupPnr: "UYS12435", route: "DEL \u2192 MUM", stops: 1, date: "Wed, 26 Jul 25", time: "16:30 - 12:20(+1)", flightNo: "TUA444 / T1", fare: "$150.00", status: "Closed" },
        { groupPnr: "UYS12435", route: "DEL \u2192 MUM", stops: 1, date: "Wed, 26 Jul 25", time: "16:30 - 12:20(+1)", flightNo: "TUA444 / T1", fare: "$150.00", status: "Closed" },
        { groupPnr: "UYS12435", route: "MUM \u2192 DEL", stops: 1, date: "Wed, 28 Jul 25", time: "16:30 - 12:20(+1)", flightNo: "TUA444 / T1", fare: "$150.00", status: "Closed" },
        { groupPnr: "UYS12435", route: "DEL \u2192 MUM", stops: 1, date: "Wed, 26 Jul 25", time: "16:30 - 12:20(+1)", flightNo: "TUA444 / T1", fare: "$150.00", status: "Open" },
    ];

    const flightsAugust = [
        { groupPnr: "UYS12435", route: "DEL \u2192 MUM", stops: 1, date: "Wed, 26 Jul 25", time: "16:30 - 12:20(+1)", flightNo: "TUA444 / T1", fare: "$150.00", status: "Open" },
        { groupPnr: "UYS12435", route: "DEL \u2192 MUM", stops: 1, date: "Wed, 26 Jul 25", time: "16:30 - 12:20(+1)", flightNo: "TUA444 / T1", fare: "$150.00", status: "Open" },
        { groupPnr: "UYS12435", route: "DEL \u2192 MUM", stops: 1, date: "Wed, 26 Jul 25", time: "16:30 - 12:20(+1)", flightNo: "TUA444 / T1", fare: "$150.00", status: "Open" },
    ];

    const renderFlightRow = (flight: any, index: number) => (
        <div 
            key={index} 
            onClick={() => { setSelectedFlight(flight); setActiveDrawerTab("Segment"); }}
            className={`relative flex flex-col md:grid md:grid-cols-[1fr_1.5fr_1fr_1fr_1fr_1fr_1fr_1fr_auto] gap-2 md:gap-4 items-start md:items-center py-4 border-b border-slate-100 text-[13px] font-medium transition-colors px-6 cursor-pointer ${selectedFlight === flight ? 'bg-rose-50 border-l-2 border-l-[#D60D26]' : 'text-slate-700 hover:bg-slate-50'}`}
        >
            <div className="font-bold text-slate-800 flex items-center gap-2"><span className="md:hidden text-slate-400 w-20">PNR:</span>{flight.groupPnr}</div>
            <div className="flex items-center gap-1">
                <span className="md:hidden text-slate-400 w-20">Route:</span>
                <span className="font-bold">{flight.route.split(" \u2192 ")[0]}</span>
                <ArrowRight className="w-3 h-3 text-slate-400" />
                <span className="font-bold">{flight.route.split(" \u2192 ")[1]}</span>
                <span className="text-slate-400 text-[12px] font-medium">({flight.stops})</span>
            </div>
            <div className="flex items-center gap-2"><span className="md:hidden text-slate-400 w-20">Date:</span>{flight.date}</div>
            <div className="flex items-center gap-2"><span className="md:hidden text-slate-400 w-20">Time:</span>{flight.time}</div>
            <div className="font-bold text-slate-800 flex items-center gap-2"><span className="md:hidden text-slate-400 w-20">Flight:</span>{flight.flightNo}</div>
            <div className="flex items-center gap-2 text-[14px]">
                <span className="md:hidden text-slate-400 w-20">Seats:</span>
                <div className="flex items-center gap-1 font-bold text-slate-700"><span className="text-slate-400">💺</span> 10</div>
            </div>
            <div className="font-bold text-slate-800 flex items-center gap-2"><span className="md:hidden text-slate-400 w-20">Fare:</span>{flight.fare}</div>
            <div className="flex items-center gap-2">
                <span className="md:hidden text-slate-400 w-20">Status:</span>
                <span className={`px-4 py-1.5 rounded-full text-[12px] font-bold border ${flight.status === 'Closed' ? 'bg-slate-100 text-slate-500 border-slate-200' : 'bg-green-50 text-emerald-600 border-green-200'}`}>
                    {flight.status}
                </span>
            </div>
            <div className="absolute right-6 top-6 md:static text-slate-400 hover:text-slate-600 transition-colors">
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
                            <Plus className="w-4 h-4" /> Add PNR
                        </Link>
                    </div>

                    {/* Flights Table */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mb-8">
                        <div className="overflow-x-auto">
                            <div className="w-full">
                                {/* Table Header */}
                                <div className="hidden md:grid grid-cols-[1fr_1.5fr_1fr_1fr_1fr_1fr_1fr_1fr_auto] gap-4 px-6 py-4 border-b border-slate-100 bg-white text-slate-400 text-[13px] font-bold">
                                    <div>Group PNR</div>
                                    <div>Route</div>
                                    <div>Dep. Date</div>
                                    <div>Dep. & Arr.</div>
                                    <div>Flight number</div>
                                    <div>No. of seats</div>
                                    <div>Ticket price</div>
                                    <div>Status</div>
                                    <div className="w-5"></div>
                                </div>

                                {/* July Group */}
                                <div className="bg-[#F2FBFF] px-6 py-3 font-bold text-slate-700 text-[14px]">
                                    July, 2025
                                </div>
                                <div className="flex flex-col">
                                    {flightsJuly.map((flight, i) => renderFlightRow(flight, i))}
                                </div>

                                {/* August Group */}
                                <div className="bg-[#F2FBFF] px-6 py-3 font-bold text-slate-700 text-[14px]">
                                    August, 2025
                                </div>
                                <div className="flex flex-col">
                                    {flightsAugust.map((flight, i) => renderFlightRow(flight, i))}
                                </div>
                            </div>
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

            {/* Right Drawer */}
            {selectedFlight && (
                <div className="w-full xl:w-[450px] bg-white border-l border-slate-200 fixed top-0 xl:top-[96px] right-0 bottom-0 z-50 xl:z-40 flex flex-col shadow-2xl animate-in slide-in-from-right duration-300">
                    <div className="p-6 bg-slate-50 border-b border-slate-200 flex items-start justify-between shrink-0">
                        <div>
                            <div className="font-bold text-[16px] text-slate-800 flex items-center gap-2">
                                New Delhi <ArrowRight className="w-4 h-4 text-[#D60D26]" /> Mumbai
                            </div>
                            <div className="text-[13px] text-slate-500 mt-1">Saturday, July 26, 2025</div>
                        </div>
                        <button onClick={() => setSelectedFlight(null)} className="hover:bg-slate-200 p-1 rounded-full transition-colors"><X className="w-5 h-5 text-slate-700" /></button>
                    </div>
                    
                    <div className="flex items-center border-b border-slate-200 shrink-0 bg-white px-2 overflow-x-auto">
                        {["Segment", "Inventory", "Booking", "PNR Booking"].map(tab => (
                            <button 
                                key={tab} 
                                onClick={() => setActiveDrawerTab(tab)} 
                                className={`flex-1 px-4 py-4 font-bold text-[13px] whitespace-nowrap transition-colors ${activeDrawerTab === tab ? 'text-[#D60D26] bg-rose-50 border-b-2 border-[#D60D26]' : 'text-slate-600 hover:bg-slate-50'}`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>

                    {activeDrawerTab === "Segment" && (
                        <>
                            <div className="flex-1 overflow-y-auto p-6 bg-white">
                                <div className="font-bold text-[16px] text-slate-800 mb-8">
                                    DEL <span className="text-slate-400 font-medium">Delhi, India</span>
                                </div>
                                
                                <div className="flex gap-4 relative mb-6">
                                    <div className="w-px bg-slate-300 absolute left-1.5 top-2 bottom-2"></div>
                                    <div className="w-3 h-3 rounded-full bg-slate-800 relative z-10 shrink-0 mt-1"></div>
                                    <div className="flex-1">
                                        <div className="text-[13px] text-slate-700 font-bold mb-4">
                                            16:30 <span className="text-slate-400 font-medium">(UTC +02:00)</span> <span className="text-[#D60D26] mx-1">•</span> DEL <span className="text-[#D60D26] mx-1">•</span> Terminal 1
                                        </div>
                                        
                                        <div className="flex items-center gap-4 py-8">
                                            <div className="w-8 h-8 bg-[#D60D26] rounded flex items-center justify-center shrink-0 shadow-sm relative -ml-[22px]">
                                                <Plane className="w-4 h-4 text-white -rotate-45" />
                                            </div>
                                            <div className="flex items-center gap-4 text-[13px] font-bold text-blue-600">
                                                <span>1 stop</span>
                                                <button className="flex items-center gap-1 text-[#D60D26] underline underline-offset-2">See flight details <ChevronDown className="w-4 h-4" /></button>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-4 relative mb-8">
                                    <div className="w-3 h-3 rounded-full border-2 border-slate-800 bg-white relative z-10 shrink-0 mt-1"></div>
                                    <div className="flex-1">
                                        <div className="text-[13px] text-slate-700 font-bold">
                                            12:20(+1) <span className="text-slate-400 font-medium">(UTC +08:00)</span> <span className="text-[#D60D26] mx-1">•</span> MUM <span className="text-[#D60D26] mx-1">•</span> Terminal 2
                                        </div>
                                    </div>
                                </div>

                                <div className="font-bold text-[16px] text-slate-800 mt-2">
                                    MUM <span className="text-slate-400 font-medium">Mumbai, India</span>
                                </div>
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
                                <input type="text" value="23 kg, Included" readOnly className="w-full border border-slate-200 rounded-lg p-3 text-[14px] font-bold text-slate-600 bg-white shadow-sm outline-none" />
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
                                        <div className="font-bold text-[#D60D26] text-[18px]">10</div>
                                        <div className="text-[12px] font-medium text-slate-500 mt-1">Total</div>
                                    </div>
                                    <div className="border border-slate-200 rounded-xl p-4 flex flex-col items-center justify-center bg-white shadow-sm">
                                        <div className="font-bold text-[#D60D26] text-[18px]">08</div>
                                        <div className="text-[12px] font-medium text-slate-500 mt-1 text-center leading-tight">Open for<br/>sale</div>
                                    </div>
                                    <div className="border border-slate-200 rounded-xl p-4 flex flex-col items-center justify-center bg-white shadow-sm">
                                        <div className="font-bold text-[#D60D26] text-[18px]">04</div>
                                        <div className="text-[12px] font-medium text-slate-500 mt-1">Sold</div>
                                    </div>
                                    <div className="border border-slate-200 rounded-xl p-4 flex flex-col items-center justify-center bg-white shadow-sm">
                                        <div className="font-bold text-[#D60D26] text-[18px]">04</div>
                                        <div className="text-[12px] font-medium text-slate-500 mt-1">Available</div>
                                    </div>
                                    <div className="border border-slate-200 rounded-xl p-4 flex flex-col items-center justify-center bg-white shadow-sm">
                                        <div className="font-bold text-[#D60D26] text-[18px]">02</div>
                                        <div className="text-[12px] font-medium text-slate-500 mt-1">Reserved</div>
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
                                    <input type="text" value="1500.00" readOnly className="w-full border border-slate-200 rounded-lg p-3.5 pl-8 text-[14px] font-bold text-slate-600 bg-white shadow-sm outline-none" />
                                </div>
                            </div>
                        </div>
                    )}

                    {activeDrawerTab === "Booking" && (
                        <div className="flex-1 overflow-y-auto p-6 bg-white">
                            <div className="font-bold text-[15px] text-slate-800 mb-4">Booking(4)</div>
                            <div className="space-y-4">
                                {[
                                    { id: "CPWLWW", pax: "4 PAX", amount: "6000.00", users: "HARSHIT(+3)" },
                                    { id: "CPTUWK", pax: "2 PAX", amount: "3000.00", users: "HARSHIT / VAIBHAV" },
                                    { id: "CPWLWB", displayId: "CPWLWB", pax: "2 PAX", amount: "3000.00", users: "HARSHIT / LOKESH" },
                                ].map((b, idx) => (
                                    <div key={idx} onClick={() => setSelectedBooking(b)} className="cursor-pointer hover:bg-slate-50 p-3 rounded-xl transition-colors border border-transparent hover:border-slate-100">
                                        <div className="flex items-center gap-2 font-bold text-slate-700 text-[14px] mb-1.5">
                                            {b.displayId || b.id} <span className="text-slate-500 font-normal">({b.pax})</span>
                                        </div>
                                        <div className="text-[13px] font-medium text-slate-500">
                                            ₹{b.amount} <span className="text-slate-300 mx-1">•</span> {b.users}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeDrawerTab === "PNR Booking" && (
                        <div className="flex-1 overflow-y-auto p-6 bg-white">
                            <div className="font-bold text-[15px] text-slate-800 mb-6">PNR Booking (GPNR \u2192 UYS12345)</div>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4 text-[12px] text-slate-400 font-medium mb-4 hidden sm:grid">
                                <div>Name</div>
                                <div>Airline PNR</div>
                                <div>Ticket No.</div>
                            </div>

                            <div className="space-y-6">
                                {/* CPTUWK */}
                                <div>
                                    <div className="bg-slate-100 py-1.5 px-3 font-bold text-slate-600 text-[12px] mb-2">MTDPNR: <span className="text-slate-800 underline">CPTUWK</span></div>
                                    <div className="space-y-3 px-3">
                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-1 sm:gap-4 text-[12px] font-bold text-slate-700 border-b sm:border-0 pb-2 sm:pb-0">
                                            <div>Mr. Harshit Chirgania</div>
                                            <div className="text-slate-500 font-medium"><span className="sm:hidden font-bold text-slate-400 mr-1">PNR:</span>XYUZ1245</div>
                                            <div className="text-slate-500 font-medium"><span className="sm:hidden font-bold text-slate-400 mr-1">Ticket:</span>98712845612</div>
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-1 sm:gap-4 text-[12px] font-bold text-slate-700 border-b sm:border-0 pb-2 sm:pb-0">
                                            <div>Mr. Ajay Saxena</div>
                                            <div className="text-slate-500 font-medium"><span className="sm:hidden font-bold text-slate-400 mr-1">PNR:</span>AAUC9802</div>
                                            <div className="text-slate-500 font-medium"><span className="sm:hidden font-bold text-slate-400 mr-1">Ticket:</span>10823561273</div>
                                        </div>
                                    </div>
                                </div>

                                {/* CPWLWB */}
                                <div>
                                    <div className="bg-slate-100 py-1.5 px-3 font-bold text-slate-600 text-[12px] mb-2">MTDPNR: <span className="text-slate-800 underline">CPWLWB</span></div>
                                    <div className="space-y-3 px-3">
                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-1 sm:gap-4 text-[12px] font-bold text-slate-700 border-b sm:border-0 pb-2 sm:pb-0">
                                            <div>Mrs. Ayushi Kushwaha</div>
                                            <div className="text-slate-500 font-medium"><span className="sm:hidden font-bold text-slate-400 mr-1">PNR:</span>AWUC3802</div>
                                            <div className="text-slate-500 font-medium"><span className="sm:hidden font-bold text-slate-400 mr-1">Ticket:</span>23712845612</div>
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-1 sm:gap-4 text-[12px] font-bold text-slate-700 border-b sm:border-0 pb-2 sm:pb-0">
                                            <div>Mr. Ayush Kushwaha</div>
                                            <div className="text-slate-500 font-medium"><span className="sm:hidden font-bold text-slate-400 mr-1">PNR:</span>XYUZ1245</div>
                                            <div className="text-slate-500 font-medium"><span className="sm:hidden font-bold text-slate-400 mr-1">Ticket:</span>10823561273</div>
                                        </div>
                                    </div>
                                </div>

                                {/* CPWLWW */}
                                <div>
                                    <div className="bg-slate-100 py-1.5 px-3 font-bold text-slate-600 text-[12px] mb-2">MTDPNR: <span className="text-slate-800 underline">CPWLWW</span></div>
                                    <div className="space-y-3 px-3">
                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-1 sm:gap-4 text-[12px] font-bold text-slate-700 border-b sm:border-0 pb-2 sm:pb-0">
                                            <div>Mr. Harshit Kushwaha</div>
                                            <div className="text-slate-500 font-medium"><span className="sm:hidden font-bold text-slate-400 mr-1">PNR:</span>XYUZ1245</div>
                                            <div className="text-slate-500 font-medium"><span className="sm:hidden font-bold text-slate-400 mr-1">Ticket:</span>90912845612</div>
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-1 sm:gap-4 text-[12px] font-bold text-slate-700 border-b sm:border-0 pb-2 sm:pb-0">
                                            <div>Mr. Ajay Saxena</div>
                                            <div className="text-slate-500 font-medium"><span className="sm:hidden font-bold text-slate-400 mr-1">PNR:</span>AWUC3899</div>
                                            <div className="text-slate-500 font-medium"><span className="sm:hidden font-bold text-slate-400 mr-1">Ticket:</span>10823961273</div>
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-1 sm:gap-4 text-[12px] font-bold text-slate-700 border-b sm:border-0 pb-2 sm:pb-0">
                                            <div>Mr. Ajay Mehra</div>
                                            <div className="text-slate-500 font-medium"><span className="sm:hidden font-bold text-slate-400 mr-1">PNR:</span>XYUZ1245</div>
                                            <div className="text-slate-500 font-medium"><span className="sm:hidden font-bold text-slate-400 mr-1">Ticket:</span>00823561273</div>
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-1 sm:gap-4 text-[12px] font-bold text-slate-700 border-b sm:border-0 pb-2 sm:pb-0">
                                            <div>Mr. Ajay Rajput</div>
                                            <div className="text-slate-500 font-medium"><span className="sm:hidden font-bold text-slate-400 mr-1">PNR:</span>BWUC3802</div>
                                            <div className="text-slate-500 font-medium"><span className="sm:hidden font-bold text-slate-400 mr-1">Ticket:</span>11823561273</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}
            </div>

            {/* Booking Details Modal */}
            {selectedBooking && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-200 p-4">
                    <div className="bg-white rounded-2xl w-full max-w-[550px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="bg-[#F2FBFF] p-6 relative shrink-0 border-b border-green-100">
                            <button onClick={() => setSelectedBooking(null)} className="absolute top-6 right-6 text-slate-500 hover:bg-white/50 p-1 rounded-full"><X className="w-5 h-5" /></button>
                            <div className="flex items-center gap-3 mb-2">
                                <span className="font-extrabold text-[20px] text-slate-800">{selectedBooking.displayId || selectedBooking.id}</span>
                                <span className="text-emerald-600 font-bold text-[14px]">Confirmed</span>
                            </div>
                            <div className="text-slate-500 font-medium text-[13px]">DEL to MUM, 2025 Jul 26, 16:30</div>
                        </div>
                        
                        <div className="p-6 overflow-y-auto bg-white flex-1 space-y-8">
                            {/* General information */}
                            <div>
                                <div className="font-bold text-[15px] text-slate-800 mb-4">General information</div>
                                <div className="flex items-center justify-between py-2.5 border-b border-slate-100">
                                    <div className="flex items-center gap-2 text-[13px] font-bold text-slate-600">
                                        <div className="w-3 h-3 bg-slate-300 rounded-sm"></div> Group PNR
                                    </div>
                                    <div className="font-bold text-slate-800 text-[13px]">UYS12345</div>
                                </div>
                                <div className="flex items-center justify-between py-2.5 border-b border-slate-100">
                                    <div className="flex items-center gap-2 text-[13px] font-bold text-slate-600">
                                        <div className="w-3 h-3 bg-[#D60D26] rounded-sm"></div> MTDPNR reference
                                    </div>
                                    <div className="font-bold text-slate-800 text-[13px]">{selectedBooking.displayId || selectedBooking.id}</div>
                                </div>
                                <div className="flex items-center justify-between py-2.5 border-b border-slate-100">
                                    <div className="flex items-center gap-2 text-[13px] font-bold text-slate-600">
                                        <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" /></svg> Reservation
                                    </div>
                                    <a href="#" className="font-bold text-slate-800 text-[13px] underline decoration-slate-300 hover:decoration-slate-500 underline-offset-2">Check reservation ↗</a>
                                </div>
                            </div>

                            {/* Passengers */}
                            <div>
                                <div className="font-bold text-[15px] text-slate-800 mb-4">Passengers</div>
                                <div className="space-y-3">
                                    <div className="border border-slate-200 rounded-xl p-4 flex items-center justify-between hover:bg-slate-50 cursor-pointer transition-colors shadow-sm">
                                        <div>
                                            <div className="font-bold text-slate-700 text-[14px]">Harshit Chirgania</div>
                                            <div className="text-[12px] text-slate-400 mt-1 font-medium">Male • Born 04/04/96</div>
                                        </div>
                                        <ChevronDown className="w-5 h-5 text-slate-400" />
                                    </div>
                                    <div className="border border-slate-200 rounded-xl p-4 flex items-center justify-between hover:bg-slate-50 cursor-pointer transition-colors shadow-sm">
                                        <div>
                                            <div className="font-bold text-slate-700 text-[14px]">Vaibhav Sharma</div>
                                            <div className="text-[12px] text-slate-400 mt-1 font-medium">Male • Born 04/04/96</div>
                                        </div>
                                        <ChevronDown className="w-5 h-5 text-slate-400" />
                                    </div>
                                </div>
                            </div>

                            {/* Ancillaries */}
                            <div>
                                <div className="font-bold text-[15px] text-slate-800 mb-4">Ancillaries</div>
                                <div className="flex items-center justify-between py-2">
                                    <div className="flex items-center gap-3">
                                        <svg className="w-5 h-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
                                        <div>
                                            <div className="font-bold text-slate-700 text-[14px]">Checked baggage</div>
                                            <div className="text-[12px] text-slate-400 font-medium mt-0.5">4 * 20Kg • Free</div>
                                        </div>
                                    </div>
                                    <div className="font-bold text-blue-600 text-[12px]">INCLUDED</div>
                                </div>
                            </div>
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
                                    To change the seat volume: <button className="text-[#D60D26] font-bold hover:underline">Add PNR</button>
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
