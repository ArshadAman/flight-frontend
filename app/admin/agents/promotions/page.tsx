"use client";

import { useState } from "react";
import { AdminListPage, statusColumn } from "@/components/admin/AdminListPage";
import { SalesPromotionModal } from "@/components/admin/modals";
import { promotions } from "@/lib/admin/mock-data";
import { Button } from "@/components/ui/button";
import { Info, MoreVertical, Plus } from "lucide-react";

const rows = promotions.map((p, i) => ({
  ...p,
  agentId: String(23853 + i * 111),
  month: "May",
  promoType: i === 0 ? "Sales" : "Travel",
}));

export default function AgentPromotionsPage() {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <AdminListPage
        title="Sales Promotion"
        subtitle={`${rows.length} Promotions`}
        tabs={["Sales", "Travel", "All"]}
        keyField="id"
        data={rows}
        action={
          <Button
            size="sm"
            className="h-9 gap-1 bg-[#006aec] hover:bg-[#006aec]/90"
            onClick={() => setModalOpen(true)}
          >
            <Plus className="h-4 w-4" />
            New Promotion
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
          { key: "agentId", header: "Agent Id" },
          { key: "name", header: "Sales Promotion" },
          { key: "agent", header: "Agency Name" },
          { key: "month", header: "Select Month" },
          { key: "discount", header: "Discount %" },
          { key: "promoType", header: "Type" },
          statusColumn("status"),
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
      <SalesPromotionModal open={modalOpen} onOpenChange={setModalOpen} />
    </>
  );
}
