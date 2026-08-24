"use client";

import { useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { format, parseISO } from "date-fns";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { BookingDraft, BookingPassenger } from "@/lib/booking";
import type { Flight } from "@/lib/flight";
import { StopsSummary } from "@/components/flights/JourneyDetails";
import { COUNTRIES } from "@/lib/data/countries";

const inputClass =
  "border border-slate-200 rounded-md px-3 py-2.5 text-[13px] font-medium outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100 bg-white placeholder:text-slate-400 w-full";

function formatLegDate(date?: string) {
  if (!date) return "—";
  try {
    return format(parseISO(date), "EEE, dd MMM yy");
  } catch {
    return date;
  }
}

function ItineraryRow({ flight, date }: { flight: Flight; date?: string }) {
  const code = flight.airline_code || flight.id.split("-")[0];
  return (
    <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
      <div className="flex items-center gap-2 min-w-[100px]">
        <img
          src={`/airlines/${code}.png`}
          alt={flight.airline}
          className="h-8 w-8 object-contain"
          onError={(e) => {
            e.currentTarget.style.display = "none";
          }}
        />
        <span className="font-black text-[#D60D26] text-[14px] uppercase tracking-wide">{flight.airline}</span>
      </div>
      <span className="text-[13px] font-semibold text-slate-600">{flight.id}</span>
      <span className="text-[13px] font-semibold text-slate-600">{formatLegDate(date || flight.travel_date)}</span>
      <span className="text-[13px] font-bold text-slate-800">
        {flight.origin} → {flight.destination}
      </span>
      <span className="text-[13px] font-semibold text-slate-600">{flight.cabin_class || "Economy"}</span>
      <span className="text-[13px] font-bold text-slate-800 tracking-tight">
        {flight.departureTime} - {flight.arrivalTime}
      </span>
      <span className="text-[13px] font-semibold text-slate-600">{flight.duration}</span>
      <StopsSummary flight={flight} className="text-[13px] font-semibold text-slate-600" />
    </div>
  );
}

type Pricing = { subtotal: number; tax: number; meals: number; total: number };

export function OfflineBookPaymentPanel({
  draft,
  passengers,
  pricing,
  contactEmail,
  contactMobile,
  loading,
  formError,
  onPayAndOrder,
  onHold,
}: {
  draft: BookingDraft;
  passengers: BookingPassenger[];
  pricing: Pricing | null;
  contactEmail: string;
  contactMobile: string;
  loading?: boolean;
  formError?: string | null;
  onPayAndOrder: () => void;
  onHold: () => void;
}) {
  const [paymentMethod, setPaymentMethod] = useState<"Card" | "Net Banking" | "Wallet">("Wallet");
  const [bookingStaff, setBookingStaff] = useState("");
  const [internalTxn, setInternalTxn] = useState("");
  const [invoice, setInvoice] = useState({
    nationality: "",
    lastName: passengers[0]?.last_name || "",
    firstName: passengers[0]?.first_name || "",
    email: contactEmail,
    mobile: contactMobile,
    address: "",
    zip: "",
    city: "",
    country: "India",
  });

  const payingPax = draft.adults + draft.children;
  const basePerPax = payingPax > 0 && pricing ? pricing.subtotal / payingPax : 0;
  const taxPerPax = payingPax > 0 && pricing ? pricing.tax / payingPax : 0;
  const ticketFee = 10;
  const totalPerPax = basePerPax + taxPerPax + ticketFee;

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm mb-16">
      <div className="w-full px-6 py-3.5 bg-[#0C2342]">
        <h2 className="text-white font-bold text-[15px]">Payment</h2>
      </div>

      <div className="px-6 py-6 flex flex-col border-b border-slate-100">
        <h3 className="text-slate-800 font-bold text-sm mb-5">Itinerary details:</h3>
        <ItineraryRow flight={draft.outbound} date={draft.departureDate} />
      </div>

      <div className="px-6 py-6 border-b border-slate-100 flex flex-col gap-6">
        <h3 className="text-slate-800 font-bold text-sm">Form of payment:</h3>
        <div className="flex flex-wrap gap-6">
          {(["Card", "Net Banking", "Wallet"] as const).map((method) => (
            <label
              key={method}
              className="flex items-center gap-2 cursor-pointer"
              onClick={() => setPaymentMethod(method)}
            >
              <div
                className={cn(
                  "w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center",
                  paymentMethod === method ? "border-[#D60D26]" : "border-slate-300"
                )}
              >
                {paymentMethod === method && <div className="w-1.5 h-1.5 bg-[#D60D26] rounded-full" />}
              </div>
              <span className="text-xs font-bold text-slate-800">{method}</span>
            </label>
          ))}
        </div>
        {paymentMethod === "Card" && (
          <div className="flex flex-col md:flex-row flex-wrap items-center gap-4">
            <input type="text" placeholder="Card Number" className={cn(inputClass, "md:flex-[1.5]")} />
            <input type="text" placeholder="Month" className={cn(inputClass, "md:w-24")} />
            <input type="text" placeholder="Year" className={cn(inputClass, "md:w-24")} />
            <input type="text" placeholder="CVV" className={cn(inputClass, "md:w-24")} />
            <input type="text" placeholder="Full Name As On Card" className={cn(inputClass, "md:flex-1")} />
            <Button type="button" className="rounded-full px-8 h-10 font-bold text-sm">
              Save
            </Button>
          </div>
        )}
      </div>

      <div className="px-6 py-6 border-b border-slate-100 bg-[#F8FBFF]">
        <h3 className="text-slate-800 font-bold text-sm mb-4">Price details:</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-[12px] font-bold text-slate-600 min-w-[640px]">
            <thead>
              <tr className="border-b border-slate-200 text-left">
                <th className="py-2 pr-3">Pax</th>
                <th className="py-2 pr-3">Price</th>
                <th className="py-2 pr-3">Tax</th>
                <th className="py-2 pr-3">Saving</th>
                <th className="py-2 pr-3">Ticket fee</th>
                <th className="py-2 pr-3">Markup</th>
                <th className="py-2">Total p.p.</th>
              </tr>
            </thead>
            <tbody>
              {passengers
                .filter((p) => p.pax_type !== 2)
                .map((p, i) => (
                  <tr key={p.id} className="border-b border-slate-100">
                    <td className="py-3 pr-3">
                      {p.first_name || p.last_name
                        ? `${p.first_name}_${p.last_name}`.replace(/^_+|_+$/g, "") || `Pax ${i + 1}`
                        : `ADT ${i + 1}`}
                    </td>
                    <td className="py-3 pr-3">${basePerPax.toFixed(2)}</td>
                    <td className="py-3 pr-3">${taxPerPax.toFixed(2)}</td>
                    <td className="py-3 pr-3">$0.00</td>
                    <td className="py-3 pr-3">${ticketFee.toFixed(2)}</td>
                    <td className="py-3 pr-3">$0.00</td>
                    <td className="py-3 font-black text-slate-800">${totalPerPax.toFixed(2)}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="px-6 py-6 border-b border-slate-100 space-y-4">
        <h3 className="text-slate-800 font-bold text-sm">Invoicing address:</h3>
        <div className="grid md:grid-cols-5 gap-3">
          <input
            className={inputClass}
            placeholder="Nationality"
            value={invoice.nationality}
            onChange={(e) => setInvoice((s) => ({ ...s, nationality: e.target.value }))}
          />
          <input
            className={inputClass}
            placeholder="Last Name"
            value={invoice.lastName}
            onChange={(e) => setInvoice((s) => ({ ...s, lastName: e.target.value }))}
          />
          <input
            className={inputClass}
            placeholder="First Name"
            value={invoice.firstName}
            onChange={(e) => setInvoice((s) => ({ ...s, firstName: e.target.value }))}
          />
          <input
            className={inputClass}
            placeholder="Email Address"
            value={invoice.email}
            onChange={(e) => setInvoice((s) => ({ ...s, email: e.target.value }))}
          />
          <input
            className={inputClass}
            placeholder="Mobile Number"
            value={invoice.mobile}
            onChange={(e) => setInvoice((s) => ({ ...s, mobile: e.target.value }))}
          />
        </div>
        <div className="grid md:grid-cols-4 gap-3">
          <input
            className={cn(inputClass, "md:col-span-2")}
            placeholder="Address Details"
            value={invoice.address}
            onChange={(e) => setInvoice((s) => ({ ...s, address: e.target.value }))}
          />
          <input
            className={inputClass}
            placeholder="ZIP / Postal Code"
            value={invoice.zip}
            onChange={(e) => setInvoice((s) => ({ ...s, zip: e.target.value }))}
          />
          <input
            className={inputClass}
            placeholder="City"
            value={invoice.city}
            onChange={(e) => setInvoice((s) => ({ ...s, city: e.target.value }))}
          />
          <select
            className={cn(inputClass, "text-slate-600")}
            value={invoice.country}
            onChange={(e) => setInvoice((s) => ({ ...s, country: e.target.value }))}
          >
            {COUNTRIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="px-6 py-6 border-b border-slate-100 grid md:grid-cols-2 gap-4">
        <div>
          <label className="text-[12px] font-bold text-slate-600 mb-1 block">Booking Staff</label>
          <input
            className={inputClass}
            value={bookingStaff}
            onChange={(e) => setBookingStaff(e.target.value)}
            placeholder="Staff name"
          />
        </div>
        <div>
          <label className="text-[12px] font-bold text-slate-600 mb-1 block">Internal Transaction Number</label>
          <input
            className={inputClass}
            value={internalTxn}
            onChange={(e) => setInternalTxn(e.target.value)}
            placeholder="Reference"
          />
        </div>
      </div>

      {draft.inventoryHoldId && (
        <div className="mx-6 mt-4 rounded-xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm text-amber-900 font-medium">
          Seat hold is active
          {draft.holdExpiresAt
            ? ` until ${new Date(draft.holdExpiresAt).toLocaleString("en-IN")}`
            : " (24 hours)"}
          .
        </div>
      )}

      {formError && (
        <div className="mx-6 mt-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm font-bold">
          {formError}
        </div>
      )}

      <div className="px-6 py-8 flex flex-col sm:flex-row gap-4 items-center justify-center bg-[#F8FBFF]">
        <div className="text-center sm:mr-auto sm:text-left">
          <p className="text-xs text-slate-500 font-bold">Total payable</p>
          <p className="text-2xl font-black text-slate-900">
            ₹{pricing ? pricing.total.toLocaleString("en-IN") : "—"}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">
            Paying via {paymentMethod}
            {paymentMethod === "Wallet" ? " (agent balance)" : ""}
          </p>
        </div>
        <button
          type="button"
          disabled={loading}
          onClick={onPayAndOrder}
          className="w-full sm:w-auto rounded-full bg-[#D60D26] hover:bg-[#30060F] text-white px-10 py-4 text-base font-bold flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {loading ? "Processing…" : (
            <>
              Pay And Order <ArrowUpRight className="w-5 h-5" strokeWidth={3} />
            </>
          )}
        </button>
        <button
          type="button"
          disabled={loading}
          onClick={onHold}
          className="w-full sm:w-auto rounded-full border-2 border-slate-800 bg-white text-slate-800 px-10 py-4 text-base font-bold flex items-center justify-center gap-2 disabled:opacity-50"
        >
          Hold <ArrowUpRight className="w-5 h-5" strokeWidth={3} />
        </button>
      </div>
    </div>
  );
}
