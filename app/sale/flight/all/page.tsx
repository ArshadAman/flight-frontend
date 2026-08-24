"use client";

import { useMemo, useState, useEffect } from "react";
import Link from "next/link";
import { Filter, Plus } from "lucide-react";
import { SaleNavbar } from "@/components/SaleNavbar";
import { Footer } from "@/components/Footer";
import { NotificationModal } from "@/components/NotificationModal";
import { OfflinePortalSubNav } from "@/components/sale/OfflinePortalSubNav";
import { OfflineFlightListTable } from "@/components/sale/OfflineFlightListTable";
import { OfflineFlightDetailDrawer } from "@/components/sale/OfflineFlightDetailDrawer";
import {
  OfflinePortalFiltersModal,
  countActiveFilters,
  emptyOfflineFilters,
  type OfflineFilters,
} from "@/components/sale/OfflinePortalFilters";
import { useAuth } from "@/context/AuthContext";
import { useAgentOfflineData } from "@/hooks/useAgentOfflineData";
import { listingStatus, type OfflineInventoryRow } from "@/lib/sale/offlinePortal";
import { getPublicApiUrl } from "@/lib/apiConfig";

export default function SaleAllFlightsPage() {
  const { access, openAuthModal } = useAuth();
  const { inventory, tickets, loading, error, bookedByInventory, reload } = useAgentOfflineData(access);
  const [activeTab, setActiveTab] = useState("All booking");
  const [selectedFlight, setSelectedFlight] = useState<OfflineInventoryRow | null>(null);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filters, setFilters] = useState<OfflineFilters>(emptyOfflineFilters);

  useEffect(() => {
    if (!selectedFlight) return;
    const fresh = inventory.find((row) => row.id === selectedFlight.id);
    if (fresh) setSelectedFlight(fresh);
  }, [inventory, selectedFlight?.id]);

  const pendingInventoryIds = useMemo(() => {
    const ids = new Set<string>();
    for (const t of tickets) {
      if (t.status === "PENDING" && t.agent_flight_inventory) {
        ids.add(String(t.agent_flight_inventory));
      }
    }
    return ids;
  }, [tickets]);

  const tabCounts = useMemo(() => {
    let pending = 0;
    let bookable = 0;
    let soldOut = 0;
    for (const row of inventory) {
      const booked = bookedByInventory.get(String(row.id)) || 0;
      const status = listingStatus(row, booked);
      if (pendingInventoryIds.has(String(row.id))) pending += 1;
      if (status === "Open") bookable += 1;
      else soldOut += 1;
    }
    return {
      all: inventory.length,
      pending,
      bookable,
      soldOut,
    };
  }, [inventory, bookedByInventory, pendingInventoryIds]);

  const filtered = useMemo(() => {
    return inventory.filter((row) => {
      const booked = bookedByInventory.get(String(row.id)) || 0;
      const status = listingStatus(row, booked);
      if (activeTab === "Pending booking") return pendingInventoryIds.has(String(row.id));
      if (activeTab === "Bookable") return status === "Open";
      if (activeTab === "Sold Out") return status === "Closed";
      if (filters.origin && row.origin.toUpperCase() !== filters.origin.trim().toUpperCase()) return false;
      if (filters.destination && row.destination.toUpperCase() !== filters.destination.trim().toUpperCase()) return false;
      if (filters.status === "open" && status !== "Open") return false;
      if (filters.status === "closed" && status !== "Closed") return false;
      return true;
    });
  }, [inventory, activeTab, bookedByInventory, pendingInventoryIds, filters]);

  const notificationCount = useMemo(
    () => tickets.filter((t) => t.status === "PENDING").length,
    [tickets]
  );

  const handleExport = async () => {
    if (!access) {
      openAuthModal();
      return;
    }
    const apiBase = getPublicApiUrl();
    const res = await fetch(`${apiBase}/flights/inventory/export/?format=csv`, {
      headers: { Authorization: `Bearer ${access}` },
    });
    if (!res.ok) return;
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "offline_flights.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const onTabChange = (tab: string) => {
    if (tab === "Export") {
      void handleExport();
      return;
    }
    setActiveTab(tab);
  };

  const handlePublishToggle = async () => {
    if (!selectedFlight) return;
    if (!access) {
      openAuthModal();
      return;
    }
    setPublishing(true);
    try {
      const next = !(selectedFlight.is_published !== false);
      const apiBase = getPublicApiUrl();
      const res = await fetch(`${apiBase}/flights/inventory/${selectedFlight.id}/`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${access}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ is_published: next }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error((err as { detail?: string }).detail || `Update failed (${res.status})`);
      }
      const updated = await res.json();
      const published = updated.is_published ?? next;
      setSelectedFlight((prev) => (prev ? { ...prev, is_published: published } : prev));
      await reload();
    } catch {
      // reload keeps UI consistent if partial failure
      await reload();
    } finally {
      setPublishing(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-background flex flex-col font-sans">
      <SaleNavbar />

      <OfflinePortalSubNav
        variant="flight"
        activeTab={activeTab}
        onTabChange={onTabChange}
        onNotification={() => setIsNotificationOpen(true)}
        notificationCount={notificationCount}
        flightTabs={[
          { name: "All booking", count: tabCounts.all },
          { name: "Pending booking", count: tabCounts.pending },
          { name: "Bookable", count: tabCounts.bookable },
          { name: "Sold Out", count: tabCounts.soldOut },
          { name: "Export" },
        ]}
      />

      <div className="flex-1 w-full flex overflow-hidden relative">
        <main
          className={`flex-1 overflow-y-auto transition-all duration-300 ${
            selectedFlight ? "xl:pr-[450px]" : ""
          }`}
        >
          <div className="container mx-auto px-6 lg:px-10 py-6 w-full max-w-[1400px]">
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
          <Link
            href="/sale/inventory/new"
            className="bg-[#D60D26] hover:bg-[#30060F] text-white px-6 py-2.5 rounded-full font-bold text-[14px] transition-colors shadow-sm flex items-center justify-center gap-2 w-full sm:w-auto"
          >
            <Plus className="w-4 h-4" /> New Flight
          </Link>
        </div>

        {!access && (
          <div className="rounded-xl border border-amber-100 bg-amber-50 px-5 py-4 text-amber-800 text-sm font-medium mb-6">
            <button type="button" className="underline font-bold" onClick={() => openAuthModal()}>
              Sign in
            </button>{" "}
            as an agent to manage offline For Sale flights.
          </div>
        )}

        {error && (
          <div className="rounded-xl border border-rose-100 bg-rose-50 px-5 py-4 text-rose-700 text-sm font-medium mb-6">
            {error}{" "}
            <button type="button" className="underline font-bold" onClick={() => void reload()}>
              Retry
            </button>
          </div>
        )}

        {loading ? (
          <div className="py-16 text-center text-slate-500 font-medium">Loading flights…</div>
        ) : (
          <OfflineFlightListTable
            rows={filtered}
            variant="flight"
            selectedId={selectedFlight?.id}
            onSelect={setSelectedFlight}
            bookedByInventory={bookedByInventory}
          />
        )}
          </div>
        </main>

        {selectedFlight && (
          <OfflineFlightDetailDrawer
            flight={selectedFlight}
            tickets={tickets}
            bookedCount={bookedByInventory.get(String(selectedFlight.id)) || 0}
            onClose={() => setSelectedFlight(null)}
            onPublishToggle={() => void handlePublishToggle()}
            publishing={publishing}
            allowBookNow={activeTab === "Bookable"}
          />
        )}
      </div>

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
