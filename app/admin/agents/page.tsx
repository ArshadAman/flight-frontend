"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AdminListPage } from "@/components/admin/AdminListPage";
import { ChevronsUpDown, Info, MoreVertical } from "lucide-react";

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
  id: `AGT-${String(i + 1).padStart(3, "0")}`,
  agentId: String(23853 + (i === 1 ? 111 : i === 2 ? 726 : i * 111)).slice(0, 5),
  agencyName: names[i % names.length],
  contactPerson: names[i % names.length],
  category: `Category “${(["A", "B", "C", "D"] as const)[i % 4]}”`,
  balance: [45000, 35000, 55000, 25000, 65000][i % 5],
  creditLimit: [45000, 35000, 55000, 25000, 65000][i % 5],
  lastDate: "22, Dec 2021",
  lastTime: "12:30 PM",
  status: i === 4 ? "inactive" : "active",
}));

function SortHeader({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-1">
      {label}
      <ChevronsUpDown className="h-3 w-3 text-slate-400" />
    </span>
  );
}

export default function AgentsPage() {
  const router = useRouter();
  const [tab, setTab] = useState("Active");

  const filtered = useMemo(() => {
    if (tab === "Inactive") return agentRows.filter((r) => r.status === "inactive");
    if (tab === "Active") return agentRows.filter((r) => r.status === "active");
    return agentRows;
  }, [tab]);

  return (
    <AdminListPage
      title="Agent s Lists"
      subtitle={`${filtered.length} Agent s`}
      tabs={["All Agent s", "Active", "Inactive"]}
      activeTab={tab}
      onTabChange={setTab}
      keyField="id"
      data={filtered}
      onRowClick={(row) => router.push(`/admin/agents/${row.id}`)}
      columns={[
        {
          key: "select",
          header: "",
          render: () => (
            <input type="checkbox" className="rounded border-slate-300" onClick={(e) => e.stopPropagation()} />
          ),
        },
        { key: "agentId", header: <SortHeader label="Agent Id" /> },
        { key: "agencyName", header: <SortHeader label="Agency Name" /> },
        { key: "contactPerson", header: <SortHeader label="Contact Person" /> },
        { key: "category", header: <SortHeader label="Category" /> },
        {
          key: "balance",
          header: <SortHeader label="Balance" />,
          render: (r) => `₹${Number(r.balance).toLocaleString("en-IN")}`,
        },
        {
          key: "creditLimit",
          header: <SortHeader label="Credit Limit" />,
          render: (r) => `₹${Number(r.creditLimit).toLocaleString("en-IN")}`,
        },
        {
          key: "lastDate",
          header: <SortHeader label="Last Transactions" />,
          render: (r) => (
            <div>
              <p>{String(r.lastDate)}</p>
              <p className="text-xs text-slate-400">{String(r.lastTime)}</p>
            </div>
          ),
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
  );
}
