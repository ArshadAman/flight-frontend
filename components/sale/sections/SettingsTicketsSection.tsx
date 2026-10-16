"use client";

import React, { useState } from "react";
import {
  Ticket,
  Search,
  Filter,
  Download,
  Share2,
  Printer,
  RefreshCw,
  Eye,
  AlertCircle,
  CheckCircle2,
  Clock,
  X,
  FileText,
  DollarSign,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface TicketItem {
  id: string;
  ticketNumber: string;
  bookingCode: string;
  passengerName: string;
  flight: string;
  sector: string;
  travelDate: string;
  type: "Standard" | "Tax Refund" | "Medical Problem" | "Rebook" | "VOL";
  paymentStatus: "Paid" | "Pending" | "Refunded" | "Partial";
  basePrice: number;
  tax: number;
  saving: number;
  ticketFee: number;
  markup: number;
  totalAmount: number;
}

const mockTickets: TicketItem[] = [
  {
    id: "TCK-101",
    ticketNumber: "098-2451928410",
    bookingCode: "XYR9NF",
    passengerName: "CHIRGANIA / HARSHIT MR",
    flight: "Air India AI 121",
    sector: "DEL → BKK",
    travelDate: "24 Dec 2026",
    type: "Tax Refund",
    paymentStatus: "Paid",
    basePrice: 4240,
    tax: 0,
    saving: 0,
    ticketFee: 1000,
    markup: 500,
    totalAmount: 5740,
  },
  {
    id: "TCK-102",
    ticketNumber: "098-2451928411",
    bookingCode: "ABV12445",
    passengerName: "SHARMA / AMIT MR",
    flight: "IndiGo 6E 204",
    sector: "DEL → BOM",
    travelDate: "28 Oct 2026",
    type: "Standard",
    paymentStatus: "Paid",
    basePrice: 5200,
    tax: 650,
    saving: 200,
    ticketFee: 300,
    markup: 400,
    totalAmount: 6350,
  },
  {
    id: "TCK-103",
    ticketNumber: "098-2451928412",
    bookingCode: "MTD892",
    passengerName: "SINGH / NEHA MS",
    flight: "Vistara UK 814",
    sector: "BLR → DEL",
    travelDate: "02 Nov 2026",
    type: "Rebook",
    paymentStatus: "Pending",
    basePrice: 6800,
    tax: 820,
    saving: 0,
    ticketFee: 500,
    markup: 600,
    totalAmount: 8720,
  },
  {
    id: "TCK-104",
    ticketNumber: "098-2451928413",
    bookingCode: "DEP9012",
    passengerName: "VERMA / HARSHIT MR",
    flight: "SpiceJet SG 142",
    sector: "BOM → GOI",
    travelDate: "15 Nov 2026",
    type: "Medical Problem",
    paymentStatus: "Refunded",
    basePrice: 4500,
    tax: 450,
    saving: 150,
    ticketFee: 250,
    markup: 350,
    totalAmount: 5400,
  },
  {
    id: "TCK-105",
    ticketNumber: "098-2451928414",
    bookingCode: "VOL772",
    passengerName: "MEHRA / AJAY MR",
    flight: "Air India AI 308",
    sector: "DEL → LHR",
    travelDate: "20 Dec 2026",
    type: "VOL",
    paymentStatus: "Paid",
    basePrice: 38500,
    tax: 4200,
    saving: 1200,
    ticketFee: 1500,
    markup: 2500,
    totalAmount: 45500,
  },
];

export function SettingsTicketsSection() {
  const [tickets, setTickets] = useState<TicketItem[]>(mockTickets);
  const [activeTab, setActiveTab] = useState<string>("All");
  const [search, setSearch] = useState("");
  const [selectedTicket, setSelectedTicket] = useState<TicketItem | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const filtered = tickets.filter((t) => {
    if (activeTab !== "All" && t.type !== activeTab) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        t.bookingCode.toLowerCase().includes(q) ||
        t.passengerName.toLowerCase().includes(q) ||
        t.ticketNumber.toLowerCase().includes(q) ||
        t.sector.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleAction = (action: string, t: TicketItem) => {
    setToast(`${action} for Ticket #${t.ticketNumber} (${t.bookingCode})`);
    setTimeout(() => setToast(null), 3000);
  };

  return (
    <div className="space-y-5">
      {toast && (
        <div className="rounded-lg bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-md transition-all">
          ✓ {toast}
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-[#1c304a]">Tickets & E-Ticket Management</h2>
          <p className="text-xs text-slate-500">
            View, print, share, and manage all issued e-tickets, tax breakdowns, and rebooking requests.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs shadow-sm">
            <Search className="h-3.5 w-3.5 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search PNR, Ticket No..."
              className="w-36 bg-transparent outline-none sm:w-48"
            />
          </label>
        </div>
      </div>

      {/* KPI Overview matching Figma 234 Tickets sold */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-[10px] border border-[#e8ebef] bg-white p-4 shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase">Total Tickets Sold</p>
          <p className="mt-1 text-2xl font-black text-[#1c304a]">234 Tickets</p>
          <span className="text-[11px] font-semibold text-emerald-600">↑ 18.6% vs last week</span>
        </div>
        <div className="rounded-[10px] border border-[#e8ebef] bg-white p-4 shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase">Active / Standard</p>
          <p className="mt-1 text-2xl font-black text-[#006aec]">186 Tickets</p>
          <span className="text-[11px] font-semibold text-slate-500">Confirmed on GDS</span>
        </div>
        <div className="rounded-[10px] border border-[#e8ebef] bg-white p-4 shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase">Tax Refund & Rebook</p>
          <p className="mt-1 text-2xl font-black text-amber-600">32 Tickets</p>
          <span className="text-[11px] font-semibold text-amber-600">Pending Airline Action</span>
        </div>
        <div className="rounded-[10px] border border-[#e8ebef] bg-white p-4 shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase">Total Ticket Volume</p>
          <p className="mt-1 text-2xl font-black text-emerald-700">₹67,45,000</p>
          <span className="text-[11px] font-semibold text-emerald-600">All Cabin Classes</span>
        </div>
      </div>

      {/* Filter Tabs matching Figma */}
      <div className="flex flex-wrap items-center gap-2 border-b border-[#e8ebef] pb-2 text-xs font-bold">
        {["All", "Standard", "Tax Refund", "Medical Problem", "Rebook", "VOL"].map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={cn(
              "rounded-lg px-3 py-1.5 transition-all",
              activeTab === tab
                ? "bg-[#1c304a] text-white shadow-sm"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Ticket List Table */}
      <div className="overflow-hidden rounded-[10px] border border-[#e8ebef] bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-[#e8ebef] bg-slate-50/70 font-semibold text-slate-500 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="px-4 py-3">Booking Code</th>
                <th className="px-4 py-3">Ticket No</th>
                <th className="px-4 py-3">Passenger</th>
                <th className="px-4 py-3">Flight / Sector</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Payment</th>
                <th className="px-4 py-3 text-right">Total Amount</th>
                <th className="px-4 py-3 text-right">Figma Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-[#1c304a]">
              {filtered.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="px-4 py-3">
                    <span className="font-mono font-bold text-[#D60D26]">{item.bookingCode}</span>
                  </td>
                  <td className="px-4 py-3 font-mono text-slate-600 font-semibold">{item.ticketNumber}</td>
                  <td className="px-4 py-3 font-bold">{item.passengerName}</td>
                  <td className="px-4 py-3">
                    <p className="font-semibold text-[#1c304a]">{item.sector}</p>
                    <p className="text-[10px] text-slate-400">{item.flight} · {item.travelDate}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 text-[10px] font-bold border",
                        item.type === "Standard" && "bg-slate-50 text-slate-700 border-slate-200",
                        item.type === "Tax Refund" && "bg-blue-50 text-blue-700 border-blue-200",
                        item.type === "Medical Problem" && "bg-rose-50 text-rose-700 border-rose-200",
                        item.type === "Rebook" && "bg-amber-50 text-amber-700 border-amber-200",
                        item.type === "VOL" && "bg-purple-50 text-purple-700 border-purple-200"
                      )}
                    >
                      {item.type}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 text-[10px] font-bold",
                        item.paymentStatus === "Paid" && "bg-emerald-50 text-emerald-700 border border-emerald-200",
                        item.paymentStatus === "Pending" && "bg-amber-50 text-amber-700 border border-amber-200",
                        item.paymentStatus === "Refunded" && "bg-slate-100 text-slate-600 border border-slate-200",
                        item.paymentStatus === "Partial" && "bg-blue-50 text-blue-700 border border-blue-200"
                      )}
                    >
                      ● {item.paymentStatus}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-black text-emerald-700">
                    ₹{item.totalAmount.toLocaleString("en-IN")}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => setSelectedTicket(item)}
                      className="rounded border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-bold text-slate-700 hover:bg-slate-50 hover:text-[#D60D26]"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal with Exact Figma Ticket Actions & Breakdowns */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-xl bg-white p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Electronic Ticket Details
                </span>
                <h3 className="text-lg font-black text-[#1c304a]">
                  Booking #{selectedTicket.bookingCode} · Ticket #{selectedTicket.ticketNumber}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedTicket(null)}
                className="rounded-full p-1 text-slate-400 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Figma Ticket Header & Fare Breakdown */}
            <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-4 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-2">
                <div>
                  <p className="text-xs text-slate-500 font-bold">Passenger Name</p>
                  <p className="text-sm font-black text-[#1c304a]">{selectedTicket.passengerName}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-bold">Flight / Sector</p>
                  <p className="text-sm font-black text-[#1c304a]">{selectedTicket.sector} ({selectedTicket.flight})</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-bold">Travel Date</p>
                  <p className="text-sm font-bold text-slate-700">{selectedTicket.travelDate}</p>
                </div>
              </div>

              {/* Exact Fare Table from Figma line 9228 */}
              <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 text-center text-xs">
                <div className="rounded bg-white p-2 border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-400 block">Price</span>
                  <span className="font-bold text-[#1c304a]">₹{selectedTicket.basePrice}</span>
                </div>
                <div className="rounded bg-white p-2 border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-400 block">Tax</span>
                  <span className="font-bold text-[#1c304a]">₹{selectedTicket.tax}</span>
                </div>
                <div className="rounded bg-white p-2 border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-400 block">Saving</span>
                  <span className="font-bold text-emerald-600">₹{selectedTicket.saving}</span>
                </div>
                <div className="rounded bg-white p-2 border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-400 block">Ticket Fee</span>
                  <span className="font-bold text-[#1c304a]">₹{selectedTicket.ticketFee}</span>
                </div>
                <div className="rounded bg-white p-2 border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-400 block">Markup</span>
                  <span className="font-bold text-[#1c304a]">₹{selectedTicket.markup}</span>
                </div>
                <div className="rounded bg-emerald-50 p-2 border border-emerald-200">
                  <span className="text-[10px] font-bold text-emerald-800 block">Total Amount</span>
                  <span className="font-black text-emerald-700">₹{selectedTicket.totalAmount}</span>
                </div>
              </div>
            </div>

            {/* Exact Figma Disclaimer from line 9228 */}
            <div className="rounded-lg bg-amber-50/70 border border-amber-200 p-3 text-[11px] text-amber-900 space-y-1.5 leading-relaxed">
              <p>
                <strong>Important:</strong> This is an Electronic Ticket. Passengers must carry a valid photo ID for check-in at the airport. Please check your flight status at least 24 hours before flight departure.
              </p>
              <p className="text-amber-800/90 text-[10px]">
                Carriage and other services provided by the carrier are subject to conditions of carriage which are hereby incorporated by reference. We recommend purchasing travel insurance for your trip.
              </p>
            </div>

            {/* Exact Figma Action Buttons from line 9228 */}
            <div className="border-t pt-4">
              <p className="text-xs font-bold text-slate-400 uppercase mb-2">Available Actions</p>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleAction("Print E-ticket", selectedTicket)}
                  className="flex items-center gap-1.5 rounded-lg bg-[#006aec] px-3.5 py-2 text-xs font-bold text-white hover:bg-blue-700 shadow-sm"
                >
                  <Printer className="h-3.5 w-3.5" />
                  Print E-ticket
                </button>
                <button
                  type="button"
                  onClick={() => handleAction("Share E-ticket", selectedTicket)}
                  className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
                >
                  <Share2 className="h-3.5 w-3.5" />
                  Share E-ticket
                </button>
                <button
                  type="button"
                  onClick={() => handleAction("Refund Claim Request", selectedTicket)}
                  className="flex items-center gap-1.5 rounded-lg border border-rose-200 bg-rose-50 px-3.5 py-2 text-xs font-bold text-rose-700 hover:bg-rose-100"
                >
                  Refund
                </button>
                <button
                  type="button"
                  onClick={() => handleAction("Rebooking Request", selectedTicket)}
                  className="flex items-center gap-1.5 rounded-lg border border-amber-200 bg-amber-50 px-3.5 py-2 text-xs font-bold text-amber-700 hover:bg-amber-100"
                >
                  Rebooking
                </button>
                <button
                  type="button"
                  onClick={() => handleAction("Special Request & Assistance", selectedTicket)}
                  className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
                >
                  Special Request
                </button>
                <button
                  type="button"
                  onClick={() => handleAction("Edit Transaction Fee", selectedTicket)}
                  className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
                >
                  Edit transaction fee
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
