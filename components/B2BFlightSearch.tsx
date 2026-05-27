"use client";

import * as React from "react";
import { format } from "date-fns";
import { PlaneTakeoff, ArrowRightLeft, ArrowUpRight, ArrowRight, ChevronDown, Plus, Minus } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";

interface FlightSearchProps {
    onSearch?: (searchData: {
        origin: string;
        destination: string;
        nonStop: boolean;
        travellers: any;
        cabin: string;
        tripType: string;
    }) => void;
}

const GLOBAL_CITIES = [
    { name: "New Delhi", code: "DEL", country: "India" },
    { name: "Mumbai", code: "BOM", country: "India" },
    { name: "Bangalore", code: "BLR", country: "India" },
    { name: "Chennai", code: "MAA", country: "India" },
    { name: "Kolkata", code: "CCU", country: "India" },
    { name: "Hyderabad", code: "HYD", country: "India" },
    { name: "Pune", code: "PNQ", country: "India" },
    { name: "Ahmedabad", code: "AMD", country: "India" },
    { name: "Goa", code: "GOI", country: "India" },
    { name: "Jaipur", code: "JAI", country: "India" },
    { name: "Cochin", code: "COK", country: "India" },
    { name: "Lucknow", code: "LKO", country: "India" },
    { name: "Guwahati", code: "GAU", country: "India" },
    { name: "Thiruvananthapuram", code: "TRV", country: "India" },
    { name: "Bhubaneswar", code: "BBI", country: "India" },
    { name: "Patna", code: "PAT", country: "India" },
    { name: "Indore", code: "IDR", country: "India" },
    { name: "Chandigarh", code: "IXC", country: "India" },
    { name: "New York", code: "JFK", country: "United States" },
    { name: "London", code: "LHR", country: "United Kingdom" },
    { name: "Dubai", code: "DXB", country: "United Arab Emirates" },
    { name: "Singapore", code: "SIN", country: "Singapore" },
    { name: "Paris", code: "CDG", country: "France" },
    { name: "Tokyo", code: "HND", country: "Japan" },
    { name: "Sydney", code: "SYD", country: "Australia" },
    { name: "Toronto", code: "YYZ", country: "Canada" },
    { name: "Frankfurt", code: "FRA", country: "Germany" },
    { name: "Hong Kong", code: "HKG", country: "Hong Kong" },
    { name: "Bangkok", code: "BKK", country: "Thailand" },
];

function useDebounce<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = React.useState<T>(value);
    React.useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);
        return () => clearTimeout(handler);
    }, [value, delay]);
    return debouncedValue;
}

