"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AdminListPage, statusColumn } from "@/components/admin/AdminListPage";
import { AdminFormModal } from "@/components/admin/modals/AdminFormModal";
import { staffMembers } from "@/lib/admin/mock-data";
import { addStaffFields } from "@/lib/admin/modal-configs";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function StaffListPage() {
  const router = useRouter();
  const [addOpen, setAddOpen] = useState(false);

  return (
    <AdminListPage
      title="Staff List"
      tabs={["All Staff", "Active", "Inactive"]}
      keyField="id"
      data={staffMembers}
      onRowClick={(row) => router.push(`/admin/staff/${row.id}`)}
      action={
        <Button size="sm" className="h-9 gap-1" onClick={() => setAddOpen(true)}>
          <Plus className="h-4 w-4" />
          Add Staff
        </Button>
      }
      columns={[
        { key: "id", header: "Staff ID" },
        { key: "name", header: "Name" },
        { key: "role", header: "Role" },
        { key: "department", header: "Department" },
        { key: "email", header: "Email" },
        { key: "phone", header: "Phone" },
        statusColumn("status"),
      ]}
    >
      <AdminFormModal
        open={addOpen}
        onOpenChange={setAddOpen}
        title="Add Staff"
        fields={addStaffFields}
        submitLabel="Add Staff"
      />
    </AdminListPage>
  );
}
