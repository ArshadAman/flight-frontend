import { getPublicApiUrl } from "@/lib/apiConfig";
import { unwrapData } from "@/lib/apiEnvelope";

export type AgentDashboardPayload = {
  greeting: string;
  subtitle: string;
  now: string;
  range?: string;
  workspace?: string;
  kpi: {
    total_revenue: number;
    total_revenue_display: string;
    total_booking: number;
    total_agents: number;
    wallet_balance: number;
    wallet_balance_display: string;
    wallet_currency: string;
    departures: number;
    inventory_listings: number;
    revenue_trend_pct: number;
    booking_trend_pct: number;
  };
  today: {
    total_booking: number;
    pending_booking: number;
    refund_request: number;
    waiting_list: number;
    schedule_change: number;
    payment_failure: number;
  };
  analytics: {
    revenue: number;
    revenue_display: string;
    booking: number;
    ticket_issued: number;
    profit: number;
    profit_display: string;
    chart_days: string[];
    chart_series: {
      revenue: number[];
      booking: number[];
      tickets: number[];
      profit: number[];
    };
  };
  booking_status: {
    total: number;
    segments: { label: string; count: number; value: number; color: string }[];
  };
  activities: {
    title: string;
    time: string;
    pnr: string;
    role: string;
    status: string;
    action_type?: string;
  }[];
  top_agents: { name: string; tag: string; revenue: string; growth: string }[];
  top_customers: { name: string; tag: string; revenue: string; growth: string }[];
  top_airlines: { name: string; flights: number; pct: number }[];
  top_routes: {
    from: string;
    to: string;
    revenue: string;
    revenue_raw?: number;
    pct: number;
    growth: string;
  }[];
  quick_actions: { label: string; href: string }[];
  schedule?: {
    date: string;
    time: string;
    title: string;
    desc: string;
    done: boolean;
  }[];
};

export async function fetchAgentDashboard(
  access: string,
  range: "24h" | "7d" | "30d" = "24h"
): Promise<AgentDashboardPayload> {
  const apiBase = getPublicApiUrl();
  const res = await fetch(`${apiBase}/agents/dashboard/?range=${range}`, {
    headers: { Authorization: `Bearer ${access}` },
    cache: "no-store",
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`Dashboard failed (${res.status}) ${detail}`);
  }
  const json = await res.json();
  return unwrapData<AgentDashboardPayload>(json);
}
