"use client";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function AddAgentPage() {
  return (
    <div className="flex min-h-full flex-col">
      <AdminPageHeader title="Add Agent" showSearch={false} />
      <div className="flex-1 p-6">
        <div className="mx-auto max-w-2xl rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs font-medium text-slate-500">Agency Name</label>
              <Input placeholder="Enter agency name" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-500">Contact Person</label>
              <Input placeholder="Full name" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-500">Phone</label>
              <Input placeholder="+91" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-500">Email</label>
              <Input type="email" placeholder="email@agency.com" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-500">Credit Limit</label>
              <Input placeholder="₹500000" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-500">GST Number</label>
              <Input placeholder="GSTIN" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-500">City</label>
              <Input placeholder="City" />
            </div>
          </div>
          <div className="mt-6 flex gap-3">
            <Button>Create Agent</Button>
            <Link href="/admin/agents">
              <Button variant="outline">Cancel</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
