"use client";

import { format, parseISO } from "date-fns";
import {
  ArrowRight,
  Calendar,
  CheckCircle2,
  Copy,
  Home,
  Mail,
  Plane,
  Search,
  Ticket,
  Users,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { BookingDraft } from "@/lib/booking";
import type { Flight } from "@/lib/flight";

function formatLegDate(date?: string) {
  if (!date) return "—";
  try {
    return format(parseISO(date), "EEE, d MMM yyyy");
  } catch {
    return date;
  }
}

function FlightLegSummary({
  label,
  flight,
  date,
}: {
  label: string;
  flight: Flight;
  date?: string;
}) {
  const code = flight.airline_code || flight.id.split("-")[0];
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-3 py-4 border-b border-dashed border-slate-200 last:border-0">
      <div className="shrink-0">
        <span className="text-[10px] font-black uppercase tracking-widest text-primary">{label}</span>
        <p className="text-xs text-muted-foreground mt-0.5">{formatLegDate(date || flight.travel_date)}</p>
      </div>
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <img
          src={`/airlines/${code}.png`}
          alt=""
          className="h-9 w-9 object-contain shrink-0"
          onError={(e) => {
            e.currentTarget.style.display = "none";
          }}
        />
        <div className="min-w-0">
          <p className="font-bold text-foreground text-sm truncate">{flight.airline}</p>
          <p className="text-xs text-muted-foreground">{flight.id}</p>
        </div>
      </div>
      <div className="text-sm font-semibold text-foreground shrink-0">
        {flight.departureTime} – {flight.arrivalTime}
      </div>
      <div className="text-xs font-medium text-muted-foreground shrink-0 hidden md:block">
        {flight.stops === 0 ? "Non-stop" : `${flight.stops} stop(s)`}
      </div>
    </div>
  );
}

type Props = {
  draft: BookingDraft;
  pnrs: string[];
  totalAmount?: number;
  contactEmail?: string;
  onViewBookings: () => void;
  onSearchAgain: () => void;
  onHome: () => void;
};

export function BookingConfirmation({
  draft,
  pnrs,
  totalAmount,
  contactEmail,
  onViewBookings,
  onSearchAgain,
  onHome,
}: Props) {
  const [copiedPnr, setCopiedPnr] = useState<string | null>(null);
  const travellerCount = draft.adults + draft.children + draft.infants;

  const copyPnr = async (pnr: string) => {
    try {
      await navigator.clipboard.writeText(pnr);
      setCopiedPnr(pnr);
      setTimeout(() => setCopiedPnr(null), 2000);
    } catch {
      /* ignore */
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-10 md:py-16 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Success hero */}
      <div className="text-center mb-8">
        <div className="relative inline-flex items-center justify-center mb-6">
          <div className="absolute inset-0 rounded-full bg-emerald-400/20 scale-150 animate-ping" />
          <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50 border-4 border-emerald-100 shadow-lg">
            <CheckCircle2 className="h-10 w-10 text-emerald-600" strokeWidth={2.5} />
          </div>
        </div>
        <h1 className="text-3xl md:text-4xl font-black text-foreground tracking-tight">
          Booking confirmed!
        </h1>
        <p className="mt-3 text-base text-muted-foreground max-w-md mx-auto leading-relaxed">
          {draft.tripType === "round-trip"
            ? "Your round-trip reservation is confirmed. Save your PNR below for check-in and support."
            : "Your flight is booked. Save your PNR below for check-in and support."}
        </p>
      </div>

      {/* Ticket card */}
      <div className="bg-white rounded-2xl border border-border shadow-xl overflow-hidden mb-6">
        <div className="bg-navy px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-white">
            <Plane className="h-5 w-5 shrink-0" />
            <span className="font-bold text-sm md:text-base">
              {draft.origin} <ArrowRight className="inline h-4 w-4 mx-1 opacity-80" /> {draft.destination}
            </span>
          </div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-white/70 bg-white/10 px-3 py-1 rounded-full shrink-0">
            {draft.tripType === "round-trip" ? "Round trip" : "One way"}
          </span>
        </div>

        <div className="px-6 py-2 divide-y divide-dashed divide-slate-200">
          <FlightLegSummary label="Outbound" flight={draft.outbound} date={draft.departureDate} />
          {draft.returnFlight && (
            <FlightLegSummary label="Return" flight={draft.returnFlight} date={draft.returnDate} />
          )}
        </div>

        <div className="bg-background px-6 py-4 flex flex-wrap gap-4 text-sm border-t border-border">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="h-4 w-4 shrink-0 text-primary" />
            <span className="font-medium">{formatLegDate(draft.departureDate)}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Users className="h-4 w-4 shrink-0 text-primary" />
            <span className="font-medium">
              {travellerCount} traveller{travellerCount !== 1 ? "s" : ""} · {draft.cabin}
            </span>
          </div>
          {totalAmount != null && totalAmount > 0 && (
            <div className="flex items-center gap-2 text-muted-foreground ml-auto">
              <span className="text-xs uppercase tracking-wide">Total paid</span>
              <span className="font-black text-foreground text-lg">
                ₹{totalAmount.toLocaleString("en-IN")}
              </span>
            </div>
          )}
        </div>

        {/* PNR block */}
        <div className="px-6 py-6 bg-gradient-to-br from-primary/5 to-background border-t border-border">
          <div className="flex items-center gap-2 mb-4">
            <Ticket className="h-5 w-5 text-primary" />
            <span className="text-sm font-bold text-foreground">
              {pnrs.length > 1 ? "Booking references" : "Booking reference"}
            </span>
          </div>
          <div className="space-y-3">
            {pnrs.map((pnr, idx) => (
              <div
                key={`${pnr}-${idx}`}
                className="flex items-center justify-between gap-4 bg-white border-2 border-primary/20 rounded-xl px-5 py-4 shadow-sm"
              >
                <div>
                  {pnrs.length > 1 && (
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">
                      PNR {idx + 1}
                    </p>
                  )}
                  <p className="text-2xl md:text-3xl font-black text-primary tracking-[0.2em] font-mono">
                    {pnr}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => copyPnr(pnr)}
                  className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-primary border border-slate-200 hover:border-primary/30 rounded-full px-3 py-2 transition-colors shrink-0"
                >
                  <Copy className="h-3.5 w-3.5" />
                  {copiedPnr === pnr ? "Copied!" : "Copy"}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {contactEmail && (
        <div className="flex items-start gap-3 bg-white border border-border rounded-xl px-5 py-4 mb-8 shadow-sm">
          <Mail className="h-5 w-5 text-primary shrink-0 mt-0.5" />
          <p className="text-sm text-muted-foreground leading-relaxed">
            A confirmation will be sent to{" "}
            <span className="font-bold text-foreground">{contactEmail}</span> when email delivery is
            enabled.
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Button
          type="button"
          onClick={onViewBookings}
          className="rounded-full h-12 px-8 font-bold text-base shadow-md"
        >
          View my bookings
        </Button>
        <Button
          type="button"
          variant="pill-outline"
          onClick={onSearchAgain}
          className="rounded-full h-12 px-8 font-bold text-base"
        >
          <Search className="h-4 w-4 mr-1" />
          Search flights
        </Button>
        <Button
          type="button"
          variant="ghost"
          onClick={onHome}
          className="rounded-full h-12 px-6 font-semibold text-muted-foreground"
        >
          <Home className="h-4 w-4 mr-1" />
          Home
        </Button>
      </div>
    </div>
  );
}
