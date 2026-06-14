"use client";

import React, { useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Bell, ChevronDown, CalendarIcon, AlertCircle, User, MessageSquare } from 'lucide-react';
import Link from 'next/link';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useGroupTravel, TravelRequest } from '@/context/GroupTravelContext';
import { NotificationModal } from '@/components/NotificationModal';

function formatDate(dateStr?: string) {
  if (!dateStr) return "";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const pad = (n: number) => n.toString().padStart(2, "0");
    const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    return `${pad(d.getDate())} ${months[d.getMonth()]} ${String(d.getFullYear()).slice(2)} (${pad(d.getHours())}:${pad(d.getMinutes())})`;
  } catch (e) {
    return dateStr;
  }
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "NEW_REQUEST": return "text-blue-600 bg-blue-50 border-blue-100";
    case "FARE_QUOTED": return "text-yellow-600 bg-yellow-50 border-yellow-100";
    case "NEGOTIATION": return "text-amber-600 bg-amber-50 border-amber-100";
    case "ACCEPTED": return "text-purple-600 bg-purple-50 border-purple-100";
    case "PAYMENT_PENDING": return "text-orange-500 bg-orange-50 border-orange-100";
    case "PARTIALLY_PAID": return "text-rose-500 bg-rose-50 border-rose-100";
    case "PAID": return "text-green-600 bg-green-50 border-green-100";
    case "PNR_CREATED": return "text-teal-600 bg-teal-50 border-teal-100";
    case "NAME_SUBMITTED": return "text-cyan-600 bg-cyan-50 border-cyan-100";
    case "TICKETED": return "text-emerald-600 bg-emerald-50 border-emerald-100";
    case "COMPLETED": return "text-slate-600 bg-slate-50 border-slate-100";
    default: return "text-gray-500 bg-gray-50 border-gray-100";
  }
};

const getStatusLabel = (status: string) => {
  switch (status) {
    case "NEW_REQUEST": return "New Request";
    case "FARE_QUOTED": return "Fare Quoted";
    case "NEGOTIATION": return "Under Negotiation";
    case "ACCEPTED": return "Quotation Accepted";
    case "PAYMENT_PENDING": return "Payment Pending";
    case "PARTIALLY_PAID": return "Partially Paid";
    case "PAID": return "Paid";
    case "PNR_CREATED": return "PNR Created";
    case "NAME_SUBMITTED": return "Name Submitted";
    case "TICKETED": return "Ticketed";
    case "COMPLETED": return "Completed";
    default: return status;
  }
};

