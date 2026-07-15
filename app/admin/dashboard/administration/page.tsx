"use client";

import { useState } from "react";
import {
  Users,
  Building2,
  Shield,
  LayoutGrid,
  CheckCircle,
  XCircle,
  Clock,
  UserCheck,
  UserX,
  Plane,
  CloudUpload,
  FileText,
  Calendar,
  CalendarPlus,
  Settings,
  UserPlus,
  Check,
  X,
} from "lucide-react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminStatCard } from "@/components/admin/AdminStatCard";
import { AdminDonutChart } from "@/components/admin/AdminCharts";
import { cn } from "@/lib/utils";

const accessStats = [
  { title: "Active users", value: "245", icon: Users, trend: "18% vs Last Month", up: true, iconClass: "bg-orange-50" },
  { title: "Departments", value: "12", icon: Building2, footerLink: "View All", iconClass: "bg-blue-50" },
  { title: "Roles", value: "06", icon: Shield, footerLink: "View All", iconClass: "bg-emerald-50" },
  { title: "Total Module", value: "25", icon: LayoutGrid, badge: { label: "Enabled", variant: "enabled" as const }, iconClass: "bg-blue-50" },
  { title: "Active Modules", value: "18", icon: CheckCircle, badge: { label: "Enabled", variant: "enabled" as const }, iconClass: "bg-emerald-50" },
  { title: "Inactive Modules", value: "06", icon: XCircle, badge: { label: "Disabled", variant: "disabled" as const }, iconClass: "bg-red-50" },
  { title: "Pending Approvals", value: "05", icon: Clock, footerLink: "View All", iconClass: "bg-orange-50" },
];

const permissionSegments = [
  { label: "Full Access", value: 85, count: 85, color: "#22c55e" },
  { label: "Edit Access", value: 95, count: 95, color: "#006aec" },
  { label: "View Access", value: 60, count: 60, color: "#f59e0b" },
  { label: "No Access", value: 18, count: 18, color: "#94a3b8" },
];

const departments = [
  { name: "Operations", staff: 12, online: 10, modules: "12/18", color: "bg-blue-50 text-blue-600" },
  { name: "Finance", staff: 12, online: 10, modules: "12/18", color: "bg-emerald-50 text-emerald-600" },
  { name: "Support", staff: 12, online: 10, modules: "12/18", color: "bg-orange-50 text-orange-600" },
  { name: "Supplier Management", staff: 12, online: 10, modules: "12/18", color: "bg-purple-50 text-purple-600" },
  { name: "Agent Management", staff: 12, online: 10, modules: "12/18", color: "bg-amber-50 text-amber-600" },
  { name: "Human Resources", staff: 12, online: 10, modules: "12/18", color: "bg-red-50 text-red-600" },
];

const onlineStaff = [
  "Neha S.", "Amit M.", "Pooja M.", "Vikram P.",
  "Suresh K.", "Ayushi C.", "Rahul V.", "Priya N.",
];

const pendingRequests = [
  { user: "Ayushi Chirgania", access: "Wallet Access", reason: "For refund processing", time: "2hr ago" },
  { user: "Neha Singh", access: "Supplier Module", reason: "Need to manage APIs", time: "2hr ago" },
  { user: "Amit Mehra", access: "Reports Access", reason: "For daily reporting", time: "2hr ago" },
];

const quickPermissionActions = [
  { label: "Create Role", icon: Plane, color: "bg-blue-50 text-blue-600" },
  { label: "Create Department", icon: CloudUpload, color: "bg-blue-50 text-blue-600" },
  { label: "Assign Module", icon: FileText, color: "bg-emerald-50 text-emerald-600" },
  { label: "Assign Staff", icon: Calendar, color: "bg-orange-50 text-orange-600" },
  { label: "Closer Permission", icon: CalendarPlus, color: "bg-blue-50 text-blue-600" },
  { label: "Revoke Permission", icon: Settings, color: "bg-emerald-50 text-emerald-600" },
  { label: "Reset Permission", icon: UserPlus, color: "bg-orange-50 text-orange-600" },
  { label: "Permission Reports", icon: UserPlus, color: "bg-amber-50 text-amber-600" },
];

