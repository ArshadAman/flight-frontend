"use client";

import { AdminListPage, statusColumn } from "@/components/admin/AdminListPage";

const approved = [
  { id: "DEP-101", agent: "Ajay Travels", amount: 100000, approvedBy: "Lokesh Kumar", date: "2025-07-05", status: "approved" as const },
  { id: "DEP-102", agent: "Harshit B2B", amount: 250000, approvedBy: "Khushi Sharma", date: "2025-07-04", status: "approved" as const },
  { id: "DEP-103", agent: "Lokesh Flights", amount: 50000, approvedBy: "Lokesh Kumar", date: "2025-07-03", status: "approved" as const },
];

export default function ApprovedDepositPage() {
  return (
    <AdminListPage
      title="Approved Deposit"
      subtitle="3 integrations (9 accounts)"
      tabs={["All", "This Week", "This Month"]}
      keyField="id"
      data={approved}
      columns={[
        { key: "id", header: "Request ID" },
        { key: "agent", header: "Agent" },
        {
          key: "amount",
          header: "Amount",
          render: (r) => `₹${Number(r.amount).toLocaleString()}`,
        },
        { key: "approvedBy", header: "Approved By" },
        { key: "date", header: "Date" },
        statusColumn("status"),
      ]}
    />
  );
}
