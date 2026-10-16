"use client";

import React, { useState } from "react";
import { Plus, SlidersHorizontal, Trash2, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface MarkupRule {
  id: string;
  channel: "B2B" | "B2C" | "API";
  airline: string;
  sector: string;
  type: "Fixed" | "Percentage";
  value: number;
  status: "Active" | "Disabled";
  updatedAt: string;
}

const initialMarkups: MarkupRule[] = [
  {
    id: "MKP-01",
    channel: "B2B",
    airline: "IndiGo (6E)",
    sector: "All Domestic",
    type: "Fixed",
    value: 250,
    status: "Active",
    updatedAt: "Today",
  },
  {
    id: "MKP-02",
    channel: "B2B",
    airline: "Air India (AI)",
    sector: "All Domestic",
    type: "Percentage",
    value: 3.5,
    status: "Active",
    updatedAt: "Yesterday",
  },
  {
    id: "MKP-03",
    channel: "B2C",
    airline: "All Airlines",
    sector: "DEL-BOM Special",
    type: "Fixed",
    value: 400,
    status: "Active",
    updatedAt: "12 Oct 2026",
  },
  {
    id: "MKP-04",
    channel: "API",
    airline: "Vistara (UK)",
    sector: "Metro Routes",
    type: "Percentage",
    value: 2.0,
    status: "Active",
    updatedAt: "10 Oct 2026",
  },
];

export function MarkupsSection() {
  const [markups, setMarkups] = useState<MarkupRule[]>(initialMarkups);
  const [modalOpen, setModalOpen] = useState(false);
  const [channel, setChannel] = useState<"B2B" | "B2C" | "API">("B2B");
  const [airline, setAirline] = useState("IndiGo (6E)");
  const [sector, setSector] = useState("All Domestic");
  const [type, setType] = useState<"Fixed" | "Percentage">("Fixed");
  const [value, setValue] = useState("");
  const [toast, setToast] = useState<string | null>(null);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!value) return;
    const rule: MarkupRule = {
      id: `MKP-${Date.now().toString().slice(-4)}`,
      channel,
      airline,
      sector,
      type,
      value: parseFloat(value),
      status: "Active",
      updatedAt: "Just now",
    };
    setMarkups((prev) => [rule, ...prev]);
    setModalOpen(false);
    setValue("");
    setToast(`Markup rule #${rule.id} added!`);
    setTimeout(() => setToast(null), 3000);
  };

  const handleDelete = (id: string) => {
    setMarkups((prev) => prev.filter((m) => m.id !== id));
    setToast(`Markup rule #${id} deleted.`);
    setTimeout(() => setToast(null), 3000);
  };

  return (
    <div className="space-y-5">
      {toast && (
        <div className="rounded-lg bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-md">
          ✓ {toast}
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-[#1c304a]">Flight Markup Matrix</h2>
          <p className="text-xs text-slate-500">
            Configure dynamic commercial profit markups by channel, airline carrier, and flight sectors.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-1.5 rounded-lg bg-[#D60D26] px-3.5 py-2 text-xs font-bold text-white hover:bg-[#b00b1f] shadow-sm"
        >
          <Plus className="h-4 w-4" />
          Add Markup Rule
        </button>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-[10px] border border-[#e8ebef] bg-white p-4 shadow-sm">
          <p className="text-[11px] font-semibold text-slate-400">Default B2B Domestic Markup</p>
          <p className="text-xl font-black text-[#1c304a] mt-1">₹250 / Seat</p>
          <span className="text-[10px] text-emerald-600 font-bold">Applied to sub-agents</span>
        </div>
        <div className="rounded-[10px] border border-[#e8ebef] bg-white p-4 shadow-sm">
          <p className="text-[11px] font-semibold text-slate-400">Default B2C Public Markup</p>
          <p className="text-xl font-black text-blue-700 mt-1">₹400 / Seat</p>
          <span className="text-[10px] text-blue-600 font-bold">Retail storefronts</span>
        </div>
        <div className="rounded-[10px] border border-[#e8ebef] bg-white p-4 shadow-sm">
          <p className="text-[11px] font-semibold text-slate-400">Total Active Rules</p>
          <p className="text-xl font-black text-slate-700 mt-1">{markups.length} Rules</p>
          <span className="text-[10px] text-slate-400">Real-time dynamic pricing</span>
        </div>
      </div>

      <div className="overflow-hidden rounded-[10px] border border-[#e8ebef] bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-[#e8ebef] bg-slate-50/70 font-semibold text-slate-500 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="px-4 py-3">Rule ID</th>
                <th className="px-4 py-3">Sales Channel</th>
                <th className="px-4 py-3">Airline Carrier</th>
                <th className="px-4 py-3">Sector</th>
                <th className="px-4 py-3">Markup Type</th>
                <th className="px-4 py-3">Markup Value</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-[#1c304a]">
              {markups.map((m) => (
                <tr key={m.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="px-4 py-3 font-mono font-bold text-slate-500">{m.id}</td>
                  <td className="px-4 py-3">
                    <span className="rounded bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-[#006aec]">
                      {m.channel}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-semibold">{m.airline}</td>
                  <td className="px-4 py-3 text-slate-600">{m.sector}</td>
                  <td className="px-4 py-3 text-slate-500">{m.type}</td>
                  <td className="px-4 py-3 font-black text-emerald-700">
                    {m.type === "Fixed" ? `₹${m.value}` : `${m.value}%`}
                  </td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200">
                      ● {m.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => handleDelete(m.id)}
                      className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                      title="Delete Rule"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <form
            onSubmit={handleAdd}
            className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl space-y-4"
          >
            <div className="flex items-start justify-between border-b pb-3">
              <h3 className="text-base font-black text-[#1c304a]">Add New Markup Rule</h3>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="rounded-full p-1 text-slate-400 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Sales Channel</label>
                <select
                  value={channel}
                  onChange={(e) => setChannel(e.target.value as any)}
                  className="w-full rounded-lg border border-slate-300 p-2.5 outline-none focus:border-[#D60D26]"
                >
                  <option value="B2B">B2B (Sub-Agents)</option>
                  <option value="B2C">B2C (Direct Storefront)</option>
                  <option value="API">API Distribution</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Airline</label>
                <select
                  value={airline}
                  onChange={(e) => setAirline(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 p-2.5 outline-none focus:border-[#D60D26]"
                >
                  <option value="IndiGo (6E)">IndiGo (6E)</option>
                  <option value="Air India (AI)">Air India (AI)</option>
                  <option value="Vistara (UK)">Vistara (UK)</option>
                  <option value="SpiceJet (SG)">SpiceJet (SG)</option>
                  <option value="All Airlines">All Airlines</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Flight Sector</label>
                <input
                  required
                  value={sector}
                  onChange={(e) => setSector(e.target.value)}
                  placeholder="e.g. All Domestic, or DEL-BOM"
                  className="w-full rounded-lg border border-slate-300 p-2.5 outline-none focus:border-[#D60D26]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Markup Type</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as any)}
                    className="w-full rounded-lg border border-slate-300 p-2.5 outline-none focus:border-[#D60D26]"
                  >
                    <option value="Fixed">Fixed ₹ Flat</option>
                    <option value="Percentage">Percentage %</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Value ({type === "Fixed" ? "₹" : "%"})</label>
                  <input
                    required
                    type="number"
                    step="any"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    placeholder={type === "Fixed" ? "250" : "3.5"}
                    className="w-full rounded-lg border border-slate-300 p-2.5 outline-none focus:border-[#D60D26]"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-lg bg-[#D60D26] px-4 py-1.5 text-xs font-bold text-white hover:bg-[#b00b1f]"
              >
                Save Markup Rule
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
