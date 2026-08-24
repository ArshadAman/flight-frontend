"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { getPublicApiUrl } from "@/lib/apiConfig";
import {
  type OfflineHoldRow,
  type OfflineInventoryRow,
  type OfflineTicketRow,
  unwrapApiList,
} from "@/lib/sale/offlinePortal";

export function useAgentOfflineData(access: string | null) {
  const [inventory, setInventory] = useState<OfflineInventoryRow[]>([]);
  const [tickets, setTickets] = useState<OfflineTicketRow[]>([]);
  const [holds, setHolds] = useState<OfflineHoldRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!access) {
      setInventory([]);
      setTickets([]);
      setHolds([]);
      setLoading(false);
      setError(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const apiBase = getPublicApiUrl();
      const headers = { Authorization: `Bearer ${access}` };
      const [invRes, ticketRes, holdRes] = await Promise.all([
        fetch(`${apiBase}/flights/inventory/`, { headers, cache: "no-store" }),
        fetch(`${apiBase}/tickets/`, { headers, cache: "no-store" }),
        fetch(`${apiBase}/flights/holds/`, { headers, cache: "no-store" }).catch(() => null),
      ]);
      if (!invRes.ok) throw new Error(`Failed to load inventory (${invRes.status})`);
      if (!ticketRes.ok) throw new Error(`Failed to load bookings (${ticketRes.status})`);
      const invJson = await invRes.json();
      const ticketJson = await ticketRes.json();
      setInventory(unwrapApiList<OfflineInventoryRow>(invJson));
      setTickets(unwrapApiList<OfflineTicketRow>(ticketJson));
      if (holdRes?.ok) {
        const holdJson = await holdRes.json();
        setHolds(unwrapApiList<OfflineHoldRow>(holdJson));
      } else {
        setHolds([]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load offline data");
      setInventory([]);
      setTickets([]);
      setHolds([]);
    } finally {
      setLoading(false);
    }
  }, [access]);

  useEffect(() => {
    void load();
  }, [load]);

  const bookedByInventory = useMemo(() => {
    const map = new Map<string, number>();
    for (const t of tickets) {
      if (!t.agent_flight_inventory || t.status === "CANCELLED") continue;
      const key = String(t.agent_flight_inventory);
      map.set(key, (map.get(key) || 0) + 1);
    }
    return map;
  }, [tickets]);

  const ticketsForInventory = useCallback(
    (inventoryId: string) =>
      tickets.filter(
        (t) =>
          String(t.agent_flight_inventory) === String(inventoryId) &&
          t.status !== "CANCELLED"
      ),
    [tickets]
  );

  return {
    inventory,
    tickets,
    holds,
    loading,
    error,
    reload: load,
    bookedByInventory,
    ticketsForInventory,
  };
}
