"use client";

import { useState } from "react";
import { AdminListPage } from "@/components/admin/AdminListPage";
import { AddSuppliersModal } from "@/components/admin/modals";
import { supplierRequests } from "@/lib/admin/mock-data";
import { Button } from "@/components/ui/button";
import { Info, MoreVertical, Plus } from "lucide-react";

const supplierNames = [
  "Harshit Chirgania",
  "Ajay Mehto",
  "Lokesh Gidwani",
  "Kusum Meena",
  "Riya Roy",
  "Vaibhav Raj",
];

const rows = supplierRequests.map((s, i) => ({
  ...s,
  supplierId: String(23853 + i * 111),
  supplierName: supplierNames[i % supplierNames.length],
}));

export default function AgentSuppliersPage() {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <AdminListPage
        title="Agent's Add Suppliers"
        subtitle={`${rows.length} Suppliers`}
        tabs={["All Suppliers", "Active", "Pending"]}
        keyField="id"
        data={rows}
        action={
          <Button
            size="sm"
            className="h-9 gap-1 bg-[#006aec] hover:bg-[#006aec]/90"
            onClick={() => setModalOpen(true)}
          >
            <Plus className="h-4 w-4" />
            Add Supplier
          </Button>
        }
        columns={[
          {
            key: "select",
            header: "",
            render: () => (
              <input type="checkbox" className="rounded border-slate-300" onClick={(e) => e.stopPropagation()} />
            ),
          },
          { key: "supplierId", header: "Supplier Id" },
          { key: "supplierName", header: "Name of Suppliers Activate" },
          { key: "contact", header: "Contact" },
          { key: "email", header: "Email" },
          { key: "inventory", header: "No. of Supplier Activate" },
          { key: "submitted", header: "Added On" },
          {
            key: "actions",
            header: "",
            render: () => (
              <div className="flex items-center gap-2 text-slate-400">
                <Info className="h-4 w-4" />
                <MoreVertical className="h-4 w-4" />
              </div>
            ),
          },
        ]}
      />
      <AddSuppliersModal open={modalOpen} onOpenChange={setModalOpen} />
    </>
  );
}
