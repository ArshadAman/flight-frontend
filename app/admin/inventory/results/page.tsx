"use client";

import { useEffect, useMemo, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Button } from "@/components/ui/button";
import { ChevronDown, Filter, Plane, Utensils, Usb, Armchair } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Flight } from "@/lib/flight";
import { saveBookingDraft } from "@/lib/booking";
import { useAuth } from "@/context/AuthContext";

function ResultsInner() {
  const params = useSearchParams();
  const router = useRouter();
  const { access, openAuthModal } = useAuth();
  const [flights, setFlights] = useState<Flight[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [openFilters, setOpenFilters] = useState<Record<string, boolean>>({ Airlines: true });

  const origin = params.get("origin") || "DEL";
  const destination = params.get("destination") || "BOM";
  const departureDate = params.get("departureDate") || "";
  const cabin = params.get("cabin") || "Economy";
  const adults = Number(params.get("adults") || "1");
  const children = Number(params.get("children") || "0");
  const infants = Number(params.get("infants") || "0");
  const tripType = (params.get("tripType") || "one-way") as "one-way" | "round-trip" | "multi-city";

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/flights?${params.toString()}`);
        const json = await res.json();
        const list: Flight[] = Array.isArray(json?.flights) ? json.flights : Array.isArray(json) ? json : [];
        if (!cancelled) {
          setFlights(list);
          if (list[0]) setSelected(list[0].id);
        }
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Search failed");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [params]);

  const selectedFlight = useMemo(
    () => flights.find((f) => f.id === selected) || null,
    [flights, selected]
  );

  const bookSelected = () => {
    if (!selectedFlight) return;
    if (!access) {
      openAuthModal();
      return;
    }
    saveBookingDraft({
      tripType: tripType === "round-trip" ? "round-trip" : "one-way",
      origin,
      destination,
      departureDate,
      cabin,
      adults,
      children,
      infants,
      outbound: selectedFlight,
      createdAt: new Date().toISOString(),
    });
    router.push("/admin/inventory/book");
  };

  const filterGroups = ["Suppliers", "Airlines", "General", "Baggage", "Fare type", "Ticket time limit"];

  return (
    <div className="flex min-h-full flex-col">
      <AdminPageHeader title="Supplier Inventory" />

      <div className="flex items-center justify-between bg-[#006aec] px-6 py-3 text-white">
        <div>
          <p className="text-sm font-bold">
            {origin} <span className="mx-1">→</span> {destination}
          </p>
          <p className="text-xs text-white/80">
            {departureDate || "—"} • {cabin} • Live API search
          </p>
        </div>
        <div className="flex items-center gap-5 text-sm font-medium">
          <Link href="/admin/inventory/search" className="hover:underline">
            Edit Search
          </Link>
          <Link href="/admin/inventory/search" className="hover:underline">
            New Search
          </Link>
        </div>
      </div>

      <div className="flex flex-1 gap-6 p-6">
        <aside className="w-56 shrink-0">
          <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-[#1c304a]">
            Filters : <Filter className="h-4 w-4 text-[#D60D26]" />
          </div>
          <div className="overflow-hidden rounded-lg border border-[#e8ebef] bg-white">
            {filterGroups.map((group) => (
              <div key={group} className="border-b border-[#e8ebef] last:border-b-0">
                <button
                  type="button"
                  className="flex w-full items-center justify-between px-4 py-3 text-left text-sm"
                  onClick={() => setOpenFilters((p) => ({ ...p, [group]: !p[group] }))}
                >
                  {group}
                  <ChevronDown className={cn("h-4 w-4 text-slate-400", openFilters[group] && "rotate-180")} />
                </button>
              </div>
            ))}
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          <div className="mb-4 flex items-center justify-between text-sm">
            <p className="text-slate-600">
              {loading ? "Searching…" : (
                <>
                  Showing <span className="font-semibold text-[#D60D26]">{flights.length}</span> flights
                </>
              )}
            </p>
            <Button
              className="bg-[#006aec] hover:bg-[#006aec]/90"
              disabled={!selectedFlight || loading}
              onClick={bookSelected}
            >
              Book selected
            </Button>
          </div>

          {error && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {!access && (
            <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              Log in from the main site to book. Search works without login.
            </div>
          )}

          <div className="space-y-4">
            {flights.map((flight) => (
              <div key={flight.id} className="rounded-xl border border-[#e8ebef] bg-white p-5 shadow-sm">
                <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-2xl font-bold text-[#006aec]">
                      ₹{flight.price.toLocaleString("en-IN")}
                      {flight.tax_amount ? (
                        <span className="ml-2 text-xs font-normal text-slate-400">
                          Incl. ₹{Number(flight.tax_amount).toLocaleString("en-IN")} tax
                        </span>
                      ) : null}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-2">
                      <Plane className="h-4 w-4 text-[#D60D26]" />
                      <div>
                        <p className="text-sm font-semibold">{flight.airline}</p>
                        <p className="text-xs text-slate-400">{flight.fare_type || "PUB"}</p>
                      </div>
                    </div>
                    <span className="rounded bg-[#006aec] px-2 py-0.5 text-[10px] font-semibold text-white">
                      {flight.is_agent_flight ? "AGENT" : "API"}
                    </span>
                  </div>
                </div>

                <label className="flex cursor-pointer flex-wrap items-center gap-4 rounded-lg border border-[#eef1f5] px-3 py-3 hover:bg-slate-50">
                  <input
                    type="radio"
                    name="flight"
                    checked={selected === flight.id}
                    onChange={() => setSelected(flight.id)}
                    className="accent-[#006aec]"
                  />
                  <div className="min-w-[100px]">
                    <p className="text-sm font-semibold">{flight.airline_code || flight.id}</p>
                    <p className="text-xs text-slate-400">{departureDate}</p>
                  </div>
                  <p className="text-sm text-slate-600">
                    {flight.origin} → {flight.destination}
                  </p>
                  <p className="text-sm text-slate-600">{flight.cabin_class || cabin}</p>
                  <p className="text-sm font-medium">
                    {flight.departureTime} - {flight.arrivalTime}
                  </p>
                  <p className="text-sm text-slate-600">{flight.duration}</p>
                  <div className="ml-auto flex items-center gap-2 text-slate-400">
                    <Armchair className="h-3.5 w-3.5" />
                    <Usb className="h-3.5 w-3.5" />
                    <Utensils className="h-3.5 w-3.5" />
                  </div>
                </label>
              </div>
            ))}

            {!loading && flights.length === 0 && (
              <p className="text-sm text-slate-500">No flights returned. Try another date or route.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function InventoryResultsPage() {
  return (
    <Suspense fallback={<div className="p-6 text-sm text-slate-500">Loading results…</div>}>
      <ResultsInner />
    </Suspense>
  );
}
