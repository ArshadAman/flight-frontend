"use client";

import { AdminListPage } from "@/components/admin/AdminListPage";
import { creditAccounts } from "@/lib/admin/mock-data";
import { Info, MoreVertical, Plus } from "lucide-react";

const banks = ["HDFC", "SBI", "PNB", "IRDF"];

const rows = creditAccounts.map((a, i) => ({
  id: String(23853 + i * 111),
  txnDate: "22, Dec 2021 12:30 PM",
  bankName: banks[i % banks.length],
  agentName: a.agent,
  referenceNo: String(23853 + i * 111),
  amountType: i % 2 === 0 ? "credit" : "debit",
  amount: i % 2 === 0 ? 5000 : 2000,
  balance: a.available,
  screenshot: "Photo_1",
}));

export default function AccountsPage() {
  return (
    <AdminListPage
      title="Accounts"
      subtitle={`${rows.length} Accounts`}
      tabs={["All", "Credit", "Debit"]}
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
        { key: "id", header: "Transaction Id" },
        { key: "txnDate", header: "Txn Date" },
        { key: "bankName", header: "Bank Name" },
        { key: "agentName", header: "Agent Name" },
        { key: "referenceNo", header: "Reference no." },
        {
          key: "amount",
          header: "Credit / Debit Amount",
          render: (r) => (
            <span className={r.amountType === "credit" ? "text-emerald-600" : "text-red-600"}>
              {r.amountType === "credit" ? "Credit" : "Debit"}: {r.amountType === "credit" ? "+" : "-"}₹
              {Number(r.amount).toLocaleString()}
            </span>
          ),
        },
        {
          key: "balance",
          header: "Balance",
          render: (r) => `₹${Number(r.balance).toLocaleString()}`,
        },
        {
          key: "screenshot",
          header: "Screenshot",
          render: (r) => (
            <span className="inline-flex items-center gap-1 text-xs text-slate-600">
              {String(r.screenshot)} <Plus className="h-3 w-3" />
            </span>
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
