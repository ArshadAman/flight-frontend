"use client";

import { useState } from "react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminDataTable } from "@/components/admin/AdminDataTable";
import { AdminBadge } from "@/components/admin/AdminBadge";
import { SupplierActionModal } from "@/components/admin/modals/SupplierActionModal";
import { apiIntegrations } from "@/lib/admin/mock-data";
import { Button } from "@/components/ui/button";
import { ChevronDown, Info, MoreVertical } from "lucide-react";
import type { AdminStatus } from "@/lib/admin/types";

const supplierNames = [
  "Harshit",
  "Vaibhav Gour",
  "Rahul Meena",
  "Kusum Meena",
  "Riya Roy",
  "Vaibhav Raj",
  "Rajat Singh",
  "Lokesh Gidwani",
  "Harshit Chirgania",
  "Priya Sharma",
  "Neha Gupta",
  "Vikram Patel",
  "Sneha Reddy",
  "Amit Sharma",
  "Deepak Singh",
  "Anita Verma",
  "Ravi Kumar",
  "Sanjay Mehta",
  "Pooja Agarwal",
];

const actionRows = Array.from({ length: 19 }, (_, i) => ({
  id: String(23853 + i * 111).slice(0, 5),
  supplierName: supplierNames[i],
  agencyName: supplierNames[i],
  apiKey: "#1212VC",
  lastUpdate: "22, Dec 2021 12:30 PM",
  status: (i % 3 === 0 ? "inactive" : "active") as AdminStatus,
}));

export default function BulkActionsPage() {
  const [selected, setSelected] = useState<Set<string>>(new Set(actionRows.map((r) => r.id)));
  const [bulkOpen, setBulkOpen] = useState(false);
  const [singleOpen, setSingleOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<string>();

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selected.size === actionRows.length) setSelected(new Set());
    else setSelected(new Set(actionRows.map((r) => r.id)));
  };

  return (
    <div className="flex min-h-full flex-col">
      <AdminPageHeader
        title="Supplier Manage APIs"
        subtitle={`${actionRows.length} Supplier`}
        tabs={["Suppliers Action", "Managed Request"]}
        action={
          <Button
            size="sm"
            className="h-9 gap-1 bg-[#006aec] hover:bg-[#006aec]/90"
            disabled={selected.size === 0}
            onClick={() => setBulkOpen(true)}
          >
            Bulk Action
          </Button>
        }
      />

      <div className="flex-1 p-6">
        <AdminDataTable
          keyField="id"
          data={actionRows}
          columns={[
            {
              key: "select",
              header: (
                <input
                  type="checkbox"
                  checked={selected.size === actionRows.length}
                  onChange={toggleAll}
                  className="rounded border-slate-300 accent-[#006aec]"
                />
              ),
              render: (r) => (
                <input
                  type="checkbox"
                  checked={selected.has(String(r.id))}
                  onChange={() => toggle(String(r.id))}
                  onClick={(e) => e.stopPropagation()}
                  className="rounded border-slate-300 accent-[#006aec]"
                />
              ),
            },
            { key: "id", header: "Supplier Id" },
            { key: "supplierName", header: "Supplier Name" },
            { key: "agencyName", header: "Agency Name" },
            { key: "apiKey", header: "API key" },
            { key: "lastUpdate", header: "Last Update" },
            {
              key: "status",
              header: "Status",
              render: (r) => <AdminBadge status={r.status as AdminStatus} />,
            },
            {
              key: "action",
              header: "Action",
              render: (r) => (
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    className="h-7 gap-1 bg-[#006aec] px-2.5 text-[11px] hover:bg-[#006aec]/90"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedSupplier(String(r.supplierName));
                      setSingleOpen(true);
                    }}
                  >
                    Action
                    <ChevronDown className="h-3 w-3" />
                  </Button>
                  <Info className="h-4 w-4 text-slate-400" />
                  <MoreVertical className="h-4 w-4 text-slate-400" />
                </div>
              ),
            },
          ]}
        />
      </div>

      <SupplierActionModal
        open={bulkOpen}
        onOpenChange={setBulkOpen}
        variant="bulk"
        supplierName={`${selected.size} selected suppliers`}
      />
      <SupplierActionModal
        open={singleOpen}
        onOpenChange={setSingleOpen}
        variant="single"
        supplierName={selectedSupplier}
      />
    </div>
  );
}
