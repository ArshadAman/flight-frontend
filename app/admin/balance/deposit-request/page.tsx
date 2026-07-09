"use client";

import { useState } from "react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminDataTable } from "@/components/admin/AdminDataTable";
import { AdminBadge } from "@/components/admin/AdminBadge";
import { AdminConfirmModal } from "@/components/admin/AdminConfirmModal";
import { depositRequests } from "@/lib/admin/mock-data";
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";

export default function DepositRequestPage() {
  const [modal, setModal] = useState<{
    open: boolean;
    variant: "approve" | "deny";
    id: string;
  }>({ open: false, variant: "approve", id: "" });
  const [data, setData] = useState(depositRequests);

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
        title="Deposit Request"
        subtitle="Review agent deposit requests"
        tabs={["All", "Pending", "Approved", "Rejected"]}
      />
      <div className="flex-1 p-6">
        <AdminDataTable
          keyField="id"
          data={data}
          columns={[
            { key: "id", header: "Request ID" },
            { key: "agent", header: "Agent" },
            { key: "amount", header: "Amount", render: (r) => `₹${Number(r.amount).toLocaleString()}` },
            { key: "method", header: "Method" },
            { key: "ref", header: "Reference" },
            { key: "date", header: "Date" },
            {
              key: "status",
              header: "Status",
              render: (r) => <AdminBadge status={r.status} />,
            },
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
                      <X className="h-3 w-3" /> Reject
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
        title={modal.variant === "approve" ? "Approve Deposit" : "Reject Deposit"}
        onConfirm={handleConfirm}
      />
    </div>
  );
}
