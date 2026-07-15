"use client";

import { useState } from "react";
import { AdminListPage, statusColumn } from "@/components/admin/AdminListPage";
import { AgentDiscountModal } from "@/components/admin/modals";
import { discounts } from "@/lib/admin/mock-data";
import { Button } from "@/components/ui/button";
import { Info, MoreVertical, Plus } from "lucide-react";

const rows = discounts.map((d, i) => ({
  ...d,
  agentId: String(23853 + i * 111),
  airlineName: "All",
  remark: "—",
}));

export default function AgentDiscountsPage() {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <AdminListPage
        title="Agent's Discount"
        subtitle={`${rows.length} Discounts`}
        tabs={["Active", "Expired", "All"]}
        keyField="id"
        data={rows}
        action={
          <Button
            size="sm"
            className="h-9 gap-1 bg-[#006aec] hover:bg-[#006aec]/90"
            onClick={() => setModalOpen(true)}
          >
            <Plus className="h-4 w-4" />
            Add Discount
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
          { key: "value", header: "Value in %" },
          { key: "type", header: "Airline Name" },
          { key: "code", header: "Airline type" },
          { key: "remark", header: "Remark" },
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
      <AgentDiscountModal open={modalOpen} onOpenChange={setModalOpen} />
    </>
  );
}
