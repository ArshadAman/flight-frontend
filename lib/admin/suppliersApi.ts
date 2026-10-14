import { getPublicApiUrl } from "@/lib/apiConfig";
import { unwrapList } from "@/lib/apiEnvelope";
import type { AdminStatus } from "@/lib/admin/types";

export type SupplierRow = {
  id: string;
  code: string;
  name: string;
  contact_name: string;
  email: string;
  phone: string;
  status: "pending" | "approved" | "denied" | AdminStatus;
  inventory_count: number;
  notes?: string;
  created_at?: string;
};

function headers(token: string) {
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
}

export async function fetchSuppliers(token: string, status?: string): Promise<SupplierRow[]> {
  const query = status ? `?status=${encodeURIComponent(status)}` : "";
  const res = await fetch(`${getPublicApiUrl()}/agents/suppliers/${query}`, {
    headers: headers(token),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Failed to load suppliers (${res.status})`);
  return unwrapList<SupplierRow>(await res.json());
}

export async function createSupplier(
  token: string,
  body: { name: string; contact_name?: string; email?: string; phone?: string; status?: string }
): Promise<SupplierRow> {
  const res = await fetch(`${getPublicApiUrl()}/agents/suppliers/`, {
    method: "POST",
    headers: headers(token),
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(detail || `Create failed (${res.status})`);
  }
  const json = await res.json();
  const data = json?.data ?? json;
  return data as SupplierRow;
}

export async function setSupplierStatus(
  token: string,
  id: string,
  action: "approve" | "deny"
): Promise<void> {
  const res = await fetch(`${getPublicApiUrl()}/agents/suppliers/${id}/${action}/`, {
    method: "POST",
    headers: headers(token),
  });
  if (!res.ok) throw new Error(`${action} failed (${res.status})`);
}
