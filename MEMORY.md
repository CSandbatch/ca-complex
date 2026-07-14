# MEMORY.md — ca-complex

Durable repo facts and a dated change log. Scrubbed: no secrets, no personal
data. Node-specific facts and node-attached history live in the registry graph
(`fw:MemoryEntry` on each app/package node); this file holds only what spans the
repo as a whole.

## Durable facts

- Born 2026-07-13, during the ca- constellation refactor, from four repos:
  common-action, common-pitch, on-high-in-blue-tomorrows, and card-commons.
  The governing plan is `logical-scribbling-steele.md` (§A, ca-complex layout).
- One npm-workspaces monorepo, plain (not turbo): only two of five apps have
  builds. Revisit turbo only if root `check` exceeds ~5 min.
- Five apps deploy as five Vercel projects from this one repo. Static apps stay
  static; no server code is written in the refactor (on-high's Replit server is
  retired, not replaced).
- The shared palette (`ultraviolet`, `suited-chili`) is a locked invariant with
  a single source, `packages/tokens/tokens.css` — extracted verbatim from
  common-pitch (the declared origin; pitch wins by doctrine). This ends the old
  manual two-repo palette sync.
- `@ca/contracts` is the source of truth for card documents; docs describe the
  contracts, never the reverse.
- card-commons' own MEMORY history stays in the archived card-commons repo — it
  is not migrated here. Per-node history lives in the registry graph.

## Change log

- **2026-07-13** — Scaffold created (U2.1). Root `package.json`, `.nvmrc`,
  `.gitignore`, `MIGRATION.md` skeleton, the governance set + dual license +
  CITATION.cff (copied from card-commons, content unchanged), `docs/` +
  `whitepaper/` + `research/` (copied), `.github/ISSUE_TEMPLATE/` (copied),
  `.github/workflows/ci.yml` (new), the repo-tier framework 8-file set (new),
  `scripts/{sync-tokens.mjs,check-static.mjs}`, `packages/contracts` (schemas,
  examples, openapi, validators copied; `witnesses.json` + `check-fixtures.mjs`
  stubbed PENDING for U2.8), `packages/tokens` (package.json + README; the
  `tokens.css` source is extracted in U2.2). `apps/` is intentionally absent —
  the five app members arrive in U2.3–U2.7. `tokens:check` and `fixtures:check`
  report PENDING and exit 0 so the root gate is runnable from day one. Not yet a
  git repo; the orchestrator inits and pushes in Phase 4.
