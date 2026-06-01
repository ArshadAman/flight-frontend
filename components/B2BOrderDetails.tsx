"use client";

import React, { useState } from "react";
import { ArrowUpRight, Plane, Bell, Download, Share2, Printer, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { COUNTRIES } from "@/lib/data/countries";
import { NotificationModal } from "./NotificationModal";

export function B2BOrderDetails() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'APIS' | 'CTC' | 'FFN'>('APIS');
  const [docaType, setDocaType] = useState<'Destination' | 'Residence'>('Destination');
  const [notificationOpen, setNotificationOpen] = useState(false);

  return (
    <div className="w-full flex flex-col min-h-screen bg-[#FFFFFF]">
      {/* Sub Navigation Bar */}
      <div className="flex w-full min-h-[50px] select-none text-[12px] font-bold">
        <div className="flex-[3] bg-[#D60D26] text-white flex flex-wrap items-center gap-6 px-10 py-2">
            <div className="relative flex items-center cursor-pointer opacity-100 h-full">
                All booking (7)
                <div className="absolute -bottom-[2px] left-1/2 -translate-x-1/2 w-[4px] h-[4px] bg-white rounded-full" />
            </div>
            <div className="cursor-pointer opacity-80 hover:opacity-100 transition-opacity">Open booking (1)</div>
            <div className="cursor-pointer opacity-80 hover:opacity-100 transition-opacity">Re-booking</div>
            <div className="cursor-pointer opacity-80 hover:opacity-100 transition-opacity">Refund</div>
            <div className="cursor-pointer opacity-80 hover:opacity-100 transition-opacity">Import PNR</div>
            <div className="cursor-pointer opacity-80 hover:opacity-100 transition-opacity">Ticket Download</div>
            <div className="cursor-pointer opacity-80 hover:opacity-100 transition-opacity">Ticket Print/shares</div>
        </div>
        <div className="flex-1 bg-[#121121] text-white flex items-center justify-end px-10">
            <div 
              className="flex items-center gap-2 cursor-pointer opacity-90 hover:opacity-100 transition-opacity"
              onClick={() => setNotificationOpen(true)}
            >
                <Bell className="w-4 h-4" />
                <span>Notification(0)</span>
            </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="w-full max-w-[1280px] mx-auto py-8 px-4 flex flex-col">

          {/* Top Header Card */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm mb-6 flex flex-col">
              <div className="bg-[#0C2342] px-6 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3 text-white">
                      <Plane className="w-5 h-5 rotate-45" strokeWidth={2.5} />
                      <h2 className="font-bold text-[16px] tracking-wide">XYR9NF (Ordered)</h2>
                  </div>
                  <Button variant="outline" className="border-white/20 bg-transparent text-white hover:bg-white/10 hover:text-white h-[32px] px-4 text-[12px] font-bold rounded-lg flex items-center gap-2">
                      <Download className="w-3.5 h-3.5" /> Download
                  </Button>
              </div>

              <div className="bg-[#F2FBFF] px-6 py-5 grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Col 1 */}
                  <div className="flex flex-col gap-3">
                      <div className="flex items-start">
                          <span className="w-[110px] text-slate-500 text-[12px] font-bold">PNR:</span>
                          <span className="text-slate-800 text-[13px] font-[900]">XYR9NF - Ordered</span>
                      </div>
                      <div className="flex items-start">
                          <span className="w-[110px] text-slate-500 text-[12px] font-bold">GDS PNR:</span>
                          <span className="text-slate-800 text-[13px] font-[900]">XYR9NF</span>
                      </div>
                      <div className="flex items-start">
                          <span className="w-[110px] text-slate-500 text-[12px] font-bold">Travel period:</span>
                          <span className="text-slate-800 text-[13px] font-[900]">20OCT/25 - 26NOV/25</span>
                      </div>
                  </div>

                  {/* Col 2 */}
                  <div className="flex flex-col gap-3">
                      <div className="flex items-start">
                          <span className="w-[100px] text-slate-500 text-[12px] font-bold">Booking date:</span>
                          <span className="text-slate-800 text-[13px] font-[900]">15SEP/25</span>
                      </div>
                      <div className="flex items-start">
                          <span className="w-[100px] text-slate-500 text-[12px] font-bold">Booked by:</span>
                          <span className="text-slate-800 text-[13px] font-[900]">Booking staff</span>
                      </div>
                      <div className="flex items-start">
                          <span className="w-[100px] text-slate-500 text-[12px] font-bold">Last edit by:</span>
                          <div className="flex flex-col">
                            <span className="text-slate-800 text-[13px] font-[900]">Booking staff</span>
                            <span className="text-slate-500 text-[11px] font-semibold mt-0.5">20OCT/25, 05:20am</span>
                          </div>
                      </div>
                  </div>

                  {/* Col 3 */}
                  <div className="flex flex-col items-end gap-5">
                      <div className="flex items-center gap-2">
                          <Button variant="outline" className="h-[28px] px-3 text-[11px] font-bold border-slate-300 text-slate-700">PNR History</Button>
                          <Button variant="outline" className="h-[28px] px-3 text-[11px] font-bold border-slate-300 text-slate-700">E - Ticket</Button>
                          <Button variant="outline" className="h-[28px] px-3 text-[11px] font-bold border-slate-300 text-[#D60D26] flex items-center gap-1.5 hover:text-[#D60D26] hover:bg-red-50">
                              <Share2 className="w-3 h-3" /> Share
                          </Button>
                          <Button variant="outline" className="h-[28px] px-3 text-[11px] font-bold border-slate-300 text-[#D60D26] flex items-center gap-1.5 hover:text-[#D60D26] hover:bg-red-50">
                              <Printer className="w-3 h-3" /> Print
                          </Button>
                      </div>
                      <div className="text-[#D60D26] font-black text-[32px] tracking-tight leading-none mt-1">
                          INR 123.89
                      </div>
                  </div>
              </div>
          </div>

          {/* Passenger Details */}
          <div className="bg-[#F2FBFF]/30 rounded-xl border border-[#F2FBFF] flex flex-col mb-6">
              <div className="px-6 py-4 border-b border-[#F2FBFF] bg-[#F2FBFF]/60 rounded-t-xl">
                  <h3 className="text-slate-800 font-bold text-[14px]">Passengers details:</h3>
              </div>
              <div className="p-6 pb-2">
                  <label className="flex items-center gap-2.5 cursor-pointer group w-fit mb-6">
                      <div className="w-4 h-4 rounded-full border-2 border-[#D60D26] flex items-center justify-center">
                          <div className="w-2 h-2 bg-[#D60D26] rounded-full" />
                      </div>
                      <span className="text-[13px] font-[900] text-slate-800 uppercase tracking-wide">CHIRGANIA / HARSHIT MR.</span>
                  </label>

                  {/* Tabs */}
                  <div className="flex items-center gap-1 mb-0 border-b border-slate-100">
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
                  <div className="py-6">
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
                                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
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
                                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                      <input type="text" placeholder="State" className="col-span-1 border border-slate-200 rounded-md px-3 py-2.5 text-[12px] font-medium outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100 placeholder:text-slate-400 bg-white" />
                                      <select className="col-span-1 border border-slate-200 rounded-md px-3 py-2.5 text-[12px] font-medium text-slate-600 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100 bg-white">
                                          <option value="">Country</option>
                                          {COUNTRIES.map(country => <option key={country} value={country}>{country}</option>)}
                                      </select>
                                  </div>
                              </div>

                              {/* Tab Actions */}
                              <div className="flex items-center gap-3 mt-2">
                                  <Button className="bg-[#D60D26] hover:bg-[#D60D26] text-white rounded-[100px] px-8 h-[38px] font-bold text-[13px] shadow-sm transition-transform active:scale-95">
                                      Confirm
                                  </Button>
                                  <Button variant="outline" className="border-slate-300 text-slate-700 hover:bg-slate-50 hover:text-slate-900 rounded-[100px] px-6 h-[38px] font-bold text-[13px] shadow-sm transition-transform active:scale-95">
                                      Close & ignore
                                  </Button>
                              </div>
                          </div>
                      )}
                      {activeTab === 'CTC' && (
                          <div className="py-6 text-slate-400 text-[13px] font-medium italic animate-in fade-in">
                              Passenger contact data fields will appear here.
                          </div>
                      )}
                      {activeTab === 'FFN' && (
                          <div className="py-6 text-slate-400 text-[13px] font-medium italic animate-in fade-in">
                              Frequent flyer number fields will appear here.
                          </div>
                      )}
                  </div>
              </div>
          </div>

          {/* Itinerary details */}
          <div className="bg-white rounded-xl border border-slate-200 flex flex-col mb-6 shadow-sm overflow-hidden">
              <div className="bg-[#F2FBFF]/50 px-6 py-4 border-b border-slate-100">
                  <h3 className="text-slate-800 font-bold text-[14px]">Itinerary details:</h3>
              </div>
              <div className="px-6 py-6">
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
          </div>

          {/* Price details : (Transportation only) */}
          <div className="bg-white rounded-xl border border-slate-200 flex flex-col mb-6 shadow-sm overflow-hidden">
              <div className="bg-[#F2FBFF]/50 px-6 py-4 border-b border-slate-100">
                  <h3 className="text-slate-800 font-bold text-[14px]">Price details : (Transportation only)</h3>
              </div>
              <div className="px-6 py-5 overflow-x-auto">
                  <table className="w-full text-[13px]">
                      <thead>
                          <tr className="text-slate-400 font-medium text-left border-b border-slate-100">
                              <th className="pb-3 pr-4 font-semibold w-12">No.</th>
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
                              <td className="pt-4 pr-4 font-bold text-slate-800">1</td>
                              <td className="pt-4 pr-4 font-bold text-slate-800 tracking-wide uppercase">CHIRGANIA / HARSHIT MR.</td>
                              <td className="pt-4 px-4 font-semibold text-slate-600 text-center">INR 42.40</td>
                              <td className="pt-4 px-4 font-semibold text-slate-600 text-center">INR 0.00</td>
                              <td className="pt-4 px-4 font-semibold text-slate-600 text-center">INR 0.00</td>
                              <td className="pt-4 px-4 font-semibold text-slate-600 text-center">INR 10.00</td>
                              <td className="pt-4 px-4 font-semibold text-slate-600 text-center">INR 0.00</td>
                              <td className="pt-4 pl-4 font-black text-slate-900 text-center tracking-tight">INR 52.90</td>
                          </tr>
                      </tbody>
                  </table>
              </div>
          </div>

          {/* Entry & health regulations */}
          <div className="bg-white rounded-xl border border-slate-200 flex flex-col mb-6 shadow-sm overflow-hidden">
              <div className="bg-[#F2FBFF]/50 px-6 py-4 border-b border-slate-100">
                  <h3 className="text-slate-800 font-bold text-[14px]">Entry & health regulations :</h3>
              </div>
              <div className="px-6 py-5 flex flex-wrap items-center gap-4">
                  <select className="w-full md:w-[220px] border border-slate-200 rounded-md px-3 py-2 text-[12px] font-medium text-slate-600 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100 bg-white">
                      <option value="">Nationality</option>
                      {COUNTRIES.map(country => <option key={country} value={country}>{country}</option>)}
                  </select>
                  <select className="w-full md:w-[220px] border border-slate-200 rounded-md px-3 py-2 text-[12px] font-medium text-slate-600 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100 bg-white">
                      <option>Language</option>
                      <option>English</option>
                  </select>
                  <Button variant="outline" className="border-slate-300 text-slate-700 hover:bg-slate-50 hover:text-slate-900 rounded-[100px] px-6 h-[36px] font-bold text-[13px] shadow-sm transition-transform active:scale-95">
                      Create PDF
                  </Button>
              </div>
          </div>

          {/* Additional services block */}
          <div className="bg-[#0C2342] px-6 py-3.5 rounded-xl shadow-sm mb-6 flex items-center">
              <h2 className="text-white font-bold text-[15px]">Additional services</h2>
          </div>

          {/* Payment details block */}
          <div className="bg-white rounded-xl border border-slate-200 flex flex-col mb-6 shadow-sm overflow-hidden">
              <div className="bg-[#888] px-6 py-3.5">
                  <h2 className="text-white font-bold text-[15px]">Payment details</h2>
              </div>
              
              <div className="p-6 pb-2 border-b border-slate-100">
                  <div className="flex items-center justify-between mb-6">
                      <span className="text-[14px] font-[900] text-slate-800">Flight</span>
                      <div className="flex items-center gap-8">
                          <div className="flex items-center gap-2">
                              <CheckCircle2 className="w-4 h-4 text-green-500 fill-green-100" />
                              <span className="text-[13px] font-bold text-slate-800">Bank transfer [in progress]</span>
                          </div>
                          <span className="text-[15px] font-[900] text-slate-900">INR 123.89</span>
                      </div>
                  </div>
                  
                  <div className="flex items-center gap-2 mb-6">
                      <span className="text-[13px] font-bold text-slate-800">Selected form of payment :</span>
                      <span className="text-[13px] font-medium text-slate-600">Cash payment</span>
                  </div>
              </div>

              <div className="flex flex-col">
                  <div className="px-6 py-4 border-b border-slate-100">
                      <h3 className="text-slate-800 font-bold text-[14px]">Price details :</h3>
                  </div>
                  <div className="px-6 py-5 overflow-x-auto">
                      <table className="w-full text-[13px]">
                          <thead>
                              <tr className="text-slate-400 font-medium text-left border-b border-slate-100">
                                  <th className="pb-3 pr-4 font-semibold w-12">No.</th>
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
                                  <td className="pt-4 pr-4 font-bold text-slate-800">1</td>
                                  <td className="pt-4 pr-4 font-bold text-slate-800 tracking-wide uppercase">CHIRGANIA / HARSHIT MR.</td>
                                  <td className="pt-4 px-4 font-semibold text-slate-600 text-center">INR 42.40</td>
                                  <td className="pt-4 px-4 font-semibold text-slate-600 text-center">INR 0.00</td>
                                  <td className="pt-4 px-4 font-semibold text-slate-600 text-center">INR 0.00</td>
                                  <td className="pt-4 px-4 font-semibold text-slate-600 text-center">INR 10.00</td>
                                  <td className="pt-4 px-4 font-semibold text-slate-600 text-center">INR 0.00</td>
                                  <td className="pt-4 pl-4 font-black text-slate-900 text-center tracking-tight">INR 52.90</td>
                              </tr>
                          </tbody>
                      </table>
                  </div>
              </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-4 mt-2 mb-16">
              <Button className="bg-[#D60D26] hover:bg-[#D60D26] text-white rounded-[100px] h-[46px] px-10 font-bold text-[14px] shadow-sm flex items-center gap-2 transition-transform active:scale-95">
                  Flight Ticket Order <ArrowUpRight className="w-4 h-4" strokeWidth={3} />
              </Button>
              <Button variant="outline" className="border-slate-300 hover:border-slate-400 text-slate-800 hover:bg-slate-50 rounded-[100px] h-[46px] px-8 font-bold text-[13px] shadow-sm transition-transform active:scale-95">
                  Cancel Booking
              </Button>
              <Button variant="outline" className="border-slate-300 hover:border-slate-400 text-slate-800 hover:bg-slate-50 rounded-[100px] h-[46px] px-8 font-bold text-[13px] shadow-sm transition-transform active:scale-95">
                  Rebook
              </Button>
              <Button variant="outline" className="border-slate-300 hover:border-slate-400 text-slate-800 hover:bg-slate-50 rounded-[100px] h-[46px] px-8 font-bold text-[13px] shadow-sm transition-transform active:scale-95">
                  Add PNR
              </Button>
              <Button variant="outline" className="border-slate-300 hover:border-slate-400 text-slate-800 hover:bg-slate-50 rounded-[100px] h-[46px] px-8 font-bold text-[13px] shadow-sm transition-transform active:scale-95">
                  Split PNR
              </Button>
              <Button variant="outline" className="border-slate-300 hover:border-slate-400 text-slate-800 hover:bg-slate-50 rounded-[100px] h-[46px] px-8 font-bold text-[13px] shadow-sm transition-transform active:scale-95">
                  Rules
              </Button>
          </div>

      </div>
      
      <NotificationModal isOpen={notificationOpen} onClose={() => setNotificationOpen(false)} />
    </div>
  );
}
