"use client";

import { useEffect, useMemo, useState } from "react";
import { B2BNavbar } from "@/components/B2BNavbar";
import { Footer } from "@/components/Footer";
import {
  fetchGroupBookings,
  submitServiceCase,
  type GroupBookingRow,
} from "@/lib/b2b/groupBookings";

const REBOOK_STEPS = [
  "Select booking",
  "Reason",
  "New travel dates",
  "Passenger note",
  "Review",
  "Submitted",
];

const REFUND_STEPS = [
  "Select booking",
  "Reason",
  "Passengers",
  "Refund mode",
  "Review",
  "Submitted",
];

export function ServiceCaseWizard({ kind }: { kind: "REBOOK" | "REFUND" }) {
  const steps = kind === "REBOOK" ? REBOOK_STEPS : REFUND_STEPS;
  const title = kind === "REBOOK" ? "Re-Booking" : "Refund";
  const [bookings, setBookings] = useState<GroupBookingRow[]>([]);
  const [step, setStep] = useState(0);
  const [bookingId, setBookingId] = useState("");
  const [reason, setReason] = useState(kind === "REBOOK" ? "Date change" : "Passenger cancelled");
  const [newDate, setNewDate] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [note, setNote] = useState("");
  const [refundMode, setRefundMode] = useState("Wallet");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [caseId, setCaseId] = useState("");

  useEffect(() => {
    fetchGroupBookings().then(setBookings);
  }, []);

  const selected = useMemo(
    () => bookings.find((row) => row.id === bookingId),
    [bookings, bookingId]
  );

  const priorCases = (selected?.service_cases || []).filter((row) => row.kind === kind);

  const next = async () => {
    setError("");
    if (step === 0 && !bookingId) {
      setError("Choose a group booking.");
      return;
    }
    if (step === 4) {
      setBusy(true);
      const result = await submitServiceCase(bookingId, kind, {
        reason,
        new_departure: newDate,
        new_return: returnDate,
        note,
        refund_mode: kind === "REFUND" ? refundMode : "",
        request_id: selected?.request_id || "",
        pnr: selected?.pnr_number || "",
      });
      setBusy(false);
      if (!result.ok) {
        setError(result.detail || "Save failed.");
        return;
      }
      setCaseId(result.caseId || "");
    }
    setStep((value) => Math.min(value + 1, steps.length - 1));
  };

  return (
    <div className="min-h-screen bg-[#F2FBFF] flex flex-col">
      <B2BNavbar />
      <main className="flex-1 container mx-auto px-4 sm:px-8 py-8 max-w-3xl">
        <h1 className="text-[28px] font-extrabold text-[#0C2342]">{title}</h1>
        <p className="text-slate-500 mt-1 mb-6">Step {step + 1} of {steps.length} — {steps[step]}</p>
        <div className="flex gap-2 mb-6">
          {steps.map((label, index) => (
            <div
              key={label}
              className={`h-1.5 flex-1 rounded-full ${index <= step ? "bg-[#D60D26]" : "bg-slate-200"}`}
              title={label}
            />
          ))}
        </div>

        <div className="bg-white rounded-3xl border border-slate-100 p-6 sm:p-8 shadow-sm space-y-5">
          {step === 0 && (
            <label className="block text-sm font-semibold text-slate-700">
              Group booking
              <select
                value={bookingId}
                onChange={(event) => setBookingId(event.target.value)}
                className="mt-2 w-full border border-slate-200 rounded-2xl px-4 py-3"
              >
                <option value="">Select a request</option>
                {bookings.map((row) => (
                  <option key={row.id} value={row.id}>
                    {row.request_id} · {row.origin}-{row.destination} · {row.status}
                  </option>
                ))}
              </select>
            </label>
          )}

          {step === 1 && (
            <label className="block text-sm font-semibold text-slate-700">
              Reason
              <select
                value={reason}
                onChange={(event) => setReason(event.target.value)}
                className="mt-2 w-full border border-slate-200 rounded-2xl px-4 py-3"
              >
                {(kind === "REBOOK"
                  ? ["Date change", "Airline change", "Name correction", "Schedule change"]
                  : ["Passenger cancelled", "Flight cancelled", "Duplicate booking", "Medical"]
                ).map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
            </label>
          )}

          {step === 2 && kind === "REBOOK" && (
            <div className="grid sm:grid-cols-2 gap-4">
              <label className="text-sm font-semibold text-slate-700">
                New departure
                <input type="date" value={newDate} onChange={(e) => setNewDate(e.target.value)} className="mt-2 w-full border border-slate-200 rounded-2xl px-4 py-3" />
              </label>
              <label className="text-sm font-semibold text-slate-700">
                New return
                <input type="date" value={returnDate} onChange={(e) => setReturnDate(e.target.value)} className="mt-2 w-full border border-slate-200 rounded-2xl px-4 py-3" />
              </label>
            </div>
          )}

          {step === 2 && kind === "REFUND" && (
            <label className="block text-sm font-semibold text-slate-700">
              Who should be refunded
              <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="All passengers, or list names" className="mt-2 w-full border border-slate-200 rounded-2xl px-4 py-3 min-h-28" />
            </label>
          )}

          {step === 3 && kind === "REBOOK" && (
            <label className="block text-sm font-semibold text-slate-700">
              Note for the airline desk
              <textarea value={note} onChange={(e) => setNote(e.target.value)} className="mt-2 w-full border border-slate-200 rounded-2xl px-4 py-3 min-h-28" />
            </label>
          )}

          {step === 3 && kind === "REFUND" && (
            <label className="block text-sm font-semibold text-slate-700">
              Refund mode
              <select value={refundMode} onChange={(e) => setRefundMode(e.target.value)} className="mt-2 w-full border border-slate-200 rounded-2xl px-4 py-3">
                <option>Wallet</option>
                <option>Original payment</option>
                <option>Bank transfer</option>
              </select>
            </label>
          )}

          {step === 4 && selected && (
            <dl className="grid grid-cols-2 gap-3 text-sm">
              <div><dt className="text-slate-400">Request</dt><dd className="font-bold">{selected.request_id}</dd></div>
              <div><dt className="text-slate-400">Route</dt><dd className="font-bold">{selected.origin} → {selected.destination}</dd></div>
              <div><dt className="text-slate-400">Reason</dt><dd className="font-bold">{reason}</dd></div>
              <div><dt className="text-slate-400">PNR</dt><dd className="font-bold">{selected.pnr_number || "—"}</dd></div>
              {kind === "REBOOK" && <div><dt className="text-slate-400">New date</dt><dd className="font-bold">{newDate || "—"}</dd></div>}
              {kind === "REFUND" && <div><dt className="text-slate-400">Mode</dt><dd className="font-bold">{refundMode}</dd></div>}
              <div className="col-span-2"><dt className="text-slate-400">Note</dt><dd className="font-semibold">{note || "—"}</dd></div>
            </dl>
          )}

          {step === 5 && (
            <div>
              <p className="text-lg font-bold text-[#0C2342]">Request saved.</p>
              <p className="text-slate-600 mt-2">Case {caseId || "submitted"} is on the booking and visible to the desk.</p>
            </div>
          )}

          {priorCases.length > 0 && step === 0 && (
            <div className="text-sm text-slate-500">
              Earlier {title.toLowerCase()} cases: {priorCases.map((row) => row.case_id).join(", ")}
            </div>
          )}

          {error && <p className="text-sm font-semibold text-[#D60D26]">{error}</p>}

          <div className="flex gap-3 pt-2">
            {step > 0 && step < 5 && (
              <button type="button" onClick={() => setStep((value) => value - 1)} className="flex-1 border border-slate-200 rounded-full py-3 font-bold">
                Back
              </button>
            )}
            {step < 5 && (
              <button type="button" disabled={busy} onClick={next} className="flex-1 bg-[#D60D26] text-white rounded-full py-3 font-bold disabled:opacity-60">
                {busy ? "Saving…" : step === 4 ? "Submit" : "Continue"}
              </button>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
