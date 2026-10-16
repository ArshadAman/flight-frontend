"use client";

import React, { useEffect, useState } from "react";
import {
  Search,
  Filter,
  Download,
  Eye,
  FileText,
  X,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Plane,
  Calendar,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { getPublicApiUrl } from "@/lib/apiConfig";

interface BookingItem {
  id: string;
  pnr: string;
  airlinePnr: string;
  passenger: string;
  email: string;
  phone: string;
  airline: string;
  airlineCode: string;
  flightNo: string;
  route: string;
  origin: string;
  destination: string;
  departure: string;
  seats: number;
  amount: number;
  status: "Confirmed" | "Hold" | "Cancelled" | "Departed";
  cabinClass: string;
}

const initialBookings: BookingItem[] = [
  {
    id: "MTD-BK-88421",
    pnr: "X7K9M2",
    airlinePnr: "6E-DEL992",
    passenger: "Amit Sharma",
    email: "amit.sharma@example.com",
    phone: "+91 98765 43210",
    airline: "IndiGo",
    airlineCode: "6E",
    flightNo: "6E-204",
    route: "DEL → BOM",
    origin: "Delhi (DEL)",
    destination: "Mumbai (BOM)",
    departure: "2026-10-20 06:15",
    seats: 2,
    amount: 11450,
    status: "Confirmed",
    cabinClass: "Economy",
  },
  {
    id: "MTD-BK-88422",
    pnr: "P3N8L1",
    airlinePnr: "AI-BLR112",
    passenger: "Sneha Reddy",
    email: "sneha.r@gmail.com",
    phone: "+91 98111 22334",
    airline: "Air India",
    airlineCode: "AI",
    flightNo: "AI-131",
    route: "BLR → DEL",
    origin: "Bengaluru (BLR)",
    destination: "Delhi (DEL)",
    departure: "2026-10-22 14:30",
    seats: 1,
    amount: 6200,
    status: "Hold",
    cabinClass: "Economy",
  },
  {
    id: "MTD-BK-88423",
    pnr: "Q5R2T9",
    airlinePnr: "SG-MAA441",
    passenger: "Vikram Patel",
    email: "vikram.p@patelcorp.com",
    phone: "+91 99222 33445",
    airline: "SpiceJet",
    airlineCode: "SG",
    flightNo: "SG-812",
    route: "MAA → CCU",
    origin: "Chennai (MAA)",
    destination: "Kolkata (CCU)",
    departure: "2026-10-25 09:45",
    seats: 3,
    amount: 18400,
    status: "Confirmed",
    cabinClass: "Economy",
  },
  {
    id: "MTD-BK-88424",
    pnr: "W8Y4H6",
    airlinePnr: "UK-GOI008",
    passenger: "Neha Gupta",
    email: "neha.g@outlook.com",
    phone: "+91 97777 88899",
    airline: "Vistara",
    airlineCode: "UK",
    flightNo: "UK-945",
    route: "BOM → GOI",
    origin: "Mumbai (BOM)",
    destination: "Goa (GOI)",
    departure: "2026-10-18 11:20",
    seats: 1,
    amount: 5400,
    status: "Departed",
    cabinClass: "Premium",
  },
  {
    id: "MTD-BK-88425",
    pnr: "K2M9N4",
    airlinePnr: "6E-CCU190",
    passenger: "Rahul Roy",
    email: "rahul.roy@travels.com",
    phone: "+91 96666 55544",
    airline: "IndiGo",
    airlineCode: "6E",
    flightNo: "6E-551",
    route: "CCU → DEL",
    origin: "Kolkata (CCU)",
    destination: "Delhi (DEL)",
    departure: "2026-10-15 18:00",
    seats: 1,
    amount: 4999,
    status: "Cancelled",
    cabinClass: "Economy",
  },
];

export function BookingListSection() {
  const { access } = useAuth();
  const [bookings, setBookings] = useState<BookingItem[]>(initialBookings);
  const [activeTab, setActiveTab] = useState<string>("All");
  const [search, setSearch] = useState("");
  const [selectedBooking, setSelectedBooking] = useState<BookingItem | null>(null);

  useEffect(() => {
    if (!access) return;
    const fetchLiveTickets = async () => {
      try {
        const res = await fetch(`${getPublicApiUrl()}/tickets/`, {
          headers: { Authorization: `Bearer ${access}` },
        });
        if (!res.ok) return;
        const json = await res.json();
        const rawList = Array.isArray(json) ? json : json.results || json.data || [];
        if (rawList.length > 0) {
          const liveRows: BookingItem[] = rawList.map((t: any) => ({
            id: t.id ? `TKT-${String(t.id).slice(0, 8)}` : "MTD-BK",
            pnr: t.pnr_number || t.booking_ref || "PNR" + Math.floor(100000 + Math.random() * 900000),
            airlinePnr: t.airline_pnr || t.pnr_number || "AIR-PNR",
            passenger: (t.passengers_data?.[0]?.first_name
              ? `${t.passengers_data[0].first_name} ${t.passengers_data[0].last_name || ""}`
              : t.contact_name || "Agent Client"
            ).trim(),
            email: t.contact_email || "passenger@example.com",
            phone: t.contact_phone || "+91 98765 00000",
            airline: t.airline_name || "IndiGo",
            airlineCode: t.airline_code || "6E",
            flightNo: t.flight_number || "6E-201",
            route: `${t.origin || "DEL"} → ${t.destination || "BOM"}`,
            origin: t.origin || "DEL",
            destination: t.destination || "BOM",
            departure: t.departure_datetime
              ? t.departure_datetime.slice(0, 16).replace("T", " ")
              : "2026-10-25 10:00",
            seats: t.passengers_data?.length || 1,
            amount: parseFloat(t.total_amount || t.price || 4999),
            status:
              t.status === "CANCELLED"
                ? "Cancelled"
                : t.status === "HOLD"
                ? "Hold"
                : "Confirmed",
            cabinClass: t.cabin_class || "Economy",
          }));
          setBookings(liveRows);
        }
      } catch (err) {
        // gracefully keep fallback
      }
    };
    void fetchLiveTickets();
  }, [access]);

  const filtered = bookings.filter((b) => {
    if (activeTab === "Upcoming" && b.status !== "Confirmed") return false;
    if (activeTab === "Hold" && b.status !== "Hold") return false;
    if (activeTab === "Departed" && b.status !== "Departed") return false;
    if (activeTab === "Cancelled" && b.status !== "Cancelled") return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        b.pnr.toLowerCase().includes(q) ||
        b.passenger.toLowerCase().includes(q) ||
        b.route.toLowerCase().includes(q) ||
        b.flightNo.toLowerCase().includes(q) ||
        b.airline.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const exportCSV = () => {
    const header = "BookingID,PNR,AirlinePNR,Passenger,Airline,FlightNo,Route,Departure,Amount,Status\n";
    const rows = filtered
      .map(
        (b) =>
          `"${b.id}","${b.pnr}","${b.airlinePnr}","${b.passenger}","${b.airline}","${b.flightNo}","${b.route}","${b.departure}",${b.amount},"${b.status}"`
      )
      .join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `bookings-${activeTab.toLowerCase()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-[#1c304a]">Booking List</h2>
          <p className="text-xs text-slate-500">
            View, search, and manage all offline and online client flight reservations.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={exportCSV}
            className="flex items-center gap-1.5 rounded-lg border border-[#e8ebef] bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50"
          >
            <Download className="h-3.5 w-3.5" />
            Export CSV
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2 overflow-x-auto text-xs font-bold">
          {["All", "Upcoming", "Hold", "Departed", "Cancelled"].map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setActiveTab(t)}
              className={cn(
                "rounded-full px-3 py-1 transition-all",
                activeTab === t
                  ? "bg-[#D60D26] text-white shadow-sm"
                  : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
              )}
            >
              {t} {t === "All" ? `(${bookings.length})` : ""}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <label className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs shadow-sm">
            <Search className="h-3.5 w-3.5 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search PNR, Pax, Flight..."
              className="w-36 bg-transparent outline-none sm:w-48"
            />
          </label>
        </div>
      </div>

      <div className="overflow-hidden rounded-[10px] border border-[#e8ebef] bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-[#e8ebef] bg-slate-50/70 font-semibold text-slate-500 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="px-4 py-3">Booking ID & PNR</th>
                <th className="px-4 py-3">Passenger</th>
                <th className="px-4 py-3">Flight & Airline</th>
                <th className="px-4 py-3">Sector</th>
                <th className="px-4 py-3">Departure</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-[#1c304a]">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    No bookings found matching criteria.
                  </td>
                </tr>
              ) : (
                filtered.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-4 py-3 font-semibold">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-[#D60D26]">{b.pnr}</span>
                        <span className="text-[10px] text-slate-400">({b.airlinePnr})</span>
                      </div>
                      <p className="text-[10px] text-slate-400">{b.id}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-bold">{b.passenger}</p>
                      <p className="text-[10px] text-slate-400">{b.phone}</p>
                    </td>
                    <td className="px-4 py-3 font-medium">
                      <div className="flex items-center gap-1.5">
                        <span className="rounded bg-slate-100 px-1 py-0.5 text-[10px] font-bold text-slate-700">
                          {b.airlineCode}
                        </span>
                        <span>{b.flightNo}</span>
                      </div>
                      <p className="text-[10px] text-slate-400">{b.airline}</p>
                    </td>
                    <td className="px-4 py-3 font-semibold">{b.route}</td>
                    <td className="px-4 py-3 text-slate-600">{b.departure}</td>
                    <td className="px-4 py-3 font-bold text-emerald-700">
                      ₹{b.amount.toLocaleString("en-IN")}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          "rounded-full px-2 py-0.5 text-[10px] font-bold",
                          b.status === "Confirmed" && "bg-emerald-50 text-emerald-700 border border-emerald-200",
                          b.status === "Hold" && "bg-amber-50 text-amber-700 border border-amber-200",
                          b.status === "Departed" && "bg-blue-50 text-blue-700 border border-blue-200",
                          b.status === "Cancelled" && "bg-rose-50 text-rose-700 border border-rose-200"
                        )}
                      >
                        ● {b.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => setSelectedBooking(b)}
                        className="rounded border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-bold text-slate-700 hover:bg-slate-50 hover:text-[#D60D26]"
                      >
                        View Detail
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-start justify-between border-b pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-400">Reservation Details</span>
                <h3 className="text-lg font-black text-[#1c304a]">
                  PNR: {selectedBooking.pnr} ({selectedBooking.airlinePnr})
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedBooking(null)}
                className="rounded-full p-1 text-slate-400 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="rounded-lg bg-slate-50 p-2.5">
                <p className="text-slate-400">Passenger</p>
                <p className="font-bold text-[#1c304a]">{selectedBooking.passenger}</p>
                <p className="text-[10px] text-slate-500">{selectedBooking.email}</p>
                <p className="text-[10px] text-slate-500">{selectedBooking.phone}</p>
              </div>
              <div className="rounded-lg bg-slate-50 p-2.5">
                <p className="text-slate-400">Flight Route</p>
                <p className="font-bold text-[#1c304a]">{selectedBooking.route}</p>
                <p className="text-[10px] text-slate-500">{selectedBooking.airline} · {selectedBooking.flightNo}</p>
                <p className="text-[10px] text-slate-500">{selectedBooking.cabinClass} Class ({selectedBooking.seats} Seat)</p>
              </div>
              <div className="rounded-lg bg-slate-50 p-2.5">
                <p className="text-slate-400">Departure Time</p>
                <p className="font-bold text-[#1c304a]">{selectedBooking.departure}</p>
              </div>
              <div className="rounded-lg bg-slate-50 p-2.5">
                <p className="text-slate-400">Total Fare</p>
                <p className="font-black text-emerald-700 text-sm">
                  ₹{selectedBooking.amount.toLocaleString("en-IN")}
                </p>
                <p className="text-[10px] text-slate-400">Status: {selectedBooking.status}</p>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t">
              <button
                type="button"
                onClick={() => alert(`Downloading E-Ticket for PNR: ${selectedBooking.pnr}`)}
                className="flex items-center gap-1 rounded-lg bg-[#006aec] px-3 py-1.5 text-xs font-bold text-white hover:bg-[#006aec]/90"
              >
                <FileText className="h-3.5 w-3.5" />
                Download E-Ticket
              </button>
              <button
                type="button"
                onClick={() => setSelectedBooking(null)}
                className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
