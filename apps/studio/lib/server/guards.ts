import { imageSize } from "image-size";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { findModel, type ImageModel, modelsForRole, resolveModel, supportsRole } from "../models";
import type { LayerRole } from "../types";
import { hasValidOrigin, sessionFromRequest, type PilotSession } from "./session";

export const MAX_SERVER_IMAGE_BYTES = 12 * 1024 * 1024;
export const MAX_SERVER_OUTPUT_BYTES = 20 * 1024 * 1024;
const MIME_TYPES = new Set(["image/png", "image/jpeg", "image/webp"]);

type Authorization = { ok: true; session: PilotSession } | { ok: false; error: NextResponse };

export function authorizeImageRequest(request: NextRequest): Authorization {
  if (!hasValidOrigin(request)) return { ok: false, error: NextResponse.json({ error: "Origin is not allowed." }, { status: 403 }) };
  const session = sessionFromRequest(request);
  if (!session) return { ok: false, error: NextResponse.json({ error: "Pilot access is required." }, { status: 401 }) };
  if (session.remaining <= 0) return { ok: false, error: NextResponse.json({ error: "This session has used its 20 image requests." }, { status: 429 }) };
  return { ok: true, session };
}

type ModelSelection = { ok: true; model: ImageModel } | { ok: false; error: NextResponse };

export function selectModel(modelId: string | undefined, role: LayerRole): ModelSelection {
  if (modelId !== undefined && modelId !== "" && !findModel(modelId)) {
    return { ok: false, error: NextResponse.json({ error: "That image model is not available." }, { status: 400, headers: { "Cache-Control": "no-store" } }) };
  }
  const model = resolveModel(modelId);
  if (!supportsRole(model, role)) {
    return {
      ok: false,
      error: NextResponse.json(
        {
          error: `${model.label} cannot render a transparent emblem. Choose a transparency-capable model.`,
          suggestedModelIds: modelsForRole(role).map((option) => option.id),
        },
        { status: 400, headers: { "Cache-Control": "no-store" } },
      ),
    };
  }
  return { ok: true, model };
}

export function validateImageBytes(bytes: Uint8Array, mimeType: string) {
  if (!MIME_TYPES.has(mimeType)) throw new Error("Only PNG, JPEG, and WebP inputs are accepted.");
  if (!bytes.length || bytes.length > MAX_SERVER_IMAGE_BYTES) throw new Error("Input images must be 12 MB or smaller.");
  const dimensions = imageSize(bytes);
  if (!dimensions.width || !dimensions.height || dimensions.width > 8192 || dimensions.height > 8192) {
    throw new Error("Input image dimensions are invalid or too large.");
  }
  return dimensions;
}
