"use client";

import { useState } from "react";
import { format, isValid, parseISO, startOfDay } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

/** ISO value stored in form state: yyyy-MM-dd */
export const BOOKING_DATE_ISO_FORMAT = "yyyy-MM-dd";
/** Human display: 01 May 2000 */
export const BOOKING_DATE_DISPLAY_FORMAT = "dd MMM yyyy";

export function toBookingDateIso(date: Date): string {
  return format(date, BOOKING_DATE_ISO_FORMAT);
}

export function formatBookingDateDisplay(iso?: string): string {
  if (!iso) return "";
  try {
    const d = parseISO(iso);
    if (!isValid(d)) return "";
    return format(d, BOOKING_DATE_DISPLAY_FORMAT);
  } catch {
    return "";
  }
}

type BookingDateFieldProps = {
  value: string;
  onChange: (isoDate: string) => void;
  /** Always-visible label above the field (e.g. Date of Birth) */
  label: string;
  required?: boolean;
  placeholder?: string;
  className?: string;
  error?: boolean;
  /** Cap selectable dates (e.g. DOB cannot be in the future) */
  maxDate?: Date;
  /** Earliest selectable date */
  minDate?: Date;
  id?: string;
};

export function BookingDateField({
  value,
  onChange,
  label,
  required = false,
  placeholder = "Select date",
  className,
  error = false,
  maxDate,
  minDate,
  id,
}: BookingDateFieldProps) {
  const [open, setOpen] = useState(false);
  const selected = value && isValid(parseISO(value)) ? parseISO(value) : undefined;
  const display = formatBookingDateDisplay(value);
  const fieldId = id || `date-${label.replace(/\s+/g, "-").toLowerCase()}`;

  const thisYear = new Date().getFullYear();
  const fromYear = minDate?.getFullYear() ?? 1920;
  // Future dates (passport expiry, etc.): allow far ahead when maxDate omitted.
  const toYear =
    maxDate?.getFullYear() ??
    Math.max(thisYear + 20, fromYear, selected?.getFullYear() ?? thisYear);
  const defaultMonth =
    selected ??
    (maxDate && (!minDate || maxDate >= minDate) && maxDate.getFullYear() <= thisYear
      ? maxDate
      : null) ??
    minDate ??
    new Date(1990, 0, 1);

  return (
    <div className={cn("flex flex-col gap-1", className)}>
      <label htmlFor={fieldId} className="text-[12px] font-bold text-slate-600">
        {label}
        {required && <span className="text-primary ml-0.5">*</span>}
      </label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            id={fieldId}
            type="button"
            aria-label={label}
            aria-required={required}
            className={cn(
              "flex w-full items-center justify-between gap-2 border rounded-md px-3 py-2.5 text-left text-[13px] font-medium outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100 bg-white min-h-[42px]",
              display ? "text-slate-800" : "text-slate-400",
              error ? "border-red-400 ring-1 ring-red-200" : "border-slate-200"
            )}
          >
            <span className="truncate">{display || placeholder}</span>
            <CalendarIcon className="h-4 w-4 shrink-0 text-slate-400" />
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 z-[120]" align="start">
          <Calendar
            mode="single"
            selected={selected}
            captionLayout="dropdown"
            fromYear={fromYear}
            toYear={toYear}
            defaultMonth={defaultMonth}
            onSelect={(date) => {
              if (!date) return;
              onChange(toBookingDateIso(date));
              setOpen(false);
            }}
            disabled={(date) => {
              const day = startOfDay(date);
              if (minDate && day < startOfDay(minDate)) return true;
              if (maxDate && day > startOfDay(maxDate)) return true;
              return false;
            }}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
