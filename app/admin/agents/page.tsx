"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AdminListPage, statusColumn } from "@/components/admin/AdminListPage";
import { AdminFormModal } from "@/components/admin/modals/AdminFormModal";
import { agents } from "@/lib/admin/mock-data";
import { addAgentFields } from "@/lib/admin/modal-configs";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function AgentsPage() {
  const router = useRouter();
  const [addOpen, setAddOpen] = useState(false);

  return (
    <AdminListPage
      title="Agent List"
      subtitle="3 integrations (9 accounts)"
      tabs={["All Agents", "Active", "Integrations Map"]}
      keyField="id"
      data={agents}
      onRowClick={(row) => router.push(`/admin/agents/${row.id}`)}
      action={
        <Button size="sm" className="h-9 gap-1" onClick={() => setAddOpen(true)}>
          <Plus className="h-4 w-4" />
          Add Agent
        </Button>
      }
      columns={[
        { key: "id", header: "Agent ID" },
        { key: "name", header: "Name" },
        { key: "email", header: "Email" },
        { key: "phone", header: "Phone" },
        statusColumn("status"),
        { key: "balance", header: "Balance", render: (r) => `₹${Number(r.balance).toLocaleString()}` },
        { key: "bookings", header: "Bookings" },
        { key: "joined", header: "Joined" },
      ]}
    >
      <AdminFormModal
        open={addOpen}
        onOpenChange={setAddOpen}
        title="Add Agent"
        fields={addAgentFields}
        submitLabel="Add Agent"
      />
    </AdminListPage>
  );
}
