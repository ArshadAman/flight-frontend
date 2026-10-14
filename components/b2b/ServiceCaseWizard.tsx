"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Check } from "lucide-react";
import { B2BNavbar } from "@/components/B2BNavbar";
import { Footer } from "@/components/Footer";
import { BookingSubnav } from "@/components/b2b/BookingSubnav";
import {
  fetchGroupBookings,
  submitServiceCase,
  type GroupBookingRow,
} from "@/lib/b2b/groupBookings";

const REBOOK_STEPS = [
  { id: 1, label: "Booking" },
  { id: 2, label: "Tickets" },
  { id: 3, label: "Reason" },
  { id: 4, label: "Details" },
  { id: 5, label: "Request/order" },
];

const REFUND_STEPS = [
  { id: 1, label: "Booking" },
  { id: 2, label: "Tickets" },
  { id: 3, label: "Type" },
  { id: 4, label: "Payment" },
  { id: 5, label: "Summary" },
];

const REFUND_TYPES = [
  "Refund due to flight cancellation/time change",
  "Refund with airline cancellation fee",
  "Refund without airline cancellation fee",
  "Tax Refund",
  "Partial Refund",
  "Goodwill Refund",
];

function fieldClass() {
  return "w-full rounded-[10px] border border-slate-300 bg-white px-4 py-3 text-[15px] outline-none focus:border-[#D60D26]";
}

