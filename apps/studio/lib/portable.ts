import JSZip from "jszip";
import { collectReferencedAssetIds } from "./commands";
import type { AssetRecord, StudioProject } from "./types";

const EXTENSIONS: Record<string, string> = {
  "image/png": "png", "image/jpeg": "jpg", "image/webp": "webp", "image/svg+xml": "svg",
};

export async function exportProjectZip(project: StudioProject, assets: AssetRecord[], preview: Blob): Promise<Blob> {
  const zip = new JSZip();
  const referenced = collectReferencedAssetIds(project);
  const selected = assets.filter((asset) => referenced.includes(asset.id));
  zip.file("card.json", JSON.stringify(project.card, null, 2));
  zip.file("assets.json", JSON.stringify(selected.map(({ blob: _, ...asset }) => asset), null, 2));
  for (const asset of selected) {
    zip.file(`assets/${asset.id}.${EXTENSIONS[asset.metadata.mimeType] ?? "bin"}`, await asset.blob.arrayBuffer());
  }
  zip.file("preview.png", await preview.arrayBuffer());
  return zip.generateAsync({ type: "blob", compression: "DEFLATE" });
}

export async function importProjectZip(file: Blob): Promise<{ project: StudioProject; assets: AssetRecord[] }> {
  const zip = await JSZip.loadAsync(await file.arrayBuffer());
  const cardFile = zip.file("card.json");
  const manifestFile = zip.file("assets.json");
  if (!cardFile || !manifestFile) throw new Error("This ZIP is missing card.json or assets.json.");
  const card = JSON.parse(await cardFile.async("text"));
  const manifest = JSON.parse(await manifestFile.async("text")) as Array<Omit<AssetRecord, "blob">>;
  const assets: AssetRecord[] = [];
  for (const entry of manifest) {
    const path = Object.keys(zip.files).find((name) => name.startsWith(`assets/${entry.id}.`));
    if (!path) throw new Error(`Missing binary for ${entry.id}.`);
    const binary = await zip.file(path)!.async("uint8array");
    const buffer = Uint8Array.from(binary).buffer;
    assets.push({ ...entry, blob: new Blob([buffer], { type: entry.metadata.mimeType }) });
  }
  const now = new Date().toISOString();
  return {
    project: {
      id: crypto.randomUUID(), card, activeSurface: "card",
      assetIds: assets.map((asset) => asset.id), createdAt: now, updatedAt: now, editorVersion: "0.1.0",
    },
    assets,
  };
}