const moduleControls = [
  { name: "Supplier Mod.", desc: "Manage supplier and inventory", enabled: true },
  { name: "Agent Mod.", desc: "Manage agent and commissions", enabled: true },
  { name: "Staff Mod.", desc: "Manage staff and HR", enabled: true },
  { name: "Queries Mod.", desc: "Manage support queries", enabled: true },
  { name: "Finance", desc: "Manage payment and accounts", enabled: true },
  { name: "Holiday", desc: "Manage Holidays & Leaves", enabled: true },
  { name: "Report mod.", desc: "View and Generate reports", enabled: false },
];

const permissionMatrix = [
  { user: "Ayushi Chirgania", perms: [true, true, true, true, true, true, true] },
  { user: "Neha Singh", perms: [true, true, true, false, false, false, false] },
  { user: "Amit Mehra", perms: [true, true, true, false, true, true, true] },
  { user: "Pooja Mehta", perms: [true, true, false, false, true, true, true] },
  { user: "Vikarm Patel", perms: [true, false, true, false, false, true, true] },
  { user: "Suresh Kumar", perms: [true, true, true, true, true, false, true] },
];

const matrixColumns = ["Dashboard", "Supplier", "Agent", "Staff", "Wallet", "Reports", "Setting"];

function Card({ title, children, action }: { title: string; children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="rounded-[10px] border border-[#e8ebef] bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-xs font-bold uppercase tracking-wide text-[#1c304a]">{title}</h3>
        {action}
      </div>
      {children}
    </div>
  );
}

function Toggle({ enabled }: { enabled: boolean }) {
  return (
    <button
      type="button"
      className={cn(
        "relative h-5 w-9 rounded-full transition-colors",
        enabled ? "bg-emerald-500" : "bg-slate-300"
      )}
    >
      <span
        className={cn(
          "absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform",
          enabled ? "left-4" : "left-0.5"
        )}
      />
    </button>
  );
}

