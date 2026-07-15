"use client";

import { useState } from "react";
import { AdminFigmaModal } from "./AdminFigmaModal";
import {
  FigmaFormRow,
  FigmaModalFooter,
  FigmaModalTabs,
} from "./FigmaFormFields";
import {
  supplierActionAirlineBaseFields,
  supplierActionDiscountFields,
  supplierActionMarkupFields,
  supplierActionRemarkFields,
} from "@/lib/admin/figma-fields";

const tabs = ["Markup", "Discount", "Remark", "Airline Base"] as const;

const tabFields = {
  Markup: supplierActionMarkupFields,
  Discount: supplierActionDiscountFields,
  Remark: supplierActionRemarkFields,
  "Airline Base": supplierActionAirlineBaseFields,
} as const;

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

      <FigmaModalTabs
        tabs={[...tabs]}
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab as (typeof tabs)[number])}
      />

      <div className="max-h-[320px] overflow-y-auto">
        {fields.map((field, i) => (
          <FigmaFormRow key={field.label} field={field} index={i} />
        ))}
      </div>

      <FigmaModalFooter
        onReset={() => setActiveTab("Markup")}
        onSubmit={() => {
          onSubmit?.();
          onOpenChange(false);
        }}
      />
    </AdminFigmaModal>
  );
}
