"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Plane, RefreshCw, Search } from "lucide-react";
import { saveBookingDraft, type BookingDraft } from "@/lib/booking";
import { unwrapData, unwrapList } from "@/lib/apiEnvelope";
import { forSaleItemToFlight, type ForSaleInventoryItem } from "@/lib/forSale";
import { layoverLabels, stopsLabel } from "@/lib/journey";
import { useAuth } from "@/context/AuthContext";
import { getPublicApiUrl } from "@/lib/apiConfig";

function formatMoney(amount: number | string) {
  const n = Number(amount) || 0;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);
}

function formatWhen(iso: string) {
  try {
    return new Date(iso).toLocaleString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

export function ForSaleInventoryGrid({
  bookPath = "/book",
  title = "Exclusive Travel Deals",
  subtitle = "Agent-published offline inventory available for direct booking.",
  partnerId,
}: {
  bookPath?: string;
  title?: string;
  subtitle?: string;
  partnerId?: string;
}) {
  const router = useRouter();
  const { access, openAuthModal } = useAuth();
  const [items, setItems] = useState<ForSaleInventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [originFilter, setOriginFilter] = useState("");
  const [destFilter, setDestFilter] = useState("");
  const [query, setQuery] = useState({ origin: "", destination: "" });
  const [actionMsg, setActionMsg] = useState<string | null>(null);
  const [heldItemId, setHeldItemId] = useState<string | null>(null);
  const [activeHold, setActiveHold] = useState<{ id: string; expiresAt?: string } | null>(null);

  const load = async (origin?: string, destination?: string) => {
    setLoading(true);
    setError(null);
    try {
      const qs = new URLSearchParams();
      if (origin) qs.set("origin", origin);
      if (destination) qs.set("destination", destination);
      if (partnerId) qs.set("partner", partnerId);
      const suffix = qs.toString() ? `?${qs.toString()}` : "";
      const res = await fetch(`/api/inventory/for-sale${suffix}`, { cache: "no-store" });
      if (!res.ok) throw new Error(`Failed to load For Sale inventory (${res.status})`);
      const json = await res.json();
      setItems(unwrapList<ForSaleInventoryItem>(json));
    } catch (err) {
      setItems([]);
      setError(err instanceof Error ? err.message : "Failed to load inventory");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [partnerId]);

  const filtered = useMemo(() => {
    const o = originFilter.trim().toUpperCase();
    const d = destFilter.trim().toUpperCase();
    if (!o && !d) return items;
    return items.filter((item) => {
      if (o && !item.origin.toUpperCase().includes(o)) return false;
      if (d && !item.destination.toUpperCase().includes(d)) return false;
      return true;
    });
  }, [items, originFilter, destFilter]);

  const handleBook = (item: ForSaleInventoryItem, hold?: { id: string; expiresAt?: string } | null) => {
    const flight = forSaleItemToFlight(item);
    const draft: BookingDraft = {
      tripType: "one-way",
      origin: flight.origin,
      destination: flight.destination,
      departureDate: flight.travel_date || new Date().toISOString().slice(0, 10),
      cabin: flight.cabin_class || "Economy",
      adults: 1,
      children: 0,
      infants: 0,
      outbound: flight,
      createdAt: new Date().toISOString(),
      inventoryHoldId: hold?.id,
      holdExpiresAt: hold?.expiresAt,
    };
    saveBookingDraft(draft);
    router.push(bookPath);
  };

  const createHold = async (item: ForSaleInventoryItem, preferWaitlist: boolean) => {
    if (!access) {
      openAuthModal();
      return;
    }
    setActionMsg(null);
    try {
      const api = getPublicApiUrl();
      const res = await fetch(`${api}/flights/holds/`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${access}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inventory: item.id,
          seats: 1,
          prefer_waitlist: preferWaitlist,
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error((json as { detail?: string }).detail || `Request failed (${res.status})`);
      const hold = unwrapData<{ id?: string; status?: string; expires_at?: string }>(json);
      if (hold.status === "WAITLIST") {
        setHeldItemId(null);
        setActiveHold(null);
        setActionMsg("Added to waitlist. If a seat opens, it is held for you for 24 hours.");
      } else {
        const nextHold = hold.id
          ? { id: String(hold.id), expiresAt: hold.expires_at || undefined }
          : null;
        setHeldItemId(item.id);
        setActiveHold(nextHold);
        setActionMsg(
          hold.expires_at
            ? `Seats held until ${new Date(hold.expires_at).toLocaleString("en-IN")}. Complete booking to convert the hold into a ticket.`
            : "Seats held for 24 hours. Complete booking to convert the hold into a ticket."
        );
      }
      void load(query.origin, query.destination);
    } catch (err) {
      setActionMsg(err instanceof Error ? err.message : "Hold failed");
    }
  };

  return (
    <div className="space-y-8">
      <div className="text-center max-w-2xl mx-auto">
        <h2 className="text-2xl font-bold text-slate-800 mb-2">{title}</h2>
        <p className="text-slate-600">{subtitle}</p>
        <p className="mt-2 text-xs font-medium text-slate-400">
          Hold a seat for 24 hours, then complete booking. Sold-out flights can be waitlisted — a freed seat is offered automatically.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-end">
        <label className="flex-1 text-xs font-bold uppercase tracking-wide text-slate-500">
          From
          <input
            value={originFilter}
            onChange={(e) => setOriginFilter(e.target.value)}
            placeholder="DEL"
            className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-800"
          />
        </label>
        <label className="flex-1 text-xs font-bold uppercase tracking-wide text-slate-500">
          To
          <input
            value={destFilter}
            onChange={(e) => setDestFilter(e.target.value)}
            placeholder="BOM"
            className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-800"
          />
        </label>
        <button
          type="button"
          onClick={() => {
            const next = {
              origin: originFilter.trim().toUpperCase(),
              destination: destFilter.trim().toUpperCase(),
            };
            setQuery(next);
            void load(next.origin, next.destination);
          }}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-[#0C2342] px-6 py-2.5 text-sm font-bold text-white hover:bg-[#12315b]"
        >
          <Search className="w-4 h-4" />
          Search
        </button>
        <button
          type="button"
          onClick={() => void load(query.origin, query.destination)}
          className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {actionMsg && (
        <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
          {actionMsg}
        </div>
      )}

      {loading && <div className="py-16 text-center text-slate-500 font-medium">Loading inventory…</div>}

      {!loading && error && (
        <div className="rounded-2xl border border-rose-100 bg-rose-50 px-6 py-8 text-center text-rose-700">
          {error}
        </div>
      )}

      {!loading && !error && filtered.length === 0 && (
        <div className="rounded-2xl border border-slate-200 bg-white px-6 py-12 text-center text-slate-400">
          <p className="font-medium text-lg text-slate-600">No inventory currently available.</p>
          <p className="mt-1">Agents can publish seats from the Sale inventory portal.</p>
        </div>
      )}

      {!loading && !error && filtered.length > 0 && (
        <div className="grid gap-4">
          {filtered.map((item) => {
            const sellable = item.sellable_seats ?? item.seats_available;
            const soldOut = sellable <= 0;
            const flight = forSaleItemToFlight(item);
            const stopText = stopsLabel(flight.stops, flight.via);
            const layoverText = layoverLabels(flight.layovers).join(" · ");
            const policyBits = item.policies
              ? Object.entries(item.policies)
                  .filter(([, value]) => String(value || "").trim())
                  .map(([key]) => key)
              : [];
            return (
              <div
                key={item.id}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm flex flex-col md:flex-row md:items-center gap-4 justify-between"
              >
                <div className="flex items-start gap-4 min-w-0">
                  <div className="w-11 h-11 rounded-xl bg-[#D60D26]/10 text-[#D60D26] flex items-center justify-center shrink-0">
                    <Plane className="w-5 h-5 -rotate-45" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2 font-bold text-slate-800">
                      <span>{item.origin}</span>
                      <ArrowRight className="w-4 h-4 text-[#D60D26]" />
                      <span>{item.destination}</span>
                      <span className="text-[11px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-full px-2 py-0.5">
                        For Sale
                      </span>
                      {soldOut && (
                        <span className="text-[11px] font-black uppercase tracking-wider text-amber-700 bg-amber-50 border border-amber-100 rounded-full px-2 py-0.5">
                          Waitlist
                        </span>
                      )}
                      {item.apis_required && (
                        <span className="text-[11px] font-black uppercase tracking-wider text-sky-700 bg-sky-50 border border-sky-100 rounded-full px-2 py-0.5">
                          APIS
                        </span>
                      )}
                    </div>
                    <div className="mt-1 text-sm text-slate-600 font-medium">
                      {item.airline_name || item.airline_code} · {item.flight_number} ·{" "}
                      {item.cabin_class || "Economy"}
                      {item.agent_username ? ` · ${item.agent_username}` : ""}
                    </div>
                    <div className="mt-1 text-xs text-slate-500">
                      {formatWhen(item.departure_datetime)} → {formatWhen(item.arrival_datetime)}
                      {item.duration ? ` · ${item.duration}` : ""}
                      {` · ${stopText}`}
                      {layoverText ? ` · ${layoverText}` : ""}
                    </div>
                    <div className="mt-1 text-xs text-slate-500">
                      {sellable} sellable · held {item.seats_held ?? 0} · waitlist {item.waitlist_count ?? 0}
                      {item.baggage_check_in ? ` · Check-in ${item.baggage_check_in}` : ""}
                      {policyBits.length ? ` · ${policyBits.join(" / ")} policy` : ""}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between md:justify-end gap-3 shrink-0">
                  <div className="text-right">
                    <div className="text-xs font-bold uppercase tracking-wide text-slate-400">From</div>
                    <div className="text-xl font-extrabold text-slate-900">{formatMoney(item.price)}</div>
                  </div>
                  {!soldOut ? (
                    <>
                      <button
                        type="button"
                        onClick={() => void createHold(item, false)}
                        className="rounded-full border border-slate-200 text-slate-700 font-bold text-sm px-4 py-2.5 hover:bg-slate-50"
                      >
                        Hold
                      </button>
                      <button
                        type="button"
                        onClick={() => handleBook(item, heldItemId === item.id ? activeHold : undefined)}
                        className="rounded-full bg-[#D60D26] hover:bg-[#b80b20] text-white font-bold text-sm px-6 py-2.5"
                      >
                        Book Now
                      </button>
                      {heldItemId === item.id && activeHold && (
                        <button
                          type="button"
                          onClick={() => handleBook(item, activeHold)}
                          className="rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm px-5 py-2.5"
                        >
                          Complete booking
                        </button>
                      )}
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={() => void createHold(item, true)}
                      className="rounded-full bg-[#0C2342] hover:bg-[#12315b] text-white font-bold text-sm px-6 py-2.5"
                    >
                      Join Waitlist
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
