"use client";

import React, { useState } from "react";
import { HelpCircle, Phone, Mail, MessageSquare, Send, CheckCircle2 } from "lucide-react";

export function HelpCenterSection() {
  const [subject, setSubject] = useState("");
  const [msg, setMsg] = useState("");
  const [toast, setToast] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setToast("Support ticket #TKT-" + Math.floor(1000 + Math.random() * 9000) + " submitted!");
    setSubject("");
    setMsg("");
    setTimeout(() => setToast(null), 3500);
  };

  return (
    <div className="space-y-5">
      {toast && (
        <div className="rounded-lg bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-md">
          ✓ {toast}
        </div>
      )}

      <div>
        <h2 className="text-xl font-black text-[#1c304a]">Help & Priority Support Desk</h2>
        <p className="text-xs text-slate-500">
          Get direct assistance with offline ticketing holds, PNR sync issues, and commercial settlements.
        </p>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="rounded-[10px] border border-[#e8ebef] bg-white p-5 shadow-sm space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wide text-[#1c304a] border-b pb-2">
            Dedicated Account Manager
          </h3>

          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#1c304a] text-base font-bold text-white">
              RK
            </div>
            <div>
              <p className="font-bold text-[#1c304a]">Rajesh Khanna</p>
              <p className="text-xs text-slate-400">Head of Agency Accounts</p>
            </div>
          </div>

          <div className="space-y-2 text-xs text-slate-600 pt-2 border-t">
            <p className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-[#006aec]" />
              <span className="font-semibold">+91 98111 88990 (Direct Desk)</span>
            </p>
            <p className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-[#006aec]" />
              <span className="font-semibold">rajesh.k@occ.services</span>
            </p>
            <p className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-emerald-600" />
              <span>Available 24/7 for urgent PNR releases</span>
            </p>
          </div>
        </div>

        <div className="rounded-[10px] border border-[#e8ebef] bg-white p-5 shadow-sm lg:col-span-2 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wide text-[#1c304a] border-b pb-2">
            Raise Urgent Support Ticket
          </h3>

          <form onSubmit={handleSubmit} className="space-y-3 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Subject / Issue Title</label>
              <input
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. Airline PNR attachment failed for Booking BK-88421"
                className="w-full rounded-lg border border-slate-300 p-2.5 outline-none focus:border-[#D60D26]"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Message Description</label>
              <textarea
                required
                rows={4}
                value={msg}
                onChange={(e) => setMsg(e.target.value)}
                placeholder="Provide PNR details, flight numbers, or bank UTR reference..."
                className="w-full rounded-lg border border-slate-300 p-2.5 outline-none focus:border-[#D60D26]"
              />
            </div>

            <button
              type="submit"
              className="flex items-center gap-1.5 rounded-lg bg-[#D60D26] px-4 py-2 text-xs font-bold text-white hover:bg-[#b00b1f] shadow-sm"
            >
              <Send className="h-3.5 w-3.5" />
              Submit Priority Ticket
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

function Clock(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}
