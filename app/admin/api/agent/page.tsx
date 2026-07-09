"use client";

import Link from "next/link";
import { useState } from "react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminDataTable } from "@/components/admin/AdminDataTable";
import { AdminBadge } from "@/components/admin/AdminBadge";
import { AdminFilterModal } from "@/components/admin/modals/AdminFilterModal";
import { AdminFormModal } from "@/components/admin/modals/AdminFormModal";
import { agents, apiIntegrations } from "@/lib/admin/mock-data";
import { generateApiFields } from "@/lib/admin/modal-configs";
import { Button } from "@/components/ui/button";
import { Plus, ArrowRight } from "lucide-react";

const agentApiList = agents.map((agent, i) => ({
  id: agent.id,
  name: agent.name,
  apiKey: `ak_live_${agent.id.toLowerCase().replace("-", "")}`,
  status: agent.status,
  requests: apiIntegrations[i % apiIntegrations.length]?.requests ?? 0,
  lastActive: "2 min ago",
}));

export default function AgentApiPage() {
  const [activeTab, setActiveTab] = useState("All Agents");
  const [filterOpen, setFilterOpen] = useState(false);
  const [generateOpen, setGenerateOpen] = useState(false);

  return (
    <div className="flex min-h-full flex-col">
      <AdminPageHeader
        title="Agent API"
        subtitle="3 integrations (9 accounts)"
        tabs={["All Agents", "Active", "Integrations Map"]}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onFilterClick={() => setFilterOpen(true)}
        action={
          <Button size="sm" className="h-9 gap-1" onClick={() => setGenerateOpen(true)}>
            <Plus className="h-4 w-4" />
            Generate API
          </Button>
        }
      />
      <div className="flex-1 p-6">
        <AdminDataTable
          keyField="id"
          data={agentApiList}
          columns={[
            { key: "id", header: "Agent ID" },
            { key: "name", header: "Agent Name" },
            { key: "apiKey", header: "API Key" },
            {
              key: "status",
              header: "Status",
              render: (r) => <AdminBadge status={r.status} />,
            },
            { key: "requests", header: "API Calls" },
            { key: "lastActive", header: "Last Active" },
            {
              key: "profile",
              header: "Profile",
              render: (r) => (
                <Link href={`/admin/api/agent/${r.id}`}>
                  <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 px-3 py-1 text-xs font-medium hover:bg-slate-50">
                    View Profile <ArrowRight className="h-3 w-3" />
                  </span>
                </Link>
              ),
            },
          ]}
        />
      </div>
      <AdminFilterModal open={filterOpen} onOpenChange={setFilterOpen} />
      <AdminFormModal
        open={generateOpen}
        onOpenChange={setGenerateOpen}
        title="Generate API Key"
        fields={generateApiFields}
        submitLabel="Generate"
      />
    </div>
  );
}
