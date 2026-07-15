"use client";

import { useState } from "react";
import { AdminListPage, statusColumn } from "@/components/admin/AdminListPage";
import { CustomerMarkupModal } from "@/components/admin/modals";
import { agentMarkups } from "@/lib/admin/mock-data";
import { Button } from "@/components/ui/button";
import { Info, MoreVertical, Plus } from "lucide-react";

const rows = agentMarkups.map((m, i) => ({
  ...m,
  agentId: String(23853 + i * 111),
  updatedMarkup: m.domestic,
}));

export default function AgentMarkupPage() {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <AdminListPage
        title="Add Markup"
        subtitle={`${rows.length} Markups`}
        tabs={["All Agents", "Active"]}
        keyField="agentId"
        data={rows}
        action={
          <Button
            size="sm"
            className="h-9 gap-1 bg-[#006aec] hover:bg-[#006aec]/90"
            onClick={() => setModalOpen(true)}
          >
            <Plus className="h-4 w-4" />
            Add Markup
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
          { key: "agent", header: "Agency Name" },
          { key: "domestic", header: "Customer's Markup" },
          { key: "updatedMarkup", header: "Updated Markup" },
          { key: "serviceFee", header: "Markup Type" },
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
      <CustomerMarkupModal open={modalOpen} onOpenChange={setModalOpen} />
    </>
  );
}
