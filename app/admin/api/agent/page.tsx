"use client";

import Link from "next/link";
import { AdminListPage } from "@/components/admin/AdminListPage";
import { agents } from "@/lib/admin/mock-data";
import { Button } from "@/components/ui/button";
import { ArrowRight, Info, MoreVertical } from "lucide-react";

const rows = agents.map((a, i) => ({
  id: a.id,
  agentId: String(23853 + i * 111),
  name: a.name.split(" ")[0],
  agencyName: a.name.includes(" ") ? a.name.split(" ").slice(1).join(" ") || "Wordlight" : "Wordlight",
  apiKey: `#${1212 + i}VC`,
  date: "22, Dec 2021",
  time: "12:30 PM",
}));

export default function AgentApiPage() {
  return (
    <AdminListPage
      title="AgentAPI"
      subtitle={`${rows.length} Customers`}
      tabs={["All Customers", "Generated API", "Non-Generated API"]}
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
        { key: "agentId", header: "AgentId" },
        { key: "name", header: "Agent Name" },
        { key: "agencyName", header: "Agency Name" },
        { key: "apiKey", header: "API key" },
        {
          key: "date",
          header: "Date",
          render: (r) => (
            <div>
              <p className="text-sm">{String(r.date)}</p>
              <p className="text-xs text-slate-400">{String(r.time)}</p>
            </div>
          ),
        },
        {
          key: "actions",
          header: "Action",
          render: (r) => (
            <div className="flex flex-wrap items-center gap-2">
              <Button size="sm" className="h-8 gap-1 bg-[#5ba3f5] hover:bg-[#5ba3f5]/90">
                Generate API <ArrowRight className="h-3 w-3" />
              </Button>
              <Link href={`/admin/api/agent/${r.id}`} onClick={(e) => e.stopPropagation()}>
                <Button size="sm" className="h-8 gap-1 bg-[#006aec] hover:bg-[#006aec]/90">
                  View Profile <ArrowRight className="h-3 w-3" />
                </Button>
              </Link>
              <Info className="h-4 w-4 text-slate-400" />
              <MoreVertical className="h-4 w-4 text-slate-400" />
            </div>
          ),
        },
      ]}
    />
  );
}
