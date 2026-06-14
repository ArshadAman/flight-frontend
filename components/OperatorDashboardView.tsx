"use client";

import React, { useState, useEffect } from 'react';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { useGroupTravel, TravelRequest, GroupPassenger } from '@/context/GroupTravelContext';
import { 
  Bell, ChevronDown, CalendarIcon, AlertCircle, User, 
  MessageSquare, RefreshCw, CheckCircle2, Shield, Plus, Info, X, Plane, Send, Check
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

interface OperatorDashboardViewProps {
  NavbarComponent: React.ComponentType<any>;
}

export function OperatorDashboardView({ NavbarComponent }: OperatorDashboardViewProps) {
  const { 
    requests, 
    loading, 
    refreshRequests, 
    uploadQuotes, 
    resolveChangeRequest, 
    updateRequest, 
    issueTicket, 
    completeBooking 
  } = useGroupTravel();

  const [selectedRequest, setSelectedRequest] = useState<TravelRequest | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Toast State
  const [toasts, setToasts] = useState<{ id: number; message: string; type: "success" | "error" }[]>([]);
  const showToast = (message: string, type: "success" | "error" = "success") => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  };

  // Action Loading
  const [isActionLoading, setIsActionLoading] = useState(false);

  // Form Inputs: Upload Quote
  const [quoteAirline, setQuoteAirline] = useState('');
  const [quoteFlightNo, setQuoteFlightNo] = useState('');
  const [quoteDepTime, setQuoteDepTime] = useState('');
  const [quoteArrTime, setQuoteArrTime] = useState('');
  const [quoteFare, setQuoteFare] = useState('');
  const [quoteTax, setQuoteTax] = useState('0');
  const [quoteDeposit, setQuoteDeposit] = useState('0');
  const [quotePayDeadline, setQuotePayDeadline] = useState('');
  const [quoteBalDeadline, setQuoteBalDeadline] = useState('');
  const [quoteTerms, setQuoteTerms] = useState('');

  // Form Inputs: Change Request Resolution
  const [adjustedFare, setAdjustedFare] = useState('');
  const [adminRemarks, setAdminRemarks] = useState('');

  // Form Inputs: PNR Assignment
  const [pnrCode, setPnrCode] = useState('');

  // Form Inputs: Ticket Issuance
  const [ticketPnrCode, setTicketPnrCode] = useState('');

  // Load bookings on mount
  useEffect(() => {
    refreshRequests("ADMIN");
  }, []);

  const handleRefresh = async () => {
    showToast("Refreshing bookings database...", "success");
    await refreshRequests("ADMIN");
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "NEW_REQUEST": return "New Request";
      case "FARE_QUOTED": return "Fare Quoted";
      case "NEGOTIATION": return "Negotiation";
      case "ACCEPTED": return "Accepted";
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "NEW_REQUEST": return "bg-blue-50 text-blue-700 border-blue-200";
      case "FARE_QUOTED": return "bg-yellow-50 text-yellow-700 border-yellow-200";
      case "NEGOTIATION": return "bg-amber-50 text-amber-700 border-amber-200";
      case "ACCEPTED": return "bg-purple-50 text-purple-700 border-purple-200";
      case "PAYMENT_PENDING": return "bg-orange-50 text-orange-700 border-orange-200";
      case "PARTIALLY_PAID": return "bg-rose-50 text-rose-700 border-rose-200";
      case "PAID": return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "PNR_CREATED": return "bg-teal-50 text-teal-700 border-teal-200";
      case "NAME_SUBMITTED": return "bg-cyan-50 text-cyan-700 border-cyan-200";
      case "TICKETED": return "bg-green-50 text-green-700 border-green-200";
      case "COMPLETED": return "bg-slate-50 text-slate-700 border-slate-200";
      default: return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  const handleOpenDetails = (req: TravelRequest) => {
    setSelectedRequest(req);
    setIsDetailsOpen(true);
    
    // Reset forms
    setAdminRemarks("");
    setAdjustedFare("");
    setPnrCode(req.pnrNumber || "");
    setTicketPnrCode(req.pnrNumber || "");

    // Prefill quote forms
    const depDate = new Date();
    depDate.setDate(depDate.getDate() + 14);
    const arrDate = new Date(depDate.getTime() + 5 * 60 * 60 * 1000); // 5 hours later
    const payLimit = new Date();
    payLimit.setDate(payLimit.getDate() + 3);
    const balLimit = new Date();
    balLimit.setDate(balLimit.getDate() + 10);

    const pad = (n: number) => n.toString().padStart(2, '0');
    const formatDT = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;

    setQuoteAirline(req.airlinePreference || "Air India");
    setQuoteFlightNo("AI-" + Math.floor(100 + Math.random() * 900));
    setQuoteDepTime(formatDT(depDate));
    setQuoteArrTime(formatDT(arrDate));
    setQuoteFare(req.expectedFare || "15000");
    setQuoteTax("1200");
    setQuoteDeposit("3000");
    setQuotePayDeadline(formatDT(payLimit));
    setQuoteBalDeadline(formatDT(balLimit));
    setQuoteTerms("1. Standard baggage limit is 25kg.\n2. Deposits are non-refundable after quote acceptance deadline.");
  };

  // Action: Upload Quote
  const handleUploadQuoteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRequest) return;
    setIsActionLoading(true);
    try {
      const quote = {
        quote_option_id: "OPT-" + Math.random().toString(36).substring(2, 7).toUpperCase(),
        airline: quoteAirline,
        flight_number: quoteFlightNo,
        departure_time: new Date(quoteDepTime).toISOString(),
        arrival_time: new Date(quoteArrTime).toISOString(),
        fare_per_pax: parseFloat(quoteFare) || 0,
        tax_per_pax: parseFloat(quoteTax) || 0,
        deposit_per_pax: parseFloat(quoteDeposit) || 0,
        payment_deadline: new Date(quotePayDeadline).toISOString(),
        balance_deadline: new Date(quoteBalDeadline).toISOString(),
        terms_and_conditions: quoteTerms,
      };

      const success = await uploadQuotes(selectedRequest.id, [quote]);
      if (success) {
        showToast("Quotes uploaded and sent to agent!", "success");
        await refreshRequests("ADMIN");
        setIsDetailsOpen(false);
      } else {
        showToast("Failed to upload quotes to the backend.", "error");
      }
    } catch (err: any) {
      showToast("Error uploading quotes: " + err.message, "error");
    } finally {
      setIsActionLoading(false);
    }
  };

  // Action: Resolve Change Request
  const handleResolveChangeReq = async (crId: string, status: "APPROVED" | "REJECTED") => {
    if (!selectedRequest) return;
    setIsActionLoading(true);
    try {
      const success = await resolveChangeRequest(
        selectedRequest.id,
        crId,
        status,
        adminRemarks,
        status === "APPROVED" ? adjustedFare : undefined
      );
      if (success) {
        showToast(`Change request ${status.toLowerCase()} successfully!`, "success");
        await refreshRequests("ADMIN");
        setIsDetailsOpen(false);
      } else {
        showToast("Failed to resolve change request.", "error");
      }
    } catch (err: any) {
      showToast("Error: " + err.message, "error");
    } finally {
      setIsActionLoading(false);
    }
  };

  // Action: Assign PNR (Hold Payment or Paid booking)
  const handleAssignPnrSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRequest) return;
    if (!pnrCode.trim()) {
      showToast("Please enter a valid PNR code.", "error");
      return;
    }
    setIsActionLoading(true);
    try {
      const success = await updateRequest(selectedRequest.id, { pnrNumber: pnrCode }, "ADMIN");
      if (success) {
        showToast("PNR code updated successfully!", "success");
        await refreshRequests("ADMIN");
        setIsDetailsOpen(false);
      } else {
        showToast("Failed to update PNR.", "error");
      }
    } catch (err: any) {
      showToast("Error: " + err.message, "error");
    } finally {
      setIsActionLoading(false);
    }
  };

  // Action: Issue E-Ticket
  const handleIssueTicketSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRequest) return;
    const finalPnr = ticketPnrCode.trim() || selectedRequest.pnrNumber;
    if (!finalPnr) {
      showToast("PNR is required to issue tickets.", "error");
      return;
    }
    setIsActionLoading(true);
    try {
      const success = await issueTicket(selectedRequest.id, finalPnr);
      if (success) {
        showToast("E-Tickets issued successfully!", "success");
        await refreshRequests("ADMIN");
        setIsDetailsOpen(false);
      } else {
        showToast("Failed to issue e-tickets.", "error");
      }
    } catch (err: any) {
      showToast("Error: " + err.message, "error");
    } finally {
      setIsActionLoading(false);
    }
  };

  // Action: Complete Booking
  const handleCompleteBookingClick = async () => {
    if (!selectedRequest) return;
    setIsActionLoading(true);
    try {
      const success = await completeBooking(selectedRequest.id);
      if (success) {
        showToast("Booking marked as COMPLETED successfully!", "success");
        await refreshRequests("ADMIN");
        setIsDetailsOpen(false);
      } else {
        showToast("Failed to mark booking as completed.", "error");
      }
    } catch (err: any) {
      showToast("Error: " + err.message, "error");
    } finally {
      setIsActionLoading(false);
    }
  };

  // Filter requests
  const filteredRequests = requests.filter((r) => {
    if (statusFilter !== 'all' && r.status !== statusFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchId = r.requestId.toLowerCase().includes(q) || r.id.toLowerCase().includes(q);
      const matchName = r.groupName.toLowerCase().includes(q);
      if (!matchId && !matchName) return false;
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <NavbarComponent />

      {/* Toast notifications */}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
        {toasts.map((t) => (
          <div 
            key={t.id} 
            className={`flex items-center gap-3 rounded-xl px-4 py-3 shadow-lg text-white text-[14px] font-medium min-w-[320px] transition-all ${
              t.type === "success" ? "bg-green-600" : "bg-[#D60D26]"
            }`}
          >
            {t.type === "success" ? <CheckCircle2 className="w-5 h-5 flex-shrink-0" /> : <AlertCircle className="w-5 h-5 flex-shrink-0" />}
            <span className="flex-1">{t.message}</span>
            <button onClick={() => setToasts(prev => prev.filter(x => x.id !== t.id))} className="hover:opacity-75">
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      {/* Header banner */}
      <div className="bg-[#121121] text-white px-8 py-5 flex justify-between items-center border-b border-[#D60D26]">
        <div className="flex items-center gap-3">
          <Shield className="w-6 h-6 text-[#D60D26]" />
          <div>
            <h1 className="text-xl font-bold tracking-tight">Operator Dashboard</h1>
            <p className="text-xs text-gray-400">Manage all customer group travel requests and flight quotes</p>
          </div>
        </div>
        <Button 
          onClick={handleRefresh} 
          variant="outline" 
          className="border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white flex items-center gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh Database
        </Button>
      </div>

      <main className="flex-1 w-full max-w-[1440px] mx-auto px-6 py-8">
        
        {/* Filters and search */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div className="flex flex-wrap gap-3">
            {[
              { id: 'all', label: 'All Requests' },
              { id: 'NEW_REQUEST', label: 'New Requests' },
              { id: 'FARE_QUOTED', label: 'Fare Quoted' },
              { id: 'NEGOTIATION', label: 'Negotiations' },
              { id: 'PAYMENT_PENDING', label: 'Payment Pending' },
              { id: 'PAID', label: 'Paid' },
              { id: 'NAME_SUBMITTED', label: 'Name Submitted' },
              { id: 'TICKETED', label: 'Ticketed' },
              { id: 'COMPLETED', label: 'Completed' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={`px-4 py-2 text-sm font-semibold rounded-full border transition-all ${
                  statusFilter === tab.id 
                  ? "bg-[#D60D26] text-white border-[#D60D26]" 
                  : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="w-full md:w-80 relative">
            <Input 
              type="text" 
              placeholder="Search request ID or group..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-4 pr-10 py-2 border-gray-200 rounded-xl"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-bold pointer-events-none">🔍</span>
          </div>
        </div>

        {/* Bookings list */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 font-semibold uppercase text-xs tracking-wider">
                  <th className="px-6 py-4">Request / Group</th>
                  <th className="px-6 py-4">Route & Cabin</th>
                  <th className="px-6 py-4">Travelers</th>
                  <th className="px-6 py-4">Expected Fare</th>
                  <th className="px-6 py-4">Financials</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading && filteredRequests.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-16 text-center text-gray-500 font-medium">
                      <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-3 text-gray-300" />
                      Loading bookings...
                    </td>
                  </tr>
                ) : filteredRequests.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-16 text-center text-gray-400 font-medium">
                      No group bookings matching current filters.
                    </td>
                  </tr>
                ) : (
                  filteredRequests.map((req) => {
                    const totalPax = req.adults + req.children + req.infants;
                    const changePending = req.changeRequests.some(c => c.status === 'PENDING_REVIEW');
                    return (
                      <tr key={req.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="text-gray-900 font-bold">{req.groupName}</span>
                            <span className="text-xs font-medium text-gray-500">{req.requestId || req.id}</span>
                            <span className="text-[10px] text-gray-400 mt-1">Requested: {req.requestDate}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <div className="flex items-center gap-1.5 font-bold text-gray-800">
                              <span>{req.origin}</span>
                              <Plane className="w-3 h-3 text-[#D60D26]" />
                              <span>{req.destination}</span>
                            </div>
                            <span className="text-xs text-gray-500 capitalize">{req.cabin} class</span>
                            <span className="text-[10px] text-gray-400 font-medium">Pref: {req.airline}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-gray-800 font-semibold">{totalPax} Pax</div>
                          <div className="text-xs text-gray-400">({req.adults}A / {req.children}C / {req.infants}I)</div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-bold text-gray-900">INR {parseFloat(req.expectedFare).toLocaleString('en-IN')}</span>
                          <span className="text-[10px] text-gray-400 block">per pax expectation</span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col text-xs">
                            <div className="flex justify-between gap-2">
                              <span className="text-gray-400 font-medium">Paid:</span>
                              <span className="font-bold text-green-600">INR {parseFloat(req.totalPaid).toLocaleString('en-IN')}</span>
                            </div>
                            {req.pnrNumber && (
                              <div className="flex justify-between gap-2 mt-0.5">
                                <span className="text-gray-400 font-medium">PNR:</span>
                                <span className="font-bold text-blue-600 uppercase">{req.pnrNumber}</span>
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col items-start gap-1">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(req.status)}`}>
                              {getStatusLabel(req.status)}
                            </span>
                            {changePending && (
                              <span className="bg-rose-100 text-rose-800 border border-rose-200 text-[10px] font-bold px-2 py-0.5 rounded animate-pulse">
                                Size Change Pending
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <Button 
                            onClick={() => handleOpenDetails(req)}
                            className="bg-[#D60D26] hover:bg-[#D60D26]/90 text-white rounded-full font-bold text-xs px-4"
                          >
                            Manage
                          </Button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Details Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[85vh] overflow-y-auto rounded-2xl bg-white p-6 outline-none">
          {selectedRequest && (
            <>
              <DialogHeader className="border-b border-gray-100 pb-4 mb-4">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-xs font-bold text-[#D60D26] uppercase tracking-wider">Group Booking Operations</span>
                    <DialogTitle className="text-xl font-bold text-gray-900 mt-1">{selectedRequest.groupName}</DialogTitle>
                    <p className="text-xs text-gray-400">Request Ref: {selectedRequest.requestId || selectedRequest.id}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(selectedRequest.status)}`}>
                    {getStatusLabel(selectedRequest.status)}
                  </span>
                </div>
              </DialogHeader>

              <div className="space-y-6">
                
                {/* Request details block */}
                <div className="bg-gray-50 rounded-xl p-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-medium border border-gray-100">
                  <div>
                    <span className="text-gray-400 block mb-1">Route</span>
                    <span className="text-gray-900 font-bold">{selectedRequest.origin} to {selectedRequest.destination}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block mb-1">Dates</span>
                    <span className="text-gray-900 font-bold">{selectedRequest.departureDate} — {selectedRequest.returnDate}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block mb-1">Travelers</span>
                    <span className="text-gray-900 font-bold">{selectedRequest.adults + selectedRequest.children + selectedRequest.infants} Pax</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block mb-1">Cabin Preference</span>
                    <span className="text-gray-900 font-bold capitalize">{selectedRequest.cabin} / {selectedRequest.timing}</span>
                  </div>
                </div>

                {/* --- OPERATOR ACTIONS ACCORDING TO STATE --- */}

                {/* ACTION 1: Upload Quote */}
                {["NEW_REQUEST", "NEGOTIATION", "FARE_QUOTED"].includes(selectedRequest.status) && (
                  <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                    <div className="bg-[#F2FBFF] px-4 py-3 border-b border-gray-200 flex items-center justify-between">
                      <span className="font-bold text-sm text-gray-800 flex items-center gap-1.5">
                        ✈️ Submit / Upload Quotes
                      </span>
                      <span className="text-[11px] text-blue-600 font-semibold italic">Transitions status to FARE_QUOTED</span>
                    </div>
                    <form onSubmit={handleUploadQuoteSubmit} className="p-4 space-y-4 text-xs">
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <div>
                          <label className="text-gray-500 font-semibold block mb-1">Airline</label>
                          <Input 
                            value={quoteAirline} 
                            onChange={(e) => setQuoteAirline(e.target.value)} 
                            required 
                            className="h-8 text-xs"
                          />
                        </div>
                        <div>
                          <label className="text-gray-500 font-semibold block mb-1">Flight Number</label>
                          <Input 
                            value={quoteFlightNo} 
                            onChange={(e) => setQuoteFlightNo(e.target.value)} 
                            required 
                            className="h-8 text-xs"
                          />
                        </div>
                        <div>
                          <label className="text-gray-500 font-semibold block mb-1">Base Fare / Traveler</label>
                          <Input 
                            type="number" 
                            value={quoteFare} 
                            onChange={(e) => setQuoteFare(e.target.value)} 
                            required 
                            className="h-8 text-xs"
                          />
                        </div>
                        <div>
                          <label className="text-gray-500 font-semibold block mb-1">Tax / Traveler</label>
                          <Input 
                            type="number" 
                            value={quoteTax} 
                            onChange={(e) => setQuoteTax(e.target.value)} 
                            required 
                            className="h-8 text-xs"
                          />
                        </div>
                        <div>
                          <label className="text-gray-500 font-semibold block mb-1">Deposit / Traveler</label>
                          <Input 
                            type="number" 
                            value={quoteDeposit} 
                            onChange={(e) => setQuoteDeposit(e.target.value)} 
                            required 
                            className="h-8 text-xs"
                          />
                        </div>
                        <div>
                          <label className="text-gray-500 font-semibold block mb-1">Departure Timings</label>
                          <Input 
                            type="datetime-local" 
                            value={quoteDepTime} 
                            onChange={(e) => setQuoteDepTime(e.target.value)} 
                            required 
                            className="h-8 text-xs"
                          />
                        </div>
                        <div>
                          <label className="text-gray-500 font-semibold block mb-1">Arrival Timings</label>
                          <Input 
                            type="datetime-local" 
                            value={quoteArrTime} 
                            onChange={(e) => setQuoteArrTime(e.target.value)} 
                            required 
                            className="h-8 text-xs"
                          />
                        </div>
                        <div>
                          <label className="text-gray-500 font-semibold block mb-1">Deposit Payment Deadline</label>
                          <Input 
                            type="datetime-local" 
                            value={quotePayDeadline} 
                            onChange={(e) => setQuotePayDeadline(e.target.value)} 
                            required 
                            className="h-8 text-xs"
                          />
                        </div>
                        <div>
                          <label className="text-gray-500 font-semibold block mb-1">Balance Payment Deadline</label>
                          <Input 
                            type="datetime-local" 
                            value={quoteBalDeadline} 
                            onChange={(e) => setQuoteBalDeadline(e.target.value)} 
                            required 
                            className="h-8 text-xs"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-gray-500 font-semibold block mb-1">Terms & Conditions</label>
                        <textarea 
                          rows={3} 
                          value={quoteTerms} 
                          onChange={(e) => setQuoteTerms(e.target.value)}
                          className="w-full border border-gray-200 rounded-lg p-2 resize-none outline-none focus:border-[#D60D26]"
                        />
                      </div>

                      <div className="flex justify-end pt-2">
                        <Button 
                          type="submit" 
                          disabled={isActionLoading}
                          className="bg-[#D60D26] hover:bg-[#D60D26] text-white rounded-full font-bold text-xs px-6 py-2"
                        >
                          Submit Flight Quote
                        </Button>
                      </div>
                    </form>
                  </div>
                )}

                {/* ACTION 2: Resolve Traveler Count Change Requests */}
                {selectedRequest.changeRequests && selectedRequest.changeRequests.length > 0 && (
                  <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                    <div className="bg-rose-50 px-4 py-3 border-b border-gray-200">
                      <span className="font-bold text-sm text-gray-800 flex items-center gap-1.5">
                        ⚠️ Traveler Count Change Requests Logs
                      </span>
                    </div>
                    <div className="p-4 space-y-4 text-xs">
                      {selectedRequest.changeRequests.map((cr) => (
                        <div key={cr.id} className="border border-gray-100 rounded-xl p-3 bg-white space-y-3 shadow-inner">
                          <div className="flex justify-between items-center">
                            <span className="font-bold text-gray-800">
                              Change Request ({cr.change_type}) — Delta: {cr.pax_delta > 0 ? '+' : ''}{cr.pax_delta} Travelers
                            </span>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              cr.status === 'PENDING_REVIEW' ? 'bg-amber-100 text-amber-700' :
                              cr.status === 'APPROVED' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                            }`}>
                              {cr.status}
                            </span>
                          </div>
                          
                          {cr.agent_notes && (
                            <p className="text-gray-500">
                              <strong>Agent Notes:</strong> {cr.agent_notes}
                            </p>
                          )}

                          {cr.status === 'PENDING_REVIEW' ? (
                            <div className="space-y-3 pt-2 border-t border-gray-100">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div>
                                  <label className="text-gray-400 font-semibold block mb-1">Adjusted Seat Fare (Optional)</label>
                                  <Input 
                                    type="number" 
                                    placeholder="Keep empty to leave fare unchanged" 
                                    value={adjustedFare}
                                    onChange={(e) => setAdjustedFare(e.target.value)}
                                    className="h-8 text-xs"
                                  />
                                </div>
                                <div>
                                  <label className="text-gray-400 font-semibold block mb-1">Admin Remarks</label>
                                  <Input 
                                    type="text" 
                                    placeholder="e.g. Approved with revised carrier rates" 
                                    value={adminRemarks}
                                    onChange={(e) => setAdminRemarks(e.target.value)}
                                    className="h-8 text-xs"
                                  />
                                </div>
                              </div>
                              <div className="flex gap-2 justify-end">
                                <Button 
                                  onClick={() => handleResolveChangeReq(cr.change_request_id || cr.id, "REJECTED")}
                                  disabled={isActionLoading}
                                  variant="outline"
                                  className="border-red-200 text-red-600 hover:bg-red-50 text-xs px-4 h-8"
                                >
                                  Reject Request
                                </Button>
                                <Button 
                                  onClick={() => handleResolveChangeReq(cr.change_request_id || cr.id, "APPROVED")}
                                  disabled={isActionLoading}
                                  className="bg-green-600 hover:bg-green-700 text-white text-xs px-4 h-8"
                                >
                                  Approve & Apply
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <div className="text-[11px] text-gray-400 border-t border-gray-50 pt-2">
                              {cr.admin_remarks && <div><strong>Admin Remarks:</strong> {cr.admin_remarks}</div>}
                              {cr.adjusted_fare_per_pax && <div><strong>Adjusted Fare:</strong> INR {parseFloat(cr.adjusted_fare_per_pax).toLocaleString('en-IN')}</div>}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* ACTION 3: Assign PNR once paid */}
                {selectedRequest.status === "PAID" && (
                  <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                    <div className="bg-emerald-50 px-4 py-3 border-b border-gray-200">
                      <span className="font-bold text-sm text-gray-800 flex items-center gap-1.5">
                        💳 Assign PNR Code (Payment Complete)
                      </span>
                    </div>
                    <form onSubmit={handleAssignPnrSubmit} className="p-4 flex flex-col sm:flex-row items-end gap-4 text-xs bg-white">
                      <div className="flex-1">
                        <label className="text-gray-500 font-semibold block mb-1">Enter Air Carrier PNR Number</label>
                        <Input 
                          placeholder="e.g. PNRX1052" 
                          value={pnrCode} 
                          onChange={(e) => setPnrCode(e.target.value)}
                          required 
                          className="h-10 text-xs uppercase"
                        />
                      </div>
                      <Button 
                        type="submit" 
                        disabled={isActionLoading}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold h-10 px-6 rounded-lg text-xs"
                      >
                        Assign PNR & Notify
                      </Button>
                    </form>
                  </div>
                )}

                {/* Passenger manifest list display */}
                {selectedRequest.passengers && selectedRequest.passengers.length > 0 && (
                  <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                    <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex justify-between items-center">
                      <span className="font-bold text-sm text-gray-800">
                        📋 Uploaded Passenger Manifest ({selectedRequest.passengers.length} Pax)
                      </span>
                      {selectedRequest.status === "NAME_SUBMITTED" && (
                        <span className="text-[10px] text-green-600 font-bold uppercase tracking-tight animate-pulse">Manifest Ready</span>
                      )}
                    </div>
                    <div className="p-0 max-h-48 overflow-y-auto">
                      <table className="w-full text-[11px] text-left border-collapse">
                        <thead className="bg-gray-100 text-gray-400 font-bold border-b border-gray-200">
                          <tr>
                            <th className="px-4 py-2">S.No</th>
                            <th className="px-4 py-2">First Name</th>
                            <th className="px-4 py-2">Last Name</th>
                            <th className="px-4 py-2">Gender</th>
                            <th className="px-4 py-2">DOB</th>
                            <th className="px-4 py-2">Passport Number</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 font-medium">
                          {selectedRequest.passengers.map((p, idx) => (
                            <tr key={p.id || idx}>
                              <td className="px-4 py-2 text-gray-400">{idx+1}</td>
                              <td className="px-4 py-2 font-bold text-gray-800">{p.first_name}</td>
                              <td className="px-4 py-2 font-bold text-gray-800">{p.last_name}</td>
                              <td className="px-4 py-2 uppercase text-gray-500">{p.gender}</td>
                              <td className="px-4 py-2 text-gray-600">{p.date_of_birth}</td>
                              <td className="px-4 py-2 text-blue-600 font-mono">{p.passport_number || 'N/A'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* ACTION 4: Issue E-Tickets */}
                {selectedRequest.status === "NAME_SUBMITTED" && (
                  <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                    <div className="bg-cyan-50 px-4 py-3 border-b border-gray-200">
                      <span className="font-bold text-sm text-gray-800 flex items-center gap-1.5">
                        ✈️ Issue E-Tickets (Manifest Uploaded)
                      </span>
                    </div>
                    <form onSubmit={handleIssueTicketSubmit} className="p-4 flex flex-col sm:flex-row items-end gap-4 text-xs">
                      <div className="flex-1">
                        <label className="text-gray-500 font-semibold block mb-1">Verify or Update PNR Code</label>
                        <Input 
                          placeholder="e.g. PNRX1052" 
                          value={ticketPnrCode} 
                          onChange={(e) => setTicketPnrCode(e.target.value)}
                          required 
                          className="h-10 text-xs uppercase"
                        />
                      </div>
                      <Button 
                        type="submit" 
                        disabled={isActionLoading}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-10 px-6 rounded-lg text-xs"
                      >
                        Issue E-Tickets Now
                      </Button>
                    </form>
                  </div>
                )}

                {/* ACTION 5: Complete Booking */}
                {selectedRequest.status === "TICKETED" && (
                  <div className="bg-green-50 border border-green-200 rounded-xl p-5 flex items-center justify-between shadow-sm">
                    <div>
                      <h4 className="font-bold text-sm text-green-800">Booking Ready to Complete</h4>
                      <p className="text-xs text-green-600 mt-1">E-Tickets are successfully generated for this booking manifest.</p>
                    </div>
                    <Button 
                      onClick={handleCompleteBookingClick}
                      disabled={isActionLoading}
                      className="bg-green-600 hover:bg-green-700 text-white font-bold px-6 py-2.5 rounded-full text-xs shadow"
                    >
                      Complete Booking
                    </Button>
                  </div>
                )}

                {/* General Status information */}
                <div className="flex justify-end pt-2 border-t border-gray-100 gap-2">
                  <Button 
                    onClick={() => setIsDetailsOpen(false)}
                    variant="outline"
                    className="border-gray-300 text-gray-600 hover:bg-gray-50 text-xs px-6 rounded-full"
                  >
                    Close Panel
                  </Button>
                </div>

              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
}
