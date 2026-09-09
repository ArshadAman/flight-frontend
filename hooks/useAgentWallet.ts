"use client";

import { useCallback, useEffect, useState } from "react";
import { fetchAgentWallet, formatWalletBalance, type AgentWallet } from "@/lib/sale/agentWallet";
import { getPublicApiUrl } from "@/lib/apiConfig";
import { unwrapApiList, type OfflineTicketRow } from "@/lib/sale/offlinePortal";
import { useAuth } from "@/context/AuthContext";

export function useAgentWallet(access: string | null) {
  const { user } = useAuth();
  const [wallet, setWallet] = useState<AgentWallet | null>(null);
  const [loading, setLoading] = useState(false);

  const reload = useCallback(async () => {
    if (!access) {
      setWallet(null);
      return;
    }
    setLoading(true);
    try {
      const profileBalance = user?.wallet_balance;
      if (profileBalance != null && profileBalance !== "") {
        const n = Number(profileBalance);
        if (Number.isFinite(n)) {
          const currency = user?.wallet_currency || "INR";
          setWallet({
            balance: n,
            currency,
            source: "profile",
            formatted: formatWalletBalance(n, currency),
          });
        }
      }

      let ticketsSpend = 0;
      try {
        const apiBase = getPublicApiUrl();
        const res = await fetch(`${apiBase}/tickets/`, {
          headers: { Authorization: `Bearer ${access}` },
          cache: "no-store",
        });
        if (res.ok) {
          const json = await res.json();
          const tickets = unwrapApiList<OfflineTicketRow>(json);
          ticketsSpend = tickets
            .filter((t) => t.status === "CONFIRMED" || t.status === "PENDING")
            .reduce((sum, t) => sum + (Number(t.total_amount) || 0), 0);
        }
      } catch {
        // ignore spend probe
      }
      const next = await fetchAgentWallet(access, { ticketsSpend });
      setWallet(next);
    } catch {
      setWallet(null);
    } finally {
      setLoading(false);
    }
  }, [access, user?.wallet_balance, user?.wallet_currency]);

  useEffect(() => {
    void reload();
  }, [reload]);

  return { wallet, loading, reload };
}
