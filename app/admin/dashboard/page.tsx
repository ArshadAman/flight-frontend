"use client";

import { useState } from "react";
import {
  IndianRupee,
  Plane,
  Users,
  Building2,
  Wallet,
  Plug,
  MessageSquare,
  Clock,
  RefreshCw,
  AlertTriangle,
  CreditCard,
  ListOrdered,
  CloudUpload,
  CalendarPlus,
  UserPlus,
  Network,
  Check,
  ChevronRight,
  Calendar,
} from "lucide-react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminStatCard } from "@/components/admin/AdminStatCard";
import { AdminDonutChart } from "@/components/admin/AdminCharts";
import { cn } from "@/lib/utils";

const kpi = [
  { title: "Total Revenue", value: "₹67,45,000", icon: IndianRupee, trend: "18.6% vs yesterday", up: true, iconClass: "bg-emerald-50" },
  { title: "Total Booking", value: "1,245", icon: Plane, trend: "18.6% vs yesterday", up: true, iconClass: "bg-blue-50" },
  { title: "Total Agents", value: "24", icon: Users, trend: "18.6% vs yesterday", up: true, iconClass: "bg-orange-50" },
  { title: "Total Suppliers", value: "25", icon: Building2, trend: "18.6% vs yesterday", up: true, iconClass: "bg-amber-50" },
  { title: "Wallet Balance", value: "₹67,45,000", icon: Wallet, trend: "18.6% vs yesterday", up: true, iconClass: "bg-emerald-50" },
  { title: "Active API", value: "17", icon: Plug, trend: "18.6% vs yesterday", up: true, iconClass: "bg-blue-50" },
  { title: "Pending Queries", value: "345", icon: MessageSquare, trend: "18.6% vs yesterday", up: false, iconClass: "bg-red-50" },
];

const today = [
  { title: "Total Booking", value: "86", icon: Plane },
  { title: "Pending Booking", value: "12", icon: Clock },
  { title: "Refund Request", value: "5", icon: RefreshCw },
  { title: "Waiting list", value: "9", icon: ListOrdered },
  { title: "Schedule Change", value: "3", icon: AlertTriangle },
  { title: "Payment Failure", value: "2", icon: CreditCard },
];

const analyticsSummary = [
  { label: "Revenue", value: "₹67,45,000", trend: "+18.6%", color: "text-purple-600" },
  { label: "Booking", value: "1,245", trend: "+18.6%", color: "text-blue-600" },
  { label: "Ticket Issued", value: "1,102", trend: "+18.6%", color: "text-emerald-600" },
  { label: "Profit", value: "₹12,40,000", trend: "+18.6%", color: "text-amber-500" },
];

const chartDays = ["14 May", "15 May", "16 May", "17 May", "18 May", "19 May", "20 May"];
const chartSeries = {
  revenue: [42, 55, 48, 70, 62, 80, 75],
  booking: [35, 48, 40, 62, 55, 72, 68],
  tickets: [30, 42, 38, 58, 50, 65, 60],
  profit: [25, 38, 32, 52, 45, 58, 55],
};

const activities = [
  { title: "Refund Completed", time: "11:15 AM", pnr: "ABV12445", role: "Super Admin", status: "Solved" },
  { title: "New Booking", time: "10:42 AM", pnr: "XYR9NF", role: "Admin", status: "UnSolved" },
  { title: "API Switched to Amadeus", time: "10:05 AM", pnr: "—", role: "Platform Ops", status: "Solved" },
  { title: "Deposit Approved", time: "09:20 AM", pnr: "—", role: "Finance", status: "Solved" },
  { title: "Schedule Change", time: "08:55 AM", pnr: "Q5R2T9", role: "Admin", status: "UnSolved" },
];

const topAgents = [
  { name: "Neha Singh", tag: "B2B and B2C", revenue: "₹12,40,000", growth: "+18.6%" },
  { name: "Harshit Chirgania", tag: "B2B and B2C", revenue: "₹9,80,000", growth: "+18.6%" },
  { name: "Ajay Travels", tag: "B2B", revenue: "₹8,20,000", growth: "+18.6%" },
  { name: "Pranshu Agency", tag: "B2C", revenue: "₹6,50,000", growth: "+18.6%" },
  { name: "Lokesh Flights", tag: "B2B and B2C", revenue: "₹5,10,000", growth: "+18.6%" },
];

