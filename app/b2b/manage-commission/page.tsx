"use client";

import React, { useState } from "react";
import { B2BNavbar } from "@/components/B2BNavbar";
import { Footer } from "@/components/Footer";
import { ChevronDown, Plus } from "lucide-react";
import Link from "next/link";

type Tab = "No Calculation" | "Flat Calculation" | "Standard Calculation" | "Simple Calculation" | "Custom Calculation";

export default function B2BManageCommissionPage() {
    const [activeCategory, setActiveCategory] = useState<"Flight" | "Rebooking">("Flight");
    const [activeTab, setActiveTab] = useState<Tab>("No Calculation");

    return (
        <div className="w-full min-h-screen bg-white flex flex-col font-sans">
            <B2BNavbar />

            {/* Dark Red Navigation Header */}
            <div className="w-full bg-gradient-to-r from-[#C1161E] to-[#1a0b16] text-white">
                <div className="container mx-auto px-6 lg:px-12 py-4">
                    <div className="flex items-center gap-6 mb-6 text-sm">
                        <div className="flex items-center text-white/80">
                            <Link href="/b2b/my-account" className="hover:text-white transition-colors">My Account</Link>
                            <span className="mx-2">→</span>
                            <span className="text-white">Manage Commission</span>
                        </div>
                        
                        <div className="flex items-center gap-6 ml-4">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${activeCategory === 'Flight' ? 'border-white' : 'border-white/50'}`}>
                                    {activeCategory === 'Flight' && <div className="w-2 h-2 bg-white rounded-full"></div>}
                                </div>
                                <input type="radio" className="hidden" checked={activeCategory === 'Flight'} onChange={() => setActiveCategory('Flight')} />
                                <span className={activeCategory === 'Flight' ? 'text-white font-medium' : 'text-white/80'}>Flight</span>
                            </label>
                            
                            <label className="flex items-center gap-2 cursor-pointer">
                                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${activeCategory === 'Rebooking' ? 'border-white' : 'border-white/50'}`}>
                                    {activeCategory === 'Rebooking' && <div className="w-2 h-2 bg-white rounded-full"></div>}
                                </div>
                                <input type="radio" className="hidden" checked={activeCategory === 'Rebooking'} onChange={() => setActiveCategory('Rebooking')} />
                                <span className={activeCategory === 'Rebooking' ? 'text-white font-medium' : 'text-white/80'}>Rebooking</span>
                            </label>
                        </div>
                    </div>

                    <div className="flex items-center gap-8 text-sm font-medium">
                        {(["No Calculation", "Flat Calculation", "Standard Calculation", "Simple Calculation", "Custom Calculation"] as Tab[]).map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`relative pb-2 transition-colors ${activeTab === tab ? 'text-white font-bold' : 'text-white/80 hover:text-white'}`}
                            >
                                {tab}
                                {activeTab === tab && (
                                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-white rounded-full"></div>
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <main className="flex-1 w-full flex flex-col items-center">
                
                {/* Header Row (Only for some tabs) */}
                {activeTab !== "Custom Calculation" && (
                    <div className="w-full bg-[#f4f9fc] border-b border-slate-100 py-6">
                        <div className="container mx-auto px-6 lg:px-12 flex justify-between items-center max-w-5xl">
                            <div className="flex items-center gap-4">
                                <h1 className="text-2xl font-bold text-slate-700">All Fares types:</h1>
                                <span className="bg-[#1e73be] text-white text-xs font-bold px-2 py-1 rounded">PUB</span>
                            </div>
                            <button className="bg-[#C1161E] hover:bg-[#a01219] text-white px-8 py-2 rounded-full font-bold text-sm transition-colors">
                                Edit
                            </button>
                        </div>
                    </div>
                )}

                <div className="container mx-auto px-6 lg:px-12 py-10 w-full max-w-5xl">
                    
                    {activeTab === "No Calculation" && (
                        <p className="text-slate-600 font-medium">
                            No markup for flights stored. Please select one of the options above for adding a calculation.
                        </p>
                    )}

                    {activeTab === "Flat Calculation" && (
                        <div className="w-full space-y-6">
                            <div className="bg-[#f4f9fc] rounded-3xl p-8 flex items-center gap-6">
                                <span className="text-slate-600 font-medium text-lg w-40">Your Markup:</span>
                                <input 
                                    type="text" 
                                    defaultValue="$20.00" 
                                    className="border border-slate-200 rounded-full px-6 py-2.5 w-48 text-center font-medium text-slate-700 outline-none focus:border-[#1e73be]"
                                />
                            </div>
                            <div className="flex gap-4">
                                <button className="flex-1 bg-[#C1161E] hover:bg-[#a01219] text-white py-3 rounded-full font-bold transition-colors">
                                    Upload
                                </button>
                                <button className="flex-1 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 py-3 rounded-full font-bold transition-colors">
                                    Cancel
                                </button>
                            </div>
                        </div>
                    )}

                    {activeTab === "Standard Calculation" && (
                        <div className="w-full space-y-6">
                            <p className="text-slate-500 italic mb-6">This calculation is not editable. It is the default calculation.</p>
                            <div className="bg-[#f4f9fc] rounded-3xl p-8 space-y-6">
                                <div className="flex items-center gap-6">
                                    <span className="text-slate-600 font-medium text-lg w-48">Domestic & IATA EU:</span>
                                    <input type="text" defaultValue="$20.00" disabled className="border border-slate-200 rounded-full px-6 py-2.5 w-48 text-center font-medium text-slate-700 bg-white" />
                                </div>
                                <div className="flex items-center gap-6">
                                    <span className="text-slate-600 font-medium text-lg w-48">Worldwide:</span>
                                    <input type="text" defaultValue="$20.00" disabled className="border border-slate-200 rounded-full px-6 py-2.5 w-48 text-center font-medium text-slate-700 bg-white" />
                                </div>
                                <div className="flex items-center gap-6">
                                    <span className="text-slate-600 font-medium text-lg w-48">LOW /DIR / CHA:</span>
                                    <input type="text" defaultValue="$20.00" disabled className="border border-slate-200 rounded-full px-6 py-2.5 w-48 text-center font-medium text-slate-700 bg-white" />
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <button className="flex-1 bg-[#C1161E] hover:bg-[#a01219] text-white py-3 rounded-full font-bold transition-colors">
                                    Upload
                                </button>
                                <button className="flex-1 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 py-3 rounded-full font-bold transition-colors">
                                    Cancel
                                </button>
                            </div>
                        </div>
                    )}

                    {activeTab === "Simple Calculation" && (
                        <div className="w-full space-y-6">
                            <div className="bg-[#f4f9fc] rounded-3xl p-8 space-y-6">
                                <div className="flex items-center gap-6">
                                    <span className="text-slate-600 font-medium text-lg w-48">Domestic & IATA EU:</span>
                                    <input type="text" defaultValue="$20.00" className="border border-slate-200 rounded-full px-6 py-2.5 w-48 text-center font-medium text-slate-700 outline-none focus:border-[#1e73be] bg-white" />
                                </div>
                                <div className="flex items-center gap-6">
                                    <span className="text-slate-600 font-medium text-lg w-48">Worldwide:</span>
                                    <input type="text" defaultValue="$20.00" className="border border-slate-200 rounded-full px-6 py-2.5 w-48 text-center font-medium text-slate-700 outline-none focus:border-[#1e73be] bg-white" />
                                </div>
                                <div className="flex items-center gap-6">
                                    <span className="text-slate-600 font-medium text-lg w-48">LOW /DIR / CHA:</span>
                                    <input type="text" defaultValue="$20.00" className="border border-slate-200 rounded-full px-6 py-2.5 w-48 text-center font-medium text-slate-700 outline-none focus:border-[#1e73be] bg-white" />
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <button className="flex-1 bg-[#C1161E] hover:bg-[#a01219] text-white py-3 rounded-full font-bold transition-colors">
                                    Upload
                                </button>
                                <button className="flex-1 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 py-3 rounded-full font-bold transition-colors">
                                    Cancel
                                </button>
                            </div>
                        </div>
                    )}

                    {activeTab === "Custom Calculation" && (
                        <div className="w-full space-y-4 pt-4">
                            {[
                                "Conso NET fares (0)",
                                "Published fares (0)",
                                "Negotiated fares (0)",
                                "LOW/DIR/CHA (0)"
                            ].map((fareType, i) => (
                                <div key={i} className="bg-[#f4f9fc] rounded-3xl p-6 flex items-center justify-between">
                                    <div className="flex items-center gap-6">
                                        <span className="text-slate-700 font-medium text-xl w-64">{fareType}</span>
                                        <div className="flex gap-2">
                                            <div className="w-10 h-8 bg-slate-200 rounded"></div>
                                            <div className="w-10 h-8 bg-slate-200 rounded"></div>
                                            <div className="w-10 h-8 bg-slate-200 rounded"></div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <button className="flex items-center gap-1 text-[#C1161E] font-medium border border-[#C1161E] rounded-full px-4 py-1.5 hover:bg-rose-50 transition-colors">
                                            <Plus className="w-4 h-4" /> Add
                                        </button>
                                        <button className="text-slate-400 hover:text-slate-600">
                                            <ChevronDown className="w-6 h-6" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                </div>
            </main>

            <Footer />
        </div>
    );
}

