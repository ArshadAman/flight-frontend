"use client";

import { use } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Briefcase, Plane, Utensils, Armchair } from "lucide-react";

export default function ETicketPage({
  params,
}: {
  params: Promise<{ pnr: string }>;
}) {
  const { pnr } = use(params);

  return (
    <div className="flex min-h-full flex-col">
      <div className="border-b border-[#e8ebef] bg-white px-6 py-5">
        <div className="flex items-center gap-3">
          <Link href="/admin/bookings" className="rounded p-1 text-slate-500 hover:bg-slate-100">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-xl font-bold text-[#1c304a]">
            Harshit&apos;s Profile(Api supplier booking management dashboard)
          </h1>
        </div>
      </div>

      <div className="flex-1 space-y-4 p-6">
        <div className="rounded-xl border border-[#e8ebef] bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[#e8ebef] pb-5">
            <div className="flex gap-4">
              <div className="flex h-14 w-20 items-center justify-center rounded bg-slate-100 text-xs text-slate-400">
                Logo
              </div>
              <div>
                <p className="font-semibold text-[#1c304a]">Agent Company Name</p>
                <p className="text-xs text-slate-500">Misrod Road, Near Vijay Park, Delhi (India)</p>
                <p className="text-xs text-slate-500">+91 0123456789</p>
              </div>
            </div>
            <p className="text-2xl font-bold text-[#1c304a]">E - Ticket</p>
            <div className="text-right">
              <span className="inline-block rounded border border-emerald-500 px-3 py-1 text-sm font-medium text-emerald-600">
                Confirm
              </span>
              <p className="mt-2 text-xs text-slate-500">
                Booking reference number: <span className="font-semibold text-[#1c304a]">{pnr || "XYR9NF"}</span>
              </p>
              <p className="text-xs text-slate-500">
                Booking date: <span className="font-semibold text-[#1c304a]">15SEP/2025</span>
              </p>
            </div>
          </div>

          <section className="mt-5">
            <h3 className="mb-2 text-sm font-semibold text-[#1c304a]">Passengers Details</h3>
            <div className="overflow-x-auto rounded-lg border border-[#e8ebef]">
              <table className="w-full text-left text-sm">
                <thead className="bg-[#eef6ff] text-xs text-slate-600">
                  <tr>
                    {["No.", "Title", "First Name", "Last Name", "Passenger Type", "E-Ticket Number", "Airlines PNR"].map(
                      (h) => (
                        <th key={h} className="px-3 py-2 font-medium">
                          {h}
                        </th>
                      )
                    )}
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t border-[#e8ebef]">
                    <td className="px-3 py-2">1</td>
                    <td className="px-3 py-2">MR.</td>
                    <td className="px-3 py-2">HARSHIT</td>
                    <td className="px-3 py-2">CHIRGANIA</td>
                    <td className="px-3 py-2">Adult</td>
                    <td className="px-3 py-2">079176412301</td>
                    <td className="px-3 py-2">AYDA325</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section className="mt-5">
            <h3 className="mb-2 text-sm font-semibold text-[#1c304a]">Itinerary Details</h3>
            <div className="overflow-x-auto rounded-lg border border-[#e8ebef]">
              <table className="w-full text-left text-sm">
                <thead className="bg-[#eef6ff] text-xs text-slate-600">
                  <tr>
                    {[
                      "Airline",
                      "Airline Number",
                      "Departure Date",
                      "Travel",
                      "Seat",
                      "Time",
                      "Duration",
                      "Type",
                      "Services",
                    ].map((h) => (
                      <th key={h} className="px-3 py-2 font-medium">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t border-[#e8ebef]">
                    <td className="px-3 py-2">Air India</td>
                    <td className="px-3 py-2">AI 2814</td>
                    <td className="px-3 py-2">Wed, 28 Oct 25</td>
                    <td className="px-3 py-2">DEL → BKK</td>
                    <td className="px-3 py-2">E1/Economy</td>
                    <td className="px-3 py-2">23:00 - 11:40</td>
                    <td className="px-3 py-2">08:55hr</td>
                    <td className="px-3 py-2">0/32N</td>
                    <td className="px-3 py-2">
                      <span className="flex gap-1 text-slate-400">
                        <Armchair className="h-3.5 w-3.5" />
                        <Utensils className="h-3.5 w-3.5" />
                        <Briefcase className="h-3.5 w-3.5" />
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-4 rounded-lg bg-slate-50 px-6 py-4">
              <div>
                <p className="font-semibold text-[#1c304a]">New Delhi, DEL</p>
                <p className="text-xs text-slate-500">Terminal 3</p>
                <p className="mt-1 text-lg font-bold">23:00</p>
              </div>
              <div className="flex flex-1 flex-col items-center px-4">
                <div className="flex w-full items-center gap-2">
                  <span className="h-px flex-1 border-t border-dashed border-slate-300" />
                  <Plane className="h-4 w-4 text-[#006aec]" />
                  <span className="h-px flex-1 border-t border-dashed border-slate-300" />
                </div>
                <p className="mt-1 text-xs text-slate-500">Air India (AI 121)</p>
                <p className="text-xs font-medium text-[#006aec]">8:55 hr</p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-[#1c304a]">Bangkok, BKK</p>
                <p className="text-xs text-slate-500">Terminal 3</p>
                <p className="mt-1 text-lg font-bold">11:00</p>
              </div>
            </div>
          </section>

          <section className="mt-5">
            <h3 className="mb-3 text-sm font-semibold text-[#1c304a]">MR. HARSHIT/CHIRGANIA</h3>
            <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-6">
              <div>
                <p className="text-xs text-slate-400">Baggage</p>
                <p className="mt-1 font-semibold text-[#D60D26]">25K</p>
                <p className="text-[11px] text-slate-400">(25K Maximum)</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Seat</p>
                <p className="mt-1 font-semibold">--</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Meal</p>
                <p className="mt-1 font-semibold">Included</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Rules</p>
                <div className="mt-1 flex gap-1">
                  <span className="rounded bg-[#006aec] px-1.5 py-0.5 text-[10px] text-white">PUB</span>
                  <span className="rounded border border-slate-300 px-1.5 py-0.5 text-[10px]">TKT</span>
                </div>
              </div>
              <div>
                <p className="text-xs text-slate-400">Special Services</p>
                <p className="mt-1 font-semibold">--</p>
              </div>
              <div className="flex items-end justify-end">
                <div className="h-16 w-24 bg-[repeating-linear-gradient(90deg,#111_0,#111_2px,transparent_2px,transparent_4px)]" />
              </div>
            </div>
          </section>

          <section className="mt-5">
            <h3 className="mb-2 text-sm font-semibold text-[#1c304a]">Price details :</h3>
            <div className="overflow-x-auto rounded-lg border border-[#e8ebef]">
              <table className="w-full text-left text-sm">
                <thead className="bg-[#eef6ff] text-xs text-slate-600">
                  <tr>
                    {["No.", "Pax", "Price", "Tax", "Saving", "Ticket fee", "Markup", "Display Tax", "Total Amount"].map(
                      (h) => (
                        <th key={h} className="px-3 py-2 font-medium">
                          {h}
                        </th>
                      )
                    )}
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t border-[#e8ebef]">
                    <td className="px-3 py-2">1</td>
                    <td className="px-3 py-2">CHIRGANIA/HARSHIT MR.</td>
                    <td className="px-3 py-2">$42.40</td>
                    <td className="px-3 py-2">$0.00</td>
                    <td className="px-3 py-2">$0.00</td>
                    <td className="px-3 py-2">$10.00</td>
                    <td className="px-3 py-2">$0.00</td>
                    <td className="px-3 py-2">
                      <select className="rounded border border-[#e8ebef] px-2 py-1 text-xs">
                        <option>Separately</option>
                      </select>
                    </td>
                    <td className="px-3 py-2 font-bold">$52.90</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <div className="mt-5 rounded-lg border border-rose-100 bg-rose-50 px-4 py-3 text-sm">
            <p className="font-semibold text-[#D60D26]">Important:</p>
            <p className="mt-1 text-xs leading-relaxed text-slate-600">
              Please carry a valid photo ID. Check flight status 24 hours before departure. Carriage is subject to
              airline conditions of carriage. Travel insurance is recommended.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button variant="outline" className="border-[#D60D26] text-[#D60D26] hover:bg-rose-50">
            Add Discount
          </Button>
          <Button variant="outline" className="border-[#e8ebef] text-slate-700">
            Print E-Ticket
          </Button>
          <Button variant="outline" className="border-[#e8ebef] text-slate-700">
            Share E-Ticket
          </Button>
          <Button variant="outline" className="border-[#e8ebef] text-slate-700">
            Edit Transaction Fee
          </Button>
          <Button variant="outline" className="border-[#e8ebef] text-slate-700" asChild>
            <Link href="/admin/bookings/refund/1">Refund</Link>
          </Button>
          <Button variant="outline" className="border-[#e8ebef] text-slate-700" asChild>
            <Link href="/admin/bookings/rebooking/1">Rebooking</Link>
          </Button>
          <Button variant="outline" className="border-[#e8ebef] text-slate-700" asChild>
            <Link href="/admin/bookings/special-request/1">Special Request</Link>
          </Button>
          <Button variant="outline" className="border-[#e8ebef] text-slate-700">
            Cancellation
          </Button>
        </div>
      </div>
    </div>
  );
}
