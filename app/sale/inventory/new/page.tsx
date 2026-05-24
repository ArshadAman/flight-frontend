"use client";

import React, { useState } from "react";
import { ArrowLeft, ArrowRight, ArrowRightLeft, X, Plane, ChevronLeft, ChevronRight, Search, Check, Clock, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";

type Airport = {
    code: string;
    city: string;
    country: string;
    name: string;
};

const AIRPORTS: Airport[] = [
    { code: "DEL", city: "New Delhi", country: "India", name: "Indira Gandhi International Airport" },
    { code: "BOM", city: "Mumbai", country: "India", name: "Chhatrapati Shivaji Maharaj International" },
    { code: "BLR", city: "Bangalore", country: "India", name: "Kempegowda International Airport" },
    { code: "MAA", city: "Chennai", country: "India", name: "Chennai International Airport" },
    { code: "CCU", city: "Kolkata", country: "India", name: "Netaji Subhas Chandra Bose International" },
    { code: "HYD", city: "Hyderabad", country: "India", name: "Rajiv Gandhi International Airport" },
    { code: "PNQ", city: "Pune", country: "India", name: "Pune Airport" },
    { code: "AMD", city: "Ahmedabad", country: "India", name: "Sardar Vallabhbhai Patel International" },
    { code: "GOI", city: "Goa", country: "India", name: "Dabolim Airport" },
    { code: "JAI", city: "Jaipur", country: "India", name: "Jaipur International Airport" },
    { code: "COK", city: "Cochin", country: "India", name: "Cochin International Airport" },
    { code: "LKO", city: "Lucknow", country: "India", name: "Chaudhary Charan Singh International" },
    { code: "GAU", city: "Guwahati", country: "India", name: "Lokpriya Gopinath Bordoloi International" },
    { code: "TRV", city: "Thiruvananthapuram", country: "India", name: "Trivandrum International Airport" },
    { code: "BBI", city: "Bhubaneswar", country: "India", name: "Biju Patnaik International Airport" },
    { code: "PAT", city: "Patna", country: "India", name: "Jay Prakash Narayan Airport" },
    { code: "IDR", city: "Indore", country: "India", name: "Devi Ahilya Bai Holkar Airport" },
    { code: "IXC", city: "Chandigarh", country: "India", name: "Chandigarh Airport" },
    { code: "JFK", city: "New York", country: "United States", name: "John F. Kennedy International" },
    { code: "LHR", city: "London", country: "United Kingdom", name: "Heathrow Airport" },
    { code: "DXB", city: "Dubai", country: "United Arab Emirates", name: "Dubai International Airport" },
    { code: "SIN", city: "Singapore", country: "Singapore", name: "Changi Airport" },
    { code: "CDG", city: "Paris", country: "France", name: "Charles de Gaulle Airport" },
    { code: "HND", city: "Tokyo", country: "Japan", name: "Haneda Airport" },
    { code: "SYD", city: "Sydney", country: "Australia", name: "Sydney Kingsford Smith Airport" },
    { code: "YYZ", city: "Toronto", country: "Canada", name: "Toronto Pearson International" },
    { code: "FRA", city: "Frankfurt", country: "Germany", name: "Frankfurt Airport" },
    { code: "HKG", city: "Hong Kong", country: "Hong Kong", name: "Hong Kong International Airport" },
    { code: "BKK", city: "Bangkok", country: "Thailand", name: "Suvarnabhumi Airport" },
];

export default function AddPNRPage() {
    const router = useRouter();
    const [step, setStep] = useState(0); // 0 = empty, 1 = filled + dep date, 2 = return date, 3 = schedule screen
    
    const [origin, setOrigin] = useState<Airport | null>(null);
    const [destination, setDestination] = useState<Airport | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [activeInput, setActiveInput] = useState<"origin" | "destination" | null>(null);
    const [selectedDate, setSelectedDate] = useState<number | null>(null);
    
    // Modal states
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [hasScheduledFlight, setHasScheduledFlight] = useState(false);
    const [modalTab, setModalTab] = useState(1);
    const [isSegmentConfirmed, setIsSegmentConfirmed] = useState(false);

    // Baggage State
    const [maxWeight, setMaxWeight] = useState("Weight");
    const [baggagePrice, setBaggagePrice] = useState("");
    const [isFreeBaggage, setIsFreeBaggage] = useState(false);

    // Seats State
    const [availableSeats, setAvailableSeats] = useState("");
    const [seatPrice, setSeatPrice] = useState("");

    // Segments state
    const [segments, setSegments] = useState([
        {
            id: 1,
            fromCode: "DEL", fromCity: "New Delhi", fromTerminal: "Terminal 3", fromTime: "23:00",
            toCode: "BOM", toCity: "Bombay", toTerminal: "Terminal 3", toTime: "03:00",
            airline: "Air India (AI 121)", duration: "4 hr",
            isEditing: false
        },
        {
            id: 2,
            fromCode: "BOM", fromCity: "Bombay", fromTerminal: "Terminal 3", fromTime: "05:00",
            toCode: "BKK", toCity: "Bangkok", toTerminal: "Terminal 3", toTime: "11:00",
            airline: "Air India (AI 121)", duration: "4 hr 30mins",
            isEditing: true
        }
    ]);

    const updateSegment = (id: number, field: string, value: any) => {
        setSegments(segments.map(seg => seg.id === id ? { ...seg, [field]: value } : seg));
    };

    const filteredAirports = AIRPORTS.filter(airport => 
        airport.country.toLowerCase().includes(searchQuery.toLowerCase()) ||
        airport.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
        airport.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        airport.code.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleSelectAirport = (airport: Airport) => {
        if (activeInput === "origin") {
            setOrigin(airport);
            setActiveInput("destination");
            setSearchQuery("");
        } else if (activeInput === "destination") {
            setDestination(airport);
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
        <div className="bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden w-[320px] flex flex-col pointer-events-auto shrink-0 mb-10">
            <div className="bg-[#0C2342] text-white text-center py-2.5 text-[12px] font-bold tracking-widest uppercase">
                {title}
            </div>
            <div className="bg-[#F2FBFF] text-slate-800 flex items-center justify-between px-5 py-3 font-extrabold text-[15px]">
                <ChevronLeft className="w-5 h-5 cursor-pointer text-slate-600 hover:text-black" />
                {month}
                <ChevronRight className="w-5 h-5 cursor-pointer text-slate-600 hover:text-black" />
            </div>
            <div className="p-5 bg-white">
                <div className="grid grid-cols-7 text-center text-[13px] font-bold mb-4">
                    <div className="text-[#D60D26]">S</div>
                    <div className="text-slate-600">M</div>
                    <div className="text-slate-600">T</div>
                    <div className="text-slate-600">W</div>
                    <div className="text-slate-600">T</div>
                    <div className="text-slate-600">F</div>
                    <div className="text-[#D60D26]">S</div>
                </div>
                <div className="grid grid-cols-7 text-center text-[14px] gap-y-4 font-bold text-slate-700">
                    <div className="text-slate-300 font-medium">26</div><div className="text-slate-300 font-medium">27</div><div className="text-slate-300 font-medium">28</div><div className="text-slate-300 font-medium">29</div><div className="text-slate-300 font-medium">30</div><div className="text-slate-300 font-medium">31</div>
                    {[...Array(30)].map((_, i) => (
                        <div 
                            key={i} 
                            onClick={() => setSelectedDate(i + 1)}
                            className={`rounded-full cursor-pointer w-8 h-8 flex items-center justify-center mx-auto transition-colors ${
                                selectedDate === i + 1 ? 'bg-[#D60D26] text-white' : 'hover:bg-slate-100 text-slate-700'
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
        <div className="w-full h-screen flex flex-col bg-[#FFA8B3] overflow-hidden font-sans relative">
            {/* Header */}
            <div className="w-full h-16 bg-gradient-to-r from-[#D60D26] to-[#121121] text-white flex items-center justify-between px-6 z-20 shrink-0 shadow-md">
                <button onClick={() => router.back()} className="flex items-center gap-2 font-bold text-[15px] hover:text-white/80 transition-colors">
                    <ArrowLeft className="w-5 h-5" /> Add PNR
                </button>
                <div className="flex items-center gap-3 text-[14px]">
                    <div className="flex flex-col items-center relative">
                        <span className="font-bold">Route</span>
                        <div className="w-1.5 h-1.5 bg-white rounded-full absolute -bottom-1"></div>
                    </div>
                    <ArrowRight className="w-3 h-3 text-white/50" />
                    <div className="flex flex-col items-center relative">
                        <span className={step === 3 ? "text-white font-bold" : "text-white/70 font-medium"}>Flights</span>
                        {step === 3 && <div className="w-1.5 h-1.5 bg-white rounded-full absolute -bottom-1"></div>}
                    </div>
                    <ArrowRight className="w-3 h-3 text-white/50" />
                    <div className="flex flex-col items-center relative">
                        <span className={step === 4 ? "text-white font-bold" : "text-white/70 font-medium"}>Confirmation</span>
                        {step === 4 && <div className="w-1.5 h-1.5 bg-white rounded-full absolute -bottom-1"></div>}
                    </div>
                </div>
                <div className="w-[120px]"></div>
            </div>

            {/* Map Background Placeholder (Only for steps 0-2) */}
            {step < 3 && (
                <div className="absolute inset-0 z-0 top-16 bottom-20 opacity-80 pointer-events-none" 
                     style={{
                         backgroundImage: `url('https://upload.wikimedia.org/wikipedia/commons/e/ec/World_map_blank_without_borders.svg')`,
                         backgroundSize: 'cover',
                         backgroundPosition: 'center',
                         opacity: 0.3
                     }}
                >
                    {step > 0 && origin && destination && (
                        <svg className="absolute inset-0 w-full h-full z-10 pointer-events-none">
                            <path d="M 450 350 Q 750 200 1050 400" fill="none" stroke="#0C2342" strokeWidth="2.5" strokeDasharray="8 8" />
                            <circle cx="450" cy="350" r="8" fill="#D60D26" stroke="white" strokeWidth="2" />
                            <circle cx="1050" cy="400" r="8" fill="#888" stroke="white" strokeWidth="2" />
                            <g transform="translate(550, 260) rotate(18)">
                                <Plane className="w-10 h-10 text-[#D60D26] fill-white drop-shadow-md" />
                            </g>
                        </svg>
                    )}
                </div>
            )}

            {/* Step 0-2 View */}
            {step < 3 && (
                <div className="relative z-20 flex-1 overflow-y-auto flex flex-col items-center pt-10 pb-20 px-4 pointer-events-none w-full">
                    <div className="bg-white rounded-[24px] shadow-2xl p-4 flex flex-col sm:flex-row items-center gap-4 w-full max-w-[800px] pointer-events-auto transition-transform hover:scale-[1.01] relative shrink-0 z-30">
                        <div 
                            className={`w-full sm:flex-1 px-6 py-2 rounded-xl cursor-text transition-colors ${activeInput === "origin" ? "bg-slate-50 ring-2 ring-[#D60D26]/20" : "hover:bg-slate-50"}`}
                            onClick={() => setActiveInput("origin")}
                        >
                            <div className="text-[12px] text-slate-400 font-bold uppercase tracking-wider mb-1">Origin</div>
                            {activeInput === "origin" ? (
                                <input 
                                    autoFocus
                                    type="text" 
                                    className="w-full bg-transparent outline-none font-extrabold text-slate-800 text-[20px] placeholder:text-slate-300"
                                    placeholder="Search country or airport..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            ) : (
                                <div className="font-extrabold text-slate-800 text-[20px] truncate">
                                    {origin ? `${origin.city} (${origin.code})` : <span className="text-slate-300">Select Origin</span>}
                                </div>
                            )}
                        </div>
                        
                        <div className="w-12 h-12 rounded-full border border-[#D60D26] text-[#D60D26] flex items-center justify-center shrink-0 bg-white z-10">
                            <ArrowRight className="w-5 h-5" />
                        </div>

                        <div 
                            className={`w-full sm:flex-1 px-6 py-2 rounded-xl cursor-text transition-colors ${activeInput === "destination" ? "bg-slate-50 ring-2 ring-[#D60D26]/20" : "hover:bg-slate-50"}`}
                            onClick={() => setActiveInput("destination")}
                        >
                            <div className="text-[12px] text-slate-400 font-bold uppercase tracking-wider mb-1">Destination</div>
                            {activeInput === "destination" ? (
                                <input 
                                    autoFocus
                                    type="text" 
                                    className="w-full bg-transparent outline-none font-extrabold text-slate-800 text-[20px] placeholder:text-slate-300"
                                    placeholder="Search country or airport..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            ) : (
                                <div className="font-extrabold text-slate-800 text-[20px] truncate">
                                    {destination ? `${destination.city} (${destination.code})` : <span className="text-slate-300">Select Destination</span>}
                                </div>
                            )}
                        </div>

                        {activeInput && (
                            <div className="absolute top-full left-0 mt-4 w-full bg-white rounded-2xl shadow-xl border border-slate-100 max-h-[300px] overflow-y-auto z-50">
                                {filteredAirports.length > 0 ? (
                                    filteredAirports.map((airport, idx) => (
                                        <div 
                                            key={idx}
                                            className="px-6 py-4 hover:bg-slate-50 cursor-pointer flex items-center gap-4 border-b border-slate-50 last:border-0"
                                            onClick={() => handleSelectAirport(airport)}
                                        >
                                            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                                                <Plane className="w-4 h-4 text-slate-400" />
                                            </div>
                                            <div>
                                                <div className="font-bold text-slate-700 text-[16px]">
                                                    {airport.city} <span className="text-[#D60D26]">({airport.code})</span>
                                                </div>
                                                <div className="text-[13px] text-slate-500 font-medium">
                                                    {airport.country} — {airport.name}
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="p-8 text-center text-slate-400 font-medium">
                                        No airports found.
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {step > 0 && (
                        <div className="mt-10 flex flex-col md:flex-row gap-6 pointer-events-auto animate-in fade-in slide-in-from-bottom-4 duration-500 relative z-20 items-center">
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
                <div className="flex-1 bg-[#F2FBFF] flex flex-col items-center w-full relative z-30 overflow-y-auto">
                    {/* Header route text */}
                    <div className="w-full bg-white pt-6 px-10">
                        <div className="font-extrabold text-slate-800 flex items-center gap-3 text-[18px]">
                            {origin?.city || "New Delhi"} <span className="text-slate-400">({origin?.code || "DEL"})</span>
                            <div className="w-6 h-6 rounded-full border border-[#D60D26] flex items-center justify-center">
                                <ArrowRight className="w-3 h-3 text-[#D60D26]" />
                            </div>
                            {destination?.city || "Bangkok"} <span className="text-slate-400">({destination?.code || "BKK"})</span>
                        </div>
                    </div>

                    {/* Header Tabs */}
                    <div className="w-full bg-white px-6 sm:px-10 flex items-center gap-8 sm:gap-12 border-b border-slate-200 mt-6 shrink-0 overflow-x-auto whitespace-nowrap no-scrollbar">
                        <div className="font-bold text-[#D60D26] border-b-4 border-[#D60D26] py-4 cursor-pointer">Sundays</div>
                        <div className="font-bold text-slate-300 py-4 cursor-pointer hover:text-slate-500">Mondays</div>
                        <div className="font-bold text-slate-800 py-4 cursor-pointer">Tuesdays</div>
                        <div className="font-bold text-slate-300 py-4 cursor-pointer hover:text-slate-500">Wednesdays</div>
                        <div className="font-bold text-slate-300 py-4 cursor-pointer hover:text-slate-500">Thursdays</div>
                        <div className="font-bold text-slate-300 py-4 cursor-pointer hover:text-slate-500">Fridays</div>
                        <div className="font-bold text-slate-300 py-4 cursor-pointer hover:text-slate-500">Saturdays</div>
                    </div>

                    <div className="w-full max-w-[1100px] px-4 sm:px-10 mt-10 pb-20">
                        {/* Main card */}
                        <div className="bg-white rounded-[24px] shadow-sm border border-slate-200 p-8 mb-6">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="flex items-center gap-2 border border-slate-200 rounded-xl px-4 py-2 font-bold text-slate-700 text-[14px]">
                                    {origin?.code || "DEL"} <ArrowRight className="w-4 h-4 text-[#D60D26]" /> {destination?.code || "BKK"}
                                </div>
                                <div className="flex items-center border border-[#D60D26] rounded-xl overflow-hidden font-bold">
                                    <div className="bg-[#D60D26] text-white px-3 py-2 text-[14px]">OCT</div>
                                    <div className="bg-white text-[#D60D26] px-3 py-2 text-[14px]">{selectedDate?.toString().padStart(2, '0') || "05"}</div>
                                </div>
                            </div>

                            <div 
                                onClick={() => setIsModalOpen(true)}
                                className="w-full bg-[#0C2342] rounded-[12px] p-5 flex items-center justify-between text-white cursor-pointer hover:bg-[#0C2342] transition-colors border-2 border-[#0C2342]"
                            >
                                <div className="flex items-center gap-4">
                                    <Plane className="w-10 h-10 fill-white" />
                                </div>
                                <div className="font-bold text-[18px] flex items-center gap-2">
                                    Schedule A Flights <ArrowRight className="w-5 h-5" />
                                </div>
                            </div>

                            {hasScheduledFlight && (
                                <div className="mt-4 flex items-stretch justify-between bg-white border border-slate-200 rounded-xl shadow-sm relative overflow-x-auto sm:overflow-hidden h-[70px] animate-in slide-in-from-top-2 duration-300">
                                    <div className="w-24 bg-[#D60D26] shrink-0"></div>
                                    <div className="flex-1 flex items-center px-4 sm:px-8 font-bold text-slate-600 text-[14px] justify-between min-w-[500px]">
                                        <div className="w-[180px]">AI 121(+1) / AI 242</div>
                                        <div className="w-[150px] text-center">AIR INDIA</div>
                                        <div className="w-[200px] text-right">23:00-03:00 / 05:00-11:00</div>
                                    </div>
                                    <button 
                                        onClick={() => setHasScheduledFlight(false)} 
                                        className="w-[70px] flex items-center justify-center border-l border-slate-200 hover:bg-slate-50 transition-colors"
                                    >
                                        <X className="w-5 h-5 text-slate-700" />
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="bg-white rounded-[24px] shadow-sm border border-slate-200 p-8 flex items-center justify-center gap-3 text-[#D60D26] font-bold text-[16px]">
                            <ArrowRightLeft className="w-5 h-5" /> No return flight
                        </div>
                    </div>
                </div>
            )}

            {/* Step 4 View: Confirmation Screen */}
            {step === 4 && (
                <div className="flex-1 bg-white flex flex-col w-full relative z-30 overflow-y-auto pt-10 px-4 sm:px-10 pb-20">
                    <div className="w-full max-w-[1400px] mx-auto">
                        <div className="overflow-x-auto">
                            <div className="min-w-[1000px]">
                                <div className="grid grid-cols-8 gap-4 text-[13px] font-bold text-slate-400 mb-4 px-4">
                            <div className="col-span-2">Route</div>
                            <div>Date</div>
                            <div>Time</div>
                            <div>Airlines</div>
                            <div>Flight numbers</div>
                            <div>No. of seats</div>
                            <div>Ticket fare</div>
                            <div>APIS</div>
                        </div>
                        
                        <div className="bg-slate-100 px-4 py-2 text-[13px] font-bold text-slate-700">
                            October, 2025
                        </div>
                        
                        <div className="border-b border-slate-200 grid grid-cols-8 gap-4 items-center py-6 px-4 text-[13px] font-bold text-slate-700">
                            <div className="flex flex-col col-span-2">
                                <span>DEL → MUM <span className="text-slate-400 font-medium">• (1 Stops)</span></span>
                            </div>
                            <div>Wed, 26 Jul 25</div>
                            <div>16:30 - 12:20(+1)</div>
                            <div>AIRINDIA</div>
                            <div>AI121 • AI242</div>
                            <div className="flex items-center gap-1.5">
                                <svg className="w-4 h-4 text-slate-400" fill="currentColor" viewBox="0 0 24 24"><path d="M4 18v3h2v-3h12v3h2v-3H4zm2-10h12v6H6V8zm0-4h12v2H6V4z"/></svg>
                                10
                            </div>
                            <div className="text-[14px]">$150.00</div>
                            <div>
                                <span className="border border-green-300 text-green-500 bg-green-50 rounded-full px-5 py-1.5 text-[12px] font-bold">Need</span>
                            </div>
                        </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Bottom Footer */}
            <div className="w-full min-h-[88px] py-4 bg-white border-t border-slate-200 flex flex-col sm:flex-row gap-4 items-center justify-between px-4 sm:px-10 z-30 shrink-0 shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
                {step < 3 ? (
                    <>
                        <div className="flex items-center gap-6">
                            {step > 0 && (
                                <>
                                    <button className="flex items-center gap-2 text-[#D60D26] font-bold hover:bg-rose-50 px-4 py-2 rounded-lg transition-colors text-[15px]">
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
                                <button onClick={() => setStep(2)} className="border border-[#D60D26] text-[#D60D26] hover:bg-rose-50 rounded-full px-4 sm:px-8 py-3.5 font-bold text-[13px] sm:text-[15px] flex items-center gap-2 transition-colors">
                                    <ArrowRightLeft className="w-4 h-4" /> Add return flight
                                </button>
                            )}
                            <button 
                                onClick={handleAddFlightDetails}
                                className={`rounded-full px-4 sm:px-10 py-3.5 font-bold text-[13px] sm:text-[15px] flex items-center gap-2 transition-colors ${
                                    step > 0 && selectedDate 
                                        ? 'bg-[#D60D26] hover:bg-[#D60D26] text-white shadow-md cursor-pointer' 
                                        : 'bg-[#FFA8B3] text-white cursor-not-allowed'
                                }`}
                            >
                                Add Flights Details <ArrowRight className="w-5 h-5" />
                            </button>
                        </div>
                    </>
                ) : (
                    <>
                        <button onClick={() => setStep(step - 1)} className="border border-slate-300 text-slate-600 font-bold hover:bg-slate-50 px-4 sm:px-8 py-3.5 rounded-full transition-colors text-[13px] sm:text-[15px]">
                            Change The Route
                        </button>
                        {step === 3 ? (
                            <button 
                                onClick={() => { if (hasScheduledFlight) setStep(4); }}
                                className={`px-4 sm:px-10 py-3.5 rounded-full font-bold text-[13px] sm:text-[15px] transition-colors flex items-center gap-2 ${
                                    hasScheduledFlight ? 'bg-[#D60D26] text-white hover:bg-[#D60D26] shadow-md' : 'bg-[#FFA8B3] text-white cursor-not-allowed'
                                }`}
                            >
                                Check And Confirm <ArrowRight className="w-5 h-5" />
                            </button>
                        ) : (
                            <button className="bg-[#D60D26] text-white hover:bg-[#D60D26] shadow-md px-10 py-3.5 rounded-full font-bold text-[15px] transition-colors flex items-center gap-2">
                                Create Flight 01 <ArrowRight className="w-4 h-4" />
                            </button>
                        )}
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
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 pointer-events-auto animate-in fade-in duration-200 p-4">
                    <div className="bg-white rounded-3xl w-full max-w-[900px] max-h-[90vh] shadow-2xl overflow-hidden flex flex-col">
                        {/* Modal Header */}
                        <div className="bg-gradient-to-r from-[#D60D26] to-[#121121] text-white p-6 relative shrink-0">
                            <button onClick={() => setIsModalOpen(false)} className="absolute top-6 right-6 hover:bg-white/20 p-1 rounded-full transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                            <div className="font-bold text-[16px] mb-1">New flights</div>
                            <div className="font-extrabold text-[18px] flex items-center gap-2">
                                {origin?.city || "New Delhi"} ({origin?.code || "DEL"}) 
                                <div className="w-5 h-5 rounded-full border border-white flex items-center justify-center mx-1">
                                    <ArrowRight className="w-3 h-3 text-white" />
                                </div> 
                                {destination?.city || "Bangkok"} ({destination?.code || "BKK"})
                            </div>
                        </div>

                        {/* Modal Tabs */}
                        <div className="flex items-center justify-start sm:justify-center gap-8 sm:gap-12 border-b border-slate-100 font-bold text-[14px] pt-4 shrink-0 bg-white z-10 overflow-x-auto whitespace-nowrap px-6">
                            {[1, 2, 3, 4, 5].map((tab) => (
                                <button 
                                    key={tab}
                                    onClick={() => setModalTab(tab)}
                                    className={`pb-4 px-2 transition-colors ${modalTab === tab ? "text-[#D60D26] border-b-2 border-[#D60D26]" : "text-slate-400 hover:text-slate-600"}`}
                                >
                                    {tab}. {["Flight detail", "Baggages", "Seats", "Dates", "Policies"][tab - 1]}
                                </button>
                            ))}
                        </div>

                        {/* Modal Body */}
                        <div className="flex-1 overflow-y-auto bg-white p-8 relative">
                            {modalTab === 1 && (
                                <div className="flex gap-6 overflow-x-auto pb-4">
                                    {segments.map((seg, index) => (
                                        seg.isEditing ? (
                                            <div key={seg.id} className="min-w-[700px] flex-1 animate-in fade-in zoom-in-95 duration-300">
                                                {/* Timeline Graphic for editing */}
                                                <div className="flex items-center justify-between relative mb-10 w-full">
                                                    <div className="absolute left-4 right-4 top-1/2 -translate-y-1/2 border-t-2 border-dashed border-slate-300"></div>
                                                    <div className="relative z-10 w-5 h-5 bg-slate-800 rounded-full"></div>
                                                    <Plane className="w-6 h-6 text-slate-400 relative z-10 bg-white" />
                                                    
                                                    {index === segments.length - 1 && (
                                                        <div className="relative z-10 flex flex-col items-center">
                                                            <div className="w-7 h-7 bg-white border border-[#D60D26] text-[#D60D26] rounded-full flex items-center justify-center cursor-pointer mb-1 text-[20px] shadow-sm hover:bg-rose-50">+</div>
                                                            <span className="text-[#D60D26] font-bold text-[12px] absolute top-8 w-[100px] text-center underline underline-offset-2">Add a stop over</span>
                                                        </div>
                                                    )}
                                                    
                                                    <Plane className="w-6 h-6 text-slate-400 relative z-10 bg-white" />
                                                    <div className="relative z-10 flex items-center justify-center w-8 h-8 bg-white border border-slate-300 rounded-full">
                                                        <svg className="w-4 h-4 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                                                    </div>
                                                </div>

                                                <div className="flex gap-8">
                                                    {/* Left Form */}
                                                    <div className="flex-1 space-y-6">
                                                        <div className="flex gap-4">
                                                            <div className="w-32">
                                                                <label className="text-[12px] font-bold text-slate-500 mb-1 block">{seg.fromCode} local time</label>
                                                                <div className="border border-slate-200 rounded-lg p-3 flex items-center gap-2 shadow-sm">
                                                                    <Clock className="w-4 h-4 text-slate-500" />
                                                                    <input type="text" className="w-full font-bold text-slate-700 outline-none bg-transparent" value={seg.fromTime} onChange={(e) => updateSegment(seg.id, 'fromTime', e.target.value)} />
                                                                </div>
                                                            </div>
                                                            <div className="flex-1">
                                                                <label className="text-[12px] font-bold text-slate-500 mb-1 block">Airport</label>
                                                                <input type="text" className="w-full border border-slate-200 rounded-lg p-3 bg-slate-50 font-bold text-slate-500 outline-none shadow-sm" value={`${seg.fromCode} (${seg.fromCity})`} readOnly />
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <label className="text-[12px] font-bold text-slate-500 mb-1 block">Airline</label>
                                                            <select className="w-full border border-slate-200 rounded-lg p-3 font-bold text-slate-400 appearance-none bg-white outline-none shadow-sm">
                                                                <option>{seg.airline}</option>
                                                            </select>
                                                            <div className="text-[12px] font-bold text-slate-400 mt-2 cursor-pointer hover:text-slate-600">+ add technical stop</div>
                                                        </div>
                                                        <div className="flex gap-4">
                                                            <div className="flex-1">
                                                                <label className="text-[12px] font-bold text-slate-500 mb-1 block">Flight number</label>
                                                                <input type="text" className="w-full border border-slate-200 rounded-lg p-3 font-bold tracking-widest text-slate-400 outline-none shadow-sm" placeholder="- - - -" />
                                                            </div>
                                                            <div className="flex-1">
                                                                <label className="text-[12px] font-bold text-slate-500 mb-1 block">Terminal</label>
                                                                <select className="w-full border border-slate-200 rounded-lg p-3 font-bold text-slate-700 appearance-none bg-white outline-none shadow-sm" value={seg.fromTerminal} onChange={(e) => updateSegment(seg.id, 'fromTerminal', e.target.value)}>
                                                                    <option>Terminal 1</option>
                                                                    <option>Terminal 2</option>
                                                                    <option>Terminal 3</option>
                                                                </select>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Right Form */}
                                                    <div className="flex-1 space-y-6">
                                                        <div className="flex gap-4">
                                                            <div className="flex-1">
                                                                <label className="text-[12px] font-bold text-slate-500 mb-1 block">Airport</label>
                                                                <input type="text" className="w-full border border-slate-200 rounded-lg p-3 bg-slate-50 font-bold text-slate-500 outline-none shadow-sm" value={`${seg.toCode} (${seg.toCity})`} readOnly />
                                                            </div>
                                                            <div className="w-32">
                                                                <label className="text-[12px] font-bold text-slate-500 mb-1 block">{seg.toCode} local time</label>
                                                                <div className="border border-slate-200 rounded-lg p-3 flex items-center gap-2 shadow-sm">
                                                                    <Clock className="w-4 h-4 text-slate-500" />
                                                                    <input type="text" className="w-full font-bold text-slate-700 outline-none bg-transparent" value={seg.toTime} onChange={(e) => updateSegment(seg.id, 'toTime', e.target.value)} />
                                                                </div>
                                                                <label className="flex items-center gap-2 mt-2 cursor-pointer">
                                                                    <div className={`w-4 h-4 rounded flex items-center justify-center transition-colors ${isSegmentConfirmed ? 'bg-[#D60D26]' : 'border border-slate-300 bg-white'}`}>
                                                                        {isSegmentConfirmed && <Check className="w-3 h-3 text-white" />}
                                                                    </div>
                                                                    <span className="text-[12px] font-bold text-slate-600">+1 day</span>
                                                                </label>
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <label className="text-[12px] font-bold text-slate-500 mb-1 block">Terminal</label>
                                                            <select className="w-full border border-slate-200 rounded-lg p-3 font-bold text-slate-700 appearance-none bg-white outline-none shadow-sm" value={seg.toTerminal} onChange={(e) => updateSegment(seg.id, 'toTerminal', e.target.value)}>
                                                                <option>Terminal 1</option>
                                                                <option>Terminal 2</option>
                                                                <option>Terminal 3</option>
                                                                <option>Bangkok main terminal</option>
                                                            </select>
                                                        </div>
                                                        <div className="pt-2">
                                                            {isSegmentConfirmed ? (
                                                                <div className="flex flex-col gap-2">
                                                                    <div className="text-[12px] font-bold text-blue-600 flex items-center gap-1.5">
                                                                        <Clock className="w-3.5 h-3.5" /> Calculated flight duration : {seg.duration}
                                                                    </div>
                                                                    <button onClick={() => updateSegment(seg.id, 'isEditing', false)} className="w-full bg-green-50 text-green-600 border border-green-200 font-bold py-3.5 rounded-lg transition-colors flex items-center justify-center gap-2">
                                                                        <Check className="w-4 h-4" /> Confirm segment
                                                                    </button>
                                                                </div>
                                                            ) : (
                                                                <div className="flex flex-col gap-2">
                                                                    <div className="text-[12px] font-bold text-amber-500 flex flex-col leading-tight">
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
                                        ) : (
                                            <div key={seg.id} className="flex flex-col shrink-0 animate-in fade-in zoom-in-95 duration-300">
                                                <div className="bg-white rounded-xl border border-slate-200 shadow-sm w-[350px] flex flex-col">
                                                    <div className="p-5 flex-1">
                                                        <div className="flex items-center justify-between mb-6">
                                                            <div className="w-4 h-4 rounded-full border-[3px] border-slate-800 bg-white relative z-10"></div>
                                                            <div className="flex-1 border-t-[2px] border-dashed border-slate-300 mx-2"></div>
                                                            <Plane className="w-5 h-5 text-slate-400 rotate-45 relative z-10" />
                                                            <div className="flex-1 border-t-[2px] border-dashed border-slate-300 mx-2"></div>
                                                            {index === segments.length - 1 ? (
                                                                <div className="relative z-10 flex items-center justify-center w-5 h-5 bg-white border-2 border-slate-800 rounded-full">
                                                                    <svg className="w-2.5 h-2.5 text-slate-800" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                                                                </div>
                                                            ) : (
                                                                <div className="w-4 h-4 rounded-full bg-slate-800 relative z-10"></div>
                                                            )}
                                                        </div>
                                                        <div className="flex justify-between items-start text-center">
                                                            <div className="flex flex-col items-center flex-1">
                                                                <div className="font-bold text-slate-800 text-[14px] whitespace-nowrap">{seg.fromCity}, {seg.fromCode}</div>
                                                                <div className="text-[12px] text-slate-400 mb-2">{seg.fromTerminal}</div>
                                                                <div className="border border-slate-200 rounded px-2 py-1 text-[13px] font-bold text-slate-700">{seg.fromTime}</div>
                                                            </div>
                                                            
                                                            <div className="flex flex-col items-center justify-start flex-1 px-2">
                                                                <div className="w-8 h-8 bg-[#D60D26] rounded mb-2 flex items-center justify-center">
                                                                    <div className="w-4 h-4 border-t-2 border-r-2 border-white rounded-tr-full transform -rotate-45 mt-1 mr-1"></div>
                                                                </div>
                                                                <div className="text-[11px] text-slate-600 font-bold whitespace-nowrap">{seg.airline}</div>
                                                                <div className="text-[12px] text-blue-600 font-bold mt-1 flex items-center gap-1">
                                                                    <Clock className="w-3 h-3" /> {seg.duration}
                                                                </div>
                                                            </div>

                                                            <div className="flex flex-col items-center flex-1">
                                                                <div className="font-bold text-slate-800 text-[14px] whitespace-nowrap">{seg.toCity}, {seg.toCode}</div>
                                                                <div className="text-[12px] text-slate-400 mb-2">{seg.toTerminal}</div>
                                                                <div className="border border-slate-200 rounded px-2 py-1 text-[13px] font-bold text-slate-700">{seg.toTime}</div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <button 
                                                        onClick={() => updateSegment(seg.id, 'isEditing', true)}
                                                        className="w-full bg-slate-100 text-slate-500 text-[13px] font-bold py-2.5 border-t border-slate-200 hover:bg-slate-200 transition-colors rounded-b-xl"
                                                    >
                                                        Edit segment
                                                    </button>
                                                </div>

                                                {/* Below Card Details */}
                                                {index === 0 && segments.length > 1 && (
                                                    <div className="mt-2 bg-rose-50 rounded-lg p-3 flex justify-between items-center w-full">
                                                        <div className="text-[12px] font-bold text-slate-700 flex items-center gap-1.5">
                                                            <Clock className="w-4 h-4" /> Layover 02 h 15 min
                                                        </div>
                                                        <button className="text-[12px] font-bold text-slate-600 flex items-center gap-1 hover:text-[#D60D26] transition-colors">
                                                            <Trash2 className="w-4 h-4" /> Delete stop
                                                        </button>
                                                    </div>
                                                )}
                                                {index === segments.length - 1 && segments.length > 1 && (
                                                    <div className="mt-2 bg-rose-50 rounded-lg p-3 flex justify-between items-center w-full">
                                                        <div className="text-[12px] font-bold text-slate-700 flex items-center gap-1.5">
                                                            <Clock className="w-4 h-4" /> Total journey destination 10 h 30 min
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )
                                    ))}
                                </div>
                            )}

                            {modalTab === 2 && (
                                <div className="flex items-center justify-center py-10 animate-in fade-in duration-300">
                                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm w-full max-w-[500px] overflow-hidden">
                                        <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 font-bold text-slate-700 text-[15px]">
                                            Checked Baggage
                                        </div>
                                        <div className="p-6">
                                            <div className="flex gap-4 mb-5">
                                                <div className="flex-1">
                                                    <label className="text-[12px] font-bold text-slate-500 mb-1.5 block">Maximum weight (Kg)</label>
                                                    <select 
                                                        value={maxWeight}
                                                        onChange={(e) => setMaxWeight(e.target.value)}
                                                        className="w-full border border-slate-200 rounded-lg p-3.5 text-slate-700 font-medium outline-none bg-white shadow-sm"
                                                    >
                                                        <option>Weight</option>
                                                        <option>15 kg</option>
                                                        <option>20 kg</option>
                                                        <option>25 kg</option>
                                                    </select>
                                                </div>
                                                <div className="flex-1">
                                                    <label className="text-[12px] font-bold text-slate-500 mb-1.5 block">Price (INR)</label>
                                                    <div className="relative">
                                                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-medium">₹</span>
                                                        <input 
                                                            type="text" 
                                                            placeholder="00.00"
                                                            value={baggagePrice}
                                                            onChange={(e) => setBaggagePrice(e.target.value)}
                                                            className="w-full border border-slate-200 rounded-lg p-3.5 pl-8 text-slate-700 font-medium outline-none shadow-sm"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                            <label className="flex items-center gap-2.5 cursor-pointer">
                                                <input 
                                                    type="checkbox" 
                                                    checked={isFreeBaggage}
                                                    onChange={(e) => setIsFreeBaggage(e.target.checked)}
                                                    className="w-5 h-5 rounded border-slate-300 text-[#D60D26] focus:ring-[#D60D26] cursor-pointer"
                                                />
                                                <span className="text-[14px] font-bold text-slate-600 select-none">Free checked baggage</span>
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {modalTab === 3 && (
                                <div className="flex items-center justify-center py-10 animate-in fade-in duration-300">
                                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm w-full max-w-[500px] overflow-hidden">
                                        <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 font-bold text-slate-700 text-[15px]">
                                            Seats and price
                                        </div>
                                        <div className="p-6">
                                            <div className="text-blue-600 font-bold text-[13px] mb-6 leading-relaxed">
                                                By default for all flights - can be changed flights per flights after
                                            </div>
                                            <div className="flex gap-4">
                                                <div className="flex-1">
                                                    <label className="text-[12px] font-bold text-slate-500 mb-1.5 block">Available seats</label>
                                                    <div className="relative">
                                                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                                                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M4 18v3h2v-3h12v3h2v-3H4zm2-10h12v6H6V8zm0-4h12v2H6V4z"/></svg>
                                                        </span>
                                                        <input 
                                                            type="text" 
                                                            placeholder="00"
                                                            value={availableSeats}
                                                            onChange={(e) => setAvailableSeats(e.target.value)}
                                                            className="w-full border border-slate-200 rounded-lg p-3.5 pl-11 text-slate-700 font-medium outline-none shadow-sm"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="flex-1">
                                                    <label className="text-[12px] font-bold text-slate-500 mb-1.5 block">Ticket Price (INR)</label>
                                                    <div className="relative">
                                                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-medium">₹</span>
                                                        <input 
                                                            type="text" 
                                                            placeholder="00.00"
                                                            value={seatPrice}
                                                            onChange={(e) => setSeatPrice(e.target.value)}
                                                            className="w-full border border-slate-200 rounded-lg p-3.5 pl-8 text-slate-700 font-medium outline-none shadow-sm"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {modalTab === 4 && (
                                <div className="flex items-center justify-center py-10 animate-in fade-in duration-300">
                                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm w-full max-w-[500px] overflow-hidden">
                                        <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 font-bold text-slate-700 text-[15px]">
                                            Operating dates
                                        </div>
                                        <div className="flex flex-col">
                                            <div className="bg-[#F2FBFF] px-6 py-2.5 text-[13px] font-bold text-slate-600">October 2025</div>
                                            <div className="p-6 flex gap-4">
                                                {[9, 16, 23, 30].map(day => (
                                                    <div key={day} className="bg-rose-50 rounded-lg p-3 flex flex-col items-center gap-2.5 cursor-pointer border border-rose-100 w-16 hover:bg-rose-100 transition-colors">
                                                        <span className="text-[12px] font-bold text-slate-800">Sun {day}</span>
                                                        <div className="w-[22px] h-[22px] bg-[#D60D26] rounded shadow-sm flex items-center justify-center">
                                                            <Check className="w-3.5 h-3.5 text-white" />
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="bg-[#F2FBFF] px-6 py-2.5 text-[13px] font-bold text-slate-600">November 2025</div>
                                            <div className="p-6 flex gap-4">
                                                <div className="bg-rose-50 rounded-lg p-3 flex flex-col items-center gap-2.5 cursor-pointer border border-rose-100 w-16 hover:bg-rose-100 transition-colors">
                                                    <span className="text-[12px] font-bold text-slate-800">Sun 2</span>
                                                    <div className="w-[22px] h-[22px] bg-[#D60D26] rounded shadow-sm flex items-center justify-center">
                                                        <Check className="w-3.5 h-3.5 text-white" />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {modalTab === 5 && (
                                <div className="flex items-center justify-center py-10 animate-in fade-in duration-300">
                                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm w-full max-w-[550px] overflow-hidden">
                                        <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 font-bold text-slate-700 text-[15px]">
                                            Policies / Terms & Conditions
                                        </div>
                                        <div className="p-6 flex flex-col gap-4">
                                            <div className="flex items-center justify-between border-l-4 border-slate-800 bg-slate-50 p-4 rounded-r-lg shadow-sm">
                                                <div className="flex items-center gap-3 font-bold text-[14px] text-slate-700">
                                                    <div className="w-6 h-6 flex items-center justify-center border border-slate-400 rounded">
                                                        <X className="w-3 h-3 text-slate-600" />
                                                    </div>
                                                    Cancellation policy
                                                </div>
                                                <button className="text-[#D60D26] font-bold text-[13px] flex items-center gap-1 hover:text-[#D60D26]"><div className="w-4 h-4 bg-[#D60D26] text-white rounded-full flex items-center justify-center text-[16px] leading-none pb-0.5">+</div> Add</button>
                                            </div>
                                            <div className="flex items-center justify-between border-l-4 border-slate-800 bg-slate-50 p-4 rounded-r-lg shadow-sm">
                                                <div className="flex items-center gap-3 font-bold text-[14px] text-slate-700">
                                                    <svg className="w-6 h-6 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                                                    Change policy
                                                </div>
                                                <button className="text-[#D60D26] font-bold text-[13px] flex items-center gap-1 hover:text-[#D60D26]"><div className="w-4 h-4 bg-[#D60D26] text-white rounded-full flex items-center justify-center text-[16px] leading-none pb-0.5">+</div> Add</button>
                                            </div>
                                            <div className="flex items-center justify-between border-l-4 border-slate-800 bg-slate-50 p-4 rounded-r-lg shadow-sm">
                                                <div className="flex items-center gap-3 font-bold text-[14px] text-slate-700">
                                                    <svg className="w-6 h-6 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                                    Refund policy
                                                </div>
                                                <button className="text-[#D60D26] font-bold text-[13px] flex items-center gap-1 hover:text-[#D60D26]"><div className="w-4 h-4 bg-[#D60D26] text-white rounded-full flex items-center justify-center text-[16px] leading-none pb-0.5">+</div> Add</button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Modal Footer */}
                        <div className="p-6 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 shrink-0">
                            <button 
                                onClick={() => setModalTab(Math.max(1, modalTab - 1))}
                                disabled={modalTab === 1}
                                className={`flex-1 border-2 font-bold py-3.5 rounded-xl transition-colors ${modalTab === 1 ? 'border-slate-100 text-slate-300 cursor-not-allowed' : 'border-slate-200 text-slate-500 hover:bg-slate-100'}`}
                            >
                                Back Step
                            </button>
                            <button 
                                onClick={() => {
                                    if (modalTab < 5) {
                                        setModalTab(modalTab + 1);
                                    } else {
                                        setIsConfirmModalOpen(true);
                                    }
                                }}
                                className={`flex-1 text-white font-bold py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-sm bg-[#D60D26] hover:bg-[#D60D26]`}
                            >
                                {modalTab === 5 ? "Finish" : "Next Step"} {modalTab < 5 && <ArrowRight className="w-4 h-4" />}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Confirm APIS Modal */}
            {isConfirmModalOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm pointer-events-auto animate-in fade-in duration-200 p-4">
                    <div className="bg-white rounded-2xl w-full max-w-[600px] shadow-2xl overflow-hidden flex flex-col">
                        <div className="bg-slate-50 border-b border-slate-100 p-5 font-bold text-[16px] text-slate-700">
                            Confirm this flight
                        </div>
                        <div className="p-8 pb-12 flex items-start gap-4">
                            <div className="w-6 h-6 bg-[#D60D26] rounded flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                                <Check className="w-4 h-4 text-white" />
                            </div>
                            <div>
                                <div className="font-bold text-[16px] text-slate-800 mb-1.5">Flight requires APIS</div>
                                <div className="text-[14px] text-slate-500 font-medium">Passenger information found on the face of a passport</div>
                            </div>
                        </div>
                        <div className="p-6 border-t border-slate-100 flex items-center justify-between gap-4 bg-slate-50/50">
                            <button 
                                onClick={() => setIsConfirmModalOpen(false)} 
                                className="flex-1 border-2 border-slate-200 text-slate-600 font-bold py-3.5 rounded-xl hover:bg-slate-100 transition-colors"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={() => {
                                    setIsConfirmModalOpen(false);
                                    setIsModalOpen(false);
                                    setHasScheduledFlight(true);
                                }} 
                                className="flex-1 bg-[#D60D26] text-white font-bold py-3.5 rounded-xl hover:bg-[#D60D26] transition-colors flex items-center justify-center gap-2 shadow-sm"
                            >
                                Confirm Flight <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
