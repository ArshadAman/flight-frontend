"use client";

import { useState } from "react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminDataTable } from "@/components/admin/AdminDataTable";
import { AdminBadge } from "@/components/admin/AdminBadge";
import { AdminEmptyState, AdminLoadingState } from "@/components/admin/AdminEmptyState";
import { AdminFilterModal } from "@/components/admin/modals/AdminFilterModal";
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
  children,
}: {
  title: string;
  subtitle?: string;
  tabs?: string[];
  columns: {
    key: string;
    header: string;
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
  children?: React.ReactNode;
}) {
  const [activeTab, setActiveTab] = useState(tabs?.[0] ?? "");
  const [filterOpen, setFilterOpen] = useState(false);

  return (
    <div className="flex min-h-full flex-col">
      <AdminPageHeader
        title={title}
        subtitle={subtitle}
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        showFilter={showFilter}
        onFilterClick={() => setFilterOpen(true)}
        action={action}
      />
      <div className="flex-1 p-6">
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
          />
        )}
      </div>
      {showFilter && (
        <AdminFilterModal open={filterOpen} onOpenChange={setFilterOpen} />
      )}
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
