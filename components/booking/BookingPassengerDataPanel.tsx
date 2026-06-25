"use client";

import React, { useState } from "react";
import { format, parseISO } from "date-fns";
import { ArrowRight, ArrowUpRight, Utensils, Armchair, Luggage } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { COUNTRIES } from "@/lib/data/countries";
import type { BookingDraft, BookingPassenger } from "@/lib/booking";
import type { Flight } from "@/lib/flight";

const inputClass =
  "border border-slate-200 rounded-md px-3 py-2.5 text-[13px] font-medium outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100 bg-white placeholder:text-slate-400";
const inputClassSm =
  "border border-slate-200 rounded-md px-3 py-2.5 text-[12px] font-medium outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100 bg-white placeholder:text-slate-400";

function airportCode(label: string) {
  const parts = label.trim().split(/\s+/);
  if (parts.length === 1 && parts[0].length <= 4) return parts[0].toUpperCase();
  return parts.map((p) => p[0]).join("").slice(0, 3).toUpperCase() || label.slice(0, 3).toUpperCase();
}

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
    <>
      <div className="flex flex-wrap items-center gap-x-6 gap-y-3 mb-4">
        <div className="flex items-center gap-2 min-w-[100px]">
          <img
            src={`/airlines/${code}.png`}
            alt={flight.airline}
            className="h-8 w-8 object-contain"
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
          <span className="font-black text-primary text-[14px] uppercase tracking-wide">{flight.airline}</span>
        </div>
        <span className="text-[13px] font-semibold text-slate-600">{flight.id}</span>
        <span className="text-[13px] font-semibold text-slate-600">{formatLegDate(date || flight.travel_date)}</span>
        <span className="text-[13px] font-bold text-slate-800">
          {airportCode(flight.origin)} → {airportCode(flight.destination)}
        </span>
        <span className="text-[13px] font-semibold text-slate-600">{flight.cabin_class || "E1/Economy"}</span>
        <span className="text-[13px] font-bold text-slate-800 tracking-tight">
          {flight.departureTime} - {flight.arrivalTime}
        </span>
        <span className="text-[13px] font-semibold text-slate-600">{flight.duration}</span>
        <span className="text-[13px] font-semibold text-slate-600">0/32N</span>
        <div className="flex items-center gap-2 text-slate-400 ml-auto">
          <Armchair className="w-4 h-4" strokeWidth={2.5} />
          <Utensils className="w-4 h-4" strokeWidth={2.5} />
          <Luggage className="w-4 h-4" strokeWidth={2.5} />
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-3 select-none">
        <span className="bg-[#377BD7] text-white text-[11px] font-black px-2.5 py-1 rounded shadow-sm tracking-wider">
          {flight.fare_type || "PUB"}
        </span>
        <span className="border border-slate-300 text-slate-600 bg-white text-[11px] font-extrabold px-2.5 py-1 rounded shadow-sm">
          FEE
        </span>
        {flight.baggage_label && (
          <span className="bg-primary text-white text-[11px] font-black px-2.5 py-1 rounded shadow-sm tracking-wider flex items-center gap-1.5">
            <Luggage className="w-3 h-3" />
            {flight.baggage_label}
          </span>
        )}
        <span className="border border-slate-300 text-slate-600 bg-white text-[11px] font-extrabold px-2.5 py-1 rounded shadow-sm">
          TKT
        </span>
        <span className="text-[11px] font-bold text-slate-600 tracking-wide italic">
          TKT Ordered {format(new Date(), "ddMMM/yy, hh:mma").toUpperCase()}
        </span>
      </div>
    </>
  );
}

type Pricing = { subtotal: number; tax: number; meals: number; total: number };

type Props = {
  draft: BookingDraft;
  passengers: BookingPassenger[];
  pricing: Pricing | null;
  ssrTotalFees?: number;
  contactMobile: string;
  contactEmail: string;
  onContactMobileChange: (v: string) => void;
  onContactEmailChange: (v: string) => void;
  onUpdatePax: (id: string, field: keyof BookingPassenger, value: string) => void;
  onConfirmBooking: () => void;
  loading?: boolean;
  onSearchAgain?: () => void;
  extraSections?: React.ReactNode;
};

