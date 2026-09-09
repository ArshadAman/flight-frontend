import { getPublicApiUrl } from "@/lib/apiConfig";
import { unwrapData } from "@/lib/apiEnvelope";

export type AgentWallet = {
  balance: number;
  currency: string;
  source: "api" | "profile" | "derived";
  formatted: string;
};

function parseAmount(value: unknown): number | null {
  if (value == null || value === "") return null;
  const n = typeof value === "number" ? value : Number(String(value).replace(/,/g, ""));
  return Number.isFinite(n) ? n : null;
}

export function formatWalletBalance(amount: number, currency = "INR") {
  try {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `₹ ${Math.round(amount).toLocaleString("en-IN")}`;
  }
}

/**
 * Resolve agent wallet for Sale navbar.
 * Prefer payments/wallet + profile.wallet_balance; fall back to derived credit line.
 */
export async function fetchAgentWallet(
  access: string,
  opts?: { ticketsSpend?: number }
): Promise<AgentWallet> {
  const apiBase = getPublicApiUrl();
  const headers = { Authorization: `Bearer ${access}` };

  try {
    const res = await fetch(`${apiBase}/payments/wallet/`, { headers, cache: "no-store" });
    if (res.ok) {
      const json = await res.json();
      const data = unwrapData<Record<string, unknown>>(json);
      const balance = parseAmount(data.balance);
      if (balance != null) {
        const currency = String(data.currency || "INR");
        return {
          balance,
          currency,
          source: "api",
          formatted: formatWalletBalance(balance, currency),
        };
      }
    }
  } catch {
    // continue
  }

  try {
    const res = await fetch(`${apiBase}/auth/profile/`, { headers, cache: "no-store" });
    if (res.ok) {
      const json = await res.json();
      const data = unwrapData<Record<string, unknown>>(json);
      const balance =
        parseAmount(data.wallet_balance) ??
        parseAmount(data.balance) ??
        parseAmount(data.credit_balance) ??
        parseAmount(data.available_balance);
      if (balance != null) {
        const currency = String(data.wallet_currency || data.currency || "INR");
        return {
          balance,
          currency,
          source: "profile",
          formatted: formatWalletBalance(balance, currency),
        };
      }
    }
  } catch {
    // continue
  }

  const opening = 124500;
  const spend = Math.max(0, opts?.ticketsSpend || 0);
  const balance = Math.max(0, opening - spend);
  return {
    balance,
    currency: "INR",
    source: "derived",
    formatted: formatWalletBalance(balance, "INR"),
  };
}
