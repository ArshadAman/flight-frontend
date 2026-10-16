"use client";

import React, { useEffect, useState } from "react";
import { Plus, Trash2, X, DollarSign, Search, Filter } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { getPublicApiUrl } from "@/lib/apiConfig";

interface ServiceChargeItem {
  id: string; // 47522
  name: string; // Domestic Booking
  applyOn: "Booking" | "Reissue" | "Cancelation" | "Refund" | "Offline";
  journey: "Domestic" | "International";
  tripType: "One way" | "Round" | "Multi city";
  airline: string; // Air India, Indigo, All
  fee: number; // 150
  gstPercent: number;
  updateDate: string; // 22, Dec 2021 | 12:30 PM
  status: "Active" | "Disabled";
}

const initialCharges: ServiceChargeItem[] = [
  {
    id: "47522",
    name: "Domestic Booking",
    applyOn: "Booking",
    journey: "Domestic",
    tripType: "One way",
    airline: "Air India",
    fee: 150,
    gstPercent: 18,
    updateDate: "22, Dec 2021 | 12:30 PM",
    status: "Active",
  },
  {
    id: "23853",
    name: "International Booking",
    applyOn: "Booking",
    journey: "International",
    tripType: "Round",
    airline: "All Airlines",
    fee: 450,
    gstPercent: 18,
    updateDate: "22, Dec 2021 | 11:15 AM",
    status: "Active",
  },
  {
    id: "01272",
    name: "Reissue Fee",
    applyOn: "Reissue",
    journey: "Domestic",
    tripType: "One way",
    airline: "Indigo",
    fee: 300,
    gstPercent: 18,
    updateDate: "21, Dec 2021 | 04:30 PM",
    status: "Active",
  },
  {
    id: "90726",
    name: "Cancelation Fee",
    applyOn: "Cancelation",
    journey: "Domestic",
    tripType: "One way",
    airline: "All Airlines",
    fee: 250,
    gstPercent: 18,
    updateDate: "20, Dec 2021 | 02:00 PM",
    status: "Active",
  },
  {
    id: "90727",
    name: "Refund Processing",
    applyOn: "Refund",
    journey: "International",
    tripType: "Multi city",
    airline: "Air India",
    fee: 500,
    gstPercent: 18,
    updateDate: "18, Dec 2021 | 10:20 AM",
    status: "Disabled",
  },
  {
    id: "90728",
    name: "Offline Booking",
    applyOn: "Offline",
    journey: "Domestic",
    tripType: "One way",
    airline: "Indigo",
    fee: 200,
    gstPercent: 18,
    updateDate: "15, Dec 2021 | 03:45 PM",
    status: "Active",
  },
];

