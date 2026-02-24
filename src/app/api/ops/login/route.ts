// POST /api/ops/login — Validate password, set HMAC-signed cookie

import { NextRequest, NextResponse } from "next/server";

const COOKIE_NAME = "ops_session";
const MAX_AGE_SEC = 24 * 60 * 60; // 24 hours

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { password } = body as { password?: string };

    const expected = process.env.OPS_DASH_PASSWORD;
    if (!expected) {
      return NextResponse.json(
        { error: "OPS_DASH_PASSWORD not configured" },
        { status: 500 }
      );
    }

    if (!password || password !== expected) {
      return NextResponse.json(
        { error: "Invalid password" },
        { status: 401 }
      );
    }

    // Build HMAC-signed cookie payload
    const payloadB64 = btoa(JSON.stringify({ ts: Date.now() }));
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(expected),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );
    const signatureBuffer = await crypto.subtle.sign(
      "HMAC",
      key,
      encoder.encode(payloadB64)
    );
    const signatureHex = Array.from(new Uint8Array(signatureBuffer))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    const cookieValue = `${payloadB64}.${signatureHex}`;

    const response = NextResponse.json({ ok: true });
    response.cookies.set(COOKIE_NAME, cookieValue, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: MAX_AGE_SEC,
    });

    return response;
  } catch {
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}
