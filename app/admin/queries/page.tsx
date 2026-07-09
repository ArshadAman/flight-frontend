"use client";

import { useRouter } from "next/navigation";
import { AdminListPage, statusColumn } from "@/components/admin/AdminListPage";
import { queries } from "@/lib/admin/mock-data";
import { AdminBadge } from "@/components/admin/AdminBadge";

export default function QueriesPage() {
  const router = useRouter();

  return (
    <AdminListPage
      title="Queries"
      subtitle="Customer and agent support tickets"
      tabs={["All", "Open", "Closed"]}
      keyField="id"
      data={queries}
      onRowClick={(row) => router.push(`/admin/queries/${row.id}`)}
      columns={[
        { key: "id", header: "Query ID" },
        { key: "subject", header: "Subject" },
        { key: "customer", header: "Customer" },
        { key: "agent", header: "Agent" },
        {
          key: "priority",
          header: "Priority",
          render: (r) => (
            <AdminBadge
              status={r.priority === "High" ? "denied" : r.priority === "Medium" ? "pending" : "closed"}
              label={String(r.priority)}
            />
          ),
        },
        statusColumn("status"),
        { key: "assignee", header: "Assignee" },
        { key: "created", header: "Created" },
      ]}
    />
  );
}
