"use client";

import React, { useState } from "react";
import { Users, Plus, Shield, Search, CheckCircle2, UserCheck, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface StaffUser {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  bookings: number;
  revenue: number;
  status: "Active" | "Inactive";
}

const initialStaff: StaffUser[] = [
  {
    id: "STF-101",
    name: "Neha Singh",
    email: "neha.s@mytraveldeal.com",
    role: "Senior Ticketing Agent",
    department: "Operations",
    bookings: 142,
    revenue: 845000,
    status: "Active",
  },
  {
    id: "STF-102",
    name: "Harshit Verma",
    email: "harshit.v@mytraveldeal.com",
    role: "Finance Manager",
    department: "Finance",
    bookings: 24,
    revenue: 180000,
    status: "Active",
  },
  {
    id: "STF-103",
    name: "Ajay Kumar",
    email: "ajay.k@mytraveldeal.com",
    role: "Booking Desk Executive",
    department: "Operations",
    bookings: 98,
    revenue: 520000,
    status: "Active",
  },
  {
    id: "STF-104",
    name: "Khushi Sharma",
    email: "khushi.s@mytraveldeal.com",
    role: "Customer Support Lead",
    department: "Support",
    bookings: 45,
    revenue: 260000,
    status: "Active",
  },
  {
    id: "STF-105",
    name: "Lokesh Rao",
    email: "lokesh.r@mytraveldeal.com",
    role: "Junior Ticketing Exec",
    department: "Operations",
    bookings: 12,
    revenue: 68000,
    status: "Inactive",
  },
];

export function StaffManageSection() {
  const [staff, setStaff] = useState<StaffUser[]>(initialStaff);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("Ticketing Agent");
  const [department, setDepartment] = useState("Operations");
  const [toast, setToast] = useState<string | null>(null);

  const filtered = staff.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase()) ||
      s.role.toLowerCase().includes(search.toLowerCase())
  );

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) return;
    const newStaff: StaffUser = {
      id: `STF-${Date.now().toString().slice(-3)}`,
      name,
      email,
      role,
      department,
      bookings: 0,
      revenue: 0,
      status: "Active",
    };
    setStaff((prev) => [newStaff, ...prev]);
    setModalOpen(false);
    setName("");
    setEmail("");
    setToast(`Added team member ${newStaff.name}!`);
    setTimeout(() => setToast(null), 3000);
  };

  const toggleStatus = (id: string) => {
    setStaff((prev) =>
      prev.map((s) =>
        s.id === id ? { ...s, status: s.status === "Active" ? "Inactive" : "Active" } : s
      )
    );
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
          <h2 className="text-xl font-black text-[#1c304a]">Staff & Sub-User Management</h2>
          <p className="text-xs text-slate-500">
            Create agent login credentials, allocate permissions, and review individual sales performance.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-1.5 rounded-lg bg-[#D60D26] px-3.5 py-2 text-xs font-bold text-white hover:bg-[#b00b1f] shadow-sm"
        >
          <Plus className="h-4 w-4" />
          Add Staff Member
        </button>
      </div>

      <div className="overflow-hidden rounded-[10px] border border-[#e8ebef] bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-[#e8ebef] bg-slate-50/70 font-semibold text-slate-500 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="px-4 py-3">Staff Name & ID</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Department</th>
                <th className="px-4 py-3">Bookings Handled</th>
                <th className="px-4 py-3">Total Sales Volume</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-[#1c304a]">
              {filtered.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="px-4 py-3 font-bold">
                    <p className="text-[#1c304a]">{s.name}</p>
                    <p className="text-[10px] text-slate-400 font-normal">{s.email} · {s.id}</p>
                  </td>
                  <td className="px-4 py-3 font-semibold text-blue-700">{s.role}</td>
                  <td className="px-4 py-3 text-slate-600">{s.department}</td>
                  <td className="px-4 py-3 font-bold">{s.bookings} Bookings</td>
                  <td className="px-4 py-3 font-black text-emerald-700">
                    ₹{s.revenue.toLocaleString("en-IN")}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 text-[10px] font-bold inline-block",
                        s.status === "Active"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-slate-100 text-slate-500 border border-slate-200"
                      )}
                    >
                      ● {s.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => toggleStatus(s.id)}
                      className="rounded border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-bold text-slate-700 hover:bg-slate-50"
                    >
                      {s.status === "Active" ? "Deactivate" : "Activate"}
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
              <h3 className="text-base font-black text-[#1c304a]">Add New Staff Member</h3>
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
                <label className="block font-bold text-slate-700 mb-1">Full Name</label>
                <input
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Ananya Sen"
                  className="w-full rounded-lg border border-slate-300 p-2.5 outline-none focus:border-[#D60D26]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Email (Login ID)</label>
                <input
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. ananya@mytraveldeal.com"
                  className="w-full rounded-lg border border-slate-300 p-2.5 outline-none focus:border-[#D60D26]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Role</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 p-2.5 outline-none focus:border-[#D60D26]"
                  >
                    <option value="Ticketing Agent">Ticketing Agent</option>
                    <option value="Finance Executive">Finance Executive</option>
                    <option value="Support Lead">Support Lead</option>
                    <option value="Inventory Manager">Inventory Manager</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Department</label>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 p-2.5 outline-none focus:border-[#D60D26]"
                  >
                    <option value="Operations">Operations</option>
                    <option value="Finance">Finance</option>
                    <option value="Support">Support</option>
                    <option value="Inventory">Inventory</option>
                  </select>
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
                Create Staff Account
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
