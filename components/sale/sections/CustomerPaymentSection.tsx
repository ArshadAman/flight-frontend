"use client";

import React, { useState } from "react";
import { Search, Wallet, ArrowUpRight, ArrowDownLeft, Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface CustomerBalance {
  id: string;
  name: string;
  email: string;
  phone: string;
  balance: number;
  currency: string;
  totalBookings: number;
  lastPaymentDate: string;
  status: "Active" | "Low Balance";
}

const initialCustomers: CustomerBalance[] = [
  {
    id: "CUS-801",
    name: "Amit Sharma",
    email: "amit.sharma@example.com",
    phone: "+91 98765 43210",
    balance: 14200,
    currency: "INR",
    totalBookings: 12,
    lastPaymentDate: "2026-10-14",
    status: "Active",
  },
  {
    id: "CUS-802",
    name: "Sneha Reddy",
    email: "sneha.r@gmail.com",
    phone: "+91 98111 22334",
    balance: 450,
    currency: "INR",
    totalBookings: 6,
    lastPaymentDate: "2026-10-10",
    status: "Low Balance",
  },
  {
    id: "CUS-803",
    name: "Vikram Patel",
    email: "vikram.p@patelcorp.com",
    phone: "+91 99222 33445",
    balance: 58000,
    currency: "INR",
    totalBookings: 24,
    lastPaymentDate: "2026-10-15",
    status: "Active",
  },
  {
    id: "CUS-804",
    name: "Rahul Verma",
    email: "rahul.v@gmail.com",
    phone: "+91 96666 11223",
    balance: 8500,
    currency: "INR",
    totalBookings: 5,
    lastPaymentDate: "2026-10-02",
    status: "Active",
  },
];

export function CustomerPaymentSection() {
  const [customers, setCustomers] = useState<CustomerBalance[]>(initialCustomers);
  const [search, setSearch] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerBalance | null>(null);
  const [topupAmount, setTopupAmount] = useState("");
  const [toast, setToast] = useState<string | null>(null);

  const filtered = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.toLowerCase().includes(search.toLowerCase())
  );

  const handleTopup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer || !topupAmount) return;
    const amount = parseFloat(topupAmount);
    setCustomers((prev) =>
      prev.map((c) =>
        c.id === selectedCustomer.id
          ? { ...c, balance: c.balance + amount, status: "Active", lastPaymentDate: "Today" }
          : c
      )
    );
    setToast(`Credited ₹${amount.toLocaleString()} to ${selectedCustomer.name}'s wallet!`);
    setSelectedCustomer(null);
    setTopupAmount("");
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
          <h2 className="text-xl font-black text-[#1c304a]">Customer Wallet & Balances</h2>
          <p className="text-xs text-slate-500">
            Monitor client prepaid account balances, advance travel deposits, and wallet top-ups.
          </p>
        </div>
        <label className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs shadow-sm">
          <Search className="h-3.5 w-3.5 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search customer name or phone..."
            className="w-36 bg-transparent outline-none sm:w-48"
          />
        </label>
      </div>

      <div className="overflow-hidden rounded-[10px] border border-[#e8ebef] bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-[#e8ebef] bg-slate-50/70 font-semibold text-slate-500 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="px-4 py-3">Customer ID & Name</th>
                <th className="px-4 py-3">Contact</th>
                <th className="px-4 py-3">Available Wallet Balance</th>
                <th className="px-4 py-3">Total Flights Booked</th>
                <th className="px-4 py-3">Last Payment Date</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-[#1c304a]">
              {filtered.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="px-4 py-3 font-bold">
                    <p className="text-[#1c304a]">{c.name}</p>
                    <p className="text-[10px] text-slate-400 font-normal">{c.id}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p>{c.email}</p>
                    <p className="text-[10px] text-slate-400">{c.phone}</p>
                  </td>
                  <td className="px-4 py-3 font-black text-emerald-700 text-sm">
                    ₹{c.balance.toLocaleString("en-IN")}
                  </td>
                  <td className="px-4 py-3 font-semibold text-slate-700">{c.totalBookings} Flights</td>
                  <td className="px-4 py-3 text-slate-500">{c.lastPaymentDate}</td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 text-[10px] font-bold",
                        c.status === "Active"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-amber-50 text-amber-700 border border-amber-200"
                      )}
                    >
                      ● {c.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => setSelectedCustomer(c)}
                      className="rounded bg-[#006aec] px-2.5 py-1 text-[11px] font-bold text-white hover:bg-[#006aec]/90"
                    >
                      Top-Up Wallet
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <form
            onSubmit={handleTopup}
            className="w-full max-w-sm rounded-xl bg-white p-6 shadow-2xl space-y-4"
          >
            <div className="flex items-start justify-between border-b pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-400">Manual Top-Up</span>
                <h3 className="text-base font-black text-[#1c304a]">{selectedCustomer.name}</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedCustomer(null)}
                className="rounded-full p-1 text-slate-400 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="rounded-lg bg-slate-50 p-2.5">
                <span className="text-slate-400">Current Balance:</span>{" "}
                <strong className="text-emerald-700 font-black">
                  ₹{selectedCustomer.balance.toLocaleString("en-IN")}
                </strong>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Add Credit Amount (₹)</label>
                <input
                  required
                  type="number"
                  value={topupAmount}
                  onChange={(e) => setTopupAmount(e.target.value)}
                  placeholder="e.g. 5000"
                  className="w-full rounded-lg border border-slate-300 p-2.5 text-sm font-bold outline-none focus:border-[#006aec]"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t">
              <button
                type="button"
                onClick={() => setSelectedCustomer(null)}
                className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-lg bg-[#006aec] px-4 py-1.5 text-xs font-bold text-white hover:bg-[#006aec]/90"
              >
                Confirm Credit
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
