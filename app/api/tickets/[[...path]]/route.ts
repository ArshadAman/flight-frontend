import { NextRequest, NextResponse } from "next/server";
import { getBackendApiUrl } from "@/lib/apiConfig";

export const dynamic = "force-dynamic";

/**
 * Same-origin BFF proxy for ticket APIs (SSR get/add, etc.).
 * Avoids browser CORS failures when the Cloudflare tunnel flakes.
 */
async function proxyRequest(
  request: NextRequest,
  { params }: { params: Promise<{ path?: string[] }> }
) {
  const resolvedParams = await params;
  const path = resolvedParams?.path || [];
  const backendBaseUrl = getBackendApiUrl();

  let targetUrl = `${backendBaseUrl}/api/v1/tickets/`;
  if (path.length > 0) {
    targetUrl += `${path.join("/")}/`;
  }

  const searchParams = request.nextUrl.searchParams.toString();
  if (searchParams) {
    targetUrl += `?${searchParams}`;
  }

  const headers = new Headers();
  headers.set("Content-Type", "application/json");
  headers.set("Accept", "application/json");

  const authorization =
    request.headers.get("authorization") || request.headers.get("Authorization");
  if (authorization) {
    headers.set("Authorization", authorization);
  }

  let body: string | undefined;
  if (request.method !== "GET" && request.method !== "HEAD") {
    try {
      body = JSON.stringify(await request.json());
    } catch {
      body = undefined;
    }
  }

  try {
    const response = await fetch(targetUrl, {
      method: request.method,
      headers,
      body,
      cache: "no-store",
    });

    const status = response.status;
    const text = await response.text();
    let data: unknown = {};
    try {
      data = text ? JSON.parse(text) : {};
    } catch {
      data = { detail: text || "Invalid backend response" };
    }

    return NextResponse.json(data, { status });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Proxy error";
    console.error(`[Tickets BFF] ${request.method} ${targetUrl}:`, message);
    return NextResponse.json(
      {
        detail: `Backend unreachable via BFF: ${message}`,
        hint: "Check BACKEND_API_URL / Cloudflare tunnel.",
      },
      { status: 502 }
    );
  }
}

export {
  proxyRequest as GET,
  proxyRequest as POST,
  proxyRequest as PUT,
  proxyRequest as PATCH,
  proxyRequest as DELETE,
};
