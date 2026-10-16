"use client";

import React, { useEffect, useState } from "react";
import { Plus, Trash2, X, DollarSign } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { getPublicApiUrl } from "@/lib/apiConfig";

interface ServiceChargeRule {
  id: string;
  name: string;
  category: "Domestic Flights" | "International Flights" | "Group Booking" | "Offline PNR Attachment";
  fee: number;
  gstPercent: number;
  status: "Active" | "Disabled";
}

const initialCharges: ServiceChargeRule[] = [
  {
    id: "SC-01",
    name: "Domestic Flight Convenience Fee",
    category: "Domestic Flights",
    fee: 150,
    gstPercent: 18,
    status: "Active",
  },
  {
    id: "SC-02",
    name: "International Passenger Processing Charge",
    category: "International Flights",
    fee: 450,
    gstPercent: 18,
    status: "Active",
  },
  {
    id: "SC-03",
    name: "Offline PNR Attachment & Hold Service",
    category: "Offline PNR Attachment",
    fee: 200,
    gstPercent: 18,
    status: "Active",
  },
  {
    id: "SC-04",
    name: "Group Charter Booking Management Fee",
    category: "Group Booking",
    fee: 1200,
    gstPercent: 18,
    status: "Active",
  },
];

export function ServiceChargesSection() {
  const { access } = useAuth();
  const [charges, setCharges] = useState<ServiceChargeRule[]>(initialCharges);
  const [modalOpen, setModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [category, setCategory] = useState<ServiceChargeRule["category"]>("Domestic Flights");
  const [fee, setFee] = useState("");
  const [gstPercent, setGstPercent] = useState("18");
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
            const mapped: ServiceChargeRule[] = items.map((c: any) => ({
              id: c.code || c.id,
              name: c.name,
              category: "Domestic Flights",
              fee: Number(c.amount) || 0,
              gstPercent: Number(c.gst_rate) || 18,
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
    const numGst = parseFloat(gstPercent) || 18;
    const rule: ServiceChargeRule = {
      id: `SC-${Date.now().toString().slice(-4)}`,
      name,
      category,
      fee: numFee,
      gstPercent: numGst,
      status: "Active",
    };
    setCharges((prev) => [rule, ...prev]);
    setModalOpen(false);
    setName("");
    setFee("");
    setToast(`Service charge rule #${rule.id} added!`);
    setTimeout(() => setToast(null), 3000);

    if (access) {
      try {
        const apiBase = getPublicApiUrl();
        await fetch(`${apiBase}/agents/service-charges/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${access}`,
          },
          body: JSON.stringify({
            code: rule.id,
            name: rule.name,
            charge_type: "FIXED",
            amount: numFee,
            gst_rate: numGst,
            is_active: true,
          }),
        });
      } catch {
        /* local state preserved */
      }
    }
  };

  const handleDelete = (id: string) => {
    setCharges((prev) => prev.filter((c) => c.id !== id));
    setToast(`Service charge rule #${id} deleted.`);
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
          <h2 className="text-xl font-black text-[#1c304a]">Service Charges & Fees</h2>
          <p className="text-xs text-slate-500">
            Configure automated ticketing processing charges, convenience fees, and GST tax percentages.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-1.5 rounded-lg bg-[#D60D26] px-3.5 py-2 text-xs font-bold text-white hover:bg-[#b00b1f] shadow-sm"
        >
          <Plus className="h-4 w-4" />
          Add Service Charge
        </button>
      </div>

      <div className="overflow-hidden rounded-[10px] border border-[#e8ebef] bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-[#e8ebef] bg-slate-50/70 font-semibold text-slate-500 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="px-4 py-3">Charge Name</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Fee (₹)</th>
                <th className="px-4 py-3">Applicable GST</th>
                <th className="px-4 py-3">Net Fee (incl. GST)</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-[#1c304a]">
              {charges.map((c) => {
                const total = c.fee * (1 + c.gstPercent / 100);
                return (
                  <tr key={c.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-4 py-3 font-bold text-[#1c304a]">
                      {c.name}
                      <p className="text-[10px] text-slate-400 font-normal">{c.id}</p>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{c.category}</td>
                    <td className="px-4 py-3 font-bold text-[#1c304a]">₹{c.fee}</td>
                    <td className="px-4 py-3 text-slate-500">{c.gstPercent}%</td>
                    <td className="px-4 py-3 font-black text-emerald-700">₹{total.toFixed(0)}</td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200">
                        ● {c.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => handleDelete(c.id)}
                        className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                        title="Delete Rule"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
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
              <h3 className="text-base font-black text-[#1c304a]">Add New Service Charge</h3>
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
                <label className="block font-bold text-slate-700 mb-1">Fee Description</label>
                <input
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Booking Service Fee"
                  className="w-full rounded-lg border border-slate-300 p-2.5 outline-none focus:border-[#D60D26]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full rounded-lg border border-slate-300 p-2.5 outline-none focus:border-[#D60D26]"
                >
                  <option value="Domestic Flights">Domestic Flights</option>
                  <option value="International Flights">International Flights</option>
                  <option value="Offline PNR Attachment">Offline PNR Attachment</option>
                  <option value="Group Booking">Group Booking</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Amount (₹)</label>
                  <input
                    required
                    type="number"
                    value={fee}
                    onChange={(e) => setFee(e.target.value)}
                    placeholder="150"
                    className="w-full rounded-lg border border-slate-300 p-2.5 outline-none focus:border-[#D60D26]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">GST Rate (%)</label>
                  <input
                    required
                    type="number"
                    value={gstPercent}
                    onChange={(e) => setGstPercent(e.target.value)}
                    placeholder="18"
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
                Save Charge
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
