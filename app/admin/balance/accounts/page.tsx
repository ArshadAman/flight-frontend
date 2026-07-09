"use client";

import { AdminListPage, statusColumn } from "@/components/admin/AdminListPage";
import { creditAccounts } from "@/lib/admin/mock-data";

export default function AccountsPage() {
  return (
    <AdminListPage
      title="Accounts"
      subtitle="Agent account overview"
      tabs={["All Accounts", "Active", "Suspended"]}
      keyField="id"
      data={creditAccounts}
      columns={[
        { key: "id", header: "Account ID" },
        { key: "agent", header: "Agent" },
        { key: "creditLimit", header: "Credit Limit", render: (r) => `₹${Number(r.creditLimit).toLocaleString()}` },
        { key: "used", header: "Balance Used", render: (r) => `₹${Number(r.used).toLocaleString()}` },
        { key: "available", header: "Available", render: (r) => `₹${Number(r.available).toLocaleString()}` },
        statusColumn("status"),
      ]}
    />
  );
}
