"use client";

import React, { useEffect, useState } from "react";
import { Search, ArrowRight, RefreshCw, CheckCircle2, X, Plane, Clock, ShieldCheck, Ticket } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { getPublicApiUrl } from "@/lib/apiConfig";

interface AmendmentItem {
  id: string; // 00125618
  amendmentDate: string; // 22, Dec 2021 | 12:30 PM
  agentId: string; // 1242315qw
  agentName: string; // Harshit chirgania
  pnr: string;
  bookingRef: string; // XYR9NF
  bookingDate: string; // 15SEP/2025
  passenger: string;
  lastName: string;
  firstName: string;
  title: string;
  type: "Date Change" | "Sector Change" | "Name Correction" | "Reissue";
  changesOld: string;
  changesNew: string;
  airlineCharges: number; // ₹1,000
  agentCharges: number; // ₹300
  status: "Approved" | "Pending" | "Rejected";
  remark: string;
  eTicketNumber: string;
  airlinePnr: string;
}

const initialAmendments: AmendmentItem[] = [
  {
    id: "00125618",
    amendmentDate: "22, Dec 2021 | 12:30 PM",
    agentId: "1242315qw",
    agentName: "Harshit chirgania",
    pnr: "XYR9NF",
    bookingRef: "XYR9NF",
    bookingDate: "15SEP/2025",
    passenger: "Chirgania / Harshit Mr",
    lastName: "CHIRGANIA",
    firstName: "HARSHIT",
    title: "MR.",
    type: "Date Change",
    changesOld: "22, Dec 2021",
    changesNew: "24, Dec 2021",
    airlineCharges: 1000,
    agentCharges: 300,
    status: "Approved",
    remark: "Customer approved fare difference",
    eTicketNumber: "098-2451928410",
    airlinePnr: "AI-77491",
  },
  {
    id: "00125619",
    amendmentDate: "23, Dec 2021 | 04:15 PM",
    agentId: "9821450pl",
    agentName: "Ajay Kumar",
    pnr: "P3N8L1",
    bookingRef: "P3N8L1",
    bookingDate: "18SEP/2025",
    passenger: "Reddy / Sneha Ms",
    lastName: "REDDY",
    firstName: "SNEHA",
    title: "MS.",
    type: "Name Correction",
    changesOld: "Sneha Reddi",
    changesNew: "Sneha Reddy (as per Passport)",
    airlineCharges: 500,
    agentCharges: 200,
    status: "Approved",
    remark: "Minor spelling correction submitted to airline desk",
    eTicketNumber: "098-2451928411",
    airlinePnr: "UK-90123",
  },
  {
    id: "00125620",
    amendmentDate: "24, Dec 2021 | 11:00 AM",
    agentId: "4412903ty",
    agentName: "Lokesh Gidwani",
    pnr: "Q5R2T9",
    bookingRef: "Q5R2T9",
    bookingDate: "20SEP/2025",
    passenger: "Patel / Vikram Mr",
    lastName: "PATEL",
    firstName: "VIKRAM",
    title: "MR.",
    type: "Sector Change",
    changesOld: "MAA → CCU",
    changesNew: "MAA → DEL",
    airlineCharges: 2500,
    agentCharges: 500,
    status: "Pending",
    remark: "Routing alteration pending passenger payment confirmation",
    eTicketNumber: "098-2451928412",
    airlinePnr: "6E-10294",
  },
];

