"use client";

import { useState } from "react";
import { AdminListPage, statusColumn } from "@/components/admin/AdminListPage";
import { AdminFormModal } from "@/components/admin/modals/AdminFormModal";
import { SupplierActionModal } from "@/components/admin/modals/SupplierActionModal";
import { apiIntegrations } from "@/lib/admin/mock-data";
import { addApiFields } from "@/lib/admin/modal-configs";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function ManagedApiPage() {
  const [addOpen, setAddOpen] = useState(false);
  const [actionOpen, setActionOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<string>();

  return (
    <AdminListPage
      title="Managed API"
      subtitle="3 integrations (9 accounts)"
      tabs={["All APIs", "Active", "Pending", "Denied"]}
      keyField="id"
      data={apiIntegrations}
      action={
        <Button size="sm" className="h-9 gap-1" onClick={() => setAddOpen(true)}>
          <Plus className="h-4 w-4" />
          Add API
        </Button>
      }
      columns={[
        { key: "id", header: "ID" },
        { key: "name", header: "Name" },
        { key: "type", header: "Type" },
        { key: "provider", header: "Provider" },
        statusColumn("status"),
        { key: "requests", header: "Requests" },
        { key: "lastSync", header: "Last Sync" },
        {
          key: "action",
          header: "",
          render: (r) => (
            <Button
              size="sm"
              variant="outline"
              className="h-8"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedSupplier(r.name as string);
                setActionOpen(true);
              }}
            >
              Action
            </Button>
          ),
        },
      ]}
    >
      <AdminFormModal
        open={addOpen}
        onOpenChange={setAddOpen}
        title="Add API"
        fields={addApiFields}
        submitLabel="Add API"
      />
      <SupplierActionModal
        open={actionOpen}
        onOpenChange={setActionOpen}
        variant="single"
        supplierName={selectedSupplier}
      />
    </AdminListPage>
  );
}
