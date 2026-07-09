"use client";

import { useState } from "react";
import { AdminListPage } from "@/components/admin/AdminListPage";
import { AdminFormModal } from "@/components/admin/modals/AdminFormModal";
import { creditAccounts } from "@/lib/admin/mock-data";
import { updateLimitFields } from "@/lib/admin/modal-configs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function SetLimitPage() {
  const [updateOpen, setUpdateOpen] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<string>();

  return (
    <AdminListPage
      title="Set Limit"
      subtitle="Configure credit limits for agents"
      tabs={["All Agents", "Pending Changes"]}
      keyField="id"
      data={creditAccounts}
      columns={[
        { key: "agent", header: "Agent" },
        { key: "creditLimit", header: "Current Limit", render: (r) => `₹${Number(r.creditLimit).toLocaleString()}` },
        {
          key: "newLimit",
          header: "New Limit",
          render: () => <Input className="h-8 w-32 text-sm" placeholder="₹" />,
        },
        { key: "used", header: "Used", render: (r) => `₹${Number(r.used).toLocaleString()}` },
        {
          key: "action",
          header: "",
          render: (r) => (
            <Button
              size="sm"
              className="h-8"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedAgent(r.agent as string);
                setUpdateOpen(true);
              }}
            >
              Update
            </Button>
          ),
        },
      ]}
    >
      <AdminFormModal
        open={updateOpen}
        onOpenChange={setUpdateOpen}
        title={`Update Credit Limit${selectedAgent ? `: ${selectedAgent}` : ""}`}
        fields={updateLimitFields.map((f) =>
          f.name === "agent" && selectedAgent
            ? { ...f, defaultValue: selectedAgent }
            : f
        )}
        submitLabel="Update Limit"
      />
    </AdminListPage>
  );
}
