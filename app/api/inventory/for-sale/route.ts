import { NextRequest, NextResponse } from "next/server";
import { getBackendApiUrl } from "@/lib/apiConfig";

export async function GET(request: NextRequest) {
  const backend = getBackendApiUrl();
  const { searchParams } = new URL(request.url);
  const qs = new URLSearchParams();
  const origin = searchParams.get("origin");
  const destination = searchParams.get("destination");
  const partner = searchParams.get("partner") || searchParams.get("agent");
  if (origin) qs.set("origin", origin);
  if (destination) qs.set("destination", destination);
  if (partner) qs.set("partner", partner);
  const suffix = qs.toString() ? `?${qs.toString()}` : "";

  try {
    const res = await fetch(`${backend}/api/v1/flights/for-sale/${suffix}`, {
      cache: "no-store",
      headers: { Accept: "application/json" },
    });
    const text = await res.text();
    let data: unknown = {};
    try {
      data = text ? JSON.parse(text) : {};
    } catch {
      data = { detail: text || "Invalid response from backend" };
    }
    if (!res.ok) {
      return NextResponse.json(
        typeof data === "object" && data ? data : { detail: "Failed to load For Sale inventory" },
        { status: res.status }
      );
    }
    const envelope =
      data && typeof data === "object"
        ? (data as { success?: boolean; data?: { results?: unknown[]; count?: number } })
        : {};
    const inner = envelope.success && envelope.data ? envelope.data : (data as { results?: unknown[]; count?: number });
    const results = Array.isArray(inner?.results) ? inner.results : Array.isArray(data) ? data : [];
    return NextResponse.json({ results, count: inner?.count ?? results.length });
  } catch (err) {
    const message = err instanceof Error ? err.message : "For Sale inventory unavailable";
    return NextResponse.json({ detail: message, results: [], count: 0 }, { status: 502 });
  }
}
