"use client";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export function AdminFieldSection({
  title,
  fields,
  uploadKeys,
  className,
}: {
  title: string;
  fields: readonly string[];
  uploadKeys?: readonly string[];
  className?: string;
}) {
  const uploads = new Set(uploadKeys ?? []);

  return (
    <section
      className={cn(
        "rounded-[10px] border border-[#e8ebef] bg-white shadow-sm",
        className
      )}
    >
      <div className="border-b border-[#e8ebef] bg-[#f2fbff] px-6 py-3">
        <h2 className="text-sm font-semibold text-[#414d5e]">{title}</h2>
      </div>
      <div className="grid gap-4 p-6 sm:grid-cols-2">
        {fields.map((label) => (
          <div
            key={label}
            className={cn(
              uploads.has(label) || label.toLowerCase().includes("address") || label === "Remark"
                ? "sm:col-span-2"
                : undefined
            )}
          >
            <label className="mb-1 block text-xs font-medium text-[rgba(27,43,65,0.72)]">
              {label}:
            </label>
            {uploads.has(label) ? (
              <div className="flex h-24 items-center justify-center rounded border border-dashed border-[#e8ebef] bg-[#fafafa] text-xs text-slate-400">
                Upload {label.replace(":", "")}
              </div>
            ) : label === "Remark" || label.includes("Address") ? (
              <textarea
                className="min-h-[72px] w-full rounded border border-[#e8ebef] px-3 py-2 text-sm text-[rgba(24,39,58,0.94)]"
                placeholder="——"
              />
            ) : (
              <Input
                className="h-9 border-[#e8ebef] text-sm"
                placeholder="——"
              />
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
