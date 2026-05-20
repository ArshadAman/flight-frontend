"use client";

import React, { useState } from "react";
import { B2BNavbar } from "@/components/B2BNavbar";
import { Footer } from "@/components/Footer";
import { DollarSign, ShieldAlert, Award, Save } from "lucide-react";

export default function B2BManageCommissionPage() {
    const [markupType, setMarkupType] = useState("Percentage");
    const [markupValue, setMarkupValue] = useState("5");

    return (
        <div className="w-full min-h-screen bg-slate-50 flex flex-col font-sans">
            <B2BNavbar />

            {/* Gradient Top Banner */}
            <div className="w-full bg-gradient-to-r from-primary to-[#0F2027] py-14">
                <div className="container mx-auto px-6 lg:px-12 text-center text-white">
                    <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-2">
                        Manage Commissions & Markups
                    </h1>
                    <p className="text-rose-100/80 text-sm md:text-base font-medium max-w-xl mx-auto">
                        Define global or service-specific B2B pricing models and markups for automated client quote calculations.
                    </p>
                </div>
            </div>

            {/* Main Commission Settings Form */}
            <main className="container mx-auto px-6 lg:px-12 py-12 flex-1 max-w-[1200px]">
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-100 pb-6 mb-8 gap-4">
                        <div>
                            <h2 className="text-2xl font-bold text-slate-800">Dynamic Margin Settings</h2>
                            <p className="text-slate-400 text-sm font-medium mt-1">Configure markup rules applied on base supplier fares.</p>
                        </div>
                        <button className="bg-primary hover:bg-[#C1161E] text-white px-6 py-3 rounded-xl font-bold text-sm shadow-sm transition-colors flex items-center gap-2 active:scale-95">
                            <Save className="w-4 h-4" /> Save Markups
                        </button>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Markup Control Form */}
                        <div className="lg:col-span-2 space-y-6">
                            <div className="bg-slate-50 p-6 rounded-xl border border-slate-100 space-y-6">
                                <h3 className="text-[16px] font-bold text-slate-700">Flight Markup Rules</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div className="flex flex-col gap-2">
                                        <label className="text-slate-500 text-[12px] font-bold uppercase tracking-wider">Markup Type</label>
                                        <select 
                                            value={markupType}
                                            onChange={(e) => setMarkupType(e.target.value)}
                                            className="border border-slate-200 rounded-lg px-4 py-2.5 outline-none focus:border-[#DF1B24] text-[14px] font-semibold text-slate-800 bg-white"
                                        >
                                            <option value="Percentage">Percentage (%)</option>
                                            <option value="Fixed">Fixed Amount ($)</option>
                                        </select>
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <label className="text-slate-500 text-[12px] font-bold uppercase tracking-wider">Value</label>
                                        <div className="relative">
                                            <input 
                                                type="number"
                                                value={markupValue}
                                                onChange={(e) => setMarkupValue(e.target.value)}
                                                className="w-full border border-slate-200 rounded-lg pl-8 pr-4 py-2.5 outline-none focus:border-[#DF1B24] text-[14px] font-semibold text-slate-800"
                                            />
                                            <div className="absolute left-3 top-3 text-slate-400">
                                                {markupType === "Percentage" ? "%" : "$"}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-slate-50 p-6 rounded-xl border border-slate-100 space-y-6">
                                <h3 className="text-[16px] font-bold text-slate-700">Hotel Markup Rules</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div className="flex flex-col gap-2">
                                        <label className="text-slate-500 text-[12px] font-bold uppercase tracking-wider">Markup Type</label>
                                        <select className="border border-slate-200 rounded-lg px-4 py-2.5 outline-none focus:border-[#DF1B24] text-[14px] font-semibold text-slate-800 bg-white">
                                            <option value="percentage">Percentage (%)</option>
                                            <option value="fixed">Fixed Amount ($)</option>
                                        </select>
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <label className="text-slate-500 text-[12px] font-bold uppercase tracking-wider">Value</label>
                                        <input type="number" defaultValue="8" className="border border-slate-200 rounded-lg px-4 py-2.5 outline-none focus:border-[#DF1B24] text-[14px] font-semibold text-slate-800" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Sidebar Info Cards */}
                        <div className="space-y-6">
                            <div className="bg-rose-50 border border-rose-100 p-6 rounded-xl space-y-4">
                                <div className="flex items-center gap-2.5 text-primary">
                                    <ShieldAlert className="w-5 h-5" />
                                    <h4 className="font-extrabold text-[15px] tracking-tight">Active Ruleset</h4>
                                </div>
                                <p className="text-slate-600 text-sm leading-relaxed">
                                    These markup rules apply dynamically in real-time. When searching flights or booking packages, these markup prices will automatically reflect in quotes generated for your sub-agents or corporate customers.
                                </p>
                            </div>

                            <div className="bg-emerald-50 border border-emerald-100 p-6 rounded-xl space-y-4">
                                <div className="flex items-center gap-2.5 text-emerald-700">
                                    <Award className="w-5 h-5" />
                                    <h4 className="font-extrabold text-[15px] tracking-tight">Commission Summary</h4>
                                </div>
                                <div className="text-slate-600 text-sm space-y-2">
                                    <div className="flex justify-between font-medium">
                                        <span>Current Flight Markup:</span>
                                        <span className="font-bold text-slate-800">{markupValue}{markupType === "Percentage" ? "%" : "$"}</span>
                                    </div>
                                    <div className="flex justify-between font-medium">
                                        <span>Hotel Markup:</span>
                                        <span className="font-bold text-slate-800">8%</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
