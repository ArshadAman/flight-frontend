"use client";

import { use } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminBadge } from "@/components/admin/AdminBadge";
import { staffMembers } from "@/lib/admin/mock-data";
import { ArrowLeft } from "lucide-react";

export default function StaffDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const staff = staffMembers.find((s) => s.id === id);
  if (!staff) notFound();

  return (
    <div className="flex min-h-full flex-col">
      <div className="border-b border-slate-200 bg-white px-6 py-5">
        <div className="flex items-center gap-4">
          <Link href="/admin/staff" className="rounded p-1 text-slate-500 hover:bg-slate-100">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-slate-900">{staff.name}</h1>
            <p className="text-sm text-slate-500">{staff.role} · {staff.department}</p>
          </div>
          <AdminBadge status={staff.status} />
        </div>
      </div>
      <div className="p-6">
        <div className="max-w-2xl rounded-xl border border-slate-200 bg-white p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              ["Staff ID", staff.id],
              ["Email", staff.email],
              ["Phone", staff.phone],
              ["Department", staff.department],
              ["Role", staff.role],
              ["Status", staff.status],
            ].map(([k, v]) => (
              <div key={k}>
                <p className="text-xs text-slate-500">{k}</p>
                <p className="font-medium capitalize">{v}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
