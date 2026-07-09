"use client";

import { AdminFigmaModal } from "./AdminFigmaModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronDown } from "lucide-react";

export interface FormField {
  name: string;
  label: string;
  type?: "text" | "email" | "number" | "select" | "textarea";
  placeholder?: string;
  options?: string[];
  defaultValue?: string;
}

export function AdminFormModal({
  open,
  onOpenChange,
  title,
  fields,
  submitLabel = "Submit",
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  fields: FormField[];
  submitLabel?: string;
  onSubmit?: () => void;
}) {
  return (
    <AdminFigmaModal open={open} onOpenChange={onOpenChange} title={title}>
      <div className="space-y-4 bg-white px-7 py-5">
        {fields.map((field) => (
          <div key={field.name}>
            <label className="mb-1 block text-xs font-medium text-[#414d5e]">
              {field.label}
            </label>
            {field.type === "select" ? (
              <div className="relative">
                <select
                  defaultValue={field.defaultValue}
                  className="h-9 w-full appearance-none rounded border border-[#e8ebef] bg-white px-3 pr-8 text-sm"
                >
                  {(field.options ?? []).map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-2 top-2.5 h-4 w-4 text-slate-400" />
              </div>
            ) : field.type === "textarea" ? (
              <textarea
                className="min-h-[80px] w-full rounded border border-[#e8ebef] px-3 py-2 text-sm"
                placeholder={field.placeholder}
                defaultValue={field.defaultValue}
              />
            ) : (
              <Input
                type={field.type ?? "text"}
                placeholder={field.placeholder}
                defaultValue={field.defaultValue}
                className="h-9 border-[#e8ebef] text-sm"
              />
            )}
          </div>
        ))}
      </div>
      <div className="flex gap-3 border-t border-slate-200 px-4 py-4">
        <Button
          variant="outline"
          className="h-9 flex-1 border-[#006aec] text-[#006aec]"
          onClick={() => onOpenChange(false)}
        >
          Cancel
        </Button>
        <Button
          className="h-9 flex-1 bg-[#006aec] hover:bg-[#006aec]/90"
          onClick={() => {
            onSubmit?.();
            onOpenChange(false);
          }}
        >
          {submitLabel}
        </Button>
      </div>
    </AdminFigmaModal>
  );
}
