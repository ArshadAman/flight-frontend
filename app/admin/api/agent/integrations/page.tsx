"use client";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { agents, apiIntegrations } from "@/lib/admin/mock-data";

const integrationMap = agents.flatMap((agent, i) =>
  apiIntegrations.slice(0, 2).map((api) => ({
    agent: agent.name,
    integration: api.name,
    type: api.type,
    status: api.status,
    connected: agent.joined,
  }))
);

export default function AgentIntegrationsMapPage() {
  return (
    <div className="flex min-h-full flex-col">
      <AdminPageHeader
        title="Integrations Map"
        subtitle="Agent to API integration mapping"
        tabs={["All", "Active", "Pending"]}
      />
      <div className="flex-1 p-6">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {integrationMap.map((item, i) => (
            <div
              key={i}
              className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <p className="font-bold text-slate-800">{item.agent}</p>
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                    item.status === "approved"
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-amber-50 text-amber-700"
                  }`}
                >
                  {item.status}
                </span>
              </div>
              <div className="mt-3 flex items-center gap-2 text-sm text-slate-600">
                <span className="rounded bg-slate-100 px-2 py-1">{item.integration}</span>
                <span>→</span>
                <span className="text-slate-500">{item.type}</span>
              </div>
              <p className="mt-2 text-xs text-slate-400">Connected: {item.connected}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
