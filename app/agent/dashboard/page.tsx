"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Logo } from "@/components/ui/logo";
import { Button } from "@/components/ui/button";
import {
  LogOut,
  User as UserIcon,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  Clock,
  Plane,
  Calendar,
  IndianRupee,
  Users,
  AlertCircle,
  Undo2,
} from "lucide-react";

interface InventoryItem {
  id: number;
  airline_code: string;
  airline_name: string;
  flight_number: string;
  origin: string;
  destination: string;
  departure_datetime: string;
  arrival_datetime: string;
  price: string;
  seats_available: number;
  cabin_class: string;
  duration: string;
  is_refundable: boolean;
  baggage_check_in: string;
  baggage_hand: string;
  agent_username: string;
}

interface PassengerData {
  title: string;
  first_name: string;
  last_name: string;
  gender: string;
  dob?: string;
  passport_number?: string;
  pancard_number?: string;
}

interface TicketItem {
  id: number;
  user: number;
  pnr_number: string | null;
  ticket_number: string | null;
  booking_ref: string | null;
  flight_id: string | null;
  status: string;
  origin: string;
  destination: string;
  departure_datetime: string;
  arrival_datetime: string;
  travel_type: number;
  airline_code: string;
  airline_name: string;
  flight_number: string;
  cabin_class: string;
  basic_amount: string;
  tax_amount: string;
  total_amount: string;
  currency: string;
  baggage_check_in: string;
  baggage_hand: string;
  is_refundable: boolean;
  food_onboard: string;
  passengers_data: PassengerData[];
  agent_cancellation_reason?: string | null;
  cancellation_data?: any;
  created_at: string;
}

const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8001/api/v1";

