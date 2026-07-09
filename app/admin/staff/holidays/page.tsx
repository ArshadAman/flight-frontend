"use client";

import { useState } from "react";
import { AdminListPage, statusColumn } from "@/components/admin/AdminListPage";
import { AdminFormModal } from "@/components/admin/modals/AdminFormModal";
import { holidays } from "@/lib/admin/mock-data";
import { applyLeaveFields } from "@/lib/admin/modal-configs";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function StaffHolidaysPage() {
  const [leaveOpen, setLeaveOpen] = useState(false);

  return (
    <AdminListPage
      title="Holidays & Leaves"
      tabs={["All", "Pending", "Approved", "Rejected"]}
      keyField="id"
      data={holidays}
      action={
        <Button size="sm" className="h-9 gap-1" onClick={() => setLeaveOpen(true)}>
          <Plus className="h-4 w-4" />
          Apply Leave
        </Button>
      }
      columns={[
        { key: "id", header: "Leave ID" },
        { key: "staff", header: "Staff" },
        { key: "type", header: "Type" },
        { key: "from", header: "From" },
        { key: "to", header: "To" },
        { key: "days", header: "Days" },
        statusColumn("status"),
      ]}
    >
      <AdminFormModal
        open={leaveOpen}
        onOpenChange={setLeaveOpen}
        title="Apply Leave"
        fields={applyLeaveFields}
        submitLabel="Submit Leave"
      />
    </AdminListPage>
  );
}
