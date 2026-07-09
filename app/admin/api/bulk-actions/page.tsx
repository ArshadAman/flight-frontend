"use client";

import { useState } from "react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminDataTable } from "@/components/admin/AdminDataTable";
import { AdminBadge } from "@/components/admin/AdminBadge";
import { AdminConfirmModal } from "@/components/admin/AdminConfirmModal";
import { AdminFilterModal } from "@/components/admin/modals/AdminFilterModal";
import { SupplierActionModal } from "@/components/admin/modals/SupplierActionModal";
import { apiIntegrations } from "@/lib/admin/mock-data";
import { Button } from "@/components/ui/button";

export default function BulkActionsPage() {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [showModal, setShowModal] = useState(false);
  const [action, setAction] = useState<"approve" | "deny">("approve");
  const [filterOpen, setFilterOpen] = useState(false);
  const [supplierActionOpen, setSupplierActionOpen] = useState(false);

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selected.size === apiIntegrations.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(apiIntegrations.map((a) => a.id)));
    }
  };

  return (
    <div className="flex min-h-full flex-col">
      <AdminPageHeader
        title="Bulk API Actions"
        subtitle={`${selected.size} selected`}
        tabs={["Select All", "Bulk Approve", "Bulk Deny"]}
        onFilterClick={() => setFilterOpen(true)}
        action={
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              className="h-9"
              disabled={selected.size === 0}
              onClick={() => setSupplierActionOpen(true)}
            >
              Bulk Supplier Action
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="h-9"
              disabled={selected.size === 0}
              onClick={() => {
                setAction("approve");
                setShowModal(true);
              }}
            >
              Bulk Approve
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="h-9 text-red-600"
              disabled={selected.size === 0}
              onClick={() => {
                setAction("deny");
                setShowModal(true);
              }}
            >
              Bulk Deny
            </Button>
          </div>
        }
      />
      <div className="flex-1 p-6">
        <div className="mb-3 flex items-center gap-2">
          <input
            type="checkbox"
            id="select-all"
            checked={selected.size === apiIntegrations.length && apiIntegrations.length > 0}
            onChange={toggleAll}
            className="rounded border-slate-300"
          />
          <label htmlFor="select-all" className="text-sm text-slate-600">
            Select all
          </label>
        </div>
        <AdminDataTable
          keyField="id"
          data={apiIntegrations}
          columns={[
            {
              key: "select",
              header: "",
              render: (r) => (
                <input
                  type="checkbox"
                  checked={selected.has(r.id)}
                  onChange={() => toggle(r.id)}
                  onClick={(e) => e.stopPropagation()}
                  className="rounded border-slate-300"
                />
              ),
            },
            { key: "id", header: "ID" },
            { key: "name", header: "Name" },
            { key: "type", header: "Type" },
            {
              key: "status",
              header: "Status",
              render: (r) => <AdminBadge status={r.status} />,
            },
            { key: "provider", header: "Provider" },
          ]}
        />
      </div>
      <AdminConfirmModal
        open={showModal}
        onOpenChange={setShowModal}
        variant={action}
        title={`${action === "approve" ? "Approve" : "Deny"} ${selected.size} APIs`}
        description={`This will ${action} all ${selected.size} selected API integrations.`}
        onConfirm={() => {
          setSelected(new Set());
          setShowModal(false);
        }}
      />
      <SupplierActionModal
        open={supplierActionOpen}
        onOpenChange={setSupplierActionOpen}
        variant="bulk"
        supplierName={`${selected.size} selected suppliers`}
      />
      <AdminFilterModal open={filterOpen} onOpenChange={setFilterOpen} />
    </div>
  );
}
