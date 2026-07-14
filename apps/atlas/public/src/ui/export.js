import { buildMixtapeCardDocument } from "../export/build-mixtape-card.mjs";

export { buildMixtapeCardDocument };

// Browser helper: build the document, hand it to the user as a JSON download,
// and release the object URL. Uses the DOM (window/document), so this wrapper
// is browser-only; the builder it calls stays DOM-free and Node-importable.
export function downloadMixtapeCard(mixtape) {
  const doc = buildMixtapeCardDocument(mixtape);
  const blob = new Blob([JSON.stringify(doc, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `${mixtape.id}.card.json`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
  return doc;
}
