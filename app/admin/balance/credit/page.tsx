"use client";

import { AdminListPage } from "@/components/admin/AdminListPage";
import { creditAccounts } from "@/lib/admin/mock-data";
import { Info, MoreVertical } from "lucide-react";

const agentNames = [
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

const rows = Array.from({ length: 19 }, (_, i) => ({
  id: String(23853 + i * 111).slice(0, 5),
  agentName: agentNames[i],
  walletBalance: [45000, 35000, 55000, 25000, 65000][i % 5],
  creditLimit: [45000, 35000, 55000, 25000, 65000][i % 5],
  lastTransaction: "22, Dec 2021, 12:30 PM",
  lastAmount: [45000, 35000, 55000, 25000, 65000][i % 5],
  status: i === 4 ? "inactive" : "active",
}));

export default function CreditBalancePage() {
  return (
    <AdminListPage
      title="Credit Balance"
      subtitle={`${rows.length} Agent`}
      tabs={["Active", "Inactive"]}
      keyField="id"
      data={rows}
      columns={[
        {
          key: "select",
          header: "",
          render: () => (
            <input type="checkbox" className="rounded border-slate-300" onClick={(e) => e.stopPropagation()} />
          ),
        },
        { key: "id", header: "Agent Id" },
        { key: "agentName", header: "Agent Name" },
        {
          key: "walletBalance",
          header: "Wallet Balance",
          render: (r) => `₹${Number(r.walletBalance).toLocaleString("en-IN")}`,
        },
        {
          key: "creditLimit",
          header: "Credit Limit",
          render: (r) => `₹${Number(r.creditLimit).toLocaleString("en-IN")}`,
        },
        { key: "lastTransaction", header: "Last Transaction" },
        {
          key: "lastAmount",
          header: "Last Transaction Amount",
          render: (r) => `₹${Number(r.lastAmount).toLocaleString("en-IN")}`,
        },
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
