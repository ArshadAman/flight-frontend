"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AdminListPage, statusColumn } from "@/components/admin/AdminListPage";
import { AdminFormModal } from "@/components/admin/modals/AdminFormModal";
import { customers } from "@/lib/admin/mock-data";
import { addCustomerFields } from "@/lib/admin/modal-configs";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function CustomersPage() {
  const router = useRouter();
  const [addOpen, setAddOpen] = useState(false);

  return (
    <AdminListPage
      title="Customer List"
      tabs={["All Customers", "Active", "Pending"]}
      keyField="id"
      data={customers}
      onRowClick={(row) => router.push(`/admin/customers/${row.id}`)}
      action={
        <Button size="sm" className="h-9 gap-1" onClick={() => setAddOpen(true)}>
          <Plus className="h-4 w-4" />
          Add Customer
        </Button>
      }
      columns={[
        { key: "id", header: "Customer ID" },
        { key: "name", header: "Name" },
        { key: "email", header: "Email" },
        { key: "phone", header: "Phone" },
        statusColumn("status"),
        { key: "bookings", header: "Bookings" },
        {
          key: "apiAccess",
          header: "API Access",
          render: (r) => (r.apiAccess ? "Yes" : "No"),
        },
      ]}
    >
      <AdminFormModal
        open={addOpen}
        onOpenChange={setAddOpen}
        title="Add Customer"
        fields={addCustomerFields}
        submitLabel="Add Customer"
      />
    </AdminListPage>
  );
}
