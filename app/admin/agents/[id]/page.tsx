"use client";

import { use } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
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
  if (!agent) notFound();

  return (
    <div className="flex min-h-full flex-col">
      <div className="border-b border-slate-200 bg-white px-6 py-5">
        <div className="flex items-center gap-4">
          <Link href="/admin/agents" className="rounded p-1 text-slate-500 hover:bg-slate-100">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-slate-900">{agent.name}</h1>
            <p className="text-sm text-slate-500">{agent.id}</p>
          </div>
          <AdminBadge status={agent.status} />
        </div>
      </div>
      <div className="grid gap-6 p-6 lg:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">
          <h3 className="mb-4 font-bold">Agent Information</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              ["Email", agent.email],
              ["Phone", agent.phone],
              ["Balance", `₹${agent.balance.toLocaleString()}`],
              ["Total Bookings", String(agent.bookings)],
              ["Joined", agent.joined],
              ["Status", agent.status],
            ].map(([k, v]) => (
              <div key={k}>
                <p className="text-xs text-slate-500">{k}</p>
                <p className="font-medium capitalize">{v}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="mb-4 font-bold">Quick Actions</h3>
          <div className="flex flex-col gap-2">
            <Link href={`/admin/api/agent/${agent.id}`}>
              <Button variant="outline" className="w-full justify-start">View API Profile</Button>
            </Link>
            <Link href="/admin/agents/markup">
              <Button variant="outline" className="w-full justify-start">Edit Markup</Button>
            </Link>
            <Link href="/admin/balance/set-limit">
              <Button variant="outline" className="w-full justify-start">Set Credit Limit</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
