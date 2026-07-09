"use client";

import { AdminFigmaModal } from "./AdminFigmaModal";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";

const filterGroups = [
  {
    label: "Status",
    options: ["All", "Active", "Pending", "Approved", "Denied", "Inactive"],
  },
  {
    label: "Type",
    options: ["All", "Supplier", "Agent", "Customer"],
  },
  {
    label: "Date Range",
    options: ["Last 24 hours", "Last 7 days", "Last 30 days", "Custom"],
  },
];

export function AdminFilterModal({
  open,
  onOpenChange,
  onApply,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApply?: () => void;
}) {
  return (
    <AdminFigmaModal open={open} onOpenChange={onOpenChange} title="Filter Results">
      <div className="space-y-4 bg-white px-7 py-5">
        {filterGroups.map((group) => (
          <div key={group.label}>
            <label className="mb-1 block text-xs font-medium text-[#414d5e]">
              {group.label}
            </label>
            <div className="relative">
              <select className="h-9 w-full appearance-none rounded border border-[#e8ebef] bg-white px-3 pr-8 text-sm">
                {group.options.map((opt) => (
                  <option key={opt}>{opt}</option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2 top-2.5 h-4 w-4 text-slate-400" />
            </div>
          </div>
        ))}
      </div>
      <div className="flex gap-3 border-t border-slate-200 px-4 py-4">
        <Button
          variant="outline"
          className="h-9 flex-1 border-[#006aec] text-[#006aec]"
          onClick={() => onOpenChange(false)}
        >
          Reset
        </Button>
        <Button
          className="h-9 flex-1 bg-[#006aec] hover:bg-[#006aec]/90"
          onClick={() => {
            onApply?.();
            onOpenChange(false);
          }}
        >
          Apply Filters
        </Button>
      </div>
    </AdminFigmaModal>
  );
}