const topSuppliers = [
  { name: "Amadeus", pct: 42, revenue: "₹28,00,000" },
  { name: "Travelport", pct: 32, revenue: "₹21,00,000" },
  { name: "Sabre", pct: 22, revenue: "₹14,50,000" },
  { name: "AirIQ", pct: 16, revenue: "₹10,50,000" },
  { name: "SkyLink", pct: 10, revenue: "₹6,80,000" },
];

const quickActions = [
  { label: "New Booking", icon: Plane, color: "bg-blue-50 text-blue-600" },
  { label: "Import PNR", icon: CloudUpload, color: "bg-blue-50 text-blue-600" },
  { label: "Add Funds", icon: Wallet, color: "bg-emerald-50 text-emerald-600" },
  { label: "Publish Inventory", icon: Calendar, color: "bg-orange-50 text-orange-600" },
  { label: "Add Fixed Departure", icon: CalendarPlus, color: "bg-blue-50 text-blue-600" },
  { label: "Add API Partner", icon: Network, color: "bg-emerald-50 text-emerald-600" },
  { label: "Create Reseller", icon: UserPlus, color: "bg-orange-50 text-orange-600" },
  { label: "Create Agent", icon: UserPlus, color: "bg-orange-50 text-orange-600" },
];

const bookingSegments = [
  { label: "Confirmed", value: 82, count: 1027, color: "#22c55e" },
  { label: "Ticketed", value: 8, count: 100, color: "#006aec" },
  { label: "Cancelled", value: 5, count: 62, color: "#D60D26" },
  { label: "On Hold", value: 3, count: 37, color: "#f59e0b" },
  { label: "Refunded", value: 2, count: 22, color: "#94a3b8" },
];

const bookingStats = [
  { label: "Confirmed", value: "1,027", icon: Check, color: "text-emerald-600", up: true },
  { label: "Ticketed", value: "100", icon: Plane, color: "text-blue-600", up: true },
  { label: "Cancelled", value: "62", icon: AlertTriangle, color: "text-red-500", up: false },
  { label: "On Hold", value: "37", icon: Clock, color: "text-amber-500", up: true },
  { label: "Refunded", value: "22", icon: RefreshCw, color: "text-slate-500", up: false },
];

const calendarDays = Array.from({ length: 30 }, (_, i) => i + 1);
const scheduleItems = [
  { time: "11:15 AM", title: "Team Meeting", desc: "Based on ticket Support", done: true },
  { time: "11:15 AM", title: "Team Meeting", desc: "Based on ticket Support", done: true },
  { time: "11:15 AM", title: "Team Meeting", desc: "Based on ticket Support", done: false },
  { time: "11:15 AM", title: "Team Meeting", desc: "Based on ticket Support", done: false },
  { time: "11:15 AM", title: "Team Meeting", desc: "Based on ticket Support", done: false },
];

const topAirlines = [
  { name: "Indigo", flights: 586, pct: 42 },
  { name: "Air India", flights: 420, pct: 42 },
  { name: "Vistara", flights: 310, pct: 42 },
  { name: "SpiceJet", flights: 245, pct: 42 },
  { name: "Qatar", flights: 180, pct: 42 },
];

const topRoutes = [
  { from: "DEL New Delhi", to: "BKK Bangkok", revenue: "₹67,45,000", pct: 42, growth: "+18.6%" },
  { from: "BOM Mumbai", to: "DXB Dubai", revenue: "₹54,20,000", pct: 38, growth: "+18.6%" },
  { from: "BLR Bengaluru", to: "SIN Singapore", revenue: "₹48,10,000", pct: 35, growth: "+18.6%" },
  { from: "DEL New Delhi", to: "LHR London", revenue: "₹42,30,000", pct: 32, growth: "+18.6%" },
  { from: "HYD Hyderabad", to: "AUH Abu Dhabi", revenue: "₹38,90,000", pct: 28, growth: "+18.6%" },
];

