import { beforeEach, describe, expect, it } from "vitest";
import { clearStudio, getAsset, loadProject, saveAsset, saveProject } from "@/lib/db";
import { createCallingCardProject } from "@/lib/template";
import type { AssetRecord } from "@/lib/types";

const asset: AssetRecord = {
  id: "asset-test",
  blob: new Blob(["test"], { type: "image/png" }),
  byteSize: 4,
  altText: "test",
  createdAt: "2026-01-01T00:00:00.000Z",
  metadata: {
    id: "asset-test", workspaceId: "local", kind: "image", name: "test.png",
    uri: "indexeddb://card-commons/asset-test", mimeType: "image/png",
    width: 1, height: 1, source: "uploaded", rights: { status: "unknown" },
    createdAt: "2026-01-01T00:00:00.000Z", createdBy: "local-owner",
  },
};

describe("IndexedDB persistence", () => {
  beforeEach(() => clearStudio());

  it("round-trips complete project snapshots and blobs", async () => {
    const project = createCallingCardProject();
    await saveProject(project);
    await saveAsset(asset);
    expect((await loadProject())?.id).toBe(project.id);
    expect(await (await getAsset(asset.id))?.blob.text()).toBe("test");
  });
});
