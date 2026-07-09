"use client";

import { use, useState } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminBadge } from "@/components/admin/AdminBadge";
import { AdminConfirmModal } from "@/components/admin/AdminConfirmModal";
import { queries } from "@/lib/admin/mock-data";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function QueryDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const query = queries.find((q) => q.id === id);
  const [closeOpen, setCloseOpen] = useState(false);

  if (!query) notFound();

  return (
    <div className="flex min-h-full flex-col">
      <div className="border-b border-slate-200 bg-white px-6 py-5">
        <div className="flex items-center gap-4">
          <Link href="/admin/queries" className="rounded p-1 text-slate-500 hover:bg-slate-100">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-slate-900">{query.subject}</h1>
            <p className="text-sm text-slate-500">{query.id}</p>
          </div>
          <AdminBadge status={query.status} />
        </div>
      </div>
      <div className="grid gap-6 p-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <div className="rounded-xl border border-slate-200 bg-white p-6">
            <h3 className="mb-3 font-bold">Conversation</h3>
            <div className="space-y-3">
              <div className="rounded-lg bg-slate-50 p-4 text-sm">
                <p className="font-medium">{query.customer}</p>
                <p className="mt-1 text-slate-600">I need help with: {query.subject.toLowerCase()}</p>
                <p className="mt-2 text-xs text-slate-400">{query.created}</p>
              </div>
              <div className="rounded-lg bg-[#f2fbff] p-4 text-sm">
                <p className="font-medium">{query.assignee} (Staff)</p>
                <p className="mt-1 text-slate-600">We are looking into this and will update you shortly.</p>
              </div>
            </div>
            <textarea
              className="mt-4 w-full rounded-md border border-slate-200 p-3 text-sm"
              rows={3}
              placeholder="Type your reply..."
            />
            <Button className="mt-2">Send Reply</Button>
          </div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <h3 className="mb-4 font-bold">Details</h3>
          <div className="space-y-3 text-sm">
            <div><span className="text-slate-500">Customer:</span> {query.customer}</div>
            <div><span className="text-slate-500">Agent:</span> {query.agent}</div>
            <div><span className="text-slate-500">Priority:</span> {query.priority}</div>
            <div><span className="text-slate-500">Assignee:</span> {query.assignee}</div>
            <div><span className="text-slate-500">Created:</span> {query.created}</div>
          </div>
          <Button variant="outline" className="mt-4 w-full" onClick={() => setCloseOpen(true)}>
            Mark as Closed
          </Button>
        </div>
      </div>
      <AdminConfirmModal
        open={closeOpen}
        onOpenChange={setCloseOpen}
        variant="confirm"
        title="Mark Query as Closed"
        description={`Close query "${query.subject}"? The customer will be notified.`}
        confirmLabel="Mark Closed"
        onConfirm={() => setCloseOpen(false)}
      />
    </div>
  );
}
