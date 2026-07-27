"use client";

import React, { useEffect, useMemo, useState } from "react";
import { SaleNavbar } from "@/components/SaleNavbar";
import { Footer } from "@/components/Footer";
import { BarChart3, FileText, RefreshCw, TrendingUp } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { getPublicApiUrl } from "@/lib/apiConfig";

type TicketRow = {
  id: string;
  status: string;
  origin?: string;
  destination?: string;
  flight_number?: string;
  total_amount?: string | number;
  currency?: string;
  booking_ref?: string | null;
  pnr_number?: string | null;
  created_at?: string;
  is_agent_booking?: boolean;
  agent_flight_inventory?: string | null;
};

function money(amount: unknown) {
  const n = typeof amount === "string" ? Number(amount) : Number(amount ?? 0);
  if (Number.isNaN(n)) return "—";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);
}

export default function SaleReportsPage() {
  const { access, openAuthModal } = useAuth();
  const [activeSubTab, setActiveSubTab] = useState<"overview" | "bookings">("overview");
  const [tickets, setTickets] = useState<TicketRow[]>([]);
  const [inventoryAnalytics, setInventoryAnalytics] = useState<{
    listings?: number;
    published?: number;
    seats_available?: number;
    seats_held?: number;
    waitlist_count?: number;
    inventory_value_inr?: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    if (!access) {
      setLoading(false);
      setError("Sign in as an agent to view live sales reports.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const apiBase = getPublicApiUrl();
      const [ticketsRes, analyticsRes, exportHint] = await Promise.all([
        fetch(`${apiBase}/tickets/`, {
          headers: { Authorization: `Bearer ${access}` },
          cache: "no-store",
        }),
        fetch(`${apiBase}/flights/inventory/analytics/`, {
          headers: { Authorization: `Bearer ${access}` },
          cache: "no-store",
        }),
        Promise.resolve(true),
      ]);
      if (!ticketsRes.ok) throw new Error(`Failed to load tickets (${ticketsRes.status})`);
      const json = await ticketsRes.json();
      const rows: TicketRow[] = Array.isArray(json)
        ? json
        : Array.isArray(json?.results)
          ? json.results
          : [];
      const agentRows = rows.filter(
        (t) => t.is_agent_booking || Boolean(t.agent_flight_inventory)
      );
      setTickets(agentRows.length ? agentRows : rows);
      if (analyticsRes.ok) {
        const a = await analyticsRes.json();
        setInventoryAnalytics(a?.data || a);
      }
      void exportHint;
    } catch (err) {
      setTickets([]);
      setError(err instanceof Error ? err.message : "Failed to load reports");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [access]);

  const stats = useMemo(() => {
    const confirmed = tickets.filter((t) => t.status === "CONFIRMED");
    const pending = tickets.filter((t) => t.status === "PENDING");
    const cancelled = tickets.filter((t) => t.status === "CANCELLED");
    const revenue = confirmed.reduce((sum, t) => sum + (Number(t.total_amount) || 0), 0);
    const pendingValue = pending.reduce((sum, t) => sum + (Number(t.total_amount) || 0), 0);
    return {
      total: tickets.length,
      confirmed: confirmed.length,
      pending: pending.length,
      cancelled: cancelled.length,
      revenue,
      pendingValue,
    };
  }, [tickets]);

  return (
    <div className="w-full min-h-screen bg-background flex flex-col font-sans">
      <SaleNavbar />

      <div className="w-full bg-gradient-to-r from-primary to-[#121121] py-14">
        <div className="container mx-auto px-6 lg:px-12 text-center text-white">
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-2">
            Sale Reports
          </h1>
          <p className="text-rose-100/80 text-sm md:text-base font-medium max-w-xl mx-auto">
            Live bookings against your offline For Sale inventory.
          </p>
        </div>
      </div>

      <main className="container mx-auto px-6 lg:px-12 py-12 flex-1">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-8">
          <div className="flex gap-2">
            {(
              [
                { id: "overview", label: "Overview", icon: BarChart3 },
                { id: "bookings", label: "Bookings", icon: FileText },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveSubTab(tab.id)}
                className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold ${
                  activeSubTab === tab.id
                    ? "bg-[#D60D26] text-white"
                    : "bg-white border border-slate-200 text-slate-700"
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => (access ? void load() : openAuthModal("login"))}
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>

        {error && (
          <div className="mb-6 rounded-2xl border border-rose-100 bg-rose-50 px-5 py-4 text-rose-700 text-sm font-medium">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="p-4 bg-rose-50 text-primary rounded-xl shrink-0">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-slate-400 text-xs font-bold uppercase tracking-wider">
                Confirmed sales
              </h4>
              <p className="text-2xl font-extrabold text-slate-800">{money(stats.revenue)}</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="p-4 bg-amber-50 text-amber-700 rounded-xl shrink-0">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-slate-400 text-xs font-bold uppercase tracking-wider">
                Pending value
              </h4>
              <p className="text-2xl font-extrabold text-slate-800">{money(stats.pendingValue)}</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="p-4 bg-slate-50 text-slate-700 rounded-xl shrink-0">
              <BarChart3 className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-slate-400 text-xs font-bold uppercase tracking-wider">
                Total bookings
              </h4>
              <p className="text-2xl font-extrabold text-slate-800">{stats.total}</p>
              <p className="text-xs text-slate-500 mt-1">
                {stats.confirmed} confirmed · {stats.pending} pending · {stats.cancelled} cancelled
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-10">
          {[
            { label: "Listings", value: inventoryAnalytics?.listings ?? "—" },
            { label: "Published", value: inventoryAnalytics?.published ?? "—" },
            { label: "Seats held", value: inventoryAnalytics?.seats_held ?? "—" },
            {
              label: "Inventory value",
              value:
                inventoryAnalytics?.inventory_value_inr != null
                  ? money(inventoryAnalytics.inventory_value_inr)
                  : "—",
            },
          ].map((c) => (
            <div key={c.label} className="bg-white rounded-2xl border border-slate-200 p-4">
              <div className="text-[11px] font-bold uppercase tracking-wide text-slate-400">{c.label}</div>
              <div className="mt-1 text-xl font-extrabold text-slate-900">{c.value}</div>
            </div>
          ))}
        </div>

        <div className="mb-8">
          <button
            type="button"
            className="text-sm font-bold text-[#D60D26] hover:underline"
            onClick={() => {
              if (!access) return openAuthModal("login");
              void (async () => {
                const apiBase = getPublicApiUrl();
                const res = await fetch(`${apiBase}/flights/inventory/export/?format=csv`, {
                  headers: { Authorization: `Bearer ${access}` },
                });
                if (!res.ok) return;
                const blob = await res.blob();
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = "inventory_export.csv";
                a.click();
                URL.revokeObjectURL(url);
              })();
            }}
          >
            Download Citizenplane-style inventory CSV
          </button>
        </div>

        {activeSubTab === "overview" && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 text-sm text-slate-600">
            {loading
              ? "Loading live ticket data…"
              : "Overview uses your agent inventory bookings from the tickets API. Fulfill PENDING requests from Sale Inventory to move them into confirmed sales."}
          </div>
        )}

        {activeSubTab === "bookings" && (
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
            {loading && <div className="p-8 text-center text-slate-500">Loading bookings…</div>}
            {!loading && tickets.length === 0 && (
              <div className="p-8 text-center text-slate-400">No inventory bookings yet.</div>
            )}
            {!loading && tickets.length > 0 && (
              <div className="divide-y divide-slate-100">
                {tickets.map((t) => (
                  <div
                    key={t.id}
                    className="px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div>
                      <div className="font-bold text-slate-800">
                        {t.origin || "—"} → {t.destination || "—"} · {t.flight_number || "Flight"}
                      </div>
                      <div className="text-xs text-slate-500 mt-1">
                        {t.pnr_number || t.booking_ref || t.id.slice(0, 8)} ·{" "}
                        {t.created_at
                          ? new Date(t.created_at).toLocaleString("en-IN")
                          : "—"}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span
                        className={`text-[11px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border ${
                          t.status === "CONFIRMED"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                            : t.status === "PENDING"
                              ? "bg-amber-50 text-amber-700 border-amber-100"
                              : "bg-slate-50 text-slate-600 border-slate-200"
                        }`}
                      >
                        {t.status}
                      </span>
                      <span className="font-extrabold text-slate-900">{money(t.total_amount)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
