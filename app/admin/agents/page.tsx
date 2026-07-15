"use client";

import { useRouter } from "next/navigation";
import { AdminListPage } from "@/components/admin/AdminListPage";
import { agents } from "@/lib/admin/mock-data";
import { Info, MoreVertical } from "lucide-react";
const names = [
  "Ajay",
  "Vaibhav Gour",
  "Rahul Meena",
  "Kusum Meena",
  "Riya Roy",
  "Vaibhav Raj",
  "Rajat Singh",
  "Lokesh Gidwani",
  "Harshit Chirgania",
  "Priya Sharma",
  "Neha Gupta",
  "Vikram Patel",
  "Sneha Reddy",
  "Amit Sharma",
  "Deepak Singh",
  "Anita Verma",
  "Ravi Kumar",
  "Sanjay Mehta",
  "Pooja Agarwal",
];

const agentRows = Array.from({ length: 19 }, (_, i) => ({
  id: String(23853 + (i === 1 ? 111 : i === 2 ? 726 : i * 111)).slice(0, 5),
  agencyName: names[i % names.length],
  contactPerson: names[i % names.length],
  category: `Category "${(["A", "B", "C", "D"] as const)[i % 4]}"`,
  balance: [45000, 35000, 55000, 25000, 65000][i % 5],
  creditLimit: [45000, 35000, 55000, 25000, 65000][i % 5],
  lastTransaction: "22, Dec 2021, 12:30 PM",
  status: i === 4 ? "inactive" : "active",
}));

export default function AgentsPage() {
  const router = useRouter();

  return (
    <AdminListPage
      title="Agent s Lists"
      subtitle={`${agentRows.length} Agent s`}
      tabs={["All Agent s", "Active", "Inactive"]}
      keyField="id"
      data={agentRows}
      onRowClick={(row) => router.push(`/admin/agents/AGT-00${String(row.id).slice(-1)}`)}
      columns={[
        {
          key: "select",
          header: "",
          render: () => (
            <input type="checkbox" className="rounded border-slate-300" onClick={(e) => e.stopPropagation()} />
          ),
        },
        { key: "id", header: "Agent Id" },
        { key: "agencyName", header: "Agency Name" },
        { key: "contactPerson", header: "Contact Person" },
        { key: "category", header: "Category" },
        {
          key: "balance",
          header: "Balance",
          render: (r) => `₹${Number(r.balance).toLocaleString("en-IN")}`,
        },
        {
          key: "creditLimit",
          header: "Credit Limit",
          render: (r) => `₹${Number(r.creditLimit).toLocaleString("en-IN")}`,
        },
        { key: "lastTransaction", header: "Last Transactions" },
        {
          key: "actions",
          header: "Actions",
          render: () => (
            <div className="flex items-center gap-2 text-slate-400">
              <Info className="h-4 w-4" />
              <MoreVertical className="h-4 w-4" />
            </div>
          ),
        },
      ]}
    />
  );
}
