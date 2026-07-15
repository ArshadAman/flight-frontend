"use client";

import { useState } from "react";
import {
  FolderOpen,
  Target,
  Wallet,
  User,
  Bell,
  FileText,
  Database,
  AlertTriangle,
  Info,
  Calendar,
  Settings,
  RefreshCw,
} from "lucide-react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { cn } from "@/lib/utils";

const platformModules = [
  { name: "Booking Engine", desc: "Operational", icon: FolderOpen, enabled: true, status: "operational" as const },
  { name: "Payment Gateway", desc: "Operational", icon: Target, enabled: true, status: "operational" as const },
  { name: "Wallet Services", desc: "Operational", icon: Wallet, enabled: true, status: "operational" as const },
  { name: "Email Services", desc: "Operational", icon: User, enabled: true, status: "operational" as const },
  { name: "Notifications Service", desc: "Operational", icon: Bell, enabled: true, status: "operational" as const },
  { name: "Reports Services", desc: "Degraded", icon: FileText, enabled: false, status: "degraded" as const },
  { name: "Cache Services", desc: "Operational", icon: Database, enabled: true, status: "operational" as const },
];

const systemAlerts = [
  { level: "Critical", message: "High response time detected for Travelport API", time: "10:24 AM", variant: "critical" as const },
  { level: "Critical", message: "AirIQ API success rate below threshold (98.12%)", time: "10:24 AM", variant: "critical" as const },
  { level: "Warning", message: "Inventory Sync delayed for Charter Flights", time: "10:24 AM", variant: "warning" as const },
  { level: "Warning", message: "Inventory Sync delayed for Flights", time: "10:24 AM", variant: "warning" as const },
  { level: "Info", message: "Schedule maintenance tonight 11:00 PM - 01:00 AM", time: "10:24 AM", variant: "info" as const },
];

const apiHealth = [
  { name: "Name0912 API", status: "Active", uptime: "99.92%", response: "120 ms", lastSync: "Last 10:24 AM" },
  { name: "Name2312 API", status: "Active", uptime: "99.92%", response: "120 ms", lastSync: "Last 10:24 AM" },
  { name: "Name4521 API", status: "Warning", uptime: "99.92%", response: "120 ms", lastSync: "Last 10:24 AM" },
  { name: "Name7834 API", status: "Critical", uptime: "99.92%", response: "120 ms", lastSync: "Last 10:24 AM" },
  { name: "Name9012 API", status: "Active", uptime: "99.92%", response: "120 ms", lastSync: "Last 10:24 AM" },
];

const publishStatus = [
  { category: "Domestic Flights", status: "Published", time: "Last 10:24 AM", result: "Success" },
  { category: "International Flights", status: "Published", time: "Last 10:24 AM", result: "Success" },
  { category: "Charter Flights", status: "Published", time: "Last 10:24 AM", result: "Success" },
  { category: "Special Fares", status: "Publishing", time: "Last 10:24 AM", result: "In Progress" },
  { category: "Low Cost Airlines", status: "Scheduled", time: "Last 10:24 AM", result: "In 35mins" },
];

const syncTasks = [
  { name: "Inventory Sync (Domestic)", icon: Calendar, color: "text-emerald-600", time: "Last 10:24 AM", result: "Complete" },
  { name: "Inventory Sync (International)", icon: Settings, color: "text-blue-600", time: "Last 10:24 AM", result: "Complete" },
  { name: "Flight Schedule Update", icon: RefreshCw, color: "text-emerald-600", time: "Last 10:24 AM", result: "Complete" },
  { name: "Fare Recalculations", icon: User, color: "text-orange-600", time: "Last 10:24 AM", result: "In Progress" },
  { name: "Cache Refresh", icon: FileText, color: "text-blue-600", time: "Last 10:24 AM", result: "Pending" },
];

const inventoryJobs = [
  { id: "AD12431", type: "Flight Inventory", details: "Domestic Flights - Indigo", status: "In Progress", progress: 65 },
  { id: "AD12431", type: "Flight Inventory", details: "International Flights - Emirates", status: "In Progress", progress: 65 },
  { id: "AD12431", type: "Fares", details: "Special fares Update", status: "Queued", progress: 0 },
  { id: "AD12431", type: "Flight Inventory", details: "Domestic Flights - Indigo", status: "Queued", progress: 0 },
];

const badgeStyles: Record<string, string> = {
  Active: "bg-emerald-50 text-emerald-700",
  Warning: "bg-amber-50 text-amber-700",
  Critical: "bg-red-50 text-red-600",
  Published: "bg-blue-50 text-blue-700",
  Publishing: "bg-amber-50 text-amber-700",
  Scheduled: "bg-slate-100 text-slate-600",
  Success: "bg-emerald-50 text-emerald-700",
  "In Progress": "bg-amber-50 text-amber-700",
  "In 35mins": "bg-slate-100 text-slate-600",
  Complete: "bg-emerald-50 text-emerald-700",
  Pending: "bg-slate-100 text-slate-600",
  Queued: "bg-blue-50 text-blue-700",
  Operational: "bg-emerald-50 text-emerald-700",
  Degraded: "bg-red-50 text-red-600",
  Critical_alert: "bg-red-50 text-red-600",
  Warning_alert: "bg-amber-50 text-amber-700",
  Info_alert: "bg-blue-50 text-blue-700",
};

function Card({ title, children, className }: { title: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("rounded-[10px] border border-[#e8ebef] bg-white p-4 shadow-sm", className)}>
      <h3 className="mb-3 text-xs font-bold uppercase tracking-wide text-[#1c304a]">{title}</h3>
      {children}
    </div>
  );
}

function Badge({ label }: { label: string }) {
  return (
    <span className={cn("rounded px-2 py-0.5 text-[10px] font-semibold", badgeStyles[label] ?? "bg-slate-100 text-slate-600")}>
      {label}
    </span>
  );
}