export default function AgentDashboardPage() {
  const router = useRouter();
  const { user, access, isLoading, logout } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<"inventory" | "bookings">("inventory");

  // State for Inventory CRUD
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [inventoryError, setInventoryError] = useState<string | null>(null);
  const [inventorySuccess, setInventorySuccess] = useState<string | null>(null);

  // Form Fields State
  const [airlineCode, setAirlineCode] = useState("6E");
  const [airlineName, setAirlineName] = useState("IndiGo");
  const [flightNumber, setFlightNumber] = useState("");
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [departureDatetime, setDepartureDatetime] = useState("");
  const [arrivalDatetime, setArrivalDatetime] = useState("");
  const [price, setPrice] = useState("");
  const [seatsAvailable, setSeatsAvailable] = useState(10);
  const [cabinClass, setCabinClass] = useState("Economy");
  const [duration, setDuration] = useState("2h 0m");
  const [isRefundable, setIsRefundable] = useState(true);
  const [baggageCheckIn, setBaggageCheckIn] = useState("15 Kg");
  const [baggageHand, setBaggageHand] = useState("7 Kg");

  // State for Booking Requests
  const [tickets, setTickets] = useState<TicketItem[]>([]);
  const [bookingsError, setBookingsError] = useState<string | null>(null);
  const [bookingsSuccess, setBookingsSuccess] = useState<string | null>(null);

  // Fulfill/Cancel inline state
  const [fulfillingTicketId, setFulfillingTicketId] = useState<number | null>(null);
  const [pnrNumber, setPnrNumber] = useState("");
  const [ticketNumber, setTicketNumber] = useState("");

  const [cancellingTicketId, setCancellingTicketId] = useState<number | null>(null);
  const [cancelRemarks, setCancelRemarks] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  // Role Gate & Redirection
  useEffect(() => {
    if (mounted && !isLoading) {
      if (!user) {
        router.replace("/agent/login");
      } else if (user.role !== "AGENT" && user.role !== "ADMIN") {
        router.replace("/");
      }
    }
  }, [user, isLoading, mounted, router]);

  // Load Initial Data
  useEffect(() => {
    if (mounted && user && access) {
      fetchInventory();
      fetchBookings();
    }
  }, [mounted, user, access]);

  const fetchInventory = async () => {
    try {
      const res = await fetch(`${apiBase}/flights/inventory/`, {
        headers: {
          Authorization: `Bearer ${access}`,
        },
      });
      if (!res.ok) throw new Error("Failed to fetch inventory");
      let data = await res.json();
      if (data && data.success && data.data !== undefined) {
        data = data.data;
      }
      setInventory(Array.isArray(data) ? data : data.results || []);
    } catch (err: any) {
      setInventoryError(err.message || "Failed to load inventory");
    }
  };

  const fetchBookings = async () => {
    try {
      const res = await fetch(`${apiBase}/tickets/`, {
        headers: {
          Authorization: `Bearer ${access}`,
        },
      });
      if (!res.ok) throw new Error("Failed to fetch bookings");
      let data = await res.json();
      if (data && data.success && data.data !== undefined) {
        data = data.data;
      }
      const rawList = Array.isArray(data) ? data : data.results || [];
      // Filter only tickets that belong to this agent's inventory
      // (The backend get_queryset filters already, but we make sure they are offline bookings)
      const agentBookings = rawList.filter((ticket: any) => ticket.booking_ref && ticket.booking_ref.startsWith("FBA"));
      setTickets(agentBookings);
    } catch (err: any) {
      setBookingsError(err.message || "Failed to load booking requests");
    }
  };

  const handleLogout = () => {
    logout();
    router.push("/agent/login");
  };

  // Submit Inventory Form (Create / Update)
  const handleInventorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setInventoryError(null);
    setInventorySuccess(null);

    const payload = {
      airline_code: airlineCode.trim().toUpperCase(),
      airline_name: airlineName.trim(),
      flight_number: flightNumber.trim(),
      origin: origin.trim().toUpperCase(),
      destination: destination.trim().toUpperCase(),
      departure_datetime: new Date(departureDatetime).toISOString(),
      arrival_datetime: new Date(arrivalDatetime).toISOString(),
      price: parseFloat(price),
      seats_available: seatsAvailable,
      cabin_class: cabinClass,
      duration: duration.trim(),
      is_refundable: isRefundable,
      baggage_check_in: baggageCheckIn.trim(),
      baggage_hand: baggageHand.trim(),
    };

    try {
      const url = editingItem
        ? `${apiBase}/flights/inventory/${editingItem.id}/`
        : `${apiBase}/flights/inventory/`;
      const method = editingItem ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${access}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || "Failed to save inventory item");
      }

      setInventorySuccess(
        editingItem ? "Inventory flight updated successfully!" : "Inventory flight added successfully!"
      );
      resetInventoryForm();
      fetchInventory();
    } catch (err: any) {
      setInventoryError(err.message || "Operation failed");
    }
  };

  const resetInventoryForm = () => {
    setEditingItem(null);
    setShowAddForm(false);
    setAirlineCode("6E");
    setAirlineName("IndiGo");
    setFlightNumber("");
    setOrigin("");
    setDestination("");
    setDepartureDatetime("");
    setArrivalDatetime("");
    setPrice("");
    setSeatsAvailable(10);
    setCabinClass("Economy");
    setDuration("2h 0m");
    setIsRefundable(true);
    setBaggageCheckIn("15 Kg");
    setBaggageHand("7 Kg");
  };

  const handleEditClick = (item: InventoryItem) => {
    setEditingItem(item);
    setShowAddForm(true);
    setAirlineCode(item.airline_code);
    setAirlineName(item.airline_name);
    setFlightNumber(item.flight_number);
    setOrigin(item.origin);
    setDestination(item.destination);
    
    // Format ISO dates to match datetime-local value (YYYY-MM-DDTHH:MM)
    const depDateStr = new Date(item.departure_datetime).toISOString().slice(0, 16);
    const arrDateStr = new Date(item.arrival_datetime).toISOString().slice(0, 16);
    
    setDepartureDatetime(depDateStr);
    setArrivalDatetime(arrDateStr);
    setPrice(item.price);
    setSeatsAvailable(item.seats_available);
    setCabinClass(item.cabin_class);
    setDuration(item.duration);
    setIsRefundable(item.is_refundable);
    setBaggageCheckIn(item.baggage_check_in);
    setBaggageHand(item.baggage_hand);
  };

  const handleDeleteClick = async (id: number) => {
    if (!confirm("Are you sure you want to delete this inventory item?")) return;
    setInventoryError(null);
    setInventorySuccess(null);
    try {
      const res = await fetch(`${apiBase}/flights/inventory/${id}/`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${access}`,
        },
      });
      if (!res.ok) throw new Error("Failed to delete inventory item");
      setInventorySuccess("Flight deleted successfully.");
      fetchInventory();
    } catch (err: any) {
      setInventoryError(err.message || "Deletion failed");
    }
  };

  // Fulfill Booking Action
  const handleFulfillSubmit = async (ticketId: number) => {
    setBookingsError(null);
    setBookingsSuccess(null);
    if (!pnrNumber.trim() || !ticketNumber.trim()) {
      setBookingsError("Please enter both PNR and Ticket numbers.");
      return;
    }

    try {
      const res = await fetch(`${apiBase}/tickets/${ticketId}/agent-fulfill/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${access}`,
        },
        body: JSON.stringify({
          pnr_number: pnrNumber.trim(),
          ticket_number: ticketNumber.trim(),
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || "Fulfillment failed.");
      }

      setBookingsSuccess("Booking request fulfilled and PNR issued!");
      setFulfillingTicketId(null);
      setPnrNumber("");
      setTicketNumber("");
      fetchBookings();
    } catch (err: any) {
      setBookingsError(err.message || "Fulfillment failed");
    }
  };

  // Cancel Booking Action
  const handleCancelSubmit = async (ticketId: number) => {
    setBookingsError(null);
    setBookingsSuccess(null);
    if (!cancelRemarks.trim()) {
      setBookingsError("Please enter a reason for cancellation.");
      return;
    }

    try {
      const res = await fetch(`${apiBase}/tickets/${ticketId}/agent-cancel/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${access}`,
        },
        body: JSON.stringify({
          remarks: cancelRemarks.trim(),
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || "Cancellation failed.");
      }

      setBookingsSuccess("Booking request rejected / cancelled.");
      setCancellingTicketId(null);
      setCancelRemarks("");
      fetchBookings();
    } catch (err: any) {
      setBookingsError(err.message || "Cancellation failed");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return (
          <span className="bg-amber-100 border border-amber-200 text-amber-800 px-3 py-1 rounded-full text-xs font-black flex items-center gap-1.5 self-start shadow-sm">
            <Clock className="w-3.5 h-3.5" />
            PENDING APPROVAL
          </span>
        );
      case "CONFIRMED":
        return (
          <span className="bg-emerald-100 border border-emerald-200 text-emerald-800 px-3 py-1 rounded-full text-xs font-black flex items-center gap-1.5 self-start shadow-sm">
            <CheckCircle2 className="w-3.5 h-3.5" />
            CONFIRMED / PNR ISSUED
          </span>
        );
      case "CANCELLED":
        return (
          <span className="bg-rose-100 border border-rose-200 text-rose-800 px-3 py-1 rounded-full text-xs font-black flex items-center gap-1.5 self-start shadow-sm">
            <XCircle className="w-3.5 h-3.5" />
            CANCELLED / REJECTED
          </span>
        );
      default:
        return (
          <span className="bg-slate-100 border border-slate-200 text-slate-800 px-3 py-1 rounded-full text-xs font-black flex items-center gap-1.5 self-start shadow-sm">
            {status}
          </span>
        );
    }
  };

  if (!mounted || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F2FBFF]">
        <div className="flex flex-col items-center gap-3">
          <svg className="animate-spin w-8 h-8 text-[#D60D26]" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
          <span className="text-slate-500 text-sm font-semibold">Loading agent workspace...</span>
        </div>
      </div>
    );
  }

  if (user && user.role !== "AGENT" && user.role !== "ADMIN") {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#F2FBFF] text-[#0C2342] flex flex-col font-sans">
      {/* Header */}
      <header className="sticky top-0 w-full z-50 bg-white border-b border-slate-200 shadow-md">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center h-20">
          <div className="flex items-center gap-3">
            <Logo className="scale-110" />
            <div>
              <h1 className="text-lg font-black tracking-tight leading-none text-[#0C2342]">
                My Travel Deal
              </h1>
              <span className="text-[10px] font-bold text-[#D60D26] uppercase tracking-[0.2em] block mt-0.5">
                Agent Desk
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex flex-col text-right">
              <span className="text-sm font-bold text-[#0C2342]">{user?.name}</span>
              <span className="text-xs text-slate-500 font-semibold">{user?.email}</span>
            </div>

            <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-[#0C2342]">
              <UserIcon className="w-5 h-5" />
            </div>

            <Button
              onClick={handleLogout}
              variant="outline"
              className="border-slate-200 bg-white text-slate-700 hover:bg-rose-50 hover:text-[#D60D26] hover:border-rose-200 rounded-full px-4"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="container mx-auto px-4 py-8 max-w-6xl flex-1">
        {/* Title */}
        <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-3xl font-black tracking-tight mb-1">Agent Panel</h2>
            <p className="text-slate-500 font-medium">
              Manage your pre-purchased flight inventory and fulfill customer booking requests.
            </p>
          </div>

          {/* Tab Selection */}
          <div className="bg-white border border-slate-200 p-1 rounded-full flex shadow-sm">
            <button
              onClick={() => setActiveTab("inventory")}
              className={`px-5 py-2 rounded-full text-sm font-bold transition-all ${
                activeTab === "inventory"
                  ? "bg-[#0C2342] text-white"
                  : "text-slate-500 hover:text-[#0C2342]"
              }`}
            >
              My Flight Inventory
            </button>
            <button
              onClick={() => setActiveTab("bookings")}
              className={`px-5 py-2 rounded-full text-sm font-bold transition-all relative ${
                activeTab === "bookings"
                  ? "bg-[#0C2342] text-white"
                  : "text-slate-500 hover:text-[#0C2342]"
              }`}
            >
              Booking Requests
              {tickets.filter((t) => t.status === "PENDING").length > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#D60D26] text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold border-2 border-white animate-bounce">
                  {tickets.filter((t) => t.status === "PENDING").length}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Tab 1: Flight Inventory */}
        {activeTab === "inventory" && (
          <div className="flex flex-col gap-6">
            {/* Action Bar */}
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-black text-[#0C2342]">Active Inventory List</h3>
              {!showAddForm && (
                <Button
                  onClick={() => router.push("/sale/inventory/new")}
                  className="bg-[#D60D26] hover:bg-[#b00b1e] text-white rounded-full font-bold px-5 flex items-center gap-2 shadow-md hover:shadow-lg transition-all"
                >
                  <Plus className="w-4 h-4" />
                  Add Pre-purchased Flight
                </Button>
              )}
            </div>

            {/* Inventory Alerts */}
            {inventoryError && (
              <div className="bg-rose-50 border border-rose-200 text-[#D60D26] p-4 rounded-xl flex items-start gap-3">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <span className="font-semibold text-sm">{inventoryError}</span>
              </div>
            )}
            {inventorySuccess && (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-xl flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
                <span className="font-semibold text-sm">{inventorySuccess}</span>
              </div>
            )}

            {/* Creation Form */}
            {showAddForm && (
              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-md animate-in fade-in slide-in-from-top-4 duration-300">
                <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
                  <h4 className="text-lg font-black text-[#0C2342]">
                    {editingItem ? "Edit Inventory Flight Details" : "List New Pre-purchased Flight"}
                  </h4>
                  <Button
                    onClick={resetInventoryForm}
                    variant="ghost"
                    className="text-slate-400 hover:text-slate-600 rounded-full font-bold px-3"
                  >
                    Cancel
                  </Button>
                </div>

                <form onSubmit={handleInventorySubmit} className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                      Airline Name
                    </label>
                    <input
                      type="text"
                      required
                      value={airlineName}
                      onChange={(e) => setAirlineName(e.target.value)}
                      placeholder="e.g. IndiGo"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 font-semibold text-sm focus:outline-none focus:border-slate-400 text-[#0C2342]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                      Airline IATA Code
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={3}
                      value={airlineCode}
                      onChange={(e) => setAirlineCode(e.target.value)}
                      placeholder="e.g. 6E"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 font-semibold text-sm focus:outline-none focus:border-slate-400 text-[#0C2342]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                      Flight Number
                    </label>
                    <input
                      type="text"
                      required
                      value={flightNumber}
                      onChange={(e) => setFlightNumber(e.target.value)}
                      placeholder="e.g. 6E-2012"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 font-semibold text-sm focus:outline-none focus:border-slate-400 text-[#0C2342]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                      Origin (IATA)
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={3}
                      value={origin}
                      onChange={(e) => setOrigin(e.target.value)}
                      placeholder="e.g. DEL"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 font-semibold text-sm focus:outline-none focus:border-slate-400 text-[#0C2342] uppercase"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                      Destination (IATA)
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={3}
                      value={destination}
                      onChange={(e) => setDestination(e.target.value)}
                      placeholder="e.g. BOM"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 font-semibold text-sm focus:outline-none focus:border-slate-400 text-[#0C2342] uppercase"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                      Cabin Class
                    </label>
                    <select
                      value={cabinClass}
                      onChange={(e) => setCabinClass(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 font-semibold text-sm focus:outline-none focus:border-slate-400 text-[#0C2342]"
                    >
                      <option value="Economy">Economy</option>
                      <option value="Business">Business</option>
                      <option value="Premium Economy">Premium Economy</option>
                      <option value="First">First Class</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                      Departure Date & Time
                    </label>
                    <input
                      type="datetime-local"
                      required
                      value={departureDatetime}
                      onChange={(e) => setDepartureDatetime(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 font-semibold text-sm focus:outline-none focus:border-slate-400 text-[#0C2342]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                      Arrival Date & Time
                    </label>
                    <input
                      type="datetime-local"
                      required
                      value={arrivalDatetime}
                      onChange={(e) => setArrivalDatetime(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 font-semibold text-sm focus:outline-none focus:border-slate-400 text-[#0C2342]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                      Flight Duration
                    </label>
                    <input
                      type="text"
                      required
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                      placeholder="e.g. 2h 0m"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 font-semibold text-sm focus:outline-none focus:border-slate-400 text-[#0C2342]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                      Fare Price (INR)
                    </label>
                    <input
                      type="number"
                      required
                      min={0}
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder="e.g. 4500"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 font-semibold text-sm focus:outline-none focus:border-slate-400 text-[#0C2342]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                      Seats Available
                    </label>
                    <input
                      type="number"
                      required
                      min={1}
                      value={seatsAvailable}
                      onChange={(e) => setSeatsAvailable(parseInt(e.target.value))}
                      placeholder="e.g. 10"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 font-semibold text-sm focus:outline-none focus:border-slate-400 text-[#0C2342]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                      Refundability
                    </label>
                    <div className="flex items-center h-11">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isRefundable}
                          onChange={(e) => setIsRefundable(e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0C2342]"></div>
                        <span className="ml-3 text-sm font-bold text-slate-700">
                          {isRefundable ? "Refundable" : "Non-Refundable"}
                        </span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                      Check-in Baggage Limit
                    </label>
                    <input
                      type="text"
                      required
                      value={baggageCheckIn}
                      onChange={(e) => setBaggageCheckIn(e.target.value)}
                      placeholder="e.g. 15 Kg"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 font-semibold text-sm focus:outline-none focus:border-slate-400 text-[#0C2342]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                      Hand Baggage Limit
                    </label>
                    <input
                      type="text"
                      required
                      value={baggageHand}
                      onChange={(e) => setBaggageHand(e.target.value)}
                      placeholder="e.g. 7 Kg"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 font-semibold text-sm focus:outline-none focus:border-slate-400 text-[#0C2342]"
                    />
                  </div>

                  <div className="md:col-span-3 flex justify-end gap-3 mt-4">
                    <Button
                      type="button"
                      onClick={resetInventoryForm}
                      variant="outline"
                      className="border-slate-200 bg-white text-slate-700 rounded-full font-bold px-6"
                    >
                      Reset Form
                    </Button>
                    <Button
                      type="submit"
                      className="bg-[#0C2342] hover:bg-[#12315b] text-white rounded-full font-bold px-8 shadow-md"
                    >
                      {editingItem ? "Update Flight" : "Create Listing"}
                    </Button>
                  </div>
                </form>
              </div>
            )}

            {/* Inventory List */}
            {inventory.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center shadow-sm">
                <Plane className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <h4 className="text-xl font-bold text-slate-700 mb-1">No flights listed yet</h4>
                <p className="text-slate-400 font-semibold mb-6 max-w-sm mx-auto">
                  You have not added any pre-purchased flight blocks. Click "Add Pre-purchased Flight" above to start selling seats.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {inventory.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden flex flex-col justify-between"
                  >
                    <div>
                      {/* Top Bar */}
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-2">
                          <span className="text-[#D60D26] font-black text-sm tracking-wider uppercase border border-red-100 bg-red-50/50 px-2.5 py-0.5 rounded-md">
                            {item.airline_name}
                          </span>
                          <span className="text-slate-400 font-bold text-xs">
                            {item.flight_number}
                          </span>
                        </div>
                        <span className="text-lg font-black text-[#0C2342]">
                          ₹{parseFloat(item.price).toLocaleString("en-IN")}
                        </span>
                      </div>

                      {/* Route Details */}
                      <div className="flex justify-between items-center bg-[#F2FBFF] border border-slate-100 rounded-2xl p-4 mb-4">
                        <div className="text-center">
                          <span className="text-2xl font-black text-[#0C2342] tracking-tight block">
                            {item.origin}
                          </span>
                          <span className="text-[10px] text-slate-400 font-bold uppercase block mt-1">
                            Departure
                          </span>
                        </div>

                        <div className="flex flex-col items-center flex-1 mx-4">
                          <span className="text-xs text-slate-400 font-bold mb-1">
                            {item.duration}
                          </span>
                          <div className="w-full h-[2px] bg-slate-200 relative flex items-center justify-center">
                            <Plane className="w-4 h-4 text-slate-400 absolute rotate-90 transform" />
                          </div>
                          <span className="text-[10px] text-slate-400 font-bold mt-1">
                            {item.cabin_class}
                          </span>
                        </div>

                        <div className="text-center">
                          <span className="text-2xl font-black text-[#0C2342] tracking-tight block">
                            {item.destination}
                          </span>
                          <span className="text-[10px] text-slate-400 font-bold uppercase block mt-1">
                            Arrival
                          </span>
                        </div>
                      </div>

                      {/* Datetimes & Seats */}
                      <div className="grid grid-cols-2 gap-4 text-xs font-semibold text-slate-500 mb-4 border-b border-slate-100 pb-4">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-[#0C2342]/70 shrink-0" />
                          <span>
                            {new Date(item.departure_datetime).toLocaleString("en-IN", {
                              day: "numeric",
                              month: "short",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-[#0C2342]/70 shrink-0" />
                          <span>
                            {item.seats_available} seats available
                          </span>
                        </div>
                      </div>

                      {/* Baggage info */}
                      <div className="flex flex-wrap gap-2 mb-6">
                        <span className="bg-slate-50 border border-slate-200 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded-md">
                          Check-in: {item.baggage_check_in}
                        </span>
                        <span className="bg-slate-50 border border-slate-200 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded-md">
                          Cabin: {item.baggage_hand}
                        </span>
                        {item.is_refundable ? (
                          <span className="bg-emerald-50 border border-emerald-100 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-md">
                            Refundable
                          </span>
                        ) : (
                          <span className="bg-rose-50 border border-rose-100 text-rose-700 text-[10px] font-bold px-2 py-0.5 rounded-md">
                            Non-Refundable
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
                      <Button
                        onClick={() => handleEditClick(item)}
                        variant="outline"
                        className="border-slate-200 text-slate-600 hover:bg-slate-50 rounded-full font-bold px-4 py-1.5 text-xs h-auto"
                      >
                        <Edit2 className="w-3.5 h-3.5 mr-1.5" />
                        Edit
                      </Button>
                      <Button
                        onClick={() => handleDeleteClick(item.id)}
                        variant="outline"
                        className="border-rose-100 text-rose-600 hover:bg-rose-50 rounded-full font-bold px-4 py-1.5 text-xs h-auto"
                      >
                        <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                        Delete
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Booking Requests */}
        {activeTab === "bookings" && (
          <div className="flex flex-col gap-6">
            <h3 className="text-xl font-black text-[#0C2342]">Offline Seat Purchases Queue</h3>

            {/* Booking Alerts */}
            {bookingsError && (
              <div className="bg-rose-50 border border-rose-200 text-[#D60D26] p-4 rounded-xl flex items-start gap-3">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <span className="font-semibold text-sm">{bookingsError}</span>
              </div>
            )}
            {bookingsSuccess && (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-xl flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
                <span className="font-semibold text-sm">{bookingsSuccess}</span>
              </div>
            )}

            {tickets.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center shadow-sm">
                <Users className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <h4 className="text-xl font-bold text-slate-700 mb-1">No booking requests</h4>
                <p className="text-slate-400 font-semibold max-w-sm mx-auto">
                  When a customer books seats from your pre-purchased flight listings, the booking requests will appear here for fulfillment.
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-6">
                {tickets.map((ticket) => (
                  <div
                    key={ticket.id}
                    className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col gap-6 animate-in fade-in duration-300"
                  >
                    {/* Top Row: Ref, Status, Price */}
                    <div className="flex flex-wrap justify-between items-start gap-4 border-b border-slate-100 pb-4">
                      <div className="flex flex-col">
                        <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">
                          Request Ref
                        </span>
                        <span className="text-base font-black text-[#0C2342]">
                          {ticket.booking_ref}
                        </span>
                      </div>

                      {getStatusBadge(ticket.status)}

                      <div className="flex flex-col text-right">
                        <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">
                          Total Price
                        </span>
                        <span className="text-lg font-black text-[#0C2342]">
                          ₹{parseFloat(ticket.total_amount).toLocaleString("en-IN")}
                        </span>
                      </div>
                    </div>

                    {/* Flight Details Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                      {/* Sector */}
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center text-[#0C2342]">
                          <Plane className="w-5 h-5" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs text-slate-400 font-bold uppercase">Route</span>
                          <span className="text-sm font-black text-[#0C2342]">
                            {ticket.origin} ➔ {ticket.destination}
                          </span>
                        </div>
                      </div>

                      {/* Flight Number */}
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center text-[#0C2342]">
                          <Clock className="w-5 h-5" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs text-slate-400 font-bold uppercase">Flight</span>
                          <span className="text-sm font-black text-[#0C2342]">
                            {ticket.airline_name} ({ticket.flight_number})
                          </span>
                        </div>
                      </div>

                      {/* Departure Date */}
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center text-[#0C2342]">
                          <Calendar className="w-5 h-5" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs text-slate-400 font-bold uppercase">Departure</span>
                          <span className="text-sm font-black text-[#0C2342]">
                            {new Date(ticket.departure_datetime).toLocaleString("en-IN", {
                              day: "numeric",
                              month: "short",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                      </div>

                      {/* Passengers count */}
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center text-[#0C2342]">
                          <Users className="w-5 h-5" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs text-slate-400 font-bold uppercase">Passengers</span>
                          <span className="text-sm font-black text-[#0C2342]">
                            {ticket.passengers_data.length} PAX
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Passenger Manifest */}
                    <div className="bg-slate-50/50 border border-slate-200 rounded-2xl p-4">
                      <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider block mb-3">
                        Passenger Manifest
                      </span>
                      <div className="flex flex-col gap-2">
                        {ticket.passengers_data.map((pax, pIdx) => (
                          <div
                            key={pIdx}
                            className="bg-white border border-slate-200 rounded-xl px-4 py-2 flex flex-wrap justify-between items-center text-xs font-bold gap-4"
                          >
                            <span className="text-[#0C2342]">
                              {pax.title} {pax.first_name} {pax.last_name}
                            </span>
                            <div className="flex gap-4 text-slate-500">
                              <span>Gender: {pax.gender === "M" ? "Male" : "Female"}</span>
                              {pax.dob && <span>DOB: {pax.dob}</span>}
                              {pax.passport_number && (
                                <span>Passport: {pax.passport_number}</span>
                              )}
                              {pax.pancard_number && (
                                <span>PAN: {pax.pancard_number}</span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Conditional display based on Status */}
                    {ticket.status === "CONFIRMED" && (
                      <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl p-4 flex justify-between items-center">
                        <div className="text-xs font-bold">
                          <span className="text-emerald-600 block uppercase font-black tracking-wider text-[9px] mb-1">
                            Issued Ticket Details
                          </span>
                          <span className="mr-6">Airline PNR: <strong className="text-[#0C2342] text-sm font-black">{ticket.pnr_number}</strong></span>
                          <span>Ticket Number: <strong className="text-[#0C2342] text-sm font-black">{ticket.ticket_number}</strong></span>
                        </div>
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                      </div>
                    )}

                    {ticket.status === "CANCELLED" && (
                      <div className="bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl p-4 flex justify-between items-start gap-4">
                        <div className="text-xs font-bold">
                          <span className="text-[#D60D26] block uppercase font-black tracking-wider text-[9px] mb-1">
                            Cancellation Reason / Remarks
                          </span>
                          <p className="text-slate-700 text-sm font-medium mt-1 leading-relaxed">
                            {ticket.agent_cancellation_reason || ticket.cancellation_data?.remarks || "Cancelled by Agent / User."}
                          </p>
                        </div>
                        <XCircle className="w-5 h-5 text-[#D60D26] shrink-0 mt-0.5" />
                      </div>
                    )}

                    {ticket.status === "PENDING" && (
                      <div className="border-t border-slate-100 pt-4 flex flex-col gap-4">
                        {/* Interactive Action Buttons */}
                        {fulfillingTicketId !== ticket.id && cancellingTicketId !== ticket.id && (
                          <div className="flex justify-end gap-3">
                            <Button
                              onClick={() => {
                                setCancellingTicketId(ticket.id);
                                setCancelRemarks("");
                              }}
                              variant="outline"
                              className="border-rose-200 text-[#D60D26] hover:bg-rose-50 rounded-full font-bold px-6"
                            >
                              Reject Booking
                            </Button>
                            <Button
                              onClick={() => {
                                setFulfillingTicketId(ticket.id);
                                setPnrNumber("");
                                setTicketNumber("");
                              }}
                              className="bg-[#0C2342] hover:bg-[#12315b] text-white rounded-full font-bold px-8"
                            >
                              Fulfill Request
                            </Button>
                          </div>
                        )}

                        {/* Fulfill Action Fields */}
                        {fulfillingTicketId === ticket.id && (
                          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 animate-in fade-in duration-300">
                            <h5 className="text-xs font-black text-[#0C2342] uppercase tracking-wider mb-3">
                              Fulfill Seat Purchase
                            </h5>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                              <div>
                                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                                  Airline PNR
                                </label>
                                <input
                                  type="text"
                                  value={pnrNumber}
                                  onChange={(e) => setPnrNumber(e.target.value)}
                                  placeholder="e.g. Z9FB32"
                                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 font-semibold text-sm focus:outline-none text-[#0C2342] uppercase"
                                />
                              </div>
                              <div>
                                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                                  Ticket Number
                                </label>
                                <input
                                  type="text"
                                  value={ticketNumber}
                                  onChange={(e) => setTicketNumber(e.target.value)}
                                  placeholder="e.g. 982-1249301290"
                                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 font-semibold text-sm focus:outline-none text-[#0C2342]"
                                />
                              </div>
                            </div>
                            <div className="flex justify-end gap-2">
                              <Button
                                onClick={() => setFulfillingTicketId(null)}
                                variant="ghost"
                                className="text-slate-500 hover:text-slate-700 font-bold rounded-full px-4 text-xs h-auto py-2"
                              >
                                Cancel
                              </Button>
                              <Button
                                onClick={() => handleFulfillSubmit(ticket.id)}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-full font-bold px-6 text-xs h-auto py-2"
                              >
                                Issue Tickets
                              </Button>
                            </div>
                          </div>
                        )}

                        {/* Cancel Action Fields */}
                        {cancellingTicketId === ticket.id && (
                          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 animate-in fade-in duration-300">
                            <h5 className="text-xs font-black text-[#0C2342] uppercase tracking-wider mb-3">
                              Reject / Cancel Booking Request
                            </h5>
                            <div className="mb-4">
                              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                                Reason for Cancellation
                              </label>
                              <input
                                type="text"
                                value={cancelRemarks}
                                onChange={(e) => setCancelRemarks(e.target.value)}
                                placeholder="e.g. Seats sold out / flight schedule changed"
                                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 font-semibold text-sm focus:outline-none text-[#0C2342]"
                              />
                            </div>
                            <div className="flex justify-end gap-2">
                              <Button
                                onClick={() => setCancellingTicketId(null)}
                                variant="ghost"
                                className="text-slate-500 hover:text-slate-700 font-bold rounded-full px-4 text-xs h-auto py-2"
                              >
                                Cancel
                              </Button>
                              <Button
                                onClick={() => handleCancelSubmit(ticket.id)}
                                className="bg-[#D60D26] hover:bg-[#b00b1e] text-white rounded-full font-bold px-6 text-xs h-auto py-2"
                              >
                                Confirm Rejection
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
