"use client";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminDataTable } from "@/components/admin/AdminDataTable";
import { AdminBadge } from "@/components/admin/AdminBadge";
import { AdminStatCard } from "@/components/admin/AdminStatCard";
import { apiIntegrations } from "@/lib/admin/mock-data";
import { Activity, CheckCircle, Clock, Plug } from "lucide-react";

export default function PlatformApiPage() {
  const approved = apiIntegrations.filter((a) => a.status === "approved").length;
  const pending = apiIntegrations.filter((a) => a.status === "pending").length;

  return (
    <div className="flex min-h-full flex-col">
      <AdminPageHeader
        title="Platform & API Center"
        subtitle="Monitor API health and integrations"
      />
      <div className="flex-1 space-y-6 p-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <AdminStatCard title="Total APIs" value={String(apiIntegrations.length)} icon={Plug} />
          <AdminStatCard title="Approved" value={String(approved)} icon={CheckCircle} />
          <AdminStatCard title="Pending" value={String(pending)} icon={Clock} />
          <AdminStatCard
            title="Total Requests"
            value="39.1K"
            icon={Activity}
            trend={{ value: "22% this week", positive: true }}
          />
        </div>
        <AdminDataTable
          keyField="id"
          data={apiIntegrations}
          columns={[
            { key: "id", header: "ID" },
            { key: "name", header: "Integration" },
            { key: "type", header: "Type" },
            { key: "provider", header: "Provider" },
            {
              key: "status",
              header: "Status",
              render: (r) => <AdminBadge status={r.status} />,
            },
            { key: "requests", header: "Requests" },
            { key: "lastSync", header: "Last Sync" },
          ]}
        />
      </div>
    </div>
  );
}
