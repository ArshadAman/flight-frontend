"use client";

import { useState } from "react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminDataTable } from "@/components/admin/AdminDataTable";
import { AdminFilterModal } from "@/components/admin/modals/AdminFilterModal";
import { AdminFormModal } from "@/components/admin/modals/AdminFormModal";
import { permissions } from "@/lib/admin/mock-data";
import { addRoleFields } from "@/lib/admin/modal-configs";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function AdministrationPage() {
  const [addOpen, setAddOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);

  return (
    <div className="flex min-h-full flex-col">
      <AdminPageHeader
        title="Administration & Permission"
        subtitle="Manage roles and access control"
        onFilterClick={() => setFilterOpen(true)}
        action={
          <Button size="sm" className="h-9 gap-1" onClick={() => setAddOpen(true)}>
            <Plus className="h-4 w-4" />
            Add Role
          </Button>
        }
      />
      <div className="flex-1 space-y-6 p-6">
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            { label: "Total Roles", value: "4" },
            { label: "Active Users", value: "11" },
            { label: "Modules", value: "12" },
          ].map((s) => (
            <div
              key={s.label}
              className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
            >
              <p className="text-xs text-slate-500">{s.label}</p>
              <p className="mt-1 text-2xl font-bold text-slate-900">{s.value}</p>
            </div>
          ))}
        </div>
        <AdminDataTable
          keyField="role"
          data={permissions}
          columns={[
            { key: "role", header: "Role" },
            { key: "users", header: "Users" },
            { key: "modules", header: "Module Access" },
            { key: "lastUpdated", header: "Last Updated" },
          ]}
        />
      </div>
      <AdminFormModal
        open={addOpen}
        onOpenChange={setAddOpen}
        title="Add Role"
        fields={addRoleFields}
        submitLabel="Add Role"
      />
      <AdminFilterModal open={filterOpen} onOpenChange={setFilterOpen} />
    </div>
  );
}
