"use client";

import React, { useState } from 'react';
import { B2BNavbar } from "@/components/B2BNavbar";
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Bell, ChevronDown, CalendarIcon } from 'lucide-react';
import Link from 'next/link';
import { useGroupTravel } from '@/context/GroupTravelContext';
import { PAYMENT_CONFIG } from '@/lib/paymentConfig';
import { NotificationModal } from '@/components/NotificationModal';

export default function MakePaymentPage() {
  const [activeTab, setActiveTab] = useState('Make Payment');
  const { requests } = useGroupTravel();
  const [notificationOpen, setNotificationOpen] = useState(false);
  
  // Filter for pending payments
  const pendingPayments = requests.filter((req) => req.status === "Payment pending");

  const tabs = ['View Request', 'Make Payment', 'Add Passenger', 'View Booking'];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <B2BNavbar />

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
                  <Link href="/b2b/group-travel/make-payment">{tab}</Link>
                ) : tab === 'View Request' ? (
                  <Link href="/b2b/group-travel/view-request">{tab}</Link>
                ) : tab === 'Add Passenger' ? (
                  <Link href="/b2b/group-travel/add-passenger">{tab}</Link>
                ) : tab === 'View Booking' ? (
                  <Link href="/b2b/group-travel/view-booking">{tab}</Link>
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

        {/* Filter Bar */}
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
              <select className="w-full bg-transparent border-none outline-none text-[17px] text-gray-500 appearance-none cursor-pointer pr-6">
                <option value="" disabled hidden>Status</option>
                <option value="pending">Payment pending</option>
              </select>
              <ChevronDown className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
            </div>

            {/* Request start date */}
            <div className="border-b border-gray-300 pb-1 relative">
              <input
                type="text"
                placeholder="Request start date"
                className="w-full bg-transparent border-none outline-none text-[17px] placeholder:text-gray-500 text-gray-800 pr-6"
                onFocus={(e) => (e.target.type = 'date')}
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
                  className="w-full bg-transparent border-none outline-none text-[17px] placeholder:text-gray-500 text-gray-800 pr-6"
                  onFocus={(e) => (e.target.type = 'date')}
                  onBlur={(e) => e.target.value === '' && (e.target.type = 'text')}
                />
                <CalendarIcon className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
              </div>

              <div className="flex items-center justify-between sm:justify-start gap-4">
                <Button className="bg-[#D60D26] hover:bg-[#D60D26] text-white rounded-full px-6 py-2 h-auto font-bold text-base shadow-sm whitespace-nowrap">
                  Apply Filters
                </Button>
                <button className="text-[#D60D26] font-bold text-base hover:underline whitespace-nowrap px-2">
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
            <h2 className="text-xl font-bold text-gray-900">Showing {pendingPayments.length}</h2>
            <div className="flex items-center gap-2">
              <span className="text-gray-500 text-base">Sort by</span>
              <button className="text-gray-900 font-bold text-base flex items-center gap-1">
                Recommended <ChevronDown className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Table Container */}
          <div className="overflow-x-auto w-full no-scrollbar pb-4">
            <div className="min-w-[1000px] xl:min-w-0">
              {/* Table Header */}
              <div className="grid grid-cols-[1.2fr_1.8fr_1fr_1.4fr_0.6fr_1.6fr] gap-4 px-4 mb-3 text-sm font-semibold text-gray-400 uppercase tracking-wide">
                <div>Group Details</div>
                <div>Flight details</div>
                <div>Airline</div>
                <div>Request details</div>
                <div>PNR</div>
                <div>Status</div>
              </div>

              {/* Data Rows */}
              <div className="space-y-3">
                {pendingPayments.length === 0 ? (
                   <div className="text-center py-16 text-gray-400 text-base">
                     No &quot;Payment pending&quot; requests found.
                   </div>
                ) : (
                   pendingPayments.map((req, index) => (
                     <div
                       key={req.id || index}
                       className="bg-white border border-gray-200 rounded-lg shadow-[0_2px_8px_rgba(0,0,0,0.05)] grid grid-cols-[1.2fr_1.8fr_1fr_1.4fr_0.6fr_1.6fr] gap-4 items-center px-4 py-4"
                     >
                       {/* Group Details */}
                       <div className="flex flex-col">
                         <span className="text-gray-900 font-bold text-[16px] truncate pr-2">{req.groupName}</span>
                         <span className="text-gray-500 text-[14px] truncate pr-2">{req.requestId}</span>
                       </div>

                       {/* Flight Details */}
                       <div className="flex items-center gap-5">
                         <div className="flex flex-col items-start min-w-[70px]">
                           <div className="flex items-center gap-1 font-bold text-gray-900 text-[15px]">
                             {req.origin} <span className="text-[#D60D26] text-xs">✈</span> {req.destination}
                           </div>
                           <div className="text-gray-400 text-[13px] whitespace-nowrap">{req.departureDate}</div>
                         </div>
                         <div className="flex flex-col items-start min-w-[70px]">
                           <div className="flex items-center gap-1 font-bold text-gray-900 text-[15px]">
                             {req.destination} <span className="text-[#D60D26] text-xs" style={{display:'inline-block',transform:'scaleX(-1)'}}>✈</span> {req.origin}
                           </div>
                           <div className="text-gray-400 text-[13px] whitespace-nowrap">{req.returnDate}</div>
                         </div>
                       </div>

                       {/* Airline */}
                       <div className="pr-2">
                         <span className="text-[#D60D26] font-bold text-[15px] tracking-wide uppercase leading-tight truncate">
                           {req.airline}<sup className="text-[8px]">✈</sup>
                         </span>
                       </div>

                       {/* Request Details */}
                       <div className="flex flex-col text-[14px] pr-2">
                         <span className="text-gray-700 font-medium truncate">
                           {req.adults + req.children} pax({req.adults + req.children}A)
                         </span>
                         <span className="text-[#D60D26] truncate">Request Date: {req.requestDate}</span>
                       </div>

                       {/* PNR */}
                       <div className="text-gray-500 text-[15px] font-medium">—</div>

                       {/* Status + View Details */}
                       <div className="flex items-center justify-between pl-1">
                         <div className="flex flex-col items-start gap-0.5">
                           <span className="font-bold text-[15px] text-[#D60D26] whitespace-nowrap">{PAYMENT_CONFIG.splitPercentage * 100}% Payment Due</span>
                           {req.validTill && (
                             <span className="text-[12px] text-gray-500 whitespace-nowrap">
                               Valid till: {req.validTill}
                             </span>
                           )}
                         </div>
                         <Link
                           href={`/b2b/group-travel/make-payment/payment-summary?id=${req.requestId}`}
                           className="text-blue-600 hover:underline text-[15px] font-medium border-l border-gray-200 pl-3 ml-2 whitespace-nowrap"
                         >
                           View Details
                         </Link>
                       </div>
                     </div>
                   ))
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
      <NotificationModal isOpen={notificationOpen} onClose={() => setNotificationOpen(false)} />
    </div>
  );
}
