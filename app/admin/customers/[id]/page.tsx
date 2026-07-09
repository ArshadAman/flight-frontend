"use client";

import { use } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminBadge } from "@/components/admin/AdminBadge";
import { customers } from "@/lib/admin/mock-data";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function CustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const customer = customers.find((c) => c.id === id);
  if (!customer) notFound();

  return (
    <div className="flex min-h-full flex-col">
      <div className="border-b border-slate-200 bg-white px-6 py-5">
        <div className="flex items-center gap-4">
          <Link href="/admin/customers" className="rounded p-1 text-slate-500 hover:bg-slate-100">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-slate-900">{customer.name}</h1>
            <p className="text-sm text-slate-500">{customer.id}</p>
          </div>
          <AdminBadge status={customer.status} />
        </div>
      </div>
      <div className="grid gap-6 p-6 lg:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-6 lg:col-span-2">
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              ["Email", customer.email],
              ["Phone", customer.phone],
              ["Bookings", String(customer.bookings)],
              ["API Access", customer.apiAccess ? "Enabled" : "Disabled"],
            ].map(([k, v]) => (
              <div key={k}>
                <p className="text-xs text-slate-500">{k}</p>
                <p className="font-medium">{v}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <Button className="w-full">Enable API Access</Button>
        </div>
      </div>
    </div>
  );
}
