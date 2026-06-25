"use client";

import { format, isValid, parse } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export const GROUP_TRAVEL_DATE_FORMAT = "dd MMM, yy";

export function formatGroupTravelDate(date: Date) {
  return format(date, GROUP_TRAVEL_DATE_FORMAT);
}

export function parseGroupTravelDate(value: string): Date | undefined {
  if (!value) return undefined;
  const parsed = parse(value, GROUP_TRAVEL_DATE_FORMAT, new Date());
  return isValid(parsed) ? parsed : undefined;
}

function startOfToday() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
}

type GroupTravelDateFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  minDate?: Date;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function GroupTravelDateField({
  label,
  value,
  onChange,
  error,
  minDate = startOfToday(),
  open,
  onOpenChange,
}: GroupTravelDateFieldProps) {
  const selected = parseGroupTravelDate(value);

  return (
    <div className="relative">
      <label className="text-[13px] text-gray-500 absolute top-[-10px] left-0 z-10">
        {label}
      </label>
      <Popover open={open} onOpenChange={onOpenChange}>
        <PopoverTrigger asChild>
          <button
            type="button"
            className={`relative flex w-full items-center pb-2 pt-2 border-0 border-b text-left ${
              error ? "border-red-500" : "border-gray-200"
            } focus-visible:outline-none focus-visible:border-gray-500`}
          >
            <span className={`text-[16px] ${value ? "text-gray-900" : "text-gray-400"}`}>
              {value || "Select date"}
            </span>
            <CalendarIcon className="w-5 h-5 text-gray-400 absolute right-0 bottom-3" />
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={selected}
            onSelect={(date) => {
              if (!date) return;
              onChange(formatGroupTravelDate(date));
              onOpenChange(false);
            }}
            disabled={{ before: minDate }}
            defaultMonth={selected ?? minDate}
          />
        </PopoverContent>
      </Popover>
      {error && (
        <span className="text-red-500 text-[11px] font-semibold mt-1 block">{error}</span>
      )}
    </div>
  );
}
