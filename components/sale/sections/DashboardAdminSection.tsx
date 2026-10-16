"use client";

import React, { useState } from "react";
import {
  Users,
  Building2,
  Shield,
  CheckCircle,
  XCircle,
  Clock,
  Search,
  Filter,
  Check,
  X,
  UserCheck,
  UserX,
  Activity,
  ArrowUpRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface PermissionRequest {
  id: string;
  user: string;
  requestedAccess: string;
  requested: string;
  reason: string;
  avatar: string;
}

const initialRequests: PermissionRequest[] = [
  {
    id: "REQ-1",
    user: "Ayushi Chirgania",
    requestedAccess: "Wallet Access",
    requested: "2hr ago",
    reason: "For refund processing",
    avatar: "AC",
  },
  {
    id: "REQ-2",
    user: "Neha Singh",
    requestedAccess: "Supplier Module",
    requested: "2hr ago",
    reason: "Need to manage APIs",
    avatar: "NS",
  },
  {
    id: "REQ-3",
    user: "Amit Mehra",
    requestedAccess: "Reports Access",
    requested: "2hr ago",
    reason: "For daily reporting",
    avatar: "AM",
  },
  {
    id: "REQ-4",
    user: "Pooja Mehta",
    requestedAccess: "Staff Module",
    requested: "2hr ago",
    reason: "To manage staff",
    avatar: "PM",
  },
  {
    id: "REQ-5",
    user: "Vikram Patel",
    requestedAccess: "Agent Module",
    requested: "2hr ago",
    reason: "To manage agents",
    avatar: "VP",
  },
];

const onlineStaffList = [
  { name: "Neha S.", department: "Operations", online: true },
  { name: "Ajay M.", department: "Ticketing", online: true },
  { name: "Rahul K.", department: "Finance", online: true },
  { name: "Harshit S.", department: "Support", online: true },
  { name: "Pooja M.", department: "Reservation", online: true },
  { name: "Vikram P.", department: "Operations", online: true },
  { name: "Lokesh G.", department: "Accounts", online: true },
  { name: "Khushi S.", department: "Ticketing", online: true },
];

const departmentOverview = [
  { department: "Ledger", activeModules: "Finance", staff: 12, online: 10, total: 18 },
  { department: "Accounts", activeModules: "Customer Support", staff: 14, online: 12, total: 18 },
  { department: "Reservation", activeModules: "Flight Operations", staff: 16, online: 15, total: 18 },
  { department: "Ticketing", activeModules: "Ticketing & Reissue", staff: 18, online: 16, total: 18 },
];

export function DashboardAdminSection() {
  const [requests, setRequests] = useState<PermissionRequest[]>(initialRequests);
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState<string | null>(null);

  const handleAction = (id: string, action: "Approved" | "Rejected") => {
    const item = requests.find((r) => r.id === id);
    if (!item) return;
    setRequests((prev) => prev.filter((r) => r.id !== id));
    setToast(`${action} permission request for ${item.user}`);
    setTimeout(() => setToast(null), 3000);
  };

  const filteredRequests = requests.filter(
    (r) =>
      r.user.toLowerCase().includes(search.toLowerCase()) ||
      r.requestedAccess.toLowerCase().includes(search.toLowerCase()) ||
      r.reason.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {toast && (
        <div className="rounded-lg bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-md transition-all">
          ✓ {toast}
        </div>
      )}

      <div>
        <h2 className="text-xl font-black text-[#1c304a]">Administration & Permissions</h2>
        <p className="text-xs text-slate-500">
          Role-based access management, live staff presence, and permission requests from Figma Frame.
        </p>
      </div>

      {/* Exact Top KPI Cards matching Figma 2065:85313 */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {/* Card 1: Active users */}
        <div className="rounded-[10px] border border-[#e8ebef] bg-white p-4 shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase">Active users</p>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-3xl font-black text-[#1c304a]">245</span>
            <span className="flex items-center text-xs font-bold text-emerald-600">
              vs Last Month 18%
            </span>
          </div>
        </div>

        {/* Card 2: Pending Approvals */}
        <div className="rounded-[10px] border border-[#e8ebef] bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-slate-400 uppercase">Pending Approvals</p>
            <button type="button" className="text-[11px] font-bold text-[#006aec] hover:underline">
              View All
            </button>
          </div>
          <div className="mt-1">
            <span className="text-3xl font-black text-amber-600">05</span>
          </div>
        </div>

        {/* Card 3: User Online */}
        <div className="rounded-[10px] border border-[#e8ebef] bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-slate-400 uppercase">User Online</p>
            <button type="button" className="text-[11px] font-bold text-[#006aec] hover:underline">
              View All
            </button>
          </div>
          <div className="mt-1 flex items-center gap-2">
            <span className="text-3xl font-black text-emerald-600">48</span>
            <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
          </div>
        </div>

        {/* Card 4: Inactive Users */}
        <div className="rounded-[10px] border border-[#e8ebef] bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-slate-400 uppercase">Inactive Users</p>
            <button type="button" className="text-[11px] font-bold text-[#006aec] hover:underline">
              View All
            </button>
          </div>
          <div className="mt-1">
            <span className="text-3xl font-black text-slate-400">15</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Pending Permission Requests + Right Side Cards */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column (2 Cols): Pending Permission Requests Table */}
        <div className="space-y-6 lg:col-span-2">
          <div className="rounded-[10px] border border-[#e8ebef] bg-white p-5 shadow-sm space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#1c304a]">
                  Pending permission requests
                </h3>
                <p className="text-[11px] text-slate-400">
                  Staff access elevate requests requiring administrator authorization.
                </p>
              </div>
              <label className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs">
                <Search className="h-3.5 w-3.5 text-slate-400" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search user, module..."
                  className="w-32 bg-transparent outline-none sm:w-44 text-xs"
                />
              </label>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-[#e8ebef] bg-slate-50/70 font-semibold text-slate-500 uppercase text-[10px]">
                  <tr>
                    <th className="px-3 py-2.5">Users</th>
                    <th className="px-3 py-2.5">Requested Access</th>
                    <th className="px-3 py-2.5">Requested</th>
                    <th className="px-3 py-2.5">Reason</th>
                    <th className="px-3 py-2.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-[#1c304a]">
                  {filteredRequests.map((req) => (
                    <tr key={req.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-3 py-3 font-semibold">
                        <div className="flex items-center gap-2">
                          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-[10px] font-bold text-slate-700">
                            {req.avatar}
                          </div>
                          <span>{req.user}</span>
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-700 border border-blue-200">
                          {req.requestedAccess}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-slate-500 font-medium text-[11px]">
                        {req.requested}
                      </td>
                      <td className="px-3 py-3 text-slate-600 text-[11px]">{req.reason}</td>
                      <td className="px-3 py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleAction(req.id, "Approved")}
                            className="rounded bg-emerald-600 px-2.5 py-1 text-[10px] font-bold text-white hover:bg-emerald-700 shadow-sm"
                          >
                            Approve
                          </button>
                          <button
                            type="button"
                            onClick={() => handleAction(req.id, "Rejected")}
                            className="rounded bg-rose-50 px-2.5 py-1 text-[10px] font-bold text-rose-700 border border-rose-200 hover:bg-rose-100"
                          >
                            Reject
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredRequests.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-400">
                        No pending permission requests.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Department Overview Table matching Figma line 2065:85313 */}
          <div className="rounded-[10px] border border-[#e8ebef] bg-white p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#1c304a]">
                Department Overview
              </h3>
              <span className="text-[11px] font-bold text-slate-400">4 Active Branches</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-[#e8ebef] bg-slate-50/70 font-semibold text-slate-500 uppercase text-[10px]">
                  <tr>
                    <th className="px-3 py-2.5">Department</th>
                    <th className="px-3 py-2.5">Active Modules</th>
                    <th className="px-3 py-2.5">Staff</th>
                    <th className="px-3 py-2.5 text-right">Online</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-[#1c304a]">
                  {departmentOverview.map((dept) => (
                    <tr key={dept.department} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-3 py-3 font-bold text-[#1c304a]">{dept.department}</td>
                      <td className="px-3 py-3 text-slate-600 font-medium">{dept.activeModules}</td>
                      <td className="px-3 py-3 font-semibold text-slate-700">{dept.staff} Staff</td>
                      <td className="px-3 py-3 text-right">
                        <div className="inline-flex items-center gap-1.5 font-bold text-emerald-600">
                          <span className="h-2 w-2 rounded-full bg-emerald-500" />
                          <span>{dept.online} Online</span>
                          <span className="text-slate-400 font-normal">({dept.staff} / {dept.total})</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column: Online staff (Live) & Permission overview */}
        <div className="space-y-6">
          {/* Online staff (Live) Card */}
          <div className="rounded-[10px] border border-[#e8ebef] bg-white p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#1c304a]">
                  Online staff (Live)
                </h3>
              </div>
              <button type="button" className="text-[11px] font-bold text-[#006aec] hover:underline">
                View All
              </button>
            </div>

            <div className="divide-y divide-slate-100">
              {onlineStaffList.map((staff, i) => (
                <div key={i} className="flex items-center justify-between py-2 text-xs">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-[10px] font-black text-slate-700">
                      {staff.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-bold text-[#1c304a]">{staff.name}</p>
                      <p className="text-[10px] text-slate-400">{staff.department}</p>
                    </div>
                  </div>
                  <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    Live
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Permission Overview Card */}
          <div className="rounded-[10px] border border-[#e8ebef] bg-white p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#1c304a]">
                Permission overview
              </h3>
              <span className="text-[11px] font-bold text-slate-500">Total Users: 248</span>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <div className="flex justify-between font-bold">
                  <span className="text-slate-700">Full Access</span>
                  <span className="text-[#006aec]">85 (32.9%)</span>
                </div>
                <div className="mt-1 h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div className="h-full bg-[#006aec] rounded-full" style={{ width: "32.9%" }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between font-bold">
                  <span className="text-slate-700">Edit Access</span>
                  <span className="text-emerald-600">95 (36%)</span>
                </div>
                <div className="mt-1 h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: "36%" }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between font-bold">
                  <span className="text-slate-700">View Access</span>
                  <span className="text-amber-600">60 (23%)</span>
                </div>
                <div className="mt-1 h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div className="h-full bg-amber-500 rounded-full" style={{ width: "23%" }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between font-bold">
                  <span className="text-slate-700">No Access</span>
                  <span className="text-slate-400">18 (7%)</span>
                </div>
                <div className="mt-1 h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div className="h-full bg-slate-300 rounded-full" style={{ width: "7%" }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
