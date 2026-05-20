"use client";

import React, { useState } from "react";
import { B2BNavbar } from "@/components/B2BNavbar";
import { Footer } from "@/components/Footer";
import { ArrowUpRight, BarChart3, FileText, TrendingUp, Calendar } from "lucide-react";

export default function B2BReportsPage() {
    const [activeSubTab, setActiveSubTab] = useState("ledger");

    return (
        <div className="w-full min-h-screen bg-slate-50 flex flex-col font-sans">
            <B2BNavbar />

            {/* Gradient Top Banner */}
            <div className="w-full bg-gradient-to-r from-primary to-[#0B132B] py-14">
                <div className="container mx-auto px-6 lg:px-12 text-center text-white">
                    <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-2">
                        B2B Reports / Business Analytics
                    </h1>
                    <p className="text-rose-100/80 text-sm md:text-base font-medium max-w-xl mx-auto">
                        Monitor your transaction ledgers, booking reports, and overall agent performance analytics.
                    </p>
                </div>
            </div>

            {/* Tabbed Reports Section */}
            <main className="container mx-auto px-6 lg:px-12 py-12 flex-1">
                {/* Statistics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
                        <div className="p-4 bg-rose-50 text-primary rounded-xl shrink-0">
                            <TrendingUp className="w-6 h-6" />
                        </div>
                        <div>
                            <h4 className="text-slate-400 text-xs font-bold uppercase tracking-wider">Total Sales</h4>
                            <p className="text-2xl font-extrabold text-slate-800">₹ 8,42,100</p>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
                        <div className="p-4 bg-blue-50 text-blue-600 rounded-xl shrink-0">
                            <BarChart3 className="w-6 h-6" />
                        </div>
                        <div>
                            <h4 className="text-slate-400 text-xs font-bold uppercase tracking-wider">Total Commission Earned</h4>
                            <p className="text-2xl font-extrabold text-slate-800">₹ 34,250</p>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
                        <div className="p-4 bg-emerald-50 text-emerald-600 rounded-xl shrink-0">
                            <FileText className="w-6 h-6" />
                        </div>
                        <div>
                            <h4 className="text-slate-400 text-xs font-bold uppercase tracking-wider">Active bookings</h4>
                            <p className="text-2xl font-extrabold text-slate-800">12 Bookings</p>
                        </div>
                    </div>
                </div>

                {/* Dashboard Frame */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                    {/* Tab Navigation */}
                    <div className="border-b border-slate-100 bg-slate-50/50 flex flex-wrap">
                        {["ledger", "bookings", "search"].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveSubTab(tab)}
                                className={`px-8 py-5 text-sm font-extrabold uppercase tracking-wider border-b-2 transition-colors ${
                                    activeSubTab === tab
                                        ? "border-[#DF1B24] text-primary"
                                        : "border-transparent text-slate-400 hover:text-slate-600"
                                }`}
                            >
                                {tab === "ledger" ? "Agent Ledger" : tab === "bookings" ? "Booking Report" : "Search Analytics"}
                            </button>
                        ))}
                    </div>

                    {/* Tab Contents */}
                    <div className="p-8">
                        {activeSubTab === "ledger" && (
                            <div className="animate-in fade-in duration-200">
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="text-xl font-bold text-slate-800">Recent Transactions</h3>
                                    <button className="text-[#DF1B24] hover:underline font-bold text-sm flex items-center gap-1">
                                        Export Ledger <ArrowUpRight className="w-4 h-4" />
                                    </button>
                                </div>
                                <div className="w-full overflow-x-auto">
                                    <table className="w-full min-w-[700px] text-[14px]">
                                        <thead>
                                            <tr className="border-b border-slate-100 text-slate-400 text-left font-bold pb-2">
                                                <th className="pb-3">Date</th>
                                                <th className="pb-3">Reference No</th>
                                                <th className="pb-3">Particulars</th>
                                                <th className="pb-3">Credit</th>
                                                <th className="pb-3">Debit</th>
                                                <th className="pb-3">Balance</th>
                                            </tr>
                                        </thead>
                                        <tbody className="text-slate-600 font-medium">
                                            <tr className="border-b border-slate-100 py-4">
                                                <td className="py-4">20 May 2026</td>
                                                <td className="py-4 font-mono">TXN8491849</td>
                                                <td className="py-4">Online Payment Deposit - Wallet</td>
                                                <td className="py-4 text-emerald-600">+₹ 25,000</td>
                                                <td className="py-4">-</td>
                                                <td className="py-4 font-bold">₹ 1,24,500</td>
                                            </tr>
                                            <tr className="border-b border-slate-100 py-4">
                                                <td className="py-4">19 May 2026</td>
                                                <td className="py-4 font-mono">BKG9104810</td>
                                                <td className="py-4">Flight Ticket Booking (DEL-MUM)</td>
                                                <td className="py-4">-</td>
                                                <td className="py-4 text-primary">₹ 6,340</td>
                                                <td className="py-4 font-bold">₹ 99,500</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {activeSubTab === "bookings" && (
                            <div className="animate-in fade-in duration-200 text-center py-12 text-slate-400">
                                <BarChart3 className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                                <p className="font-bold text-lg text-slate-600">No Booking Reports Available</p>
                                <p className="text-sm">Configure date filters to fetch customized ticket logs.</p>
                            </div>
                        )}

                        {activeSubTab === "search" && (
                            <div className="animate-in fade-in duration-200 text-center py-12 text-slate-400">
                                <TrendingUp className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                                <p className="font-bold text-lg text-slate-600">Search Report Empty</p>
                                <p className="text-sm">Agent API search log will populate dynamically when searches are initiated.</p>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