function LineChart() {
  const w = 560;
  const h = 160;
  const pad = { top: 10, right: 10, bottom: 20, left: 30 };
  const innerW = w - pad.left - pad.right;
  const innerH = h - pad.top - pad.bottom;
  const max = 100;

  const toPoints = (data: number[]) =>
    data
      .map((v, i) => {
        const x = pad.left + (i / (data.length - 1)) * innerW;
        const y = pad.top + innerH - (v / max) * innerH;
        return `${x},${y}`;
      })
      .join(" ");

  const colors = {
    revenue: "#9333ea",
    booking: "#006aec",
    tickets: "#22c55e",
    profit: "#f59e0b",
  };

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full">
      {[0, 25, 50, 75, 100].map((tick) => {
        const y = pad.top + innerH - (tick / max) * innerH;
        return (
          <g key={tick}>
            <line x1={pad.left} y1={y} x2={w - pad.right} y2={y} stroke="#e8ebef" strokeWidth="1" />
            <text x={4} y={y + 4} className="fill-slate-400 text-[9px]">
              {tick}K
            </text>
          </g>
        );
      })}
      {Object.entries(chartSeries).map(([key, data]) => (
        <polyline
          key={key}
          fill="none"
          stroke={colors[key as keyof typeof colors]}
          strokeWidth="2"
          points={toPoints(data)}
        />
      ))}
      {chartDays.map((day, i) => {
        const x = pad.left + (i / (chartDays.length - 1)) * innerW;
        return (
          <text key={day} x={x - 14} y={h - 4} className="fill-slate-400 text-[9px]">
            {day}
          </text>
        );
      })}
    </svg>
  );
}

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

