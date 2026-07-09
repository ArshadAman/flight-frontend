"use client";

import { useState } from "react";
import { AdminListPage } from "@/components/admin/AdminListPage";
import { AdminFormModal } from "@/components/admin/modals/AdminFormModal";
import { blockedRoutes } from "@/lib/admin/mock-data";
import { blockRouteFields } from "@/lib/admin/modal-configs";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function BlockRoutesPage() {
  const [addOpen, setAddOpen] = useState(false);

  return (
    <AdminListPage
      title="Block Routes"
      tabs={["All", "By Agent"]}
      keyField="route"
      data={blockedRoutes}
      action={
        <Button size="sm" className="h-9 gap-1" onClick={() => setAddOpen(true)}>
          <Plus className="h-4 w-4" />
          Block Route
        </Button>
      }
      columns={[
        { key: "agent", header: "Agent" },
        { key: "route", header: "Route" },
        { key: "reason", header: "Reason" },
        { key: "blockedOn", header: "Blocked On" },
      ]}
    >
      <AdminFormModal
        open={addOpen}
        onOpenChange={setAddOpen}
        title="Block Route"
        fields={blockRouteFields}
        submitLabel="Block Route"
      />
    </AdminListPage>
  );
}
