"use client";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminDataTable } from "@/components/admin/AdminDataTable";
import { AdminBadge } from "@/components/admin/AdminBadge";
import { AdminStatCard } from "@/components/admin/AdminStatCard";
import { creditAccounts } from "@/lib/admin/mock-data";
import { Wallet, TrendingUp, AlertTriangle } from "lucide-react";
import { useState } from "react";

export default function CreditBalancePage() {
  const [activeTab, setActiveTab] = useState("All Agents");
  const totalCredit = creditAccounts.reduce((s, a) => s + a.creditLimit, 0);
  const totalUsed = creditAccounts.reduce((s, a) => s + a.used, 0);

  return (
    <div className="flex min-h-full flex-col">
      <AdminPageHeader
        title="Credit Balance"
        tabs={["All Agents", "High Usage", "Low Balance"]}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />
      <div className="flex-1 space-y-6 p-6">
        <div className="grid gap-4 sm:grid-cols-3">
          <AdminStatCard title="Total Credit" value={`₹${(totalCredit / 100000).toFixed(1)}L`} icon={Wallet} />
          <AdminStatCard title="Total Used" value={`₹${(totalUsed / 100000).toFixed(1)}L`} icon={TrendingUp} />
          <AdminStatCard title="Utilization" value={`${((totalUsed / totalCredit) * 100).toFixed(0)}%`} icon={AlertTriangle} />
        </div>
        <AdminDataTable
          keyField="id"
          data={creditAccounts}
          columns={[
            { key: "id", header: "Account ID" },
            { key: "agent", header: "Agent" },
            { key: "creditLimit", header: "Credit Limit", render: (r) => `₹${Number(r.creditLimit).toLocaleString()}` },
            { key: "used", header: "Used", render: (r) => `₹${Number(r.used).toLocaleString()}` },
            { key: "available", header: "Available", render: (r) => `₹${Number(r.available).toLocaleString()}` },
            { key: "status", header: "Status", render: (r) => <AdminBadge status={r.status} /> },
          ]}
        />
      </div>
    </div>
  );
}
