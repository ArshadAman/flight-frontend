import { NextRequest, NextResponse } from "next/server";
import { getBackendApiUrl } from "@/lib/apiConfig";

export const dynamic = "force-dynamic";

async function proxyRequest(request: NextRequest, { params }: { params: Promise<{ path?: string[] }> }) {
  const resolvedParams = await params;
  const path = resolvedParams?.path || [];
  const backendBaseUrl = getBackendApiUrl();
  
  // Construct target URL
  let targetUrl = `${backendBaseUrl}/api/v1/bookings/group-bookings/`;
  if (path.length > 0) {
    targetUrl += `${path.join("/")}/`;
  }
  
  // Append query string if present
  const searchParams = request.nextUrl.searchParams.toString();
  if (searchParams) {
    targetUrl += `?${searchParams}`;
  }

  // Forward headers — including JWT for auth-filtered queries
  const headers = new Headers();
  headers.set("Content-Type", "application/json");

  // Forward X-Mock-Role for role-based permissions
  const mockRole = request.headers.get("x-mock-role") || request.headers.get("X-Mock-Role");
  if (mockRole) {
    headers.set("X-Mock-Role", mockRole);
  }

  // Forward JWT Authorization token so backend filters by the logged-in agent
  const authorization = request.headers.get("authorization") || request.headers.get("Authorization");
  if (authorization) {
    headers.set("Authorization", authorization);
  }

  // Read body if exists
  let body: string | undefined = undefined;
  if (request.method !== "GET" && request.method !== "HEAD") {
    try {
      const json = await request.json();
      body = JSON.stringify(json);
    } catch (e) {
      // Ignore if no body
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
    let data;
    try {
      data = await response.json();
    } catch (e) {
      const text = await response.text();
      data = { detail: text };
    }

    return NextResponse.json(data, { status });
  } catch (error: any) {
    console.error(`[BFF Proxy Error] Path: ${path.join("/")}, Error:`, error);
    return NextResponse.json(
      { detail: `Internal proxy error: ${error.message}` },
      { status: 500 }
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