export function AmendmentsSection() {
  const { access } = useAuth();
  const [items, setItems] = useState<AmendmentItem[]>(initialAmendments);
  const [activeTab, setActiveTab] = useState<string>("All");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<AmendmentItem | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (!access) return;
    const fetchAmendments = async () => {
      try {
        const apiBase = getPublicApiUrl();
        const res = await fetch(`${apiBase}/tickets/amendments/`, {
          headers: { Authorization: `Bearer ${access}` },
        });
        if (res.ok) {
          const data = await res.json();
          const list = Array.isArray(data) ? data : data?.results || [];
          if (list.length > 0) {
            const mapped: AmendmentItem[] = list.map((a: any, idx: number) => ({
              id: a.amendment_id || a.id || `001256${21 + idx}`,
              amendmentDate: a.created_at
                ? new Date(a.created_at).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })
                : "22, Dec 2021 | 12:30 PM",
              agentId: a.agent_id || "1242315qw",
              agentName: a.agent_name || "Harshit chirgania",
              pnr: a.pnr,
              bookingRef: a.pnr,
              bookingDate: "15SEP/2025",
              passenger: a.passenger_name || "Harshit Chirgania",
              lastName: (a.passenger_name || "CHIRGANIA").split(" ")[0].toUpperCase(),
              firstName: (a.passenger_name || "HARSHIT").split(" ")[1] || "MR",
              title: "MR.",
              type: (a.amendment_type as any) || "Date Change",
              changesOld: a.old_value || "22, Dec 2021",
              changesNew: a.new_value || "24, Dec 2021",
              airlineCharges: Number(a.fare_difference) || 1000,
              agentCharges: Number(a.service_fee) || 300,
              status: a.status === "APPROVED" ? "Approved" : a.status === "REJECTED" ? "Rejected" : "Pending",
              remark: a.remark || "Customer approved fare difference",
              eTicketNumber: "098-2451928410",
              airlinePnr: a.pnr,
            }));
            setItems(mapped);
          }
        }
      } catch {
        /* preserved */
      }
    };
    void fetchAmendments();
  }, [access]);

  const handleAction = (status: "Approved" | "Rejected") => {
    if (!selected) return;
    setItems((prev) =>
      prev.map((item) => (item.id === selected.id ? { ...item, status } : item))
    );
    setToast(`Amendment #${selected.id} has been ${status.toLowerCase()} successfully!`);
    setSelected(null);
    setTimeout(() => setToast(null), 3000);
  };

  const filtered = items.filter((item) => {
    if (activeTab !== "All" && item.status !== activeTab) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        item.pnr.toLowerCase().includes(q) ||
        item.passenger.toLowerCase().includes(q) ||
        item.id.toLowerCase().includes(q) ||
        item.agentName.toLowerCase().includes(q)
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
        <h2 className="text-xl font-black text-[#1c304a]">Amendments Details</h2>
        <p className="text-xs text-slate-500">
          Flight date changes, route alterations, passenger name amendments, and reissue charges.
        </p>
      </div>

      {/* KPI Cards matching Figma line 1256 */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-[10px] border border-[#e8ebef] bg-white p-4 shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase">Total Amendments</p>
          <p className="mt-1 text-2xl font-black text-[#1c304a]">165</p>
          <span className="text-[11px] font-semibold text-emerald-600">↑ 14% vs last month</span>
        </div>
        <div className="rounded-[10px] border border-[#e8ebef] bg-white p-4 shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase">Approved</p>
          <p className="mt-1 text-2xl font-black text-emerald-600">24</p>
          <span className="text-[11px] font-semibold text-slate-500">Reissued on GDS</span>
        </div>
        <div className="rounded-[10px] border border-[#e8ebef] bg-white p-4 shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase">Pending</p>
          <p className="mt-1 text-2xl font-black text-amber-600">34</p>
          <span className="text-[11px] font-semibold text-amber-600">Awaiting airline desk</span>
        </div>
        <div className="rounded-[10px] border border-[#e8ebef] bg-white p-4 shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase">Rejected</p>
          <p className="mt-1 text-2xl font-black text-rose-600">07</p>
          <span className="text-[11px] font-semibold text-slate-500">Fare lock expired</span>
        </div>
      </div>

      {/* Filter Tabs matching Figma: All, Approved, Pending, Rejected */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#e8ebef] pb-3">
        <div className="flex flex-wrap items-center gap-2">
          {["All", "Approved", "Pending", "Rejected"].map((tab) => (
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
            placeholder="Search Amendment Id, PNR..."
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
                <th className="px-4 py-3">Amendment Id</th>
                <th className="px-4 py-3">Passenger PNR</th>
                <th className="px-4 py-3">Passenger Name</th>
                <th className="px-4 py-3">Amendment Type</th>
                <th className="px-4 py-3">Changes</th>
                <th className="px-4 py-3">Assign Agent</th>
                <th className="px-4 py-3">Total Charges</th>
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
                    <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-700 border border-blue-200">
                      {item.type}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5 font-semibold">
                      <span className="text-slate-400 line-through text-[11px]">{item.changesOld}</span>
                      <ArrowRight className="h-3 w-3 text-slate-400" />
                      <span className="text-emerald-700 text-[11px] font-bold">{item.changesNew}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-semibold text-slate-800">{item.agentName}</p>
                    <p className="text-[10px] text-slate-400">ID: {item.agentId}</p>
                  </td>
                  <td className="px-4 py-3 font-black text-[#1c304a]">
                    ₹{(item.airlineCharges + item.agentCharges).toLocaleString("en-IN")}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 text-[10px] font-bold border",
                        item.status === "Approved" && "bg-emerald-50 text-emerald-700 border-emerald-200",
                        item.status === "Pending" && "bg-amber-50 text-amber-700 border-amber-200",
                        item.status === "Rejected" && "bg-rose-50 text-rose-700 border-rose-200"
                      )}
                    >
                      ● {item.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => setSelected(item)}
                      className="rounded border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-bold text-slate-700 hover:bg-slate-50 hover:text-[#006aec]"
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

      {/* Detail Modal with Exact Figma Amendment Details & Attached Booking Details */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-3xl rounded-xl bg-white p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Figma Amendment Screen
                </span>
                <h3 className="text-lg font-black text-[#1c304a]">
                  Amendment Id: #{selected.id} (PNR: {selected.pnr})
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

            {/* Exactly the 2 cards from Figma Frame 1312:52763 */}
            <div className="grid gap-4 md:grid-cols-2">
              {/* Card 1: Amendment Details */}
              <div className="rounded-[10px] border border-[#e8ebef] bg-slate-50/70 p-4 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wide text-[#1c304a] border-b border-slate-200 pb-2">
                  Amendments Details
                </h4>

                <div className="space-y-2 text-xs">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">
                      Amendment Id:
                    </span>
                    <span className="font-mono font-bold text-[#006aec]">#{selected.id}</span>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">
                      Amendment Date:
                    </span>
                    <span className="font-semibold text-slate-700">{selected.amendmentDate}</span>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">
                      Assign Agent Id:
                    </span>
                    <span className="font-mono font-bold text-slate-700">{selected.agentId}</span>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">
                      Assign Agent Name:
                    </span>
                    <span className="font-bold text-[#1c304a]">{selected.agentName}</span>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">
                      Changes
                    </span>
                    <div className="mt-1 flex items-center gap-2 rounded bg-white p-2 border border-slate-200">
                      <span className="font-bold text-slate-500">{selected.changesOld}</span>
                      <span className="font-bold text-[#D60D26]">→</span>
                      <span className="font-bold text-emerald-700">{selected.changesNew}</span>
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">
                      Amendment Type:
                    </span>
                    <span className="font-bold text-[#1c304a]">{selected.type}</span>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">
                      Charges
                    </span>
                    <p className="font-semibold text-slate-700">
                      Airline: ₹{selected.airlineCharges.toLocaleString("en-IN")} | Agent: ₹{selected.agentCharges.toLocaleString("en-IN")}
                    </p>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">
                      Remark:
                    </span>
                    <p className="mt-1 rounded bg-white p-2 text-[11px] text-slate-600 border border-slate-200">
                      {selected.remark}
                    </p>
                  </div>
                </div>
              </div>

              {/* Card 2: Attached Booking Details */}
              <div className="rounded-[10px] border border-[#e8ebef] bg-white p-4 space-y-3 shadow-sm">
                <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                  <div>
                    <p className="text-xs font-bold text-[#1c304a]">My Travel Deal Agency</p>
                    <p className="text-[10px] text-slate-400">Misrod Road, Near Vijay Park, Delhi</p>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-[#D60D26]">
                    Contact: +91-0987654321
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">
                      Booking reference number:
                    </span>
                    <span className="font-mono font-bold text-[#006aec]">{selected.bookingRef}</span>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">
                      Booking date:
                    </span>
                    <span className="font-medium text-slate-700">{selected.bookingDate}</span>
                  </div>
                </div>

                {/* Passengers details Table matching Figma line 1256 */}
                <div className="space-y-1.5 pt-2">
                  <p className="text-[11px] font-bold text-[#1c304a] uppercase">Passengers details:</p>
                  <table className="w-full text-left text-[10px]">
                    <thead className="bg-slate-50 text-slate-500 font-semibold border-y">
                      <tr>
                        <th className="py-1 px-1.5">No.</th>
                        <th className="py-1 px-1.5">Last Name</th>
                        <th className="py-1 px-1.5">Title</th>
                        <th className="py-1 px-1.5">First Name</th>
                        <th className="py-1 px-1.5">E-Ticket No</th>
                        <th className="py-1 px-1.5">Airlines PNR</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-[#1c304a]">
                      <tr>
                        <td className="py-1 px-1.5">1</td>
                        <td className="py-1 px-1.5 font-bold">{selected.lastName}</td>
                        <td className="py-1 px-1.5">{selected.title}</td>
                        <td className="py-1 px-1.5 font-bold">{selected.firstName}</td>
                        <td className="py-1 px-1.5 font-mono">{selected.eTicketNumber}</td>
                        <td className="py-1 px-1.5 font-mono font-bold text-[#D60D26]">
                          {selected.airlinePnr}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="rounded-lg bg-emerald-50/70 p-2 text-center text-xs text-emerald-800 font-bold border border-emerald-200 mt-3">
                  Status: {selected.status} on Global Distribution System
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 border-t pt-3">
              <button
                type="button"
                onClick={() => handleAction("Approved")}
                className="rounded-lg bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-700 shadow-sm"
              >
                Approve Amendment
              </button>
              <button
                type="button"
                onClick={() => handleAction("Rejected")}
                className="rounded-lg bg-rose-50 px-3 py-2 text-xs font-bold text-rose-700 border border-rose-200 hover:bg-rose-100"
              >
                Reject Amendment
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
