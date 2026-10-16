"use client";

import React, { useState } from "react";
import {
  Users,
  Building2,
  Shield,
  LayoutGrid,
  CheckCircle,
  XCircle,
  Clock,
  Plane,
  CloudUpload,
  FileText,
  Calendar,
  Check,
  X,
  Search,
  Filter,
} from "lucide-react";
import { AdminStatCard } from "@/components/admin/AdminStatCard";
import { AdminDonutChart } from "@/components/admin/AdminCharts";
import { cn } from "@/lib/utils";

const accessStats = [
  { title: "Active Staff", value: "24", icon: Users, trend: { value: "+12% this month", positive: true }, iconClassName: "bg-orange-50" },
  { title: "Departments", value: "6", icon: Building2, iconClassName: "bg-blue-50" },
  { title: "Roles Defined", value: "5", icon: Shield, iconClassName: "bg-emerald-50" },
  { title: "Active Modules", value: "18", icon: CheckCircle, iconClassName: "bg-emerald-50" },
  { title: "Pending Approvals", value: "3", icon: Clock, iconClassName: "bg-amber-50" },
];

const departments = [
  { name: "Ticketing & Booking Ops", staff: 8, online: 7, modules: "All Access", color: "bg-blue-50 text-blue-600" },
  { name: "Finance & Accounts", staff: 5, online: 4, modules: "Ledger, Invoices, Deposits", color: "bg-emerald-50 text-emerald-600" },
  { name: "Customer Support", staff: 6, online: 5, modules: "Queries, Amendments", color: "bg-orange-50 text-orange-600" },
  { name: "Inventory Management", staff: 3, online: 3, modules: "Offline & Published Seats", color: "bg-purple-50 text-purple-600" },
  { name: "Admin & Executive", staff: 2, online: 2, modules: "Super Admin", color: "bg-red-50 text-red-600" },
];

const onlineStaff = [
  { name: "Neha Singh", role: "Ticketing Lead", status: "Active" },
  { name: "Harshit Verma", role: "Finance Executive", status: "Active" },
  { name: "Ajay Kumar", role: "Booking Agent", status: "In Call" },
  { name: "Khushi Sharma", role: "Support Desk", status: "Active" },
  { name: "Pranshu Mehta", role: "Inventory Manager", status: "Active" },
  { name: "Lokesh Rao", role: "Accounts", status: "Active" },
];

const pendingRequests = [
  { user: "Ajay Kumar", access: "High-value ticket refund authorization (₹48,500)", time: "25 min ago" },
  { user: "Khushi Sharma", access: "Credit limit override for Corporate PNR #MTD892", time: "1 hour ago" },
  { user: "Harshit Verma", access: "Manual UTR reconciliation for DEP-9012", time: "2 hours ago" },
];

export function DashboardAdminSection() {
  const [approvals, setApprovals] = useState(pendingRequests);
  const [toast, setToast] = useState<string | null>(null);

  const handleAction = (idx: number, action: "Approved" | "Rejected") => {
    const item = approvals[idx];
    setApprovals((prev) => prev.filter((_, i) => i !== idx));
    setToast(`${action}: ${item.user}'s request`);
    setTimeout(() => setToast(null), 3000);
  };

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
          Manage agency departments, role-based access control, active sub-agents, and approval workflows.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {accessStats.map((s) => (
          <AdminStatCard key={s.title} {...s} />
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="rounded-[10px] border border-[#e8ebef] bg-white p-4 shadow-sm lg:col-span-2">
          <h3 className="mb-3 text-xs font-bold uppercase tracking-wide text-[#1c304a]">
            Departments & Module Access
          </h3>
          <div className="divide-y divide-slate-100">
            {departments.map((d) => (
              <div key={d.name} className="flex flex-wrap items-center justify-between gap-3 py-3">
                <div className="flex items-center gap-3">
                  <div className={cn("flex h-9 w-9 items-center justify-center rounded-lg font-bold text-xs", d.color)}>
                    {d.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#1c304a]">{d.name}</p>
                    <p className="text-xs text-slate-400">{d.modules}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-xs font-semibold">
                  <span className="text-slate-500">{d.staff} Staff</span>
                  <span className="flex items-center gap-1 text-emerald-600">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    {d.online} Online
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-5">
          <div className="rounded-[10px] border border-[#e8ebef] bg-white p-4 shadow-sm">
            <h3 className="mb-3 text-xs font-bold uppercase tracking-wide text-[#1c304a]">
              Online Staff Members
            </h3>
            <div className="space-y-2">
              {onlineStaff.map((s) => (
                <div key={s.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    <span className="font-semibold text-[#1c304a]">{s.name}</span>
                  </div>
                  <span className="text-slate-400">{s.role}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[10px] border border-[#e8ebef] bg-white p-4 shadow-sm">
            <h3 className="mb-3 text-xs font-bold uppercase tracking-wide text-[#1c304a]">
              Pending Approvals ({approvals.length})
            </h3>
            {approvals.length === 0 ? (
              <p className="text-xs text-slate-400 py-3 text-center">No pending approvals.</p>
            ) : (
              <div className="space-y-3">
                {approvals.map((req, idx) => (
                  <div key={idx} className="rounded-lg border border-slate-100 bg-slate-50/50 p-2.5 text-xs">
                    <div className="flex items-center justify-between font-semibold text-[#1c304a]">
                      <span>{req.user}</span>
                      <span className="text-[10px] text-slate-400">{req.time}</span>
                    </div>
                    <p className="mt-1 text-slate-600">{req.access}</p>
                    <div className="mt-2 flex gap-2">
                      <button
                        type="button"
                        onClick={() => handleAction(idx, "Approved")}
                        className="rounded bg-emerald-600 px-2 py-1 text-[11px] font-bold text-white hover:bg-emerald-700"
                      >
                        Approve
                      </button>
                      <button
                        type="button"
                        onClick={() => handleAction(idx, "Rejected")}
                        className="rounded border border-slate-300 bg-white px-2 py-1 text-[11px] font-bold text-slate-700 hover:bg-slate-100"
                      >
                        Decline
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
