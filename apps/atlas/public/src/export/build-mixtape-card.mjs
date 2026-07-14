import { DRAFT_MIXTAPE_ID } from "../atlas-mixtapes.js";

// Pure, DOM-free builder: a resolved mixtape (as returned by graph.mixtapeById)
// becomes a Card Commons CardDocument (schemaVersion 0.1.0). No window/document
// references, so Node can import() it standalone for fixture checks. The shape
// mirrors the mixtape_card contract example so the export validates against the
// mixtape_card schema (@ca/contracts). Registered as a witness in
// packages/contracts/witnesses.json (U2.8).
export function buildMixtapeCardDocument(resolvedMixtape, now = new Date().toISOString()) {
  const mixtape = resolvedMixtape;
  const isDraft = mixtape.isDraft === true || mixtape.id === DRAFT_MIXTAPE_ID;
  const items = Array.isArray(mixtape.items) ? mixtape.items : [];

  const tracklist = items.map(({ id, type, title, source, placeKey, url }) => ({
    id,
    type,
    title,
    source,
    placeKey,
    url,
  }));

  return {
    schemaVersion: "0.1.0",
    card: {
      id: `card-${mixtape.id}`,
      kind: "mixtape_card",
      title: mixtape.title,
      slug: mixtape.id,
      status: isDraft ? "draft" : "published",
      visibility: isDraft ? "private" : "public",
      accessibleName: `Mixtape card: ${mixtape.title}, curated by ${mixtape.curator}, ${mixtape.itemCount} items`,
    },
    fields: {
      summary: { dataType: "string", value: mixtape.summary, source: "import", visible: true },
      description: { dataType: "rich_text", value: mixtape.description, source: "import", visible: true },
      curator: { dataType: "string", value: mixtape.curator, source: "import", visible: true },
      tracklist: { dataType: "json", source: "import", visible: true, value: tracklist },
    },
    classifications: [
      { scheme: "signal-atlas", path: "curation/mixtape", role: "primary" },
      { scheme: "signal-atlas", path: `place/${mixtape.leadPlaceKey}`, role: "source_context" },
    ],
    surfaces: [
      {
        key: "card",
        layoutMode: "fixed",
        dimensions: { width: 750, height: 1050, unit: "px" },
        background: { color: "#0f1116" },
        layers: [
          {
            id: "summary",
            kind: "text",
            fieldKey: "summary",
            box: { x: 90, y: 120, width: 570, height: 240 },
            accessibleRole: "content",
          },
        ],
        accessibilityOrder: ["summary"],
      },
    ],
    permissions: [{ principal: "owner", actions: ["read", "edit", "publish", "remix", "admin"] }],
    remixPolicy: { mode: "fork_with_attribution", requireAttribution: true },
    metadata: {
      generator: "signal-atlas",
      generatedAt: now,
      sourceMixtapeId: mixtape.id,
      atlasUpdatedAt: mixtape.publishedAt,
      counts: {
        tracks: mixtape.itemCount,
        events: mixtape.eventCount,
        sources: mixtape.sourceCount,
      },
      sourceNames: mixtape.sourceNames,
    },
  };
}
