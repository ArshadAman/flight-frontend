"use client";

import { use, useState } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminBadge } from "@/components/admin/AdminBadge";
import { AdminConfirmModal } from "@/components/admin/AdminConfirmModal";
import { bookings } from "@/lib/admin/mock-data";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function BookingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const booking = bookings.find((b) => b.id === id);
  const [cancelOpen, setCancelOpen] = useState(false);

  if (!booking) notFound();

  return (
    <div className="flex min-h-full flex-col">
      <div className="border-b border-slate-200 bg-white px-6 py-5">
        <div className="flex items-center gap-4">
          <Link href="/admin/bookings" className="rounded p-1 text-slate-500 hover:bg-slate-100">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">PNR Details: {booking.pnr}</h1>
            <p className="text-sm text-slate-500">Booking ID: {booking.id}</p>
          </div>
          <div className="ml-auto">
            <AdminBadge status={booking.status} />
          </div>
        </div>
      </div>

      <div className="flex-1 space-y-6 p-6">
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="mb-4 font-bold text-slate-800">Flight Information</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                {[
                  ["Route", booking.route],
                  ["Airline", booking.airline],
                  ["Travel Date", booking.date],
                  ["Amount", `₹${booking.amount}`],
                  ["Passenger", booking.passenger],
                  ["PNR", booking.pnr],
                ].map(([label, value]) => (
                  <div key={label}>
                    <p className="text-xs text-slate-500">{label}</p>
                    <p className="font-medium text-slate-800">{value}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="mb-4 font-bold text-slate-800">Passenger Details</h3>
              <div className="grid gap-3 text-sm">
                <div className="flex justify-between border-b border-slate-100 py-2">
                  <span className="text-slate-500">Name</span>
                  <span className="font-medium">{booking.passenger}</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 py-2">
                  <span className="text-slate-500">Type</span>
                  <span className="font-medium">Adult</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-slate-500">Seat</span>
                  <span className="font-medium">12A</span>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="mb-4 font-bold text-slate-800">Actions</h3>
            <div className="flex flex-col gap-2">
              <Link href="/admin/bookings/rebooking/1">
                <Button variant="outline" className="w-full justify-start">Rebooking</Button>
              </Link>
              <Link href="/admin/bookings/refund/1">
                <Button variant="outline" className="w-full justify-start">Refund</Button>
              </Link>
              <Link href="/admin/bookings/special-request/1">
                <Button variant="outline" className="w-full justify-start">Special Request</Button>
              </Link>
              <Button
                variant="destructive"
                className="w-full justify-start"
                onClick={() => setCancelOpen(true)}
              >
                Cancel Booking
              </Button>
            </div>
          </div>
        </div>
      </div>
      <AdminConfirmModal
        open={cancelOpen}
        onOpenChange={setCancelOpen}
        variant="delete"
        title="Cancel Booking"
        description={`Are you sure you want to cancel booking ${booking.pnr}? This action cannot be undone.`}
        confirmLabel="Cancel Booking"
        onConfirm={() => setCancelOpen(false)}
      />
    </div>
  );
}
