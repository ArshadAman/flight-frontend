"use client";

import { addDays, format, parseISO } from "date-fns";
import { cn } from "@/lib/utils";

type Props = {
  baseDate: string;
  selectedDate: string;
  onSelect: (isoDate: string) => void;
  rangeDays?: number;
};

export function FlexibleDatesBar({
  baseDate,
  selectedDate,
  onSelect,
  rangeDays = 3,
}: Props) {
  const center = parseISO(baseDate);
  const dates = Array.from({ length: rangeDays * 2 + 1 }, (_, i) =>
    addDays(center, i - rangeDays)
  );

  return (
    <div className="w-full overflow-x-auto pb-2 -mx-1 px-1">
      <div className="flex gap-2 min-w-max">
        {dates.map((d) => {
          const iso = format(d, "yyyy-MM-dd");
          const active = iso === selectedDate;
          return (
            <button
              key={iso}
              type="button"
              onClick={() => onSelect(iso)}
              className={cn(
                "flex flex-col items-center px-4 py-2.5 rounded-xl border text-center min-w-[72px] transition-all",
                active
                  ? "bg-[#D60D26] border-[#D60D26] text-white shadow-md"
                  : "bg-white border-slate-200 text-slate-600 hover:border-[#D60D26]/40"
              )}
            >
              <span className="text-[11px] font-bold uppercase opacity-80">
                {format(d, "EEE")}
              </span>
              <span className="text-[15px] font-black leading-tight">{format(d, "d MMM")}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
