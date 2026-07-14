import type { LayerRole } from "./types";

// Client-safe image-model registry. Contains no secrets and is imported by both
// the editor UI (to list options) and the server routes (to validate + route).

export type ProviderRoute = "openrouter" | "openai-direct";

export interface ImageModel {
  /** Stable identifier used in requests and recorded in provenance. */
  id: string;
  label: string;
  family: string;
  route: ProviderRoute;
  /** Model string sent to the underlying provider API. */
  routeModel: string;
  /** Maximum reference images accepted on an edit. */
  maxReferences: number;
  /** Whether the model can produce a transparent background (needed for emblems). */
  transparency: boolean;
  /** Indicative cost, shown to the user before they generate. Not exact billing. */
  costHint: string;
  /**
   * Explicit portrait size (e.g. "1024x1536") for models that ignore
   * aspect_ratio. When absent, the request uses aspect_ratio instead.
   */
  portraitSize?: string;
  note?: string;
}

// IDs and capabilities verified against OpenRouter's unified image catalogue.
// costHint values are indicative as of 2026-06 — confirm live prices at
// https://openrouter.ai/collections/image-models before a paid pilot.
export const IMAGE_MODELS: ImageModel[] = [
  {
    id: "openai/gpt-image-1",
    label: "OpenAI GPT-Image",
    family: "OpenAI",
    route: "openrouter",
    routeModel: "openai/gpt-image-1",
    maxReferences: 16,
    transparency: true,
    costHint: "usage-metered",
    note: "Strong prompt adherence; supports transparent emblems.",
  },
  {
    id: "google/gemini-3.1-flash-image",
    label: "Gemini Flash Image (Nano Banana)",
    family: "Google",
    route: "openrouter",
    routeModel: "google/gemini-3.1-flash-image",
    maxReferences: 14,
    transparency: false,
    costHint: "usage-metered",
    note: "Best-in-class editing and multi-turn refinement.",
  },
  {
    id: "bytedance-seed/seedream-4.5",
    label: "Seedream 4.5",
    family: "ByteDance",
    route: "openrouter",
    routeModel: "bytedance-seed/seedream-4.5",
    maxReferences: 14,
    transparency: false,
    costHint: "~$0.04/image",
    portraitSize: "1664x2496",
    note: "High-resolution with strong editing consistency. Ignores aspect_ratio; uses an explicit portrait size.",
  },
  {
    id: "black-forest-labs/flux.2-pro",
    label: "FLUX.2 Pro",
    family: "Black Forest Labs",
    route: "openrouter",
    routeModel: "black-forest-labs/flux.2-pro",
    maxReferences: 8,
    transparency: false,
    costHint: "~$0.05/image",
    portraitSize: "1024x1536",
    note: "Fast, high-quality general generator. Ignores aspect_ratio; uses an explicit portrait size.",
  },
  {
    id: "x-ai/grok-imagine-image-quality",
    label: "Grok Imagine",
    family: "xAI",
    route: "openrouter",
    routeModel: "x-ai/grok-imagine-image-quality",
    maxReferences: 3,
    transparency: false,
    costHint: "~$0.04/image",
    note: "Photorealistic detail and in-image text.",
  },
  {
    id: "openai-direct/gpt-image",
    label: "OpenAI GPT-Image (direct)",
    family: "OpenAI",
    route: "openai-direct",
    routeModel: "gpt-image-2",
    maxReferences: 16,
    transparency: true,
    costHint: "OpenAI quality tiers",
    note: "Bypasses OpenRouter via the OpenAI API key.",
  },
];

export const DEFAULT_MODEL_ID = "openai/gpt-image-1";

export function findModel(id: string | undefined | null): ImageModel | undefined {
  return IMAGE_MODELS.find((model) => model.id === id);
}

export function resolveModel(id: string | undefined | null): ImageModel {
  return findModel(id) ?? findModel(DEFAULT_MODEL_ID)!;
}

export function isModelAllowed(id: string | undefined | null): boolean {
  return Boolean(findModel(id));
}

export function modelsForRole(role: LayerRole): ImageModel[] {
  return role === "emblem" ? IMAGE_MODELS.filter((model) => model.transparency) : IMAGE_MODELS;
}

export function supportsRole(model: ImageModel, role: LayerRole): boolean {
  return role !== "emblem" || model.transparency;
}
