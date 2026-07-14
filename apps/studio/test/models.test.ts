import { describe, expect, it } from "vitest";
import {
  DEFAULT_MODEL_ID, findModel, IMAGE_MODELS, isModelAllowed, modelsForRole, resolveModel, supportsRole,
} from "@/lib/models";

describe("image model registry", () => {
  it("has unique ids and a resolvable default", () => {
    const ids = IMAGE_MODELS.map((model) => model.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(findModel(DEFAULT_MODEL_ID)).toBeDefined();
    expect(resolveModel(undefined).id).toBe(DEFAULT_MODEL_ID);
    expect(resolveModel("nope").id).toBe(DEFAULT_MODEL_ID);
  });

  it("only includes the five OpenRouter models plus the direct OpenAI option", () => {
    expect(IMAGE_MODELS.filter((model) => model.route === "openrouter")).toHaveLength(5);
    expect(IMAGE_MODELS.filter((model) => model.route === "openai-direct")).toHaveLength(1);
  });

  it("gates the emblem to transparency-capable models", () => {
    const emblemModels = modelsForRole("emblem");
    expect(emblemModels.length).toBeGreaterThan(0);
    expect(emblemModels.every((model) => model.transparency)).toBe(true);
    expect(modelsForRole("background")).toHaveLength(IMAGE_MODELS.length);
    expect(supportsRole(findModel("x-ai/grok-imagine-image-quality")!, "emblem")).toBe(false);
    expect(supportsRole(findModel("openai/gpt-image-1")!, "emblem")).toBe(true);
    expect(supportsRole(findModel("x-ai/grok-imagine-image-quality")!, "background")).toBe(true);
  });

  it("validates allowlist membership", () => {
    expect(isModelAllowed("openai/gpt-image-1")).toBe(true);
    expect(isModelAllowed("totally/made-up")).toBe(false);
  });
});
