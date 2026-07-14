import { createHash, createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import type { NextRequest, NextResponse } from "next/server";

export const COOKIE_NAME = "card_commons_pilot";
const EIGHT_HOURS = 8 * 60 * 60;
const DEFAULT_ALLOWANCE = 20;

/** Per-session image budget. Configurable via PILOT_IMAGE_ALLOWANCE (1–200). */
export function imageAllowance(): number {
  const raw = Number(process.env.PILOT_IMAGE_ALLOWANCE);
  if (!Number.isFinite(raw)) return DEFAULT_ALLOWANCE;
  return Math.min(200, Math.max(1, Math.floor(raw)));
}

export interface PilotSession {
  exp: number;
  remaining: number;
  nonce: string;
}

function secret() {
  const value = process.env.SESSION_SIGNING_SECRET;
  if (value) return value;
  if (process.env.NODE_ENV !== "production") return "local-development-only-secret";
  throw new Error("SESSION_SIGNING_SECRET is required.");
}

function encode(value: string | Buffer) {
  return Buffer.from(value).toString("base64url");
}

export function signSession(session: PilotSession) {
  const payload = encode(JSON.stringify(session));
  const signature = createHmac("sha256", secret()).update(payload).digest();
  return `${payload}.${encode(signature)}`;
}

export function verifySession(token?: string): PilotSession | null {
  if (!token) return null;
  const [payload, provided] = token.split(".");
  if (!payload || !provided) return null;
  const expected = createHmac("sha256", secret()).update(payload).digest();
  const received = Buffer.from(provided, "base64url");
  if (received.length !== expected.length || !timingSafeEqual(received, expected)) return null;
  try {
    const session = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as PilotSession;
    if (session.exp <= Math.floor(Date.now() / 1000) || session.remaining < 0) return null;
    return session;
  } catch {
    return null;
  }
}

export function createSession(): PilotSession {
  return {
    exp: Math.floor(Date.now() / 1000) + EIGHT_HOURS,
    remaining: imageAllowance(),
    nonce: randomBytes(12).toString("hex"),
  };
}

export function setSessionCookie(response: NextResponse, session: PilotSession) {
  response.cookies.set(COOKIE_NAME, signSession(session), {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: Math.max(0, session.exp - Math.floor(Date.now() / 1000)),
  });
}

export function sessionFromRequest(request: NextRequest) {
  return verifySession(request.cookies.get(COOKIE_NAME)?.value);
}

export function validatePasscode(passcode: string) {
  const configured = process.env.PILOT_ACCESS_HASH;
  const expectedHex = configured || (process.env.NODE_ENV !== "production"
    ? createHash("sha256").update("card-commons").digest("hex")
    : "");
  if (!expectedHex || !/^[a-f0-9]{64}$/i.test(expectedHex)) return false;
  const actual = createHash("sha256").update(passcode).digest();
  const expected = Buffer.from(expectedHex, "hex");
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

export function hasValidOrigin(request: NextRequest) {
  const origin = request.headers.get("origin");
  if (!origin) return false;
  const originUrl = new URL(origin);
  const forwardedHost = request.headers.get("x-forwarded-host")?.split(",")[0].trim();
  const host = forwardedHost || request.headers.get("host") || new URL(request.url).host;
  const forwardedProtocol = request.headers.get("x-forwarded-proto")?.split(",")[0].trim();
  const protocol = forwardedProtocol || new URL(request.url).protocol.replace(":", "");
  return originUrl.host === host && originUrl.protocol === `${protocol}:`;
}
