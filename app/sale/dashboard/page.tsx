"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  BarChart3,
  Bell,
  Calendar,
  Check,
  ChevronDown,
  ChevronRight,
  Clock,
  CloudUpload,
  CreditCard,
  Download,
  Filter,
  HelpCircle,
  IndianRupee,
  LayoutDashboard,
  ListOrdered,
  Plane,
  RefreshCw,
  Search,
  Settings,
  SlidersHorizontal,
  Ticket,
  UserPlus,
  Users,
  Wallet,
} from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { AdminStatCard } from "@/components/admin/AdminStatCard";
import { AdminDonutChart } from "@/components/admin/AdminCharts";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";
import {
  fetchAgentDashboard,
  type AgentDashboardPayload,
} from "@/lib/sale/agentDashboard";

import { DashboardAdminSection } from "@/components/sale/sections/DashboardAdminSection";
import { BookingListSection } from "@/components/sale/sections/BookingListSection";
import { CancellationsSection } from "@/components/sale/sections/CancellationsSection";
import { AmendmentsSection } from "@/components/sale/sections/AmendmentsSection";
import { FlightSearchHistorySection } from "@/components/sale/sections/FlightSearchHistorySection";
import { TravellerProfileSection } from "@/components/sale/sections/TravellerProfileSection";
import { DiscountsSection } from "@/components/sale/sections/DiscountsSection";
import { MarkupsSection } from "@/components/sale/sections/MarkupsSection";
import { ServiceChargesSection } from "@/components/sale/sections/ServiceChargesSection";
import { CustomerPaymentSection } from "@/components/sale/sections/CustomerPaymentSection";
import { LedgerSection } from "@/components/sale/sections/LedgerSection";
import { DepositHistorySection } from "@/components/sale/sections/DepositHistorySection";
import { DepositRequestSection } from "@/components/sale/sections/DepositRequestSection";
import { AgentDepReqSection } from "@/components/sale/sections/AgentDepReqSection";
import { BookingReportsSection } from "@/components/sale/sections/BookingReportsSection";
import { FinancialReportsSection } from "@/components/sale/sections/FinancialReportsSection";
import { CompanyProfileSection } from "@/components/sale/sections/CompanyProfileSection";
import { InvoiceSettingsSection } from "@/components/sale/sections/InvoiceSettingsSection";
import { StaffManageSection } from "@/components/sale/sections/StaffManageSection";
import { HelpCenterSection } from "@/components/sale/sections/HelpCenterSection";

