"use client";

import { AdminListPage, statusColumn } from "@/components/admin/AdminListPage";
import { staffMembers } from "@/lib/admin/mock-data";

export default function StaffDataPage() {
  return (
    <AdminListPage
      title="Staff Data"
      subtitle="Performance and activity overview"
      tabs={["Overview", "Performance", "Attendance"]}
      keyField="id"
      data={staffMembers}
      columns={[
        { key: "id", header: "Staff ID" },
        { key: "name", header: "Name" },
        { key: "role", header: "Role" },
        { key: "department", header: "Department" },
        { key: "email", header: "Email" },
        statusColumn("status"),
        {
          key: "queries",
          header: "Queries Handled",
          render: (r) => [42, 28, 35, 19][r.id.charCodeAt(4) % 4],
        },
      ]}
    />
  );
}
