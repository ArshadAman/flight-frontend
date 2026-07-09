"use client";

import Link from "next/link";
import { use, useState } from "react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminDataTable } from "@/components/admin/AdminDataTable";
import { AdminBadge } from "@/components/admin/AdminBadge";
import { AdminFilterModal } from "@/components/admin/modals/AdminFilterModal";
import { AdminFormModal } from "@/components/admin/modals/AdminFormModal";
import { bookings } from "@/lib/admin/mock-data";
import { bookingManagementViews } from "@/lib/admin/wizard-configs";
import { fulfillBookingFields } from "@/lib/admin/modal-configs";
import type { AdminStatus } from "@/lib/admin/types";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const assignedBookings = bookings.map((b, i) => ({
  ...b,
  agent: ["Ajay Travels", "Harshit B2B", "Pranshu Agency"][i % 3],
}));

const fulfillmentBookings = bookings.map((b) => ({
  ...b,
  action: "Issue Ticket",
  dueDate: "2025-07-12",
}));

export default function BookingsPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string }>;
}) {
  const { view = "all" } = use(searchParams);
  const [activeTab, setActiveTab] = useState<string>(
    bookingManagementViews.find((v) => v.id === view)?.label ?? "All Bookings"
  );
  const [filterOpen, setFilterOpen] = useState(false);
  const [fulfillOpen, setFulfillOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<string>();

  const currentView = bookingManagementViews.find((v) => v.label === activeTab)?.id ?? "all";
  const subtitle = bookingManagementViews.find((v) => v.id === currentView)?.subtitle;

  type Row = Record<string, unknown>;

  const columns =
    currentView === "assigned"
      ? [
          { key: "id", header: "Booking ID" },
          { key: "pnr", header: "PNR" },
          { key: "passenger", header: "Passenger" },
          { key: "agent", header: "Assigned Agent" },
          { key: "route", header: "Route" },
          { key: "date", header: "Travel Date" },
          {
            key: "status",
            header: "Status",
            render: (r: Row) => <AdminBadge status={r.status as AdminStatus} />,
          },
          {
            key: "profile",
            header: "Profile",
            render: (r: Row) => (
              <Link href={`/admin/bookings/${r.id}`}>
                <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50">
                  View Profile <ArrowRight className="h-3 w-3" />
                </span>
              </Link>
            ),
          },
        ]
      : currentView === "fulfillment"
        ? [
            { key: "id", header: "Booking ID" },
            { key: "pnr", header: "PNR" },
            { key: "passenger", header: "Passenger" },
            { key: "airline", header: "Airline" },
            { key: "action", header: "Action Required" },
            { key: "dueDate", header: "Due Date" },
            {
              key: "status",
              header: "Status",
              render: (r: Row) => <AdminBadge status={r.status as AdminStatus} />,
            },
            {
              key: "fulfill",
              header: "",
              render: (r: Row) => (
                <Button
                  size="sm"
                  className="h-8"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedBooking(r.pnr as string);
                    setFulfillOpen(true);
                  }}
                >
                  Fulfill
                </Button>
              ),
            },
          ]
        : [
            { key: "id", header: "Booking ID" },
            { key: "pnr", header: "PNR" },
            { key: "passenger", header: "Passenger" },
            { key: "route", header: "Route" },
            { key: "airline", header: "Airline" },
            { key: "date", header: "Travel Date" },
            { key: "amount", header: "Amount", render: (r: Row) => `₹${r.amount}` },
            {
              key: "status",
              header: "Status",
              render: (r: Row) => <AdminBadge status={r.status as AdminStatus} />,
            },
            {
              key: "profile",
              header: "Profile",
              render: (r: Row) => (
                <Link href={`/admin/bookings/${r.id}`}>
                  <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50">
                    View Profile <ArrowRight className="h-3 w-3" />
                  </span>
                </Link>
              ),
            },
          ];

  const data: Record<string, unknown>[] =
    currentView === "assigned"
      ? assignedBookings
      : currentView === "fulfillment"
        ? fulfillmentBookings
        : bookings;

  return (
    <div className="flex min-h-full flex-col">
      <AdminPageHeader
        title="Supplier Booking Management"
        subtitle={subtitle}
        tabs={bookingManagementViews.map((v) => v.label)}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onFilterClick={() => setFilterOpen(true)}
        action={
          <div className="flex gap-2">
            <Link href="/admin/bookings/rebooking/1">
              <Button variant="outline" size="sm" className="h-9">
                Rebooking
              </Button>
            </Link>
            <Link href="/admin/bookings/refund/1">
              <Button variant="outline" size="sm" className="h-9">
                Refund
              </Button>
            </Link>
          </div>
        }
      />
      <div className="flex-1 p-6">
        <AdminDataTable
          keyField="id"
          data={data}
          columns={columns}
          onRowClick={(row) => {
            window.location.href = `/admin/bookings/${row.id}`;
          }}
        />
      </div>
      <AdminFilterModal open={filterOpen} onOpenChange={setFilterOpen} />
      <AdminFormModal
        open={fulfillOpen}
        onOpenChange={setFulfillOpen}
        title={`Fulfill Booking${selectedBooking ? `: ${selectedBooking}` : ""}`}
        fields={fulfillBookingFields}
        submitLabel="Fulfill Booking"
      />
    </div>
  );
}
