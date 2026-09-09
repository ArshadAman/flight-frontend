"use client";

import React, { useEffect, useMemo, useState } from "react";
import { SaleNavbar } from "@/components/SaleNavbar";
import { Footer } from "@/components/Footer";
import { ChevronDown, FileText, Filter, RefreshCw, Search } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import {
  OfflinePortalFiltersModal,
  countActiveFilters,
  emptyOfflineFilters,
  type OfflineFilters,
} from "@/components/sale/OfflinePortalFilters";
import { fetchAgentHistory, type HistoryEntry } from "@/lib/sale/agentHistory";

export default function HistoryPage() {
  const { access, user, openAuthModal } = useAuth();
  const [entries, setEntries] = useState<HistoryEntry[]>([]);
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
      setEntries([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const rows = await fetchAgentHistory(access, {
        agentName: user?.name,
        agentEmail: user?.email,
        agentUsername: user?.username,
      });
      setEntries(rows);
    } catch (err) {
      setEntries([]);
      setError(err instanceof Error ? err.message : "Failed to load history");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [access, user?.id]);

  const filtered = useMemo(() => {
    let rows = entries.filter((e) => {
      const hay = `${e.entry} ${e.agent} ${e.date} ${e.reference || ""}`.toLowerCase();
      if (!hay.includes(q.trim().toLowerCase())) return false;
      if (filters.origin && !e.entry.toUpperCase().includes(filters.origin.trim().toUpperCase())) {
        return false;
      }
      if (
        filters.destination &&
        !e.entry.toUpperCase().includes(filters.destination.trim().toUpperCase())
      ) {
        return false;
      }
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

      <main className="flex-1 w-full">
        {/* Figma: light-blue filter / search strip */}
        <div className="w-full bg-[#F2FBFF] border-b border-sky-100">
          <div className="container mx-auto px-6 lg:px-10 py-5 max-w-[1400px] flex flex-col lg:flex-row lg:items-center gap-4">
            <button
              type="button"
              onClick={() => setFiltersOpen(true)}
              className="flex items-center gap-2 text-[#D60D26] font-bold shrink-0"
            >
              <Filter className="w-5 h-5" /> Filters
              {countActiveFilters(filters) > 0 && (
                <span className="bg-[#D60D26] text-white text-[11px] font-bold px-2 py-0.5 rounded-full">
                  {countActiveFilters(filters)}
                </span>
              )}
            </button>
            <div className="relative flex-1">
              <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search History (PNR, name...)"
                className="w-full rounded-full border border-slate-200 bg-white py-3.5 pl-12 pr-4 text-[14px] font-medium shadow-sm outline-none focus:border-[#D60D26]"
              />
            </div>
            <button
              type="button"
              onClick={() => void load()}
              className="flex items-center gap-2 text-slate-500 hover:text-slate-700 font-medium text-[14px] shrink-0"
            >
              <RefreshCw className="w-4 h-4" /> Refresh
            </button>
          </div>
        </div>

        <div className="container mx-auto px-6 lg:px-10 py-6 max-w-[1400px]">
          <div className="flex items-center justify-between mb-4 text-[13px]">
            <span className="font-bold text-slate-900 text-[15px]">
              Entries <span className="font-extrabold">{filtered.length}</span>
            </span>
            <label className="flex items-center gap-1 text-slate-600 font-medium">
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
            </label>
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
            {/* Figma columns: Date | Time | Action(icon) | Entry | By Agent */}
            <div className="hidden md:grid grid-cols-[1.1fr_0.8fr_0.6fr_2.4fr_1fr] gap-4 px-6 py-4 border-b border-slate-100 text-slate-400 text-[13px] font-bold">
              <div>Date</div>
              <div>Time</div>
              <div>Action</div>
              <div>Entry</div>
              <div>By Agent</div>
            </div>

            {loading && (
              <div className="px-6 py-10 text-center text-slate-500">
                <RefreshCw className="w-5 h-5 animate-spin inline mr-2" />
                Loading history…
              </div>
            )}

            {!loading &&
              filtered.map((row) => (
                <div
                  key={row.id}
                  className="grid grid-cols-1 md:grid-cols-[1.1fr_0.8fr_0.6fr_2.4fr_1fr] gap-2 md:gap-4 px-6 py-5 border-b border-slate-100 text-[13px] font-medium hover:bg-slate-50/60 transition-colors"
                >
                  <div className="text-slate-700">{row.date}</div>
                  <div className="text-slate-600">{row.time}</div>
                  <div className="flex items-center">
                    <FileText className="w-5 h-5 text-[#4B7BEC]" strokeWidth={1.75} />
                  </div>
                  <div className="font-bold text-slate-900">{row.entry}</div>
                  <div className="font-bold text-slate-700 uppercase tracking-wide">{row.agent}</div>
                </div>
              ))}

            {!loading && filtered.length === 0 && (
              <div className="px-6 py-12 text-center text-slate-500">No history entries yet.</div>
            )}

            <div className="px-6 py-4 flex items-center justify-between border-t border-slate-100">
              <div className="text-slate-500 text-[13px]">
                <span className="font-bold text-slate-700">1-{Math.min(50, filtered.length)}</span> on{" "}
                {filtered.length} results
              </div>
              <div className="flex items-center gap-4">
                <button type="button" className="text-slate-400 font-bold text-[14px] cursor-not-allowed">
                  Prev
                </button>
                <button
                  type="button"
                  className="text-slate-800 font-bold text-[14px] border border-slate-300 rounded-full px-6 py-1.5 hover:bg-slate-50"
                >
                  Next
                </button>
              </div>
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
