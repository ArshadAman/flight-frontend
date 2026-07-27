"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ForSaleInventoryGrid } from "@/components/ForSaleInventoryGrid";
import { useAuth } from "@/context/AuthContext";
import { getPublicApiUrl } from "@/lib/apiConfig";
import { Button } from "@/components/ui/button";

type InventoryRow = {
  id: string;
  origin: string;
  destination: string;
  flight_number: string;
  is_published?: boolean;
  seats_available: number;
  price: string | number;
};

/**
 * Reseller / partner portal: view own published inventory and jump to manage/publish.
 * Agents act as inventory partners; admins see all.
 */
export default function ResellerInventoryPage() {
  const { access, user, openAuthModal } = useAuth();
  const [rows, setRows] = useState<InventoryRow[]>([]);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!access) return;
    void (async () => {
      const api = getPublicApiUrl();
      const res = await fetch(`${api}/flights/inventory/`, {
        headers: { Authorization: `Bearer ${access}` },
      });
      if (!res.ok) return;
      const json = await res.json();
      const list = Array.isArray(json) ? json : json.results || json.data || [];
      setRows(list);
    })();
  }, [access]);

  const togglePublish = async (id: string, next: boolean) => {
    const api = getPublicApiUrl();
    const res = await fetch(`${api}/flights/inventory/${id}/`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${access}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ is_published: next }),
    });
    if (!res.ok) {
      setMsg(`Publish update failed (${res.status})`);
      return;
    }
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, is_published: next } : r)));
    setMsg(next ? "Published to For Sale channels." : "Unpublished.");
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <div className="w-full bg-[#0C2342] py-10 text-white">
        <div className="container mx-auto px-6 lg:px-12">
          <h1 className="text-3xl font-extrabold tracking-tight">Reseller Inventory Portal</h1>
          <p className="mt-2 text-white/80 max-w-2xl text-sm">
            Publish partner fixed-departure inventory to B2C/B2B For Sale channels and manage visibility.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link href="/sale/inventory">
              <Button className="bg-[#D60D26] hover:bg-[#b80b20]">Manage inventory</Button>
            </Link>
            <Link href="/for-sale">
              <Button variant="outline" className="border-white/30 bg-transparent text-white hover:bg-white/10">
                View public For Sale
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <main className="container mx-auto px-6 lg:px-12 py-10 flex-1 space-y-10">
        {!access && (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center">
            <p className="text-slate-600 mb-4">Sign in as an agent/partner to publish inventory.</p>
            <Button onClick={() => openAuthModal("login")}>Sign in</Button>
          </div>
        )}

        {access && (
          <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 font-bold text-slate-800">
              Your partner listings ({rows.length}) · {user?.email || user?.username}
            </div>
            {msg && <div className="px-5 py-2 text-sm text-emerald-700 bg-emerald-50">{msg}</div>}
            {rows.length === 0 && (
              <div className="p-8 text-center text-slate-400">No inventory yet. Add flights from Sale Inventory.</div>
            )}
            {rows.map((r) => (
              <div
                key={r.id}
                className="px-5 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div>
                  <div className="font-bold text-slate-800">
                    {r.origin} → {r.destination} · {r.flight_number}
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    {r.seats_available} seats · ₹{Number(r.price).toLocaleString("en-IN")} ·{" "}
                    {r.is_published === false ? "Unpublished" : "Published"}
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => void togglePublish(r.id, r.is_published === false)}
                >
                  {r.is_published === false ? "Publish" : "Unpublish"}
                </Button>
              </div>
            ))}
          </div>
        )}

        <ForSaleInventoryGrid
          title="Channel preview"
          subtitle="What customers currently see on the public For Sale marketplace."
        />
      </main>
      <Footer />
    </div>
  );
}