export default function ViewRequestPage() {
  const [activeTab, setActiveTab] = useState('View Request');
  const { requests, acceptQuote, negotiateRequest, createChangeRequest } = useGroupTravel();
  const [statusFilter, setStatusFilter] = useState('all');

  const [searchGroupName, setSearchGroupName] = useState('');
  const [searchRequestId, setSearchRequestId] = useState('');

  // Filter requests
  const filteredRequests = requests.filter((r) => {
    if (statusFilter !== 'all' && r.status !== statusFilter) return false;
    if (searchGroupName && !r.groupName.toLowerCase().includes(searchGroupName.toLowerCase())) return false;
    if (searchRequestId && !r.requestId.toLowerCase().includes(searchRequestId.toLowerCase())) return false;
    return true;
  });

  const [selectedRequest, setSelectedRequest] = useState<TravelRequest | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);

  // Custom action states for the modal details
  const [negotiationRemarks, setNegotiationRemarks] = useState("");
  const [changeType, setChangeType] = useState<"UPSIZE" | "DOWNSIZE">("UPSIZE");
  const [paxDelta, setPaxDelta] = useState(1);
  const [changeNotes, setChangeNotes] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const handleViewDetails = (req: TravelRequest) => {
    setSelectedRequest(req);
    setNegotiationRemarks("");
    setChangeType("UPSIZE");
    setPaxDelta(1);
    setChangeNotes("");
    setActionMessage(null);
    setIsDetailModalOpen(true);
  };

  const tabs = ['View Request', 'Make Payment', 'Add Passenger', 'View Booking'];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 w-full max-w-[1440px] mx-auto bg-white shadow-sm mt-4 mb-10 overflow-hidden relative pb-20">
        
        {/* Header with gradient background */}
        <div className="bg-gradient-to-r from-[#D60D26] to-[#121121] text-white px-8 py-6 rounded-t-lg">
           <div className="flex justify-between items-center mb-6">
              <div className="text-base font-medium opacity-80 flex items-center gap-2">
                 <span>Group Travel</span>
                 <span>→</span>
                 <span className="opacity-100 font-semibold">New Booking</span>
              </div>
              
              <div className="flex items-center gap-2 text-base cursor-pointer hover:opacity-80 transition-opacity" onClick={() => setNotificationOpen(true)}>
                 <Bell className="w-4 h-4" />
                 <span>Notification(0)</span>
              </div>
           </div>

           {/* Navigation Tabs */}
           <div className="flex gap-8 relative mt-2 overflow-x-auto whitespace-nowrap no-scrollbar">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`relative text-base font-semibold pb-2 transition-all duration-300 ${
                    activeTab === tab 
                      ? "text-white" 
                      : "text-white/60 hover:text-white/80"
                  }`}
                >
                  {tab === 'Make Payment' ? (
                     <Link href="/group-travel/make-payment">{tab}</Link>
                  ) : tab === 'Add Passenger' ? (
                     <Link href="/group-travel/add-passenger">{tab}</Link>
                  ) : tab === 'View Booking' ? (
                     <Link href="/group-travel/view-booking">{tab}</Link>
                  ) : (
                     tab
                  )}
                  {activeTab === tab && (
                     <div className="absolute left-1/2 -translate-x-1/2 bottom-0 w-1.5 h-1.5 bg-white rounded-full"></div>
                  )}
                </button>
              ))}
           </div>
        </div>

        {/* 5-Column Filter Grid */}
        <div className="bg-gray-50 border-b border-gray-100 px-8 py-5">
           <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
              
              {/* Group name */}
              <div className="border-b border-gray-300 pb-1">
                 <input 
                   type="text" 
                   value={searchGroupName}
                   onChange={(e) => setSearchGroupName(e.target.value)}
                   placeholder="Group name" 
                   className="w-full bg-transparent border-none outline-none text-[17px] placeholder:text-gray-500 text-gray-800"
                 />
              </div>

              {/* Request ID */}
              <div className="border-b border-gray-300 pb-1">
                 <input 
                   type="text" 
                   value={searchRequestId}
                   onChange={(e) => setSearchRequestId(e.target.value)}
                   placeholder="Request ID" 
                   className="w-full bg-transparent border-none outline-none text-[17px] placeholder:text-gray-500 text-gray-800"
                 />
              </div>

              {/* Status */}
              <div className="border-b border-gray-300 pb-1 relative">
                 <select 
                   value={statusFilter}
                   onChange={(e) => setStatusFilter(e.target.value)}
                   className="w-full bg-transparent border-none outline-none text-[17px] text-gray-500 appearance-none cursor-pointer pr-6"
                 >
                    <option value="all">Status: All</option>
                    <option value="NEW_REQUEST">New Request</option>
                    <option value="FARE_QUOTED">Fare Quoted</option>
                    <option value="NEGOTIATION">Under Negotiation</option>
                    <option value="ACCEPTED">Quotation Accepted</option>
                    <option value="PAYMENT_PENDING">Payment Pending</option>
                    <option value="PARTIALLY_PAID">Partially Paid</option>
                    <option value="PAID">Paid</option>
                    <option value="PNR_CREATED">PNR Created</option>
                    <option value="NAME_SUBMITTED">Name Submitted</option>
                    <option value="TICKETED">Ticketed</option>
                    <option value="COMPLETED">Completed</option>
                 </select>
                 <ChevronDown className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
              </div>

              {/* Request start date */}
              <div className="border-b border-gray-300 pb-1 relative">
                 <input 
                   type="text" 
                   placeholder="Request start date" 
                   className="w-full bg-transparent border-none outline-none text-[17px] placeholder:text-gray-500 text-gray-800 pr-6"
                   onFocus={(e) => e.target.type = 'date'}
                   onBlur={(e) => e.target.value === '' && (e.target.type = 'text')}
                 />
                 <CalendarIcon className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
              </div>

              {/* Request end date & Actions */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 mt-2 md:mt-0">
                 <div className="border-b border-gray-300 pb-1 relative flex-1">
                    <input 
                      type="text" 
                      placeholder="Request end date" 
                      className="w-full bg-transparent border-none outline-none text-[19px] placeholder:text-gray-500 text-gray-800 pr-6"
                      onFocus={(e) => e.target.type = 'date'}
                      onBlur={(e) => e.target.value === '' && (e.target.type = 'text')}
                    />
                    <CalendarIcon className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                 </div>
                 
                 <div className="flex items-center justify-between sm:justify-start gap-4">
                    <Button 
                      onClick={() => {}}
                      className="bg-[#D60D26] hover:bg-[#D60D26] text-white rounded-full px-6 py-2 h-auto font-bold text-base shadow-sm whitespace-nowrap"
                    >
                      Apply Filters
                    </Button>
                    <button 
                      onClick={() => {
                        setSearchGroupName('');
                        setSearchRequestId('');
                        setStatusFilter('all');
                      }}
                      className="text-[#D60D26] font-bold text-base hover:underline whitespace-nowrap px-2"
                    >
                      Reset
                    </button>
                 </div>
              </div>

           </div>
           
           <div className="mt-4">
              <button className="text-[#D60D26] font-semibold text-base hover:underline">
                 More filters
              </button>
           </div>
        </div>

        {/* Data List Section */}
        <div className="px-8 mt-10">
           <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">Showing {filteredRequests.length}</h2>
              <div className="flex items-center gap-2">
                 <span className="text-gray-500 text-base">Sort by</span>
                 <button className="text-gray-900 font-bold text-base flex items-center gap-1">
                    Recommended <ChevronDown className="w-4 h-4" />
                 </button>
              </div>
           </div>

           {/* 7-Column Data Table Header */}
           <div className="overflow-x-auto w-full no-scrollbar pb-4">
             <div className="min-w-[1000px] xl:min-w-0">
               <div className="grid grid-cols-[1.2fr_2fr_1fr_1.5fr_0.5fr_1.5fr_0.8fr] gap-3 px-6 mb-4 text-sm font-semibold text-gray-400">
                  <div>Group Details</div>
                  <div>Flight details</div>
                  <div>Airline</div>
                  <div>Request details</div>
                  <div>PNR</div>
                  <div>Status</div>
                  <div className="text-right pr-4">Action</div>
               </div>

               <div className="space-y-3">
                 {filteredRequests.length === 0 ? (
                   <div className="text-center py-16 text-gray-400 text-base">
                     No requests found matching your filters.
                   </div>
                 ) : (
                   filteredRequests.map((req, index) => (
                      <div key={req.id || index} className="bg-white border text-left border-gray-100 rounded-xl shadow-[0_2px_10px_rgba(0,0,0,0.04)] grid grid-cols-[1.2fr_2fr_1fr_1.5fr_0.5fr_1.5fr_0.8fr] gap-3 items-center px-6 py-5">
                         
                         {/* Col 1: Group Details */}
                         <div>
                            <div className="text-gray-900 font-bold text-[17px] truncate pr-2">{req.groupName}</div>
                            <div className="text-gray-400 text-[14px] mt-0.5 truncate pr-2">{req.requestId}</div>
                         </div>

                         {/* Col 2: Flight details */}
                         <div className="flex items-center gap-4">
                            {/* Departure */}
                            <div className="flex flex-col items-start min-w-[100px]">
                               <div className="flex items-center gap-1.5 font-bold text-gray-900 text-[14px]">
                                  {req.origin} <span className="text-[#D60D26] text-xs">✈</span> {req.destination}
                               </div>
                               <div className="text-gray-400 text-[12px] mt-0.5 whitespace-nowrap">{req.departureDate}</div>
                            </div>
                            
                            {/* Return */}
                            <div className="flex flex-col items-start min-w-[100px]">
                               <div className="flex items-center gap-1.5 font-bold text-gray-900 text-[14px]">
                                  {req.destination} <span className="text-[#D60D26] text-xs transform rotate-180">✈</span> {req.origin}
                               </div>
                               <div className="text-gray-400 text-[12px] mt-0.5 whitespace-nowrap">{req.returnDate}</div>
                            </div>
                         </div>

                         {/* Col 3: Airline */}
                         <div className="text-[#D60D26] font-bold text-[14px] tracking-wide uppercase truncate pr-2">
                            {req.airline}
                         </div>

                         {/* Col 4: Request details */}
                         <div className="flex flex-col text-[13px]">
                            <span className="text-gray-700 font-medium truncate pr-2">
                               {req.adults + req.children} pax({req.adults}A, {req.children}C)
                            </span>
                            <span className="text-[#D60D26] truncate pr-2">Request Date: {req.requestDate}</span>
                         </div>

                         {/* Col 5: PNR */}
                         <div className="text-gray-500 font-bold text-[15px]">{req.pnrNumber || "—"}</div>

                         {/* Col 6: Status */}
                         <div className="flex flex-col items-start gap-1 pr-2">
                             <span className={`font-bold text-[12px] px-2.5 py-1 rounded-full border ${getStatusColor(req.status)} whitespace-nowrap`}>
                                {getStatusLabel(req.status)}
                             </span>
                             {req.validTill && (
                                <span className="text-[11px] text-slate-500 font-medium whitespace-nowrap">Valid till: {req.validTill}</span>
                             )}
                         </div>
                         
                         {/* Col 7: Action */}
                         <div className="flex justify-end pr-2 border-l border-gray-100 h-full items-center">
                            <button
                              onClick={() => handleViewDetails(req)}
                              className="text-blue-600 hover:text-blue-700 hover:underline text-[14px] font-semibold whitespace-nowrap"
                            >
                              View Details
                            </button>
                         </div>
                      </div>
                   ))
                 )}
               </div>
             </div>
           </div>
           
        </div>

      </main>

      {/* ---- Interactive Request Detail Modal ---- */}
      <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
        <DialogContent className="sm:max-w-2xl rounded-[16px] p-0 border-0 overflow-y-auto max-h-[90vh] no-scrollbar outline-none" showCloseButton={true}>
          <DialogHeader className="px-6 pt-5 pb-3 border-b border-gray-100">
            <DialogTitle className="text-[18px] font-bold text-gray-900">
              Group Travel Request details
              {selectedRequest && (
                <span className="ml-2 text-gray-400 font-normal text-[15px]">— {selectedRequest.requestId}</span>
              )}
            </DialogTitle>
          </DialogHeader>

          {selectedRequest && (
            <div className="flex flex-col gap-6 p-6">
              {/* Stepper Progress Bar */}
              <div className="border-b border-gray-100 pb-6">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-sm font-bold text-gray-400 uppercase tracking-wider">Booking Progress</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(selectedRequest.status)}`}>
                    {getStatusLabel(selectedRequest.status)}
                  </span>
                </div>
                <div className="flex items-center w-full">
                  {(() => {
                    const statusOrder = [
                      ["NEW_REQUEST"],
                      ["FARE_QUOTED", "NEGOTIATION"],
                      ["ACCEPTED", "PAYMENT_PENDING", "PARTIALLY_PAID"],
                      ["PAID", "PNR_CREATED", "NAME_SUBMITTED"],
                      ["TICKETED", "COMPLETED"]
                    ];
                    const currentStepIndex = statusOrder.findIndex(group => group.includes(selectedRequest.status));
                    const steps = ["Requested", "Quoted", "Payment Pending", "Manifest Upload", "Ticketed"];
                    return steps.map((step, idx) => {
                      const isCompleted = idx < currentStepIndex;
                      const isActive = idx === currentStepIndex;
                      return (
                        <React.Fragment key={step}>
                          <div className="flex flex-col items-center flex-1 relative">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${
                              isCompleted ? "bg-green-500 border-green-500 text-white animate-pulse" :
                              isActive ? "bg-white border-[#D60D26] text-[#D60D26]" :
                              "bg-white border-gray-200 text-gray-400"
                            }`}>
                              {isCompleted ? "✓" : idx + 1}
                            </div>
                            <span className={`text-[11px] font-bold mt-1 whitespace-nowrap ${
                              isActive ? "text-[#D60D26]" : isCompleted ? "text-green-600" : "text-gray-400"
                            }`}>{step}</span>
                          </div>
                          {idx < steps.length - 1 && (
                            <div className={`h-0.5 flex-1 -mt-5 transition-all ${
                              idx < currentStepIndex ? "bg-green-500" : "bg-gray-200"
                            }`} />
                          )}
                        </React.Fragment>
                      );
                    });
                  })()}
                </div>
              </div>

              {/* Flight Route & Travel Details */}
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-gray-400 block font-medium">Route</span>
                  <span className="font-bold text-gray-800">{selectedRequest.origin} ✈ {selectedRequest.destination}</span>
                </div>
                <div>
                  <span className="text-gray-400 block font-medium">Dates</span>
                  <span className="font-bold text-gray-800 text-xs">{selectedRequest.departureDate} - {selectedRequest.returnDate}</span>
                </div>
                <div>
                  <span className="text-gray-400 block font-medium">Passengers</span>
                  <span className="font-bold text-gray-800">
                    {selectedRequest.adults + selectedRequest.children} Pax ({selectedRequest.adults}A, {selectedRequest.children}C)
                  </span>
                </div>
                <div>
                  <span className="text-gray-400 block font-medium">Cabin & Category</span>
                  <span className="font-bold text-gray-800 capitalize">{selectedRequest.cabin} / {selectedRequest.groupCategory || 'Group'}</span>
                </div>
              </div>

              {/* Message / Status display */}
              {actionMessage && (
                <div className="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded-lg text-sm font-semibold">
                  {actionMessage}
                </div>
              )}

              {/* Render action card based on Status */}
              {selectedRequest.status === "NEW_REQUEST" && (
                <div className="border border-blue-100 bg-blue-50/50 rounded-xl p-5 text-center">
                  <p className="text-sm font-semibold text-blue-800">
                    Your request is submitted and our operators are preparing the custom flight quotes.
                  </p>
                  <p className="text-xs text-blue-600 mt-1">Response time is usually 24-48 hours. We will notify you once quotes are ready.</p>
                </div>
              )}

              {(selectedRequest.status === "FARE_QUOTED" || selectedRequest.status === "NEGOTIATION") && (
                <div className="space-y-6">
                  <h4 className="font-bold text-gray-800 text-base flex items-center gap-1.5">
                    <User className="w-4 h-4 text-[#D60D26]" /> Flight Quote Options Suggested
                  </h4>
                  {selectedRequest.quotes && selectedRequest.quotes.length > 0 ? (
                    <div className="space-y-4">
                      {selectedRequest.quotes.map((quote) => (
                        <div key={quote.id || quote.quote_option_id} className={`border rounded-xl p-4 transition-all shadow-sm ${
                          quote.is_selected ? "border-green-500 bg-green-50/30" : "border-gray-200 bg-white"
                        }`}>
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <span className="text-xs font-bold text-[#D60D26] italic block uppercase">{quote.airline}</span>
                              <span className="text-sm font-bold text-gray-800">{quote.flight_number}</span>
                            </div>
                            <div className="text-right">
                              <span className="text-base font-extrabold text-gray-800 block">₹{parseFloat(quote.fare_per_pax).toLocaleString('en-IN')} / pax</span>
                              <span className="text-xs text-gray-400 font-bold block">Deposit: ₹{parseFloat(quote.deposit_per_pax).toLocaleString('en-IN')} / pax</span>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4 text-xs mt-3 border-t border-slate-50 pt-3 text-gray-500">
                            <div>
                              <span className="block font-medium">Timings</span>
                              <span className="font-bold text-gray-700">{quote.departure_time} - {quote.arrival_time}</span>
                            </div>
                            <div>
                              <span className="block font-medium">Deadlines</span>
                              <span className="font-bold text-gray-700 text-[10px]">Payment: {formatDate(quote.payment_deadline)}</span>
                            </div>
                          </div>
                          <div className="flex justify-end mt-4 border-t border-slate-50 pt-3">
                            {quote.is_selected ? (
                              <span className="bg-green-100 text-green-700 px-4 py-1.5 rounded-full font-bold text-xs">✓ Quote Selected</span>
                            ) : (
                              <Button
                                size="sm"
                                onClick={async () => {
                                  setActionLoading(true);
                                  setActionMessage(null);
                                  const ok = await acceptQuote(selectedRequest.requestId, quote.quote_option_id || quote.id);
                                  setActionLoading(false);
                                  if (ok) {
                                    setActionMessage("Quote accepted successfully!");
                                    const updated = requests.find(r => r.requestId === selectedRequest.requestId);
                                    if (updated) setSelectedRequest(updated);
                                  } else {
                                    setActionMessage("Failed to accept quote. Please try again.");
                                  }
                                }}
                                disabled={actionLoading}
                                className="bg-green-600 hover:bg-green-700 text-white rounded-full font-bold px-6 py-2 text-xs shadow-sm h-auto"
                              >
                                Accept Quote
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 italic">No quotes have been uploaded yet. Please check back soon.</p>
                  )}

                  {/* Negotiation Input Form */}
                  <div className="border-t border-slate-100 pt-6 space-y-3">
                    <h5 className="font-bold text-gray-800 text-sm flex items-center gap-1">
                      <MessageSquare className="w-4 h-4 text-amber-500" /> Need a different price or route adjustment?
                    </h5>
                    <textarea
                      value={negotiationRemarks}
                      onChange={(e) => setNegotiationRemarks(e.target.value)}
                      placeholder="Provide custom negotiation remarks (e.g. target fare, timing preference details)"
                      className="w-full border border-gray-200 rounded-lg p-3 text-sm h-20 outline-none focus:border-[#D60D26] resize-none bg-slate-50"
                    />
                    <div className="flex justify-end">
                      <Button
                        onClick={async () => {
                          if (!negotiationRemarks.trim()) return;
                          setActionLoading(true);
                          setActionMessage(null);
                          const ok = await negotiateRequest(selectedRequest.requestId, negotiationRemarks);
                          setActionLoading(false);
                          if (ok) {
                            setActionMessage("Negotiation remarks sent successfully!");
                            setNegotiationRemarks("");
                            const updated = requests.find(r => r.requestId === selectedRequest.requestId);
                            if (updated) setSelectedRequest(updated);
                          } else {
                            setActionMessage("Failed to submit negotiation. Please try again.");
                          }
                        }}
                        disabled={actionLoading || !negotiationRemarks.trim()}
                        className="bg-gray-800 hover:bg-gray-900 text-white rounded-full font-bold px-6 py-2 text-xs shadow-sm h-auto"
                      >
                        Submit Negotiation Request
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {selectedRequest.status === "ACCEPTED" && (
                <div className="border border-green-100 bg-green-50/50 rounded-xl p-5 text-center">
                  <p className="text-sm font-semibold text-green-800">
                    You have accepted the quote option. Waiting for payment details setup from the operator.
                  </p>
                  <p className="text-xs text-green-600 mt-1">Once payment deadlines are locked in, this booking will be ready for payment.</p>
                </div>
              )}

              {/* Quick Redirects to actions */}
              {(selectedRequest.status === "PAYMENT_PENDING" || selectedRequest.status === "PARTIALLY_PAID") && (
                <div className="border border-orange-100 bg-orange-50/40 rounded-xl p-4 flex flex-col sm:flex-row justify-between items-center gap-3">
                  <div>
                    <span className="text-sm font-bold text-gray-800 block">Payment Due</span>
                    <span className="text-xs text-gray-500">Paid: ₹{parseFloat(selectedRequest.totalPaid).toLocaleString('en-IN')}</span>
                  </div>
                  <Link href={`/group-travel/make-payment?requestId=${selectedRequest.requestId}`} passHref>
                    <Button className="bg-[#D60D26] hover:bg-[#D60D26] text-white rounded-full font-bold px-6 py-2 h-auto text-xs shadow-sm">
                      Proceed to Payment
                    </Button>
                  </Link>
                </div>
              )}

              {(selectedRequest.status === "PAID" || selectedRequest.status === "PNR_CREATED") && (
                <div className="border border-green-100 bg-green-50/40 rounded-xl p-4 flex flex-col sm:flex-row justify-between items-center gap-3">
                  <div>
                    <span className="text-sm font-bold text-gray-800 block">Passenger Manifest Needed</span>
                    <span className="text-xs text-gray-500">Please provide traveler details to issue tickets.</span>
                  </div>
                  <Link href={`/group-travel/add-passenger?requestId=${selectedRequest.requestId}`} passHref>
                    <Button className="bg-green-600 hover:bg-green-700 text-white rounded-full font-bold px-6 py-2 h-auto text-xs shadow-sm">
                      Provide Passenger Manifest
                    </Button>
                  </Link>
                </div>
              )}

              {selectedRequest.status === "NAME_SUBMITTED" && (
                <div className="border border-cyan-100 bg-cyan-50/50 rounded-xl p-5 text-center">
                  <p className="text-sm font-semibold text-cyan-800">
                    Passenger names submitted successfully. Waiting for the operator to issue tickets.
                  </p>
                </div>
              )}

              {(selectedRequest.status === "TICKETED" || selectedRequest.status === "COMPLETED") && (
                <div className="border border-emerald-100 bg-emerald-50/50 rounded-xl p-5 text-center">
                  <p className="text-sm font-semibold text-emerald-800">
                    Booking Completed & Tickets Issued!
                  </p>
                  {selectedRequest.pnrNumber && (
                    <p className="text-sm font-bold text-slate-800 mt-2">PNR Number: {selectedRequest.pnrNumber}</p>
                  )}
                </div>
              )}

              {/* Post-quote Change Traveler Size Request Drawer/Modal Section */}
              {(() => {
                const isPostQuote = ![
                  "NEW_REQUEST",
                  "FARE_QUOTED",
                  "NEGOTIATION"
                ].includes(selectedRequest.status);

                if (!isPostQuote) return null;

                return (
                  <div className="border-t border-slate-100 pt-6 space-y-4">
                    <h4 className="font-bold text-gray-800 text-base">Traveler Count Change Request</h4>
                    
                    {/* Submit Change Request Form */}
                    <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs text-gray-400 font-bold block mb-1">Change Type</label>
                          <select
                            value={changeType}
                            onChange={(e) => setChangeType(e.target.value as "UPSIZE" | "DOWNSIZE")}
                            className="w-full border border-gray-200 rounded-lg p-2 text-xs outline-none bg-white font-semibold"
                          >
                            <option value="UPSIZE">Add Travelers (+)</option>
                            <option value="DOWNSIZE">Remove Travelers (-)</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-xs text-gray-400 font-bold block mb-1">Traveler Count Delta</label>
                          <input
                            type="number"
                            min="1"
                            value={paxDelta}
                            onChange={(e) => setPaxDelta(Math.max(1, parseInt(e.target.value) || 1))}
                            className="w-full border border-gray-200 rounded-lg p-2 text-xs outline-none bg-white font-semibold"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="text-xs text-gray-400 font-bold block mb-1">Agent Notes</label>
                        <textarea
                          value={changeNotes}
                          onChange={(e) => setChangeNotes(e.target.value)}
                          placeholder="Details of the change request (e.g. why the traveler count is changing)"
                          className="w-full border border-gray-200 rounded-lg p-2 text-xs outline-none bg-white h-16 resize-none"
                        />
                      </div>
                      <div className="flex justify-end">
                        <Button
                          onClick={async () => {
                            setActionLoading(true);
                            setActionMessage(null);
                            const ok = await createChangeRequest(selectedRequest.requestId, changeType, paxDelta, changeNotes);
                            setActionLoading(false);
                            if (ok) {
                              setActionMessage("Change request submitted successfully!");
                              setChangeNotes("");
                              setPaxDelta(1);
                              const updated = requests.find(r => r.requestId === selectedRequest.requestId);
                              if (updated) setSelectedRequest(updated);
                            } else {
                              setActionMessage("Failed to submit change request. Please try again.");
                            }
                          }}
                          disabled={actionLoading}
                          className="bg-[#D60D26] hover:bg-[#D60D26] text-white rounded-full font-bold px-6 py-2 text-xs h-auto shadow-sm"
                        >
                          Submit Change Request
                        </Button>
                      </div>
                    </div>

                    {/* Change Requests List */}
                    {selectedRequest.changeRequests && selectedRequest.changeRequests.length > 0 && (
                      <div className="space-y-2.5">
                        <h5 className="font-bold text-gray-700 text-xs uppercase tracking-wider">Change Requests Log</h5>
                        <div className="space-y-2">
                          {selectedRequest.changeRequests.map((cr) => (
                            <div key={cr.id || cr.change_request_id} className="border border-slate-100 bg-white rounded-xl p-3 text-xs shadow-sm flex flex-col gap-1.5">
                              <div className="flex justify-between items-center">
                                <span className={`font-bold uppercase ${cr.change_type === "UPSIZE" ? "text-green-600" : "text-red-500"}`}>
                                  {cr.change_type === "UPSIZE" ? "Upsize (+)" : "Downsize (-)"} {cr.pax_delta} pax
                                </span>
                                <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                                  cr.status === "APPROVED" ? "bg-green-100 text-green-700" :
                                  cr.status === "REJECTED" ? "bg-red-100 text-red-700" :
                                  "bg-yellow-100 text-yellow-700"
                                }`}>
                                  {cr.status}
                                </span>
                              </div>
                              {cr.agent_notes && <p className="text-gray-500"><strong className="text-gray-700">Notes:</strong> {cr.agent_notes}</p>}
                              {cr.admin_remarks && <p className="text-gray-500"><strong className="text-gray-700">Remarks:</strong> {cr.admin_remarks}</p>}
                              {cr.adjusted_fare_per_pax && (
                                <p className="text-green-600 font-semibold">Adjusted Price per traveler: ₹{parseFloat(cr.adjusted_fare_per_pax).toLocaleString('en-IN')}</p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Footer />
      <NotificationModal isOpen={notificationOpen} onClose={() => setNotificationOpen(false)} />
    </div>
  );
}
