"use client";

import Link from "next/link";
import { useState } from "react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminDataTable } from "@/components/admin/AdminDataTable";
import { AdminBadge } from "@/components/admin/AdminBadge";
import { AdminConfirmModal } from "@/components/admin/AdminConfirmModal";
import { supplierRequests } from "@/lib/admin/mock-data";
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";

export default function SupplierRequestsPage() {
  const [modal, setModal] = useState<{
    open: boolean;
    variant: "approve" | "deny";
    id: string;
  }>({ open: false, variant: "approve", id: "" });
  const [data, setData] = useState(supplierRequests);

  const handleConfirm = () => {
    setData((prev) =>
      prev.map((r) =>
        r.id === modal.id
          ? { ...r, status: modal.variant === "approve" ? ("approved" as const) : ("denied" as const) }
          : r
      )
    );
    setModal({ ...modal, open: false });
  };

  return (
    <div className="flex min-h-full flex-col">
      <AdminPageHeader
        title="Supplier Requests"
        subtitle="Review and approve supplier onboarding"
        tabs={["All", "Pending", "Approved", "Denied"]}
      />
      <div className="flex-1 p-6">
        <AdminDataTable
          keyField="id"
          data={data}
          columns={[
            { key: "id", header: "Request ID" },
            { key: "supplier", header: "Supplier" },
            { key: "contact", header: "Contact" },
            { key: "email", header: "Email" },
            {
              key: "status",
              header: "Status",
              render: (r) => <AdminBadge status={r.status} />,
            },
            { key: "submitted", header: "Submitted" },
            { key: "inventory", header: "Inventory" },
            {
              key: "actions",
              header: "Actions",
              render: (r) =>
                r.status === "pending" ? (
                  <div className="flex gap-1">
                    <Button
                      size="xs"
                      variant="outline"
                      className="h-7 gap-1 text-emerald-600"
                      onClick={(e) => {
                        e.stopPropagation();
                        setModal({ open: true, variant: "approve", id: r.id });
                      }}
                    >
                      <Check className="h-3 w-3" /> Approve
                    </Button>
                    <Button
                      size="xs"
                      variant="outline"
                      className="h-7 gap-1 text-red-600"
                      onClick={(e) => {
                        e.stopPropagation();
                        setModal({ open: true, variant: "deny", id: r.id });
                      }}
                    >
                      <X className="h-3 w-3" /> Deny
                    </Button>
                  </div>
                ) : (
                  <span className="text-xs text-slate-400">—</span>
                ),
            },
          ]}
        />
      </div>
      <AdminConfirmModal
        open={modal.open}
        onOpenChange={(open) => setModal((m) => ({ ...m, open }))}
        variant={modal.variant}
        onConfirm={handleConfirm}
      />
    </div>
  );
}
