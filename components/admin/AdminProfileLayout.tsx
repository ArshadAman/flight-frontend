"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Filter, Download, SlidersHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

export function AdminProfileLayout({
  title,
  tabs,
  backHref,
  children,
  action,
  showTools = true,
}: {
  title: string;
  tabs: string[];
  backHref: string;
  children: (activeTab: string) => React.ReactNode;
  action?: React.ReactNode;
  showTools?: boolean;
}) {
  const [activeTab, setActiveTab] = useState(tabs[0]);

  return (
    <div className="flex min-h-full flex-col">
      <div className="border-b border-[#e8ebef] bg-white px-6 pb-0 pt-5">
        <div className="flex flex-wrap items-center gap-3">
          <Link href={backHref} className="rounded p-1 text-slate-500 hover:bg-slate-100">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-xl font-bold text-[#1c304a]">{title}</h1>
          {action && <div className="ml-auto">{action}</div>}
        </div>

        <div className="mt-4 flex flex-wrap items-end justify-between gap-3">
          <div className="flex gap-6 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "relative shrink-0 pb-2.5 text-sm font-medium whitespace-nowrap transition-colors",
                  activeTab === tab
                    ? "text-[#1c304a] after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-full after:bg-[#D60D26]"
                    : "text-slate-400 hover:text-slate-600"
                )}
              >
                {tab}
              </button>
            ))}
          </div>
          {showTools && (
            <div className="mb-2 flex items-center gap-2">
              <div className="relative">
                <Input placeholder="Search" className="h-9 w-52 border-[#e8ebef] pr-9 text-sm" />
                <Search className="absolute right-2.5 top-2.5 h-4 w-4 text-slate-400" />
              </div>
              <Button variant="outline" size="icon" className="h-9 w-9 border-[#e8ebef]">
                <Filter className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" className="h-9 w-9 border-[#e8ebef]">
                <Download className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" className="h-9 w-9 border-[#e8ebef]">
                <SlidersHorizontal className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </div>
      <div className="flex-1 bg-[#f7f9fc] p-6">
        <div className="rounded-[10px] border border-[#e8ebef] bg-white p-6 shadow-sm">
          {children(activeTab)}
        </div>
      </div>
    </div>
  );
}

export function AdminProfileFields({
  fields,
  values = {},
  fileFields = [],
  actions = {},
}: {
  fields: string[];
  values?: Record<string, string>;
  fileFields?: string[];
  actions?: Record<string, { label: string; variant?: "activate" | "disable" }>;
}) {
  return (
    <div className="max-w-3xl space-y-0">
      {fields.map((field) => {
        const action = actions[field];
        const isFile = fileFields.includes(field);
        return (
          <div key={field} className="flex items-center gap-6 py-3.5">
            <span className="w-48 shrink-0 text-sm text-slate-600">{field}:</span>
            <span className="flex-1 border-b border-slate-200 pb-1 text-sm text-slate-400">
              {isFile || action ? "———" : values[field] ?? "———"}
            </span>
            {isFile && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-8 border-[#a8c8f0] bg-[#eef6ff] text-[#006aec] hover:bg-[#e0efff]"
              >
                Choose File
              </Button>
            )}
            {action && (
              <Button
                type="button"
                size="sm"
                className={cn(
                  "h-8 min-w-[88px]",
                  action.variant === "activate"
                    ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                )}
              >
                {action.label}
              </Button>
            )}
          </div>
        );
      })}
    </div>
  );
}
