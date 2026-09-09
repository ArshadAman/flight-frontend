import { getPublicApiUrl } from "@/lib/apiConfig";
import {
  formatPortalDayMonthYear,
  unwrapApiList,
  type OfflineHoldRow,
  type OfflineTicketRow,
} from "@/lib/sale/offlinePortal";

export type HistoryEntry = {
  id: string;
  date: string;
  time: string;
  rawDate: Date;
  entry: string;
  agent: string;
  reference?: string;
};

function agentCodeFromUser(email?: string, name?: string, username?: string) {
  const base = (name || username || email || "AGT").replace(/[^a-zA-Z]/g, "").toUpperCase();
  return base.slice(0, 3) || "AGT";
}

function formatHistoryTime(iso: string | Date) {
  const d = typeof iso === "string" ? new Date(iso) : iso;
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", hour12: false });
}

function pushTicketHistory(
  rows: HistoryEntry[],
  tickets: OfflineTicketRow[],
  agent: string
) {
  for (const t of tickets) {
    const when = t.created_at;
    if (!when) continue;
    const d = new Date(when);
    const ref = t.pnr_number || t.booking_ref || t.id.slice(0, 6).toUpperCase();
    const route =
      t.origin && t.destination ? ` — ${t.origin}→${t.destination}` : "";

    if (t.status === "CONFIRMED" && t.pnr_number) {
      rows.push({
        id: `${t.id}-pnr`,
        rawDate: d,
        date: formatPortalDayMonthYear(when),
        time: formatHistoryTime(when),
        entry: `PNR Issued${route}`,
        agent,
        reference: ref,
      });
    } else if (t.status === "CANCELLED") {
      const cancelIso = t.updated_at || when;
      const cancelTime = new Date(cancelIso);
      rows.push({
        id: `${t.id}-cancel`,
        rawDate: cancelTime,
        date: formatPortalDayMonthYear(cancelIso),
        time: formatHistoryTime(cancelIso),
        entry: `Booking Cancelled${route}`,
        agent,
        reference: ref,
      });
    } else {
      rows.push({
        id: `${t.id}-created`,
        rawDate: d,
        date: formatPortalDayMonthYear(when),
        time: formatHistoryTime(when),
        entry: `Booking Created${route}`,
        agent,
        reference: ref,
      });
    }
  }
}

function pushHoldHistory(rows: HistoryEntry[], holds: OfflineHoldRow[], agent: string) {
  for (const h of holds) {
    const when = h.created_at;
    if (!when) continue;
    const route = h.inventory_route || "inventory";
    const seats = h.seats || 1;
    rows.push({
      id: `hold-${h.id}-created`,
      rawDate: new Date(when),
      date: formatPortalDayMonthYear(when),
      time: formatHistoryTime(when),
      entry: `Hold Created — ${seats} seat${seats > 1 ? "s" : ""} on ${route}`,
      agent,
      reference: h.id.slice(0, 6).toUpperCase(),
    });
    if (h.status === "CANCELLED" && h.updated_at) {
      rows.push({
        id: `hold-${h.id}-cancel`,
        rawDate: new Date(h.updated_at),
        date: formatPortalDayMonthYear(h.updated_at),
        time: formatHistoryTime(h.updated_at),
        entry: `Hold Cancelled — ${route}`,
        agent,
      });
    } else if (h.status === "EXPIRED" && h.expires_at) {
      rows.push({
        id: `hold-${h.id}-expired`,
        rawDate: new Date(h.expires_at),
        date: formatPortalDayMonthYear(h.expires_at),
        time: formatHistoryTime(h.expires_at),
        entry: `Hold Expired — ${route}`,
        agent,
      });
    }
  }
}

export async function fetchAgentHistory(
  access: string,
  opts: {
    agentName?: string;
    agentEmail?: string;
    agentUsername?: string;
  } = {}
): Promise<HistoryEntry[]> {
  const apiBase = getPublicApiUrl();
  const headers = { Authorization: `Bearer ${access}` };
  const agent = agentCodeFromUser(opts.agentEmail, opts.agentName, opts.agentUsername);

  try {
    const res = await fetch(`${apiBase}/agents/history/`, { headers, cache: "no-store" });
    if (res.ok) {
      const json = await res.json();
      const list = unwrapApiList<{
        id: string;
        entry: string;
        by_agent?: string;
        reference?: string;
        created_at: string;
      }>(json);
      if (list.length > 0) {
        return list
          .map((row) => {
            const d = new Date(row.created_at);
            return {
              id: String(row.id),
              rawDate: d,
              date: formatPortalDayMonthYear(row.created_at),
              time: formatHistoryTime(row.created_at),
              entry: row.entry,
              agent: row.by_agent || agent,
              reference: row.reference,
            } satisfies HistoryEntry;
          })
          .sort((a, b) => b.rawDate.getTime() - a.rawDate.getTime());
      }
    }
  } catch {
    // fall through to synthesized history
  }

  const [ticketRes, holdRes] = await Promise.all([
    fetch(`${apiBase}/tickets/`, { headers, cache: "no-store" }),
    fetch(`${apiBase}/flights/holds/`, { headers, cache: "no-store" }).catch(() => null),
  ]);

  const rows: HistoryEntry[] = [];
  if (ticketRes.ok) {
    const ticketJson = await ticketRes.json();
    pushTicketHistory(rows, unwrapApiList<OfflineTicketRow>(ticketJson), agent);
  }
  if (holdRes?.ok) {
    const holdJson = await holdRes.json();
    pushHoldHistory(rows, unwrapApiList<OfflineHoldRow>(holdJson), agent);
  }

  return rows.sort((a, b) => b.rawDate.getTime() - a.rawDate.getTime());
}
