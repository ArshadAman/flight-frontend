import { Fragment } from "react";
import { Armchair, Clock, Coffee, Luggage, Plane } from "lucide-react";
import {
  formatCityLabel,
  layoversFromSegments,
  normalizeSegments,
  stopsLabel,
  viaAirports,
  type FlightSegment,
} from "@/lib/journey";

function formatDate(iso?: string): string {
  if (!iso) return "—";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "2-digit",
  });
}

function fallbackSegment(ticket?: any): FlightSegment {
  return {
    airline_code: ticket?.airline_code || "AI",
    airline_name: ticket?.airline_name || "AIR INDIA",
    flight_number: ticket?.flight_number || "AI-2014",
    origin: ticket?.origin || "DEL",
    destination: ticket?.destination || "BOM",
    origin_city: ticket?.origin_city,
    destination_city: ticket?.destination_city,
    origin_terminal: ticket?.origin_terminal,
    destination_terminal: ticket?.destination_terminal,
    departure_iso: ticket?.departure_datetime,
    arrival_iso: ticket?.arrival_datetime,
    departureTime: ticket?.departure_display || "23:00",
    arrivalTime: ticket?.arrival_display || "11:45",
    duration: ticket?.duration || "3h 55m",
  };
}

function getTicketSegments(ticket?: any): FlightSegment[] {
  const candidates = [
    ticket?.segments_data,
    ticket?.flight_snapshot?.segments,
    ticket?.segments,
  ];
  const normalized = candidates
    .map((candidate) => normalizeSegments(candidate))
    .filter((candidate) => candidate.length > 0)
    .sort((a, b) => b.length - a.length);
  return normalized[0] || [fallbackSegment(ticket)];
}

