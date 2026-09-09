"use client";

import { Armchair } from "lucide-react";

export function SeatAccounting({
  total,
  held,
  available,
  compact = false,
}: {
  total: number;
  held: number;
  available: number;
  compact?: boolean;
}) {
  if (compact) {
    return (
      <div className="flex items-center gap-1 text-[14px] font-bold text-slate-700">
        <Armchair className="w-4 h-4 text-slate-400" />
        <span>{total}</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 text-[14px]">
      <div className="flex items-center gap-1 text-slate-500">
        <Armchair className="w-4 h-4" />
        <span className="font-bold text-slate-800">{total}</span>
      </div>
      <div className="w-1 h-1 bg-[#D60D26] rounded-full" />
      <div className="flex items-center gap-1 text-blue-600">
        <Armchair className="w-4 h-4 fill-blue-100" />
        <span className="font-bold">{held}</span>
      </div>
      <div className="w-1 h-1 bg-[#D60D26] rounded-full" />
      <div className="flex items-center gap-1 text-slate-400">
        <Armchair className="w-4 h-4" strokeWidth={1.5} />
        <span className="font-bold text-slate-700">{available}</span>
      </div>
    </div>
  );
}