function Toggle({ enabled }: { enabled: boolean }) {
  return (
    <button
      type="button"
      className={cn(
        "relative h-5 w-9 shrink-0 rounded-full transition-colors",
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

function PlatformMonitoringTab() {
  return (
    <>
      <div className="grid gap-4 lg:grid-cols-2">
        <Card title="Module Control Center">
          <div className="space-y-0">
            {platformModules.map((m) => (
              <div
                key={m.name}
                className="flex items-center justify-between border-b border-[#e8ebef] py-3 last:border-0"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50">
                    <m.icon className="h-4 w-4 text-[#006aec]" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#1c304a]">{m.name}</p>
                    <Badge label={m.status === "operational" ? "Operational" : "Degraded"} />
                  </div>
                </div>
                <Toggle enabled={m.enabled} />
              </div>
            ))}
          </div>
        </Card>

        <Card title="System Alerts">
          <div className="space-y-3">
            {systemAlerts.map((a, i) => (
              <div key={i} className="flex items-start justify-between gap-3 border-b border-[#e8ebef] pb-3 last:border-0">
                <div className="flex items-start gap-2">
                  {a.variant === "critical" ? (
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
                  ) : a.variant === "warning" ? (
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
                  ) : (
                    <Info className="mt-0.5 h-4 w-4 shrink-0 text-blue-500" />
                  )}
                  <div>
                    <p className="text-xs text-[#1c304a]">{a.message}</p>
                    <p className="text-[10px] text-slate-400">{a.time}</p>
                  </div>
                </div>
                <span
                  className={cn(
                    "shrink-0 rounded px-2 py-0.5 text-[10px] font-semibold",
                    badgeStyles[`${a.level}_alert`]
                  )}
                >
                  {a.level}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card title="API Health Monitor (Live)">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#e8ebef] text-slate-400">
                <th className="pb-2 font-medium">API / Services</th>
                <th className="pb-2 font-medium">Status</th>
                <th className="pb-2 font-medium">Uptime</th>
                <th className="pb-2 font-medium">Response Time</th>
                <th className="pb-2 font-medium">Last Sync</th>
              </tr>
            </thead>
            <tbody>
              {apiHealth.map((api) => (
                <tr key={api.name} className="border-b border-[#e8ebef] last:border-0">
                  <td className="py-3 font-medium text-[#1c304a]">{api.name}</td>
                  <td className="py-3">
                    <Badge label={api.status} />
                  </td>
                  <td className="py-3 text-[#1c304a]">{api.uptime}</td>
                  <td className="py-3">
                    <span className="rounded bg-blue-50 px-2 py-0.5 text-[10px] font-medium text-blue-700">
                      {api.response}
                    </span>
                  </td>
                  <td className="py-3 text-slate-400">{api.lastSync}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
}

function ApiInventoryTab() {
  return (
    <>
      <div className="grid gap-4 lg:grid-cols-2">
        <Card title="Inventory Publishing Status">
          <div className="space-y-0">
            {publishStatus.map((row) => (
              <div
                key={row.category}
                className="flex flex-wrap items-center justify-between gap-2 border-b border-[#e8ebef] py-3 last:border-0"
              >
                <span className="text-sm font-medium text-[#1c304a]">{row.category}</span>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge label={row.status} />
                  <span className="text-[10px] text-slate-400">{row.time}</span>
                  <Badge label={row.result} />
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Inventory Publishing Status">
          <div className="space-y-0">
            {syncTasks.map((task) => (
              <div
                key={task.name}
                className="flex flex-wrap items-center justify-between gap-2 border-b border-[#e8ebef] py-3 last:border-0"
              >
                <div className="flex items-center gap-2">
                  <task.icon className={cn("h-4 w-4", task.color)} />
                  <span className="text-sm font-medium text-[#1c304a]">{task.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-slate-400">{task.time}</span>
                  <Badge label={task.result} />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card title="Inventory Publishing Status">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#e8ebef] text-slate-400">
                <th className="pb-2 font-medium">ID</th>
                <th className="pb-2 font-medium">Type</th>
                <th className="pb-2 font-medium">Details</th>
                <th className="pb-2 font-medium">Status</th>
                <th className="pb-2 font-medium">Progress</th>
                <th className="pb-2 font-medium">Started At</th>
              </tr>
            </thead>
            <tbody>
              {inventoryJobs.map((job, i) => (
                <tr key={i} className="border-b border-[#e8ebef] last:border-0">
                  <td className="py-3 font-medium text-[#1c304a]">{job.id}</td>
                  <td className="py-3 text-[#1c304a]">{job.type}</td>
                  <td className="py-3 text-slate-500">{job.details}</td>
                  <td className="py-3">
                    <Badge label={job.status} />
                  </td>
                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-24 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className="h-full rounded-full bg-[#D60D26]"
                          style={{ width: `${job.progress}%` }}
                        />
                      </div>
                      <span className="text-[10px] font-medium text-[#1c304a]">{job.progress}%</span>
                    </div>
                  </td>
                  <td className="py-3 text-slate-400">Last 10:24 AM</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
}

export default function PlatformApiPage() {
  const [tab, setTab] = useState("Platform Monitoring");

  return (
    <div className="flex min-h-full flex-col bg-[#f7f9fc]">
      <AdminPageHeader
        title="Platform Control & API Center"
        tabs={["Platform Monitoring", "API & Inventory Operations"]}
        activeTab={tab}
        onTabChange={setTab}
      />
      <div className="flex-1 space-y-5 p-5">
        {tab === "Platform Monitoring" ? <PlatformMonitoringTab /> : <ApiInventoryTab />}
      </div>
    </div>
  );
}
