"use client";

import { cn } from "@/lib/utils";

export function AdminDataTable<T extends Record<string, unknown>>({
  columns,
  data,
  keyField,
  className,
  onRowClick,
  selectedKey,
}: {
  columns: {
    key: string;
    header: React.ReactNode;
    render?: (row: T) => React.ReactNode;
    className?: string;
  }[];
  data: T[];
  keyField: keyof T;
  className?: string;
  onRowClick?: (row: T) => void;
  selectedKey?: string | null;
}) {
  return (
    <div className={cn("overflow-hidden rounded-lg border border-slate-200 bg-white", className)}>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[800px] text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/80">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={cn(
                    "px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500",
                    col.className
                  )}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row) => {
              const isSelected = selectedKey != null && String(row[keyField]) === selectedKey;
              return (
              <tr
                key={String(row[keyField])}
                onClick={() => onRowClick?.(row)}
                className={cn(
                  "border-b border-slate-100 transition-colors last:border-0",
                  onRowClick && "cursor-pointer hover:bg-slate-50",
                  isSelected && "bg-rose-50 hover:bg-rose-50"
                )}
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={cn("px-4 py-3 text-slate-700", col.className)}
                  >
                    {col.render
                      ? col.render(row)
                      : String(row[col.key] ?? "")}
                  </td>
                ))}
              </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
