"use client";

import { useState } from "react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminDataTable } from "@/components/admin/AdminDataTable";
import { AdminBadge } from "@/components/admin/AdminBadge";
import { AdminEmptyState, AdminLoadingState } from "@/components/admin/AdminEmptyState";
import type { AdminStatus } from "@/lib/admin/types";

export function AdminListPage<T extends Record<string, unknown>>({
  title,
  subtitle,
  tabs,
  columns,
  data,
  keyField,
  action,
  onRowClick,
  loading = false,
  emptyTitle,
  emptyDescription,
  showFilter = true,
  metrics,
  selectedKey,
  children,
  activeTab: controlledTab,
  onTabChange,
}: {
  title: string;
  subtitle?: string;
  tabs?: string[];
  activeTab?: string;
  onTabChange?: (tab: string) => void;
  columns: {
    key: string;
    header: React.ReactNode;
    render?: (row: T) => React.ReactNode;
    className?: string;
  }[];
  data: T[];
  keyField: keyof T;
  action?: React.ReactNode;
  onRowClick?: (row: T) => void;
  loading?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  showFilter?: boolean;
  metrics?: React.ReactNode;
  selectedKey?: string | null;
  children?: React.ReactNode;
}) {
  const [internalTab, setInternalTab] = useState(tabs?.[0] ?? "");
  const activeTab = controlledTab ?? internalTab;
  const handleTabChange = onTabChange ?? setInternalTab;

  return (
    <div className="flex min-h-full flex-col">
      <AdminPageHeader
        title={title}
        subtitle={metrics ? undefined : subtitle}
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={handleTabChange}
        showFilter={showFilter}
        action={action}
      />
      <div className="flex-1 p-6">
        {metrics && (
          <div className="mb-4">
            {metrics}
            {subtitle && <p className="mt-4 text-xs text-slate-500">{subtitle}</p>}
          </div>
        )}
        {loading ? (
          <AdminLoadingState />
        ) : data.length === 0 ? (
          <AdminEmptyState title={emptyTitle} description={emptyDescription} />
        ) : (
          <AdminDataTable
            columns={columns}
            data={data}
            keyField={keyField}
            onRowClick={onRowClick}
            selectedKey={selectedKey}
          />
        )}
      </div>
      {children}
    </div>
  );
}

export function statusColumn(key: string, header = "Status") {
  return {
    key,
    header,
    render: (row: Record<string, unknown>) => (
      <AdminBadge status={row[key] as AdminStatus} />
    ),
  };
}
