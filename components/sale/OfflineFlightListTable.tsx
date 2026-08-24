"use client";

import { ArrowRight, MoreVertical } from "lucide-react";
import {
  formatFareInr,
  formatFarePortal,
  formatShortDate,
  formatTimeRange,
  flightNumberLabel,
  groupInventoryByMonth,
  groupPnrFromId,
  listingStatus,
  seatStats,
  stopCount,
  type OfflineInventoryRow,
} from "@/lib/sale/offlinePortal";
import { SeatAccounting } from "@/components/sale/SeatAccounting";

export function OfflineFlightListTable({
  rows,
  variant = "flight",
  selectedId,
  onSelect,
  bookedByInventory,
  seatDisplay = "full",
  fareFormat = "portal",
}: {
  rows: OfflineInventoryRow[];
  variant?: "flight" | "inventory";
  selectedId?: string | null;
  onSelect?: (row: OfflineInventoryRow) => void;
  bookedByInventory: Map<string, number>;
  seatDisplay?: "full" | "compact";
  fareFormat?: "portal" | "inr";
}) {
  const groups = groupInventoryByMonth(rows);

  const gridCols =
    variant === "inventory"
      ? "grid-cols-[1fr_1.2fr_1fr_1fr_1fr_1.2fr_1fr_1fr_auto]"
      : "grid-cols-7";

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mb-8">
      <div className="overflow-x-auto">
        <div className="w-full min-w-[1000px]">
          <div
            className={`hidden md:grid ${gridCols} gap-4 px-6 py-4 border-b border-slate-100 bg-white text-slate-400 text-[13px] font-bold`}
          >
            {variant === "inventory" && <div>Group PNR</div>}
            <div>Route</div>
            <div>{variant === "inventory" ? "Departure Date" : "Date"}</div>
            <div>Dep. &amp; Arr. Time</div>
            <div>Flight number</div>
            <div>Number of seats</div>
            <div>Ticket fare</div>
            <div>Status</div>
            {variant === "inventory" && <div className="w-5" />}
          </div>

          {groups.map(([month, monthRows]) => (
            <div key={month}>
              <div className="bg-[#F2FBFF] px-6 py-3 font-bold text-slate-700 text-[14px]">{month}</div>
              {monthRows.map((row) => {
                const booked = bookedByInventory.get(String(row.id)) || 0;
                const stats = seatStats(row, booked);
                const status = listingStatus(row, booked);
                const stops = stopCount(row);
                const isSelected = selectedId === row.id;

                return (
                  <div
                    key={row.id}
                    onClick={() => onSelect?.(row)}
                    className={`hidden md:grid ${gridCols} gap-4 items-center py-4 px-6 border-b border-slate-100 text-[13px] font-medium cursor-pointer transition-colors ${
                      isSelected
                        ? "bg-rose-50 border-l-2 border-l-[#D60D26]"
                        : "text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    {variant === "inventory" && (
                      <div className="font-bold text-slate-800">{groupPnrFromId(row.id)}</div>
                    )}
                    <div className="flex items-center gap-2">
                      <span className="font-bold">{row.origin}</span>
                      <ArrowRight className="w-3 h-3 text-slate-400" />
                      <span className="font-bold">{row.destination}</span>
                      <span className="text-slate-400 text-[12px]">({stops} Stops)</span>
                    </div>
                    <div>{formatShortDate(row.departure_datetime)}</div>
                    <div>{formatTimeRange(row.departure_datetime, row.arrival_datetime)}</div>
                    <div className="font-bold">{flightNumberLabel(row)}</div>
                    <SeatAccounting
                      compact={seatDisplay === "compact"}
                      total={stats.total}
                      held={stats.held}
                      available={stats.available}
                    />
                    <div className="font-bold">
                      {fareFormat === "inr" ? formatFareInr(row.price) : formatFarePortal(row.price)}
                    </div>
                    <div>
                      <span
                        className={`px-4 py-1.5 rounded-full text-[12px] font-bold border ${
                          status === "Closed"
                            ? "bg-slate-100 text-slate-500 border-slate-200"
                            : "bg-green-50 text-emerald-600 border-green-200"
                        }`}
                      >
                        {status}
                      </span>
                    </div>
                    {variant === "inventory" && (
                      <div className="text-slate-400 flex justify-end">
                        <MoreVertical className="w-5 h-5" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}

          {rows.length === 0 && (
            <div className="px-6 py-12 text-center text-slate-500 font-medium">No flights found.</div>
          )}
        </div>
      </div>

      <div className="px-6 py-4 flex items-center justify-between border-t border-slate-100 bg-white">
        <div className="text-slate-500 text-[13px]">
          <span className="font-bold text-slate-700">1-{Math.min(50, rows.length)}</span> on {rows.length} results
        </div>
        <div className="flex items-center gap-4">
          <button type="button" className="text-slate-400 font-bold text-[14px] cursor-not-allowed">
            Prev
          </button>
          <button
            type="button"
            className="text-slate-800 font-bold text-[14px] border border-slate-300 rounded-full px-6 py-1.5 hover:bg-slate-50 transition-colors"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
