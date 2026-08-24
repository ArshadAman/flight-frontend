"use client";

import React, { useEffect, useMemo, useState } from "react";
import { SaleNavbar } from "@/components/SaleNavbar";
import { Footer } from "@/components/Footer";
import { ChevronDown, FileText, Filter, RefreshCw, Search } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { getPublicApiUrl } from "@/lib/apiConfig";
import { unwrapApiList } from "@/lib/sale/offlinePortal";
import {
  OfflinePortalFiltersModal,
  countActiveFilters,
  emptyOfflineFilters,
  type OfflineFilters,
} from "@/components/sale/OfflinePortalFilters";

type AuditEntry = {
  id: string;
  date: string;
  time: string;
  rawDate: Date;
  entry: string;
  action: string;
  actionType: "booking" | "cancel" | "hold" | "pnr" | "change";
  agent: string;
};

type TicketRow = {
  id: string;
  status: string;
  origin?: string;
  destination?: string;
  pnr_number?: string | null;
  booking_ref?: string | null;
  ticket_number?: string | null;
  created_at?: string;
  updated_at?: string;
  agent_cancellation_reason?: string | null;
};

type HoldRow = {
  id: string;
  status: string;
  seats?: number;
  created_at?: string;
  updated_at?: string;
  expires_at?: string;
  inventory_route?: string;
};

function agentCodeFromUser(email?: string, name?: string) {
  const base = (name || email || "AGT").replace(/[^a-zA-Z]/g, "").toUpperCase();
  return base.slice(0, 3) || "AGT";
}

const ACTION_BADGE: Record<string, { bg: string; text: string }> = {
  booking: { bg: "bg-emerald-100", text: "text-emerald-700" },
  cancel: { bg: "bg-rose-100", text: "text-rose-700" },
  hold: { bg: "bg-amber-100", text: "text-amber-700" },
  pnr: { bg: "bg-blue-100", text: "text-blue-700" },
  change: { bg: "bg-slate-100", text: "text-slate-600" },
};

