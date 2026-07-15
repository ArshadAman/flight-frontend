"use client";

import { useState } from "react";
import { AdminListPage } from "@/components/admin/AdminListPage";
import { BlockAirlinesModal } from "@/components/admin/modals";
import { blockedAirlines } from "@/lib/admin/mock-data";
import { Button } from "@/components/ui/button";
import { Info, MoreVertical, Plus } from "lucide-react";

const rows = blockedAirlines.map((a, i) => ({
  ...a,
  id: String(23853 + i * 111),
  airlineClass: "Economy",
}));

export default function BlockAirlinesPage() {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <AdminListPage
        title="Block Airlines"
        subtitle={`${rows.length} Blocked Airlines`}
        tabs={["All", "By Agent"]}
        keyField="id"
        data={rows}
        action={
          <Button
            size="sm"
            className="h-9 gap-1 bg-[#006aec] hover:bg-[#006aec]/90"
            onClick={() => setModalOpen(true)}
          >
            <Plus className="h-4 w-4" />
            Block Airline
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
          { key: "airline", header: "Airline Name" },
          { key: "airlineClass", header: "Class" },
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
      <BlockAirlinesModal open={modalOpen} onOpenChange={setModalOpen} />
    </>
  );
}
