"use client";

import { useState } from "react";
import { AdminListPage, statusColumn } from "@/components/admin/AdminListPage";
import { AdminFormModal } from "@/components/admin/modals/AdminFormModal";
import { discounts } from "@/lib/admin/mock-data";
import { discountFields } from "@/lib/admin/modal-configs";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function AgentDiscountsPage() {
  const [addOpen, setAddOpen] = useState(false);

  return (
    <AdminListPage
      title="Add Discounts"
      tabs={["Active", "Expired", "All"]}
      keyField="id"
      data={discounts}
      action={
        <Button size="sm" className="h-9 gap-1" onClick={() => setAddOpen(true)}>
          <Plus className="h-4 w-4" />
          Add Discount
        </Button>
      }
      columns={[
        { key: "id", header: "ID" },
        { key: "code", header: "Code" },
        { key: "type", header: "Type" },
        { key: "value", header: "Value" },
        { key: "usage", header: "Usage" },
        { key: "maxUsage", header: "Max Usage" },
        statusColumn("status"),
      ]}
    >
      <AdminFormModal
        open={addOpen}
        onOpenChange={setAddOpen}
        title="Add Discount"
        fields={discountFields}
        submitLabel="Add Discount"
      />
    </AdminListPage>
  );
}
