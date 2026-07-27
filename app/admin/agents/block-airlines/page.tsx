"use client";

import { useCallback, useEffect, useState } from "react";
import { AdminListPage } from "@/components/admin/AdminListPage";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { getPublicApiUrl } from "@/lib/apiConfig";
import { Plus, Trash2 } from "lucide-react";

type Restriction = {
  id: string;
  scope: string;
  airline_code: string;
  airline_name: string;
  reason: string;
  is_blocked: boolean;
  created_at: string;
  agent_username?: string | null;
};

export default function BlockAirlinesPage() {
  const { access } = useAuth();
  const [rows, setRows] = useState<Restriction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [airlineCode, setAirlineCode] = useState("");
  const [airlineName, setAirlineName] = useState("");
  const [reason, setReason] = useState("");

  const load = useCallback(async () => {
    if (!access) {
      setLoading(false);
      setError("Admin login required.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const api = getPublicApiUrl();
      const res = await fetch(`${api}/agents/restrictions/?scope=AIRLINE`, {
        headers: { Authorization: `Bearer ${access}` },
      });
      if (!res.ok) throw new Error(`Failed (${res.status})`);
      const json = await res.json();
      const list = Array.isArray(json) ? json : json.results || json.data || [];
      setRows(list);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, [access]);

  useEffect(() => {
    void load();
  }, [load]);

  const add = async () => {
    if (!airlineCode.trim()) return;
    const api = getPublicApiUrl();
    const res = await fetch(`${api}/agents/restrictions/`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${access}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        scope: "AIRLINE",
        airline_code: airlineCode.trim().toUpperCase(),
        airline_name: airlineName.trim(),
        reason: reason.trim() || "Blocked by admin",
        is_blocked: true,
      }),
    });
    if (!res.ok) {
      setError(`Create failed (${res.status})`);
      return;
    }
    setAirlineCode("");
    setAirlineName("");
    setReason("");
    await load();
  };

  const remove = async (id: string) => {
    const api = getPublicApiUrl();
    await fetch(`${api}/agents/restrictions/${id}/`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${access}` },
    });
    await load();
  };

  const data = rows.map((r) => ({
    ...r,
    blockedOn: r.created_at ? new Date(r.created_at).toLocaleDateString("en-IN") : "—",
    agent: r.agent_username || "Global",
  }));

  return (
    <div className="space-y-4">
      <div className="mx-6 mt-4 flex flex-wrap gap-2 rounded-2xl border border-slate-200 bg-white p-4">
        <input
          value={airlineCode}
          onChange={(e) => setAirlineCode(e.target.value)}
          placeholder="Airline code (6E)"
          className="rounded-lg border px-3 py-2 text-sm"
        />
        <input
          value={airlineName}
          onChange={(e) => setAirlineName(e.target.value)}
          placeholder="Airline name"
          className="rounded-lg border px-3 py-2 text-sm"
        />
        <input
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Reason"
          className="min-w-[180px] flex-1 rounded-lg border px-3 py-2 text-sm"
        />
        <Button size="sm" className="gap-1" onClick={() => void add()}>
          <Plus className="h-4 w-4" /> Block Airline
        </Button>
      </div>
      {error && <div className="mx-6 text-sm text-rose-600">{error}</div>}
      {loading ? (
        <div className="p-8 text-center text-slate-500">Loading…</div>
      ) : (
        <AdminListPage
          title="Block Airlines"
          subtitle={`${data.length} blocked airline rules (offline inventory)`}
          tabs={["All"]}
          keyField="id"
          data={data}
          columns={[
            { key: "airline_code", header: "Code" },
            { key: "airline_name", header: "Airline" },
            { key: "agent", header: "Scope" },
            { key: "reason", header: "Reason" },
            { key: "blockedOn", header: "Blocked On" },
            {
              key: "actions",
              header: "",
              render: (row) => (
                <button type="button" onClick={() => void remove(String(row.id))} className="text-rose-600">
                  <Trash2 className="h-4 w-4" />
                </button>
              ),
            },
          ]}
        />
      )}
    </div>
  );
}
