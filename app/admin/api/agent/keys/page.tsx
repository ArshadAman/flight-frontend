"use client";

import { AdminListPage } from "@/components/admin/AdminListPage";
import { agents } from "@/lib/admin/mock-data";
import { Button } from "@/components/ui/button";
import { Plus, Copy } from "lucide-react";

const apiKeys = agents.map((agent) => ({
  id: agent.id,
  agent: agent.name,
  key: `ak_live_${agent.id.toLowerCase().replace("-", "")}_••••••••`,
  created: agent.joined,
  lastUsed: "2 min ago",
  status: agent.status,
}));

export default function AgentApiKeysPage() {
  return (
    <AdminListPage
      title="Agent API Keys"
      subtitle="Manage and rotate API keys"
      tabs={["All Keys", "Active", "Revoked"]}
      keyField="id"
      data={apiKeys}
      action={
        <Button size="sm" className="h-9 gap-1">
          <Plus className="h-4 w-4" />
          Generate Key
        </Button>
      }
      columns={[
        { key: "agent", header: "Agent" },
        { key: "key", header: "API Key" },
        { key: "created", header: "Created" },
        { key: "lastUsed", header: "Last Used" },
        {
          key: "actions",
          header: "",
          render: () => (
            <Button size="xs" variant="outline" className="h-7 gap-1">
              <Copy className="h-3 w-3" /> Copy
            </Button>
          ),
        },
      ]}
    />
  );
}
