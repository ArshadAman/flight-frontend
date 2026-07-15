"use client";

import { AdminListPage } from "@/components/admin/AdminListPage";
import { staffMembers } from "@/lib/admin/mock-data";
import { Button } from "@/components/ui/button";
import { Calendar, Info, MoreVertical } from "lucide-react";

const rows = staffMembers.map((s, i) => ({
  id: String(23853 + i * 111),
  name: s.name,
  branchName: s.name.split(" ")[0],
  department: "Header",
  position: "----",
  totalAgents: [12, 8, 15, 6][i % 4],
  totalRevenue: [45000, 32000, 51000, 28000][i % 4],
  ticketsSold: [234, 180, 312, 95][i % 4],
}));

export default function StaffDataPage() {
  return (
    <AdminListPage
      title="Staff Data"
      subtitle={`${rows.length} Staff`}
      keyField="id"
      data={rows}
      action={
        <Button variant="outline" size="sm" className="h-9 gap-1.5 border-[#e8ebef] text-slate-600">
          <Calendar className="h-4 w-4" />
          Date Range
        </Button>
      }
      columns={[
        {
          key: "select",
          header: "",
          render: () => (
            <input type="checkbox" className="rounded border-slate-300" onClick={(e) => e.stopPropagation()} />
          ),
        },
        { key: "id", header: "Staff Id" },
        { key: "name", header: "Staff Name" },
        { key: "branchName", header: "Branch Name" },
        { key: "department", header: "Department" },
        { key: "position", header: "Position" },
        {
          key: "totalAgents",
          header: "Total Agents",
          render: (r) => `${r.totalAgents} Agents`,
        },
        {
          key: "totalRevenue",
          header: "Total Revenue",
          render: (r) => `₹${Number(r.totalRevenue).toLocaleString()}`,
        },
        {
          key: "ticketsSold",
          header: "Total Ticket Sold",
          render: (r) => `${r.ticketsSold} Tickets`,
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
