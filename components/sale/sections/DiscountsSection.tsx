"use client";

import React, { useEffect, useState } from "react";
import { Plus, Search, Tag, X, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { getPublicApiUrl } from "@/lib/apiConfig";

interface DiscountRule {
  id: string;
  code: string;
  airline: string;
  airlineType: string;
  value: string;
  validity: string;
  status: "Active" | "Expired";
  remark: string;
}

const initialDiscounts: DiscountRule[] = [
  {
    id: "DSC-1",
    code: "INDIGO500",
    airline: "IndiGo",
    airlineType: "Domestic",
    value: "₹500 Flat",
    validity: "Until 31 Dec 2026",
    status: "Active",
    remark: "Corporate sales campaign",
  },
  {
    id: "DSC-2",
    code: "FLYAIR5",
    airline: "Air India",
    airlineType: "Domestic & Intl",
    value: "5% Off",
    validity: "Until 15 Nov 2026",
    status: "Active",
    remark: "All classes except Economy Lite",
  },
  {
    id: "DSC-3",
    code: "VISTARA10",
    airline: "Vistara",
    airlineType: "Domestic",
    value: "10% Off",
    validity: "Expired (30 Sep 2026)",
    status: "Expired",
    remark: "Monsoon festival discount",
  },
];

export function DiscountsSection() {
  const { access } = useAuth();
  const [discounts, setDiscounts] = useState<DiscountRule[]>(initialDiscounts);
  const [modalOpen, setModalOpen] = useState(false);
  const [newCode, setNewCode] = useState("");
  const [newAirline, setNewAirline] = useState("All Airlines");
  const [newValue, setNewValue] = useState("");
  const [newRemark, setNewRemark] = useState("");
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (!access) return;
    const fetchDiscounts = async () => {
      try {
        const apiBase = getPublicApiUrl();
        const res = await fetch(`${apiBase}/agents/discounts/`, {
          headers: { Authorization: `Bearer ${access}` },
        });
        if (res.ok) {
          const data = await res.json();
          const items = Array.isArray(data) ? data : data?.results || [];
          if (items.length > 0) {
            const mapped: DiscountRule[] = items.map((d: any) => ({
              id: d.id,
              code: d.code,
              airline: d.title || "All Airlines",
              airlineType: d.discount_type === "PERCENTAGE" ? "Percentage" : "Fixed",
              value: d.discount_type === "PERCENTAGE" ? `${d.value}% Off` : `₹${d.value} Flat`,
              validity: d.valid_until ? `Until ${d.valid_until}` : "Until 31 Dec 2026",
              status: d.is_active ? "Active" : "Expired",
              remark: d.title || "Live promo rule",
            }));
            setDiscounts(mapped);
          }
        }
      } catch {
        /* fallback to initial */
      }
    };
    void fetchDiscounts();
  }, [access]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCode || !newValue) return;
    const numVal = parseFloat(newValue.replace(/[^0-9.]/g, "")) || 500;
    const rule: DiscountRule = {
      id: `DSC-${Date.now().toString().slice(-4)}`,
      code: newCode.toUpperCase(),
      airline: newAirline,
      airlineType: "Domestic",
      value: newValue,
      validity: "Until 31 Dec 2026",
      status: "Active",
      remark: newRemark || "Agent custom promo rule",
    };

    setDiscounts((prev) => [rule, ...prev]);
    setModalOpen(false);
    setNewCode("");
    setNewValue("");
    setNewRemark("");
    setToast(`Discount code ${rule.code} added successfully!`);
    setTimeout(() => setToast(null), 3000);

    if (access) {
      try {
        const apiBase = getPublicApiUrl();
        await fetch(`${apiBase}/agents/discounts/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${access}`,
          },
          body: JSON.stringify({
            code: rule.code,
            title: rule.airline,
            discount_type: newValue.includes("%") ? "PERCENTAGE" : "FIXED",
            value: numVal,
            is_active: true,
          }),
        });
      } catch {
        /* local state preserved */
      }
    }
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
          <h2 className="text-xl font-black text-[#1c304a]">Discount Rules & Coupons</h2>
          <p className="text-xs text-slate-500">
            Define promotional discount vouchers and airline incentive rules for your sub-agents and customers.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-1.5 rounded-lg bg-[#D60D26] px-3.5 py-2 text-xs font-bold text-white hover:bg-[#b00b1f] shadow-sm"
        >
          <Plus className="h-4 w-4" />
          Add Discount Rule
        </button>
      </div>

      <div className="overflow-hidden rounded-[10px] border border-[#e8ebef] bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-[#e8ebef] bg-slate-50/70 font-semibold text-slate-500 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="px-4 py-3">Promo Code</th>
                <th className="px-4 py-3">Applicable Airline</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Discount Value</th>
                <th className="px-4 py-3">Validity</th>
                <th className="px-4 py-3">Remarks</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-[#1c304a]">
              {discounts.map((d) => (
                <tr key={d.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="px-4 py-3 font-mono font-bold text-[#D60D26]">
                    <span className="rounded bg-rose-50 px-2 py-0.5 border border-rose-200">
                      {d.code}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-semibold">{d.airline}</td>
                  <td className="px-4 py-3 text-slate-500">{d.airlineType}</td>
                  <td className="px-4 py-3 font-black text-emerald-700">{d.value}</td>
                  <td className="px-4 py-3 text-slate-600">{d.validity}</td>
                  <td className="px-4 py-3 text-slate-400">{d.remark}</td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 text-[10px] font-bold",
                        d.status === "Active"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-slate-100 text-slate-500 border border-slate-200"
                      )}
                    >
                      ● {d.status}
                    </span>
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
              <h3 className="text-base font-black text-[#1c304a]">Add New Discount Rule</h3>
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
                <label className="block font-bold text-slate-700 mb-1">Coupon / Promo Code</label>
                <input
                  required
                  value={newCode}
                  onChange={(e) => setNewCode(e.target.value)}
                  placeholder="e.g. DIWALI500"
                  className="w-full rounded-lg border border-slate-300 p-2.5 font-mono uppercase font-bold outline-none focus:border-[#D60D26]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Applicable Airline</label>
                <select
                  value={newAirline}
                  onChange={(e) => setNewAirline(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 p-2.5 outline-none focus:border-[#D60D26]"
                >
                  <option value="All Airlines">All Airlines</option>
                  <option value="IndiGo">IndiGo (6E)</option>
                  <option value="Air India">Air India (AI)</option>
                  <option value="Vistara">Vistara (UK)</option>
                  <option value="SpiceJet">SpiceJet (SG)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Discount Amount / %</label>
                <input
                  required
                  value={newValue}
                  onChange={(e) => setNewValue(e.target.value)}
                  placeholder="e.g. ₹500 or 7%"
                  className="w-full rounded-lg border border-slate-300 p-2.5 outline-none focus:border-[#D60D26]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Remarks</label>
                <input
                  value={newRemark}
                  onChange={(e) => setNewRemark(e.target.value)}
                  placeholder="Internal description"
                  className="w-full rounded-lg border border-slate-300 p-2.5 outline-none focus:border-[#D60D26]"
                />
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
                Save Discount
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
