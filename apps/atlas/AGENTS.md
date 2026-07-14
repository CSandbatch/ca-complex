# AGENTS.md — apps/atlas (@ca/atlas)

Signal Atlas: a static-first local-intelligence surface for New Orleans. It
collapses local reporting, neighborhood writing, live events, and curated
Mixtapes into one place-driven reading environment — one map, one feed, one
visual system. Former repo `on-high-in-blue-tomorrows`. Node ESM, no build step.

## Locked invariants

No change without explicit approval; name the risk first.

- **New Orleans is the default locality.** No second city mode unless a task
  explicitly changes city scope.
- **One map, one feed, one visual system, one coherent surface.** Do not inflate
  it into a dashboard, brand deck, chat app, or multi-mode gallery.
- The Orleans Parish map and its `placeKey` vocabulary are the locality spine.
  Do not remove the map or collapse it into decorative graphics.
- `public/signal-atlas-data.js` is **generated**. Do not hand-edit it; regenerate
  via `npm run pipeline` (reads an `Atlas_Graph` export → writes `public/`).
- `public/app.js` is a thin bootstrap and event-wiring layer. New UI logic goes
  in focused modules under `public/src/ui/`.

## Layout

- `public/` — served as-is by the dev server. `index.html`, `styles.css`,
  `app.js`, generated `signal-atlas-data.js`, and the `src/` ESM tree
  (`atlas-graph.js`, `atlas-mixtapes.js`, `schema/`, `ui/`, `export/`).
- `scripts/dev-server.mjs` — static file server over `public/` (dev + smoke
  only; keeps the `Signal Atlas running on port` readiness line). No server ships
  to production — Vercel serves `public/` statically.
- `scripts/smoke/playwright-smoke.mjs` — the gate.
- `pipeline/load-data.js` — regenerates `public/signal-atlas-data.js`.
- `docs/` — screenshots and diagrams (the demo surface) + `RESEARCH.md`.

## Witness — the mixtape card builder

`public/src/export/build-mixtape-card.mjs` exports `buildMixtapeCardDocument`: a
pure, DOM-free builder turning a resolved Mixtape into a Card Commons
`CardDocument` (schemaVersion `0.1.0`). `public/src/ui/export.js` keeps the
browser wrapper `downloadMixtapeCard` and imports the builder. The builder is
**schema-governed**: it is a contract witness, registered in
`packages/contracts/witnesses.json` (by U2.8) so `check-fixtures.mjs` validates
its output against the `mixtape_card` schema and fixture. Keep it Node-importable
— no `window`/`document` references.

## Gate

Run before claiming done, from the ca-complex root:

```bash
npm run smoke --workspace @ca/atlas
```

Playwright loads the app, opens a mixtape, exports a `mixtape_card`, and asserts
the downloaded CardDocument shape. A failing smoke is reported failing, with
output. `npm run check` aliases the smoke gate. `npm run build` does not exist —
the app is static, no compile step.

## Pointer up

Repo doctrine: ca-complex `AGENTS.md` (root gate law, contracts, witness rule).
Full voice and non-negotiables degrade from the ca-vault `agent/` set when
present; the invariants above survive a bare clone.
