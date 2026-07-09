"use client";

import { Download, Filter, MoreHorizontal, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function AdminPageHeader({
  title,
  subtitle,
  tabs,
  activeTab,
  onTabChange,
  showSearch = true,
  showFilter = true,
  onFilterClick,
  action,
}: {
  title: string;
  subtitle?: string;
  tabs?: string[];
  activeTab?: string;
  onTabChange?: (tab: string) => void;
  showSearch?: boolean;
  showFilter?: boolean;
  onFilterClick?: () => void;
  action?: React.ReactNode;
}) {
  return (
    <div className="border-b border-slate-200 bg-white px-6 pb-0 pt-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">{title}</h1>
          {subtitle && (
            <p className="mt-0.5 text-xs text-slate-500">{subtitle}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {showSearch && (
            <div className="relative">
              <Input
                placeholder="Search"
                className="h-9 w-52 pr-9 text-sm"
              />
              <Search className="absolute right-2.5 top-2.5 h-4 w-4 text-slate-400" />
            </div>
          )}
          {showFilter && (
            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9"
              onClick={onFilterClick}
            >
              <Filter className="h-4 w-4" />
            </Button>
          )}
          <Button variant="outline" size="icon" className="h-9 w-9">
            <Download className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" className="h-9 w-9">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
          {action}
        </div>
      </div>

      {tabs && tabs.length > 0 && (
        <div className="mt-4 flex gap-6 border-b border-slate-200">
          {tabs.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => onTabChange?.(tab)}
              className={cn(
                "relative pb-2.5 text-sm font-medium transition-colors",
                activeTab === tab
                  ? "text-slate-900 after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-full after:bg-[#D60D26]"
                  : "text-slate-500 hover:text-slate-700"
              )}
            >
              {tab}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
