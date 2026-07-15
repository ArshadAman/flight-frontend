"use client";

import { useState } from "react";
import { AdminListPage } from "@/components/admin/AdminListPage";
import { BlockRoutesModal } from "@/components/admin/modals";
import { blockedRoutes } from "@/lib/admin/mock-data";
import { Button } from "@/components/ui/button";
import { Info, MoreVertical, Plus } from "lucide-react";

const rows = blockedRoutes.map((r, i) => ({
  ...r,
  id: String(23853 + i * 111),
  tripType: (["One Way", "Round Trip", "Multi-City"] as const)[i % 3],
}));

export default function BlockRoutesPage() {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <AdminListPage
        title="Block Routes"
        subtitle={`${rows.length} Blocked Routes`}
        tabs={["One Way", "Round Trip", "Multi-City"]}
        keyField="id"
        data={rows}
        action={
          <Button
            size="sm"
            className="h-9 gap-1 bg-[#006aec] hover:bg-[#006aec]/90"
            onClick={() => setModalOpen(true)}
          >
            <Plus className="h-4 w-4" />
            Block Route
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
          { key: "id", header: "Agent Id" },
          { key: "agent", header: "Agency Name" },
          { key: "route", header: "Route" },
          { key: "tripType", header: "Trip Type" },
          { key: "reason", header: "Reason" },
          { key: "blockedOn", header: "Blocked On" },
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
      <BlockRoutesModal open={modalOpen} onOpenChange={setModalOpen} />
    </>
  );
}
