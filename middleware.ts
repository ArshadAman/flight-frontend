import { NextRequest, NextResponse } from "next/server";

// Middleware is intentionally minimal — auth is handled client-side via AuthContext
// Only block direct API abuse, not page navigation
export function middleware(request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: [],
};
