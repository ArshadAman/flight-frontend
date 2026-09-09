"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Filter, Search } from "lucide-react";
import { SaleNavbar } from "@/components/SaleNavbar";
import { Footer } from "@/components/Footer";
import { NotificationModal } from "@/components/NotificationModal";
import { OfflinePortalSubNav } from "@/components/sale/OfflinePortalSubNav";
import {
  OfflinePortalFiltersModal,
  countActiveFilters,
  emptyOfflineFilters,
  type OfflineFilters,
} from "@/components/sale/OfflinePortalFilters";
import { useAuth } from "@/context/AuthContext";
import { useAgentOfflineData } from "@/hooks/useAgentOfflineData";
import { formatPortalDayMonthYear } from "@/lib/sale/offlinePortal";

function passengerLabel(ticket: {
  passengers_data?: { first_name?: string; last_name?: string }[];
}) {
  const pax = ticket.passengers_data?.[0];
  if (!pax) return "Passenger";
  const name = `${pax.first_name || ""} ${pax.last_name || ""}`.trim();
  const count = ticket.passengers_data?.length || 1;
  return `${name || "Passenger"} / ${String(count).padStart(2, "0")}`;
}

export default function SaleBookingPage() {
  const { access, openAuthModal } = useAuth();
  const { tickets, loading, error } = useAgentOfflineData(access);
  const [activeTab, setActiveTab] = useState("Upcoming");
  const [q, setQ] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filters, setFilters] = useState<OfflineFilters>(emptyOfflineFilters);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);

  const notificationCount = useMemo(
    () => tickets.filter((t) => t.status === "PENDING").length,
    [tickets]
  );

  const filtered = useMemo(() => {
    const now = Date.now();
    const today = new Date().toISOString().slice(0, 10);
    let rows = tickets.filter((t) => t.status !== "CANCELLED");
    if (activeTab === "Upcoming") {
      rows = rows.filter((t) => {
        const dep = t.departure_datetime ? new Date(t.departure_datetime).getTime() : 0;
        return dep >= now;
      });
    } else if (activeTab === "Departed") {
      rows = rows.filter((t) => {
        const dep = t.departure_datetime ? new Date(t.departure_datetime).getTime() : 0;
        return dep > 0 && dep < now;
      });
    } else if (activeTab === "Travel") {
      rows = rows.filter((t) => {
        if (!t.departure_datetime) return false;
        const depDay = new Date(t.departure_datetime).toISOString().slice(0, 10);
        return depDay === today;
      });
    }
    if (filters.origin) {
      rows = rows.filter((t) => (t.origin || "").toUpperCase() === filters.origin.trim().toUpperCase());
    }
    if (filters.destination) {
      rows = rows.filter(
        (t) => (t.destination || "").toUpperCase() === filters.destination.trim().toUpperCase()
      );
    }
    const needle = q.trim().toLowerCase();
    if (!needle) return rows;
    return rows.filter((t) => {
      const paxNames = (t.passengers_data || [])
        .map((p) => `${p.first_name || ""} ${p.last_name || ""}`.trim())
        .join(" ");
      const hay =
        `${t.pnr_number} ${t.booking_ref} ${t.origin} ${t.destination} ${t.flight_number} ${paxNames}`.toLowerCase();
      return hay.includes(needle);
    });
  }, [tickets, activeTab, q, filters]);

  return (
    <div className="w-full min-h-screen bg-background flex flex-col font-sans">
      <SaleNavbar />
      <OfflinePortalSubNav
        variant="booking"
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onNotification={() => setIsNotificationOpen(true)}
        notificationCount={notificationCount}
      />

      <main className="container mx-auto px-6 lg:px-10 py-6 flex-1 w-full max-w-[1400px]">
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
        </div>

        <div className="relative mb-6 bg-[#F2FBFF] rounded-2xl px-4 py-4">
          <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search bookings (PNR, name...)"
            className="w-full rounded-full border border-slate-200 bg-white py-3.5 pl-12 pr-4 text-[14px] font-medium shadow-sm outline-none focus:border-[#D60D26]"
          />
        </div>

        {!access && (
          <div className="rounded-xl border border-amber-100 bg-amber-50 px-5 py-4 text-amber-800 text-sm font-medium mb-6">
            <button type="button" className="underline font-bold" onClick={() => openAuthModal()}>
              Sign in
            </button>{" "}
            as an agent to view offline portal bookings.
          </div>
        )}

        {error && (
          <div className="rounded-xl border border-rose-100 bg-rose-50 px-5 py-4 text-rose-700 text-sm font-medium mb-6">
            {error}
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="hidden md:grid grid-cols-7 gap-4 px-6 py-4 border-b border-slate-100 text-slate-400 text-[13px] font-bold">
            <div>PNR reference</div>
            <div>Booking date</div>
            <div>Passenger name</div>
            <div>Route</div>
            <div>Flight date</div>
            <div>Departure</div>
            <div>Flight number</div>
          </div>

          {loading && <div className="px-6 py-10 text-center text-slate-500">Loading bookings…</div>}

          {!loading &&
            filtered.map((t) => (
              <Link
                key={t.id}
                href={`/my-booking/${t.id}`}
                className="grid grid-cols-1 md:grid-cols-7 gap-2 md:gap-4 px-6 py-4 border-b border-slate-100 text-[13px] font-medium hover:bg-slate-50 transition-colors"
              >
                <div className="font-bold text-slate-600 underline underline-offset-2 decoration-slate-400">
                  {t.pnr_number || t.booking_ref || t.id.slice(0, 6).toUpperCase()}
                </div>
                <div>
                  {t.created_at ? formatPortalDayMonthYear(t.created_at) : "—"}
                </div>
                <div className="font-bold text-slate-800">{passengerLabel(t)}</div>
                <div className="font-bold">
                  {t.origin} ➝ {t.destination}
                </div>
                <div>{t.departure_datetime ? formatPortalDayMonthYear(t.departure_datetime) : "—"}</div>
                <div>
                  {t.departure_datetime
                    ? new Date(t.departure_datetime).toLocaleTimeString("en-GB", {
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: false,
                      })
                    : "—"}
                </div>
                <div className="font-bold">{t.flight_number || "—"}</div>
              </Link>
            ))}

          {!loading && filtered.length === 0 && (
            <div className="px-6 py-12 text-center text-slate-500">No bookings in this tab.</div>
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
                className="text-slate-800 font-bold text-[14px] border border-slate-300 rounded-full px-6 py-1.5 hover:bg-slate-50 transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </main>

      <NotificationModal isOpen={isNotificationOpen} onClose={() => setIsNotificationOpen(false)} />
      <OfflinePortalFiltersModal
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        value={filters}
        onApply={setFilters}
      />
      <Footer />
    </div>
  );
}
