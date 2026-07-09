"use client";

import { useState } from "react";
import { AdminListPage } from "@/components/admin/AdminListPage";
import { AdminFormModal } from "@/components/admin/modals/AdminFormModal";
import { blockedAirlines } from "@/lib/admin/mock-data";
import { blockAirlineFields } from "@/lib/admin/modal-configs";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function BlockAirlinesPage() {
  const [addOpen, setAddOpen] = useState(false);

  return (
    <AdminListPage
      title="Block Airlines"
      tabs={["All", "By Agent"]}
      keyField="airline"
      data={blockedAirlines}
      action={
        <Button size="sm" className="h-9 gap-1" onClick={() => setAddOpen(true)}>
          <Plus className="h-4 w-4" />
          Block Airline
        </Button>
      }
      columns={[
        { key: "agent", header: "Agent" },
        { key: "airline", header: "Airline" },
        { key: "reason", header: "Reason" },
        { key: "blockedOn", header: "Blocked On" },
      ]}
    >
      <AdminFormModal
        open={addOpen}
        onOpenChange={setAddOpen}
        title="Block Airline"
        fields={blockAirlineFields}
        submitLabel="Block Airline"
      />
    </AdminListPage>
  );
}
