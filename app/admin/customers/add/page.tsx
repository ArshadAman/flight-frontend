"use client";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function AddCustomerPage() {
  return (
    <div className="flex min-h-full flex-col">
      <AdminPageHeader title="Add Customer" showSearch={false} />
      <div className="flex-1 p-6">
        <div className="mx-auto max-w-2xl rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-500">Full Name</label>
              <Input placeholder="Customer name" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-500">Email</label>
              <Input type="email" placeholder="email@example.com" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-500">Phone</label>
              <Input placeholder="+91" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-500">Enable API Access</label>
              <Input placeholder="Yes / No" defaultValue="No" />
            </div>
          </div>
          <div className="mt-6 flex gap-3">
            <Button>Create Customer</Button>
            <Link href="/admin/customers">
              <Button variant="outline">Cancel</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
