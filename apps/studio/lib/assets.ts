import type { AssetRecord, LayerRole, GenerationCandidate, RightsStatus } from "./types";

const ACCEPTED_MIME = new Set(["image/png", "image/jpeg", "image/webp"]);
export const MAX_UPLOAD_BYTES = 12 * 1024 * 1024;
export const MAX_DIMENSION = 8192;

export async function imageDimensions(blob: Blob): Promise<{ width: number; height: number }> {
  const bitmap = await createImageBitmap(blob);
  const result = { width: bitmap.width, height: bitmap.height };
  bitmap.close();
  return result;
}

export async function assetFromUpload(file: File, role: LayerRole, rights: RightsStatus): Promise<AssetRecord> {
  if (!ACCEPTED_MIME.has(file.type)) throw new Error("Use a PNG, JPEG, or WebP image.");
  if (file.size > MAX_UPLOAD_BYTES) throw new Error("Images must be 12 MB or smaller.");
  const { width, height } = await imageDimensions(file);
  if (!width || !height || width > MAX_DIMENSION || height > MAX_DIMENSION) throw new Error("Image dimensions are invalid or too large.");
  const id = `asset-${crypto.randomUUID()}`;
  const createdAt = new Date().toISOString();
  return {
    id,
    blob: file,
    byteSize: file.size,
    altText: `${role} image`,
    role,
    createdAt,
    metadata: {
      id, workspaceId: "local", kind: "image", name: file.name,
      uri: `indexeddb://card-commons/${id}`, mimeType: file.type,
      width, height, source: "uploaded", rights: { status: rights },
      createdAt, createdBy: "local-owner",
    },
  };
}

export function candidateBlob(candidate: GenerationCandidate): Blob {
  const bytes = Uint8Array.from(atob(candidate.encoded), (character) => character.charCodeAt(0));
  return new Blob([bytes], { type: candidate.mimeType });
}

export function assetFromCandidate(candidate: GenerationCandidate): AssetRecord {
  const blob = candidateBlob(candidate);
  const id = `asset-${crypto.randomUUID()}`;
  const createdAt = new Date().toISOString();
  const edited = candidate.provenance.sourceAssetIds.length > 0;
  return {
    id,
    blob,
    byteSize: blob.size,
    altText: `${candidate.role} generated for this calling card`,
    role: candidate.role,
    createdAt,
    metadata: {
      id, workspaceId: "local", kind: "image",
      name: `${candidate.role}-${createdAt}.${candidate.mimeType.split("/")[1]}`,
      uri: `indexeddb://card-commons/${id}`, mimeType: candidate.mimeType,
      width: candidate.width, height: candidate.height,
      source: edited ? "ai_edited" : "ai_generated",
      rights: { status: "unknown" },
      generation: {
        provider: candidate.provenance.provider,
        model: candidate.provenance.model,
        prompt: candidate.provenance.prompt,
        settings: { ...candidate.provenance.settings, generatedAt: candidate.provenance.generatedAt },
        sourceAssetIds: candidate.provenance.sourceAssetIds,
      },
      createdAt, createdBy: "local-owner",
    },
  };
}
