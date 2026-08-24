"use client";

import { ArrowRight, ArrowUpRight } from "lucide-react";
import { useRouter } from "next/navigation";
import type { BookingDraft } from "@/lib/booking";
import { format, parseISO } from "date-fns";

function formatRouteDate(date?: string) {
  if (!date) return "—";
  try {
    return format(parseISO(date), "dd MMM");
  } catch {
    return date;
  }
}

export function OfflineBookContextBar({
  draft,
  resultCount = 1,
}: {
  draft: BookingDraft;
  resultCount?: number;
}) {
  const router = useRouter();
  const pax = draft.adults + draft.children + draft.infants;

  return (
    <div className="w-full select-none">
      <div className="flex flex-col md:flex-row w-full">
        <div className="w-full md:flex-1 bg-[#D60D26] text-white flex flex-col justify-center px-4 md:pl-10 py-3 md:py-4">
          <div className="flex items-center gap-2 font-bold text-sm md:text-[15px]">
            {draft.origin} <ArrowRight className="w-4 h-4" /> {draft.destination}
          </div>
          <div className="text-xs opacity-90 mt-0.5 tracking-wide">
            {formatRouteDate(draft.departureDate)} • {pax} passenger{pax !== 1 ? "s" : ""} • {draft.cabin}
          </div>
        </div>
        <div className="w-full md:flex-1 bg-[#0C2342] flex items-center justify-start md:justify-end px-4 md:pr-10 py-3 md:py-4 border-t border-white/10 md:border-t-0">
          <button
            type="button"
            onClick={() => router.push("/sale/flight/all")}
            className="bg-[#D60D26] hover:bg-[#b80b20] text-white rounded-full px-6 h-9 font-bold text-xs shadow-sm flex items-center justify-center gap-1.5 w-full md:w-auto"
          >
            Search Again <ArrowUpRight className="w-3.5 h-3.5" strokeWidth={3} />
          </button>
        </div>
      </div>
      <p className="text-[#D60D26] text-[13px] font-bold px-4 md:px-10 py-2 bg-white border-b border-slate-100">
        Results: {resultCount} result with 1 carrier found
      </p>
    </div>
  );
}
