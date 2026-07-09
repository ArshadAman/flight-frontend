"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { cn } from "@/lib/utils";

export function AdminProfileLayout({
  title,
  tabs,
  backHref,
  children,
  action,
}: {
  title: string;
  tabs: string[];
  backHref: string;
  children: (activeTab: string) => React.ReactNode;
  action?: React.ReactNode;
}) {
  const [activeTab, setActiveTab] = useState(tabs[0]);

  return (
    <div className="flex min-h-full flex-col">
      <div className="border-b border-slate-200 bg-white px-6 py-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link
              href={backHref}
              className="rounded p-1 text-slate-500 hover:bg-slate-100"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
          </div>
          {action}
        </div>
        <div className="mt-4 flex gap-6 overflow-x-auto border-b border-slate-200">
          {tabs.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={cn(
                "relative shrink-0 pb-2.5 text-sm font-medium whitespace-nowrap transition-colors",
                activeTab === tab
                  ? "text-[#c61324] after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-full after:bg-[#D60D26]"
                  : "text-slate-500 hover:text-slate-700"
              )}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>
      <div className="flex-1 bg-slate-50/50 p-6">{children(activeTab)}</div>
    </div>
  );
}

export function AdminProfileFields({
  fields,
  values = {},
}: {
  fields: string[];
  values?: Record<string, string>;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
      {fields.map((field, i) => (
        <div
          key={field}
          className={cn(
            "flex items-center justify-between border-slate-100 px-6 py-4",
            i < fields.length - 1 && "border-b"
          )}
        >
          <span className="text-sm font-medium text-slate-600">{field}:</span>
          <span className="text-sm text-slate-400">
            {values[field] ?? "----"}
          </span>
        </div>
      ))}
    </div>
  );
}
