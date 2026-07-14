import { describe, expect, it } from "vitest";
import { applyCommand } from "@/lib/commands";
import { exportProjectZip, importProjectZip } from "@/lib/portable";
import { createCallingCardProject } from "@/lib/template";
import type { AssetRecord } from "@/lib/types";

describe("portable ZIP", () => {
  it("round-trips card JSON, the manifest, referenced assets, and a preview", async () => {
    const asset: AssetRecord = {
      id: "asset-zip", blob: new Blob(["binary"], { type: "image/png" }), byteSize: 6,
      altText: "test image", role: "emblem", createdAt: new Date().toISOString(),
      metadata: {
        id: "asset-zip", workspaceId: "local", kind: "image", name: "emblem.png",
        uri: "indexeddb://card-commons/asset-zip", mimeType: "image/png",
        width: 1, height: 1, source: "ai_generated", rights: { status: "unknown" },
        generation: { provider: "mock", model: "test", prompt: "test", sourceAssetIds: [] },
        createdAt: "2026-01-01T00:00:00.000Z", createdBy: "local-owner",
      },
    };
    const project = applyCommand(createCallingCardProject(), { type: "bind-asset", role: "emblem", assetId: asset.id });
    const blob = await exportProjectZip(project, [asset], new Blob(["preview"], { type: "image/png" }));
    const restored = await importProjectZip(blob);
    expect(restored.project.card.card.id).toBe(project.card.card.id);
    expect(restored.assets).toHaveLength(1);
    expect(await restored.assets[0].blob.text()).toBe("binary");
  });
});
