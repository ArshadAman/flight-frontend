"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { B2BNavbar } from "@/components/B2BNavbar";
import { Footer } from "@/components/Footer";
import { useAuth } from "@/context/AuthContext";
import { useGroupTravel, TravelRequest } from "@/context/GroupTravelContext";
import { Button } from "@/components/ui/button";
import { 
  Wallet, 
  TrendingUp, 
  FileText, 
  UserCheck, 
  ArrowRight, 
  Clock, 
  Plus, 
  ListFilter,
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight
} from "lucide-react";
import Link from "next/link";

export default function B2BAgentDashboard() {
  const router = useRouter();
  const { user } = useAuth();
  const { requests, loading, refreshRequests } = useGroupTravel();
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    refreshRequests("AGENT");
  }, []);

  // Filter requests based on categories
  const filteredRequests = requests.filter(req => {
    if (filter === "all") return true;
    if (filter === "action") {
      return ["FARE_QUOTED", "PAYMENT_PENDING", "PARTIALLY_PAID", "PNR_CREATED"].includes(req.status);
    }
    if (filter === "negotiating") return req.status === "NEGOTIATION";
    if (filter === "confirmed") return ["PAID", "NAME_SUBMITTED", "TICKETED", "COMPLETED"].includes(req.status);
    return true;
  });

  // Calculate statistics
  const totalBookings = requests.length;
  const activeNegotiations = requests.filter(r => r.status === "NEGOTIATION").length;
  const actionRequired = requests.filter(r => ["FARE_QUOTED", "PAYMENT_PENDING", "PARTIALLY_PAID", "PNR_CREATED"].includes(r.status)).length;
  const totalCommissions = requests.filter(r => ["TICKETED", "COMPLETED"].includes(r.status)).length * 1500; // Mock commission per ticketed booking

  // Helper for MMT status badge styling
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "NEW_REQUEST":
        return { label: "Request Sent", bg: "bg-blue-50 text-blue-700 border-blue-200" };
      case "FARE_QUOTED":
        return { label: "Quotes Received", bg: "bg-amber-100 text-amber-800 border-amber-300 animate-pulse" };
      case "NEGOTIATION":
        return { label: "Negotiating", bg: "bg-purple-50 text-purple-700 border-purple-200" };
      case "PAYMENT_PENDING":
        return { label: "Pay Deposit", bg: "bg-red-50 text-red-700 border-red-200" };
      case "PARTIALLY_PAID":
        return { label: "Pay Balance", bg: "bg-orange-50 text-orange-700 border-orange-200" };
      case "PAID":
        return { label: "Awaiting PNR", bg: "bg-green-50 text-green-700 border-green-200" };
      case "PNR_CREATED":
        return { label: "Upload Manifest", bg: "bg-blue-100 text-blue-800 border-blue-300 animate-pulse" };
      case "NAME_SUBMITTED":
        return { label: "Ticketing In Progress", bg: "bg-teal-50 text-teal-700 border-teal-200" };
      case "TICKETED":
        return { label: "Ticket Issued", bg: "bg-green-100 text-green-800 border-green-300" };
      case "COMPLETED":
        return { label: "Completed", bg: "bg-slate-100 text-slate-700 border-slate-300" };
      default:
        return { label: status, bg: "bg-slate-50 text-slate-700 border-slate-200" };
    }
  };

  return (
    <div className="w-full min-h-screen bg-background flex flex-col font-sans">
      <B2BNavbar />

      {/* Header Banner */}
      <div className="w-full bg-[#121121] py-8 text-white relative overflow-hidden border-b border-slate-800">
        <div className="absolute top-0 right-0 w-80 h-80 bg-red-600/10 rounded-full blur-3xl" />
        <div className="container mx-auto px-6 lg:px-12 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative z-10">
          <div>
            <span className="text-primary font-bold text-xs uppercase tracking-widest block mb-1">
              MMT myPartner Dashboard
            </span>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight">
              Welcome Back, {user?.name || "Sanjay"}
            </h1>
            <p className="text-white/60 text-sm mt-1">
              Destiny Holidays Partner ID: <span className="font-bold text-white">MTD-8893</span>
            </p>
          </div>
          <div className="flex gap-3">
            <Link href="/b2b/group-travel/new">
              <Button className="bg-[#D60D26] hover:bg-[#D60D26]/90 text-white font-bold rounded-full px-6 py-2.5 h-auto flex items-center gap-1.5 shadow-lg shadow-red-500/15">
                <Plus className="w-4.5 h-4.5" />
                New Group Booking
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <main className="container mx-auto px-6 lg:px-12 py-10 flex-1 flex flex-col gap-10">
        
        {/* Row 1: MMT myPartner Stats & Wallet */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Wallet Card (4 Columns) */}
          <div className="lg:col-span-5 bg-gradient-to-br from-[#1E2329] to-[#121121] text-white p-6 rounded-2xl shadow-sm border border-slate-800 flex flex-col justify-between relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-red-600/5 rounded-full blur-2xl" />
            <div>
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-2 text-white/70 font-semibold text-sm">
                  <Wallet className="w-4.5 h-4.5 text-primary" />
                  <span>Agent Cash Limit & Credit Wallet</span>
                </div>
                <span className="bg-green-500/20 text-green-400 border border-green-500/30 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded">
                  Active
                </span>
              </div>
              <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider leading-none mb-1">Available Balance</p>
              <h3 className="text-3xl font-extrabold text-white tracking-tight mb-2">₹1,24,500.00</h3>
              <p className="text-white/60 text-xs font-medium">Credit Limit: <span className="text-white font-bold">₹2,00,000</span></p>
            </div>
            
            <div className="grid grid-cols-3 gap-2 mt-8 pt-4 border-t border-white/5 text-center">
              <Link href="/b2b/payment?tab=online-deposit" className="text-white/80 hover:text-white bg-white/5 hover:bg-white/10 py-2 rounded-lg text-xs font-bold transition-all">
                Add Cash
              </Link>
              <Link href="/b2b/payment?tab=deposit-slip" className="text-white/80 hover:text-white bg-white/5 hover:bg-white/10 py-2 rounded-lg text-xs font-bold transition-all">
                Submit Slip
              </Link>
              <Link href="/b2b/payment?tab=payment-due" className="text-white/80 hover:text-white bg-white/5 hover:bg-white/10 py-2 rounded-lg text-xs font-bold transition-all">
                Dues Check
              </Link>
            </div>
          </div>

          {/* Stats Metrics (7 Columns) */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col justify-between">
              <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center text-primary">
                <Clock className="w-5 h-5" />
              </div>
              <div className="mt-4">
                <span className="text-slate-400 text-xs font-bold uppercase tracking-wider block">Action Required</span>
                <h4 className="text-3xl font-extrabold text-slate-800 tracking-tight mt-1">{actionRequired}</h4>
              </div>
              <button onClick={() => setFilter("action")} className="text-xs font-bold text-primary hover:underline mt-4 flex items-center gap-1">
                View Requests <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col justify-between">
              <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center text-purple-600">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div className="mt-4">
                <span className="text-slate-400 text-xs font-bold uppercase tracking-wider block">Negotiations</span>
                <h4 className="text-3xl font-extrabold text-slate-800 tracking-tight mt-1">{activeNegotiations}</h4>
              </div>
              <button onClick={() => setFilter("negotiating")} className="text-xs font-bold text-purple-600 hover:underline mt-4 flex items-center gap-1">
                View Threads <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col justify-between">
              <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center text-green-600">
                <UserCheck className="w-5 h-5" />
              </div>
              <div className="mt-4">
                <span className="text-slate-400 text-xs font-bold uppercase tracking-wider block">Est. Commission</span>
                <h4 className="text-3xl font-extrabold text-slate-800 tracking-tight mt-1">₹{totalCommissions.toLocaleString("en-IN")}</h4>
              </div>
              <Link href="/b2b/manage-commission" className="text-xs font-bold text-green-600 hover:underline mt-4 flex items-center gap-1">
                Commission Slab <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>

        {/* Row 2: MMT myPartner Booking Monitor & Filters */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8 flex flex-col gap-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-xl font-bold text-slate-800">B2B Group Bookings Monitor</h2>
              <p className="text-slate-400 text-xs font-semibold mt-1">Real-time status queue of active airline groups</p>
            </div>
            
            {/* Queue Filter Tabs */}
            <div className="flex flex-wrap gap-2 border-b border-slate-100 w-full sm:w-auto pb-2 sm:pb-0">
              {[
                { id: "all", label: "All Queue" },
                { id: "action", label: `Action Required (${actionRequired})` },
                { id: "negotiating", label: `Negotiations (${activeNegotiations})` },
                { id: "confirmed", label: "Confirmed / Completed" },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setFilter(tab.id)}
                  className={`px-4 py-2 rounded-full text-xs font-bold transition-all border ${
                    filter === tab.id 
                      ? "bg-slate-900 border-slate-900 text-white" 
                      : "bg-white border-slate-200 text-slate-500 hover:text-slate-700 hover:border-slate-300"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Booking Data Grid / Table */}
          {loading ? (
            <div className="flex items-center justify-center py-16 text-slate-400 font-bold">
              Fetching active bookings queue...
            </div>
          ) : filteredRequests.length === 0 ? (
            <div className="text-center py-20 bg-slate-50 rounded-xl border border-dashed border-slate-200 flex flex-col items-center">
              <FileText className="w-12 h-12 text-slate-300 mb-3" />
              <h4 className="text-slate-700 font-bold text-lg">No Group Travel requests found</h4>
              <p className="text-slate-400 text-sm mt-1 max-w-sm">
                There are no group requests under this filter category. Click "New Group Booking" to create one.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto w-full no-scrollbar">
              <table className="w-full min-w-[900px] border-collapse text-left text-sm font-medium">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-bold text-xs uppercase tracking-wider pb-3">
                    <th className="pb-3 pr-4">Request / Group Name</th>
                    <th className="pb-3 pr-4">Flight Sector</th>
                    <th className="pb-3 pr-4">Travel Date</th>
                    <th className="pb-3 pr-4">Seats Count</th>
                    <th className="pb-3 pr-4">Target / Accepted Fare</th>
                    <th className="pb-3 pr-4">Timeline Status</th>
                    <th className="pb-3 text-right">Quick Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredRequests.map(req => {
                    const badge = getStatusBadge(req.status);
                    const totalPax = req.adults + req.children + req.infants;
                    const displayFare = req.status !== "NEW_REQUEST" && req.quotes.find(q => q.is_selected)
                      ? `₹${parseFloat(req.expectedFare).toLocaleString("en-IN")}`
                      : `₹${parseFloat(req.expectedFare).toLocaleString("en-IN")} (Target)`;
                    
                    return (
                      <tr key={req.id} className="hover:bg-slate-50/50 transition-colors group">
                        {/* Column 1: Group Name */}
                        <td className="py-4 pr-4">
                          <span className="font-extrabold text-slate-800 text-[15px] group-hover:text-primary transition-colors block">
                            {req.groupName}
                          </span>
                          <span className="text-slate-400 text-xs font-semibold block mt-0.5">
                            {req.requestId}
                          </span>
                        </td>
                        
                        {/* Column 2: Sector */}
                        <td className="py-4 pr-4">
                          <div className="flex items-center gap-1.5 font-bold text-slate-800">
                            <span>{req.origin}</span>
                            <span className="text-[#D60D26] text-xs">✈</span>
                            <span>{req.destination}</span>
                          </div>
                          <span className="text-slate-400 text-xs font-semibold uppercase block mt-0.5">
                            {req.cabin}
                          </span>
                        </td>

                        {/* Column 3: Travel Date */}
                        <td className="py-4 pr-4">
                          <span className="font-bold text-slate-700">{req.departureDate}</span>
                          {req.returnDate && (
                            <span className="text-slate-400 text-xs block font-semibold mt-0.5">
                              Ret: {req.returnDate}
                            </span>
                          )}
                        </td>

                        {/* Column 4: Pax Count */}
                        <td className="py-4 pr-4 font-bold text-slate-700">
                          {totalPax} Seats
                        </td>

                        {/* Column 5: Fare details */}
                        <td className="py-4 pr-4 font-extrabold text-slate-800">
                          {displayFare}
                        </td>

                        {/* Column 6: Timeline Status */}
                        <td className="py-4 pr-4">
                          <span className={`inline-block border px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${badge.bg}`}>
                            {badge.label}
                          </span>
                        </td>

                        {/* Column 7: Quick Actions */}
                        <td className="py-4 text-right">
                          <div className="flex justify-end gap-2">
                            {req.status === "FARE_QUOTED" && (
                              <Link href={`/b2b/group-travel/view-request?id=${req.requestId}`}>
                                <Button className="bg-[#D60D26]/10 hover:bg-[#D60D26] hover:text-white border border-[#D60D26]/20 text-[#D60D26] font-bold text-xs px-3.5 py-1.5 h-auto rounded-full transition-all">
                                  Review Quotes
                                </Button>
                              </Link>
                            )}
                            {req.status === "PAYMENT_PENDING" && (
                              <Link href={`/b2b/group-travel/make-payment?id=${req.requestId}`}>
                                <Button className="bg-red-600 text-white font-bold text-xs px-4 py-1.5 h-auto rounded-full hover:bg-red-700 transition-all shadow-sm">
                                  Pay Deposit
                                </Button>
                              </Link>
                            )}
                            {req.status === "PARTIALLY_PAID" && (
                              <Link href={`/b2b/group-travel/make-payment?id=${req.requestId}`}>
                                <Button className="bg-orange-600 text-white font-bold text-xs px-4 py-1.5 h-auto rounded-full hover:bg-orange-700 transition-all shadow-sm">
                                  Pay Balance
                                </Button>
                              </Link>
                            )}
                            {req.status === "PNR_CREATED" && (
                              <Link href={`/b2b/group-travel/add-passenger?id=${req.requestId}`}>
                                <Button className="bg-blue-600 text-white font-bold text-xs px-3.5 py-1.5 h-auto rounded-full hover:bg-blue-700 transition-all shadow-sm">
                                  Add Passengers
                                </Button>
                              </Link>
                            )}
                            {!["FARE_QUOTED", "PAYMENT_PENDING", "PARTIALLY_PAID", "PNR_CREATED"].includes(req.status) && (
                              <Link href={`/b2b/group-travel/view-request?id=${req.requestId}`}>
                                <Button variant="outline" className="font-bold text-xs px-3.5 py-1.5 h-auto rounded-full border-slate-300 text-slate-600 hover:bg-slate-50 transition-all">
                                  View Details
                                </Button>
                              </Link>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </main>

      <Footer />
    </div>
  );
}
