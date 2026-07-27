"use client";

import React, { useEffect, useState } from "react";
import { SaleNavbar } from "@/components/SaleNavbar";
import { Footer } from "@/components/Footer";
import { RefreshCw, Search } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { getPublicApiUrl } from "@/lib/apiConfig";

type TicketRow = {
  id: string;
  status: string;
  origin?: string;
  destination?: string;
  flight_number?: string;
  booking_ref?: string | null;
  pnr_number?: string | null;
  created_at?: string;
  updated_at?: string;
  agent_cancellation_reason?: string | null;
};

export default function HistoryPage() {
  const { access, openAuthModal } = useAuth();
  const [tickets, setTickets] = useState<TicketRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [q, setQ] = useState("");

  const load = async () => {
    if (!access) {
      setLoading(false);
      setError("Sign in as an agent to view inventory booking history.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const apiBase = getPublicApiUrl();
      const res = await fetch(`${apiBase}/tickets/`, {
        headers: { Authorization: `Bearer ${access}` },
        cache: "no-store",
      });
      if (!res.ok) throw new Error(`Failed to load history (${res.status})`);
      const json = await res.json();
      const rows: TicketRow[] = Array.isArray(json)
        ? json
        : Array.isArray(json?.results)
          ? json.results
          : [];
      setTickets(rows);
    } catch (err) {
      setTickets([]);
      setError(err instanceof Error ? err.message : "Failed to load history");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [access]);

  const filtered = tickets.filter((t) => {
    const hay = `${t.origin} ${t.destination} ${t.flight_number} ${t.pnr_number} ${t.booking_ref} ${t.status}`.toLowerCase();
    return hay.includes(q.trim().toLowerCase());
  });

  return (
    <div className="w-full min-h-screen bg-background flex flex-col font-sans">
      <SaleNavbar />

      <main className="container mx-auto px-6 lg:px-10 py-8 flex-1 w-full max-w-[1400px]">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 mb-8">
          <div className="flex-1 relative">
            <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search route, PNR, booking ref…"
              className="w-full rounded-xl border border-slate-200 pl-11 pr-4 py-3 text-sm font-medium"
            />
          </div>
          <button
            type="button"
            onClick={() => (access ? void load() : openAuthModal("login"))}
            className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 px-5 py-3 text-sm font-bold"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>

        {error && (
          <div className="mb-6 rounded-2xl border border-rose-100 bg-rose-50 px-5 py-4 text-rose-700 text-sm">
            {error}
          </div>
        )}

        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 font-bold text-slate-800">
            Inventory booking history
          </div>
          {loading && <div className="p-8 text-center text-slate-500">Loading…</div>}
          {!loading && filtered.length === 0 && (
            <div className="p-8 text-center text-slate-400">No history rows found.</div>
          )}
          {!loading &&
            filtered.map((t) => (
              <div
                key={t.id}
                className="px-6 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
              >
                <div>
                  <div className="font-bold text-slate-800 text-sm">
                    {t.status} · {t.origin || "—"} → {t.destination || "—"}
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    {t.flight_number || "Flight"} · {t.pnr_number || t.booking_ref || t.id.slice(0, 8)}
                    {t.agent_cancellation_reason ? ` · ${t.agent_cancellation_reason}` : ""}
                  </div>
                </div>
                <div className="text-xs font-medium text-slate-500">
                  {t.updated_at || t.created_at
                    ? new Date(t.updated_at || t.created_at || "").toLocaleString("en-IN")
                    : "—"}
                </div>
              </div>
            ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}