export function BookingPassengerDataPanel({
  draft,
  passengers,
  pricing,
  ssrTotalFees = 0,
  contactMobile,
  contactEmail,
  onContactMobileChange,
  onContactEmailChange,
  onUpdatePax,
  onConfirmBooking,
  loading = false,
  onSearchAgain,
  extraSections,
}: Props) {
  const [activeStep, setActiveStep] = useState<"details" | "payment">("details");
  const [activeTab, setActiveTab] = useState<"APIS" | "CTC" | "FFN">("APIS");
  const [docaType, setDocaType] = useState<"Destination" | "Residence">("Destination");
  const [paymentMethod, setPaymentMethod] = useState<"Card" | "Net Banking" | "Wallet">("Card");
  const [activePaxIndex, setActivePaxIndex] = useState(0);

  const pax = passengers[activePaxIndex] || passengers[0];
  const payingPax = draft.adults + draft.children;
  const basePerPax = payingPax > 0 && pricing ? pricing.subtotal / payingPax : 0;
  const taxPerPax = payingPax > 0 && pricing ? pricing.tax / payingPax : 0;
  const ticketFee = 10;
  const totalPerPax = basePerPax + taxPerPax + ticketFee + (pricing?.meals || 0) / Math.max(payingPax, 1);

  const paxTypeLabel = (type: number) => (type === 0 ? "ADT" : type === 1 ? "CHD" : "INF");

  const tripSummary = `${formatLegDate(draft.departureDate)} • ${draft.adults + draft.children + draft.infants} passenger${draft.adults + draft.children + draft.infants !== 1 ? "s" : ""} • ${draft.cabin}`;

  return (
    <div className="w-full flex flex-col min-h-screen bg-white">
      {/* Top split header */}
      <div className="flex flex-col md:flex-row w-full select-none">
        <div className="w-full md:flex-1 bg-primary text-white flex flex-col justify-center px-4 md:pl-10 py-3 md:py-4">
          <div className="flex items-center gap-2 font-bold text-sm md:text-[15px]">
            {draft.origin} <ArrowRight className="w-4 h-4" /> {draft.destination}
          </div>
          <div className="text-xs opacity-90 mt-0.5 tracking-wide">{tripSummary}</div>
        </div>
        <div className="w-full md:flex-1 bg-navy flex items-center justify-start md:justify-end px-4 md:pr-10 py-3 md:py-4 border-t border-white/10 md:border-t-0">
          <Button
            type="button"
            onClick={onSearchAgain}
            className="bg-primary hover:bg-primary/90 text-white rounded-full px-6 h-9 font-bold text-xs shadow-sm flex items-center justify-center gap-1.5 w-full md:w-auto"
          >
            Search Again <ArrowUpRight className="w-3.5 h-3.5" strokeWidth={3} />
          </Button>
        </div>
      </div>

      <div className="w-full max-w-[1280px] mx-auto py-8 px-4 flex flex-col">
        <div className="flex flex-col gap-4">
          {/* DETAILS / PASSENGER DATA */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
            <button
              type="button"
              className={cn(
                "w-full px-6 py-3.5 flex items-center justify-between text-left transition-colors",
                activeStep === "details" ? "bg-navy" : "bg-slate-600 hover:bg-slate-700"
              )}
              onClick={() => setActiveStep("details")}
            >
              <h2 className="text-white font-bold text-[15px]">Details / Passenger Data</h2>
            </button>

            {activeStep === "details" && (
              <div className="flex flex-col animate-in fade-in duration-300">
                {/* Itinerary */}
                <div className="px-6 py-6 flex flex-col border-b border-slate-100">
                  <h3 className="text-slate-800 font-bold text-sm mb-5">Itinerary details:</h3>
                  <ItineraryRow flight={draft.outbound} date={draft.departureDate} />
                  {draft.returnFlight && (
                    <div className="mt-6 pt-6 border-t border-slate-100">
                      <ItineraryRow flight={draft.returnFlight} date={draft.returnDate} />
                    </div>
                  )}
                </div>

                {/* Price details */}
                <div className="flex flex-col border-b border-slate-100">
                  <div className="bg-background px-6 py-3 border-b border-slate-100">
                    <h3 className="text-slate-800 font-bold text-sm">Price details:</h3>
                  </div>
                  <div className="px-6 py-4 overflow-x-auto">
                    <table className="w-full text-[13px] min-w-[720px]">
                      <thead>
                        <tr className="text-slate-400 font-medium text-left border-b border-slate-100">
                          <th className="pb-3 pr-4 font-semibold">No.</th>
                          <th className="pb-3 px-4 font-semibold">Pax</th>
                          <th className="pb-3 px-4 font-semibold text-center">Price</th>
                          <th className="pb-3 px-4 font-semibold text-center">Tax</th>
                          <th className="pb-3 px-4 font-semibold text-center">Saving</th>
                          <th className="pb-3 px-4 font-semibold text-center">Ticket fee</th>
                          <th className="pb-3 px-4 font-semibold text-center">Markup</th>
                          <th className="pb-3 pl-4 font-bold text-slate-700 text-center">Total p.p</th>
                        </tr>
                      </thead>
                      <tbody>
                        {passengers.map((px, idx) => (
                          <tr key={px.id}>
                            <td className="pt-4 pr-4 font-bold text-slate-800">{idx + 1}</td>
                            <td className="pt-4 px-4 font-semibold text-slate-600">{paxTypeLabel(px.pax_type)}</td>
                            <td className="pt-4 px-4 font-semibold text-slate-600 text-center">
                              INR {basePerPax.toFixed(2)}
                            </td>
                            <td className="pt-4 px-4 font-semibold text-slate-600 text-center">
                              INR {taxPerPax.toFixed(2)}
                            </td>
                            <td className="pt-4 px-4 font-semibold text-slate-600 text-center">INR 0.00</td>
                            <td className="pt-4 px-4 font-semibold text-slate-600 text-center">
                              INR {ticketFee.toFixed(2)}
                            </td>
                            <td className="pt-4 px-4 font-semibold text-slate-600 text-center">INR 0.00</td>
                            <td className="pt-4 pl-4 font-black text-slate-900 text-center tracking-tight">
                              INR {totalPerPax.toFixed(2)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Passengers details */}
                <div className="flex flex-col border-b border-slate-100">
                  <div className="bg-background px-6 py-3 border-b border-slate-100">
                    <h3 className="text-slate-800 font-bold text-sm">Passengers details:</h3>
                  </div>

                  <div className="p-6">
                    {passengers.length > 1 && (
                      <div className="flex flex-wrap gap-2 mb-6">
                        {passengers.map((px, idx) => (
                          <button
                            key={px.id}
                            type="button"
                            onClick={() => setActivePaxIndex(idx)}
                            className={cn(
                              "px-4 py-2 rounded-full text-xs font-bold border transition-colors",
                              activePaxIndex === idx
                                ? "bg-primary text-white border-primary"
                                : "bg-white text-slate-600 border-slate-200 hover:border-primary/40"
                            )}
                          >
                            {px.label}
                          </button>
                        ))}
                      </div>
                    )}

                    {pax && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-6 gap-5 mb-8">
                        <select
                          value={pax.title}
                          onChange={(e) => onUpdatePax(pax.id, "title", e.target.value)}
                          className={cn(inputClass, "text-slate-600")}
                        >
                          <option value="MR">Mr.</option>
                          <option value="MRS">Mrs.</option>
                          <option value="MS">Ms.</option>
                          <option value="MSTR">Mstr</option>
                          <option value="MISS">Miss</option>
                        </select>
                        <select className={cn(inputClass, "text-slate-600")} defaultValue="">
                          <option value="">Title</option>
                          <option value="DR">Dr.</option>
                        </select>
                        <input
                          type="text"
                          placeholder="Last Name"
                          value={pax.last_name}
                          onChange={(e) => onUpdatePax(pax.id, "last_name", e.target.value)}
                          className={inputClass}
                        />
                        <input
                          type="text"
                          placeholder="First Name"
                          value={pax.first_name}
                          onChange={(e) => onUpdatePax(pax.id, "first_name", e.target.value)}
                          className={inputClass}
                        />
                        <input type="text" placeholder="Middle Name" className={inputClass} />
                        <input
                          type="date"
                          value={pax.dob}
                          onChange={(e) => onUpdatePax(pax.id, "dob", e.target.value)}
                          className={cn(inputClass, "text-slate-600")}
                        />
                      </div>
                    )}

                    {/* APIS / CTC / FFN tabs */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-1 border-b border-slate-100 px-2">
                      {(
                        [
                          ["APIS", "(Advance passenger information)"],
                          ["CTC", "(Passenger contact data)"],
                          ["FFN", "(Frequent flyer number)"],
                        ] as const
                      ).map(([tab, sub]) => (
                        <button
                          key={tab}
                          type="button"
                          onClick={() => setActiveTab(tab)}
                          className={cn(
                            "px-5 py-3 text-xs font-bold rounded-t-lg transition-colors border-b-2",
                            activeTab === tab
                              ? "bg-background text-primary border-primary"
                              : "text-slate-500 hover:bg-slate-50 border-transparent"
                          )}
                        >
                          {tab}{" "}
                          <span className="font-semibold text-[11px] opacity-80">{sub}</span>
                        </button>
                      ))}
                    </div>

                    <div className="bg-background/40 rounded-b-xl border border-slate-100 p-6 md:p-8">
                      {activeTab === "APIS" && pax && (
                        <div className="flex flex-col gap-8">
                          <div className="flex flex-col gap-4">
                            <h4 className="text-[13px] font-bold text-slate-800">
                              Primary data of the travel document (DOCS)
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                              <input type="text" placeholder="Last Name As Per Passport" className={inputClassSm} defaultValue={pax.last_name} />
                              <input type="text" placeholder="First Name As Per Passport" className={inputClassSm} defaultValue={pax.first_name} />
                              <input type="text" placeholder="Middle Name As Per Passport" className={inputClassSm} />
                              <input type="date" className={cn(inputClassSm, "text-slate-600")} defaultValue={pax.dob} />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                              <select className={cn(inputClassSm, "text-slate-600")}>
                                <option>Document Type</option>
                                <option>Passport</option>
                              </select>
                              <input
                                type="text"
                                placeholder="Document Number"
                                value={pax.passport_number || ""}
                                onChange={(e) => onUpdatePax(pax.id, "passport_number", e.target.value)}
                                className={inputClassSm}
                              />
                              <select className={cn(inputClassSm, "text-slate-600")}>
                                <option value="">Country Of Issuance</option>
                                {COUNTRIES.map((c) => (
                                  <option key={c} value={c}>{c}</option>
                                ))}
                              </select>
                              <select className={cn(inputClassSm, "text-slate-600")}>
                                <option value="">Nationality</option>
                                {COUNTRIES.map((c) => (
                                  <option key={c} value={c}>{c}</option>
                                ))}
                              </select>
                              <input type="date" placeholder="Validity" className={cn(inputClassSm, "text-slate-600")} />
                            </div>
                          </div>

                          <div className="flex flex-col gap-4">
                            <h4 className="text-[13px] font-bold text-slate-800">Passenger contact address (DOCA)</h4>
                            <div className="flex flex-wrap items-center gap-6 mb-1">
                              <span className="text-xs text-slate-500 font-medium">Types of address:</span>
                              {(["Destination", "Residence"] as const).map((type) => (
                                <label
                                  key={type}
                                  className="flex items-center gap-2 cursor-pointer group"
                                  onClick={() => setDocaType(type)}
                                >
                                  <div
                                    className={cn(
                                      "w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center",
                                      docaType === type ? "border-primary" : "border-slate-300"
                                    )}
                                  >
                                    {docaType === type && <div className="w-1.5 h-1.5 bg-primary rounded-full" />}
                                  </div>
                                  <span className="text-xs font-bold text-slate-800">{type}</span>
                                </label>
                              ))}
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                              <input type="text" placeholder="Address Details" className={cn(inputClassSm, "md:col-span-2")} />
                              <input type="text" placeholder="ZIP / Costal Code" className={inputClassSm} />
                              <input type="text" placeholder="City" className={inputClassSm} />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                              <input type="text" placeholder="State" className={inputClassSm} />
                              <select className={cn(inputClassSm, "text-slate-600")}>
                                <option value="">Country</option>
                                {COUNTRIES.map((c) => (
                                  <option key={c} value={c}>{c}</option>
                                ))}
                              </select>
                            </div>
                          </div>

                          <div className="flex flex-col sm:flex-row items-center gap-3">
                            <Button type="button" className="w-full sm:w-auto rounded-full px-8 h-10 font-bold text-sm">
                              Confirm
                            </Button>
                            <Button type="button" variant="pill-outline" className="w-full sm:w-auto px-6 h-10 text-sm">
                              Close & Ignore
                            </Button>
                          </div>
                        </div>
                      )}

                      {activeTab === "CTC" && (
                        <div className="grid sm:grid-cols-2 gap-4 max-w-xl">
                          <div>
                            <label className="text-xs font-bold text-slate-600">Mobile *</label>
                            <input
                              type="tel"
                              value={contactMobile}
                              onChange={(e) => onContactMobileChange(e.target.value)}
                              placeholder="+91"
                              className={cn(inputClassSm, "mt-1 w-full")}
                            />
                          </div>
                          <div>
                            <label className="text-xs font-bold text-slate-600">Email *</label>
                            <input
                              type="email"
                              value={contactEmail}
                              onChange={(e) => onContactEmailChange(e.target.value)}
                              className={cn(inputClassSm, "mt-1 w-full")}
                            />
                          </div>
                        </div>
                      )}

                      {activeTab === "FFN" && (
                        <div className="max-w-md">
                          <input type="text" placeholder="Frequent flyer number" className={cn(inputClassSm, "w-full")} />
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Entry & health */}
                <div className="flex flex-col bg-background rounded-b-xl px-6 py-6 border-t border-slate-100">
                  <h3 className="text-slate-800 font-bold text-sm mb-4">Entry & health regulations :</h3>
                  <div className="flex flex-wrap items-center gap-4">
                    <input type="text" placeholder="Nationality" className={cn(inputClassSm, "w-full md:w-[220px]")} />
                    <select className={cn(inputClassSm, "text-slate-600 w-full md:w-[220px]")}>
                      <option>Language</option>
                      <option>English</option>
                    </select>
                    <Button type="button" variant="pill-outline" className="px-6 h-9 text-sm">
                      Create PDF
                    </Button>
                  </div>
                </div>

                {extraSections}

                <Button
                  type="button"
                  onClick={() => {
                    setActiveStep("payment");
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="w-full rounded-full py-7 text-base font-bold shadow-lg flex items-center justify-center gap-2 mt-6 mb-4"
                >
                  Proceed Payment <ArrowUpRight className="w-5 h-5" strokeWidth={3} />
                </Button>
              </div>
            )}
          </div>

          {/* PAYMENT */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm mb-16">
            <button
              type="button"
              className={cn(
                "w-full px-6 py-3.5 flex items-center justify-between text-left transition-colors",
                activeStep === "payment" ? "bg-navy" : "bg-slate-600 hover:bg-slate-700"
              )}
              onClick={() => setActiveStep("payment")}
            >
              <h2 className="text-white font-bold text-[15px]">Payment</h2>
            </button>

            {activeStep === "payment" && (
              <div className="flex flex-col animate-in fade-in duration-300">
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
                            paymentMethod === method ? "border-primary" : "border-slate-300"
                          )}
                        >
                          {paymentMethod === method && <div className="w-1.5 h-1.5 bg-primary rounded-full" />}
                        </div>
                        <span className="text-xs font-bold text-slate-800">{method}</span>
                      </label>
                    ))}
                  </div>
                  {paymentMethod === "Card" && (
                    <div className="flex flex-col md:flex-row flex-wrap items-center gap-4">
                      <input type="text" placeholder="Card Number" className={cn(inputClassSm, "md:flex-[1.5] w-full")} />
                      <input type="text" placeholder="Month" className={cn(inputClassSm, "md:w-24 w-full")} />
                      <input type="text" placeholder="Year" className={cn(inputClassSm, "md:w-24 w-full")} />
                      <input type="text" placeholder="CVV" className={cn(inputClassSm, "md:w-24 w-full")} />
                      <input type="text" placeholder="Full Name As On Card" className={cn(inputClassSm, "md:flex-1 w-full")} />
                    </div>
                  )}
                </div>

                <div className="px-6 py-6 bg-background border-t border-slate-100">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div>
                      <p className="text-xs text-slate-500">Total payable</p>
                      <p className="text-2xl font-black text-slate-900">
                        ₹{pricing ? (pricing.total + ssrTotalFees).toLocaleString("en-IN") : "—"}
                      </p>
                    </div>
                    <Button
                      type="button"
                      disabled={loading}
                      onClick={onConfirmBooking}
                      className="w-full sm:w-auto rounded-full px-10 py-6 text-base font-bold gap-2"
                    >
                      {loading ? "Processing…" : (
                        <>
                          Confirm booking <ArrowUpRight className="w-5 h-5" strokeWidth={3} />
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
