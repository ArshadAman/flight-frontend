"use client";

import React, { useState } from "react";
import { ArrowLeft, ArrowRight, ArrowRightLeft, X, Plane, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function AddFlightPage() {
    const router = useRouter();
    const [step, setStep] = useState(0); // 0 = empty, 1 = filled + dep date, 2 = return date

    const handleSelectRoute = () => {
        if (step === 0) setStep(1);
    };

    // Calendar mock
    const renderCalendar = (title: string, month: string) => (
        <div className="bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden w-[320px] flex flex-col">
            <div className="bg-[#4b4347] text-white text-center py-2.5 text-[12px] font-bold tracking-widest uppercase">
                {title}
            </div>
            <div className="bg-[#fdeaea] text-slate-800 flex items-center justify-between px-5 py-3 font-extrabold text-[15px]">
                <ChevronLeft className="w-5 h-5 cursor-pointer text-slate-600 hover:text-black" />
                {month}
                <ChevronRight className="w-5 h-5 cursor-pointer text-slate-600 hover:text-black" />
            </div>
            <div className="p-5 bg-white">
                <div className="grid grid-cols-7 text-center text-[13px] font-bold mb-4">
                    <div className="text-[#C1161E]">S</div>
                    <div className="text-slate-600">M</div>
                    <div className="text-slate-600">T</div>
                    <div className="text-slate-600">W</div>
                    <div className="text-slate-600">T</div>
                    <div className="text-slate-600">F</div>
                    <div className="text-[#C1161E]">S</div>
                </div>
                <div className="grid grid-cols-7 text-center text-[14px] gap-y-4 font-bold text-slate-700">
                    <div className="text-slate-300 font-medium">26</div><div className="text-slate-300 font-medium">27</div><div className="text-slate-300 font-medium">28</div><div className="text-slate-300 font-medium">29</div><div className="text-slate-300 font-medium">30</div><div className="text-slate-300 font-medium">31</div><div className="hover:bg-slate-100 rounded-full cursor-pointer w-8 h-8 flex items-center justify-center mx-auto">1</div>
                    <div className="hover:bg-slate-100 rounded-full cursor-pointer w-8 h-8 flex items-center justify-center mx-auto">2</div><div className="hover:bg-slate-100 rounded-full cursor-pointer w-8 h-8 flex items-center justify-center mx-auto">3</div><div className="hover:bg-slate-100 rounded-full cursor-pointer w-8 h-8 flex items-center justify-center mx-auto">4</div><div className="hover:bg-slate-100 rounded-full cursor-pointer w-8 h-8 flex items-center justify-center mx-auto">5</div><div className="hover:bg-slate-100 rounded-full cursor-pointer w-8 h-8 flex items-center justify-center mx-auto">6</div><div className="hover:bg-slate-100 rounded-full cursor-pointer w-8 h-8 flex items-center justify-center mx-auto">7</div><div className="hover:bg-slate-100 rounded-full cursor-pointer w-8 h-8 flex items-center justify-center mx-auto">8</div>
                    <div className="hover:bg-slate-100 rounded-full cursor-pointer w-8 h-8 flex items-center justify-center mx-auto">9</div><div className="hover:bg-slate-100 rounded-full cursor-pointer w-8 h-8 flex items-center justify-center mx-auto">10</div><div className="hover:bg-slate-100 rounded-full cursor-pointer w-8 h-8 flex items-center justify-center mx-auto">11</div><div className="hover:bg-slate-100 rounded-full cursor-pointer w-8 h-8 flex items-center justify-center mx-auto">12</div><div className="hover:bg-slate-100 rounded-full cursor-pointer w-8 h-8 flex items-center justify-center mx-auto">13</div><div className="hover:bg-slate-100 rounded-full cursor-pointer w-8 h-8 flex items-center justify-center mx-auto">14</div><div className="hover:bg-slate-100 rounded-full cursor-pointer w-8 h-8 flex items-center justify-center mx-auto">15</div>
                    <div className="hover:bg-slate-100 rounded-full cursor-pointer w-8 h-8 flex items-center justify-center mx-auto">16</div><div className="hover:bg-slate-100 rounded-full cursor-pointer w-8 h-8 flex items-center justify-center mx-auto">17</div><div className="hover:bg-slate-100 rounded-full cursor-pointer w-8 h-8 flex items-center justify-center mx-auto">18</div><div className="hover:bg-slate-100 rounded-full cursor-pointer w-8 h-8 flex items-center justify-center mx-auto">19</div><div className="hover:bg-slate-100 rounded-full cursor-pointer w-8 h-8 flex items-center justify-center mx-auto">20</div><div className="hover:bg-slate-100 rounded-full cursor-pointer w-8 h-8 flex items-center justify-center mx-auto">21</div><div className="hover:bg-slate-100 rounded-full cursor-pointer w-8 h-8 flex items-center justify-center mx-auto">22</div>
                    <div className="hover:bg-slate-100 rounded-full cursor-pointer w-8 h-8 flex items-center justify-center mx-auto">23</div><div className="hover:bg-slate-100 rounded-full cursor-pointer w-8 h-8 flex items-center justify-center mx-auto">24</div><div className="hover:bg-slate-100 rounded-full cursor-pointer w-8 h-8 flex items-center justify-center mx-auto">25</div><div className="hover:bg-slate-100 rounded-full cursor-pointer w-8 h-8 flex items-center justify-center mx-auto">26</div><div className="hover:bg-slate-100 rounded-full cursor-pointer w-8 h-8 flex items-center justify-center mx-auto">27</div><div className="hover:bg-slate-100 rounded-full cursor-pointer w-8 h-8 flex items-center justify-center mx-auto">28</div><div className="hover:bg-slate-100 rounded-full cursor-pointer w-8 h-8 flex items-center justify-center mx-auto">29</div>
                    <div className="hover:bg-slate-100 rounded-full cursor-pointer w-8 h-8 flex items-center justify-center mx-auto">30</div><div className="text-slate-300 font-medium">1</div><div className="text-slate-300 font-medium">2</div><div className="text-slate-300 font-medium">3</div><div className="text-slate-300 font-medium">4</div><div className="text-slate-300 font-medium">5</div><div className="text-slate-300 font-medium">6</div>
                </div>
            </div>
        </div>
    );

    return (
        <div className="w-full h-screen flex flex-col bg-[#a3ccce] overflow-hidden font-sans relative">
            {/* Header */}
            <div className="w-full h-16 bg-gradient-to-r from-[#C1161E] to-[#2b1723] text-white flex items-center justify-between px-6 z-20 shrink-0">
                <button onClick={() => router.back()} className="flex items-center gap-2 font-bold text-[15px] hover:text-white/80 transition-colors">
                    <ArrowLeft className="w-5 h-5" /> Add flights
                </button>
                <div className="flex items-center gap-3 text-[14px]">
                    <div className="flex flex-col items-center relative">
                        <span className="font-bold">Route</span>
                        <div className="w-1.5 h-1.5 bg-white rounded-full absolute -bottom-1"></div>
                    </div>
                    <ArrowRight className="w-3 h-3 text-white/50" />
                    <span className="text-white/70 font-medium">Flights</span>
                    <ArrowRight className="w-3 h-3 text-white/50" />
                    <span className="text-white/70 font-medium">Confirmation</span>
                </div>
                <div className="w-[120px]"></div> {/* Spacer for centering */}
            </div>

            {/* Map Background Placeholder */}
            <div className="absolute inset-0 z-0 top-16 bottom-20 opacity-80" 
                 style={{
                     backgroundImage: `url('https://upload.wikimedia.org/wikipedia/commons/e/ec/World_map_blank_without_borders.svg')`,
                     backgroundSize: 'cover',
                     backgroundPosition: 'center',
                     opacity: 0.3
                 }}
            >
                {step > 0 && (
                    <svg className="absolute inset-0 w-full h-full z-10 pointer-events-none">
                        <path d="M 450 350 Q 750 200 1050 400" fill="none" stroke="#333" strokeWidth="2.5" strokeDasharray="8 8" />
                        <circle cx="450" cy="350" r="8" fill="#C1161E" stroke="white" strokeWidth="2" />
                        <circle cx="1050" cy="400" r="8" fill="#1e73be" stroke="white" strokeWidth="2" />
                        
                        <g transform="translate(550, 260) rotate(18)">
                            <Plane className="w-10 h-10 text-[#C1161E] fill-white drop-shadow-md" />
                        </g>
                    </svg>
                )}
            </div>

            {/* Floating Overlay Container */}
            <div className="relative z-20 flex-1 flex flex-col items-center pt-10 pointer-events-none">
                
                {/* Route Input Card */}
                <div 
                    className="bg-white rounded-[24px] shadow-2xl p-4 flex items-center gap-4 w-[600px] pointer-events-auto cursor-pointer transition-transform hover:scale-[1.02]" 
                    onClick={handleSelectRoute}
                >
                    <div className="flex-1 px-6">
                        {step === 0 ? (
                            <div className="text-slate-400 font-bold text-[18px]">Origin</div>
                        ) : (
                            <div>
                                <div className="text-[12px] text-slate-400 font-bold uppercase tracking-wider mb-1">Origin</div>
                                <div className="font-extrabold text-slate-800 text-[20px]">New Delhi <span className="text-[#C1161E]">(DEL)</span></div>
                            </div>
                        )}
                    </div>
                    
                    <div className="w-12 h-12 rounded-full border border-[#C1161E] text-[#C1161E] flex items-center justify-center shrink-0">
                        <ArrowRight className="w-5 h-5" />
                    </div>

                    <div className="flex-1 px-6">
                        {step === 0 ? (
                            <div className="text-slate-400 font-bold text-[18px]">Destination</div>
                        ) : (
                            <div>
                                <div className="text-[12px] text-slate-400 font-bold uppercase tracking-wider mb-1">Destination</div>
                                <div className="font-extrabold text-slate-800 text-[20px]">Bangkok <span className="text-[#C1161E]">(BKK)</span></div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Calendar Pickers */}
                {step > 0 && (
                    <div className="mt-10 flex gap-6 pointer-events-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {step === 1 && renderCalendar("DEPARTURE", "October 2025")}
                        
                        {step === 2 && (
                            <>
                                {renderCalendar("FROM", "October 2025")}
                                {renderCalendar("TO", "November 2025")}
                            </>
                        )}
                    </div>
                )}
            </div>

            {/* Bottom Footer */}
            <div className="w-full h-[88px] bg-white border-t border-slate-200 flex items-center justify-between px-10 z-30 shrink-0 shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
                <div className="flex items-center gap-6">
                    {step > 0 ? (
                        <>
                            <button className="flex items-center gap-2 text-[#C1161E] font-bold hover:bg-rose-50 px-4 py-2 rounded-lg transition-colors text-[15px]">
                                <X className="w-4 h-4" /> Add flight series
                            </button>
                            <div className="w-px h-6 bg-slate-300"></div>
                            <button className="text-slate-500 font-bold hover:text-slate-700 underline underline-offset-4 text-[15px] decoration-2">
                                How flight series work
                            </button>
                        </>
                    ) : (
                        <div></div>
                    )}
                </div>

                <div className="flex items-center gap-4">
                    {step === 1 && (
                        <button onClick={() => setStep(2)} className="border border-[#C1161E] text-[#C1161E] hover:bg-rose-50 rounded-full px-8 py-3.5 font-bold text-[15px] flex items-center gap-2 transition-colors">
                            <ArrowRightLeft className="w-4 h-4" /> Add return flight
                        </button>
                    )}
                    
                    <button 
                        className={`rounded-full px-10 py-3.5 font-bold text-[15px] flex items-center gap-2 transition-colors ${
                            step > 0 
                                ? 'bg-[#C1161E] hover:bg-[#a01219] text-white shadow-md' 
                                : 'bg-[#f4a7a9] text-white cursor-not-allowed'
                        }`}
                    >
                        Add Flights Details <ArrowRight className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
}
