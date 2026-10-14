"use client";

import { useCallback, useEffect, useState } from "react";
import { AdminListPage } from "@/components/admin/AdminListPage";
import { AddSuppliersModal } from "@/components/admin/modals";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { fetchSuppliers, type SupplierRow } from "@/lib/admin/suppliersApi";

export default function AgentSuppliersPage() {
  const { access, openAuthModal, isLoading } = useAuth();
  const [modalOpen, setModalOpen] = useState(false);
  const [tab, setTab] = useState("All Suppliers");
  const [rows, setRows] = useState<SupplierRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!access) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      setRows(await fetchSuppliers(access));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load suppliers");
    } finally {
      setLoading(false);
    }
  }, [access]);

  useEffect(() => {
    if (isLoading) return;
    void load();
  }, [isLoading, load]);

  const visible = rows.filter((row) => {
    if (tab === "Active") return row.status === "approved";
    if (tab === "Pending") return row.status === "pending";
    return true;
  });

  return (
    <>
      {!access && !isLoading && (
        <div className="m-6 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          Sign in as admin to manage suppliers.{" "}
          <button type="button" className="font-bold underline" onClick={openAuthModal}>
            Login
          </button>
        </div>
      )}
      {error && <p className="px-6 pt-4 text-sm text-rose-600">{error}</p>}
      <AdminListPage
        title="Agent's Add Suppliers"
        subtitle={`${visible.length} Suppliers`}
        tabs={["All Suppliers", "Active", "Pending"]}
        activeTab={tab}
        onTabChange={setTab}
        keyField="id"
        loading={loading}
        emptyTitle="No suppliers yet"
        emptyDescription="Add a supplier. It stays pending until approved on Supplier Requests."
        data={visible.map((row) => ({
          id: row.id,
          supplierId: row.code || row.id.slice(0, 8),
          supplierName: row.name,
          contact: row.contact_name || row.phone || "—",
          email: row.email || "—",
          inventory: row.inventory_count,
          submitted: row.created_at ? row.created_at.slice(0, 10) : "—",
          status: row.status,
        }))}
        action={
          <Button
            size="sm"
            className="h-9 gap-1 bg-[#006aec] hover:bg-[#006aec]/90"
            onClick={() => setModalOpen(true)}
          >
            <Plus className="h-4 w-4" />
            Add Supplier
          </Button>
        }
        columns={[
          { key: "supplierId", header: "Supplier Id" },
          { key: "supplierName", header: "Name of Suppliers" },
          { key: "contact", header: "Contact" },
          { key: "email", header: "Email" },
          { key: "inventory", header: "Inventory" },
          { key: "status", header: "Status" },
          { key: "submitted", header: "Added On" },
        ]}
      />
      <AddSuppliersModal open={modalOpen} onOpenChange={setModalOpen} onCreated={() => void load()} />
    </>
  );
}
