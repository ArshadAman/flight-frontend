"use client";

import React, { useEffect, useState } from "react";
import { Search, RefreshCw, AlertCircle, CheckCircle2, X, Plane, ArrowRight, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { getPublicApiUrl } from "@/lib/apiConfig";

interface CancellationItem {
  id: string; // Cancellation Id: 00125618
  bookingId: string;
  pnr: string;
  passenger: string;
  source: "Airline" | "Agent";
  route: string;
  segmentFrom: string;
  segmentTo: string;
  airlineWay: string;
  airlineName: string;
  flightDate: string;
  cancellationDate: string;
  originalFare: number;
  airlineCharges: number;
  refundAmount: number;
  status: "Pending" | "Refunded" | "Non-Refundable" | "Refund in process";
  reason: string;
}

const initialCancellations: CancellationItem[] = [
  {
    id: "00125618",
    bookingId: "00125618",
    pnr: "AD1267900",
    passenger: "Harshit Chirgania",
    source: "Airline",
    route: "DEL → BKK",
    segmentFrom: "New Delhi (DEL)",
    segmentTo: "Bangkok (BKK)",
    airlineWay: "One-way",
    airlineName: "AIR INDIA IA 121",
    flightDate: "22, Dec 2021 | 12:30 PM",
    cancellationDate: "22, Dec 2021 | 12:30 PM",
    originalFare: 45000,
    airlineCharges: 5000,
    refundAmount: 40000,
    status: "Refund in process",
    reason:
      "The booking was cancelled by the airline due to operational reasons. The refund is currently being processed as per airline policy.",
  },
  {
    id: "00125619",
    bookingId: "00125619",
    pnr: "K2M9N4",
    passenger: "Rahul Roy",
    source: "Agent",
    route: "CCU → DEL",
    segmentFrom: "Kolkata (CCU)",
    segmentTo: "New Delhi (DEL)",
    airlineWay: "One-way",
    airlineName: "IndiGo 6E 204",
    flightDate: "24, Oct 2026 | 08:15 AM",
    cancellationDate: "15, Oct 2026 | 02:20 PM",
    originalFare: 14999,
    airlineCharges: 2500,
    refundAmount: 12499,
    status: "Pending",
    reason: "Passenger personal emergency requested through agent desk.",
  },
  {
    id: "00125620",
    bookingId: "00125620",
    pnr: "L9P4V2",
    passenger: "Sunita Joshi",
    source: "Agent",
    route: "DEL → BOM",
    segmentFrom: "New Delhi (DEL)",
    segmentTo: "Mumbai (BOM)",
    airlineWay: "Round-trip",
    airlineName: "Vistara UK 814",
    flightDate: "21, Oct 2026 | 06:30 PM",
    cancellationDate: "14, Oct 2026 | 10:15 AM",
    originalFare: 28400,
    airlineCharges: 3500,
    refundAmount: 24900,
    status: "Refunded",
    reason: "Meeting rescheduled by client, processed directly to wallet.",
  },
  {
    id: "00125621",
    bookingId: "00125621",
    pnr: "Z7R3Q1",
    passenger: "Karan Malhotra",
    source: "Agent",
    route: "BOM → GOI",
    segmentFrom: "Mumbai (BOM)",
    segmentTo: "Goa (GOI)",
    airlineWay: "One-way",
    airlineName: "SpiceJet SG 142",
    flightDate: "19, Oct 2026 | 07:00 PM",
    cancellationDate: "13, Oct 2026 | 06:40 PM",
    originalFare: 5400,
    airlineCharges: 5400,
    refundAmount: 0,
    status: "Non-Refundable",
    reason: "Instant saver promotional fare cancelled within 4 hours of departure.",
  },
];

export function CancellationsSection() {
  const { access } = useAuth();
  const [items, setItems] = useState<CancellationItem[]>(initialCancellations);
  const [activeTab, setActiveTab] = useState<string>("All");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<CancellationItem | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (!access) return;
    const fetchCancellations = async () => {
      try {
        const apiBase = getPublicApiUrl();
        const res = await fetch(`${apiBase}/tickets/cancellations/`, {
          headers: { Authorization: `Bearer ${access}` },
        });
        if (res.ok) {
          const data = await res.json();
          const list = Array.isArray(data) ? data : data?.results || [];
          if (list.length > 0) {
            const mapped: CancellationItem[] = list.map((c: any, idx: number) => ({
              id: c.claim_id || c.id || `001256${22 + idx}`,
              bookingId: c.claim_id || c.id || `001256${22 + idx}`,
              pnr: c.pnr,
              passenger: c.passenger_name,
              source: (c.source as any) || "Agent",
              route: c.sector || "DEL → BOM",
              segmentFrom: c.origin || "New Delhi (DEL)",
              segmentTo: c.destination || "Bangkok (BKK)",
              airlineWay: c.trip_type || "One-way",
              airlineName: c.airline || "AIR INDIA IA 121",
              flightDate: c.travel_date || "22, Dec 2021 | 12:30 PM",
              cancellationDate: c.created_at
                ? new Date(c.created_at).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })
                : "22, Dec 2021 | 12:30 PM",
              originalFare: Number(c.fare_paid) || 45000,
              airlineCharges: Number(c.airline_penalty) || 5000,
              refundAmount: Number(c.refund_amount) || 40000,
              status:
                c.status === "APPROVED" || c.status === "REFUNDED"
                  ? "Refunded"
                  : c.status === "IN_PROCESS"
                  ? "Refund in process"
                  : c.status === "NON_REFUNDABLE"
                  ? "Non-Refundable"
                  : "Pending",
              reason: c.reason || "The booking was cancelled by the airline due to operational reasons.",
            }));
            setItems(mapped);
          }
        }
      } catch {
        /* preserved */
      }
    };
    void fetchCancellations();
  }, [access]);

  const handleProcessRefund = (newStatus: "Refunded" | "Non-Refundable" | "Refund in process") => {
    if (!selected) return;
    setItems((prev) =>
      prev.map((c) => (c.id === selected.id ? { ...c, status: newStatus } : c))
    );
    setToast(`Cancellation #${selected.id} status updated to ${newStatus}`);
    setSelected(null);
    setTimeout(() => setToast(null), 3000);
  };

  const filtered = items.filter((c) => {
    if (activeTab !== "All" && c.status !== activeTab) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        c.pnr.toLowerCase().includes(q) ||
        c.passenger.toLowerCase().includes(q) ||
        c.id.toLowerCase().includes(q) ||
        c.route.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-5">
      {toast && (
        <div className="rounded-lg bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-md transition-all">
          ✓ {toast}
        </div>
      )}

      <div>
        <h2 className="text-xl font-black text-[#1c304a]">Cancellation List</h2>
        <p className="text-xs text-slate-500">
          Airline and agent initiated booking cancellations, penalty breakdowns, and refund workflows.
        </p>
      </div>

      {/* Tabs exactly matching Figma: All, Pending, Refunded, Non-Refundable, Refund in process */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#e8ebef] pb-3">
        <div className="flex flex-wrap items-center gap-2">
          {["All", "Pending", "Refunded", "Non-Refundable", "Refund in process"].map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={cn(
                "rounded-lg px-3 py-1.5 text-xs font-bold transition-all",
                activeTab === tab
                  ? "bg-[#1c304a] text-white shadow-sm"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              )}
            >
              {tab}
            </button>
          ))}
        </div>

        <label className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs shadow-sm">
          <Search className="h-3.5 w-3.5 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search Cancel Id, PNR..."
            className="w-36 bg-transparent outline-none sm:w-48 text-xs"
          />
        </label>
      </div>

      {/* Table matching Figma columns */}
      <div className="overflow-hidden rounded-[10px] border border-[#e8ebef] bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-[#e8ebef] bg-slate-50/70 font-semibold text-slate-500 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="px-4 py-3">Cancel Id</th>
                <th className="px-4 py-3">Passenger PNR</th>
                <th className="px-4 py-3">Passenger Name</th>
                <th className="px-4 py-3">Airline & Segment</th>
                <th className="px-4 py-3">Cancel Date</th>
                <th className="px-4 py-3">Original Fare</th>
                <th className="px-4 py-3">Airline Charges</th>
                <th className="px-4 py-3">Refund Amount</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-[#1c304a]">
              {filtered.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="px-4 py-3 font-mono font-bold text-[#006aec]">
                    #{item.id}
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-mono font-bold text-[#D60D26]">{item.pnr}</span>
                  </td>
                  <td className="px-4 py-3 font-bold">{item.passenger}</td>
                  <td className="px-4 py-3">
                    <p className="font-semibold">{item.route}</p>
                    <p className="text-[10px] text-slate-400">{item.airlineName}</p>
                  </td>
                  <td className="px-4 py-3 text-slate-500">{item.cancellationDate}</td>
                  <td className="px-4 py-3 font-semibold">₹{item.originalFare.toLocaleString("en-IN")}</td>
                  <td className="px-4 py-3 text-rose-600 font-semibold">
                    -₹{item.airlineCharges.toLocaleString("en-IN")}
                  </td>
                  <td className="px-4 py-3 font-black text-emerald-700">
                    ₹{item.refundAmount.toLocaleString("en-IN")}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 text-[10px] font-bold border",
                        item.status === "Pending" && "bg-amber-50 text-amber-700 border-amber-200",
                        item.status === "Refunded" && "bg-emerald-50 text-emerald-700 border-emerald-200",
                        item.status === "Refund in process" && "bg-blue-50 text-blue-700 border-blue-200",
                        item.status === "Non-Refundable" && "bg-rose-50 text-rose-700 border-rose-200"
                      )}
                    >
                      ● {item.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => setSelected(item)}
                      className="rounded border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-bold text-slate-700 hover:bg-slate-50 hover:text-[#D60D26]"
                    >
                      Cancellation Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal matching Figma 2084:73868: Two Linked Cards */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-3xl rounded-xl bg-white p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Figma Cancellation Screen
                </span>
                <h3 className="text-lg font-black text-[#1c304a]">
                  Cancellation Id: #{selected.id} (PNR: {selected.pnr})
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="rounded-full p-1 text-slate-400 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Exactly the 2 linked cards from Figma frame 2084:73868 */}
            <div className="grid gap-4 md:grid-cols-2">
              {/* Card 1: Cancellation Details */}
              <div className="rounded-[10px] border border-[#e8ebef] bg-slate-50/70 p-4 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wide text-[#1c304a] border-b border-slate-200 pb-2">
                  Cancellation Details
                </h4>

                <div className="space-y-2 text-xs">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">
                      Cancellation Id:
                    </span>
                    <span className="font-mono font-bold text-[#006aec]">#{selected.id}</span>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">
                      Cancellation Source:
                    </span>
                    <span className="font-bold text-[#1c304a]">{selected.source}</span>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">
                      Cancellation Date:
                    </span>
                    <span className="font-semibold text-slate-700">{selected.cancellationDate}</span>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">
                      Cancellation Reason:
                    </span>
                    <p className="mt-1 rounded-md bg-white p-2.5 text-[11px] leading-relaxed text-slate-600 border border-slate-200">
                      {selected.reason}
                    </p>
                  </div>
                </div>
              </div>

              {/* Card 2: Booking Details */}
              <div className="rounded-[10px] border border-[#e8ebef] bg-white p-4 space-y-3 shadow-sm">
                <h4 className="text-xs font-bold uppercase tracking-wide text-[#1c304a] border-b border-slate-200 pb-2">
                  Booking Details
                </h4>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">
                      Booking Id:
                    </span>
                    <span className="font-mono font-bold text-slate-700">#{selected.bookingId}</span>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">
                      Passenger PNR:
                    </span>
                    <span className="font-mono font-bold text-[#D60D26]">{selected.pnr}</span>
                  </div>

                  <div className="col-span-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">
                      Passenger Name:
                    </span>
                    <span className="font-bold text-[#1c304a]">{selected.passenger}</span>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">
                      Airline Way:
                    </span>
                    <span className="font-semibold text-slate-700">{selected.airlineWay}</span>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">
                      Segment:
                    </span>
                    <span className="font-bold text-[#1c304a]">{selected.route}</span>
                  </div>

                  <div className="col-span-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">
                      Airline Name
                    </span>
                    <span className="font-bold text-slate-700">{selected.airlineName}</span>
                  </div>

                  <div className="col-span-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">
                      Booking Date
                    </span>
                    <span className="font-medium text-slate-600">{selected.flightDate}</span>
                  </div>
                </div>

                {/* Fare math from Figma */}
                <div className="rounded-lg bg-slate-50 p-2.5 text-xs space-y-1.5 border border-slate-100">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Original Fare:</span>
                    <span className="font-bold">₹{selected.originalFare.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="flex justify-between text-rose-600 font-semibold">
                    <span>Airline Charges:</span>
                    <span>-₹{selected.airlineCharges.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="flex justify-between border-t border-slate-200 pt-1 font-black text-emerald-700 text-sm">
                    <span>Refund Amount:</span>
                    <span>₹{selected.refundAmount.toLocaleString("en-IN")}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 border-t pt-3">
              <button
                type="button"
                onClick={() => handleProcessRefund("Refunded")}
                className="rounded-lg bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-700 shadow-sm"
              >
                Approve & Process Refund
              </button>
              <button
                type="button"
                onClick={() => handleProcessRefund("Non-Refundable")}
                className="rounded-lg bg-rose-50 px-3 py-2 text-xs font-bold text-rose-700 border border-rose-200 hover:bg-rose-100"
              >
                Mark Non-Refundable
              </button>
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="rounded-lg border border-slate-300 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
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
