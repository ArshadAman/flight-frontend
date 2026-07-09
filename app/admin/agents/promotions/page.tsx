"use client";

import { useState } from "react";
import { AdminListPage, statusColumn } from "@/components/admin/AdminListPage";
import { AdminFormModal } from "@/components/admin/modals/AdminFormModal";
import { promotions } from "@/lib/admin/mock-data";
import { promotionFields } from "@/lib/admin/modal-configs";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function AgentPromotionsPage() {
  const [addOpen, setAddOpen] = useState(false);

  return (
    <AdminListPage
      title="Sales Promotions"
      tabs={["Active", "Expired", "All"]}
      keyField="id"
      data={promotions}
      action={
        <Button size="sm" className="h-9 gap-1" onClick={() => setAddOpen(true)}>
          <Plus className="h-4 w-4" />
          New Promotion
        </Button>
      }
      columns={[
        { key: "id", header: "ID" },
        { key: "name", header: "Promotion" },
        { key: "agent", header: "Agent" },
        { key: "discount", header: "Discount" },
        { key: "validTill", header: "Valid Till" },
        statusColumn("status"),
      ]}
    >
      <AdminFormModal
        open={addOpen}
        onOpenChange={setAddOpen}
        title="New Promotion"
        fields={promotionFields}
        submitLabel="Create Promotion"
      />
    </AdminListPage>
  );
}