export function B2BFlightSearch({ onSearch }: FlightSearchProps) {
    // State Management
    const [date, setDate] = React.useState<Date | undefined>(new Date(2026, 2, 11));
    const [returnDate, setReturnDate] = React.useState<Date | undefined>(new Date(2026, 2, 12));
    const [tripType, setTripType] = React.useState<"one-way" | "round-trip" | "multi-city">("one-way");
    const [origin, setOrigin] = React.useState("New Delhi");
    const [destination, setDestination] = React.useState("Mumbai");
    const [travellers, setTravellers] = React.useState({ adults: 1, children: 0, infants: 0 });
    const [cabinClass, setCabinClass] = React.useState("Economy");
    const [nonStop, setNonStop] = React.useState(false);
    const [baggageFares, setBaggageFares] = React.useState(false);
    const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

    // Multi-city additional state
    const [date2, setDate2] = React.useState<Date | undefined>(new Date(2026, 9, 24)); // Oct 24
    const [origin2, setOrigin2] = React.useState("New Delhi");
    const [destination2, setDestination2] = React.useState("Mumbai");
    const [dayVariance2, setDayVariance2] = React.useState<number>(0);
    const [isDayVarianceOpen2, setIsDayVarianceOpen2] = React.useState(false);

    // Autocomplete Search States
    const [originSearch, setOriginSearch] = React.useState("New Delhi");
    const [destinationSearch, setDestinationSearch] = React.useState("Mumbai");
    const debouncedOriginSearch = useDebounce(originSearch, 200);
    const debouncedDestinationSearch = useDebounce(destinationSearch, 200);
    const [activeDropdown, setActiveDropdown] = React.useState<'origin' | 'destination' | null>(null);

    // Popover Control States
    const [isDepOpen, setIsDepOpen] = React.useState(false);
    const [isRetOpen, setIsRetOpen] = React.useState(false);
    const [isTravellerOpen, setIsTravellerOpen] = React.useState(false);
    const [isLastSearchesOpen, setIsLastSearchesOpen] = React.useState(false);
    
    // Day Variance State
    const [dayVariance, setDayVariance] = React.useState<number>(0);
    const [isDayVarianceOpen, setIsDayVarianceOpen] = React.useState(false);

    // Close dropdowns on outside click
    const searchRef = React.useRef<HTMLDivElement>(null);
    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setActiveDropdown(null);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Last Searches State
    const [lastSearches, setLastSearches] = React.useState<Array<{ origin: string, destination: string, date: string }>>([]);

    React.useEffect(() => {
        try {
            const saved = localStorage.getItem('lastFlightSearches');
            if (saved) {
                setLastSearches(JSON.parse(saved));
            }
        } catch (e) {
            console.error("Could not load last searches", e);
        }
    }, []);

    const updateTravellers = (type: keyof typeof travellers, operation: 'add' | 'sub') => {
        setTravellers(prev => ({
            ...prev,
            [type]: operation === 'add' ? prev[type] + 1 : Math.max(type === 'adults' ? 1 : 0, prev[type] - 1)
        }));
    };

    const handleSearch = () => {
        setErrorMsg(null);
        if (!origin.trim() || !destination.trim() || !date) {
            setErrorMsg("Please fill in Origin, Destination, and Departure Date.");
            return;
        }
        if (origin.trim().toLowerCase() === destination.trim().toLowerCase()) {
            setErrorMsg("Origin and Destination cannot be the same.");
            return;
        }
        if (tripType === 'round-trip' && returnDate && date && returnDate < date) {
            setErrorMsg("Return Date must be after Departure Date.");
            return;
        }

        // Save to last searches
        try {
            const newSearch = { origin, destination, date: format(date, "MMM dd, yyyy") };
            const updatedSearches = [newSearch, ...lastSearches.filter(s => s.origin !== origin || s.destination !== destination)]
                .slice(0, 5); // Keep last 5
            setLastSearches(updatedSearches);
            localStorage.setItem('lastFlightSearches', JSON.stringify(updatedSearches));
        } catch (e) {
            console.error("Could not save to last searches", e);
        }

        if (onSearch) {
            onSearch({ origin, destination, nonStop, travellers, cabin: cabinClass, tripType });
        }
    };

    const handleReset = () => {
        setOrigin("");
        setDestination("");
        setOriginSearch("");
        setDestinationSearch("");
        setDate(undefined);
        setReturnDate(undefined);
        setTripType("one-way");
        setTravellers({ adults: 1, children: 0, infants: 0 });
        setCabinClass("Economy");
        setNonStop(false);
        setErrorMsg(null);
    };

    const calendarClassNames = {
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-12 sm:space-y-0",
        month: "space-y-6",
        caption: "flex justify-center pt-1 relative items-center mb-4",
        caption_label: "text-[16px] font-black uppercase tracking-tight text-slate-900",
        nav: "space-x-1 flex items-center",
        nav_button: cn("h-9 w-9 bg-transparent p-0 opacity-50 hover:opacity-100 transition-opacity"),
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: "w-full border-collapse space-y-1",
        head_row: "flex mb-4",
        head_cell: "text-slate-400 rounded-md w-11 font-bold text-[13px]",
        row: "flex w-full mt-2",
        cell: "text-center text-sm p-0 relative focus-within:relative focus-within:z-20",
        day: cn("h-11 w-11 p-0 font-bold hover:bg-slate-100 rounded-xl transition-all text-[15px]"),
        day_selected: "bg-[#888] text-white hover:bg-[#888] rounded-xl shadow-md",
        day_today: "text-[#888] border border-[#888]",
        day_outside: "text-slate-300 opacity-50",
        day_disabled: "text-slate-300 opacity-50",
    };

    return (
        <div className="h-auto w-full max-w-[1200px] mx-auto bg-white rounded-[1.5rem] flex flex-col relative z-10 font-sans shadow-xl border border-slate-100 overflow-visible">
            {/* Header / Trip Type Logic */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-white h-auto sm:h-14 rounded-t-[1.5rem] relative overflow-hidden">
                <div className="hidden sm:block absolute bottom-0 w-full h-[1.5px] bg-slate-200" />
                <div className="flex items-center px-8 h-14 bg-white text-[#D60D26] sm:border-b-[3px] border-[#D60D26] relative z-10 min-w-[150px] w-full sm:w-auto">
                    <div className="flex items-center gap-2 font-bold text-[15px] md:text-[16px]">
                        <PlaneTakeoff className="w-5 h-5 text-[#D60D26]" strokeWidth={2.5} />
                        <span className="tracking-tight">Flights</span>
                    </div>
                </div>
                <div className="flex sm:hidden w-full h-[1.5px] bg-slate-200" />
                <div className="flex items-center text-[15px] font-semibold h-14 w-full sm:w-auto overflow-x-auto no-scrollbar">
                    <Popover open={isLastSearchesOpen} onOpenChange={setIsLastSearchesOpen}>
                        <PopoverTrigger asChild>
                            <div className="flex items-center gap-1.5 px-6 h-full cursor-pointer text-slate-400 hover:text-slate-600 transition-colors">
                                <span>Last Searches</span>
                                <ChevronDown className="w-4 h-4" />
                            </div>
                        </PopoverTrigger>
                        <PopoverContent className="w-64 p-2 rounded-xl z-[110]" align="end" side="bottom" sideOffset={8} avoidCollisions={false}>
                            {lastSearches.length > 0 ? (
                                <div className="flex flex-col gap-1">
                                    {lastSearches.map((search, idx) => (
                                        <div
                                            key={idx}
                                            className="px-3 py-2 hover:bg-slate-100 rounded-lg cursor-pointer transition-colors"
                                            onClick={() => {
                                                setOrigin(search.origin);
                                                setOriginSearch(search.origin);
                                                setDestination(search.destination);
                                                setDestinationSearch(search.destination);
                                                setDate(new Date(search.date));
                                                setIsLastSearchesOpen(false);
                                            }}
                                        >
                                            <div className="font-bold text-slate-800 text-[14px]">{search.origin} → {search.destination}</div>
                                            <div className="text-slate-500 text-[12px]">{search.date}</div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="p-3 text-center text-slate-500 text-[14px]">No recent searches</div>
                            )}
                        </PopoverContent>
                    </Popover>
                    <div className="px-8 h-full flex items-center border-l border-slate-200 cursor-pointer text-slate-400 hover:text-slate-600 transition-colors" onClick={handleReset}>
                        Reset Search
                    </div>
                </div>
            </div>

            <div className="px-4 py-4 md:px-10 md:py-8 flex flex-col gap-6">
                {/* Trip Type Selector */}
                <div className="flex items-center flex-wrap gap-4 md:gap-8">
                    {(["one-way", "round-trip", "multi-city"] as const).map((type) => (
                        <label key={type} className="flex items-center space-x-2 cursor-pointer group" onClick={() => setTripType(type)}>
                            <div className={cn(
                                "w-[16px] h-[16px] rounded-full border-[1.5px] flex items-center justify-center transition-colors",
                                tripType === type ? "border-[#D60D26]" : "border-slate-300"
                            )}>
                                {tripType === type && <div className="w-2 h-2 rounded-full bg-[#D60D26]" />}
                            </div>
                            <span className={cn(
                                "text-[14px] leading-none pt-[1px]",
                                tripType === type ? "text-slate-800 font-bold" : "text-slate-400 font-medium"
                            )}>
                                {type === 'one-way' ? 'One Way' : type === 'round-trip' ? 'Round Trip' : 'Multi City'}
                            </span>
                        </label>
                    ))}
                </div>

                {tripType === 'multi-city' ? (
                    /* --------------------------------- */
                    /* MULTI CITY DESIGN START           */
                    /* --------------------------------- */
                    <div className="flex flex-col gap-6 mt-2 relative">
                        {/* ROW 1 */}
                        <div className="flex flex-col lg:flex-row items-center gap-6 w-full relative">
                            {/* Origin */}
                            <div className="flex flex-col flex-1 group relative h-[70px] w-full">
                                <label className="text-[14px] font-bold text-slate-400 mb-1 block">Departure From</label>
                                <div className="font-extrabold text-slate-900 tracking-tight text-[20px] leading-none">{origin}</div>
                                <p className="text-[13px] text-slate-500 mt-1 truncate font-medium">DEL, Indira Gandhi...</p>
                                <div className="absolute bottom-0 left-0 w-full h-[1.5px] bg-slate-200" />
                            </div>

                            {/* Red Arrow Circle */}
                            <div className="hidden lg:flex w-8 h-8 shrink-0 rounded-full border border-[#D60D26] text-[#D60D26] items-center justify-center relative mt-3 mx-2">
                                <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
                            </div>

                            {/* Destination */}
                            <div className="flex flex-col flex-1 group relative h-[70px] w-full">
                                <label className="text-[14px] font-bold text-slate-400 mb-1 block">Going To</label>
                                <div className="font-extrabold text-slate-900 tracking-tight text-[20px] leading-none">{destination}</div>
                                <p className="text-[13px] text-slate-500 mt-1 truncate font-medium">BOM, Chhatrapat...</p>
                                <div className="absolute bottom-0 left-0 w-full h-[1.5px] bg-slate-200" />
                            </div>

                            {/* Departure Date */}
                            <div className="flex flex-col flex-1 group relative h-[70px] w-full">
                                <label className="text-[14px] font-bold text-slate-400 mb-1 flex items-center gap-1">Departure Date <ChevronDown className="w-3.5 h-3.5" /></label>
                                <div className="font-extrabold text-slate-900 tracking-tight text-[20px] leading-none">{format(date || new Date(), "dd MMM' yy")}</div>
                                <p className="text-[13px] text-slate-500 mt-1 font-medium">{format(date || new Date(), "EEEE")}</p>
                                <div className="absolute bottom-0 left-0 w-full h-[1.5px] bg-slate-200" />
                            </div>

                            {/* Return Date Link */}
                            <div className="flex flex-col flex-1 group relative h-[70px] w-full">
                                <label className="text-[14px] font-bold text-slate-400 mb-1 block">Return Date</label>
                                <div className="h-[46px] flex items-center">
                                    <span className="text-blue-500 text-[13px] font-semibold leading-tight cursor-pointer hover:underline">
                                        Book Round Trip<br />To Save Extra
                                    </span>
                                </div>
                                <div className="absolute bottom-0 left-0 w-full h-[1.5px] bg-slate-200" />
                            </div>

                            {/* Traveller & Class */}
                            <div className="flex flex-col flex-1 group relative h-[70px] w-full">
                                <label className="text-[14px] font-bold text-slate-400 mb-1 flex items-center gap-1">Traveller & Class <ChevronDown className="w-3.5 h-3.5" /></label>
                                <div className="font-extrabold text-slate-900 tracking-tight text-[20px] leading-none">1 Traveller</div>
                                <p className="text-[13px] text-slate-500 mt-1 font-medium">{cabinClass}</p>
                                <div className="absolute bottom-0 left-0 w-full h-[1.5px] bg-slate-200" />
                            </div>

                            {/* +/- Day Dropdown Popover */}
                            <Popover open={isDayVarianceOpen} onOpenChange={setIsDayVarianceOpen}>
                                <PopoverTrigger asChild>
                                    <div className="flex flex-col flex-1 group relative h-[70px] w-full cursor-pointer">
                                        <label className="text-[14px] font-bold text-slate-400 mb-1 flex items-center gap-1">+/- Day <ChevronDown className="w-3.5 h-3.5" /></label>
                                        <div className="font-extrabold text-slate-900 tracking-tight text-[20px] leading-none">+/- 0{dayVariance}</div>
                                        <p className="text-[13px] text-slate-500 mt-1 font-medium">Day{dayVariance !== 1 ? 's' : ''}</p>
                                        <div className="absolute bottom-0 left-0 w-full h-[1.5px] bg-slate-200 group-hover:bg-slate-300" />
                                    </div>
                                </PopoverTrigger>
                                <PopoverContent className="w-[180px] p-3 bg-white rounded-xl shadow-2xl border-none z-[110]" align="start" side="bottom" sideOffset={8}>
                                    <div className="flex flex-col space-y-1">
                                        {[0, 1, 2, 3].map((days) => (
                                            <button 
                                                key={days}
                                                className={cn(
                                                    "w-full text-left px-4 py-2.5 rounded-lg font-bold text-[15px] transition-colors",
                                                    dayVariance === days ? "bg-[#D60D26] text-white" : "text-slate-700 hover:bg-slate-100"
                                                )}
                                                onClick={() => {
                                                    setDayVariance(days);
                                                    setIsDayVarianceOpen(false);
                                                }}
                                            >
                                                +/- 0{days} Day{days !== 1 ? 's' : ''}
                                            </button>
                                        ))}
                                    </div>
                                </PopoverContent>
                            </Popover>

                            {/* Search Button */}
                            <div className="flex items-center justify-end h-[70px] shrink-0 mt-3">
                                <Button onClick={handleSearch} className="bg-[#D60D26] hover:bg-[#D60D26] text-white rounded-full px-6 py-5 h-[48px] text-[15px] font-bold shadow-md flex items-center justify-center gap-1 transition-transform active:scale-95">
                                    Search <ArrowUpRight className="w-4 h-4" strokeWidth={2.5} />
                                </Button>
                            </div>
                        </div>

                        {/* ROW 2 */}
                        <div className="flex flex-col lg:flex-row items-center gap-6 w-full relative">
                            {/* Origin */}
                            <div className="flex flex-col flex-1 group relative h-[70px] w-full">
                                <label className="text-[14px] font-bold text-slate-400 mb-1 block">Departure From</label>
                                <div className="font-extrabold text-slate-900 tracking-tight text-[20px] leading-none">{origin2}</div>
                                <p className="text-[13px] text-slate-500 mt-1 truncate font-medium">DEL, Indira Gandhi...</p>
                                <div className="absolute bottom-0 left-0 w-full h-[1.5px] bg-slate-200" />
                            </div>

                            {/* Red Arrow Circle */}
                            <div className="hidden lg:flex w-8 h-8 shrink-0 rounded-full border border-[#D60D26] text-[#D60D26] items-center justify-center relative mt-3 mx-2">
                                <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
                            </div>

                            {/* Destination */}
                            <div className="flex flex-col flex-1 group relative h-[70px] w-full">
                                <label className="text-[14px] font-bold text-slate-400 mb-1 block">Going To</label>
                                <div className="font-extrabold text-slate-900 tracking-tight text-[20px] leading-none">{destination2}</div>
                                <p className="text-[13px] text-slate-500 mt-1 truncate font-medium">BOM, Chhatrapat...</p>
                                <div className="absolute bottom-0 left-0 w-full h-[1.5px] bg-slate-200" />
                            </div>

                            {/* Departure Date */}
                            <div className="flex flex-col flex-1 group relative h-[70px] w-full">
                                <label className="text-[14px] font-bold text-slate-400 mb-1 flex items-center gap-1">Departure Date <ChevronDown className="w-3.5 h-3.5" /></label>
                                <div className="font-extrabold text-slate-900 tracking-tight text-[20px] leading-none">{format(date2 || new Date(), "dd MMM' yy")}</div>
                                <p className="text-[13px] text-slate-500 mt-1 font-medium">{format(date2 || new Date(), "EEEE")}</p>
                                <div className="absolute bottom-0 left-0 w-full h-[1.5px] bg-slate-200" />
                            </div>

                            {/* Return Date Link (Empty space equivalent in Row 2) */}
                            <div className="flex flex-col flex-1 h-[70px] w-full hidden lg:flex">
                            </div>

                            {/* Traveller & Class (Empty space equivalent in Row 2) */}
                            <div className="flex flex-col flex-1 h-[70px] w-full hidden lg:flex">
                            </div>

                            {/* +/- Day Dropdown Popover */}
                            <Popover open={isDayVarianceOpen2} onOpenChange={setIsDayVarianceOpen2}>
                                <PopoverTrigger asChild>
                                    <div className="flex flex-col flex-1 group relative h-[70px] w-full cursor-pointer">
                                        <label className="text-[14px] font-bold text-slate-400 mb-1 flex items-center gap-1">+/- Day <ChevronDown className="w-3.5 h-3.5" /></label>
                                        <div className="font-extrabold text-slate-900 tracking-tight text-[20px] leading-none">+/- 0{dayVariance2}</div>
                                        <p className="text-[13px] text-slate-500 mt-1 font-medium">Day{dayVariance2 !== 1 ? 's' : ''}</p>
                                        <div className="absolute bottom-0 left-0 w-full h-[1.5px] bg-slate-200 group-hover:bg-slate-300" />
                                    </div>
                                </PopoverTrigger>
                                <PopoverContent className="w-[180px] p-3 bg-white rounded-xl shadow-2xl border-none z-[110]" align="start" side="bottom" sideOffset={8}>
                                    <div className="flex flex-col space-y-1">
                                        {[0, 1, 2, 3].map((days) => (
                                            <button 
                                                key={days}
                                                className={cn(
                                                    "w-full text-left px-4 py-2.5 rounded-lg font-bold text-[15px] transition-colors",
                                                    dayVariance2 === days ? "bg-[#D60D26] text-white" : "text-slate-700 hover:bg-slate-100"
                                                )}
                                                onClick={() => {
                                                    setDayVariance2(days);
                                                    setIsDayVarianceOpen2(false);
                                                }}
                                            >
                                                +/- 0{days} Day{days !== 1 ? 's' : ''}
                                            </button>
                                        ))}
                                    </div>
                                </PopoverContent>
                            </Popover>

                            {/* Add City Button Area */}
                            <div className="flex items-center justify-start h-[70px] shrink-0 min-w-[120px] mt-3 lg:pl-6">
                                <button className="text-[#D60D26] font-bold text-[15px] hover:underline flex items-center gap-1">
                                    <Plus className="w-4 h-4" strokeWidth={3} /> Add City
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    /* --------------------------------- */
                    /* STANDARD ONE-WAY / ROUND-TRIP UI  */
                    /* --------------------------------- */
                    <div className="flex flex-col lg:flex-row items-center justify-between w-full mt-2 lg:gap-2 xl:gap-4 relative" ref={searchRef}>
                        {/* Origin Input */}
                        <div className="flex flex-col flex-1 min-w-[190px] group relative h-[90px] w-full lg:w-auto">
                            <label className="text-[14px] font-bold text-slate-400 mb-1.5 block">Departure From</label>
                            <input
                                type="text"
                                className="bg-transparent border-none outline-none font-extrabold text-slate-900 tracking-tight text-[24px] p-0 placeholder:text-slate-300 leading-none h-[30px] w-full"
                                value={originSearch}
                                onChange={(e) => {
                                    setOriginSearch(e.target.value);
                                    setActiveDropdown('origin');
                                }}
                                onFocus={() => setActiveDropdown('origin')}
                                placeholder="City or Airport"
                            />
                            <p className="text-[12px] text-[#888] mt-1 truncate font-medium">
                                {GLOBAL_CITIES.find(c => c.name.toLowerCase() === origin.toLowerCase() || c.code.toLowerCase() === origin.toLowerCase())?.name || origin || "Anywhere"}
                            </p>
                            <div className="absolute bottom-0 left-0 w-full lg:w-[90%] h-[1.5px] bg-slate-200 group-hover:bg-slate-300 hidden lg:block" />

                            {/* Origin Autocomplete Dropdown */}
                            {activeDropdown === 'origin' && debouncedOriginSearch.length >= 2 && (
                                <div className="absolute top-[100%] left-0 w-[120%] bg-white rounded-2xl shadow-2xl z-[100] mt-2 border border-slate-100 max-h-[300px] overflow-y-auto">
                                    <ul className="py-2">
                                        {GLOBAL_CITIES.filter(c =>
                                            c.name.toLowerCase().includes(debouncedOriginSearch.toLowerCase()) ||
                                            c.code.toLowerCase().includes(debouncedOriginSearch.toLowerCase()) ||
                                            c.country.toLowerCase().includes(debouncedOriginSearch.toLowerCase())
                                        ).map(city => (
                                            <li
                                                key={city.code}
                                                className="px-6 py-3 hover:bg-slate-50 cursor-pointer flex items-center justify-between border-b border-slate-50 last:border-0"
                                                onClick={() => {
                                                    setOrigin(city.name);
                                                    setOriginSearch(city.name);
                                                    setActiveDropdown(null);
                                                }}
                                            >
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-slate-800 text-[15px]">{city.name}</span>
                                                    <span className="text-slate-400 text-[13px]">{city.country}</span>
                                                </div>
                                                <span className="font-bold text-slate-300 bg-slate-100 px-2 py-1 rounded text-[12px]">{city.code}</span>
                                            </li>
                                        ))}
                                        {GLOBAL_CITIES.filter(c =>
                                            c.name.toLowerCase().includes(debouncedOriginSearch.toLowerCase()) ||
                                            c.code.toLowerCase().includes(debouncedOriginSearch.toLowerCase()) ||
                                            c.country.toLowerCase().includes(debouncedOriginSearch.toLowerCase())
                                        ).length === 0 && (
                                                <li className="px-6 py-4 text-slate-400 italic text-center">No cities found</li>
                                            )}
                                    </ul>
                                </div>
                            )}
                            {/* Swap Button */}
                            <div className="flex absolute right-6 top-[90px] lg:right-auto lg:left-[19%] lg:top-[35%] lg:-translate-x-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-[#D60D26] text-white items-center justify-center shadow-md hover:scale-110 active:scale-95 transition-all cursor-pointer group/swap rotate-90 lg:rotate-0"
                                onClick={() => {
                                    const tempOrigin = origin;
                                    const tempOriginSearch = originSearch;
                                    setOrigin(destination);
                                    setOriginSearch(destinationSearch);
                                    setDestination(tempOrigin);
                                    setDestinationSearch(tempOriginSearch);
                                    setActiveDropdown(null);
                                }}>
                                <ArrowRight className="w-4 h-4 text-white" strokeWidth={3} />
                            </div>
                        </div>

                        {/* Destination Input */}
                        <div className="flex flex-col flex-1 min-w-[190px] group relative h-[90px] w-full lg:w-auto lg:pl-10">
                            <label className="text-[14px] font-bold text-slate-400 mb-1.5 block">Going To</label>
                            <input
                                type="text"
                                className="bg-transparent border-none outline-none font-extrabold text-slate-900 tracking-tight text-[24px] p-0 placeholder:text-slate-300 leading-none h-[30px] w-full"
                                value={destinationSearch}
                                onChange={(e) => {
                                    setDestinationSearch(e.target.value);
                                    setActiveDropdown('destination');
                                }}
                                onFocus={() => setActiveDropdown('destination')}
                                placeholder="City or Airport"
                            />
                            <p className="text-[12px] text-[#888] mt-1 truncate font-medium">
                                {GLOBAL_CITIES.find(c => c.name.toLowerCase() === destination.toLowerCase() || c.code.toLowerCase() === destination.toLowerCase())?.name || destination || "Anywhere"}
                            </p>
                            <div className="absolute bottom-0 left-0 lg:left-6 w-full lg:w-[90%] h-[1.5px] bg-slate-200 group-hover:bg-slate-300 hidden lg:block" />

                            {/* Destination Autocomplete Dropdown */}
                            {activeDropdown === 'destination' && debouncedDestinationSearch.length >= 2 && (
                                <div className="absolute top-[100%] left-0 lg:left-6 w-[120%] lg:w-[110%] bg-white rounded-2xl shadow-2xl z-[100] mt-2 border border-slate-100 max-h-[300px] overflow-y-auto">
                                    <ul className="py-2">
                                        {GLOBAL_CITIES.filter(c =>
                                            c.name.toLowerCase().includes(debouncedDestinationSearch.toLowerCase()) ||
                                            c.code.toLowerCase().includes(debouncedDestinationSearch.toLowerCase()) ||
                                            c.country.toLowerCase().includes(debouncedDestinationSearch.toLowerCase())
                                        ).map(city => (
                                            <li
                                                key={city.code}
                                                className="px-6 py-3 hover:bg-slate-50 cursor-pointer flex items-center justify-between border-b border-slate-50 last:border-0"
                                                onClick={() => {
                                                    setDestination(city.name);
                                                    setDestinationSearch(city.name);
                                                    setActiveDropdown(null);
                                                }}
                                            >
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-slate-800 text-[15px]">{city.name}</span>
                                                    <span className="text-slate-400 text-[13px]">{city.country}</span>
                                                </div>
                                                <span className="font-bold text-slate-300 bg-slate-100 px-2 py-1 rounded text-[12px]">{city.code}</span>
                                            </li>
                                        ))}
                                        {GLOBAL_CITIES.filter(c =>
                                            c.name.toLowerCase().includes(debouncedDestinationSearch.toLowerCase()) ||
                                            c.code.toLowerCase().includes(debouncedDestinationSearch.toLowerCase()) ||
                                            c.country.toLowerCase().includes(debouncedDestinationSearch.toLowerCase())
                                        ).length === 0 && (
                                                <li className="px-6 py-4 text-slate-400 italic text-center">No cities found</li>
                                            )}
                                    </ul>
                                </div>
                            )}
                        </div>

                        {/* Departure Date Calendar (2026) */}
                        <Popover open={isDepOpen} onOpenChange={setIsDepOpen}>
                            <PopoverTrigger asChild>
                                <div className="flex flex-col w-full lg:w-[150px] xl:w-[170px] group cursor-pointer relative h-[90px]">
                                    <label className="text-[14px] font-bold text-slate-400 mb-1.5 flex items-center gap-1">Departure Date <ChevronDown className="w-4 h-4" /></label>
                                    <div className="font-extrabold text-slate-900 tracking-tight text-[24px] leading-none h-[30px] flex items-center">{date ? format(date, "dd MMM' yy") : "Select Date"}</div>
                                    <p className="text-[13px] text-slate-500 mt-1.5 font-semibold">{date ? format(date, "EEEE") : ""}</p>
                                    <div className="absolute bottom-0 left-0 w-full lg:w-[90%] h-[1.5px] bg-slate-200 group-hover:bg-slate-300" />
                                </div>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0 bg-white rounded-3xl shadow-2xl border-none overflow-hidden z-[110]" align="center" side="bottom" sideOffset={8} avoidCollisions={false}>
                                <Calendar
                                    mode="single"
                                    selected={date}
                                    onSelect={(d) => {
                                        if (d) {
                                            setDate(d);
                                            setIsDepOpen(false);
                                            // Auto-correct return date if it's earlier than new departure date
                                            if (returnDate && d > returnDate) {
                                                setReturnDate(d);
                                            }
                                        }
                                    }}
                                    numberOfMonths={2}
                                    defaultMonth={date || new Date(2026, 2)}
                                    fromDate={new Date(2026, 0, 1)}
                                    toDate={new Date(2026, 11, 31)}
                                    classNames={calendarClassNames}
                                />
                            </PopoverContent>
                        </Popover>

                        {/* Return Date Calendar */}
                        <Popover open={isRetOpen} onOpenChange={setIsRetOpen}>
                            <PopoverTrigger asChild>
                                <div
                                    className={cn(
                                        "flex flex-col w-full lg:w-[150px] xl:w-[170px] group cursor-pointer relative h-[90px]",
                                        tripType === 'one-way' ? "opacity-60 hover:opacity-100 transition-opacity" : ""
                                    )}
                                    onClick={() => {
                                        if (tripType === 'one-way') {
                                            setTripType('round-trip');
                                        }
                                    }}
                                >
                                    <label className="text-[14px] font-bold text-slate-400 mb-1.5 block">Return Date</label>
                                    <div className="h-[46px] flex items-start pt-[2px]">
                                        {returnDate && tripType !== 'one-way' ? (
                                            <div className="font-extrabold text-slate-900 tracking-tight text-[24px] leading-none">
                                                {format(returnDate, "dd MMM' yy")}
                                                <p className="text-[13px] text-slate-500 mt-1.5 font-semibold">{format(returnDate, "EEEE")}</p>
                                            </div>
                                        ) : (
                                            <span className="text-[#888] text-[14px] font-bold leading-tight tracking-tight hover:underline">
                                                Book Round Trip<br />To Save Extra
                                            </span>
                                        )}
                                    </div>
                                    <div className="absolute bottom-0 left-0 w-full lg:w-[90%] h-[1.5px] bg-slate-200 group-hover:bg-slate-300" />
                                </div>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0 bg-white rounded-3xl shadow-2xl border-none overflow-hidden z-[110]" align="center" side="bottom" sideOffset={8} avoidCollisions={false}>
                                <Calendar
                                    mode="single"
                                    selected={returnDate}
                                    onSelect={(d) => { if (d) { setReturnDate(d); setIsRetOpen(false); } }}
                                    numberOfMonths={2}
                                    defaultMonth={date || returnDate || new Date(2026, 2)}
                                    fromDate={date || new Date(2026, 0, 1)}
                                    toDate={new Date(2026, 11, 31)}
                                    disabled={(d) => date ? d < new Date(date.getFullYear(), date.getMonth(), date.getDate()) : false}
                                    classNames={calendarClassNames}
                                />
                            </PopoverContent>
                        </Popover>

                        {/* Travellers & Cabin Class with Working DONE button */}
                        <Popover open={isTravellerOpen} onOpenChange={setIsTravellerOpen}>
                            <PopoverTrigger asChild>
                                <div className="flex flex-col w-full lg:w-[150px] xl:w-[170px] group cursor-pointer relative h-[90px]">
                                    <label className="text-[14px] font-bold text-slate-400 mb-1.5 flex items-center gap-1">Travellers & Class <ChevronDown className="w-4 h-4" /></label>
                                    <div className="font-extrabold text-slate-900 tracking-tight text-[24px] leading-none h-[30px] flex items-center truncate">
                                        {travellers.adults + travellers.children + travellers.infants} Traveller
                                    </div>
                                    <p className="text-[13px] text-slate-500 mt-1.5 font-semibold">{cabinClass}</p>
                                    <div className="absolute bottom-0 left-0 w-full lg:w-[90%] h-[1.5px] bg-slate-200 group-hover:bg-slate-300" />
                                </div>
                            </PopoverTrigger>
                            <PopoverContent className="w-[320px] p-5 bg-white rounded-xl shadow-2xl border-none z-[110]" align="center" side="bottom" sideOffset={8} avoidCollisions={false}>
                                <div className="space-y-5">
                                    {[
                                        { label: 'Adults', age: '(12+ Years)', key: 'adults' as const },
                                        { label: 'Children', age: '(2-12 Years)', key: 'children' as const },
                                        { label: 'Infant', age: '(0-2 Years)', key: 'infants' as const }
                                    ].map((item) => (
                                        <div key={item.key} className="flex items-center justify-between">
                                            <div>
                                                <p className="font-bold text-slate-800 text-[16px]">{item.label}</p>
                                                <p className="text-[12px] text-slate-500 font-medium">{item.age}</p>
                                            </div>
                                            <div className="flex items-center border border-slate-200 rounded-md h-[36px]">
                                                <button onClick={() => updateTravellers(item.key, 'sub')} className="px-3 text-slate-600 font-bold border-r border-slate-200">-</button>
                                                <span className="px-4 font-bold text-slate-800 min-w-[36px] text-center">{travellers[item.key]}</span>
                                                <button onClick={() => updateTravellers(item.key, 'add')} className="px-3 text-slate-600 font-bold border-l border-slate-200">+</button>
                                            </div>
                                        </div>
                                    ))}
                                    <hr className="border-slate-100" />
                                    <div className="space-y-2.5">
                                        {['Economy', 'Prem. Economy', 'Business', 'First'].map((cabin) => (
                                            <label key={cabin} className="flex items-center gap-3 cursor-pointer group" onClick={() => setCabinClass(cabin)}>
                                                <div className={cn("w-5 h-5 rounded-full border-2 flex items-center justify-center", cabinClass === cabin ? "border-[#888]" : "border-slate-300")}>
                                                    {cabinClass === cabin && <div className="w-2.5 h-2.5 rounded-full bg-[#888]" />}
                                                </div>
                                                <span className="text-[14px] font-semibold text-slate-700">{cabin}</span>
                                            </label>
                                        ))}
                                    </div>
                                    {/* Done Button Logic: Closes the Popover */}
                                    <Button className="w-full mt-2 py-5 bg-white border-2 border-[#888] text-[#888] hover:bg-blue-50 font-bold text-[16px] rounded-xl shadow-none" onClick={() => setIsTravellerOpen(false)}>Done</Button>
                                </div>
                            </PopoverContent>
                        </Popover>

                        {/* +/- Day Dropdown Popover */}
                        <Popover open={isDayVarianceOpen} onOpenChange={setIsDayVarianceOpen}>
                            <PopoverTrigger asChild>
                                <div className="flex flex-col w-full lg:w-[100px] xl:w-[120px] group relative h-[90px] cursor-pointer pr-4">
                                    <label className="text-[14px] font-bold text-slate-400 mb-1.5 flex items-center gap-1 whitespace-nowrap">+/- Day <ChevronDown className="w-4 h-4" /></label>
                                    <div className="font-extrabold text-slate-900 tracking-tight text-[24px] leading-none h-[30px] flex items-center">+/- 0{dayVariance}</div>
                                    <p className="text-[13px] text-slate-500 mt-1.5 font-semibold">Day{dayVariance !== 1 ? 's' : ''}</p>
                                    <div className="absolute bottom-0 left-0 w-full lg:w-[90%] h-[1.5px] bg-slate-200 group-hover:bg-slate-300" />
                                </div>
                            </PopoverTrigger>
                            <PopoverContent className="w-[180px] p-3 bg-white rounded-xl shadow-2xl border-none z-[110]" align="start" side="bottom" sideOffset={8}>
                                <div className="flex flex-col space-y-1">
                                    {[0, 1, 2, 3].map((days) => (
                                        <button 
                                            key={days}
                                            className={cn(
                                                "w-full text-left px-4 py-2.5 rounded-lg font-bold text-[15px] transition-colors",
                                                dayVariance === days ? "bg-[#D60D26] text-white" : "text-slate-700 hover:bg-slate-100"
                                            )}
                                            onClick={() => {
                                                setDayVariance(days);
                                                setIsDayVarianceOpen(false);
                                            }}
                                        >
                                            +/- 0{days} Day{days !== 1 ? 's' : ''}
                                        </button>
                                    ))}
                                </div>
                            </PopoverContent>
                        </Popover>

                        <div className="flex items-center justify-center lg:justify-end h-auto pb-4 lg:pb-0 lg:pl-1 w-full lg:w-auto mt-4 lg:mt-0 flex-shrink-0">
                            <Button onClick={handleSearch} className="w-full lg:w-auto bg-[#D60D26] hover:bg-[#D60D26] text-white rounded-full px-8 py-5 h-[48px] text-[15px] font-bold shadow-md flex items-center justify-center gap-1 transition-transform active:scale-95">
                                Search <ArrowUpRight className="w-4 h-4" strokeWidth={2.5} />
                            </Button>
                        </div>
                    </div>
                )}

                {/* Checkboxes Row */}
                <div className="flex items-center space-x-6 pt-2">
                    <div className="flex items-center space-x-2.5">
                        <button id="baggageFares" onClick={() => setBaggageFares(!baggageFares)} className={cn("w-[16px] h-[16px] rounded-[3px] border flex items-center justify-center shadow-sm transition-colors", baggageFares ? "bg-[#D60D26] border-[#D60D26]" : "border-[#D60D26] bg-white")}>
                            {baggageFares && <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                        </button>
                        <label htmlFor="baggageFares" className="text-[13px] font-medium text-slate-500 cursor-pointer select-none" onClick={() => setBaggageFares(!baggageFares)}>Baggage Fares Only</label>
                    </div>

                    {/* Vertical Divider */}
                    <div className="hidden sm:block w-[1.5px] h-4 bg-slate-200" />

                    <div className="flex items-center space-x-2.5">
                        <button id="nonStop" onClick={() => setNonStop(!nonStop)} className={cn("w-[16px] h-[16px] rounded-[3px] border flex items-center justify-center shadow-sm transition-colors", nonStop ? "bg-[#D60D26] border-[#D60D26]" : "border-[#D60D26] bg-white")}>
                            {nonStop && <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                        </button>
                        <label htmlFor="nonStop" className="text-[13px] font-medium text-slate-500 cursor-pointer select-none" onClick={() => setNonStop(!nonStop)}>Non- Stops Flights</label>
                    </div>
                </div>

                {errorMsg && (
                    <div className="text-brand font-semibold text-[15px] bg-red-50 p-3 rounded-md mt-2 border border-red-100 flex items-center gap-2">
                        <span>⚠️ {errorMsg}</span>
                    </div>
                )}
            </div>
        </div>
    );
}
