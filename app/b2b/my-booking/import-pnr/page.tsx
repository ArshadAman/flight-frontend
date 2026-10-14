"use client";

import { useEffect, useState } from "react";
import { B2BNavbar } from "@/components/B2BNavbar";
import { Footer } from "@/components/Footer";
import { getPublicApiUrl } from "@/lib/apiConfig";
import { unwrapList } from "@/lib/apiEnvelope";

type InventoryOption = { id: string; label: string };

export default function ImportPnrPage() {
  const [options, setOptions] = useState<InventoryOption[]>([]);
  const [inventoryId, setInventoryId] = useState("");
  const [pnr, setPnr] = useState("");
  const [passenger, setPassenger] = useState("");
  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) return;
    fetch(`${getPublicApiUrl()}/flights/inventory/`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((json) => {
        const rows = unwrapList<{ id: string; origin?: string; destination?: string; airline_name?: string; flight_number?: string }>(json);
        setOptions(
          rows.map((row) => ({
            id: row.id,
            label: `${row.airline_name || "Flight"} ${row.flight_number || ""} ${row.origin || ""}-${row.destination || ""}`.trim(),
          }))
        );
      })
      .catch(() => setOptions([]));
  }, []);

  const submit = async () => {
    setError("");
    setMessage("");
    const token = localStorage.getItem("access_token");
    if (!token) {
      setError("Sign in as an agent first.");
      return;
    }
    setBusy(true);
    const res = await fetch(`${getPublicApiUrl()}/tickets/add-pnr/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        inventory_id: inventoryId,
        pnr_number: pnr,
        passenger_name: passenger,
        total_amount: amount || 0,
      }),
    });
    const json = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) {
      setError(json.detail || "Could not import this PNR.");
      return;
    }
    setMessage(`PNR ${pnr.toUpperCase()} is linked to the inventory.`);
    setPnr("");
    setPassenger("");
  };

  return (
    <div className="min-h-screen bg-[#F2FBFF] flex flex-col">
      <B2BNavbar />
      <main className="flex-1 container mx-auto px-4 sm:px-8 py-8 max-w-xl">
        <h1 className="text-[28px] font-extrabold text-[#0C2342] mb-6">Import PNR</h1>
        <div className="bg-white rounded-3xl border border-slate-100 p-6 space-y-4">
          <label className="block text-sm font-semibold">
            Inventory
            <select value={inventoryId} onChange={(e) => setInventoryId(e.target.value)} className="mt-2 w-full border rounded-2xl px-4 py-3">
              <option value="">Select a flight</option>
              {options.map((row) => (
                <option key={row.id} value={row.id}>{row.label}</option>
              ))}
            </select>
          </label>
          <label className="block text-sm font-semibold">
            PNR
            <input value={pnr} onChange={(e) => setPnr(e.target.value)} className="mt-2 w-full border rounded-2xl px-4 py-3 uppercase" />
          </label>
          <label className="block text-sm font-semibold">
            Passenger name
            <input value={passenger} onChange={(e) => setPassenger(e.target.value)} className="mt-2 w-full border rounded-2xl px-4 py-3" />
          </label>
          <label className="block text-sm font-semibold">
            Amount
            <input value={amount} onChange={(e) => setAmount(e.target.value)} className="mt-2 w-full border rounded-2xl px-4 py-3" />
          </label>
          {error && <p className="text-sm font-semibold text-[#D60D26]">{error}</p>}
          {message && <p className="text-sm font-semibold text-emerald-700">{message}</p>}
          <button type="button" disabled={busy} onClick={submit} className="w-full bg-[#D60D26] text-white rounded-full py-3 font-bold disabled:opacity-60">
            {busy ? "Saving…" : "Import"}
          </button>
        </div>
      </main>
      <Footer />
    </div>
  );
}
