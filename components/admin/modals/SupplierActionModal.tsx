"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { AdminFigmaModal } from "./AdminFigmaModal";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const tabs = ["Markup", "Discount", "Remark", "Airline Base"] as const;

const markupFields = [
  { label: "Airline type", value: "Domestic Airlines", options: ["Domestic Airlines", "International Airlines"] },
  { label: "Markup Type", value: "Percentage", options: ["Percentage", "Flat Amount"] },
  { label: "Value", value: "2", options: ["1", "2", "3", "5", "10"] },
  { label: "Airline Name", value: "All", options: ["All", "IndiGo", "Air India", "Vistara"] },
  { label: "Source Type", value: "All", options: ["All", "GDS", "Direct", "Inventory"] },
];

const discountFields = [
  { label: "Discount Type", value: "Percentage", options: ["Percentage", "Flat"] },
  { label: "Value", value: "5", options: ["5", "10", "15", "20"] },
  { label: "Valid From", value: "2025-07-01", options: [] },
  { label: "Valid To", value: "2025-12-31", options: [] },
];

const remarkFields = [
  { label: "Remark Type", value: "Internal", options: ["Internal", "Customer Visible"] },
  { label: "Remark", value: "", options: [] },
];

const airlineBaseFields = [
  { label: "Base Airline", value: "All", options: ["All", "IndiGo", "Air India"] },
  { label: "Base Fare Type", value: "Published", options: ["Published", "Negotiated"] },
];

const tabFields: Record<(typeof tabs)[number], typeof markupFields> = {
  Markup: markupFields,
  Discount: discountFields,
  Remark: remarkFields,
  "Airline Base": airlineBaseFields,
};

export function SupplierActionModal({
  open,
  onOpenChange,
  variant = "single",
  supplierName,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  variant?: "single" | "bulk";
  supplierName?: string;
  onSubmit?: () => void;
}) {
  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]>("Markup");
  const fields = tabFields[activeTab];

  const handleReset = () => setActiveTab("Markup");

  return (
    <AdminFigmaModal
      open={open}
      onOpenChange={onOpenChange}
      title={variant === "bulk" ? "Bulk Supplier Action" : "Single Supplier Action"}
    >
      {supplierName && (
        <p className="bg-[#e1eeff] px-7 py-2 text-xs text-[#006aec]">
          Supplier: <span className="font-semibold">{supplierName}</span>
        </p>
      )}

      <div className="flex gap-3 bg-[#e1eeff] px-7 pb-2 pt-3">
        {tabs.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={cn(
              "relative pb-2 text-xs font-medium transition-colors",
              activeTab === tab ? "text-[#414d5e] font-semibold" : "text-slate-400"
            )}
          >
            {tab}
            {activeTab === tab && (
              <span className="absolute bottom-0 left-0 h-0.5 w-full rounded bg-[#006aec]" />
            )}
          </button>
        ))}
      </div>

      <div className="max-h-[320px] overflow-y-auto">
        {fields.map((field, i) => (
          <div
            key={field.label}
            className={cn(
              "grid grid-cols-[200px_1fr] border-b border-slate-200",
              i === 0 && "border-t"
            )}
          >
            <div className="flex items-center bg-[#f5f2f2] px-6 py-3 text-xs font-medium text-[#414d5e]">
              {field.label}
            </div>
            <div className="flex items-center px-4 py-2">
              {field.options.length > 0 ? (
                <div className="relative w-full">
                  <select
                    defaultValue={field.value}
                    className="h-9 w-full appearance-none rounded border border-[#e8ebef] bg-white px-3 pr-8 text-xs text-slate-800"
                  >
                    {field.options.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-2 top-2.5 h-4 w-4 text-slate-400" />
                </div>
              ) : field.label === "Remark" ? (
                <textarea
                  className="min-h-[60px] w-full rounded border border-[#e8ebef] px-3 py-2 text-xs"
                  placeholder="Enter remark..."
                />
              ) : (
                <input
                  type="text"
                  defaultValue={field.value}
                  className="h-9 w-full rounded border border-[#e8ebef] px-3 text-xs"
                />
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-3 border-t border-slate-200 px-4 py-4">
        <Button
          variant="outline"
          className="h-9 flex-1 border-[#006aec] text-[#006aec] hover:bg-[#006aec]/5"
          onClick={handleReset}
        >
          Reset
        </Button>
        <Button
          className="h-9 flex-1 bg-[#006aec] hover:bg-[#006aec]/90"
          onClick={() => {
            onSubmit?.();
            onOpenChange(false);
          }}
        >
          Submit
        </Button>
      </div>
    </AdminFigmaModal>
  );
}
