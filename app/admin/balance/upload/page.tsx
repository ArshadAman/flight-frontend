"use client";

import { AdminListPage, statusColumn } from "@/components/admin/AdminListPage";
import { depositRequests } from "@/lib/admin/mock-data";
import { Button } from "@/components/ui/button";

const uploads = [
  { id: "UB-001", agent: "Ajay Travels", amount: 50000, method: "Bank Transfer", date: "2025-07-08", status: "pending" as const },
  { id: "UB-002", agent: "Harshit B2B", amount: 125000, method: "UPI", date: "2025-07-07", status: "pending" as const },
  { id: "UB-003", agent: "Pranshu Agency", amount: 75000, method: "NEFT", date: "2025-07-06", status: "approved" as const },
];

export default function UploadBalancePage() {
  return (
    <AdminListPage
      title="Upload Balance"
      subtitle="3 integrations (9 accounts)"
      tabs={["All", "Pending", "Processed"]}
      keyField="id"
      data={uploads}
      columns={[
        { key: "id", header: "Upload ID" },
        { key: "agent", header: "Agent" },
        {
          key: "amount",
          header: "Amount",
          render: (r) => `₹${Number(r.amount).toLocaleString()}`,
        },
        { key: "method", header: "Method" },
        { key: "date", header: "Date" },
        statusColumn("status"),
        {
          key: "action",
          header: "",
          render: () => (
            <Button size="sm" className="h-8 bg-[#006aec] hover:bg-[#006aec]/90">
              Upload
            </Button>
          ),
        },
      ]}
    />
  );
}