export default function HistoryPage() {
  const { access, user, openAuthModal } = useAuth();
  const [tickets, setTickets] = useState<TicketRow[]>([]);
  const [holds, setHolds] = useState<HoldRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [sort, setSort] = useState("Recommended");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filters, setFilters] = useState<OfflineFilters>(emptyOfflineFilters);

  const load = async () => {
    if (!access) {
      setLoading(false);
      setError("Sign in as an agent to view history.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const apiBase = getPublicApiUrl();
      const [ticketRes, holdRes] = await Promise.all([
        fetch(`${apiBase}/tickets/`, {
          headers: { Authorization: `Bearer ${access}` },
          cache: "no-store",
        }),
        fetch(`${apiBase}/flights/holds/`, {
          headers: { Authorization: `Bearer ${access}` },
          cache: "no-store",
        }),
      ]);
      if (!ticketRes.ok) throw new Error(`Failed to load tickets (${ticketRes.status})`);
      const ticketJson = await ticketRes.json();
      setTickets(unwrapApiList<TicketRow>(ticketJson));
      // Holds may 403 for non-agent — silently ignore
      if (holdRes.ok) {
        const holdJson = await holdRes.json();
        setHolds(unwrapApiList<HoldRow>(holdJson));
      }
    } catch (err) {
      setTickets([]);
      setHolds([]);
      setError(err instanceof Error ? err.message : "Failed to load history");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [access]);

  const entries = useMemo<AuditEntry[]>(() => {
    const agent = agentCodeFromUser(user?.email, user?.name);
    const rows: AuditEntry[] = [];

    for (const t of tickets) {
      const when = t.created_at;
      if (!when) continue;
      const d = new Date(when);
      const ref = t.pnr_number || t.booking_ref || t.id.slice(0, 6).toUpperCase();

      if (t.status === "CONFIRMED" && t.pnr_number) {
        rows.push({
          id: `${t.id}-pnr`,
          rawDate: d,
          date: d.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "2-digit" }),
          time: d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", hour12: true }),
          entry: `PNR issued: ${t.pnr_number}${t.origin && t.destination ? ` — ${t.origin}→${t.destination}` : ""}`,
          action: "PNR Issued",
          actionType: "pnr",
          agent,
        });
      } else if (t.status === "CANCELLED") {
        const cancelTime = new Date(t.updated_at || when);
        rows.push({
          id: `${t.id}-cancel`,
          rawDate: cancelTime,
          date: cancelTime.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "2-digit" }),
          time: cancelTime.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", hour12: true }),
          entry: `Booking cancelled: ${ref}${t.agent_cancellation_reason ? ` — ${t.agent_cancellation_reason}` : ""}`,
          action: "Cancelled",
          actionType: "cancel",
          agent,
        });
      } else {
        rows.push({
          id: `${t.id}-created`,
          rawDate: d,
          date: d.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "2-digit" }),
          time: d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", hour12: true }),
          entry: `Booking created: ${ref}${t.origin && t.destination ? ` — ${t.origin}→${t.destination}` : ""}`,
          action: "Booking",
          actionType: "booking",
          agent,
        });
      }
    }

    for (const h of holds) {
      const when = h.created_at;
      if (!when) continue;
      const d = new Date(when);
      const route = h.inventory_route || "unknown route";
      const seats = h.seats || 1;

      rows.push({
        id: `hold-${h.id}-created`,
        rawDate: d,
        date: d.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "2-digit" }),
        time: d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", hour12: true }),
        entry: `Hold created: ${seats} seat${seats > 1 ? "s" : ""} on ${route}`,
        action: "Hold",
        actionType: "hold",
        agent,
      });

      if (h.status === "CANCELLED" && h.updated_at) {
        const cancelTime = new Date(h.updated_at);
        rows.push({
          id: `hold-${h.id}-cancel`,
          rawDate: cancelTime,
          date: cancelTime.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "2-digit" }),
          time: cancelTime.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", hour12: true }),
          entry: `Hold cancelled on ${route}`,
          action: "Hold Cancelled",
          actionType: "cancel",
          agent,
        });
      } else if (h.status === "EXPIRED" && h.expires_at) {
        const expTime = new Date(h.expires_at);
        rows.push({
          id: `hold-${h.id}-expired`,
          rawDate: expTime,
          date: expTime.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "2-digit" }),
          time: expTime.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", hour12: true }),
          entry: `Hold expired on ${route}`,
          action: "Expired",
          actionType: "change",
          agent,
        });
      }
    }

    return rows.sort((a, b) => b.rawDate.getTime() - a.rawDate.getTime());
  }, [tickets, holds, user]);

  const filtered = useMemo(() => {
    let rows = entries.filter((e) => {
      const hay = `${e.entry} ${e.agent} ${e.date}`.toLowerCase();
      if (!hay.includes(q.trim().toLowerCase())) return false;
      if (filters.origin && !e.entry.toUpperCase().includes(filters.origin.trim().toUpperCase())) return false;
      if (filters.destination && !e.entry.toUpperCase().includes(filters.destination.trim().toUpperCase())) return false;
      return true;
    });
    if (sort === "Newest") {
      rows = [...rows].sort((a, b) => b.rawDate.getTime() - a.rawDate.getTime());
    } else if (sort === "Oldest") {
      rows = [...rows].sort((a, b) => a.rawDate.getTime() - b.rawDate.getTime());
    } else if (sort === "Agent") {
      rows = [...rows].sort((a, b) => a.agent.localeCompare(b.agent));
    }
    return rows;
  }, [entries, q, sort, filters]);

  return (
    <div className="w-full min-h-screen bg-background flex flex-col font-sans">
      <SaleNavbar />

      <main className="container mx-auto px-6 lg:px-10 py-6 flex-1 w-full max-w-[1400px]">
        {/* Top bar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <button
            type="button"
            onClick={() => setFiltersOpen(true)}
            className="flex items-center gap-2 text-[#D60D26] font-bold hover:bg-rose-50 px-4 py-2 rounded-lg transition-colors border border-rose-100 sm:border-transparent"
          >
            <Filter className="w-5 h-5" /> Filters
            {countActiveFilters(filters) > 0 && (
              <span className="bg-[#D60D26] text-white text-[11px] font-bold px-2 py-0.5 rounded-full">
                {countActiveFilters(filters)}
              </span>
            )}
          </button>
          <button
            type="button"
            onClick={() => void load()}
            className="flex items-center gap-2 text-slate-500 hover:text-slate-700 font-medium text-[14px]"
          >
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
        </div>

        {/* Search */}
        <div className="relative mb-6 bg-[#F2FBFF] rounded-2xl px-4 py-4">
          <Search className="w-5 h-5 text-slate-400 absolute left-7 top-1/2 -translate-y-1/2" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search History (PNR, name, route...)"
            className="w-full rounded-full border border-slate-200 bg-white py-3.5 pl-12 pr-4 text-[14px] font-medium shadow-sm outline-none focus:border-[#D60D26]"
          />
        </div>

        {/* Count + sort */}
        <div className="flex items-center justify-between mb-4 text-[13px]">
          <span className="text-slate-500">
            Entries <span className="font-bold text-slate-800">{filtered.length}</span>
          </span>
          <button type="button" className="flex items-center gap-1 text-slate-600 font-bold">
            Sort by{" "}
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="text-slate-900 bg-transparent border-none outline-none font-bold cursor-pointer"
            >
              <option value="Recommended">Recommended</option>
              <option value="Newest">Newest</option>
              <option value="Oldest">Oldest</option>
              <option value="Agent">Agent</option>
            </select>
            <ChevronDown className="w-4 h-4 pointer-events-none" />
          </button>
        </div>

        {!access && (
          <div className="rounded-xl border border-amber-100 bg-amber-50 px-5 py-4 text-amber-800 text-sm font-medium mb-6">
            <button type="button" className="underline font-bold" onClick={() => openAuthModal()}>
              Sign in
            </button>{" "}
            to view audit history.
          </div>
        )}

        {error && (
          <div className="rounded-xl border border-rose-100 bg-rose-50 px-5 py-4 text-rose-700 text-sm font-medium mb-6 flex items-center justify-between">
            <span>{error}</span>
            <button type="button" onClick={() => void load()} className="font-bold underline">
              Retry
            </button>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          {/* Table header */}
          <div className="hidden md:grid grid-cols-[1fr_1fr_auto_2fr_1fr_1fr] gap-4 px-6 py-4 border-b border-slate-100 text-slate-400 text-[13px] font-bold">
            <div>Date</div>
            <div>Time</div>
            <div>Action</div>
            <div>Entry</div>
            <div>By Agent</div>
            <div className="text-right">Doc</div>
          </div>

          {loading && (
            <div className="px-6 py-10 text-center text-slate-500">
              <RefreshCw className="w-5 h-5 animate-spin inline mr-2" />
              Loading history…
            </div>
          )}

          {!loading &&
            filtered.map((row) => {
              const badge = ACTION_BADGE[row.actionType] ?? ACTION_BADGE.change;
              return (
                <div
                  key={row.id}
                  className="grid grid-cols-1 md:grid-cols-[1fr_1fr_auto_2fr_1fr_1fr] gap-2 md:gap-4 px-6 py-4 border-b border-slate-100 text-[13px] font-medium hover:bg-slate-50/60 transition-colors"
                >
                  <div className="text-slate-600">{row.date}</div>
                  <div className="text-slate-500">{row.time}</div>
                  <div>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold ${badge.bg} ${badge.text}`}>
                      {row.action}
                    </span>
                  </div>
                  <div className="font-semibold text-slate-800">{row.entry}</div>
                  <div className="font-bold text-slate-600">{row.agent}</div>
                  <div className="flex justify-end">
                    <FileText className="w-5 h-5 text-blue-400" />
                  </div>
                </div>
              );
            })}

          {!loading && filtered.length === 0 && (
            <div className="px-6 py-12 text-center text-slate-500">No history entries yet.</div>
          )}

          <div className="px-6 py-4 flex items-center justify-between border-t border-slate-100">
            <div className="text-slate-500 text-[13px]">
              <span className="font-bold text-slate-700">1-{Math.min(50, filtered.length)}</span> on{" "}
              {filtered.length} results
            </div>
            <div className="flex items-center gap-4">
              <button type="button" className="text-slate-400 font-bold text-[14px] cursor-not-allowed">Prev</button>
              <button type="button" className="text-slate-800 font-bold text-[14px] border border-slate-300 rounded-full px-6 py-1.5 hover:bg-slate-50">Next</button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
      <OfflinePortalFiltersModal
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        value={filters}
        onApply={setFilters}
      />
    </div>
  );
}

