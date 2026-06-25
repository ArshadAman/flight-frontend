import { NextRequest, NextResponse } from "next/server";
import { getBackendApiUrl } from "@/lib/apiConfig";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const backendBase = getBackendApiUrl();

    // Step 1: Get JWT tokens from Django
    const tokenRes = await fetch(`${backendBase}/api/v1/auth/login/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: body.username, password: body.password }),
      cache: "no-store",
    });

    if (!tokenRes.ok) {
      const errData = await tokenRes.json().catch(() => ({}));
      // Django JWT returns 401 with { detail: "No active account found..." }
      return NextResponse.json(
        { detail: errData?.detail || "Invalid username or password." },
        { status: 401 }
      );
    }

    const tokens = await tokenRes.json();
    const accessToken = tokens?.data?.access || tokens?.access;
    const refreshToken = tokens?.data?.refresh || tokens?.refresh;

    if (!accessToken) {
      return NextResponse.json({ detail: "Authentication failed. No token returned." }, { status: 401 });
    }

    // Step 2: Fetch the user profile with the access token
    const profileRes = await fetch(`${backendBase}/api/v1/auth/profile/`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      cache: "no-store",
    });

    if (!profileRes.ok) {
      return NextResponse.json({ detail: "Failed to fetch user profile." }, { status: 500 });
    }

    const profileData = await profileRes.json();
    const profile = profileData?.data || profileData;

    // Step 3: Enforce that only AGENT or ADMIN can access the B2B portal
    if (!["AGENT", "ADMIN"].includes(profile.role)) {
      return NextResponse.json(
        { detail: "Access denied. This portal is for B2B agents and administrators only." },
        { status: 403 }
      );
    }

    return NextResponse.json(
      {
        access: accessToken,
        refresh: refreshToken,
        user: {
          id: profile.id,
          username: profile.username,
          name: profile.first_name
            ? `${profile.first_name} ${profile.last_name || ""}`.trim()
            : profile.username,
          email: profile.email,
          role: profile.role,
        },
      },
      {
        status: 200,
        headers: {
          // httpOnly cookie so middleware can gate /b2b routes server-side
          "Set-Cookie": `b2b_access_token=${accessToken}; Path=/; HttpOnly; SameSite=Strict; Max-Age=3600`,
        },
      }
    );
  } catch (err: any) {
    console.error("[Auth Login Route Error]", err);
    return NextResponse.json(
      { detail: "Server error. Please try again." },
      { status: 500 }
    );
  }
}
