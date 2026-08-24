"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";

export type OfflineFilters = {
  origin: string;
  destination: string;
  status: "all" | "open" | "closed";
};

export const emptyOfflineFilters: OfflineFilters = {
  origin: "",
  destination: "",
  status: "all",
};

export function OfflinePortalFiltersModal({
  open,
  onClose,
  value,
  onApply,
}: {
  open: boolean;
  onClose: () => void;
  value: OfflineFilters;
  onApply: (next: OfflineFilters) => void;
}) {
  const [draft, setDraft] = useState(value);

  useEffect(() => {
    if (open) setDraft(value);
  }, [open, value]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <h3 className="font-bold text-slate-800 text-[16px]">Filters</h3>
          <button type="button" onClick={onClose} className="rounded-full p-1 hover:bg-slate-100">
            <X className="w-5 h-5 text-slate-600" />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="text-[12px] font-bold text-slate-500 uppercase tracking-wide">Origin</label>
            <input
              value={draft.origin}
              onChange={(e) => setDraft((d) => ({ ...d, origin: e.target.value.toUpperCase() }))}
              placeholder="e.g. DEL"
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-[14px] font-semibold uppercase"
            />
          </div>
          <div>
            <label className="text-[12px] font-bold text-slate-500 uppercase tracking-wide">Destination</label>
            <input
              value={draft.destination}
              onChange={(e) => setDraft((d) => ({ ...d, destination: e.target.value.toUpperCase() }))}
              placeholder="e.g. MUM"
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-[14px] font-semibold uppercase"
            />
          </div>
          <div>
            <label className="text-[12px] font-bold text-slate-500 uppercase tracking-wide">Status</label>
            <select
              value={draft.status}
              onChange={(e) =>
                setDraft((d) => ({ ...d, status: e.target.value as OfflineFilters["status"] }))
              }
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-[14px] font-semibold"
            >
              <option value="all">All</option>
              <option value="open">Open</option>
              <option value="closed">Closed</option>
            </select>
          </div>
        </div>
        <div className="flex gap-3 border-t border-slate-100 px-6 py-4">
          <button
            type="button"
            onClick={() => {
              onApply(emptyOfflineFilters);
              onClose();
            }}
            className="flex-1 rounded-full border border-slate-200 py-2.5 text-[13px] font-bold text-slate-600"
          >
            Clear
          </button>
          <button
            type="button"
            onClick={() => {
              onApply(draft);
              onClose();
            }}
            className="flex-1 rounded-full bg-[#D60D26] py-2.5 text-[13px] font-bold text-white"
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
}

export function countActiveFilters(filters: OfflineFilters) {
  let n = 0;
  if (filters.origin.trim()) n += 1;
  if (filters.destination.trim()) n += 1;
  if (filters.status !== "all") n += 1;
  return n;
}