export function ServiceCaseWizard({ kind }: { kind: "REBOOK" | "REFUND" }) {
  const steps = kind === "REBOOK" ? REBOOK_STEPS : REFUND_STEPS;
  const [bookings, setBookings] = useState<GroupBookingRow[]>([]);
  const [step, setStep] = useState(1);
  const [done, setDone] = useState(false);
  const [pnr, setPnr] = useState("");
  const [booking, setBooking] = useState<GroupBookingRow | null>(null);
  const [tickets, setTickets] = useState(["", "", "", ""]);
  const [noNumbers, setNoNumbers] = useState(false);
  const [reason, setReason] = useState(kind === "REBOOK" ? "Volunteer rebooking" : REFUND_TYPES[0]);
  const [comment, setComment] = useState("");
  const [flightNote, setFlightNote] = useState("");
  const [quoteMe, setQuoteMe] = useState(false);
  const [expected, setExpected] = useState("");
  const [extra, setExtra] = useState("");
  const [payBy, setPayBy] = useState("Total by invoice");
  const [refundPay, setRefundPay] = useState("Refund back to credit card");
  const [refundAmount, setRefundAmount] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [caseId, setCaseId] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    fetchGroupBookings().then(setBookings);
  }, []);

  const subtitle = useMemo(() => {
    if (!booking) return "";
    return booking.pnr_number || booking.request_id;
  }, [booking]);

  const findBooking = () => {
    const key = pnr.trim().toUpperCase();
    return bookings.find((row) =>
      [row.pnr_number, row.request_id].some((value) => (value || "").toUpperCase() === key)
    ) || null;
  };

  const continueStep = async () => {
    setError("");
    if (step === 1) {
      const match = findBooking();
      if (!match) {
        setError("No group booking matches that filekey or request id.");
        return;
      }
      setBooking(match);
      const numbers = (match.passengers || []).slice(0, 4).map((pax) => pax.passport_number || "");
      setTickets([numbers[0] || "", numbers[1] || "", numbers[2] || "", numbers[3] || ""]);
    }
    if (step === 5) {
      if (!booking) return;
      setBusy(true);
      const result = await submitServiceCase(booking.id, kind, {
        pnr: booking.pnr_number || pnr,
        request_id: booking.request_id,
        tickets: noNumbers ? "" : tickets.filter(Boolean).join(", "),
        no_ticket_numbers: noNumbers ? "yes" : "no",
        reason,
        comment,
        flight_note: flightNote,
        quote_requested: quoteMe ? "yes" : "no",
        expected_costs: expected,
        extra_costs: extra,
        payment: kind === "REBOOK" ? payBy : refundPay,
        refund_amount: refundAmount,
        message,
      });
      setBusy(false);
      if (!result.ok) {
        setError(result.detail || "Could not save this request.");
        return;
      }
      setCaseId(result.caseId || "");
      setDone(true);
      return;
    }
    setStep((value) => Math.min(value + 1, 5));
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <B2BNavbar />
      <BookingSubnav />
      <main className="flex-1 bg-[#F2FBFF]">
        <div className="container mx-auto max-w-5xl px-4 py-8">
          <p className="mb-6 text-center text-sm text-slate-600">
            {kind === "REBOOK"
              ? "Your customers would like to rebook? Tell us the expected airline costs and we will place the rebooking."
              : "Submit a refund against a group booking. We will process it from the filekey you enter."}
          </p>
          <div className="mb-8 flex items-start justify-between gap-2">
            {steps.map((item) => {
              const active = item.id === step;
              const complete = item.id < step || done;
              return (
                <div key={item.id} className="flex min-w-[88px] flex-1 flex-col items-center">
                  <div className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold ${active || complete ? "bg-[#D60D26] text-white" : "bg-white text-slate-400 border border-slate-200"}`}>
                    {item.id}
                  </div>
                  <p className={`mt-2 text-center text-sm font-bold ${active ? "text-[#121121]" : "text-slate-400"}`}>{item.label}</p>
                  {item.id === 1 && subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
                  {active && <div className="mt-2 h-[3px] w-16 rounded-full bg-[#D60D26]" />}
                </div>
              );
            })}
          </div>

          <div className="mx-auto max-w-3xl">
            {done && kind === "REBOOK" && (
              <div className="rounded-2xl bg-white p-8 text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                  <Check />
                </div>
                <p className="text-lg font-bold text-emerald-700">Ticket change request submitted</p>
                <p className="mt-3 text-slate-600">You have successfully submitted your ticket change request. We will process it as soon as possible.</p>
                <p className="mt-2 text-sm text-slate-500">Case {caseId}</p>
                <button type="button" className="mt-6 font-bold text-[#D60D26]" onClick={() => { setDone(false); setStep(1); setPnr(""); setBooking(null); }}>
                  Submit Another Rebooking Request <ArrowUpRight className="inline h-4 w-4" />
                </button>
              </div>
            )}
            {done && kind === "REFUND" && (
              <div className="rounded-2xl bg-white p-8 text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                  <Check />
                </div>
                <p className="text-lg font-bold text-emerald-700">Refund request submitted</p>
                <p className="mt-3 text-slate-600">You have successfully submitted your refund request. We will process it within the next 5 working days.</p>
                <p className="mt-2 text-sm text-slate-500">Case {caseId}. Active segments stay on the booking until the desk confirms the refund.</p>
                <button type="button" className="mt-6 font-bold text-[#D60D26]" onClick={() => { setDone(false); setStep(1); setPnr(""); setBooking(null); }}>
                  Submit Another Booking For Refund <ArrowUpRight className="inline h-4 w-4" />
                </button>
              </div>
            )}

            {!done && step === 1 && (
              <label className="block text-lg font-semibold text-[#121121]">
                Booking:
                <input value={pnr} onChange={(event) => setPnr(event.target.value)} placeholder="Filekey (PNR)" className={`${fieldClass()} mt-3`} />
              </label>
            )}

            {!done && step === 2 && (
              <div className="space-y-5">
                <p className="text-lg font-semibold">Ticket selection:</p>
                <div className="grid gap-4 sm:grid-cols-2">
                  {tickets.map((value, index) => (
                    <label key={index} className="text-sm font-semibold text-slate-600">
                      {index === 1 ? "Ticket Name" : "Ticket Number"}
                      <input
                        value={value}
                        onChange={(event) => setTickets((prev) => prev.map((item, i) => (i === index ? event.target.value : item)))}
                        className="mt-1 w-full border-b border-slate-300 bg-transparent py-2 outline-none"
                      />
                    </label>
                  ))}
                </div>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={noNumbers} onChange={(event) => setNoNumbers(event.target.checked)} />
                  The booking does not contain ticket numbers
                </label>
              </div>
            )}

            {!done && step === 3 && kind === "REBOOK" && (
              <div className="space-y-4">
                <p className="text-lg font-semibold">What is the reason for rebooking?</p>
                {["Volunteer rebooking", "Flight cancellation or change by the airline (INVOL)"].map((option) => (
                  <label key={option} className="flex items-center gap-2">
                    <input type="radio" checked={reason === option} onChange={() => setReason(option)} />
                    {option}
                  </label>
                ))}
                <textarea value={comment} onChange={(event) => setComment(event.target.value)} placeholder="Comment(optional)" className={`${fieldClass()} min-h-28`} />
              </div>
            )}

            {!done && step === 3 && kind === "REFUND" && (
              <div className="space-y-3">
                <p className="text-lg font-semibold">What is the refund type?</p>
                {REFUND_TYPES.map((option) => (
                  <label key={option} className="flex items-center gap-2">
                    <input type="radio" checked={reason === option} onChange={() => setReason(option)} />
                    {option}
                  </label>
                ))}
                <input value={flightNote} onChange={(event) => setFlightNote(event.target.value)} placeholder="Flight number and date of the flight in question" className={fieldClass()} />
              </div>
            )}

            {!done && step === 4 && kind === "REBOOK" && (
              <div className="space-y-4">
                <p className="text-lg font-semibold">What would you like to do?</p>
                <label className="flex items-center gap-2"><input type="radio" checked readOnly /> Rebook</label>
                <input value={flightNote} onChange={(event) => setFlightNote(event.target.value)} placeholder="Flight number and date of the flight in question" className={fieldClass()} />
              </div>
            )}

            {!done && step === 4 && kind === "REFUND" && (
              <div className="space-y-4">
                <p className="text-lg font-semibold">How should the payment be made?</p>
                {["Refund back to credit card", "Credit note"].map((option) => (
                  <label key={option} className="flex items-center gap-2">
                    <input type="radio" checked={refundPay === option} onChange={() => setRefundPay(option)} />
                    {option}
                  </label>
                ))}
                <input value={refundAmount} onChange={(event) => setRefundAmount(event.target.value)} placeholder="Refund amount" className={fieldClass()} />
              </div>
            )}

            {!done && step === 5 && kind === "REBOOK" && (
              <div className="grid gap-6 lg:grid-cols-[1fr_220px]">
                <div className="space-y-4">
                  <label className="flex items-start gap-2 text-sm">
                    <input type="checkbox" checked={quoteMe} onChange={(event) => setQuoteMe(event.target.checked)} className="mt-1" />
                    Please give me a quote, I can&apos;t figure out the airline cost.
                  </label>
                  <input value={expected} onChange={(event) => setExpected(event.target.value)} placeholder="Expected Costs" className={fieldClass()} />
                  <p className="text-xs text-slate-500">How much rebooking costs from the airline do you expect (airline fee + fare surcharge + tax surcharge)?</p>
                  <input value={extra} onChange={(event) => setExtra(event.target.value)} placeholder="Acceptable Extra Costs" className={fieldClass()} />
                  <p className="font-semibold">How should the costs be paid?</p>
                  {["Total by invoice", "Airline costs by credit card, fees by invoice", "Total by credit card"].map((option) => (
                    <label key={option} className="flex items-center gap-2 text-sm">
                      <input type="radio" checked={payBy === option} onChange={() => setPayBy(option)} />
                      {option}
                    </label>
                  ))}
                </div>
                <aside className="h-fit rounded-2xl bg-white p-4 text-sm">
                  <p className="mb-3 font-bold">Fees</p>
                  <p className="flex justify-between py-1"><span>Expected costs</span><span>{expected || "?"}</span></p>
                  <p className="flex justify-between py-1"><span>Consolidator fee</span><span>?</span></p>
                  <p className="flex justify-between border-t py-2 font-bold"><span>Total</span><span>{expected || "?"}</span></p>
                </aside>
              </div>
            )}

            {!done && step === 5 && kind === "REFUND" && (
              <div className="space-y-4">
                <h3 className="text-lg font-bold">Summary</h3>
                <p><span className="font-semibold">Booking code:</span> {booking?.pnr_number || booking?.request_id}</p>
                <p><span className="font-semibold">Type:</span> {reason}</p>
                <p><span className="font-semibold">Payment:</span> {refundPay} {refundAmount && `· ${refundAmount}`}</p>
                <textarea value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Message" className={`${fieldClass()} min-h-28`} />
              </div>
            )}

            {error && <p className="mt-4 text-sm font-semibold text-[#D60D26]">{error}</p>}

            {!done && (
              <button type="button" disabled={busy} onClick={continueStep} className="mt-8 inline-flex items-center gap-1 rounded-full bg-[#D60D26] px-6 py-2.5 font-bold text-white disabled:opacity-60">
                {busy ? "Saving…" : step === 5 ? (kind === "REBOOK" ? "Request Rebooking" : "Submit") : "Continue"}
                <ArrowUpRight className="h-4 w-4" />
              </button>
            )}
            {!done && step > 1 && (
              <button type="button" onClick={() => setStep((value) => value - 1)} className="ml-3 text-sm font-semibold text-slate-500">
                Back
              </button>
            )}
            {booking && !done && (
              <p className="mt-4 text-xs text-slate-500">
                Linked to {booking.request_id}. <Link href="/b2b/group-travel/view-request" className="text-[#D60D26]">Open group requests</Link>
              </p>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
