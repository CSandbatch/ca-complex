# AGENTS.md — apps/cards

The Card Commons publication site: a Next.js app exported **static** for Vercel.
It is the 14-slide pitch deck plus the specs, whitepaper, and research pages.
Former `card-commons/site`.

## Mission

Render the canonical spec and prose as a static site. Nothing here is a source
of truth — the specs, whitepaper, and research it publishes live as canonical
Markdown at the ca-complex root (`docs/`, `whitepaper/`, `research/`), read at
build time by `lib/content.ts`. The contracts it links to live in
`packages/contracts`. Keep the site coherent with those; never fork the prose.

## Local rules

- Don't copy spec/whitepaper/research prose into components. Edit the source at
  the repo root (`../../docs/`, `../../whitepaper/`, `../../research/`); the site
  reads it. Schemas in `packages/contracts` are the truth.
- Static export — no server runtime, no server-only features. `output: "export"`
  with `trailingSlash`; there is no basePath (Vercel serves from root).
- `metadataBase` is an env-overridable placeholder (`NEXT_PUBLIC_SITE_URL`);
  the CANONICAL-CUTOVER comment in `app/layout.tsx` tracks the Phase 5 URL.
- Accessibility is tested (axe via Playwright). Don't regress it.

## Gate

`npm run check --workspace @ca/cards` =
`typecheck` → `test` (vitest) → `build` (next export) → `verify:export`
(`scripts/verify-export.mjs` asserts the 7 static routes exist and are
non-empty). Browser e2e (`npm run test:e2e`) is available but runs in the root
`check:browser`, not in `check`.

Project doctrine: `../../AGENTS.md`.
