import { NextRequest, NextResponse } from "next/server";
import { getBackendApiUrl } from "@/lib/apiConfig";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const backendBase = getBackendApiUrl();

    // Enforce password confirmation match server-side too
    if (body.password !== body.confirm_password) {
      return NextResponse.json({ detail: "Passwords do not match." }, { status: 400 });
    }

    // Always register as AGENT role for B2B portal
    const payload = {
      username: body.username,
      email: body.email,
      password: body.password,
      confirm_password: body.confirm_password,
      first_name: body.first_name || "",
      last_name: body.last_name || "",
      phone_number: body.phone_number || "",
      role: "AGENT",
    };

    const registerRes = await fetch(`${backendBase}/api/v1/auth/register/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      cache: "no-store",
    });

    const data = await registerRes.json();

    if (!registerRes.ok) {
      // Return the first validation error from Django
      const firstError = Object.values(data)[0];
      const message = Array.isArray(firstError) ? firstError[0] : (data.detail || "Registration failed.");
      return NextResponse.json({ detail: message }, { status: registerRes.status });
    }

    return NextResponse.json({ detail: "Account created successfully. You can now log in." }, { status: 201 });
  } catch (err: any) {
    console.error("[Auth Register Route Error]", err);
    return NextResponse.json({ detail: "Server error. Please try again." }, { status: 500 });
  }
}
