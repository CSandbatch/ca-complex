import { afterEach, describe, expect, it, vi } from "vitest";
import { createHash } from "node:crypto";
import { createSession, imageAllowance, signSession, validatePasscode, verifySession } from "@/lib/server/session";
import { imageProvider } from "@/lib/server/provider";
import { assetFromCandidate } from "@/lib/assets";
import { validateAssetMetadata } from "@/lib/validation";

const PNG_1X1 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=";

describe("pilot session and provider boundary", () => {
  afterEach(() => {
    delete process.env.PILOT_ACCESS_HASH;
    delete process.env.SESSION_SIGNING_SECRET;
    delete process.env.STUDIO_MOCK_IMAGES;
    delete process.env.OPENROUTER_API_KEY;
    delete process.env.PILOT_IMAGE_ALLOWANCE;
    vi.unstubAllGlobals();
  });

  it("derives a configurable, clamped per-session image allowance", () => {
    expect(imageAllowance()).toBe(20);
    process.env.PILOT_IMAGE_ALLOWANCE = "5";
    expect(imageAllowance()).toBe(5);
    expect(createSession().remaining).toBe(5);
    process.env.PILOT_IMAGE_ALLOWANCE = "9999";
    expect(imageAllowance()).toBe(200);
    process.env.PILOT_IMAGE_ALLOWANCE = "0";
    expect(imageAllowance()).toBe(1);
    process.env.PILOT_IMAGE_ALLOWANCE = "nonsense";
    expect(imageAllowance()).toBe(20);
  });

  it("uses constant-length hashes and rejects modified cookies", () => {
    process.env.PILOT_ACCESS_HASH = createHash("sha256").update("right-passcode").digest("hex");
    process.env.SESSION_SIGNING_SECRET = "test-secret";
    expect(validatePasscode("right-passcode")).toBe(true);
    expect(validatePasscode("wrong")).toBe(false);
    const token = signSession(createSession());
    expect(verifySession(token)?.remaining).toBe(20);
    expect(verifySession(`${token}x`)).toBeNull();
  });

  it("provides deterministic, credit-free generation in mock mode", async () => {
    process.env.STUDIO_MOCK_IMAGES = "true";
    const candidate = await imageProvider().generate({
      role: "emblem", prompt: "A moon flower",
      cardContext: { message: "Hello", signature: "Ada", templateId: "calling-card-nocturne-v1" },
    });
    expect(candidate.mimeType).toBe("image/svg+xml");
    expect(candidate.provenance.provider).toBe("mock");
    expect(candidate.encoded.length).toBeGreaterThan(100);
    expect(validateAssetMetadata(assetFromCandidate(candidate).metadata).valid).toBe(true);
  });

  it("routes selected models through the OpenRouter unified image API", async () => {
    process.env.OPENROUTER_API_KEY = "test-key";
    const fetchMock = vi.fn((_url: string, _init: RequestInit) => Promise.resolve(new Response(
      JSON.stringify({ data: [{ b64_json: PNG_1X1 }] }),
      { status: 200, headers: { "content-type": "application/json" } },
    )));
    vi.stubGlobal("fetch", fetchMock);

    const candidate = await imageProvider("google/gemini-3.1-flash-image").generate({
      role: "background", prompt: "A quiet nocturne",
      cardContext: { message: "Hi", signature: "Ada", templateId: "calling-card-nocturne-v1" },
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("https://openrouter.ai/api/v1/images");
    expect(String((init.headers as Record<string, string>).Authorization)).toContain("Bearer test-key");
    const body = JSON.parse(String(init.body));
    expect(body.model).toBe("google/gemini-3.1-flash-image");
    expect(body.aspect_ratio).toBe("2:3");
    expect(candidate.provenance.provider).toBe("openrouter");
    expect(candidate.provenance.model).toBe("google/gemini-3.1-flash-image");
    expect(candidate.mimeType).toBe("image/png");
  });
});
