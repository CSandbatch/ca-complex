import { NextRequest, NextResponse } from "next/server";
import { createSession, hasValidOrigin, sessionFromRequest, setSessionCookie, validatePasscode } from "@/lib/server/session";

export const dynamic = "force-dynamic";

export function GET(request: NextRequest) {
  const session = sessionFromRequest(request);
  return NextResponse.json(
    { authenticated: Boolean(session), remaining: session?.remaining ?? 0 },
    { headers: { "Cache-Control": "no-store" } },
  );
}

export async function POST(request: NextRequest) {
  if (!hasValidOrigin(request)) return NextResponse.json({ error: "Origin is not allowed." }, { status: 403 });
  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Invalid JSON." }, { status: 400 }); }
  const passcode = typeof body === "object" && body && "passcode" in body ? String(body.passcode) : "";
  if (!validatePasscode(passcode)) {
    return NextResponse.json({ error: "Invalid passcode." }, { status: 401, headers: { "Cache-Control": "no-store" } });
  }
  const session = createSession();
  const response = NextResponse.json({ authenticated: true, remaining: session.remaining }, { headers: { "Cache-Control": "no-store" } });
  setSessionCookie(response, session);
  return response;
}
