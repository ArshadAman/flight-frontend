"use client";

import React, { useState } from "react";
import { SaleNavbar } from "@/components/SaleNavbar";
import { Footer } from "@/components/Footer";
import { Filter, Search, FileText, X, ChevronDown, Check } from "lucide-react";

export default function HistoryPage() {
    const [selectedEntry, setSelectedEntry] = useState<any>(null);

    const historyEntries = [
        { id: 1, date: "26July, 25", time: "11:50", action: "Address Changed", agent: "SAN" },
        { id: 2, date: "26July, 25", time: "14:50", action: "Address Changed", agent: "HAR" },
        { id: 3, date: "26July, 25", time: "15:09", action: "Contact Number Changed", agent: "HAR" },
        { id: 4, date: "26July, 25", time: "15:55", action: "Address Changed", agent: "HAR" },
        { id: 5, date: "26July, 25", time: "16:43", action: "Contact Number Changed", agent: "SAN" },
        { id: 6, date: "26July, 25", time: "17:01", action: "Address Changed", agent: "AJY" },
        { id: 7, date: "26July, 25", time: "17:20", action: "Contact Number Changed", agent: "AJY" },
        { id: 8, date: "26July, 25", time: "17:20", action: "Contact Number Changed", agent: "AJY" },
    ];

    return (
        <div className="w-full min-h-screen bg-slate-50 flex flex-col font-sans">
            <SaleNavbar />

            {/* Main Content */}
            <div className="flex-1 w-full flex overflow-hidden relative">
                <main className="flex-1 overflow-y-auto transition-all duration-300 flex flex-col items-center">
                    <div className="container mx-auto px-6 lg:px-10 py-6 w-full max-w-[1400px]">
                    
                    {/* Header Controls */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 mb-8 mt-2 w-full">
                        <button className="flex items-center gap-2 text-[#D60D26] font-bold hover:bg-rose-50 px-4 py-2 rounded-lg transition-colors shrink-0 w-full sm:w-auto justify-center sm:justify-start border border-rose-100 sm:border-transparent">
                            <Filter className="w-5 h-5" /> Filters
                        </button>
                        
                        <div className="flex-1 w-full sm:max-w-[600px] relative">
                            <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                            <input 
                                type="text" 
                                placeholder="Search History (PNR, name...)" 
                                className="w-full pl-12 pr-4 py-2.5 rounded-xl border border-slate-200 outline-none focus:border-slate-300 shadow-sm text-[14px]"
                            />
                        </div>
                    </div>

                    {/* Flights Table */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mb-8">
                        
                        {/* Table Stats and Sort Header */}
                        <div className="px-6 py-5 flex items-center justify-between border-b border-slate-100">
                            <div className="font-bold text-slate-800 text-[15px]">Entries 106</div>
                            <div className="flex items-center gap-2 text-[14px]">
                                <span className="text-slate-500">Sort by</span>
                                <button className="font-bold text-slate-800 flex items-center gap-1 hover:text-slate-600">
                                    Recommended <ChevronDown className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        <div className="overflow-x-auto no-scrollbar">
                            <div className="w-full min-w-[700px]">
                                {/* Table Header */}
                                <div className="grid grid-cols-[1fr_1fr_1fr_2.5fr_1fr] gap-4 px-6 py-4 border-b border-slate-100 bg-white text-slate-400 text-[13px] font-bold">
                                    <div>Date</div>
                                    <div>Time</div>
                                    <div>Action</div>
                                    <div>Entry</div>
                                    <div>By Agent</div>
                                </div>

                                {/* Table Rows */}
                                <div className="flex flex-col">
                                    {historyEntries.map((entry, i) => (
                                        <div 
                                            key={i} 
                                            onClick={() => setSelectedEntry(entry)}
                                            className="grid grid-cols-[1fr_1fr_1fr_2.5fr_1fr] gap-4 items-center py-4 border-b border-slate-50 text-[13px] font-medium transition-colors px-6 cursor-pointer text-slate-700 hover:bg-slate-50"
                                        >
                                            <div className="text-slate-600 font-bold">{entry.date}</div>
                                            <div className="text-slate-600 font-bold">{entry.time}</div>
                                            <div>
                                                <FileText className="w-5 h-5 text-blue-500" />
                                            </div>
                                            <div className="font-bold text-slate-800">{entry.action}</div>
                                            <div className="text-slate-600">{entry.agent}</div>
                                        </div>
                                    ))}
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

            {/* History Details Modal */}
            {selectedEntry && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-200 p-4">
                    <div className="bg-white rounded-2xl w-full max-w-[500px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="bg-[#F2FBFF] p-6 relative shrink-0 border-b border-green-100">
                            <button onClick={() => setSelectedEntry(null)} className="absolute top-6 right-6 text-slate-500 hover:bg-white/50 p-1 rounded-full transition-colors"><X className="w-5 h-5" /></button>
                            <div className="flex flex-col gap-1">
                                <span className="font-extrabold text-[20px] text-slate-800">{selectedEntry.date}</span>
                                <span className="text-slate-500 font-medium text-[13px]">{selectedEntry.time} , By {selectedEntry.agent}</span>
                            </div>
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
                                        <div className="w-3 h-3 bg-[#D60D26] rounded-sm transform rotate-45"></div> Airline Route
                                    </div>
                                    <div className="font-bold text-slate-800 text-[13px]">DEL - BOM</div>
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
                                <div className="border border-slate-200 rounded-xl p-5 shadow-sm">
                                    <div className="mb-6">
                                        <div className="font-bold text-slate-700 text-[14px]">Harshit Chirgania</div>
                                        <div className="text-[12px] text-slate-400 mt-1 font-medium">Male • Born 04/04/96</div>
                                    </div>
                                    <div className="flex items-center justify-between mb-4">
                                        <div>
                                            <div className="text-[12px] text-slate-500 font-bold mb-0.5">Contact Number</div>
                                            <div className="text-[14px] text-slate-600 font-medium">+91-1234567890</div>
                                        </div>
                                        <div className="bg-red-50 text-red-500 font-bold text-[12px] px-4 py-1.5 rounded-full">Erase</div>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <div className="text-[12px] text-slate-500 font-bold mb-0.5">Changed Contact Number</div>
                                            <div className="text-[14px] text-slate-600 font-medium">+91-9087654321</div>
                                        </div>
                                        <div className="bg-green-50 text-emerald-600 font-bold text-[12px] px-4 py-1.5 rounded-full">Approved</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            </div>
            <Footer />
        </div>
    );
}
