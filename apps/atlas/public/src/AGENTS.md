# src/ — UI, query, and schema

The application code. `atlas-graph.js` is the read/query layer (the renderer
does not read `atlasFeed` directly after startup). `atlas-mixtapes.js` holds the
seeded and draft Mixtape definitions. `schema/` holds controlled vocabulary
(`atlas-taxonomy.js`) and legacy lens specs. `ui/` holds rendering (`render.js`),
the map controller (`map.js`), app/URL state (`state.js`), and filters.

## Local rules

- New UI logic goes in focused modules under `src/ui/`. Keep the root `app.js`
  thin — bootstrap and event wiring only.
- Controlled vocabulary constants (places, item types, lenses, windows,
  reactions) stay in `src/schema/atlas-taxonomy.js`. Do not scatter them.
- Keep the map/feed linkage explicit. Preserve bottom filters, map focus, and
  fullscreen map. Do not remove the Orleans Parish map.
- Do not read or hand-edit `signal-atlas-data.js` — it is generated.

## Gate

`npm run smoke` (from repo root) must pass.

## Gotchas

- Mixtapes are interleaved into the grid, not filtered — `mixtape` is not in
  `FILTERABLE_ITEM_TYPES`.
- `listing` is a real type with no runtime records yet. Do not fabricate them.
- Mixtape detail pages are driven by URL state, not a framework router.

Project doctrine: `../AGENTS.md`
