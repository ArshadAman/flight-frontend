"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  ChevronDown, 
  ChevronUp, 
  Search, 
  SlidersHorizontal, 
  ArrowRight,
  Wifi,
  Coffee,
  Plug,
  Accessibility,
  ArrowUpRight,
  User,
  Info
} from 'lucide-react';
import { Logo } from '@/components/ui/logo';

export default function B2BFlightsPage() {
  const [balanceHidden, setBalanceHidden] = useState(true);
  const [activeSort, setActiveSort] = useState('Recommended');
  const [sortOpen, setSortOpen] = useState(false);

  // Accordion active state trackers
  const [filtersOpen, setFiltersOpen] = useState({
    general: true,
    baggage: false,
    fareType: true,
    ticketLimit: false,
    maxTime: false,
    price: true,
    stops: true,
    equipment: false,
    times: false
  });

  const toggleFilter = (key: keyof typeof filtersOpen) => {
    setFiltersOpen(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  // Mock list of flight cards corresponding to Air India and other carriers matching B2B screenshot
  const flightCards = [
    {
      id: 1,
      price: 120,
      tax: 34,
      airline: "AIR INDIA",
      stopsCount: 2,
      segments: [
        {
          code: "AI 2814",
          date: "Wed, 01 Oct 25",
          route: "DEL ➔ MUM",
          class: "E1/Economy",
          timing: "10:00PM - 12:40AM",
          duration: "02:55hr",
          seatsCode: "0/32N"
        },
        {
          code: "AI 2814",
          date: "Wed, 01 Oct 25",
          route: "DEL ➔ MUM",
          class: "E1/Economy",
          timing: "10:00PM - 12:40AM",
          duration: "02:55hr",
          seatsCode: "0/32N"
        }
      ]
    },
    {
      id: 2,
      price: 145,
      tax: 38,
      airline: "INDIGO",
      stopsCount: 1,
      segments: [
        {
          code: "6E 2104",
          date: "Wed, 01 Oct 25",
          route: "DEL ➔ MUM",
          class: "E1/Economy",
          timing: "08:15AM - 10:30AM",
          duration: "02:15hr",
          seatsCode: "4/32N"
        }
      ]
    },
    {
      id: 3,
      price: 210,
      tax: 54,
      airline: "VISTARA",
      stopsCount: 2,
      segments: [
        {
          code: "UK 815",
          date: "Wed, 01 Oct 25",
          route: "DEL ➔ MUM",
          class: "E1/Economy",
          timing: "04:30PM - 07:15PM",
          duration: "02:45hr",
          seatsCode: "1/32N"
        },
        {
          code: "UK 820",
          date: "Wed, 01 Oct 25",
          route: "DEL ➔ MUM",
          class: "E1/Economy",
          timing: "09:00PM - 11:45PM",
          duration: "02:45hr",
          seatsCode: "0/32N"
        }
      ]
    }
  ];

  return (
    <div className="w-full min-h-screen bg-[#F2FBFF] flex flex-col font-sans text-slate-800 antialiased">
      
      {/* 1. B2B Custom Header matching Figma exactly */}
      <header className="w-full bg-white border-b border-slate-200 sticky top-0 z-50 px-6 py-3">
        <div className="max-w-[1440px] mx-auto flex items-center justify-between">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-12">
            <Link href="/" className="flex flex-col items-center justify-center select-none cursor-pointer">
              <Logo />
              <div className="flex flex-col items-center mt-0.5">
                <h1 className="text-[20px] font-[900] text-primary leading-none tracking-tighter" style={{ letterSpacing: '-0.04em' }}>
                  Travel Deal
                </h1>
                {/* Red Underline Arc */}
                <svg width="100" height="6" viewBox="2 2 100 6" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-primary mt-0.5">
                  <path d="M2 5C25 0 75 0 98 5L98 6C75 2 25 2 2 6Z" fill="currentColor" />
                </svg>
              </div>
            </Link>

            {/* Menu Items with Arrows */}
            <nav className="hidden lg:flex items-center gap-7">
              {['Group Travel', 'My Booking', 'My Account', 'For Sale'].map((item, idx) => (
                <div key={idx} className="relative group">
                  <button className="flex items-center gap-1 text-[16px] font-[700] text-slate-600 hover:text-primary transition-colors py-2">
                    {item === 'Group Travel' ? (
                      <Link href="/b2b/group-travel/new">{item}</Link>
                    ) : item === 'My Booking' ? (
                      <Link href="/b2b/my-booking">{item}</Link>
                    ) : item === 'My Account' ? (
                      <Link href="/b2b/my-account">{item}</Link>
                    ) : item === 'For Sale' ? (
                      <Link href="/b2b/for-sale">{item}</Link>
                    ) : (
                      <span>{item}</span>
                    )}
                    <ChevronDown className="w-4 h-4 text-slate-400 group-hover:text-primary transition-colors" />
                  </button>
                  {/* Subtle hover dropdown visual hint */}
                  <div className="absolute top-full left-0 w-40 bg-white border border-slate-200 rounded-lg shadow-lg py-2 mt-1 opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50">
                    <p className="px-4 py-1.5 text-xs font-bold text-slate-400 uppercase tracking-wider">Options</p>
                    <div className="w-full h-[1px] bg-slate-100 my-1"></div>
                    <button className="w-full text-left px-4 py-1.5 hover:bg-slate-50 text-sm font-semibold">Dashboard</button>
                    <button className="w-full text-left px-4 py-1.5 hover:bg-slate-50 text-sm font-semibold">Reports</button>
                  </div>
                </div>
              ))}
            </nav>
          </div>

          {/* User Sanjay dropdown & Balance Badge */}
          <div className="flex items-center gap-5">
            {/* Sanjay User Pill */}
            <div className="relative group">
              <button className="flex items-center gap-1.5 text-[16px] font-[700] text-slate-700 bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-full transition">
                <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                  <User className="w-3.5 h-3.5" />
                </span>
                <span>Sanjay</span>
                <ChevronDown className="w-4 h-4 text-slate-500" />
              </button>
              {/* Logout panel */}
              <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-100 py-2 opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50">
                <p className="px-4 py-1 text-xs font-bold text-slate-400">Agent Account</p>
                <div className="w-full h-[1px] bg-slate-100 my-1"></div>
                <Link href="/" className="block px-4 py-2 text-sm text-red-600 hover:bg-slate-50 font-bold">Logout</Link>
              </div>
            </div>

            {/* Red Outlined Balance Pill */}
            <button 
              onClick={() => setBalanceHidden(!balanceHidden)}
              className="border-[2px] border-primary hover:bg-primary/5 text-primary rounded-full px-5 py-2 text-[15px] font-[800] tracking-wide transition-all active:scale-95 flex items-center gap-2 select-none"
            >
              <span>Balance</span>
              <span className="font-extrabold uppercase tracking-widest text-[16px]">
                {balanceHidden ? "XXXX" : "₹ 1,24,500"}
              </span>
            </button>
          </div>

        </div>
      </header>

      {/* 2. Red Gradient Sub-Header Bar matching Figma exactly */}
      <section className="w-full bg-gradient-to-r from-primary to-[#121121] py-5 px-6 shadow-md">
        <div className="max-w-[1440px] mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          {/* Destination Details */}
          <div className="flex flex-col items-center md:items-start text-white">
            <div className="flex items-center gap-3 text-[20px] md:text-[23px] font-[900] tracking-tight">
              <span>New Delhi</span>
              <span className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center text-rose-200">➔</span>
              <span>Mumbai</span>
            </div>
            <div className="flex items-center gap-2 text-xs md:text-[13px] font-[600] text-rose-100 opacity-90 mt-1">
              <span>01 Oct</span>
              <span>•</span>
              <span>1 passenger</span>
              <span>•</span>
              <span>Economy</span>
            </div>
          </div>

          {/* Search Again capsule CTA */}
          <Link 
            href="/"
            className="bg-primary hover:bg-[#D60D26] border border-white/20 text-white rounded-full px-6 py-2.5 font-[700] text-[15px] shadow-lg flex items-center gap-2 transition hover:scale-105 active:scale-95"
          >
            <span>Search Again</span>
            <ArrowUpRight className="w-4 h-4 stroke-[2.5px]" />
          </Link>
        </div>
      </section>

      {/* 3. Main Split Grid Container */}
      <div className="max-w-[1440px] mx-auto px-6 py-8 flex flex-col lg:flex-row gap-8 w-full flex-1">
        
        {/* Left Column: Accordion Filters Panel */}
        <aside className="w-full lg:w-[285px] shrink-0">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5 flex flex-col">
            
            {/* Filter Panel Header */}
            <div className="flex items-center gap-2 text-[17px] font-[900] text-[#121121] pb-4 border-b border-slate-100 mb-2">
              <SlidersHorizontal className="w-4.5 h-4.5 text-primary stroke-[2.5px]" />
              <span>Filters :</span>
            </div>

            {/* Accordion Categories */}
            <div className="flex flex-col">
              
              {/* Accordion 1: General */}
              <div className="border-b border-slate-100 py-3">
                <button 
                  onClick={() => toggleFilter('general')}
                  className="w-full flex items-center justify-between text-[15px] font-[750] text-[#121121] py-1"
                >
                  <span>General</span>
                  {filtersOpen.general ? <ChevronUp className="w-4.5 h-4.5 text-slate-400" /> : <ChevronDown className="w-4.5 h-4.5 text-slate-400" />}
                </button>
                {filtersOpen.general && (
                  <div className="mt-3 flex flex-col gap-2.5 px-1 animate-in fade-in slide-in-from-top-1 duration-200">
                    <label className="flex items-center gap-2.5 cursor-pointer text-sm font-semibold text-slate-600 hover:text-slate-800">
                      <input type="checkbox" defaultChecked className="rounded border-slate-300 text-primary focus:ring-primary w-4.5 h-4.5" />
                      <span>Non-stop flights only</span>
                    </label>
                    <label className="flex items-center gap-2.5 cursor-pointer text-sm font-semibold text-slate-600 hover:text-slate-800">
                      <input type="checkbox" className="rounded border-slate-300 text-primary focus:ring-primary w-4.5 h-4.5" />
                      <span>Refundable Fares</span>
                    </label>
                  </div>
                )}
              </div>

              {/* Accordion 2: Baggage */}
              <div className="border-b border-slate-100 py-3">
                <button 
                  onClick={() => toggleFilter('baggage')}
                  className="w-full flex items-center justify-between text-[15px] font-[750] text-[#121121] py-1"
                >
                  <span>Baggage</span>
                  {filtersOpen.baggage ? <ChevronUp className="w-4.5 h-4.5 text-slate-400" /> : <ChevronDown className="w-4.5 h-4.5 text-slate-400" />}
                </button>
                {filtersOpen.baggage && (
                  <div className="mt-3 flex flex-col gap-2 px-1 animate-in fade-in duration-200">
                    <label className="flex items-center gap-2.5 cursor-pointer text-sm font-semibold text-slate-600">
                      <input type="checkbox" className="rounded border-slate-300 text-primary focus:ring-primary w-4.5 h-4.5" />
                      <span>Cabin Baggage Included</span>
                    </label>
                    <label className="flex items-center gap-2.5 cursor-pointer text-sm font-semibold text-slate-600">
                      <input type="checkbox" className="rounded border-slate-300 text-primary focus:ring-primary w-4.5 h-4.5" />
                      <span>Checked baggage 15kg+</span>
                    </label>
                  </div>
                )}
              </div>

              {/* Accordion 3: Fare Type */}
              <div className="border-b border-slate-100 py-3">
                <button 
                  onClick={() => toggleFilter('fareType')}
                  className="w-full flex items-center justify-between text-[15px] font-[750] text-[#121121] py-1"
                >
                  <span>Fare type</span>
                  {filtersOpen.fareType ? <ChevronUp className="w-4.5 h-4.5 text-slate-400" /> : <ChevronDown className="w-4.5 h-4.5 text-slate-400" />}
                </button>
                {filtersOpen.fareType && (
                  <div className="mt-3 flex flex-col gap-2 px-1 animate-in fade-in duration-200">
                    <label className="flex items-center gap-2.5 cursor-pointer text-sm font-semibold text-slate-600">
                      <input type="radio" name="fare" defaultChecked className="text-primary focus:ring-primary w-4 h-4" />
                      <span>Public Fare (PUB)</span>
                    </label>
                    <label className="flex items-center gap-2.5 cursor-pointer text-sm font-semibold text-slate-600">
                      <input type="radio" name="fare" className="text-primary focus:ring-primary w-4 h-4" />
                      <span>Corporate Fare</span>
                    </label>
                  </div>
                )}
              </div>

              {/* Accordion 4: Ticket Time Limit */}
              <div className="border-b border-slate-100 py-3">
                <button 
                  onClick={() => toggleFilter('ticketLimit')}
                  className="w-full flex items-center justify-between text-[15px] font-[750] text-[#121121] py-1"
                >
                  <span>Ticket time limit</span>
                  {filtersOpen.ticketLimit ? <ChevronUp className="w-4.5 h-4.5 text-slate-400" /> : <ChevronDown className="w-4.5 h-4.5 text-slate-400" />}
                </button>
                {filtersOpen.ticketLimit && (
                  <div className="mt-3 text-xs font-semibold text-slate-400 px-1 animate-in fade-in duration-200">
                    Filter flights by ticket time constraints.
                  </div>
                )}
              </div>

              {/* Accordion 5: Max Time Travel */}
              <div className="border-b border-slate-100 py-3">
                <button 
                  onClick={() => toggleFilter('maxTime')}
                  className="w-full flex items-center justify-between text-[15px] font-[750] text-[#121121] py-1"
                >
                  <span>Max. time travel</span>
                  {filtersOpen.maxTime ? <ChevronUp className="w-4.5 h-4.5 text-slate-400" /> : <ChevronDown className="w-4.5 h-4.5 text-slate-400" />}
                </button>
                {filtersOpen.maxTime && (
                  <div className="mt-3 text-xs font-semibold text-slate-400 px-1 animate-in fade-in duration-200">
                    Configure travel limits.
                  </div>
                )}
              </div>

              {/* Accordion 6: Price */}
              <div className="border-b border-slate-100 py-3">
                <button 
                  onClick={() => toggleFilter('price')}
                  className="w-full flex items-center justify-between text-[15px] font-[750] text-[#121121] py-1"
                >
                  <span>Price</span>
                  {filtersOpen.price ? <ChevronUp className="w-4.5 h-4.5 text-slate-400" /> : <ChevronDown className="w-4.5 h-4.5 text-slate-400" />}
                </button>
                {filtersOpen.price && (
                  <div className="mt-3 flex flex-col px-1 animate-in fade-in duration-200">
                    <input type="range" min="100" max="1000" defaultValue="500" className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary" />
                    <div className="flex justify-between text-xs font-bold text-slate-500 mt-2">
                      <span>INR 100</span>
                      <span>INR 1,000</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Accordion 7: No of Stops */}
              <div className="border-b border-slate-100 py-3">
                <button 
                  onClick={() => toggleFilter('stops')}
                  className="w-full flex items-center justify-between text-[15px] font-[750] text-[#121121] py-1"
                >
                  <span>No. of stops</span>
                  {filtersOpen.stops ? <ChevronUp className="w-4.5 h-4.5 text-slate-400" /> : <ChevronDown className="w-4.5 h-4.5 text-slate-400" />}
                </button>
                {filtersOpen.stops && (
                  <div className="mt-3 flex flex-col gap-2.5 px-1 animate-in fade-in duration-200">
                    <label className="flex items-center gap-2.5 cursor-pointer text-sm font-semibold text-slate-600">
                      <input type="checkbox" className="rounded border-slate-300 text-primary w-4.5 h-4.5" />
                      <span>Non-Stop</span>
                    </label>
                    <label className="flex items-center gap-2.5 cursor-pointer text-sm font-semibold text-slate-600">
                      <input type="checkbox" defaultChecked className="rounded border-slate-300 text-primary w-4.5 h-4.5" />
                      <span>1 Stop</span>
                    </label>
                    <label className="flex items-center gap-2.5 cursor-pointer text-sm font-semibold text-slate-600">
                      <input type="checkbox" defaultChecked className="rounded border-slate-300 text-primary w-4.5 h-4.5" />
                      <span>2+ Stops</span>
                    </label>
                  </div>
                )}
              </div>

              {/* Accordion 8: Equipment */}
              <div className="border-b border-slate-100 py-3">
                <button 
                  onClick={() => toggleFilter('equipment')}
                  className="w-full flex items-center justify-between text-[15px] font-[750] text-[#121121] py-1"
                >
                  <span>Equipment</span>
                  {filtersOpen.equipment ? <ChevronUp className="w-4.5 h-4.5 text-slate-400" /> : <ChevronDown className="w-4.5 h-4.5 text-slate-400" />}
                </button>
                {filtersOpen.equipment && (
                  <div className="mt-3 text-xs font-semibold text-slate-400 px-1 animate-in fade-in duration-200">
                    Search by airplane cabin specs.
                  </div>
                )}
              </div>

              {/* Accordion 9: Departure & Arrival Time */}
              <div className="py-3">
                <button 
                  onClick={() => toggleFilter('times')}
                  className="w-full flex items-center justify-between text-[15px] font-[750] text-[#121121] py-1"
                >
                  <span>Departure & arrival time</span>
                  {filtersOpen.times ? <ChevronUp className="w-4.5 h-4.5 text-slate-400" /> : <ChevronDown className="w-4.5 h-4.5 text-slate-400" />}
                </button>
                {filtersOpen.times && (
                  <div className="mt-3 text-xs font-semibold text-slate-400 px-1 animate-in fade-in duration-200">
                    Filter by specific departure hours.
                  </div>
                )}
              </div>

            </div>
          </div>
        </aside>

        {/* Right Column: Search Results Grid */}
        <section className="flex-1 flex flex-col">
          
          {/* Header Area */}
          <div className="flex justify-between items-center mb-6">
            <p className="text-[17px] font-[800] text-slate-700">
              Showing <span className="text-primary font-black">3</span> of <span className="text-primary font-black">257 places</span>
            </p>

            {/* Sort Selector Dropdown */}
            <div className="relative">
              <button 
                onClick={() => setSortOpen(!sortOpen)}
                className="flex items-center gap-1.5 text-[15px] font-[750] text-slate-700 bg-white border border-slate-200 rounded-xl px-4 py-2 hover:bg-slate-50 transition shadow-sm"
              >
                <span>Sort by: <span className="text-[#121121] font-[900]">{activeSort}</span></span>
                <ChevronDown className="w-4 h-4 text-slate-400" />
              </button>
              {sortOpen && (
                <div className="absolute right-0 mt-1.5 w-52 bg-white border border-slate-200 rounded-xl shadow-lg py-2 z-40 animate-in fade-in slide-in-from-top-1 duration-150">
                  {['Recommended', 'Cheapest', 'Fastest', 'Price: Low to High'].map((opt) => (
                    <button
                      key={opt}
                      onClick={() => {
                        setActiveSort(opt);
                        setSortOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2 text-sm font-semibold hover:bg-slate-50 transition-colors ${activeSort === opt ? 'text-primary' : 'text-slate-600'}`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* List of Flight Cards matching B2B mockup exactly */}
          <div className="flex flex-col gap-6">
            {flightCards.map((card) => (
              <div 
                key={card.id}
                className="bg-white border border-slate-200 rounded-2xl shadow-[0_4px_16px_rgba(0,0,0,0.02)] overflow-hidden hover:shadow-md transition-shadow duration-300"
              >
                
                {/* Horizontal Top Header Row (Grey blue surface background matching Figma!) */}
                <div className="bg-[#F2FBFF] px-6 py-4 flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 select-none">
                  
                  {/* Left block: Price & Taxes */}
                  <div className="flex items-baseline">
                    <span className="text-[#121121] font-[900] text-[25px] tracking-tight">
                      ${card.price}
                    </span>
                    <span className="text-[12px] font-[750] text-[#888] ml-2 tracking-wide uppercase">
                      Incl. ${card.tax} tax
                    </span>
                  </div>

                  {/* Middle block 1: Airline Brand */}
                  <div className="text-primary italic font-[1000] text-[21px] tracking-widest leading-none drop-shadow-[0_1px_1px_rgba(223,27,36,0.15)]">
                    {card.airline}
                  </div>

                  {/* Middle block 2: Stops Count */}
                  <div className="text-slate-600 text-[14px] font-[800] tracking-wide uppercase bg-slate-200/60 px-3 py-1 rounded-md">
                    Stops: {card.stopsCount}
                  </div>

                  {/* Right block: B2B/B2C Badges */}
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="bg-[#888] text-white text-[11px] font-[900] px-2.5 py-1 rounded select-none tracking-wider">PUB</span>
                    
                    {/* Suitcase Baggage Badge */}
                    <span className="bg-[#D60D26] text-white text-[11px] font-[900] px-2.5 py-1 rounded select-none tracking-wider flex items-center gap-1">
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M20 7H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7V5a3 3 0 00-6 0v2" />
                      </svg>
                      25K
                    </span>

                    <span className="border border-slate-300 text-slate-500 bg-white text-[11px] font-[800] px-2 py-0.5 rounded select-none">TKT</span>
                    <span className="border border-slate-300 text-slate-500 bg-white text-[11px] font-[800] px-2 py-0.5 rounded select-none">FEE</span>
                  </div>

                </div>

                {/* White Body Segment list */}
                <div className="flex flex-col bg-white">
                  {card.segments.map((seg, sIdx) => (
                    <div 
                      key={sIdx}
                      className="grid grid-cols-[auto_1fr_1.1fr_1.1fr_1fr] md:grid-cols-[40px_1fr_1.5fr_1.8fr_1fr_1.2fr_auto] gap-4 items-center px-6 py-4 border-b border-slate-100 hover:bg-slate-50/60 transition-colors last:border-b-0"
                    >
                      {/* Checkbox indicator circle */}
                      <div className="flex justify-center items-center">
                        <div className="w-5 h-5 rounded-full border border-slate-300 hover:border-primary cursor-pointer flex items-center justify-center transition-colors">
                          <div className="w-2.5 h-2.5 rounded-full bg-transparent hover:bg-primary transition-colors"></div>
                        </div>
                      </div>

                      {/* Flight details column */}
                      <div className="flex flex-col min-w-[70px]">
                        <span className="text-[15px] font-[900] text-slate-800">{seg.code}</span>
                        <span className="text-[12px] font-bold text-slate-400 mt-0.5">{seg.date}</span>
                      </div>

                      {/* Route column */}
                      <div className="flex flex-col min-w-[90px]">
                        <span className="text-[15px] font-[900] text-slate-800">{seg.route}</span>
                        <span className="text-[12px] font-bold text-slate-400 mt-0.5">{seg.class}</span>
                      </div>

                      {/* Departure/Arrival timing */}
                      <div className="flex flex-col min-w-[130px]">
                        <span className="text-[15px] font-[900] text-slate-800 tracking-tight">{seg.timing}</span>
                        <span className="text-[12px] font-bold text-slate-400 mt-0.5">Dep. Times</span>
                      </div>

                      {/* Duration */}
                      <div className="flex flex-col min-w-[70px]">
                        <span className="text-[15px] font-[900] text-slate-800">{seg.duration}</span>
                        <span className="text-[12px] font-bold text-slate-400 mt-0.5">Flight Time</span>
                      </div>

                      {/* Seat availability */}
                      <div className="flex flex-col min-w-[60px]">
                        <span className="text-[15px] font-[900] text-slate-800">{seg.seatsCode}</span>
                        <span className="text-[12px] font-bold text-[#D60D26] mt-0.5">Seats Left</span>
                      </div>

                      {/* Amenities Column (Wheelchair, Power, Wifi, Meal icons matching Figma!) */}
                      <div className="flex items-center gap-2.5 text-slate-400 pl-4 border-l border-slate-100 h-8">
                        {/* Wheelchair */}
                        <Accessibility className="w-4 h-4 hover:text-slate-600 cursor-help transition-colors" strokeWidth={2.5} />
                        {/* Power */}
                        <Plug className="w-4 h-4 hover:text-slate-600 cursor-help transition-colors" strokeWidth={2.5} />
                        {/* Wifi */}
                        <Wifi className="w-4 h-4 hover:text-slate-600 cursor-help transition-colors" strokeWidth={2.5} />
                        {/* Meal / Coffee */}
                        <Coffee className="w-4 h-4 hover:text-slate-600 cursor-help transition-colors" strokeWidth={2.5} />
                      </div>

                    </div>
                  ))}
                </div>

              </div>
            ))}
          </div>

        </section>

      </div>

      <div className="w-full bg-[#121121] text-white/50 text-center py-6 text-sm font-semibold select-none">
        © 2026 My Travel Deal B2B Booking Portal. Authorized Agents Area.
      </div>

    </div>
  );
}
