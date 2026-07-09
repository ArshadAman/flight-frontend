"use client";

import { AdminListPage, statusColumn } from "@/components/admin/AdminListPage";
import { agentMarkups } from "@/lib/admin/mock-data";

export default function AgentMarkupPage() {
  return (
    <AdminListPage
      title="Agent Markup"
      tabs={["All Agents", "Active"]}
      keyField="agent"
      data={agentMarkups}
      columns={[
        { key: "agent", header: "Agent" },
        { key: "domestic", header: "Domestic" },
        { key: "international", header: "International" },
        { key: "serviceFee", header: "Service Fee" },
        statusColumn("status"),
      ]}
    />
  );
}
