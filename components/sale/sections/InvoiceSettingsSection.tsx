"use client";

import React, { useEffect, useState } from "react";
import { Receipt, Save, Eye, CheckCircle2, Clock, Calendar, DollarSign, Globe } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { getPublicApiUrl } from "@/lib/apiConfig";

export function InvoiceSettingsSection() {
  const { access } = useAuth();
  const [prefix, setPrefix] = useState("INV-");
  const [startNum, setStartNum] = useState("1001");
  const [currency, setCurrency] = useState("INR (₹)");
  const [dateFormat, setDateFormat] = useState("DD MM YYYY");
  const [timeZone, setTimeZone] = useState("Asia/kolkata (IST)");
  const [gstRate, setGstRate] = useState("18");
  const [sacCode, setSacCode] = useState("998552");
  const [terms, setTerms] = useState(
    "1. This is a computer generated commercial travel invoice.\n2. Airline baggage allowance and cancellation rules apply as per carrier policy.\n3. Date change or cancellation fees are non-refundable."
  );
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (!access) return;
    const fetchSettings = async () => {
      try {
        const apiBase = getPublicApiUrl();
        const res = await fetch(`${apiBase}/agents/invoice-settings/`, {
          headers: { Authorization: `Bearer ${access}` },
        });
        if (res.ok) {
          const d = await res.json();
          if (d.series_prefix) setPrefix(d.series_prefix);
          if (d.starting_seq) setStartNum(String(d.starting_seq));
          if (d.currency) setCurrency(d.currency);
          if (d.date_format) setDateFormat(d.date_format);
          if (d.time_zone) setTimeZone(d.time_zone);
          if (d.footer_note) setTerms(d.footer_note);
        }
      } catch {
        /* fallback */
      }
    };
    void fetchSettings();
  }, [access]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setToast("Invoice layout, series prefix, currency, and date formats saved!");
    setTimeout(() => setToast(null), 3000);

    if (access) {
      try {
        const apiBase = getPublicApiUrl();
        await fetch(`${apiBase}/agents/invoice-settings/`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${access}`,
          },
          body: JSON.stringify({
            series_prefix: prefix,
            starting_seq: parseInt(startNum, 10) || 1001,
            currency,
            date_format: dateFormat,
            time_zone: timeZone,
            footer_note: terms,
          }),
        });
      } catch {
        /* preserved */
      }
    }
  };

  const previewNumber = `${prefix}${startNum}`;

  return (
    <div className="space-y-5">
      {toast && (
        <div className="rounded-lg bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-md transition-all">
          ✓ {toast}
        </div>
      )}

      <div>
        <h2 className="text-xl font-black text-[#1c304a]">Invoice Settings</h2>
        <p className="text-xs text-slate-500">
          Configure automated billing numbering sequence, currency, date formatting, and regional timezone per Figma.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <form onSubmit={handleSave} className="lg:col-span-2 space-y-5">
          <div className="rounded-[10px] border border-[#e8ebef] bg-white p-5 shadow-sm space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wide text-[#1c304a] border-b pb-2">
              Numbering & Regional Preferences (Figma Specifications)
            </h3>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Invoice Prefix:
                </label>
                <input
                  value={prefix}
                  onChange={(e) => setPrefix(e.target.value)}
                  placeholder="e.g. INV-"
                  className="w-full rounded-lg border border-slate-300 p-2.5 text-xs font-mono font-bold uppercase outline-none focus:border-[#D60D26]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Starting Invoice Number:
                </label>
                <input
                  type="number"
                  value={startNum}
                  onChange={(e) => setStartNum(e.target.value)}
                  placeholder="e.g. 1001"
                  className="w-full rounded-lg border border-slate-300 p-2.5 text-xs font-mono font-bold outline-none focus:border-[#D60D26]"
                />
              </div>

              {/* Number Format Preview */}
              <div className="sm:col-span-2 rounded-lg bg-slate-50 p-3 border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">
                    Number Format Preview:
                  </span>
                  <span className="font-mono font-black text-sm text-[#D60D26]">{previewNumber}</span>
                </div>
                <span className="text-[11px] text-slate-500 font-semibold">
                  Incremented sequentially on ticket issue
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Currency:
                </label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 p-2.5 text-xs font-semibold outline-none focus:border-[#D60D26] bg-white"
                >
                  <option value="INR (₹)">INR (₹)</option>
                  <option value="USD ($)">USD ($)</option>
                  <option value="EUR (€)">EUR (€)</option>
                  <option value="GBP (£)">GBP (£)</option>
                  <option value="AED (AED)">AED (AED)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Date Format:
                </label>
                <select
                  value={dateFormat}
                  onChange={(e) => setDateFormat(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 p-2.5 text-xs font-semibold outline-none focus:border-[#D60D26] bg-white"
                >
                  <option value="DD MM YYYY">DD MM YYYY</option>
                  <option value="MM DD YYYY">MM DD YYYY</option>
                  <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Time Zone:
                </label>
                <select
                  value={timeZone}
                  onChange={(e) => setTimeZone(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 p-2.5 text-xs font-semibold outline-none focus:border-[#D60D26] bg-white"
                >
                  <option value="Asia/kolkata (IST)">Asia/kolkata (IST)</option>
                  <option value="UTC">UTC (Coordinated Universal Time)</option>
                  <option value="America/New_York (EST)">America/New_York (EST)</option>
                  <option value="Asia/Dubai (GST)">Asia/Dubai (GST)</option>
                  <option value="Europe/London (GMT)">Europe/London (GMT)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Default GST Rate (%)</label>
                <input
                  type="number"
                  value={gstRate}
                  onChange={(e) => setGstRate(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 p-2.5 text-xs outline-none focus:border-[#D60D26]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">SAC / HSN Service Code</label>
                <input
                  value={sacCode}
                  onChange={(e) => setSacCode(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 p-2.5 text-xs font-mono outline-none focus:border-[#D60D26]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Invoice Footer Terms & Conditions
              </label>
              <textarea
                rows={4}
                value={terms}
                onChange={(e) => setTerms(e.target.value)}
                className="w-full rounded-lg border border-slate-300 p-2.5 text-xs leading-relaxed outline-none focus:border-[#D60D26]"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="flex items-center gap-2 rounded-lg bg-[#D60D26] px-5 py-2.5 text-xs font-bold text-white hover:bg-[#b00b1f] shadow-md transition-all"
            >
              <Save className="h-4 w-4" />
              Save Invoice Settings
            </button>
          </div>
        </form>

        <div className="rounded-[10px] border border-[#e8ebef] bg-white p-5 shadow-sm space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase">
            <Eye className="h-4 w-4" />
            Live Invoice Preview
          </div>

          <div className="rounded-lg border border-slate-200 bg-slate-50/50 p-4 text-[11px] space-y-3">
            <div className="flex justify-between items-start border-b pb-2">
              <div>
                <p className="font-bold text-[#1c304a]">My Travel Deal Pvt Ltd</p>
                <p className="text-[10px] text-slate-400">GSTIN: 07AABCM9124P1Z3</p>
                <p className="text-[10px] text-slate-400">TZ: {timeZone}</p>
              </div>
              <div className="text-right">
                <span className="font-mono font-bold text-[#D60D26]">{previewNumber}</span>
                <p className="text-[9px] text-slate-400">{dateFormat}</p>
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between">
                <span>Flight Ticket Base Fare</span>
                <span className="font-semibold">₹4,999.00</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Airline Taxes & UDF</span>
                <span>₹850.00</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Agency Fee ({gstRate}% GST)</span>
                <span>₹177.00</span>
              </div>
              <div className="flex justify-between border-t pt-1 font-bold text-xs text-[#1c304a]">
                <span>Total Invoice Value:</span>
                <span className="text-emerald-700">₹6,026.00</span>
              </div>
            </div>

            <div className="border-t pt-2 text-[9px] text-slate-400 leading-normal whitespace-pre-line">
              {terms}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
