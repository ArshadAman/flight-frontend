"use client";

import { useState } from "react";
import { AdminListPage, statusColumn } from "@/components/admin/AdminListPage";
import { AdminFormModal } from "@/components/admin/modals/AdminFormModal";
import { apiIntegrations } from "@/lib/admin/mock-data";
import { addApiFields } from "@/lib/admin/modal-configs";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

const customerApis = apiIntegrations.filter((a) => a.type === "Customer");

export default function CustomerApiPage() {
  const [addOpen, setAddOpen] = useState(false);

  return (
    <AdminListPage
      title="Customer API"
      subtitle="Only for registered customers with API access"
      tabs={["All Customers", "Active", "Pending"]}
      keyField="id"
      data={customerApis.length ? customerApis : [apiIntegrations[4]]}
      action={
        <Button size="sm" className="h-9 gap-1" onClick={() => setAddOpen(true)}>
          <Plus className="h-4 w-4" />
          Add API
        </Button>
      }
      columns={[
        { key: "id", header: "API ID" },
        { key: "name", header: "Customer" },
        { key: "provider", header: "Provider" },
        statusColumn("status"),
        { key: "requests", header: "API Calls" },
        { key: "lastSync", header: "Last Active" },
      ]}
    >
      <AdminFormModal
        open={addOpen}
        onOpenChange={setAddOpen}
        title="Add Customer API"
        fields={addApiFields}
        submitLabel="Add API"
      />
    </AdminListPage>
  );
}
