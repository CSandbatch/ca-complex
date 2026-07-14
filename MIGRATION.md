# MIGRATION.md — source → destination map

How every part of ca-complex traces back to the four source repos. Assembly is a
clean-room copy: one commit per app citing the source repo's final SHA; full
history stays browsable in the archived originals.

`ca-graph` (formerly `i-saw-it-in-a-dream`, final SHA `d3f22d2`, 2026-07-12)
is not in this map — it migrates by GitHub rename, not copy, and carries no
material into ca-complex.

## Apps

| Destination | Source repo | Source path | Final SHA | Unit | Status |
|---|---|---|---|---|---|
| `apps/action` | common-action | `docs/` → `public/` | `eadd810` (2026-07-12) | U2.3 | migrated |
| `apps/pitch` | common-pitch | `docs/` → `public/` (+ token origin) | `f6b1957` (2026-07-12) | U2.4 | migrated |
| `apps/atlas` | on-high-in-blue-tomorrows | app + `src/` + pipeline; `server.js` → `scripts/dev-server.mjs` | `52c7e1d` (2026-07-12) | U2.5 | migrated |
| `apps/cards` | card-commons | `site/` | `de9f715` (2026-07-12) | U2.6 | migrated |
| `apps/studio` | card-commons | `studio/` | `de9f715` (2026-07-12) | U2.7 | migrated |

## Packages

| Destination | Source repo | Source path | Final SHA | Unit | Status |
|---|---|---|---|---|---|
| `packages/contracts` | card-commons | `contracts/` + `scripts/validate-schemas.mjs` | `de9f715` (2026-07-12) | U2.1 / U2.8 | migrated |
| `packages/tokens` | common-pitch | `styles.css` (`:root` + `[data-theme="suited-chili"]`) → `tokens.css` | `f6b1957` (2026-07-12) | U2.2 | migrated |

## Root-level material

| Destination | Source repo | Source path | Final SHA | Status |
|---|---|---|---|---|
| governance set + licenses + CITATION.cff | card-commons | repo root | `de9f715` (2026-07-12) | copied |
| `docs/` (9 specs) | card-commons | `docs/` | `de9f715` (2026-07-12) | copied |
| `whitepaper/` | card-commons | `whitepaper/` | `de9f715` (2026-07-12) | copied |
| `research/` | card-commons | `research/` | `de9f715` (2026-07-12) | copied |
| `.github/ISSUE_TEMPLATE/` | card-commons | `.github/ISSUE_TEMPLATE/` | `de9f715` (2026-07-12) | copied (`pages.yml` deliberately not migrated) |

## Deliberate leave-behinds

Not everything in a source repo travels. These stay in the archived original,
by decision, not oversight:

- **on-high-in-blue-tomorrows**: `build_signal_atlas_assets.py` and
  `screenshot.mjs` (Replit-era asset/screenshot tooling) and `scripts/AGENTS.md`
  (the doctrine file describing them) stay in the archive — nothing in
  ca-complex replaces them. `output/` pipeline artifacts are not copied;
  `apps/atlas` regenerates them via `npm run pipeline`.
- `server.js` (on-high's Replit static server) is retired outright, not
  ported — `apps/atlas/scripts/dev-server.mjs` is dev/smoke tooling only, and
  nothing server-side ships to production for any static app.

## Tokens desync — resolution

Both static apps carried the shared `ultraviolet` / `suited-chili` palette by
hand-duplicated CSS. Audit found a historical desync: **common-pitch** (the
palette's origin repo) held the correct suited-chili `--vermilion`
(`#e52614`); **common-action**'s predecessor copy carried an older, wrong
value (`#ff4b1f`) from an earlier port. Resolution, user-approved:

- `packages/tokens/tokens.css` is extracted verbatim from common-pitch's
  `styles.css` — pitch wins by doctrine as the declared origin.
- `apps/action` inherits the corrected `#e52614` via `npm run tokens:sync`;
  this is a sanctioned correction, not a silent drift (see
  `apps/action/AGENTS.md`).
- The extraction is palette-only: `--paper`, `--paper-light`, `--ink`,
  `--ink-muted`, `--rule`, `--rule-dark`, `--signal`, `--vermilion`, and
  `--grid-line`. App-local tokens (typography, spacing) stay in each app's own
  `styles.css`.
- `npm run tokens:check` byte-compares each app's generated `tokens.css`
  against the source and fails the gate on drift.

## Notes

- URL updates (canonical trios, metadataBase, doc-level references) landed in
  U3.1 where the real destination was known now (ca-complex paths, archived-repo
  pointers) and stay marked `<!-- CANONICAL-CUTOVER -->` where they wait on a
  real production URL from Phase 5 (U5.2).
- `pages.yml` is not migrated — GitHub Pages retires in favor of Vercel.
- card-commons' `MEMORY.md` history stays in the archived card-commons repo;
  per-node history lives in the registry graph.
