"use client";

import { useCallback, useEffect, useState } from "react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminDataTable } from "@/components/admin/AdminDataTable";
import { AdminBadge } from "@/components/admin/AdminBadge";
import { AdminConfirmModal } from "@/components/admin/AdminConfirmModal";
import { AdminEmptyState, AdminLoadingState } from "@/components/admin/AdminEmptyState";
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { fetchSuppliers, setSupplierStatus, type SupplierRow } from "@/lib/admin/suppliersApi";
import type { AdminStatus } from "@/lib/admin/types";

export default function SupplierRequestsPage() {
  const { access, openAuthModal, isLoading } = useAuth();
  const [tab, setTab] = useState("All");
  const [data, setData] = useState<SupplierRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modal, setModal] = useState<{
    open: boolean;
    variant: "approve" | "deny";
    id: string;
  }>({ open: false, variant: "approve", id: "" });

  const load = useCallback(async () => {
    if (!access) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      setData(await fetchSuppliers(access));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load requests");
    } finally {
      setLoading(false);
    }
  }, [access]);

  useEffect(() => {
    if (isLoading) return;
    void load();
  }, [isLoading, load]);

  const handleConfirm = async () => {
    if (!access || !modal.id) return;
    try {
      await setSupplierStatus(access, modal.id, modal.variant);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Update failed");
    } finally {
      setModal((m) => ({ ...m, open: false }));
    }
  };

  const visible = data.filter((row) => {
    if (tab === "Pending") return row.status === "pending";
    if (tab === "Approved") return row.status === "approved";
    if (tab === "Denied") return row.status === "denied";
    return true;
  });

  return (
    <div className="flex min-h-full flex-col">
      <AdminPageHeader
        title="Supplier Requests"
        subtitle="Review and approve supplier onboarding"
        tabs={["All", "Pending", "Approved", "Denied"]}
        activeTab={tab}
        onTabChange={setTab}
      />
      <div className="flex-1 p-6">
        {!access && !isLoading && (
          <button type="button" onClick={openAuthModal} className="w-full text-left">
            <AdminEmptyState
              title="Admin login required"
              description="Sign in as admin to approve suppliers."
            />
          </button>
        )}
        {error && <p className="mb-3 text-sm text-rose-600">{error}</p>}
        {loading ? (
          <AdminLoadingState />
        ) : visible.length === 0 ? (
          <AdminEmptyState
            title="No supplier requests"
            description="Add a supplier from Agent's Add Suppliers. It appears here as pending."
          />
        ) : (
          <AdminDataTable
            keyField="id"
            data={visible}
            columns={[
              { key: "code", header: "Request ID" },
              { key: "name", header: "Supplier" },
              { key: "contact_name", header: "Contact", render: (r) => r.contact_name || r.phone || "—" },
              { key: "email", header: "Email", render: (r) => r.email || "—" },
              {
                key: "status",
                header: "Status",
                render: (r) => <AdminBadge status={r.status as AdminStatus} />,
              },
              {
                key: "created_at",
                header: "Submitted",
                render: (r) => (r.created_at ? r.created_at.slice(0, 10) : "—"),
              },
              { key: "inventory_count", header: "Inventory" },
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
        )}
      </div>
      <AdminConfirmModal
        open={modal.open}
        onOpenChange={(open) => setModal((m) => ({ ...m, open }))}
        variant={modal.variant}
        onConfirm={() => void handleConfirm()}
      />
    </div>
  );
}