function BusinessSummaryTab() {
  return (
    <>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-[#1c304a]">Good Morning, Harshit</h2>
          <p className="text-xs text-slate-500">Here&apos;s what happening with your platform today.</p>
        </div>
        <div className="text-right text-xs text-slate-500">
          <p className="font-medium text-[#1c304a]">20 May 2025 Tuesday</p>
          <p>11:45 AM IST</p>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
        {kpi.map((s) => (
          <AdminStatCard
            key={s.title}
            title={s.title}
            value={s.value}
            icon={s.icon}
            iconClassName={s.iconClass}
            trend={{ value: s.trend, positive: s.up }}
          />
        ))}
      </div>

      <div>
        <h3 className="mb-3 text-sm font-semibold text-[#1c304a]">Today&apos;s Performance</h3>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {today.map((s) => (
            <AdminStatCard key={s.title} title={s.title} value={s.value} icon={s.icon} />
          ))}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card title="Analytics Overview">
          <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {analyticsSummary.map((s) => (
              <div key={s.label}>
                <p className={cn("text-[10px] font-medium", s.color)}>● {s.label}</p>
                <p className="text-sm font-bold text-[#1c304a]">{s.value}</p>
                <p className="text-[10px] text-emerald-600">↑ {s.trend}</p>
              </div>
            ))}
          </div>
          <LineChart />
        </Card>

        <Card
          title="Recent Activities"
          action={
            <button type="button" className="text-xs font-medium text-[#006aec] hover:underline">
              View All
            </button>
          }
        >
          <div className="space-y-3">
            {activities.map((a, i) => (
              <div key={i} className="flex items-start gap-3 border-b border-[#e8ebef] pb-3 last:border-0">
                <div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-[#006aec]" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium text-[#1c304a]">{a.title}</p>
                    <span className="text-[10px] text-slate-400">{a.time}</span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    {a.pnr !== "—" && `PNR: ${a.pnr} · `}
                    {a.role}
                  </p>
                </div>
                <span
                  className={cn(
                    "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium",
                    a.status === "Solved"
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-red-50 text-red-600"
                  )}
                >
                  {a.status}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card title="Top Agent (By Revenue)">
          <div className="space-y-3">
            {topAgents.map((a) => (
              <div key={a.name} className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-50 text-xs font-semibold text-[#006aec]">
                  {a.name[0]}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-[#1c304a]">{a.name}</p>
                  <p className="text-[11px] text-slate-400">{a.tag}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-[#1c304a]">{a.revenue}</p>
                  <p className="text-[11px] text-emerald-600">↑ {a.growth}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Top Suppliers (By Revenue)">
          <div className="space-y-3">
            {topSuppliers.map((s) => (
              <div key={s.name} className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-600">
                  {s.name[0]}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-[#1c304a]">{s.name}</p>
                  <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-slate-100">
                    <div className="h-full rounded-full bg-[#006aec]" style={{ width: `${s.pct}%` }} />
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-400">{s.pct}%</p>
                  <p className="text-sm font-semibold text-[#1c304a]">{s.revenue}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </>
  );
}

function OperationsTab() {
  return (
    <>
      <Card title="Quick Actions">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
          {quickActions.map((a) => (
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
        <Card title="Booking Status">
          <AdminDonutChart
            segments={bookingSegments}
            size={140}
            centerLabel="Total Booking"
            centerValue="1,248"
            showCounts
          />
          <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-5">
            {bookingStats.map((s) => (
              <div key={s.label} className="rounded-lg border border-[#e8ebef] p-2 text-center">
                <s.icon className={cn("mx-auto h-4 w-4", s.color)} />
                <p className="mt-1 text-[10px] text-slate-500">{s.label}</p>
                <p className="text-sm font-bold text-[#1c304a]">{s.value}</p>
                <p className={cn("text-[10px]", s.up ? "text-emerald-600" : "text-red-500")}>
                  {s.up ? "↑" : "↓"} 18.6%
                </p>
              </div>
            ))}
          </div>
        </Card>

        <Card
          title="Calendar & Schedule"
          action={
            <button type="button" className="rounded border border-[#e8ebef] px-2 py-0.5 text-[10px] text-[#006aec]">
              Today
            </button>
          }
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="mb-2 text-xs font-semibold text-[#1c304a]">September 2025</p>
              <div className="grid grid-cols-7 gap-1 text-center text-[10px]">
                {["S", "M", "T", "W", "T", "F", "S"].map((d) => (
                  <span key={d} className="text-slate-400">
                    {d}
                  </span>
                ))}
                {calendarDays.map((d) => (
                  <span
                    key={d}
                    className={cn(
                      "rounded-full py-1",
                      d === 9 ? "bg-[#006aec] font-semibold text-white" : "text-slate-600"
                    )}
                  >
                    {d}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <p className="mb-2 text-xs font-semibold text-[#1c304a]">9th Sep 2025</p>
              <div className="space-y-2">
                {scheduleItems.map((item, i) => (
                  <div key={i} className="flex items-start gap-2 border-b border-[#e8ebef] pb-2 last:border-0">
                    <div
                      className={cn(
                        "mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border",
                        item.done ? "border-emerald-500 bg-emerald-50 text-emerald-600" : "border-slate-300"
                      )}
                    >
                      {item.done && <Check className="h-2.5 w-2.5" />}
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400">{item.time}</p>
                      <p className="text-xs font-medium text-[#1c304a]">{item.title}</p>
                      <p className="text-[10px] text-slate-500">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card title="Top Airlines (By Bookings)">
          <div className="space-y-3">
            {topAirlines.map((a) => (
              <div key={a.name} className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-50 text-xs font-semibold text-[#006aec]">
                  {a.name[0]}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-[#1c304a]">{a.name}</p>
                  <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-slate-100">
                    <div className="h-full rounded-full bg-[#006aec]" style={{ width: `${a.pct}%` }} />
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-400">{a.pct}%</p>
                  <p className="text-sm font-semibold text-[#1c304a]">{a.flights} Flights</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Top Routes (By Revenues)">
          <div className="space-y-3">
            {topRoutes.map((r, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-[#1c304a]">
                    {r.from} <ChevronRight className="inline h-3 w-3" /> {r.to}
                  </p>
                  <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-slate-100">
                    <div className="h-full rounded-full bg-[#006aec]" style={{ width: `${r.pct}%` }} />
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-[#1c304a]">{r.revenue}</p>
                  <p className="text-[11px] text-emerald-600">↑ {r.growth}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </>
  );
}

export default function BusinessOverviewPage() {
  const [tab, setTab] = useState("Business Summary");

  return (
    <div className="flex min-h-full flex-col bg-[#f7f9fc]">
      <AdminPageHeader
        title="Business Overview"
        tabs={["Business Summary", "Operations"]}
        activeTab={tab}
        onTabChange={setTab}
      />
      <div className="flex-1 space-y-5 p-5">
        {tab === "Business Summary" ? <BusinessSummaryTab /> : <OperationsTab />}
      </div>
    </div>
  );
}
