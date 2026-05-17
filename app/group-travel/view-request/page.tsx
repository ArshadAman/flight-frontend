"use client";

import React, { useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Bell, ChevronDown, CalendarIcon, AlertCircle, Minus, Plus, User } from 'lucide-react';
import Link from 'next/link';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useGroupTravel, TravelRequest } from '@/context/GroupTravelContext';

const getStatusColor = (status: string) => {
  if (status === "New Request" || status === "Quotation Accepted") {
    return "text-green-600";
  }
  if (status === "Fare Quoted" || status === "Under Negotiation" || status === "Payment pending") {
    return "text-orange-500";
  }
  return "text-gray-500";
};

export default function ViewRequestPage() {
  const [activeTab, setActiveTab] = useState('View Request');
  const { requests, updateRequest } = useGroupTravel();
  const [statusFilter, setStatusFilter] = useState('all');

  // --- Task 1: Filter requests based on dropdown ---
  const filteredRequests = statusFilter === 'all'
    ? requests
    : requests.filter((r) => r.status === statusFilter);

  // --- Task 2 & 3: Modal state ---
  const [selectedRequest, setSelectedRequest] = useState<TravelRequest | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Modal form state
  const [modalAdults, setModalAdults] = useState(1);
  const [modalChildren, setModalChildren] = useState(0);
  const [modalInfants, setModalInfants] = useState(0);
  const [modalExpectedFare, setModalExpectedFare] = useState('');
  const [modalTotalFare, setModalTotalFare] = useState('');

  const totalModalPassengers = modalAdults + modalChildren;

  const handleViewDetails = (req: TravelRequest) => {
    if (req.status === "Payment pending" || req.status === "New Request") {
      setSelectedRequest(req);
      // Pre-fill from the ticket's data
      setModalAdults(req.adults || 1);
      setModalChildren(req.children || 0);
      setModalInfants(req.infants || 0);
      setModalExpectedFare(req.expectedFare || '');
      setModalTotalFare('');
      setIsDetailModalOpen(true);
    } else {
      console.log(`View Details clicked for ticket: ${req.requestId} (status: ${req.status})`);
    }
  };

  const handleModalDone = () => {
    if (selectedRequest) {
      updateRequest(selectedRequest.requestId, {
        status: "Payment pending",
        expectedFare: modalExpectedFare,
        adults: modalAdults,
        children: modalChildren,
        infants: modalInfants
      });
      setIsDetailModalOpen(false);
    }
  };

  const handleModalReset = () => {
    setModalAdults(1);
    setModalChildren(0);
    setModalInfants(0);
    setModalExpectedFare('');
    setModalTotalFare('');
  };

  const tabs = ['View Request', 'Make Payment', 'Add Passenger', 'View Booking'];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 w-full max-w-[1440px] mx-auto bg-white shadow-sm mt-4 mb-10 overflow-hidden relative pb-20">
        
        {/* Header with gradient background */}
        <div className="bg-gradient-to-r from-[#991b1b] to-[#0f172a] text-white px-8 py-6 rounded-t-lg">
           <div className="flex justify-between items-center mb-6">
              <div className="text-base font-medium opacity-80 flex items-center gap-2">
                 <span>Group Travel</span>
                 <span>→</span>
                 <span className="opacity-100 font-semibold">New Booking</span>
              </div>
              
              <div className="flex items-center gap-2 text-base">
                 <Bell className="w-4 h-4" />
                 <span>Notification(0)</span>
              </div>
           </div>

           {/* Navigation Tabs */}
           <div className="flex gap-8 relative mt-2">
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
                   placeholder="Group name" 
                   className="w-full bg-transparent border-none outline-none text-[17px] placeholder:text-gray-500 text-gray-800"
                 />
              </div>

              {/* Request ID */}
              <div className="border-b border-gray-300 pb-1">
                 <input 
                   type="text" 
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
                    <option value="New Request">New Request</option>
                    <option value="Payment pending">Payment pending</option>
                    <option value="Completed">Completed</option>
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
              <div className="flex items-center gap-4">
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
                 
                 <Button className="bg-[#E11D48] hover:bg-[#be1238] text-white rounded-full px-6 py-2 h-auto font-bold text-base shadow-sm whitespace-nowrap">
                   Apply Filters
                 </Button>
                 <button className="text-[#E11D48] font-bold text-base hover:underline whitespace-nowrap px-2">
                   Reset
                 </button>
              </div>

           </div>
           
           <div className="mt-4">
              <button className="text-[#E11D48] font-semibold text-base hover:underline">
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
                 No &quot;Payment pending&quot; requests found.
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
                              {req.origin} <span className="text-[#E11D48] text-xs">✈</span> {req.destination}
                           </div>
                           <div className="text-gray-400 text-[12px] mt-0.5 whitespace-nowrap">{req.departureDate}</div>
                        </div>
                        
                        {/* Return */}
                        <div className="flex flex-col items-start min-w-[100px]">
                           <div className="flex items-center gap-1.5 font-bold text-gray-900 text-[14px]">
                              {req.destination} <span className="text-[#E11D48] text-xs transform rotate-180">✈</span> {req.origin}
                           </div>
                           <div className="text-gray-400 text-[12px] mt-0.5 whitespace-nowrap">{req.returnDate}</div>
                        </div>
                     </div>

                     {/* Col 3: Airline */}
                     <div className="text-[#E11D48] font-bold text-[14px] tracking-wide uppercase truncate pr-2">
                        {req.airline}
                     </div>

                     {/* Col 4: Request details */}
                     <div className="flex flex-col text-[13px]">
                        <span className="text-gray-700 font-medium truncate pr-2">
                           {req.adults + req.children} pax({req.adults + req.children}A)
                        </span>
                        <span className="text-[#E11D48] truncate pr-2">Request Date: {req.requestDate}</span>
                     </div>

                     {/* Col 5: PNR */}
                     <div className="text-gray-400 text-[15px]">—</div>

                     {/* Col 6: Status */}
                     <div className="flex flex-col items-start gap-0.5 pr-2">
                         <span className={`font-bold text-[14px] ${getStatusColor(req.status)} whitespace-nowrap`}>
                            {req.status}
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

      </main>

      {/* ---- Task 3: Payment Pending Detail Modal ---- */}
      <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
        <DialogContent className="sm:max-w-2xl rounded-[16px] p-0 border-0 overflow-hidden outline-none" showCloseButton={true}>
          <DialogHeader className="px-6 pt-5 pb-3 border-b border-gray-100">
            <DialogTitle className="text-[18px] font-bold text-gray-900">
              Make Payment Details
              {selectedRequest && (
                <span className="ml-2 text-gray-400 font-normal text-[15px]">— {selectedRequest.requestId}</span>
              )}
            </DialogTitle>
          </DialogHeader>

          {/* Orange Valid Till Alert Bar */}
          {selectedRequest?.validTill && (
            <div className="mx-6 mt-4 flex items-center gap-2 bg-orange-50 border border-orange-200 rounded-lg px-4 py-2.5">
              <AlertCircle className="w-4 h-4 text-orange-500 shrink-0" />
              <span className="text-[15px] font-semibold text-orange-700">
                Valid till: {selectedRequest.validTill}
              </span>
            </div>
          )}

          {/* Two-column form body */}
          <div className="px-6 py-5 grid grid-cols-1 sm:grid-cols-2 gap-6">

            {/* Left: Passenger Details + Expected Fare */}
            <div>
              <h4 className="text-[15px] font-bold text-gray-700 uppercase tracking-wide mb-4">Passenger Details</h4>

              <div className="space-y-4">
                {/* Adults */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[16px] font-semibold text-gray-800">Adults</p>
                    <p className="text-[13px] text-gray-400">12+ years</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setModalAdults(Math.max(1, modalAdults - 1))}
                      className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center text-gray-500 hover:border-gray-400 transition"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-[17px] font-bold w-5 text-center">{modalAdults}</span>
                    <button
                      onClick={() => setModalAdults(modalAdults + 1)}
                      className="w-7 h-7 rounded-full border border-[#E11D48] flex items-center justify-center text-[#E11D48] hover:bg-[#E11D48] hover:text-white transition"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Children */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[16px] font-semibold text-gray-800">Children</p>
                    <p className="text-[13px] text-gray-400">2–11 years</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setModalChildren(Math.max(0, modalChildren - 1))}
                      className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center text-gray-500 hover:border-gray-400 transition"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-[17px] font-bold w-5 text-center">{modalChildren}</span>
                    <button
                      onClick={() => setModalChildren(modalChildren + 1)}
                      className="w-7 h-7 rounded-full border border-[#E11D48] flex items-center justify-center text-[#E11D48] hover:bg-[#E11D48] hover:text-white transition"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Infants */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[16px] font-semibold text-gray-800">Infants</p>
                    <p className="text-[13px] text-gray-400">Under 2 years</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setModalInfants(Math.max(0, modalInfants - 1))}
                      className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center text-gray-500 hover:border-gray-400 transition"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-[17px] font-bold w-5 text-center">{modalInfants}</span>
                    <button
                      onClick={() => setModalInfants(modalInfants + 1)}
                      className="w-7 h-7 rounded-full border border-[#E11D48] flex items-center justify-center text-[#E11D48] hover:bg-[#E11D48] hover:text-white transition"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <p className="text-[12px] text-gray-400 italic">NOTE: Infant not added to passenger count</p>

                {/* Summary chip */}
                <div className="inline-flex items-center gap-1.5 bg-[#fceef0] px-3 py-1.5 rounded-full">
                  <User className="w-3.5 h-3.5 text-[#E11D48]" />
                  <span className="text-[14px] font-bold text-gray-800">
                    {totalModalPassengers} Passenger{totalModalPassengers !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>

              {/* Expected Fare */}
              <div className="mt-6">
                <label className="block text-[15px] font-bold text-gray-700 uppercase tracking-wide mb-2">
                  Expected Fare (per pax)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[17px] font-medium">₹</span>
                  <input
                    type="number"
                    value={modalExpectedFare}
                    onChange={(e) => {
                       // Only allow numeric input (and optionally a decimal point)
                       const val = e.target.value.replace(/[^0-9.]/g, '');
                       setModalExpectedFare(val);
                    }}
                    placeholder="0.00"
                    className="w-full border border-gray-200 rounded-lg pl-7 pr-4 py-2.5 text-[18px] text-gray-800 outline-none focus:border-[#E11D48] focus:ring-1 focus:ring-[#E11D48] transition"
                  />
                </div>
              </div>
            </div>

            {/* Right: Total Passenger Fare */}
            <div>
              <h4 className="text-[15px] font-bold text-gray-700 uppercase tracking-wide mb-4">Total Passenger Fare</h4>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[15px] font-medium">₹</span>
                <input
                  type="number"
                  value={modalTotalFare}
                  onChange={(e) => setModalTotalFare(e.target.value)}
                  placeholder="0.00"
                  className="w-full border border-gray-200 rounded-lg pl-7 pr-4 py-2.5 text-[16px] text-gray-800 outline-none focus:border-[#E11D48] focus:ring-1 focus:ring-[#E11D48] transition"
                />
              </div>

              {/* Fare summary hint */}
              {modalExpectedFare && totalModalPassengers > 0 && (
                <div className="mt-3 p-3 bg-gray-50 rounded-lg text-[14px] text-gray-500">
                  <span className="font-medium text-gray-700">Estimated total: </span>
                  ₹{((parseFloat(modalExpectedFare) || 0) * totalModalPassengers).toLocaleString('en-IN')}
                  <span className="block text-[13px] mt-0.5">({totalModalPassengers} pax × ₹{(parseFloat(modalExpectedFare) || 0).toLocaleString('en-IN')})</span>
                </div>
              )}
            </div>
          </div>

          {/* Footer: Reset & Done */}
          <div className="px-6 pb-6 flex justify-end gap-3 border-t border-gray-100 pt-4">
            <Button
              variant="outline"
              onClick={handleModalReset}
              className="px-8 py-2.5 h-auto rounded-full border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 text-[16px]"
            >
              Reset
            </Button>
            <Button
              onClick={handleModalDone}
              className="px-8 py-2.5 h-auto rounded-full bg-[#E11D48] hover:bg-[#be1238] text-white font-bold text-[16px]"
            >
              Done
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
}
