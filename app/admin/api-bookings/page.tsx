"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminDataTable } from "@/components/admin/AdminDataTable";
import { AdminBadge } from "@/components/admin/AdminBadge";
import { useAuth } from "@/context/AuthContext";
import {
  listApiTickets,
  formatTicketDate,
  formatTicketMoney,
  isAdminSession,
  type ApiTicket,
  type ApiTicketStatus,
} from "@/lib/admin/tickets-api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Info, MoreVertical, RefreshCw, Search } from "lucide-react";
import type { AdminStatus } from "@/lib/admin/types";

const statusTabs = ["All", "Confirmed", "Pending", "Cancelled", "Failed"] as const;

function mapStatus(s: ApiTicketStatus): AdminStatus {
  if (s === "CONFIRMED") return "approved";
  if (s === "PENDING") return "pending";
  if (s === "CANCELLED") return "denied";
  return "closed";
}

export default function ApiBookingsPage() {
  const { access, user, isLoading: authLoading, openAuthModal } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState<(typeof statusTabs)[number]>("All");
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [tickets, setTickets] = useState<ApiTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const admin = isAdminSession(user);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const status = tab === "All" ? undefined : tab.toUpperCase();
    const result = await listApiTickets({ status, search: query || undefined });
    if (!result.ok) {
      setError(result.error);
      setTickets([]);
    } else {
      setTickets(result.tickets);
    }
    setLoading(false);
  }, [tab, query]);

  useEffect(() => {
    if (authLoading) return;
    if (!access) {
      setLoading(false);
      setError("Login required. Sign in from the main site top bar as admin, then return here.");
      return;
    }
    void load();
  }, [access, authLoading, load]);

  return (
    <div className="flex min-h-full flex-col">
      <AdminPageHeader
        title="API Booking"
        subtitle={loading ? "Loading…" : `${tickets.length} Bookings`}
        tabs={[...statusTabs]}
        activeTab={tab}
        onTabChange={(t) => setTab(t as (typeof statusTabs)[number])}
        action={
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Input
                placeholder="Search PNR / email / user"
                className="h-9 w-56 border-[#e8ebef] pr-9 text-sm"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") setQuery(search.trim());
                }}
              />
              <button
                type="button"
                className="absolute right-2 top-2 text-slate-400"
                onClick={() => setQuery(search.trim())}
              >
                <Search className="h-4 w-4" />
              </button>
            </div>
            <Button
              size="sm"
              variant="outline"
              className="h-9 gap-1 border-[#e8ebef]"
              onClick={() => void load()}
              disabled={loading || !access}
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <Button size="sm" className="h-9 bg-[#006aec] hover:bg-[#006aec]/90" asChild>
              <Link href="/admin/inventory/search">New Search</Link>
            </Button>
          </div>
        }
      />

      <div className="flex-1 p-6">
        {!access && !authLoading && (
          <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            <p className="font-medium">Not signed in</p>
            <p className="mt-1 text-xs">
              Log in on the main site as an ADMIN/staff user, then open API Booking to see every ticket created from
              the user panel.
            </p>
            <Button size="sm" className="mt-3 bg-[#006aec]" onClick={openAuthModal}>
              Open login
            </Button>
          </div>
        )}

        {access && !admin && (
          <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            Signed in as <strong>{user?.username}</strong> (role: {user?.role || "CUSTOMER"}). You only see{" "}
            <em>your own</em> tickets. To view/cancel bookings created by any user from the user panel, log in with an
            account that has <code>role=ADMIN</code> or Django staff.
          </div>
        )}

        {access && admin && (
          <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
            Admin session active — showing <strong>all</strong> API tickets (user panel + admin bookings). Open a row to
            view status, passengers, and cancel.
          </div>
        )}

        {error && access && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {loading ? (
          <p className="text-sm text-slate-500">Loading bookings from API…</p>
        ) : (
          <AdminDataTable
            keyField="id"
            data={tickets as unknown as Record<string, unknown>[]}
            onRowClick={(row) => router.push(`/admin/api-bookings/${row.id}`)}
            columns={[
              {
                key: "select",
                header: "",
                render: () => (
                  <input type="checkbox" className="rounded border-slate-300" onClick={(e) => e.stopPropagation()} />
                ),
              },
              {
                key: "pnr_number",
                header: "PNR No.",
                render: (r) =>
                  String(
                    (r as unknown as ApiTicket).pnr_number ||
                      (r as unknown as ApiTicket).booking_ref ||
                      "—"
                  ),
              },
              {
                key: "dep",
                header: "Dep. Date",
                render: (r) => formatTicketDate((r as unknown as ApiTicket).departure_datetime),
              },
              {
                key: "airline_name",
                header: "Airline",
                render: (r) => {
                  const t = r as unknown as ApiTicket;
                  return t.airline_name || t.airline_code || "—";
                },
              },
              {
                key: "flight_number",
                header: "Flight No.",
                render: (r) => (
                  <span className="text-[#006aec]">
                    {String((r as unknown as ApiTicket).flight_number || "—")}
                  </span>
                ),
              },
              {
                key: "route",
                header: "Route",
                render: (r) => {
                  const t = r as unknown as ApiTicket;
                  return (
                    <p className="text-sm font-medium">
                      {t.origin} → {t.destination}
                    </p>
                  );
                },
              },
              {
                key: "user_name",
                header: "Booked By (user)",
                render: (r) => {
                  const t = r as unknown as ApiTicket;
                  return (
                    <div>
                      <p className="text-sm">{t.user_name || "—"}</p>
                      <p className="text-xs text-slate-400">{t.user_email || ""}</p>
                    </div>
                  );
                },
              },
              {
                key: "pax",
                header: "Pax",
                render: (r) =>
                  String(
                    (r as unknown as ApiTicket).passenger_count ??
                      (r as unknown as ApiTicket).passengers_data?.length ??
                      0
                  ),
              },
              {
                key: "total_amount",
                header: "Amount",
                render: (r) => {
                  const t = r as unknown as ApiTicket;
                  return formatTicketMoney(t.total_amount, t.currency || "INR");
                },
              },
              {
                key: "status",
                header: "Status",
                render: (r) => {
                  const t = r as unknown as ApiTicket;
                  return <AdminBadge status={mapStatus(t.status)} label={t.status} />;
                },
              },
              {
                key: "actions",
                header: "",
                render: () => (
                  <div className="flex items-center gap-2 text-slate-400">
                    <Info className="h-4 w-4" />
                    <MoreVertical className="h-4 w-4" />
                  </div>
                ),
              },
            ]}
          />
        )}
      </div>
    </div>
  );
}
