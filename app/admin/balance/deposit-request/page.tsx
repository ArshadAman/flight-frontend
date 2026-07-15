"use client";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminDataTable } from "@/components/admin/AdminDataTable";
import { AdminBadge } from "@/components/admin/AdminBadge";
import { depositRequests } from "@/lib/admin/mock-data";
import { Info, MoreVertical } from "lucide-react";

const data = depositRequests.map((r, i) => ({
  ...r,
  depositId: String(23853 + i * 111),
  bankName: ["HDFC", "SBI", "IRDF", "PNB"][i % 4],
  paymentMode: r.method,
  referenceNo: r.ref,
  depositDate: `${r.date} 12:30 PM`,
}));

export default function DepositRequestPage() {
  return (
    <div className="flex min-h-full flex-col">
      <AdminPageHeader
        title="Deposit Request"
        subtitle={`${data.length} Agents`}
        tabs={["All request", "Approved", "Pending", "Reject"]}
      />
      <div className="flex-1 p-6">
        <AdminDataTable
          keyField="id"
          data={data}
          columns={[
            {
              key: "select",
              header: "",
              render: () => (
                <input type="checkbox" className="rounded border-slate-300" onClick={(e) => e.stopPropagation()} />
              ),
            },
            { key: "depositId", header: "Deposit Id" },
            { key: "agent", header: "Agent Name" },
            { key: "bankName", header: "Bank Name" },
            {
              key: "amount",
              header: "Amount",
              render: (r) => `₹${Number(r.amount).toLocaleString()}`,
            },
            { key: "paymentMode", header: "Payment Mode" },
            { key: "referenceNo", header: "Reference no." },
            { key: "depositDate", header: "Deposit Date" },
            {
              key: "status",
              header: "Status",
              render: (r) => <AdminBadge status={r.status} />,
            },
            {
              key: "actions",
              header: "",
              render: () => (
                <div className="flex items-center gap-2 text-slate-400">
                  <Info className="h-4 w-4" />
                  <MoreVertical className="h-4 w-4" />
                </div>
              ),
            },
          ]}
        />
      </div>
    </div>
  );
}
