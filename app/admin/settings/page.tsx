"use client";

import { useState } from "react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminConfirmModal } from "@/components/admin/AdminConfirmModal";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function SettingsPage() {
  const [saveOpen, setSaveOpen] = useState(false);

  return (
    <div className="flex min-h-full flex-col">
      <AdminPageHeader title="Settings" showSearch={false} showFilter={false} />
      <div className="flex-1 p-6">
        <div className="mx-auto max-w-2xl space-y-6">
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="mb-4 font-bold text-slate-800">General Settings</h3>
            <div className="grid gap-4">
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-500">Platform Name</label>
                <Input defaultValue="FyreFly" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-500">Support Email</label>
                <Input defaultValue="support@fyrefly.com" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-500">Default Currency</label>
                <Input defaultValue="INR (₹)" />
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="mb-4 font-bold text-slate-800">API Settings</h3>
            <div className="grid gap-4">
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-500">API Rate Limit (req/min)</label>
                <Input defaultValue="1000" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-500">Webhook URL</label>
                <Input placeholder="https://..." />
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="mb-4 font-bold text-slate-800">Notifications</h3>
            <div className="space-y-3">
              {["Email notifications", "SMS alerts", "Deposit request alerts", "Query assignment alerts"].map(
                (item) => (
                  <label key={item} className="flex items-center gap-3 text-sm text-slate-700">
                    <input type="checkbox" defaultChecked className="rounded border-slate-300" />
                    {item}
                  </label>
                )
              )}
            </div>
          </div>

          <Button onClick={() => setSaveOpen(true)}>Save Settings</Button>
        </div>
      </div>
      <AdminConfirmModal
        open={saveOpen}
        onOpenChange={setSaveOpen}
        variant="confirm"
        title="Save Settings"
        description="Are you sure you want to save these settings? Changes will apply immediately."
        confirmLabel="Save"
        onConfirm={() => setSaveOpen(false)}
      />
    </div>
  );
}
