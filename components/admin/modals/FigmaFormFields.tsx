"use client";

import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type FigmaField = {
  label: string;
  value?: string;
  options?: readonly string[];
  type?: "select" | "textarea" | "date";
  placeholder?: string;
};

export function FigmaFormRow({
  field,
  index,
}: {
  field: FigmaField;
  index: number;
}) {
  return (
    <div
      className={cn(
        "grid grid-cols-[200px_1fr] border-b border-[#e8ebef]",
        index === 0 && "border-t border-[#e8ebef]"
      )}
    >
      <div className="flex items-center bg-[#f5f2f2] px-6 py-3 text-xs font-medium text-[#414d5e]">
        {field.label}
      </div>
      <div className="flex items-center px-4 py-2">
        {field.type === "textarea" || (!field.options?.length && field.type !== "date") ? (
          <textarea
            defaultValue={field.value}
            className="min-h-[60px] w-full rounded border border-[#e8ebef] px-3 py-2 text-xs text-[rgba(24,39,58,0.94)]"
            placeholder={field.placeholder ?? "Write Remark...."}
          />
        ) : field.type === "date" ? (
          <input
            type="text"
            defaultValue={field.value}
            className="h-[27px] w-full rounded border border-[#e8ebef] bg-white px-3 text-xs text-[rgba(24,39,58,0.94)]"
          />
        ) : (
          <div className="relative w-full">
            <select
              defaultValue={field.value}
              className="h-[27px] w-full appearance-none rounded border border-[#e8ebef] bg-white px-3 pr-8 text-xs text-[rgba(24,39,58,0.94)]"
            >
              {field.options?.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2 top-1.5 h-3.5 w-3.5 text-slate-400" />
          </div>
        )}
      </div>
    </div>
  );
}

export function FigmaModalTabs({
  tabs,
  activeTab,
  onTabChange,
}: {
  tabs: string[];
  activeTab: string;
  onTabChange: (tab: string) => void;
}) {
  return (
    <div className="flex gap-3 bg-[#e1eeff] px-7 pb-2 pt-3">
      {tabs.map((tab) => (
        <button
          key={tab}
          type="button"
          onClick={() => onTabChange(tab)}
          className={cn(
            "relative pb-2 text-xs font-medium transition-colors",
            activeTab === tab ? "font-semibold text-[#414d5e]" : "text-slate-400"
          )}
        >
          {tab}
          {activeTab === tab && (
            <span className="absolute bottom-0 left-0 h-0.5 w-full rounded bg-[#006aec]" />
          )}
        </button>
      ))}
    </div>
  );
}

export function FigmaModalFooter({
  onReset,
  onSubmit,
}: {
  onReset?: () => void;
  onSubmit?: () => void;
}) {
  return (
    <div className="flex gap-3 border-t border-[#e8ebef] px-4 py-4">
      <Button
        variant="outline"
        className="h-[27px] flex-1 border-[#006aec] text-[11px] text-[#006aec]"
        onClick={onReset}
      >
        Reset
      </Button>
      <Button
        className="h-[27px] flex-1 bg-[#006aec] text-[11px] hover:bg-[#006aec]/90"
        onClick={onSubmit}
      >
        Submit
      </Button>
    </div>
  );
}

export function FigmaCheckboxList({
  items,
  selected,
  onToggle,
  showMore = true,
}: {
  items: string[];
  selected: Set<string>;
  onToggle: (item: string) => void;
  showMore?: boolean;
}) {
  return (
    <div>
      {items.map((item) => (
        <label
          key={item}
          className="flex cursor-pointer items-center gap-3 border-b border-[#e8ebef] px-6 py-3 text-xs font-medium uppercase tracking-wide text-[#1c304a] last:border-b-0"
        >
          <input
            type="checkbox"
            checked={selected.has(item)}
            onChange={() => onToggle(item)}
            className="h-4 w-4 rounded border-[#e8ebef] accent-[#006aec]"
          />
          {item}
        </label>
      ))}
      {showMore && (
        <button
          type="button"
          className="w-full py-3 text-center text-xs font-medium text-[#006aec] hover:underline"
        >
          More
        </button>
      )}
    </div>
  );
}

export function FigmaSearchBar({
  placeholder,
  value,
  onChange,
}: {
  placeholder: string;
  value?: string;
  onChange?: (v: string) => void;
}) {
  return (
    <div className="relative border-b border-[#e8ebef] px-6 py-3">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
        className="h-9 w-full rounded border border-[#e8ebef] bg-[#f5f7fa] px-3 pr-9 text-xs text-[#1c304a] placeholder:text-slate-400"
      />
      <svg
        className="absolute right-9 top-5 h-4 w-4 text-slate-400"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      </svg>
    </div>
  );
}
