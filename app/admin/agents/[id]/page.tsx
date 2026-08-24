"use client";

import { use } from "react";
import Link from "next/link";
import { AdminBadge } from "@/components/admin/AdminBadge";
import { agents } from "@/lib/admin/mock-data";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function AgentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const agent = agents.find((a) => a.id === id);
  const name = agent?.name || id.replace("AGT-", "Agent ");
  const status = agent?.status || "active";

  return (
    <div className="flex min-h-full flex-col">
      <div className="border-b border-[#e8ebef] bg-white px-6 py-5">
        <div className="flex items-center gap-4">
          <Link href="/admin/agents" className="rounded p-1 text-slate-500 hover:bg-slate-100">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-[#1c304a]">{name}</h1>
            <p className="text-sm text-slate-500">{id}</p>
          </div>
          <AdminBadge status={status} />
        </div>
      </div>
      <div className="grid gap-6 p-6 lg:grid-cols-3">
        <div className="rounded-lg border border-[#e8ebef] bg-white p-6 lg:col-span-2">
          <h3 className="mb-4 text-sm font-semibold text-[#1c304a]">Agent Information</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              ["Email", agent?.email || "—"],
              ["Phone", agent?.phone || "—"],
              ["Balance", agent ? `₹${agent.balance.toLocaleString("en-IN")}` : "₹45,000"],
              ["Credit Limit", "₹45,000"],
              ["Joined", agent?.joined || "22, Dec 2021"],
              ["Status", status],
            ].map(([k, v]) => (
              <div key={k}>
                <p className="text-xs text-slate-500">{k}</p>
                <p className="font-medium capitalize text-[#1c304a]">{v}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-lg border border-[#e8ebef] bg-white p-6">
          <h3 className="mb-4 text-sm font-semibold text-[#1c304a]">Quick Actions</h3>
          <div className="flex flex-col gap-2">
            <Link href={`/admin/api/agent/${id}/generated`}>
              <Button variant="outline" className="w-full justify-start border-[#e8ebef]">
                View Generated API
              </Button>
            </Link>
            <Link href={`/admin/api/agent/${id}`}>
              <Button variant="outline" className="w-full justify-start border-[#e8ebef]">
                View API Profile
              </Button>
            </Link>
            <Link href="/admin/balance/set-limit">
              <Button variant="outline" className="w-full justify-start border-[#e8ebef]">
                Set Credit Limit
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
