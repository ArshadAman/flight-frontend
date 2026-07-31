"use client";

import React from "react";
import { Clock, PlaneTakeoff } from "lucide-react";
import { cn } from "@/lib/utils";
import type { FlightSegment, Layover } from "@/lib/journey";
import { layoversFromSegments, stopsLabel, viaAirports } from "@/lib/journey";

type JourneyLike = {
  stops?: number;
  segments?: FlightSegment[] | null;
  layovers?: Layover[] | null;
  via?: string[] | null;
};

function resolveVia(flight: JourneyLike): string[] {
  if (flight.via?.length) return flight.via;
  return viaAirports(flight.segments);
}

function resolveLayovers(flight: JourneyLike): Layover[] {
  if (flight.layovers?.length) return flight.layovers;
  return layoversFromSegments(flight.segments);
}

function resolveStops(flight: JourneyLike): number {
  if (typeof flight.stops === "number") return flight.stops;
  return Math.max(0, (flight.segments?.length || 1) - 1);
}

/** Inline "Non-stop" / "1 stop via CCU" label, optionally with layover durations. */
export function StopsSummary({
  flight,
  showLayoverTime = true,
  className,
}: {
  flight: JourneyLike;
  showLayoverTime?: boolean;
  className?: string;
}) {
  const stops = resolveStops(flight);
  const via = resolveVia(flight);
  const layovers = resolveLayovers(flight);
  const timings = layovers.map((l) => l.label).filter(Boolean);

  return (
    <span className={cn("inline-flex flex-col", className)}>
      <span>{stopsLabel(stops, via)}</span>
      {showLayoverTime && stops > 0 && timings.length > 0 && (
        <span className="text-[11px] font-semibold text-slate-400">
          Layover {timings.join(" + ")}
        </span>
      )}
    </span>
  );
}

/** Compact one-line variant for dense tables and cards. */
export function StopsInline({ flight, className }: { flight: JourneyLike; className?: string }) {
  const stops = resolveStops(flight);
  const layovers = resolveLayovers(flight);
  const timings = layovers.map((l) => l.label).filter(Boolean);
  const base = stopsLabel(stops, resolveVia(flight));

  return (
    <span className={className}>
      {base}
      {stops > 0 && timings.length > 0 ? ` · layover ${timings.join(" + ")}` : ""}
    </span>
  );
}

function SegmentRow({ segment }: { segment: FlightSegment }) {
  const terminalFrom = segment.origin_terminal ? ` T${segment.origin_terminal}` : "";
  const terminalTo = segment.destination_terminal ? ` T${segment.destination_terminal}` : "";

  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 py-2">
      <span className="flex items-center gap-1.5 text-[12px] font-bold text-slate-700 min-w-[120px]">
        <PlaneTakeoff className="h-3.5 w-3.5 text-slate-400" strokeWidth={2.5} />
        {segment.airline_name || segment.airline_code || "Flight"}
        {segment.flight_number ? ` ${segment.flight_number}` : ""}
      </span>
      <span className="text-[12px] font-bold text-slate-900">
        {segment.origin}
        {terminalFrom} → {segment.destination}
        {terminalTo}
      </span>
      <span className="text-[12px] font-semibold text-slate-600">
        {segment.departureTime || "—"} – {segment.arrivalTime || "—"}
      </span>
      {segment.duration && (
        <span className="text-[12px] font-semibold text-slate-400">{segment.duration}</span>
      )}
    </div>
  );
}

/** Per-leg breakdown with a layover divider between connecting segments. */
export function SegmentTimeline({
  flight,
  className,
  emptyLabel = "Non-stop flight — no connections.",
}: {
  flight: JourneyLike;
  className?: string;
  emptyLabel?: string;
}) {
  const segments = flight.segments || [];
  const layovers = resolveLayovers(flight);

  if (segments.length < 2) {
    return (
      <div className={cn("text-[12px] font-semibold text-slate-500", className)}>
        {segments.length === 1 ? <SegmentRow segment={segments[0]} /> : emptyLabel}
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col divide-y divide-slate-100", className)}>
      {segments.map((segment, idx) => (
        <React.Fragment key={`${segment.origin}-${segment.destination}-${idx}`}>
          <SegmentRow segment={segment} />
          {idx < segments.length - 1 && layovers[idx] && (
            <div className="flex items-center gap-2 bg-amber-50/70 px-3 py-1.5 text-[11px] font-bold text-amber-700">
              <Clock className="h-3.5 w-3.5" strokeWidth={2.5} />
              Layover {layovers[idx].label || "—"} at {layovers[idx].airport}
              {layovers[idx].city ? ` (${layovers[idx].city})` : ""}
            </div>
          )}
        </React.Fragment>
      ))}
    </div>
  );
}
