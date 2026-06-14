import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    { detail: "Logged out." },
    {
      status: 200,
      headers: {
        "Set-Cookie": "b2b_access_token=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0",
      },
    }
  );
}