export function ItineraryDetails({ ticket }: { ticket?: any }) {
  const segments = getTicketSegments(ticket);
  const layovers = layoversFromSegments(segments);
  const stops = Math.max(0, segments.length - 1);
  const via = viaAirports(segments);
  const origin = segments[0]?.origin || ticket?.origin || "DEL";
  const destination =
    segments[segments.length - 1]?.destination || ticket?.destination || "BOM";
  const totalDuration = ticket?.duration || ticket?.flight_snapshot?.duration;
  const cabinClass = ticket?.cabin_class || "Economy";

  return (
    <>
      <div className="mt-2 flex w-full flex-wrap items-center justify-between gap-2 border-b border-gray-200 bg-[#F2FBFF] px-8 py-3.5">
        <h3 className="text-[17px] font-[750] tracking-tight text-[#0C2342]">
          Itinerary details:
        </h3>
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-white px-3 py-1 text-[12px] font-[800] text-[#0C2342] shadow-sm">
            {stopsLabel(stops, via)}
          </span>
          {layovers.map((layover, index) => (
            <span
              key={`${layover.airport}-${index}`}
              className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1 text-[12px] font-[800] text-amber-700"
            >
              <Clock className="h-3.5 w-3.5" />
              {layover.label ? `${layover.label} layover` : "Layover"} at {layover.airport}
            </span>
          ))}
        </div>
      </div>

      <div className="w-full overflow-x-auto">
        <table className="w-full min-w-[980px] text-left">
          <thead>
            <tr>
              {[
                "Airline",
                "Flight Number",
                "Departure Date",
                "From",
                "To",
                "Time",
                "Duration",
                "Type",
                "Services",
              ].map((heading, index) => (
                <th
                  key={heading}
                  className={`pb-2 pt-6 text-[15px] font-[700] text-gray-400 ${
                    index === 0 ? "px-8" : index === 8 ? "px-8" : "px-2"
                  }`}
                >
                  {heading}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {segments.map((segment, index) => {
              const airlineCode = segment.airline_code || ticket?.airline_code || "AI";
              const airlineName =
                segment.airline_name || ticket?.airline_name || airlineCode;
              return (
                <Fragment key={`${segment.origin}-${segment.destination}-${index}`}>
                  <tr className="border-t border-gray-100 first:border-t-0">
                    <td className="px-8 py-4">
                      <div className="flex items-center gap-2">
                        <div className="flex h-7 w-7 items-center justify-center rounded bg-[#D60D26] text-[11px] font-[900] leading-none tracking-tighter text-white shadow-sm">
                          {airlineCode}
                        </div>
                        <span className="text-[15px] font-[800] text-[#D60D26]">
                          {String(airlineName).toUpperCase()}
                        </span>
                      </div>
                    </td>
                    <td className="px-2 py-4 text-[15px] font-[700] text-gray-700">
                      {segment.flight_number || ticket?.flight_number || "—"}
                    </td>
                    <td className="px-2 py-4 text-[15px] font-[700] text-gray-700">
                      {formatDate(segment.departure_iso)}
                    </td>
                    <td className="px-2 py-4 text-[15px] font-[700] text-gray-700">
                      {segment.origin}
                      {segment.origin_terminal ? ` (T${segment.origin_terminal})` : ""}
                    </td>
                    <td className="px-2 py-4 text-[15px] font-[700] text-gray-700">
                      {segment.destination}
                      {segment.destination_terminal ? ` (T${segment.destination_terminal})` : ""}
                    </td>
                    <td className="px-2 py-4 text-[15px] font-[700] text-gray-700">
                      {segment.departureTime || "—"} – {segment.arrivalTime || "—"}
                    </td>
                    <td className="px-2 py-4 text-[15px] font-[700] text-gray-700">
                      {segment.duration || "—"}
                    </td>
                    <td className="px-2 py-4 text-[15px] font-[700] text-gray-700">
                      {cabinClass}
                    </td>
                    <td className="flex items-center gap-2 px-8 py-4 text-[16px] font-[700] text-gray-400">
                      <Luggage className="h-4 w-4" />
                      <Armchair className="h-4 w-4" />
                      <Coffee className="h-4 w-4" />
                    </td>
                  </tr>
                  {index < segments.length - 1 && layovers[index] && (
                    <tr className="bg-amber-50/70">
                      <td
                        colSpan={9}
                        className="px-8 py-2 text-[13px] font-[800] text-amber-700"
                      >
                        <span className="inline-flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          Layover {layovers[index].label || "—"} at{" "}
                          {layovers[index].airport}
                          {layovers[index].city ? ` (${layovers[index].city})` : ""}
                        </span>
                      </td>
                    </tr>
                  )}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="mx-8 my-6 rounded-2xl border border-gray-100 bg-white p-6 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-[19px] font-[800] tracking-tight text-[#121121]">
              {formatCityLabel(segments[0]?.origin_city) || origin}, {origin}
            </p>
            <p className="mt-1 text-[14px] font-[600] text-gray-400">
              {segments[0]?.departureTime || "—"}
            </p>
          </div>

          <div className="flex min-w-[220px] flex-1 flex-col items-center text-center">
            <div className="flex w-full items-center">
              <div className="h-2.5 w-2.5 rounded-full border-2 border-gray-400 bg-white" />
              <div className="flex-1 border-t-2 border-dashed border-gray-300" />
              {via.map((airport) => (
                <Fragment key={airport}>
                  <div className="flex h-7 min-w-10 items-center justify-center rounded-full bg-amber-100 px-2 text-[11px] font-[900] text-amber-700">
                    {airport}
                  </div>
                  <div className="flex-1 border-t-2 border-dashed border-gray-300" />
                </Fragment>
              ))}
              <Plane className="mx-2 h-6 w-6 rotate-90 text-gray-400" />
              <div className="h-2.5 w-2.5 rounded-full bg-gray-800" />
            </div>
            <p className="mt-3 text-[13px] font-[800] text-gray-600">
              {stopsLabel(stops, via)}
              {totalDuration ? ` · ${totalDuration}` : ""}
            </p>
            {layovers.length > 0 && (
              <p className="mt-1 text-[12px] font-[700] text-amber-700">
                {layovers
                  .map((layover) =>
                    `${layover.label || "—"} layover at ${layover.airport}`
                  )
                  .join(" · ")}
              </p>
            )}
          </div>

          <div className="text-right">
            <p className="text-[19px] font-[800] tracking-tight text-[#121121]">
              {formatCityLabel(segments[segments.length - 1]?.destination_city) ||
                destination}
              , {destination}
            </p>
            <p className="mt-1 text-[14px] font-[600] text-gray-400">
              {segments[segments.length - 1]?.arrivalTime || "—"}
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
