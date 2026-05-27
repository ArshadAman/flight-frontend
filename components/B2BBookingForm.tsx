"use client";

import React, { useState } from "react";
import { ArrowRight, Plane, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { COUNTRIES } from "@/lib/data/countries";

export function B2BBookingForm() {
  const router = useRouter();
  const [activeStep, setActiveStep] = useState<'details' | 'payment'>('details');
  const [activeTab, setActiveTab] = useState<'APIS' | 'CTC' | 'FFN'>('APIS');
  const [docaType, setDocaType] = useState<'Destination' | 'Residence'>('Destination');
  const [paymentMethod, setPaymentMethod] = useState<'Card' | 'Net Banking' | 'Wallet'>('Card');

  return (
    <div className="w-full flex flex-col min-h-screen bg-[#FFFFFF]">
      {/* Top Split Header */}
      <div className="flex flex-col md:flex-row w-full h-auto md:h-[60px] select-none">
        <div className="w-full md:flex-1 bg-[#D60D26] text-white flex flex-col justify-center px-4 md:pl-10 py-3 md:py-0">
            <div className="flex items-center gap-2 font-bold text-[14px] md:text-[15px]">
                New Delhi <ArrowRight className="w-4 h-4" /> Mumbai
            </div>
            <div className="text-[12px] opacity-90 mt-0.5 tracking-wide">
                01 Oct • 1 passenger • Economy
            </div>
        </div>
        <div className="w-full md:flex-1 bg-[#121121] flex items-center justify-start md:justify-end px-4 md:pr-10 py-3 md:py-0 border-t border-white/10 md:border-t-0">
            <Button 
                onClick={() => router.push('/b2b')}
                className="bg-[#D60D26] hover:bg-[#D60D26] text-white rounded-[100px] px-6 h-[34px] font-bold text-[12px] shadow-sm flex items-center justify-center gap-1.5 transition-transform active:scale-95 w-full md:w-auto"
            >
                Search Again <ArrowUpRight className="w-3.5 h-3.5" strokeWidth={3} />
            </Button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="w-full max-w-[1280px] mx-auto py-8 px-4 flex flex-col">
          {/* Results text */}
          <div className="text-[#D60D26] font-semibold text-[14px] mb-5 pl-2 tracking-wide">
            Results: <span className="font-bold">72</span> result with 1 carrier found
          </div>

          <div className="flex flex-col gap-4">
              {/* DETAILS SECTION */}
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                  {/* Header */}
                  <div 
                    className={cn("px-6 py-3.5 flex items-center justify-between cursor-pointer transition-colors", activeStep === 'details' ? "bg-[#888]" : "bg-[#0C2342] hover:bg-[#0C2342]")}
                    onClick={() => setActiveStep('details')}
                  >
                      <h2 className="text-white font-bold text-[15px]">Details / Passenger Data</h2>
                  </div>

                  {/* Body - Details */}
                  {activeStep === 'details' && (
                    <div className="flex flex-col animate-in fade-in duration-300">
                        {/* Itinerary details */}
                        <div className="px-6 py-6 flex flex-col border-b border-slate-100">
                            <h3 className="text-slate-800 font-bold text-[14px] mb-5">Itinerary details:</h3>
                            {/* Flight Info Row */}
                            <div className="flex flex-wrap items-center gap-x-8 gap-y-4 mb-4">
                                <div className="flex items-center gap-2 w-[120px]">
                                    <span className="font-black text-[#D60D26] text-[16px] italic tracking-widest drop-shadow-sm">AIR INDIA</span>
                                </div>
                                <span className="text-[13px] font-semibold text-slate-600">AI 2814</span>
                                <span className="text-[13px] font-semibold text-slate-600">Wed, 01 Oct 25</span>
                                <span className="text-[13px] font-bold text-slate-800">DEL &rarr; MUM</span>
                                <span className="text-[13px] font-semibold text-slate-600">E1/Economy</span>
                                <span className="text-[13px] font-bold text-slate-800 tracking-tight">10:00PM - 12:40AM</span>
                                <span className="text-[13px] font-semibold text-slate-600">02:55hr</span>
                                <span className="text-[13px] font-semibold text-slate-600">0/32N</span>
                                <div className="flex items-center gap-2 text-slate-400">
                                    <Plane className="w-4 h-4" strokeWidth={2.5} />
                                </div>
                            </div>

                            {/* Badges */}
                            <div className="flex items-center gap-3 mt-1 select-none">
                                <span className="bg-[#888] text-white text-[11px] font-[900] px-2.5 py-1 rounded shadow-sm tracking-wider">PUB</span>
                                <span className="border border-slate-300 text-slate-600 bg-white text-[11px] font-[800] px-2.5 py-1 rounded shadow-sm">FEE</span>
                                <span className="bg-[#D60D26] text-white text-[11px] font-[900] px-2.5 py-1 rounded shadow-sm tracking-wider flex items-center gap-1.5">
                                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M20 7H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7V5a3 3 0 00-6 0v2" />
                                    </svg>
                                    25K
                                </span>
                                <span className="border border-slate-300 text-slate-600 bg-white text-[11px] font-[800] px-2.5 py-1 rounded shadow-sm">TKT</span>
                                <span className="text-[11px] font-bold text-slate-600 ml-1 tracking-wide">TKT Ordered 30SEP/25, 09:59pm</span>
                            </div>
                        </div>

                        {/* Price Details */}
                        <div className="flex flex-col border-b border-slate-100">
                            <div className="bg-[#F2FBFF] px-6 py-3 border-b border-slate-100">
                                <h3 className="text-slate-800 font-bold text-[14px]">Price details:</h3>
                            </div>
                            <div className="px-6 py-4 overflow-x-auto no-scrollbar">
                                <table className="w-full text-[13px] min-w-[800px]">
                                    <thead>
                                        <tr className="text-slate-400 font-medium text-left border-b border-slate-100">
                                            <th className="pb-3 pr-4 font-semibold">No.</th>
                                            <th className="pb-3 px-4 font-semibold">Pax</th>
                                            <th className="pb-3 px-4 font-semibold text-center">Price</th>
                                            <th className="pb-3 px-4 font-semibold text-center">Tax</th>
                                            <th className="pb-3 px-4 font-semibold text-center">Saving</th>
                                            <th className="pb-3 px-4 font-semibold text-center">Ticket fee</th>
                                            <th className="pb-3 px-4 font-semibold text-center">Markup</th>
                                            <th className="pb-3 pl-4 font-bold text-slate-700 text-center">Total p.p</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td className="pt-4 pr-4 font-bold text-slate-800">1</td>
                                            <td className="pt-4 px-4 font-semibold text-slate-600">ADT</td>
                                            <td className="pt-4 px-4 font-semibold text-slate-600 text-center">$42.40</td>
                                            <td className="pt-4 px-4 font-semibold text-slate-600 text-center">$0.00</td>
                                            <td className="pt-4 px-4 font-semibold text-slate-600 text-center">$0.00</td>
                                            <td className="pt-4 px-4 font-semibold text-slate-600 text-center">$10.00</td>
                                            <td className="pt-4 px-4 font-semibold text-slate-600 text-center">$0.00</td>
                                            <td className="pt-4 pl-4 font-black text-slate-900 text-center tracking-tight">$52.90</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Passenger Details Form */}
                        <div className="flex flex-col border-b border-slate-100">
                            <div className="bg-[#F2FBFF] px-6 py-3 border-b border-[#F2FBFF]">
                                <h3 className="text-slate-800 font-bold text-[14px]">Passengers details:</h3>
                            </div>
                            
                            <div className="p-6">
                                {/* Name row */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-6 gap-5 mb-8">
                                    <select className="col-span-1 border border-slate-200 rounded-md px-3 py-2.5 text-[13px] font-medium text-slate-600 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100 bg-white">
                                        <option>Salutation</option>
                                        <option>Mr.</option>
                                        <option>Mrs.</option>
                                        <option>Ms.</option>
                                    </select>
                                    <select className="col-span-1 border border-slate-200 rounded-md px-3 py-2.5 text-[13px] font-medium text-slate-600 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100 bg-white">
                                        <option>Title</option>
                                        <option>Dr.</option>
                                    </select>
                                    <input type="text" placeholder="Last Name" className="col-span-1 border border-slate-200 rounded-md px-3 py-2.5 text-[13px] font-medium outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100 placeholder:text-slate-400" />
                                    <input type="text" placeholder="First Name" className="col-span-1 border border-slate-200 rounded-md px-3 py-2.5 text-[13px] font-medium outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100 placeholder:text-slate-400" />
                                    <input type="text" placeholder="Middle Name" className="col-span-1 border border-slate-200 rounded-md px-3 py-2.5 text-[13px] font-medium outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100 placeholder:text-slate-400" />
                                    <div className="col-span-1">
                                        <input type="date" placeholder="Date Of Birth" className="w-full border border-slate-200 rounded-md px-3 py-2.5 text-[13px] font-medium text-slate-600 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100 bg-white" />
                                    </div>
                                </div>

                                {/* Tabs */}
                                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-1 sm:gap-2 mb-0 border-b border-slate-100 px-2">
                                    <button 
                                        onClick={() => setActiveTab('APIS')}
                                        className={cn("px-5 py-3 text-[12px] font-bold rounded-t-lg transition-colors border-b-2", activeTab === 'APIS' ? "bg-[#F2FBFF] text-[#D60D26] border-[#D60D26]" : "text-slate-500 hover:bg-slate-50 border-transparent")}
                                    >
                                        APIS <span className="font-semibold text-[11px] opacity-80">(Advance passenger information)</span>
                                    </button>
                                    <button 
                                        onClick={() => setActiveTab('CTC')}
                                        className={cn("px-5 py-3 text-[12px] font-bold rounded-t-lg transition-colors border-b-2", activeTab === 'CTC' ? "bg-[#F2FBFF] text-[#D60D26] border-[#D60D26]" : "text-slate-500 hover:bg-slate-50 border-transparent")}
                                    >
                                        CTC <span className="font-semibold text-[11px] opacity-80">(Passenger contact data)</span>
                                    </button>
                                    <button 
                                        onClick={() => setActiveTab('FFN')}
                                        className={cn("px-5 py-3 text-[12px] font-bold rounded-t-lg transition-colors border-b-2", activeTab === 'FFN' ? "bg-[#F2FBFF] text-[#D60D26] border-[#D60D26]" : "text-slate-500 hover:bg-slate-50 border-transparent")}
                                    >
                                        FFN <span className="font-semibold text-[11px] opacity-80">(Frequent flyer number)</span>
                                    </button>
                                </div>

                                {/* Tab Content */}
                                <div className="bg-[#F2FBFF]/40 rounded-b-xl border border-slate-100 p-8">
                                    {activeTab === 'APIS' && (
                                        <div className="flex flex-col gap-8 animate-in fade-in duration-200">
                                            {/* Primary DOCS */}
                                            <div className="flex flex-col gap-4">
                                                <h4 className="text-[13px] font-bold text-slate-800">Primary data of the travel document (DOCS)</h4>
                                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                                    <input type="text" placeholder="Last Name As Per Passport" className="border border-slate-200 rounded-md px-3 py-2.5 text-[12px] font-medium outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100 placeholder:text-slate-400 bg-white" />
                                                    <input type="text" placeholder="First Name As Per Passport" className="border border-slate-200 rounded-md px-3 py-2.5 text-[12px] font-medium outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100 placeholder:text-slate-400 bg-white" />
                                                    <input type="text" placeholder="Middle Name As Per Passport" className="border border-slate-200 rounded-md px-3 py-2.5 text-[12px] font-medium outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100 placeholder:text-slate-400 bg-white" />
                                                    <div className="relative">
                                                      <input type="date" placeholder="Date Of Birth" className="w-full border border-slate-200 rounded-md px-3 py-2.5 text-[12px] font-medium text-slate-600 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100 bg-white" />
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                                                    <select className="border border-slate-200 rounded-md px-3 py-2.5 text-[12px] font-medium text-slate-600 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100 bg-white">
                                                        <option>Document Type</option>
                                                        <option>Passport</option>
                                                    </select>
                                                    <select className="border border-slate-200 rounded-md px-3 py-2.5 text-[12px] font-medium text-slate-600 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100 bg-white">
                                                        <option>Document Number</option>
                                                    </select>
                                                    <select className="border border-slate-200 rounded-md px-3 py-2.5 text-[12px] font-medium text-slate-600 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100 bg-white">
                                                        <option value="">Country Of Issuance</option>
                                                        {COUNTRIES.map(country => <option key={country} value={country}>{country}</option>)}
                                                    </select>
                                                    <select className="border border-slate-200 rounded-md px-3 py-2.5 text-[12px] font-medium text-slate-600 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100 bg-white">
                                                        <option value="">Nationality</option>
                                                        {COUNTRIES.map(country => <option key={country} value={country}>{country}</option>)}
                                                    </select>
                                                    <div className="relative">
                                                      <input type="date" placeholder="Validity" className="w-full border border-slate-200 rounded-md px-3 py-2.5 text-[12px] font-medium text-slate-600 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100 bg-white" />
                                                    </div>
                                                </div>
                                            </div>

                                            {/* DOCA */}
                                            <div className="flex flex-col gap-4 mt-2">
                                                <h4 className="text-[13px] font-bold text-slate-800">Passenger contact address (DOCA)</h4>
                                                <div className="flex items-center gap-6 mb-1">
                                                    <span className="text-[12px] text-slate-500 font-medium">Types of address:</span>
                                                    <label className="flex items-center gap-2 cursor-pointer group" onClick={() => setDocaType('Destination')}>
                                                        <div className={cn("w-[14px] h-[14px] rounded-full border-2 flex items-center justify-center transition-all", docaType === 'Destination' ? "border-[#D60D26]" : "border-slate-300 group-hover:border-[#D60D26]")}>
                                                            {docaType === 'Destination' && <div className="w-[6px] h-[6px] bg-[#D60D26] rounded-full" />}
                                                        </div>
                                                        <span className="text-[12px] font-bold text-slate-800">Destination</span>
                                                    </label>
                                                    <label className="flex items-center gap-2 cursor-pointer group" onClick={() => setDocaType('Residence')}>
                                                        <div className={cn("w-[14px] h-[14px] rounded-full border-2 flex items-center justify-center transition-all", docaType === 'Residence' ? "border-[#D60D26]" : "border-slate-300 group-hover:border-[#D60D26]")}>
                                                            {docaType === 'Residence' && <div className="w-[6px] h-[6px] bg-[#D60D26] rounded-full" />}
                                                        </div>
                                                        <span className="text-[12px] font-bold text-slate-800">Residence</span>
                                                    </label>
                                                </div>
                                                
                                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                                    <input type="text" placeholder="Address Details" className="col-span-2 border border-slate-200 rounded-md px-3 py-2.5 text-[12px] font-medium outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100 placeholder:text-slate-400 bg-white" />
                                                    <input type="text" placeholder="ZIP / Costal Code" className="col-span-1 border border-slate-200 rounded-md px-3 py-2.5 text-[12px] font-medium outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100 placeholder:text-slate-400 bg-white" />
                                                    <input type="text" placeholder="City" className="col-span-1 border border-slate-200 rounded-md px-3 py-2.5 text-[12px] font-medium outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100 placeholder:text-slate-400 bg-white" />
                                                </div>
                                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                                    <input type="text" placeholder="State" className="col-span-1 border border-slate-200 rounded-md px-3 py-2.5 text-[12px] font-medium outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100 placeholder:text-slate-400 bg-white" />
                                                    <select className="col-span-1 border border-slate-200 rounded-md px-3 py-2.5 text-[12px] font-medium text-slate-600 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100 bg-white">
                                                        <option value="">Country</option>
                                                        {COUNTRIES.map(country => <option key={country} value={country}>{country}</option>)}
                                                    </select>
                                                </div>
                                            </div>

                                            {/* Tab Actions */}
                                            <div className="flex flex-col sm:flex-row items-center gap-3 mt-4">
                                                <Button className="w-full sm:w-auto bg-[#D60D26] hover:bg-[#D60D26] text-white rounded-[100px] px-8 h-[38px] font-bold text-[13px] shadow-sm transition-transform active:scale-95">
                                                    Confirm
                                                </Button>
                                                <Button variant="outline" className="border-slate-300 text-slate-700 hover:bg-slate-50 hover:text-slate-900 rounded-[100px] px-6 h-[38px] font-bold text-[13px] shadow-sm transition-transform active:scale-95">
                                                    Close & Ignore
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                    {activeTab === 'CTC' && (
                                        <div className="py-12 text-center text-slate-400 text-[13px] font-medium italic animate-in fade-in">
                                            Passenger contact data fields will appear here.
                                        </div>
                                    )}
                                    {activeTab === 'FFN' && (
                                        <div className="py-12 text-center text-slate-400 text-[13px] font-medium italic animate-in fade-in">
                                            Frequent flyer number fields will appear here.
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Entry & Health Regulations */}
                        <div className="flex flex-col bg-[#F2FBFF] rounded-b-xl px-6 py-6 border-t border-slate-100">
                            <h3 className="text-slate-800 font-bold text-[14px] mb-4">Entry & health regulations :</h3>
                            <div className="flex flex-wrap items-center gap-4">
                                <input type="text" placeholder="Nationality" className="w-full md:w-[220px] border border-slate-200 rounded-md px-3 py-2 text-[12px] font-medium outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100 placeholder:text-slate-400 bg-white" />
                                <select className="w-full md:w-[220px] border border-slate-200 rounded-md px-3 py-2 text-[12px] font-medium text-slate-600 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100 bg-white">
                                    <option>Language</option>
                                    <option>English</option>
                                </select>
                                <Button variant="outline" className="border-slate-300 text-slate-700 hover:bg-slate-50 hover:text-slate-900 rounded-[100px] px-6 h-[36px] font-bold text-[13px] shadow-sm transition-transform active:scale-95">
                                    Create PDF
                                </Button>
                            </div>
                        </div>

                        {/* Proceed Payment */}
                        <Button 
                            onClick={() => {
                                setActiveStep('payment');
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                            }}
                            className="w-full bg-[#D60D26] hover:bg-[#D60D26] text-white rounded-[100px] py-7 text-[17px] font-bold shadow-lg flex items-center justify-center gap-2 transition-transform active:scale-[0.99] mt-6 mb-16"
                        >
                            Proceed Payment <ArrowUpRight className="w-5 h-5" strokeWidth={3} />
                        </Button>
                    </div>
                  )}
              </div>

              {/* PAYMENT SECTION */}
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm mb-16">
                  {/* Header */}
                  <div 
                    className={cn("px-6 py-3.5 flex items-center justify-between cursor-pointer transition-colors", activeStep === 'payment' ? "bg-[#888]" : "bg-[#0C2342] hover:bg-[#0C2342]")}
                    onClick={() => setActiveStep('payment')}
                  >
                      <h2 className="text-white font-bold text-[15px]">Payment</h2>
                  </div>

                  {/* Body - Payment */}
                  {activeStep === 'payment' && (
                    <div className="flex flex-col animate-in fade-in duration-300">
                        {/* Itinerary details */}
                        <div className="px-6 py-6 flex flex-col border-b border-slate-100">
                            <h3 className="text-slate-800 font-bold text-[14px] mb-5">Itinerary details:</h3>
                            <div className="flex flex-wrap items-center gap-x-8 gap-y-4 mb-4">
                                <div className="flex items-center gap-2 w-[120px]">
                                    <span className="font-black text-[#D60D26] text-[16px] italic tracking-widest drop-shadow-sm">AIR INDIA</span>
                                </div>
                                <span className="text-[13px] font-semibold text-slate-600">AI 2814</span>
                                <span className="text-[13px] font-semibold text-slate-600">Wed, 01 Oct 25</span>
                                <span className="text-[13px] font-bold text-slate-800">DEL &rarr; MUM</span>
                                <span className="text-[13px] font-semibold text-slate-600">E1/Economy</span>
                                <span className="text-[13px] font-bold text-slate-800 tracking-tight">10:00PM - 12:40AM</span>
                                <span className="text-[13px] font-semibold text-slate-600">02:55hr</span>
                                <span className="text-[13px] font-semibold text-slate-600">0/32N</span>
                                <div className="flex items-center gap-2 text-slate-400">
                                    <Plane className="w-4 h-4" strokeWidth={2.5} />
                                </div>
                            </div>
                            <div className="flex items-center gap-3 mt-1 select-none">
                                <span className="bg-[#888] text-white text-[11px] font-[900] px-2.5 py-1 rounded shadow-sm tracking-wider">PUB</span>
                                <span className="border border-slate-300 text-slate-600 bg-white text-[11px] font-[800] px-2.5 py-1 rounded shadow-sm">FEE</span>
                                <span className="bg-[#D60D26] text-white text-[11px] font-[900] px-2.5 py-1 rounded shadow-sm tracking-wider flex items-center gap-1.5">
                                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M20 7H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7V5a3 3 0 00-6 0v2" />
                                    </svg>
                                    25K
                                </span>
                                <span className="border border-slate-300 text-slate-600 bg-white text-[11px] font-[800] px-2.5 py-1 rounded shadow-sm">TKT</span>
                                <span className="text-[11px] font-bold text-slate-600 ml-1 tracking-wide">TKT Ordered 30SEP/25, 09:59pm</span>
                            </div>
                        </div>

                        {/* Form of Payment */}
                        <div className="px-6 py-6 border-b border-slate-100 flex flex-col gap-6">
                            <h3 className="text-slate-800 font-bold text-[14px]">Form of payment:</h3>
                            
                            {/* Radios */}
                            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
                                {(['Card', 'Net Banking', 'Wallet'] as const).map(method => (
                                    <label key={method} className="flex items-center gap-2 cursor-pointer group" onClick={() => setPaymentMethod(method)}>
                                        <div className={cn("w-[14px] h-[14px] rounded-full border-2 flex items-center justify-center transition-all", paymentMethod === method ? "border-[#D60D26]" : "border-slate-300 group-hover:border-[#D60D26]")}>
                                            {paymentMethod === method && <div className="w-[6px] h-[6px] bg-[#D60D26] rounded-full" />}
                                        </div>
                                        <span className="text-[12px] font-bold text-slate-800">{method}</span>
                                    </label>
                                ))}
                            </div>

                            {/* Card Details */}
                            {paymentMethod === 'Card' && (
                                <div className="flex flex-col md:flex-row items-center gap-4 w-full">
                                    <input type="text" placeholder="Card Number" className="w-full md:flex-[1.5] border border-slate-200 rounded-md px-3 py-2.5 text-[12px] font-medium outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100 placeholder:text-slate-400 bg-white" />
                                    <input type="text" placeholder="Month" className="w-full md:flex-[0.8] border border-slate-200 rounded-md px-3 py-2.5 text-[12px] font-medium outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100 placeholder:text-slate-400 bg-white" />
                                    <input type="text" placeholder="Year" className="w-full md:flex-[0.8] border border-slate-200 rounded-md px-3 py-2.5 text-[12px] font-medium outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100 placeholder:text-slate-400 bg-white" />
                                    <input type="text" placeholder="CVV" className="w-full md:flex-[0.8] border border-slate-200 rounded-md px-3 py-2.5 text-[12px] font-medium outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100 placeholder:text-slate-400 bg-white" />
                                    <input type="text" placeholder="Full Name As On Card" className="w-full md:flex-[1.5] border border-slate-200 rounded-md px-3 py-2.5 text-[12px] font-medium outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100 placeholder:text-slate-400 bg-white" />
                                    <Button className="w-full md:w-auto bg-[#D60D26] hover:bg-[#D60D26] text-white rounded-[100px] px-8 h-[38px] font-bold text-[13px] shadow-sm transition-transform active:scale-95 shrink-0">
                                        Save
                                    </Button>
                                </div>
                            )}
                            {paymentMethod !== 'Card' && (
                                <div className="p-4 bg-slate-50 text-slate-500 text-[13px] font-medium rounded-lg text-center italic border border-slate-100">
                                    {paymentMethod} gateway will be opened on next step.
                                </div>
                            )}
                        </div>

                        {/* Price Details */}
                        <div className="flex flex-col border-b border-slate-100">
                            <div className="bg-[#F2FBFF] px-6 py-3 border-b border-slate-100">
                                <h3 className="text-slate-800 font-bold text-[14px]">Price details:</h3>
                            </div>
                            <div className="px-6 py-4 overflow-x-auto no-scrollbar">
                                <table className="w-full text-[13px] min-w-[800px]">
                                    <thead>
                                        <tr className="text-slate-400 font-medium text-left border-b border-slate-100">
                                            <th className="pb-3 pr-4 font-semibold w-1/4">Pax</th>
                                            <th className="pb-3 px-4 font-semibold text-center">Price</th>
                                            <th className="pb-3 px-4 font-semibold text-center">Tax</th>
                                            <th className="pb-3 px-4 font-semibold text-center">Saving</th>
                                            <th className="pb-3 px-4 font-semibold text-center">Ticket fee</th>
                                            <th className="pb-3 px-4 font-semibold text-center">Markup</th>
                                            <th className="pb-3 pl-4 font-bold text-slate-700 text-center">Total p.p</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td className="pt-4 pr-4 font-bold text-slate-800">Harshit_chirgania (04/04/1996)</td>
                                            <td className="pt-4 px-4 font-semibold text-slate-600 text-center">$42.40</td>
                                            <td className="pt-4 px-4 font-semibold text-slate-600 text-center">$0.00</td>
                                            <td className="pt-4 px-4 font-semibold text-slate-600 text-center">$0.00</td>
                                            <td className="pt-4 px-4 font-semibold text-slate-600 text-center">$10.00</td>
                                            <td className="pt-4 px-4 font-semibold text-slate-600 text-center">$0.00</td>
                                            <td className="pt-4 pl-4 font-black text-slate-900 text-center tracking-tight">$52.90</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Invoicing Address */}
                        <div className="flex flex-col border-b border-slate-100 px-6 py-6 gap-5">
                            <h3 className="text-slate-800 font-bold text-[14px]">Invoicing address :</h3>
                            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                                <select className="border border-slate-200 rounded-md px-3 py-2.5 text-[12px] font-medium text-slate-600 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100 bg-white">
                                    <option value="">Nationality</option>
                                    {COUNTRIES.map(country => <option key={country} value={country}>{country}</option>)}
                                </select>
                                <input type="text" placeholder="Last Name" className="border border-slate-200 rounded-md px-3 py-2.5 text-[12px] font-medium outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100 placeholder:text-slate-400 bg-white" />
                                <input type="text" placeholder="First Name" className="border border-slate-200 rounded-md px-3 py-2.5 text-[12px] font-medium outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100 placeholder:text-slate-400 bg-white" />
                                <input type="email" placeholder="Email Address" className="border border-slate-200 rounded-md px-3 py-2.5 text-[12px] font-medium outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100 placeholder:text-slate-400 bg-white" />
                                <input type="text" placeholder="Mobile Number" className="border border-slate-200 rounded-md px-3 py-2.5 text-[12px] font-medium outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100 placeholder:text-slate-400 bg-white" />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <input type="text" placeholder="Address Details" className="col-span-1 md:col-span-1 border border-slate-200 rounded-md px-3 py-2.5 text-[12px] font-medium outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100 placeholder:text-slate-400 bg-white" />
                                <input type="text" placeholder="ZIP / Costal Code" className="col-span-1 border border-slate-200 rounded-md px-3 py-2.5 text-[12px] font-medium outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100 placeholder:text-slate-400 bg-white" />
                                <input type="text" placeholder="City" className="col-span-1 border border-slate-200 rounded-md px-3 py-2.5 text-[12px] font-medium outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100 placeholder:text-slate-400 bg-white" />
                                <select className="border border-slate-200 rounded-md px-3 py-2.5 text-[12px] font-medium text-slate-600 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100 bg-white">
                                    <option value="">Country</option>
                                    {COUNTRIES.map(country => <option key={country} value={country}>{country}</option>)}
                                </select>
                            </div>
                        </div>

                        {/* Additional Information */}
                        <div className="flex flex-col bg-[#F2FBFF] rounded-b-xl px-6 py-6 gap-5">
                            <h3 className="text-slate-800 font-bold text-[14px]">Additional information :</h3>
                            <div className="flex items-center gap-4">
                                <input type="text" placeholder="Booking Staff" className="w-[250px] border border-slate-200 rounded-md px-3 py-2.5 text-[12px] font-medium outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100 placeholder:text-slate-400 bg-white" />
                                <input type="text" placeholder="Internal Transaction Number" className="w-[250px] border border-slate-200 rounded-md px-3 py-2.5 text-[12px] font-medium outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100 placeholder:text-slate-400 bg-white" />
                            </div>
                        </div>

                        {/* Bottom Buttons */}
                        <div className="p-6 pt-0 mt-4 flex flex-col md:flex-row items-center justify-between gap-4 w-full">
                            <Button 
                                onClick={() => router.push('/b2b/booking/XYR9NF')}
                                className="flex-1 bg-[#D60D26] hover:bg-[#D60D26] text-white rounded-[100px] h-[52px] font-bold text-[16px] shadow-lg flex items-center justify-center gap-2 transition-transform active:scale-[0.98]"
                            >
                                Pay And Order <ArrowUpRight className="w-4.5 h-4.5" strokeWidth={3} />
                            </Button>
                            <Button variant="outline" className="flex-1 border-slate-300 hover:border-slate-400 text-slate-800 hover:bg-slate-50 rounded-[100px] h-[52px] font-bold text-[16px] shadow-sm flex items-center justify-center gap-2 transition-transform active:scale-[0.98]">
                                Hold <ArrowUpRight className="w-4.5 h-4.5" strokeWidth={3} />
                            </Button>
                        </div>
                    </div>
                  )}
              </div>
          </div>
      </div>
    </div>
  );
}
