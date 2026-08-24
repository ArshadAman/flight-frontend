"use client";

import { useMemo, useState } from "react";
import { X } from "lucide-react";
import type { BookingDraft } from "@/lib/booking";
import { occupiedSeatsForFlight, type OfflineSeatSelection } from "@/lib/sale/offlineBookFlow";
import { format, parseISO } from "date-fns";

const COLS = ["A", "B", "C", "", "D", "E", "F"];
const SEAT_COLS = ["A", "B", "C", "D", "E", "F"];

function formatLegDate(date?: string) {
  if (!date) return "—";
  try {
    return format(parseISO(date), "EEE, dd MMM yy");
  } catch {
    return date;
  }
}

export function OfflineSeatMapPanel({
  draft,
  selection,
  maxSeats,
  onChange,
  onClose,
  onContinue,
  busy,
}: {
  draft: BookingDraft;
  selection: OfflineSeatSelection;
  maxSeats: number;
  onChange: (next: OfflineSeatSelection) => void;
  onClose: () => void;
  onContinue: () => void;
  busy?: boolean;
}) {
  const flight = draft.outbound;
  const rows = 15;
  const occupied = useMemo(
    () => occupiedSeatsForFlight(flight.agent_flight_id || flight.id, maxSeats),
    [flight.agent_flight_id, flight.id, maxSeats]
  );
  const [error, setError] = useState<string | null>(null);

  const payingPax = selection.adults + selection.children;
  const maxPaying = Math.max(1, maxSeats);

  const toggleSeat = (seatId: string) => {
    if (occupied.has(seatId)) return;
    setError(null);
    const has = selection.selectedSeats.includes(seatId);
    if (has) {
      onChange({ ...selection, selectedSeats: selection.selectedSeats.filter((s) => s !== seatId) });
      return;
    }
    if (selection.selectedSeats.length >= payingPax) {
      setError(`Select up to ${payingPax} seat${payingPax !== 1 ? "s" : ""} for paying passengers.`);
      return;
    }
    onChange({ ...selection, selectedSeats: [...selection.selectedSeats, seatId] });
  };

  const setCount = (field: "adults" | "children" | "infants", delta: number) => {
    setError(null);
    const next = { ...selection, [field]: Math.max(field === "adults" ? 1 : 0, selection[field] + delta) };
    const totalPaying = next.adults + next.children;
    if (totalPaying > maxPaying) {
      setError(`Only ${maxPaying} seat${maxPaying !== 1 ? "s" : ""} available.`);
      return;
    }
    if (next.selectedSeats.length > totalPaying) {
      next.selectedSeats = next.selectedSeats.slice(0, totalPaying);
    }
    onChange(next);
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/50 backdrop-blur-[2px]">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[920px] max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="bg-rose-50 border-b border-rose-100 px-6 py-4 flex items-start justify-between gap-4 shrink-0">
          <div>
            <h2 className="text-[#D60D26] font-black text-[18px]">Available seat maps</h2>
            <p className="text-[12px] text-slate-500 mt-1 max-w-xl">
              For informational purpose only. Seats can be booked later in the booking process after passenger
              data have been entered.
            </p>
          </div>
          <button type="button" onClick={onClose} className="p-1 rounded-full hover:bg-white/80">
            <X className="w-5 h-5 text-slate-600" />
          </button>
        </div>

        <div className="px-6 py-3 bg-slate-50 border-b border-slate-100 text-[12px] font-bold text-slate-600 flex flex-wrap gap-x-4 gap-y-1 shrink-0">
          <span>{flight.id}</span>
          <span>{formatLegDate(draft.departureDate)}</span>
          <span>
            {draft.origin} → {draft.destination}
          </span>
          <span>{flight.cabin_class || draft.cabin}</span>
          <span>
            {flight.departureTime} - {flight.arrivalTime}
          </span>
          <span>{flight.duration}</span>
        </div>

        <div className="px-6 py-3 flex flex-wrap items-center gap-6 text-[12px] font-bold text-slate-600 border-b border-slate-100 shrink-0">
          <span className="flex items-center gap-2">
            <span className="w-5 h-5 border border-slate-300 rounded flex items-center justify-center text-[10px] text-slate-400">
              ×
            </span>
            Occupied
          </span>
          <span className="flex items-center gap-2">
            <span className="w-5 h-5 border-2 border-[#D60D26] rounded bg-white" />
            Available, charges applies
          </span>
          <span className="flex items-center gap-2">
            <span className="w-5 h-5 border-2 border-emerald-500 bg-emerald-50 rounded" />
            Selected
          </span>
        </div>

        <div className="px-6 py-4 flex flex-wrap gap-4 border-b border-slate-100 shrink-0">
          {(
            [
              ["adults", "Adults", selection.adults, 1] as const,
              ["children", "Children", selection.children, 0] as const,
              ["infants", "Infants", selection.infants, 0] as const,
            ] as const
          ).map(([key, label, value, min]) => (
            <div key={key} className="flex items-center gap-2">
              <span className="text-[12px] font-bold text-slate-600 w-16">{label}</span>
              <button
                type="button"
                onClick={() => setCount(key, -1)}
                disabled={value <= min}
                className="w-8 h-8 rounded-full border border-slate-200 font-bold disabled:opacity-40"
              >
                −
              </button>
              <span className="w-6 text-center font-bold">{value}</span>
              <button
                type="button"
                onClick={() => setCount(key, 1)}
                className="w-8 h-8 rounded-full border border-slate-200 font-bold"
              >
                +
              </button>
            </div>
          ))}
          <span className="text-[12px] text-slate-400 self-center ml-auto">
            {maxPaying} seat{maxPaying !== 1 ? "s" : ""} available
          </span>
        </div>

        <div className="flex-1 overflow-auto px-6 py-6">
          <div className="min-w-[640px] mx-auto">
            <div className="grid grid-cols-[repeat(7,minmax(0,1fr))] gap-2 mb-3 text-center text-[11px] font-bold text-slate-400">
              <div />
              {COLS.map((c) => (
                <div key={c || "aisle"}>{c}</div>
              ))}
            </div>
            {Array.from({ length: rows }, (_, i) => i + 1).map((row) => (
              <div key={row} className="relative">
                {row === 8 && (
                  <div className="absolute -left-2 top-1/2 -translate-y-1/2 text-[10px] font-black text-[#D60D26]">
                    EXIT
                  </div>
                )}
                {row === 8 && (
                  <div className="absolute -right-2 top-1/2 -translate-y-1/2 text-[10px] font-black text-[#D60D26]">
                    EXIT
                  </div>
                )}
                <div className="grid grid-cols-[repeat(7,minmax(0,1fr))] gap-2 mb-2 items-center">
                  <div className="text-[11px] font-bold text-slate-400 text-center">{row}</div>
                  {SEAT_COLS.map((col, idx) => {
                    const seatId = `${row}${col}`;
                    const isOccupied = occupied.has(seatId);
                    const isSelected = selection.selectedSeats.includes(seatId);
                    return (
                      <button
                        key={seatId}
                        type="button"
                        disabled={isOccupied}
                        onClick={() => toggleSeat(seatId)}
                        className={`h-8 rounded border text-[10px] font-bold transition-colors ${
                          isOccupied
                            ? "border-slate-200 bg-slate-100 text-slate-300 cursor-not-allowed"
                            : isSelected
                              ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                              : "border-slate-300 bg-white hover:border-[#D60D26]"
                        } ${idx === 2 ? "mr-4" : ""}`}
                      >
                        {isOccupied ? "×" : col}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {error && (
          <p className="px-6 text-sm text-rose-600 font-medium shrink-0">{error}</p>
        )}

        <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-3 shrink-0 bg-slate-50">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-slate-200 px-6 py-2.5 text-sm font-bold text-slate-600 hover:bg-white"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={onContinue}
            className="rounded-full bg-[#D60D26] hover:bg-[#30060F] text-white px-8 py-2.5 text-sm font-bold disabled:opacity-50"
          >
            {busy ? "Saving…" : "Continue to passenger details"}
          </button>
        </div>
      </div>
    </div>
  );
}
