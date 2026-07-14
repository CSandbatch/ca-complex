# PHASE-PLAN.md — ca-complex

Declared phase and the gate to the next one. History lives in `MEMORY.md`.

## Current phase: assembling

The monorepo is being assembled from the four source repos. The scaffold exists
(root files, framework set, shared packages, gate harness). The five app members
are migrated one per unit (U2.3–U2.7); the token source is extracted (U2.2); the
witness harness is implemented (U2.8). During this phase, `tokens:check` and
`fixtures:check` report PENDING and exit 0 until their inputs land.

## Gate to the next phase

Assembling → assembled (ready for GitHub ops and Vercel) when **all** hold:

- All five apps migrated into `apps/` with their own thin `AGENTS.md` and
  declared gate.
- `packages/tokens/tokens.css` extracted; `npm run tokens:check` green (no
  PENDING).
- The witness harness implemented; `npm run fixtures:check` green (no PENDING).
- The full root gate `npm run check` green with no PENDING notes remaining.
- `npm run check:browser` green (cards + studio e2e).
- `MIGRATION.md` maps every source path to its destination with final SHAs.