function Card({
  title,
  children,
  action,
}: {
  title: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
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

function LineChart({
  days,
  series,
}: {
  days: string[];
  series: { revenue: number[]; booking: number[]; tickets: number[]; profit: number[] };
}) {
  const w = 560;
  const h = 160;
  const pad = { top: 10, right: 10, bottom: 20, left: 30 };
  const innerW = w - pad.left - pad.right;
  const innerH = h - pad.top - pad.bottom;
  const max = Math.max(
    1,
    ...series.revenue,
    ...series.booking,
    ...series.tickets,
    ...series.profit,
    10
  );

  const toPoints = (data: number[]) =>
    data
      .map((v, i) => {
        const x = pad.left + (data.length <= 1 ? 0 : (i / (data.length - 1)) * innerW);
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
      {[0, 0.25, 0.5, 0.75, 1].map((tick) => {
        const y = pad.top + innerH - tick * innerH;
        return (
          <g key={tick}>
            <line x1={pad.left} y1={y} x2={w - pad.right} y2={y} stroke="#e8ebef" strokeWidth="1" />
            <text x={4} y={y + 4} className="fill-slate-400 text-[9px]">
              {Math.round(max * tick)}
            </text>
          </g>
        );
      })}
      {(Object.keys(colors) as (keyof typeof colors)[]).map((key) => (
        <polyline
          key={key}
          fill="none"
          stroke={colors[key]}
          strokeWidth="2"
          points={toPoints(series[key] || [])}
        />
      ))}
      {days.map((day, i) => {
        const x = pad.left + (days.length <= 1 ? 0 : (i / (days.length - 1)) * innerW);
        return (
          <text key={`${day}-${i}`} x={x - 14} y={h - 4} className="fill-slate-400 text-[9px]">
            {day}
          </text>
        );
      })}
    </svg>
  );
}

const quickActionMeta: Record<
  string,
  { icon: typeof Plane; color: string; hrefFallback: string }
> = {
  "New Booking": { icon: Plane, color: "bg-blue-50 text-blue-600", hrefFallback: "/sale/flight/all" },
  "Import PNR": {
    icon: CloudUpload,
    color: "bg-sky-50 text-sky-600",
    hrefFallback: "/sale/inventory/new?mode=pnr",
  },
  "Add Payment": {
    icon: Wallet,
    color: "bg-emerald-50 text-emerald-600",
    hrefFallback: "/sale/dashboard?section=finance/deposit-request",
  },
  "Create Agent": {
    icon: UserPlus,
    color: "bg-orange-50 text-orange-600",
    hrefFallback: "/sale/dashboard?section=settings/staff",
  },
};

/**
 * End-to-end linked navigation structure matching Figma Navigation Bar 2
 */
const navCategories = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    children: [
      { id: "dashboard/business", label: "Business Overview" },
      { id: "dashboard/admin", label: "Administration" },
    ],
  },
  {
    id: "booking",
    label: "Booking",
    icon: Ticket,
    children: [
      { id: "booking/list", label: "Booking list" },
      { id: "booking/cancellation", label: "Cancellation" },
      { id: "booking/amendments", label: "Amendments" },
      { id: "booking/search-history", label: "Flight Search History" },
      { id: "booking/traveller", label: "Traveller profile" },
    ],
  },
  {
    id: "pricing",
    label: "Pricing & Rules",
    icon: SlidersHorizontal,
    children: [
      { id: "pricing/discounts", label: "Discounts" },
      { id: "pricing/markups", label: "Markups" },
      { id: "pricing/service-charges", label: "Service Charges" },
    ],
  },
  {
    id: "finance",
    label: "Finance",
    icon: Wallet,
    children: [
      { id: "finance/customer-payment", label: "Customer Payment" },
      { id: "finance/ledger", label: "Ledger" },
      { id: "finance/deposit-history", label: "Deposit History" },
      { id: "finance/deposit-request", label: "Deposit Request" },
      { id: "finance/agent-dep-req", label: "Agent Dep. Req." },
    ],
  },
  {
    id: "reports",
    label: "Reports",
    icon: BarChart3,
    children: [
      { id: "reports/booking", label: "Booking Reports" },
      { id: "reports/financial", label: "Financial Reports" },
    ],
  },
  {
    id: "settings",
    label: "Settings",
    icon: Settings,
    children: [
      { id: "settings/company", label: "Company profile" },
      { id: "settings/invoice", label: "Invoice Setting" },
      { id: "settings/staff", label: "Staff Manage" },
      { id: "settings/help", label: "Help Center" },
    ],
  },
];

function MonthCalendar({
  selected,
  marked,
  onSelect,
}: {
  selected: string;
  marked: Set<string>;
  onSelect: (iso: string) => void;
}) {
  const anchor = selected ? new Date(`${selected}T12:00:00`) : new Date();
  const year = anchor.getFullYear();
  const month = anchor.getMonth();
  const first = new Date(year, month, 1);
  const startPad = first.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = [
    ...Array.from({ length: startPad }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  const label = anchor.toLocaleDateString("en-IN", { month: "long", year: "numeric" });

  return (
    <div>
      <p className="mb-2 text-sm font-semibold text-[#1c304a]">{label}</p>
      <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-semibold text-slate-400">
        {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
          <span key={d}>{d}</span>
        ))}
      </div>
      <div className="mt-1 grid grid-cols-7 gap-1 text-center text-[12px]">
        {cells.map((day, i) => {
          if (!day) return <span key={`e-${i}`} />;
          const iso = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
          const active = iso === selected;
          return (
            <button
              key={iso}
              type="button"
              onClick={() => onSelect(iso)}
              className={cn(
                "mx-auto flex h-7 w-7 items-center justify-center rounded-full",
                active ? "bg-[#006aec] text-white" : "text-[#1c304a] hover:bg-slate-100",
                marked.has(iso) && !active && "font-bold text-[#D60D26]"
              )}
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function AgentBusinessOverviewPage() {
  const { access, user, openAuthModal, isLoading: authLoading } = useAuth();
  const [activeSection, setActiveSection] = useState<string>("dashboard/business");
  const [expandedCats, setExpandedCats] = useState<Record<string, boolean>>({
    dashboard: true,
    booking: false,
    pricing: false,
    finance: false,
    reports: false,
    settings: false,
  });

  const [tab, setTab] = useState<"Business Summary" | "Operations">("Business Summary");
  const [range, setRange] = useState<"24h" | "7d" | "30d">("24h");
  const [query, setQuery] = useState("");
  const [selectedDay, setSelectedDay] = useState("");
  const [data, setData] = useState<AgentDashboardPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Sync with URL query parameter ?section=...
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const sec = params.get("section");
      if (sec) {
        setActiveSection(sec);
        const parentCat = sec.split("/")[0];
        if (parentCat) {
          setExpandedCats((prev) => ({ ...prev, [parentCat]: true }));
        }
      }
    }
  }, []);

  const navigateToSection = (sectionId: string) => {
    setActiveSection(sectionId);
    const parentCat = sectionId.split("/")[0];
    if (parentCat) {
      setExpandedCats((prev) => ({ ...prev, [parentCat]: true }));
    }
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.set("section", sectionId);
      window.history.pushState(null, "", url.toString());
    }
  };

  const toggleCategory = (catId: string) => {
    setExpandedCats((prev) => ({ ...prev, [catId]: !prev[catId] }));
  };

  const load = async (nextRange = range) => {
    if (!access) {
      setLoading(false);
      setError("Sign in as an agent to view your dashboard.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const payload = await fetchAgentDashboard(access, nextRange);
      setData(payload);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authLoading) return;
    void load(range);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [access, authLoading, range]);

  const nowLabel = useMemo(() => {
    const d = data?.now ? new Date(data.now) : new Date();
    return {
      date: d.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        weekday: "long",
      }),
      time: d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true }) + " IST",
    };
  }, [data?.now]);

  const rangeLabel = range === "24h" ? "Last 24 hours" : range === "7d" ? "Last 7 days" : "Last 30 days";
  const needle = query.trim().toLowerCase();
  const activities = (data?.activities || []).filter(
    (a) => !needle || `${a.title} ${a.pnr} ${a.role}`.toLowerCase().includes(needle)
  );
  const schedule = data?.schedule || [];
  const markedDays = useMemo(() => new Set(schedule.map((s) => s.date)), [schedule]);
  const dayItems = schedule.filter((s) => !selectedDay || s.date === selectedDay);

  const downloadCsv = () => {
    if (!data) return;
    const lines = [
      "metric,value",
      `revenue,${data.kpi.total_revenue}`,
      `bookings,${data.kpi.total_booking}`,
      `agents,${data.kpi.total_agents}`,
      `wallet,${data.kpi.wallet_balance}`,
      `departures,${data.kpi.departures}`,
      `profit,${data.analytics.profit}`,
    ];
    const blob = new Blob([lines.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "agent-dashboard.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const kpiTrend = (pct: number) => ({
    value: `${Math.abs(pct).toFixed(1)}% vs yesterday`,
    positive: pct >= 0,
  });

  return (
    <div className="flex h-screen overflow-hidden bg-[#f7f9fc] font-sans text-[#1c304a]">
      {/* Figma Navigation Bar 2 Sidebar */}
      <aside className="hidden w-[220px] shrink-0 flex-col border-r border-[#e8ebef] bg-white md:flex">
        <Link href="/" className="flex items-center gap-2 px-4 py-4 border-b border-[#e8ebef]">
          <Logo />
          <span className="text-[13px] font-black leading-tight text-[#D60D26]">
            My Travel Deal
          </span>
        </Link>
        <nav className="flex-1 space-y-0.5 overflow-y-auto px-2 py-3">
          {navCategories.map((cat) => {
            const Icon = cat.icon;
            const isExpanded = expandedCats[cat.id];
            const hasActiveChild = cat.children.some((c) => c.id === activeSection);

            return (
              <div key={cat.id} className="mb-0.5">
                <button
                  type="button"
                  onClick={() => toggleCategory(cat.id)}
                  className={cn(
                    "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-[12px] font-bold transition-colors",
                    hasActiveChild ? "text-[#1c304a]" : "text-slate-600 hover:bg-slate-50"
                  )}
                >
                  <Icon className={cn("h-4 w-4", hasActiveChild ? "text-[#D60D26]" : "text-slate-400")} />
                  <span className="flex-1 text-left">{cat.label}</span>
                  {isExpanded ? (
                    <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
                  ) : (
                    <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
                  )}
                </button>

                {isExpanded && (
                  <div className="ml-4 space-y-0.5 border-l border-slate-200 pl-2">
                    {cat.children.map((child) => {
                      const isActive = child.id === activeSection;
                      return (
                        <button
                          key={child.id}
                          type="button"
                          onClick={() => navigateToSection(child.id)}
                          className={cn(
                            "relative flex w-full items-center rounded-md px-3 py-1.5 text-left text-[11px] font-semibold transition-all",
                            isActive
                              ? "bg-rose-50/60 font-bold text-[#D60D26]"
                              : "text-slate-500 hover:bg-slate-50 hover:text-[#1c304a]"
                          )}
                        >
                          {isActive && (
                            <span className="absolute -left-2 top-1/2 h-3.5 w-[3px] -translate-y-1/2 rounded-r bg-[#D60D26]" />
                          )}
                          <span className="truncate">{child.label}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </aside>

      {/* Main Content Area */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Workspace Topbar */}
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-[#e8ebef] bg-white px-4 py-3 sm:px-6">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Agent Portal</p>
            <p className="text-sm font-black text-[#1c304a]">{data?.workspace || user?.username || "Travel Partner Workspace"}</p>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={range}
              onChange={(e) => setRange(e.target.value as "24h" | "7d" | "30d")}
              className="rounded-full border border-[#e8ebef] bg-white px-3 py-1.5 text-[11px] font-bold text-slate-600 outline-none"
            >
              <option value="24h">Last 24 hours</option>
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
            </select>
            <button
              type="button"
              onClick={() => navigateToSection("settings/help")}
              className="rounded-full border border-[#e8ebef] p-2 text-slate-500 hover:bg-slate-50"
              title="Help & Support Desk"
            >
              <HelpCircle className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => navigateToSection("settings/company")}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1c304a] text-xs font-bold text-white hover:opacity-90"
              title="Company Profile"
            >
              {(user?.username || "A").slice(0, 1).toUpperCase()}
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-[1240px] px-4 py-6 sm:px-6">
            {/* 1. Dashboard: Business Overview */}
            {activeSection === "dashboard/business" && (
              <div className="space-y-5">
                <div className="flex flex-wrap items-end justify-between gap-3">
                  <div>
                    <h1 className="text-2xl font-black text-[#1c304a]">Business Overview</h1>
                    <div className="mt-3 flex items-center gap-4 text-[13px] font-bold">
                      {(["Business Summary", "Operations"] as const).map((t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => setTab(t)}
                          className={cn(
                            "border-b-2 pb-1 transition-all",
                            tab === t ? "border-[#D60D26] text-[#D60D26]" : "border-transparent text-slate-400 hover:text-slate-600"
                          )}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <label className="flex items-center gap-2 rounded-full border border-[#e8ebef] bg-white px-3 py-1.5 shadow-sm">
                      <Search className="h-3.5 w-3.5 text-slate-400" />
                      <input
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search metrics..."
                        className="w-28 bg-transparent text-[12px] outline-none sm:w-40"
                      />
                    </label>
                    <span className="rounded-full border border-[#e8ebef] bg-white px-3 py-1.5 text-[11px] font-bold text-slate-500">
                      {rangeLabel}
                    </span>
                    <button
                      type="button"
                      onClick={downloadCsv}
                      className="rounded-full border border-[#e8ebef] bg-white p-2 text-slate-500 hover:bg-slate-50 shadow-sm"
                      title="Export CSV"
                    >
                      <Download className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => navigateToSection("settings/company")}
                      className="rounded-full border border-[#e8ebef] bg-white p-2 text-slate-500 hover:bg-slate-50 shadow-sm"
                      title="Settings"
                    >
                      <Settings className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                {!access && !authLoading && (
                  <div className="rounded-[10px] border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                    You need an agent login to open this dashboard.{" "}
                    <button type="button" onClick={openAuthModal} className="font-bold underline">
                      Login as Travel Agent
                    </button>
                  </div>
                )}

                {error && access && (
                  <div className="rounded-[10px] border border-red-200 bg-red-50 p-4 text-sm text-red-700 flex items-center justify-between gap-3">
                    <span>{error}</span>
                    <button
                      type="button"
                      onClick={() => void load()}
                      className="shrink-0 rounded-full bg-white px-3 py-1 text-xs font-bold border border-red-200"
                    >
                      Retry
                    </button>
                  </div>
                )}

                {loading && (
                  <div className="rounded-[10px] border border-[#e8ebef] bg-white p-10 text-center text-slate-500 text-sm">
                    Loading agent dashboard…
                  </div>
                )}

                {!loading && data && tab === "Business Summary" && (
                  <>
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <h2 className="text-base font-semibold text-[#1c304a]">{data.greeting}</h2>
                        <p className="text-xs text-slate-500">{data.subtitle}</p>
                      </div>
                      <div className="text-right text-xs text-slate-500">
                        <p className="font-medium text-[#1c304a]">{nowLabel.date}</p>
                        <p>{nowLabel.time}</p>
                      </div>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                      <AdminStatCard
                        title="Total Revenue"
                        value={data.kpi.total_revenue_display}
                        icon={IndianRupee}
                        iconClassName="bg-emerald-50"
                        trend={kpiTrend(data.kpi.revenue_trend_pct)}
                      />
                      <AdminStatCard
                        title="Total Booking"
                        value={String(data.kpi.total_booking)}
                        icon={Plane}
                        iconClassName="bg-blue-50"
                        trend={kpiTrend(data.kpi.booking_trend_pct)}
                      />
                      <AdminStatCard
                        title="Total Agents"
                        value={String(data.kpi.total_agents ?? 1)}
                        icon={Users}
                        iconClassName="bg-orange-50"
                        trend={kpiTrend(data.kpi.booking_trend_pct)}
                      />
                      <AdminStatCard
                        title="Wallet Balance"
                        value={data.kpi.wallet_balance_display}
                        icon={Wallet}
                        iconClassName="bg-emerald-50"
                        trend={kpiTrend(data.kpi.revenue_trend_pct)}
                      />
                      <AdminStatCard
                        title="Departure"
                        value={String(data.kpi.departures)}
                        icon={Calendar}
                        iconClassName="bg-blue-50"
                        trend={kpiTrend(data.kpi.booking_trend_pct)}
                      />
                    </div>

                    <div>
                      <h3 className="mb-3 text-sm font-semibold text-[#1c304a]">Today&apos;s Performance</h3>
                      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
                        <AdminStatCard title="Total Booking" value={String(data.today.total_booking)} icon={Plane} />
                        <AdminStatCard title="Pending Booking" value={String(data.today.pending_booking)} icon={Clock} />
                        <AdminStatCard title="Refund Request" value={String(data.today.refund_request)} icon={RefreshCw} />
                        <AdminStatCard title="Waiting list" value={String(data.today.waiting_list)} icon={ListOrdered} />
                        <AdminStatCard title="Schedule Change" value={String(data.today.schedule_change)} icon={AlertTriangle} />
                        <AdminStatCard title="Payment Failure" value={String(data.today.payment_failure)} icon={CreditCard} />
                      </div>
                    </div>

                    <div className="grid gap-4 lg:grid-cols-2">
                      <Card title="Analytics Overview">
                        <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                          {[
                            { label: "Revenue", value: data.analytics.revenue_display, color: "text-purple-600" },
                            { label: "Booking", value: String(data.analytics.booking), color: "text-blue-600" },
                            { label: "Ticket Issued", value: String(data.analytics.ticket_issued), color: "text-emerald-600" },
                            { label: "Profit", value: data.analytics.profit_display, color: "text-amber-500" },
                          ].map((s) => (
                            <div key={s.label}>
                              <p className={cn("text-[10px] font-medium", s.color)}>● {s.label}</p>
                              <p className="text-sm font-bold text-[#1c304a]">{s.value}</p>
                            </div>
                          ))}
                        </div>
                        <LineChart days={data.analytics.chart_days} series={data.analytics.chart_series} />
                      </Card>

                      <Card
                        title="Recent Activities"
                        action={
                          <span className="text-[11px] font-bold text-slate-400">
                            {activities.length} Events
                          </span>
                        }
                      >
                        <div className="space-y-3">
                          {activities.length === 0 && (
                            <p className="text-xs text-slate-400 py-6 text-center">No recent activities.</p>
                          )}
                          {activities.slice(0, 6).map((a, i) => (
                            <div key={`${a.pnr}-${i}`} className="flex items-center justify-between gap-3 text-xs">
                              <div>
                                <p className="font-semibold text-[#1c304a]">{a.title}</p>
                                <p className="text-[10px] text-slate-400">{a.role} · {a.time}</p>
                              </div>
                              <div className="text-right">
                                <span className="font-mono text-[11px] font-bold text-[#D60D26]">{a.pnr}</span>
                                <span className="block text-[10px] text-emerald-600">● {a.status}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </Card>
                    </div>
                  </>
                )}

                {!loading && data && tab === "Operations" && (
                  <>
                    <div>
                      <h3 className="mb-3 text-sm font-semibold text-[#1c304a]">Quick Actions</h3>
                      <div className="grid gap-3 grid-cols-2 sm:grid-cols-4">
                        {(data.quick_actions.length
                          ? data.quick_actions
                          : Object.entries(quickActionMeta).map(([label, m]) => ({
                              label,
                              href: m.hrefFallback,
                            }))
                        ).map((action) => {
                          const meta = quickActionMeta[action.label] || quickActionMeta["New Booking"];
                          const Icon = meta.icon;
                          return (
                            <Link
                              key={action.label}
                              href={action.href || meta.hrefFallback}
                              className="rounded-[10px] border border-[#e8ebef] bg-white p-4 shadow-sm hover:border-[#D60D26]/40 transition-colors flex flex-col items-center gap-2 text-center"
                            >
                              <div className={cn("h-11 w-11 rounded-xl flex items-center justify-center", meta.color)}>
                                <Icon className="h-5 w-5" />
                              </div>
                              <span className="text-[13px] font-bold text-[#1c304a]">{action.label}</span>
                            </Link>
                          );
                        })}
                      </div>
                    </div>

                    <div className="grid gap-4 lg:grid-cols-2">
                      <Card title="Booking Status">
                        <AdminDonutChart
                          segments={data.booking_status.segments.map((s) => ({
                            label: s.label,
                            value: Math.max(s.count, 0) || s.value,
                            color: s.color,
                            count: s.count,
                          }))}
                          size={140}
                          centerLabel="Total Booking"
                          centerValue={String(data.booking_status.total)}
                          showCounts
                        />
                        <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-2">
                          {data.booking_status.segments.map((s) => (
                            <div key={s.label} className="rounded-lg border border-slate-100 p-2.5">
                              <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                                <Check className="h-3 w-3" style={{ color: s.color }} />
                                {s.label}
                              </div>
                              <p className="mt-1 text-sm font-bold text-[#1c304a]">{s.count}</p>
                            </div>
                          ))}
                        </div>
                      </Card>

                      <Card title="Calendar">
                        <div className="grid gap-4 sm:grid-cols-2">
                          <MonthCalendar
                            selected={selectedDay || new Date().toISOString().slice(0, 10)}
                            marked={markedDays}
                            onSelect={setSelectedDay}
                          />
                          <div className="space-y-2">
                            <p className="text-[12px] font-semibold text-slate-500">
                              {selectedDay || "Upcoming departures"}
                            </p>
                            {dayItems.length === 0 && (
                              <p className="text-xs text-slate-400">No departures on this day.</p>
                            )}
                            {dayItems.slice(0, 6).map((item, i) => (
                              <div key={`${item.date}-${item.time}-${i}`} className="flex items-start gap-2 text-[12px]">
                                {item.done ? (
                                  <Check className="mt-0.5 h-3.5 w-3.5 text-emerald-600" />
                                ) : (
                                  <span className="mt-1 h-2.5 w-2.5 rounded-full border border-slate-300" />
                                )}
                                <div className="min-w-0">
                                  <p className="font-semibold text-[#1c304a]">
                                    {item.time} · {item.title}
                                  </p>
                                  <p className="text-slate-400">{item.desc}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </Card>
                    </div>

                    <div className="grid gap-4 lg:grid-cols-2">
                      <Card title="Top Airlines (By Bookings)">
                        <div className="space-y-3">
                          {data.top_airlines.length === 0 && (
                            <p className="text-xs text-slate-400 py-6 text-center">No airline data yet.</p>
                          )}
                          {data.top_airlines.map((a) => (
                            <div key={a.name} className="flex items-center gap-3">
                              <div className="w-24 shrink-0 text-sm font-semibold text-[#1c304a] truncate">
                                {a.name}
                              </div>
                              <div className="flex-1 h-2 rounded-full bg-slate-100 overflow-hidden">
                                <div
                                  className="h-full rounded-full bg-[#006aec]"
                                  style={{ width: `${Math.max(8, a.pct)}%` }}
                                />
                              </div>
                              <div className="w-12 text-right text-xs font-bold text-slate-500">{a.flights}</div>
                            </div>
                          ))}
                        </div>
                      </Card>
                      <Card title="Top Routes (By Revenues)">
                        <div className="space-y-3">
                          {data.top_routes.length === 0 && (
                            <p className="text-xs text-slate-400 py-6 text-center">No route revenue yet.</p>
                          )}
                          {data.top_routes.map((r) => (
                            <div key={`${r.from}-${r.to}`} className="flex items-center gap-3">
                              <div className="min-w-0 flex-1">
                                <p className="text-sm font-semibold text-[#1c304a] truncate">
                                  {r.from} → {r.to}
                                </p>
                                <div className="mt-1 h-2 rounded-full bg-slate-100 overflow-hidden">
                                  <div
                                    className="h-full rounded-full bg-[#006aec]"
                                    style={{ width: `${Math.max(8, r.pct)}%` }}
                                  />
                                </div>
                              </div>
                              <div className="text-right shrink-0">
                                <p className="text-sm font-semibold text-[#1c304a]">{r.revenue}</p>
                                <p className="text-[11px] text-emerald-600">{r.growth}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </Card>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* 2. Dashboard: Administration & Permissions */}
            {activeSection === "dashboard/admin" && <DashboardAdminSection />}

            {/* 3. Booking: Booking List */}
            {activeSection === "booking/list" && <BookingListSection />}

            {/* 4. Booking: Cancellations & Refunds */}
            {activeSection === "booking/cancellation" && <CancellationsSection />}

            {/* 5. Booking: Amendments & Reissue */}
            {activeSection === "booking/amendments" && <AmendmentsSection />}

            {/* 6. Booking: Flight Search History */}
            {activeSection === "booking/search-history" && <FlightSearchHistorySection />}

            {/* 7. Booking: Traveller Profile Directory */}
            {activeSection === "booking/traveller" && <TravellerProfileSection />}

            {/* 8. Pricing & Rules: Discounts */}
            {activeSection === "pricing/discounts" && <DiscountsSection />}

            {/* 9. Pricing & Rules: Markups */}
            {activeSection === "pricing/markups" && <MarkupsSection />}

            {/* 10. Pricing & Rules: Service Charges */}
            {activeSection === "pricing/service-charges" && <ServiceChargesSection />}

            {/* 11. Finance: Customer Payment & Balances */}
            {activeSection === "finance/customer-payment" && <CustomerPaymentSection />}

            {/* 12. Finance: Account Ledger & Statement */}
            {activeSection === "finance/ledger" && <LedgerSection />}

            {/* 13. Finance: Deposit History */}
            {activeSection === "finance/deposit-history" && <DepositHistorySection />}

            {/* 14. Finance: Deposit Request */}
            {activeSection === "finance/deposit-request" && <DepositRequestSection />}

            {/* 15. Finance: Agent Dep. Req. */}
            {activeSection === "finance/agent-dep-req" && <AgentDepReqSection />}

            {/* 16. Reports: Booking Reports */}
            {activeSection === "reports/booking" && <BookingReportsSection />}

            {/* 17. Reports: Financial Reports */}
            {activeSection === "reports/financial" && <FinancialReportsSection />}

            {/* 18. Settings: Company Profile */}
            {activeSection === "settings/company" && <CompanyProfileSection />}

            {/* 19. Settings: Invoice Settings */}
            {activeSection === "settings/invoice" && <InvoiceSettingsSection />}

            {/* 20. Settings: Staff Manage */}
            {activeSection === "settings/staff" && <StaffManageSection />}

            {/* 21. Settings: Help Center */}
            {activeSection === "settings/help" && <HelpCenterSection />}
          </div>
        </main>
      </div>
    </div>
  );
}
