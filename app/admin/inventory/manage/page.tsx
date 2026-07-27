"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { getPublicApiUrl } from "@/lib/apiConfig";
import { Download, RefreshCw } from "lucide-react";

type InventoryRow = {
  id: string;
  airline_code: string;
  airline_name: string;
  flight_number: string;
  origin: string;
  destination: string;
  departure_datetime: string;
  price: string | number;
  seats_available: number;
  seats_held?: number;
  waitlist_count?: number;
  sellable_seats?: number;
  is_published?: boolean;
  is_enabled?: boolean;
  agent_username?: string;
};

type Analytics = {
  listings: number;
  published: number;
  seats_available: number;
  seats_held: number;
  waitlist_count: number;
  inventory_value_inr: number;
};

export default function AdminInventoryManagePage() {
  const { access, user } = useAuth();
  const [rows, setRows] = useState<InventoryRow[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [q, setQ] = useState("");

  const load = useCallback(async () => {
    if (!access) {
      setLoading(false);
      setError("Sign in as admin to manage offline inventory.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const api = getPublicApiUrl();
      const [listRes, analyticsRes] = await Promise.all([
        fetch(`${api}/flights/inventory/`, {
          headers: { Authorization: `Bearer ${access}` },
          cache: "no-store",
        }),
        fetch(`${api}/flights/inventory/analytics/`, {
          headers: { Authorization: `Bearer ${access}` },
          cache: "no-store",
        }),
      ]);
      if (!listRes.ok) throw new Error(`Inventory list failed (${listRes.status})`);
      const listJson = await listRes.json();
      const list = Array.isArray(listJson)
        ? listJson
        : Array.isArray(listJson?.results)
          ? listJson.results
          : Array.isArray(listJson?.data)
            ? listJson.data
            : [];
      setRows(list);
      if (analyticsRes.ok) {
        const a = await analyticsRes.json();
        setAnalytics(a?.data || a);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load inventory");
    } finally {
      setLoading(false);
    }
  }, [access]);

  useEffect(() => {
    void load();
  }, [load]);

  const patch = async (id: string, body: Record<string, unknown>) => {
    const api = getPublicApiUrl();
    const res = await fetch(`${api}/flights/inventory/${id}/`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${access}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(`Update failed (${res.status})`);
    await load();
  };

  const exportCsv = () => {
    const api = getPublicApiUrl();
    window.open(`${api}/flights/inventory/export/?format=csv`, "_blank");
    // Token can't go in window.open easily — fetch blob instead
    void (async () => {
      const res = await fetch(`${api}/flights/inventory/export/?format=csv`, {
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
  };

  const filtered = rows.filter((r) => {
    const hay = `${r.airline_code} ${r.flight_number} ${r.origin} ${r.destination} ${r.agent_username}`.toLowerCase();
    return hay.includes(q.trim().toLowerCase());
  });

  return (
    <div className="flex min-h-full flex-col">
      <AdminPageHeader
        title="Offline Agent Inventory"
        subtitle="Publish, enable/disable, export Citizenplane-style reports"
      />
      <div className="space-y-6 p-6">
        {user?.role !== "ADMIN" && !user?.is_staff && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            Admin role recommended. Agents only see their own inventory.
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Listings", value: analytics?.listings ?? "—" },
            { label: "Published", value: analytics?.published ?? "—" },
            { label: "Seats held", value: analytics?.seats_held ?? "—" },
            {
              label: "Inventory value",
              value:
                analytics?.inventory_value_inr != null
                  ? `₹${Number(analytics.inventory_value_inr).toLocaleString("en-IN")}`
                  : "—",
            },
          ].map((c) => (
            <div key={c.label} className="rounded-2xl border border-slate-200 bg-white p-4">
              <div className="text-xs font-bold uppercase tracking-wide text-slate-400">{c.label}</div>
              <div className="mt-1 text-2xl font-extrabold text-slate-900">{c.value}</div>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Filter airline, route, agent…"
            className="min-w-[220px] flex-1 rounded-xl border border-slate-200 px-4 py-2 text-sm"
          />
          <Button variant="outline" onClick={() => void load()} className="gap-2">
            <RefreshCw className="h-4 w-4" /> Refresh
          </Button>
          <Button onClick={exportCsv} className="gap-2">
            <Download className="h-4 w-4" /> Export CSV
          </Button>
          <Link href="/admin/agents/block-airlines" className="text-sm font-bold text-blue-600 hover:underline">
            Block airlines
          </Link>
          <Link href="/admin/agents/block-routes" className="text-sm font-bold text-blue-600 hover:underline">
            Block routes
          </Link>
        </div>

        {error && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>
        )}

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
          {loading && <div className="p-8 text-center text-slate-500">Loading…</div>}
          {!loading && filtered.length === 0 && (
            <div className="p-8 text-center text-slate-400">No inventory rows.</div>
          )}
          {!loading &&
            filtered.map((r) => (
              <div
                key={r.id}
                className="flex flex-col gap-3 border-b border-slate-100 px-5 py-4 lg:flex-row lg:items-center lg:justify-between"
              >
                <div>
                  <div className="font-bold text-slate-900">
                    {r.origin} → {r.destination} · {r.airline_code} {r.flight_number}
                  </div>
                  <div className="mt-1 text-xs text-slate-500">
                    {r.agent_username || "agent"} ·{" "}
                    {new Date(r.departure_datetime).toLocaleString("en-IN")} · ₹
                    {Number(r.price).toLocaleString("en-IN")} · sellable{" "}
                    {r.sellable_seats ?? r.seats_available} (held {r.seats_held ?? 0}, waitlist{" "}
                    {r.waitlist_count ?? 0})
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => void patch(r.id, { is_published: !(r.is_published !== false) })}
                  >
                    {r.is_published === false ? "Publish" : "Unpublish"}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => void patch(r.id, { is_enabled: !(r.is_enabled !== false) })}
                  >
                    {r.is_enabled === false ? "Enable" : "Disable"}
                  </Button>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
