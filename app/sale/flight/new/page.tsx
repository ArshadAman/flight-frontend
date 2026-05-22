"use client";

import React, { useState } from "react";
import { ArrowLeft, ArrowRight, ArrowRightLeft, X, Plane, ChevronLeft, ChevronRight, Search, Check } from "lucide-react";
import { useRouter } from "next/navigation";
import { COUNTRIES } from "@/lib/data/countries";

export default function AddFlightPage() {
    const router = useRouter();
    const [step, setStep] = useState(0); // 0 = empty, 1 = filled + dep date, 2 = return date, 3 = schedule screen
    
    const [origin, setOrigin] = useState("");
    const [destination, setDestination] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [activeInput, setActiveInput] = useState<"origin" | "destination" | null>(null);
    const [selectedDate, setSelectedDate] = useState<number | null>(null);
    
    // Modal states
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSegmentConfirmed, setIsSegmentConfirmed] = useState(false);

    const filteredCountries = COUNTRIES.filter(country => 
        country.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleSelectCountry = (country: string) => {
        if (activeInput === "origin") {
            setOrigin(country);
            setActiveInput("destination");
            setSearchQuery("");
        } else if (activeInput === "destination") {
            setDestination(country);
            setActiveInput(null);
            setSearchQuery("");
            if (origin) {
                setStep(1);
            }
        }
    };

    const handleAddFlightDetails = () => {
        if (step > 0 && selectedDate) {
            setStep(3);
        } else if (!selectedDate && step > 0) {
            alert("Please select a date from the calendar first.");
        }
    };

    // Calendar mock
    const renderCalendar = (title: string, month: string) => (
        <div className="bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden w-[320px] flex flex-col pointer-events-auto">
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
                    <div className="text-slate-300 font-medium">26</div><div className="text-slate-300 font-medium">27</div><div className="text-slate-300 font-medium">28</div><div className="text-slate-300 font-medium">29</div><div className="text-slate-300 font-medium">30</div><div className="text-slate-300 font-medium">31</div>
                    {[...Array(30)].map((_, i) => (
                        <div 
                            key={i} 
                            onClick={() => setSelectedDate(i + 1)}
                            className={`rounded-full cursor-pointer w-8 h-8 flex items-center justify-center mx-auto transition-colors ${
                                selectedDate === i + 1 ? 'bg-[#C1161E] text-white' : 'hover:bg-slate-100 text-slate-700'
                            }`}
                        >
                            {i + 1}
                        </div>
                    ))}
                    <div className="text-slate-300 font-medium">1</div><div className="text-slate-300 font-medium">2</div><div className="text-slate-300 font-medium">3</div><div className="text-slate-300 font-medium">4</div><div className="text-slate-300 font-medium">5</div><div className="text-slate-300 font-medium">6</div>
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
                <div className="w-[120px]"></div>
            </div>

            {/* Map Background Placeholder (Only for steps 0-2) */}
            {step < 3 && (
                <div className="absolute inset-0 z-0 top-16 bottom-20 opacity-80" 
                     style={{
                         backgroundImage: `url('https://upload.wikimedia.org/wikipedia/commons/e/ec/World_map_blank_without_borders.svg')`,
                         backgroundSize: 'cover',
                         backgroundPosition: 'center',
                         opacity: 0.3
                     }}
                >
                    {step > 0 && origin && destination && (
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
            )}

            {/* Step 0-2 View */}
            {step < 3 && (
                <div className="relative z-20 flex-1 flex flex-col items-center pt-10 pointer-events-none">
                    <div className="bg-white rounded-[24px] shadow-2xl p-4 flex items-center gap-4 w-[800px] pointer-events-auto transition-transform hover:scale-[1.01] relative">
                        <div 
                            className={`flex-1 px-6 py-2 rounded-xl cursor-text transition-colors ${activeInput === "origin" ? "bg-slate-50 ring-2 ring-[#C1161E]/20" : "hover:bg-slate-50"}`}
                            onClick={() => setActiveInput("origin")}
                        >
                            <div className="text-[12px] text-slate-400 font-bold uppercase tracking-wider mb-1">Origin</div>
                            {activeInput === "origin" ? (
                                <input 
                                    autoFocus
                                    type="text" 
                                    className="w-full bg-transparent outline-none font-extrabold text-slate-800 text-[20px] placeholder:text-slate-300"
                                    placeholder="Search country..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            ) : (
                                <div className="font-extrabold text-slate-800 text-[20px] truncate">
                                    {origin || <span className="text-slate-300">Select Origin</span>}
                                </div>
                            )}
                        </div>
                        
                        <div className="w-12 h-12 rounded-full border border-[#C1161E] text-[#C1161E] flex items-center justify-center shrink-0 bg-white z-10">
                            <ArrowRight className="w-5 h-5" />
                        </div>

                        <div 
                            className={`flex-1 px-6 py-2 rounded-xl cursor-text transition-colors ${activeInput === "destination" ? "bg-slate-50 ring-2 ring-[#C1161E]/20" : "hover:bg-slate-50"}`}
                            onClick={() => setActiveInput("destination")}
                        >
                            <div className="text-[12px] text-slate-400 font-bold uppercase tracking-wider mb-1">Destination</div>
                            {activeInput === "destination" ? (
                                <input 
                                    autoFocus
                                    type="text" 
                                    className="w-full bg-transparent outline-none font-extrabold text-slate-800 text-[20px] placeholder:text-slate-300"
                                    placeholder="Search country..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            ) : (
                                <div className="font-extrabold text-slate-800 text-[20px] truncate">
                                    {destination || <span className="text-slate-300">Select Destination</span>}
                                </div>
                            )}
                        </div>

                        {activeInput && (
                            <div className="absolute top-full left-0 mt-4 w-full bg-white rounded-2xl shadow-xl border border-slate-100 max-h-[300px] overflow-y-auto z-50">
                                {filteredCountries.length > 0 ? (
                                    filteredCountries.map((country, idx) => (
                                        <div 
                                            key={idx}
                                            className="px-6 py-4 hover:bg-slate-50 cursor-pointer flex items-center gap-3 border-b border-slate-50 last:border-0"
                                            onClick={() => handleSelectCountry(country)}
                                        >
                                            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                                                <Search className="w-4 h-4 text-slate-400" />
                                            </div>
                                            <div className="font-bold text-slate-700 text-[16px]">{country}</div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="p-8 text-center text-slate-400 font-medium">
                                        No countries found.
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

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
            )}

            {/* Step 3 View: Schedule Screen */}
            {step === 3 && (
                <div className="flex-1 bg-[#f8f9fc] flex flex-col items-center w-full relative z-30 overflow-y-auto">
                    {/* Header route text */}
                    <div className="w-full bg-white pt-6 px-10">
                        <div className="font-extrabold text-slate-800 flex items-center gap-3 text-[18px]">
                            {origin} <span className="text-slate-400">({origin.substring(0,3).toUpperCase()})</span>
                            <div className="w-6 h-6 rounded-full border border-[#C1161E] flex items-center justify-center">
                                <ArrowRight className="w-3 h-3 text-[#C1161E]" />
                            </div>
                            {destination} <span className="text-slate-400">({destination.substring(0,3).toUpperCase()})</span>
                        </div>
                    </div>

                    {/* Header Tabs */}
                    <div className="w-full bg-white px-10 flex items-center gap-12 border-b border-slate-200 mt-6">
                        <div className="font-bold text-[#C1161E] border-b-4 border-[#C1161E] py-4 cursor-pointer">Sundays</div>
                        <div className="font-bold text-slate-300 py-4 cursor-pointer hover:text-slate-500">Mondays</div>
                        <div className="font-bold text-slate-800 py-4 cursor-pointer">Tuesdays</div>
                        <div className="font-bold text-slate-300 py-4 cursor-pointer hover:text-slate-500">Wednesdays</div>
                        <div className="font-bold text-slate-300 py-4 cursor-pointer hover:text-slate-500">Thursdays</div>
                        <div className="font-bold text-slate-300 py-4 cursor-pointer hover:text-slate-500">Fridays</div>
                        <div className="font-bold text-slate-300 py-4 cursor-pointer hover:text-slate-500">Saturdays</div>
                    </div>

                    <div className="w-[1100px] mt-10">
                        {/* Main card */}
                        <div className="bg-white rounded-[24px] shadow-sm border border-slate-200 p-8 mb-6">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="flex items-center gap-2 border border-slate-200 rounded-xl px-4 py-2 font-bold text-slate-700 text-[14px]">
                                    {origin.substring(0,3).toUpperCase()} <ArrowRight className="w-4 h-4 text-[#C1161E]" /> {destination.substring(0,3).toUpperCase()}
                                </div>
                                <div className="flex items-center border border-[#C1161E] rounded-xl overflow-hidden font-bold">
                                    <div className="bg-[#C1161E] text-white px-3 py-2 text-[14px]">OCT</div>
                                    <div className="bg-white text-[#C1161E] px-3 py-2 text-[14px]">{selectedDate?.toString().padStart(2, '0') || "05"}</div>
                                </div>
                            </div>

                            <div 
                                onClick={() => setIsModalOpen(true)}
                                className="w-full bg-[#1b4379] rounded-[12px] p-5 flex items-center justify-between text-white cursor-pointer hover:bg-[#15345e] transition-colors border-2 border-[#102a4c]"
                            >
                                <div className="flex items-center gap-4">
                                    <Plane className="w-10 h-10 fill-white" />
                                </div>
                                <div className="font-bold text-[18px] flex items-center gap-2">
                                    Schedule A Flights <ArrowRight className="w-5 h-5" />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-[24px] shadow-sm border border-slate-200 p-8 flex items-center justify-center gap-3 text-[#C1161E] font-bold text-[16px]">
                            <ArrowRightLeft className="w-5 h-5" /> No return flight
                        </div>
                    </div>
                </div>
            )}

            {/* Bottom Footer */}
            <div className="w-full h-[88px] bg-white border-t border-slate-200 flex items-center justify-between px-10 z-30 shrink-0 shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
                {step < 3 ? (
                    <>
                        <div className="flex items-center gap-6">
                            {step > 0 && (
                                <>
                                    <button className="flex items-center gap-2 text-[#C1161E] font-bold hover:bg-rose-50 px-4 py-2 rounded-lg transition-colors text-[15px]">
                                        <X className="w-4 h-4" /> Add flight series
                                    </button>
                                    <div className="w-px h-6 bg-slate-300"></div>
                                    <button className="text-slate-500 font-bold hover:text-slate-700 underline underline-offset-4 text-[15px] decoration-2">
                                        How flight series work
                                    </button>
                                </>
                            )}
                        </div>
                        <div className="flex items-center gap-4">
                            {step === 1 && (
                                <button onClick={() => setStep(2)} className="border border-[#C1161E] text-[#C1161E] hover:bg-rose-50 rounded-full px-8 py-3.5 font-bold text-[15px] flex items-center gap-2 transition-colors">
                                    <ArrowRightLeft className="w-4 h-4" /> Add return flight
                                </button>
                            )}
                            <button 
                                onClick={handleAddFlightDetails}
                                className={`rounded-full px-10 py-3.5 font-bold text-[15px] flex items-center gap-2 transition-colors ${
                                    step > 0 && selectedDate 
                                        ? 'bg-[#C1161E] hover:bg-[#a01219] text-white shadow-md cursor-pointer' 
                                        : 'bg-[#f4a7a9] text-white cursor-not-allowed'
                                }`}
                            >
                                Add Flights Details <ArrowRight className="w-5 h-5" />
                            </button>
                        </div>
                    </>
                ) : (
                    <>
                        <button onClick={() => setStep(1)} className="border border-slate-300 text-slate-600 font-bold hover:bg-slate-50 px-8 py-3 rounded-full transition-colors text-[15px]">
                            Change The Route
                        </button>
                        <button className="bg-[#f4a7a9] text-white hover:bg-[#C1161E] px-10 py-3.5 rounded-full font-bold text-[15px] transition-colors flex items-center gap-2">
                            Check And Confirm <ArrowRight className="w-5 h-5" />
                        </button>
                    </>
                )}
            </div>
            
            {/* Click outside handler for dropdown */}
            {activeInput && (
                <div 
                    className="fixed inset-0 z-10 pointer-events-auto"
                    onClick={() => setActiveInput(null)}
                />
            )}

            {/* Modal for "Schedule A Flights" */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 pointer-events-auto animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl w-[900px] shadow-2xl overflow-hidden flex flex-col">
                        {/* Modal Header */}
                        <div className="bg-gradient-to-r from-[#C1161E] to-[#2b1723] text-white p-6 relative">
                            <button onClick={() => setIsModalOpen(false)} className="absolute top-6 right-6 hover:bg-white/20 p-1 rounded-full transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                            <div className="font-bold text-[16px] mb-1">New flights</div>
                            <div className="font-extrabold text-[18px] flex items-center gap-2">
                                {origin} ({origin.substring(0,3).toUpperCase()}) 
                                <div className="w-5 h-5 rounded-full border border-white flex items-center justify-center mx-1">
                                    <ArrowRight className="w-3 h-3 text-white" />
                                </div> 
                                {destination} ({destination.substring(0,3).toUpperCase()})
                            </div>
                        </div>

                        {/* Modal Tabs */}
                        <div className="flex items-center justify-center gap-12 border-b border-slate-100 font-bold text-[14px] pt-4">
                            <div className="text-[#C1161E] border-b-2 border-[#C1161E] pb-4 px-2">1. Flight detail</div>
                            <div className="text-slate-400 pb-4 px-2">2. Baggages</div>
                            <div className="text-slate-400 pb-4 px-2">3. Seats</div>
                            <div className="text-slate-400 pb-4 px-2">4. Dates</div>
                            <div className="text-slate-400 pb-4 px-2">5. Policies</div>
                        </div>

                        {/* Modal Body */}
                        <div className="p-8">
                            {/* Timeline Graphic */}
                            <div className="flex items-center justify-between relative mb-10">
                                <div className="absolute left-4 right-4 top-1/2 -translate-y-1/2 border-t-2 border-dashed border-slate-300"></div>
                                <div className="relative z-10 w-5 h-5 bg-white border-[3px] border-slate-800 rounded-full"></div>
                                <Plane className="w-6 h-6 text-slate-400 relative z-10 bg-white" />
                                <div className="relative z-10 flex flex-col items-center">
                                    <div className="w-7 h-7 bg-white border border-[#C1161E] text-[#C1161E] rounded-full flex items-center justify-center cursor-pointer mb-1 text-[20px]">+</div>
                                    <span className="text-[#C1161E] font-bold text-[12px] absolute top-8 w-[100px] text-center underline underline-offset-2">Add a stop over</span>
                                </div>
                                <Plane className="w-6 h-6 text-slate-400 relative z-10 bg-white" />
                                <div className="relative z-10 w-5 h-5 bg-slate-800 rounded-full"></div>
                            </div>

                            {/* Form Fields */}
                            <div className="flex gap-8">
                                <div className="flex-1 space-y-6">
                                    <div className="flex gap-4">
                                        <div className="w-32">
                                            <label className="text-[12px] font-bold text-slate-500 mb-1 block">DEL local time</label>
                                            <div className="border border-slate-200 rounded-lg p-3.5 flex items-center gap-2">
                                                <div className="w-4 h-4 rounded-full border-2 border-slate-400"></div>
                                                <span className="font-bold text-slate-700">23 : 00</span>
                                            </div>
                                        </div>
                                        <div className="flex-1">
                                            <label className="text-[12px] font-bold text-slate-500 mb-1 block">Airport</label>
                                            <input type="text" className="w-full border border-slate-200 rounded-lg p-3.5 bg-slate-50 font-bold text-slate-500 outline-none" value={`${origin.substring(0,3).toUpperCase()} (${origin})`} readOnly />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-[12px] font-bold text-slate-500 mb-1 block">Airline</label>
                                        <select className="w-full border border-slate-200 rounded-lg p-3.5 font-bold text-slate-400 appearance-none bg-white outline-none">
                                            <option>Airline</option>
                                        </select>
                                        <div className="text-[12px] font-bold text-slate-400 mt-2 cursor-pointer hover:text-slate-600">+ add technical stop</div>
                                    </div>
                                    <div className="flex gap-4">
                                        <div className="flex-1">
                                            <label className="text-[12px] font-bold text-slate-500 mb-1 block">Flight number</label>
                                            <input type="text" className="w-full border border-slate-200 rounded-lg p-3.5 font-bold tracking-widest text-slate-400 outline-none" placeholder="- - - -" />
                                        </div>
                                        <div className="flex-1">
                                            <label className="text-[12px] font-bold text-slate-500 mb-1 block">Terminal</label>
                                            <select className="w-full border border-slate-200 rounded-lg p-3.5 font-bold text-slate-700 appearance-none bg-white outline-none">
                                                <option>Terminal 3</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex-1 space-y-6">
                                    <div className="flex gap-4">
                                        <div className="flex-1">
                                            <label className="text-[12px] font-bold text-slate-500 mb-1 block">Airport</label>
                                            <select className="w-full border border-slate-200 rounded-lg p-3.5 bg-white font-bold text-slate-700 appearance-none outline-none">
                                                <option>BOM (Bombay)</option>
                                            </select>
                                        </div>
                                        <div className="w-32">
                                            <label className="text-[12px] font-bold text-slate-500 mb-1 block">__ local time</label>
                                            <div className="border border-slate-200 rounded-lg p-3.5 flex items-center gap-2">
                                                <div className="w-4 h-4 rounded-full border-2 border-slate-400"></div>
                                                <span className="font-bold text-slate-700">03 : 00</span>
                                            </div>
                                            <label className="flex items-center gap-2 mt-2 cursor-pointer">
                                                <div className={`w-4 h-4 rounded flex items-center justify-center ${isSegmentConfirmed ? 'bg-[#C1161E]' : 'border border-slate-300'}`}>
                                                    {isSegmentConfirmed && <Check className="w-3 h-3 text-white" />}
                                                </div>
                                                <span className="text-[12px] font-bold text-slate-600">+1 day</span>
                                            </label>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-[12px] font-bold text-slate-500 mb-1 block">Terminal</label>
                                        <select className="w-full border border-slate-200 rounded-lg p-3.5 font-bold text-slate-700 appearance-none bg-white outline-none">
                                            <option>Terminal 3</option>
                                        </select>
                                    </div>
                                    <div className="pt-2">
                                        {isSegmentConfirmed ? (
                                            <div className="flex flex-col gap-2">
                                                <div className="text-[12px] font-bold text-blue-600 flex items-center gap-1">
                                                    <div className="w-3 h-3 border-2 border-blue-600 rounded-full flex items-center justify-center">
                                                        <div className="w-1 h-1 bg-blue-600 rounded-full"></div>
                                                    </div>
                                                    Calculated flight duration : 4 hours
                                                </div>
                                                <button onClick={() => setIsSegmentConfirmed(false)} className="w-full bg-green-50 text-green-600 border border-green-200 font-bold py-3.5 rounded-lg transition-colors flex items-center justify-center gap-2">
                                                    <Check className="w-4 h-4" /> Confirm segment
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col gap-2">
                                                <div className="text-[12px] font-bold text-amber-500 flex flex-col">
                                                    <span>It seems that the arrival is the day after. Just click on</span>
                                                    <span className="underline">+ 1 day to correct it</span>
                                                </div>
                                                <button onClick={() => setIsSegmentConfirmed(true)} className="w-full bg-slate-100 text-slate-400 font-bold py-3.5 rounded-lg hover:bg-slate-200 transition-colors">
                                                    Confirm segment
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="p-6 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-4 mt-auto">
                            <button className="flex-1 border-2 border-slate-200 text-slate-400 font-bold py-3.5 rounded-xl hover:bg-slate-100 transition-colors">
                                Back Step
                            </button>
                            <button className="flex-1 bg-[#f4a7a9] text-white font-bold py-3.5 rounded-xl hover:bg-[#C1161E] transition-colors flex items-center justify-center gap-2 shadow-sm">
                                Next Step <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
