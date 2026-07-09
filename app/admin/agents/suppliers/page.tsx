"use client";

import { AdminListPage } from "@/components/admin/AdminListPage";
import { supplierRequests } from "@/lib/admin/mock-data";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function AgentSuppliersPage() {
  return (
    <AdminListPage
      title="Agent Add Suppliers"
      tabs={["All Suppliers", "Active", "Pending"]}
      keyField="id"
      data={supplierRequests}
      action={
        <Button size="sm" className="h-9 gap-1">
          <Plus className="h-4 w-4" />
          Add Supplier
        </Button>
      }
      columns={[
        { key: "supplier", header: "Supplier" },
        { key: "contact", header: "Contact" },
        { key: "email", header: "Email" },
        { key: "inventory", header: "Inventory" },
        { key: "submitted", header: "Added On" },
      ]}
    />
  );
}
