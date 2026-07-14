import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createHash } from "node:crypto";
import { NextRequest } from "next/server";
import { POST as accessPost } from "@/app/api/access/route";
import { POST as generatePost } from "@/app/api/images/generate/route";
import { POST as editPost } from "@/app/api/images/edit/route";
import { COOKIE_NAME, signSession } from "@/lib/server/session";

const origin = "http://studio.test";
const validBody = {
  role: "emblem",
  prompt: "An elegant moon flower emblem",
  cardContext: {
    message: "A small signal in the dark.",
    signature: "Aster",
    templateId: "calling-card-nocturne-v1",
  },
};

function sessionCookie(remaining = 20) {
  const token = signSession({ exp: Math.floor(Date.now() / 1000) + 3600, remaining, nonce: "test" });
  return `${COOKIE_NAME}=${token}`;
}

function jsonRequest(path: string, body: unknown, cookie?: string) {
  return new NextRequest(`${origin}${path}`, {
    method: "POST",
    headers: {
      origin,
      "content-type": "application/json",
      ...(cookie ? { cookie } : {}),
    },
    body: JSON.stringify(body),
  });
}

describe("Studio route protections", () => {
  beforeEach(() => {
    process.env.SESSION_SIGNING_SECRET = "route-test-secret";
    process.env.PILOT_ACCESS_HASH = createHash("sha256").update("pilot").digest("hex");
    process.env.STUDIO_MOCK_IMAGES = "true";
  });
  afterEach(() => {
    delete process.env.SESSION_SIGNING_SECRET;
    delete process.env.PILOT_ACCESS_HASH;
    delete process.env.STUDIO_MOCK_IMAGES;
    delete process.env.STUDIO_MOCK_FAILURE;
  });

  it("sets an HttpOnly, SameSite-Strict cookie only for the correct passcode and origin", async () => {
    const denied = await accessPost(jsonRequest("/api/access", { passcode: "wrong" }));
    expect(denied.status).toBe(401);
    const response = await accessPost(jsonRequest("/api/access", { passcode: "pilot" }));
    expect(response.status).toBe(200);
    expect(response.headers.get("set-cookie")).toContain("HttpOnly");
    expect(response.headers.get("set-cookie")).toContain("SameSite=strict");
    const foreign = new NextRequest(`${origin}/api/access`, {
      method: "POST", headers: { origin: "https://evil.test", "content-type": "application/json" },
      body: JSON.stringify({ passcode: "pilot" }),
    });
    expect((await accessPost(foreign)).status).toBe(403);
  });

  it("enforces authentication and allowance before generation", async () => {
    expect((await generatePost(jsonRequest("/api/images/generate", validBody))).status).toBe(401);
    expect((await generatePost(jsonRequest("/api/images/generate", validBody, sessionCookie(0)))).status).toBe(429);
    const response = await generatePost(jsonRequest("/api/images/generate", validBody, sessionCookie()));
    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect((await response.json()).candidate.provenance.provider).toBe("mock");
  });

  it("rejects unknown models and records the selected model in provenance", async () => {
    const unknown = await generatePost(jsonRequest("/api/images/generate", { ...validBody, modelId: "made/up" }, sessionCookie()));
    expect(unknown.status).toBe(400);

    const chosen = await generatePost(jsonRequest("/api/images/generate",
      { ...validBody, role: "background", modelId: "x-ai/grok-imagine-image-quality" }, sessionCookie()));
    expect(chosen.status).toBe(200);
    expect((await chosen.json()).candidate.provenance.model).toBe("x-ai/grok-imagine-image-quality");
  });

  it("gates a transparent emblem to transparency-capable models", async () => {
    const blocked = await generatePost(jsonRequest("/api/images/generate",
      { ...validBody, role: "emblem", modelId: "x-ai/grok-imagine-image-quality" }, sessionCookie()));
    expect(blocked.status).toBe(400);
    const body = await blocked.json();
    expect(body.suggestedModelIds).toContain("openai/gpt-image-1");

    const allowed = await generatePost(jsonRequest("/api/images/generate",
      { ...validBody, role: "emblem", modelId: "openai/gpt-image-1" }, sessionCookie()));
    expect(allowed.status).toBe(200);
  });

  it.each([
    ["moderation", 422],
    ["rate", 429],
    ["provider", 502],
    ["oversized", 502],
  ])("maps %s provider failures without exposing internals", async (failure, status) => {
    process.env.STUDIO_MOCK_FAILURE = failure;
    const response = await generatePost(jsonRequest("/api/images/generate", validBody, sessionCookie()));
    expect(response.status).toBe(status);
    expect(response.headers.get("cache-control")).toBe("no-store");
  });

  it("rejects malformed edit uploads before reaching the provider", async () => {
    const request = new NextRequest(`${origin}/api/images/edit`, {
      method: "POST",
      headers: { origin, cookie: sessionCookie() },
      body: new FormData(),
    });
    expect((await editPost(request)).status).toBe(400);
  });
});
