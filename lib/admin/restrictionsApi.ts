import { getPublicApiUrl } from "@/lib/apiConfig";
import { unwrapList } from "@/lib/apiEnvelope";

export type InventoryRestriction = {
  id: string;
  scope: "AIRLINE" | "ROUTE" | string;
  airline_code?: string;
  airline_name?: string;
  origin?: string;
  destination?: string;
  reason?: string;
  is_blocked?: boolean;
  agent?: string | null;
  agent_username?: string | null;
  created_at?: string;
};

function headers(token: string) {
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
}

export async function fetchRestrictions(
  token: string,
  scope: "AIRLINE" | "ROUTE"
): Promise<InventoryRestriction[]> {
  const res = await fetch(`${getPublicApiUrl()}/agents/restrictions/?scope=${scope}`, {
    headers: headers(token),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Failed to load restrictions (${res.status})`);
  return unwrapList<InventoryRestriction>(await res.json());
}

export async function createRestriction(
  token: string,
  body: Record<string, unknown>
): Promise<void> {
  const res = await fetch(`${getPublicApiUrl()}/agents/restrictions/`, {
    method: "POST",
    headers: headers(token),
    body: JSON.stringify({ is_blocked: true, reason: "Blocked by admin", ...body }),
  });
  if (!res.ok) throw new Error(`Create failed (${res.status})`);
}

export async function deleteRestriction(token: string, id: string): Promise<void> {
  await fetch(`${getPublicApiUrl()}/agents/restrictions/${id}/`, {
    method: "DELETE",
    headers: headers(token),
  });
}
