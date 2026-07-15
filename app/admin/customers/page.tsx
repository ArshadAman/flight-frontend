"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { AdminListPage, statusColumn } from "@/components/admin/AdminListPage";
import { customers } from "@/lib/admin/mock-data";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function CustomersPage() {
  const router = useRouter();

  return (
    <AdminListPage
      title="Customer List"
      tabs={["All Customers", "Active", "Pending"]}
      keyField="id"
      data={customers}
      onRowClick={(row) => router.push(`/admin/customers/${row.id}`)}
      action={
        <Link href="/admin/customers/add">
          <Button size="sm" className="h-9 gap-1 bg-[#006aec] hover:bg-[#006aec]/90">
            <Plus className="h-4 w-4" />
            Add Customer
          </Button>
        </Link>
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
    />
  );
}