export function ServiceChargesSection() {
  const { access } = useAuth();
  const [charges, setCharges] = useState<ServiceChargeItem[]>(initialCharges);
  const [search, setSearch] = useState("");
  const [journeyFilter, setJourneyFilter] = useState<string>("All");
  const [modalOpen, setModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [applyOn, setApplyOn] = useState<ServiceChargeItem["applyOn"]>("Booking");
  const [journey, setJourney] = useState<ServiceChargeItem["journey"]>("Domestic");
  const [tripType, setTripType] = useState<ServiceChargeItem["tripType"]>("One way");
  const [airline, setAirline] = useState("All Airlines");
  const [fee, setFee] = useState("");
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (!access) return;
    const fetchCharges = async () => {
      try {
        const apiBase = getPublicApiUrl();
        const res = await fetch(`${apiBase}/agents/service-charges/`, {
          headers: { Authorization: `Bearer ${access}` },
        });
        if (res.ok) {
          const data = await res.json();
          const items = Array.isArray(data) ? data : data?.results || [];
          if (items.length > 0) {
            const mapped: ServiceChargeItem[] = items.map((c: any, idx: number) => ({
              id: c.code || c.id || String(47520 + idx),
              name: c.name || "Domestic Booking",
              applyOn: (c.apply_on as any) || "Booking",
              journey: (c.journey as any) || "Domestic",
              tripType: "One way",
              airline: c.airline || "All Airlines",
              fee: Number(c.amount) || 150,
              gstPercent: Number(c.gst_rate) || 18,
              updateDate: "22, Dec 2021 | 12:30 PM",
              status: c.is_active ? "Active" : "Disabled",
            }));
            setCharges(mapped);
          }
        }
      } catch {
        /* fallback */
      }
    };
    void fetchCharges();
  }, [access]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !fee) return;
    const numFee = parseFloat(fee) || 0;
    const rule: ServiceChargeItem = {
      id: String(Math.floor(10000 + Math.random() * 90000)),
      name,
      applyOn,
      journey,
      tripType,
      airline,
      fee: numFee,
      gstPercent: 18,
      updateDate: "Today | 12:30 PM",
      status: "Active",
    };

    setCharges([rule, ...charges]);
    setModalOpen(false);
    setName("");
    setFee("");
    setToast(`Service charge "${rule.name}" created successfully!`);
    setTimeout(() => setToast(null), 3000);
  };

  const filtered = charges.filter((c) => {
    if (journeyFilter !== "All" && c.journey !== journeyFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        c.name.toLowerCase().includes(q) ||
        c.id.toLowerCase().includes(q) ||
        c.airline.toLowerCase().includes(q) ||
        c.applyOn.toLowerCase().includes(q)
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

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-[#1c304a]">Service Charges List</h2>
          <p className="text-xs text-slate-500">
            Agency convenience and transaction charge rules per flight booking and reissue workflow.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-1.5 rounded-lg bg-[#D60D26] px-3.5 py-2 text-xs font-bold text-white hover:bg-[#b00b1f] shadow-md transition-all"
          >
            <Plus className="h-4 w-4" />
            Add Service Charge
          </button>
        </div>
      </div>

      {/* KPI Cards exactly matching Figma line 1256 (Active Charges 40, Inactive 13, Total ₹45k, Platform ₹30k, Agent ₹15k) */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <div className="rounded-[10px] border border-[#e8ebef] bg-white p-4 shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase">Active Charges</p>
          <p className="mt-1 text-2xl font-black text-[#006aec]">40</p>
          <span className="text-[11px] font-semibold text-slate-500">In Live Operation</span>
        </div>
        <div className="rounded-[10px] border border-[#e8ebef] bg-white p-4 shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase">Inactive Charges</p>
          <p className="mt-1 text-2xl font-black text-slate-400">13</p>
          <span className="text-[11px] font-semibold text-slate-400">Disabled Rules</span>
        </div>
        <div className="rounded-[10px] border border-[#e8ebef] bg-white p-4 shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase">Total Charges Fee</p>
          <p className="mt-1 text-2xl font-black text-[#1c304a]">₹45k</p>
          <span className="text-[11px] font-semibold text-emerald-600">Total Collected</span>
        </div>
        <div className="rounded-[10px] border border-[#e8ebef] bg-white p-4 shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase">Platform Charges</p>
          <p className="mt-1 text-2xl font-black text-purple-700">₹30k</p>
          <span className="text-[11px] font-semibold text-slate-500">Base Gateway</span>
        </div>
        <div className="rounded-[10px] border border-[#e8ebef] bg-white p-4 shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase">Agent Charges Fee</p>
          <p className="mt-1 text-2xl font-black text-emerald-700">₹15k</p>
          <span className="text-[11px] font-semibold text-emerald-600">Agency Profit Share</span>
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#e8ebef] pb-3">
        <div className="flex items-center gap-2">
          {["All", "Domestic", "International"].map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setJourneyFilter(tab)}
              className={cn(
                "rounded-lg px-3 py-1.5 text-xs font-bold transition-all",
                journeyFilter === tab
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
            placeholder="Search Charges Name, Airline..."
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
                <th className="px-4 py-3">Charge ID</th>
                <th className="px-4 py-3">Charges Name</th>
                <th className="px-4 py-3">Apply On</th>
                <th className="px-4 py-3">Journey</th>
                <th className="px-4 py-3">Trip type</th>
                <th className="px-4 py-3">Airline</th>
                <th className="px-4 py-3">Fee / Amount</th>
                <th className="px-4 py-3">Update Date</th>
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
                  <td className="px-4 py-3 font-bold text-[#1c304a]">{item.name}</td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-700 border border-blue-200">
                      {item.applyOn}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-medium text-slate-700">{item.journey}</td>
                  <td className="px-4 py-3 text-slate-600">{item.tripType}</td>
                  <td className="px-4 py-3 font-semibold text-slate-800">{item.airline}</td>
                  <td className="px-4 py-3 font-black text-emerald-700">
                    ₹{item.fee.toLocaleString("en-IN")}
                  </td>
                  <td className="px-4 py-3 text-slate-500">{item.updateDate}</td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 text-[10px] font-bold border",
                        item.status === "Active"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : "bg-slate-100 text-slate-600 border border-slate-200"
                      )}
                    >
                      ● {item.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => {
                        const updated = charges.map((c) =>
                          c.id === item.id
                            ? { ...c, status: (c.status === "Active" ? "Disabled" : "Active") as "Active" | "Disabled" }
                            : c
                        );
                        setCharges(updated);
                        setToast(`Rule "${item.name}" toggled to ${item.status === "Active" ? "Disabled" : "Active"}`);
                        setTimeout(() => setToast(null), 3000);
                      }}
                      className="rounded border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-bold text-slate-700 hover:bg-slate-50 hover:text-[#006aec]"
                    >
                      {item.status === "Active" ? "Disable" : "Enable"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-base font-black text-[#1c304a]">Add New Service Charge</h3>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="rounded-full p-1 text-slate-400 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAdd} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Charges Name *</label>
                <input
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Domestic Booking Fee"
                  className="w-full rounded-lg border border-slate-300 p-2 text-xs outline-none focus:border-[#D60D26]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Apply On</label>
                  <select
                    value={applyOn}
                    onChange={(e) => setApplyOn(e.target.value as any)}
                    className="w-full rounded-lg border border-slate-300 p-2 text-xs outline-none focus:border-[#D60D26] bg-white"
                  >
                    <option value="Booking">Booking</option>
                    <option value="Reissue">Reissue</option>
                    <option value="Cancelation">Cancelation</option>
                    <option value="Refund">Refund</option>
                    <option value="Offline">Offline</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Journey</label>
                  <select
                    value={journey}
                    onChange={(e) => setJourney(e.target.value as any)}
                    className="w-full rounded-lg border border-slate-300 p-2 text-xs outline-none focus:border-[#D60D26] bg-white"
                  >
                    <option value="Domestic">Domestic</option>
                    <option value="International">International</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Trip Type</label>
                  <select
                    value={tripType}
                    onChange={(e) => setTripType(e.target.value as any)}
                    className="w-full rounded-lg border border-slate-300 p-2 text-xs outline-none focus:border-[#D60D26] bg-white"
                  >
                    <option value="One way">One way</option>
                    <option value="Round">Round</option>
                    <option value="Multi city">Multi city</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Airline</label>
                  <select
                    value={airline}
                    onChange={(e) => setAirline(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 p-2 text-xs outline-none focus:border-[#D60D26] bg-white"
                  >
                    <option value="All Airlines">All Airlines</option>
                    <option value="Air India">Air India</option>
                    <option value="Indigo">Indigo</option>
                    <option value="Vistara">Vistara</option>
                    <option value="SpiceJet">SpiceJet</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Fee Amount (₹) *</label>
                <input
                  type="number"
                  required
                  value={fee}
                  onChange={(e) => setFee(e.target.value)}
                  placeholder="e.g. 150"
                  className="w-full rounded-lg border border-slate-300 p-2 text-xs outline-none focus:border-[#D60D26]"
                />
              </div>

              <div className="flex justify-end gap-2 border-t pt-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="rounded-lg border border-slate-300 px-3 py-1.5 font-bold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-[#D60D26] px-4 py-1.5 font-bold text-white hover:bg-[#b00b1f]"
                >
                  Save Charge Rule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
