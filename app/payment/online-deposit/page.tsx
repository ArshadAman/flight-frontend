"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

export default function OnlineDepositPage() {
    const [selectedMethod, setSelectedMethod] = useState("Card");
    const [agreed, setAgreed] = useState(false);

    return (
        <main className="min-h-screen bg-white flex flex-col font-sans relative">
            {/* Gradient Header */}
            <div className="w-full bg-gradient-to-r from-[#D60D26] via-[#30060F] to-[#121121] pt-6 pb-16 px-4 md:px-10 lg:px-20 relative z-0">
                {/* Breadcrumb */}
                <div className="text-[11px] font-medium text-white/70 mb-4 flex items-center gap-1">
                    <span className="cursor-pointer hover:text-white transition-colors">My Account</span>
                    <span>→</span>
                    <span>Payment</span>
                </div>

                {/* Navigation Links */}
                <div className="flex overflow-x-auto no-scrollbar items-center gap-6 md:gap-10 text-[14px] md:text-[15px] font-semibold text-white/80 w-[100vw] sm:w-auto -ml-4 sm:ml-0 px-4 sm:px-0 pb-2 sm:pb-0 whitespace-nowrap">
                    <div className="flex flex-col items-center justify-center relative text-white font-bold cursor-pointer">
                        <span>Online Payment Deposit</span>
                        <div className="absolute -bottom-2 w-1 h-1 bg-white rounded-full" />
                    </div>
                    <Link href="/payment/request" className="hover:text-white transition-colors cursor-pointer">
                        Payment Request
                    </Link>
                    <Link href="/payment/deposit-slip" className="hover:text-white transition-colors cursor-pointer">
                        Deposit Slip
                    </Link>
                    <Link href="/payment/due" className="hover:text-white transition-colors cursor-pointer">
                        Payment Due
                    </Link>
                </div>
            </div>

            {/* Main Content Container (Overlapping Header) */}
            <div className="flex-1 w-full max-w-[1440px] mx-auto px-4 md:px-10 lg:px-16 -mt-8 relative z-10 pb-20">
                <div className="bg-[#F2FBFF] w-full rounded-t-[2.5rem] rounded-b-[1.5rem] px-6 py-10 md:px-12 md:py-12 shadow-sm min-h-[500px]">
                    <h1 className="text-[22px] md:text-[24px] font-bold text-slate-800 mb-8">
                        Online payment request
                    </h1>

                    {/* Amount Input */}
                    <div className="mb-10 w-full max-w-[300px]">
                        <input
                            type="text"
                            placeholder="Amount To Pay"
                            className="w-full bg-transparent border-b border-slate-300 py-2 outline-none text-[16px] text-slate-800 font-semibold placeholder:text-slate-500 placeholder:font-medium focus:border-[#D60D26] transition-colors"
                        />
                    </div>

                    {/* Payment Method Box */}
                    <div className="w-full max-w-[900px]">
                        {/* Tab Header */}
                        <div className="bg-[#F2FBFF] text-[#D60D26] font-bold text-[14px] px-6 py-3 w-max rounded-t-xl">
                            <span className="text-slate-800">Payment Method</span>
                        </div>
                        
                        {/* Box Body */}
                        <div className="bg-white p-6 md:p-8 rounded-b-xl rounded-tr-xl shadow-sm border border-slate-100 flex flex-col gap-8">
                            
                            {/* Radio Group */}
                            <div className="flex items-center gap-6 md:gap-8">
                                {["Card", "Net Banking", "Wallet"].map((method) => (
                                    <label key={method} className="flex items-center gap-2.5 cursor-pointer group">
                                        <div className={cn(
                                            "w-[16px] h-[16px] rounded-full border-[1.5px] flex items-center justify-center transition-colors",
                                            selectedMethod === method ? "border-[#D60D26]" : "border-slate-400 group-hover:border-slate-600"
                                        )}>
                                            {selectedMethod === method && <div className="w-2 h-2 rounded-full bg-[#D60D26]" />}
                                        </div>
                                        <span className="text-[14px] font-bold text-slate-700">{method}</span>
                                    </label>
                                ))}
                            </div>

                            {/* Card Inputs */}
                            {selectedMethod === "Card" && (
                                <div className="flex flex-wrap gap-4 w-full">
                                    <input 
                                        type="text" 
                                        placeholder="Card Number" 
                                        className="flex-[2] min-w-[200px] border border-slate-200 rounded-lg px-4 py-2.5 outline-none focus:border-[#D60D26] text-[14px] font-medium text-slate-800 placeholder:text-slate-400"
                                    />
                                    <input 
                                        type="text" 
                                        placeholder="Month" 
                                        className="flex-[1] min-w-[80px] border border-slate-200 rounded-lg px-4 py-2.5 outline-none focus:border-[#D60D26] text-[14px] font-medium text-slate-800 placeholder:text-slate-400"
                                    />
                                    <input 
                                        type="text" 
                                        placeholder="Year" 
                                        className="flex-[1] min-w-[80px] border border-slate-200 rounded-lg px-4 py-2.5 outline-none focus:border-[#D60D26] text-[14px] font-medium text-slate-800 placeholder:text-slate-400"
                                    />
                                    <input 
                                        type="text" 
                                        placeholder="CVV" 
                                        className="flex-[1] min-w-[80px] border border-slate-200 rounded-lg px-4 py-2.5 outline-none focus:border-[#D60D26] text-[14px] font-medium text-slate-800 placeholder:text-slate-400"
                                    />
                                    <input 
                                        type="text" 
                                        placeholder="Full Name As On Card" 
                                        className="flex-[2] min-w-[200px] border border-slate-200 rounded-lg px-4 py-2.5 outline-none focus:border-[#D60D26] text-[14px] font-medium text-slate-800 placeholder:text-slate-400"
                                    />
                                </div>
                            )}

                            {/* Checkbox */}
                            <label className="flex items-center gap-2.5 cursor-pointer mt-2 w-max group">
                                <div className={cn(
                                    "w-4 h-4 rounded-[3px] border-[1.5px] flex items-center justify-center transition-colors",
                                    agreed ? "bg-white border-[#D60D26]" : "border-red-300 group-hover:border-[#D60D26]"
                                )}>
                                    {agreed && <svg className="w-3 h-3 text-[#D60D26]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                                </div>
                                <span className="text-[13px] font-bold text-slate-400 select-none">I Agree To The Terms And Conditions</span>
                            </label>

                        </div>
                    </div>
                </div>

                {/* Footer Action Buttons */}
                <div className="flex flex-row items-center gap-3 sm:gap-4 mt-8 max-w-[900px]">
                    <button className="flex-1 w-full h-[48px] sm:h-[54px] rounded-full border-[1.5px] border-slate-800 text-slate-900 font-bold text-[14px] sm:text-[16px] flex items-center justify-center gap-1 sm:gap-2 hover:bg-slate-50 transition-colors active:scale-[0.98]">
                        Cancel <ArrowUpRight className="w-4 h-4 sm:w-5 sm:h-5" strokeWidth={2.5} />
                    </button>
                    <button className="flex-1 w-full h-[48px] sm:h-[54px] rounded-full bg-[#D60D26] text-white font-bold text-[14px] sm:text-[16px] flex items-center justify-center gap-1 sm:gap-2 hover:bg-[#D60D26] transition-colors shadow-md active:scale-[0.98]">
                        Make A Payment <ArrowUpRight className="w-4 h-4 sm:w-5 sm:h-5" strokeWidth={2.5} />
                    </button>
                </div>
            </div>
        </main>
    );
}