function AccessOverviewTab() {
  return (
    <>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
        {accessStats.map((s) => (
          <AdminStatCard
            key={s.title}
            title={s.title}
            value={s.value}
            icon={s.icon}
            iconClassName={s.iconClass}
            trend={s.trend ? { value: s.trend, positive: s.up ?? true } : undefined}
            footerLink={s.footerLink}
            badge={s.badge}
          />
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card title="Permission Overview">
          <AdminDonutChart
            segments={permissionSegments}
            size={140}
            centerLabel="Total Users"
            centerValue="248"
            showCounts
          />
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="flex items-center justify-between rounded-lg border border-[#e8ebef] p-3">
              <div className="flex items-center gap-2">
                <UserCheck className="h-4 w-4 text-emerald-600" />
                <div>
                  <p className="text-[10px] text-slate-500">User Online</p>
                  <p className="text-sm font-bold text-[#1c304a]">48</p>
                </div>
              </div>
              <button type="button" className="text-xs text-[#006aec] hover:underline">
                View All
              </button>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-[#e8ebef] p-3">
              <div className="flex items-center gap-2">
                <UserX className="h-4 w-4 text-red-500" />
                <div>
                  <p className="text-[10px] text-slate-500">Inactive Users</p>
                  <p className="text-sm font-bold text-[#1c304a]">15</p>
                </div>
              </div>
              <button type="button" className="text-xs text-[#006aec] hover:underline">
                View All
              </button>
            </div>
          </div>
        </Card>

        <Card title="Department Overview">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#e8ebef] text-slate-400">
                  <th className="pb-2 font-medium">Department</th>
                  <th className="pb-2 font-medium">Staff</th>
                  <th className="pb-2 font-medium">Online</th>
                  <th className="pb-2 font-medium">Active Modules</th>
                </tr>
              </thead>
              <tbody>
                {departments.map((d) => (
                  <tr key={d.name} className="border-b border-[#e8ebef] last:border-0">
                    <td className="py-2.5">
                      <div className="flex items-center gap-2">
                        <div className={cn("flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-semibold", d.color)}>
                          {d.name[0]}
                        </div>
                        <span className="font-medium text-[#1c304a]">{d.name}</span>
                      </div>
                    </td>
                    <td className="py-2.5 text-[#1c304a]">{d.staff}</td>
                    <td className="py-2.5 font-medium text-emerald-600">{d.online} Online</td>
                    <td className="py-2.5 text-[#1c304a]">{d.modules}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card
          title="Online Staff (Live)"
          action={
            <button type="button" className="text-xs font-medium text-[#006aec] hover:underline">
              View All
            </button>
          }
        >
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {onlineStaff.map((name) => (
              <div key={name} className="flex flex-col items-center gap-1 rounded-lg border border-[#e8ebef] p-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50">
                  <Users className="h-5 w-5 text-emerald-600" />
                </div>
                <p className="text-xs font-medium text-[#1c304a]">{name}</p>
                <p className="text-[10px] text-slate-400">Operations</p>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Pending Permission Requests">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#e8ebef] text-slate-400">
                  <th className="pb-2 font-medium">Users</th>
                  <th className="pb-2 font-medium">Requested Access</th>
                  <th className="pb-2 font-medium">Reason</th>
                  <th className="pb-2 font-medium">Requested</th>
                  <th className="pb-2 font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {pendingRequests.map((r) => (
                  <tr key={r.user} className="border-b border-[#e8ebef] last:border-0">
                    <td className="py-2.5 font-medium text-[#1c304a]">{r.user}</td>
                    <td className="py-2.5 text-[#1c304a]">{r.access}</td>
                    <td className="py-2.5 text-slate-500">{r.reason}</td>
                    <td className="py-2.5 text-slate-400">{r.time}</td>
                    <td className="py-2.5">
                      <div className="flex gap-1">
                        <button type="button" className="flex h-6 w-6 items-center justify-center rounded border border-red-200 bg-red-50 text-red-500">
                          <X className="h-3 w-3" />
                        </button>
                        <button type="button" className="flex h-6 w-6 items-center justify-center rounded border border-emerald-200 bg-emerald-50 text-emerald-600">
                          <Check className="h-3 w-3" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </>
  );
}

function AccessManagementTab() {
  return (
    <>
      <Card title="Quick Permission Actions">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
          {quickPermissionActions.map((a) => (
            <button
              key={a.label}
              type="button"
              className="flex flex-col items-center gap-2 rounded-lg border border-[#e8ebef] p-3 transition hover:border-[#006aec]/30"
            >
              <div className={cn("flex h-10 w-10 items-center justify-center rounded-lg", a.color)}>
                <a.icon className="h-5 w-5" />
              </div>
              <span className="text-center text-[10px] font-medium text-[#1c304a]">{a.label}</span>
            </button>
          ))}
        </div>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card title="Module Control Center">
          <div className="space-y-0">
            {moduleControls.map((m) => (
              <div
                key={m.name}
                className="flex items-center justify-between border-b border-[#e8ebef] py-3 last:border-0"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50">
                    <LayoutGrid className="h-4 w-4 text-[#006aec]" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#1c304a]">{m.name}</p>
                    <p className="text-[10px] text-slate-400">{m.desc}</p>
                  </div>
                </div>
                <Toggle enabled={m.enabled} />
              </div>
            ))}
          </div>
        </Card>

        <Card
          title="Department Overview"
          action={
            <select className="h-7 rounded border border-[#e8ebef] px-2 text-[10px] text-[#1c304a]">
              <option>All Department</option>
            </select>
          }
        >
          <div className="overflow-x-auto">
            <table className="w-full text-center text-[10px]">
              <thead>
                <tr className="border-b border-[#e8ebef] text-slate-400">
                  <th className="pb-2 text-left font-medium">User / Role</th>
                  {matrixColumns.map((col) => (
                    <th key={col} className="pb-2 font-medium">
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {permissionMatrix.map((row) => (
                  <tr key={row.user} className="border-b border-[#e8ebef] last:border-0">
                    <td className="py-2 text-left font-medium text-[#1c304a]">{row.user}</td>
                    {row.perms.map((allowed, i) => (
                      <td key={i} className="py-2">
                        <span
                          className={cn(
                            "inline-flex h-5 w-5 items-center justify-center rounded",
                            allowed
                              ? "bg-emerald-50 text-emerald-600"
                              : "bg-red-50 text-red-500"
                          )}
                        >
                          {allowed ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                        </span>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </>
  );
}

export default function AdministrationPage() {
  const [tab, setTab] = useState("Access Overview");

  return (
    <div className="flex min-h-full flex-col bg-[#f7f9fc]">
      <AdminPageHeader
        title="Administration & Permission"
        tabs={["Access Overview", "Access Management"]}
        activeTab={tab}
        onTabChange={setTab}
      />
      <div className="flex-1 space-y-5 p-5">
        {tab === "Access Overview" ? <AccessOverviewTab /> : <AccessManagementTab />}
      </div>
    </div>
  );
}
