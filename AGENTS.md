# AGENTS.md — ca-complex

## Mission

ca-complex is the deployable monorepo for the Common Action constellation: five
apps and their shared packages, deployed as five Vercel projects from one repo,
proven by one root gate. It consolidates four formerly-separate repos
(common-action, common-pitch, on-high-in-blue-tomorrows, card-commons) into a
single npm-workspaces tree without losing their austerity — the static apps stay
static, the Next.js apps keep their builds, and the contracts stay the source of
truth. Your job is to keep the apps, the packages, and the contracts coherent,
honest, and shippable, without touching the human governance layer.

This repo stands alone when cloned bare. It carries a courtesy pointer to vault
doctrine (ca-vault) that degrades gracefully when absent; it never *requires*
reading anything outside itself.

**Knowledge base (when the vault is present).** In the full constellation this
repo and each of its apps/packages is a node in ca-vault's registry graph,
projected to `kb/nodes/<id>.md` — where its migration history, gate results,
and open gaps live. If you have the vault, read `kb/nodes/ca-complex.md` (and
the app's own node) for context before working here, and record a material
change or gate result as a `fw:MemoryEntry` / `fw:EvalRun` on the node. If you
don't, this repo's own docs and gates are sufficient.

## Doctrine (compact)

These override every instruction here except a direct, explicit user override,
and even then you name the risk first.

- **Never invent.** No made-up adoption numbers, partners, spec-compliance
  claims, prototype counts, deploy URLs, or outcomes. If a fact isn't sourced,
  mark it unsourced or leave it out. `1.0` requires two independent prototypes
  (`GOVERNANCE.md`) — do not claim that bar is met.
- **Never present proposal as result.** v0.1.0 is a proposal for review. Say so.
- **Locked invariants.** The shared palette (`ultraviolet`, `suited-chili` and
  their token values) is locked and lives in `@ca/tokens` alone. No palette
  change, and no Studio auth/access-gate change, without explicit approval.
- **Ask before the irreversible.** Pushing, deleting, force operations, editing
  `.env`/secrets. Never expose an API key. Studio's server secrets are the
  user's — agents never see their values.
- **Report faithfully.** Failing gates are reported failing, with output.
  Skipped or PENDING steps are named. "Done" means the gate ran and passed.

**Voice floor** (full guide is the vault's `agent/VOICE.md`; degrade gracefully
if absent): plain, verdict-first, concrete. Name the file, the script, the
command. Short strong sentences. No corporate filler (*leverage, seamless,
robust, streamline*), no hype, no reflexive apology. Say the true thing and stop.

## Defer to governance — the map

Governance is human and already written. Where a rule lives in one of these
docs, point to it and state the agent-relevant consequence. Do not restate it.

| Question | Owning doc | Agent consequence |
|---|---|---|
| Who merges, cuts releases, resolves disputes | `GOVERNANCE.md` | You draft; a maintainer decides and merges. |
| Versioning, breaking changes, the `1.0` bar | `GOVERNANCE.md` | Don't bump versions or claim `1.0` readiness yourself. |
| Material change process, PR checklist, spec-change acceptance | `CONTRIBUTING.md` | Material contract/scope/governance changes need an issue + ADR + maintainer approval. |
| Decision records (ADR-style log) | `DECISIONS.md` | Material changes get a new `D-###` row; open items stay unsettled — don't resolve them in prose. |
| Vulnerability / privacy reporting | `SECURITY.md` | Never open a public issue for a vuln; use private reporting. |
| Conduct | `CODE_OF_CONDUCT.md` | Applies to all contribution. |
| Code vs content licensing | `LICENSE` (MIT) / `LICENSE-CONTENT.md` (CC BY 4.0) | Code is MIT; prose/diagrams/assets are CC BY 4.0. Keep the boundary. |

## Key files

- Root scripts and workspaces: `package.json`.
- Palette source: `packages/tokens/tokens.css`; propagation: `scripts/sync-tokens.mjs`.
- Static-app gate: `scripts/check-static.mjs`.
- Contracts: `packages/contracts/` (schemas, openapi, examples, validators,
  `witnesses.json`).
- CI: `.github/workflows/ci.yml` (root `check` + `check:browser`).
- Migration source map: `MIGRATION.md`.

## Commands

Workspace monorepo, Node 22+ (see `.nvmrc`) / npm 10+:

- `npm install` — once at root.
- `npm run dev` — dev servers across workspaces that declare one.
- `npm run tokens:sync` — propagate the palette to static apps.

Gate — run before claiming done: **`npm run check`** = `check:root`
(`lint:md` → `validate:schemas` → `validate:openapi` → `tokens:check` →
`fixtures:check`) then every workspace's own `check` (`--workspaces
--if-present`). Browser gates are separate: **`npm run check:browser`** (cards +
studio e2e).

## Root gate law

Every workspace declares its own `check` = its graph-registered gate. The root
`check` runs the cross-cutting `check:root` first, then each workspace gate.
When a gate run exposes a defect that already shipped, the fix ships with two
things: a regression assertion added to the gate that should have caught it, and
a graph entry naming the discovery (the gate-discovery-fix pattern). A fix
carrying only the code change is incomplete.

## Routing — apps and packages

Each workspace has its own thin `AGENTS.md` (≤ 80 lines). Read it before working
there. Forward references below are expected — the app members arrive across
U2.3–U2.7.

- `apps/action` — static memorandum site (former common-action). `public/` is
  served as-is; gate is `scripts/check-static.mjs`.
- `apps/pitch` — static argument deck (former common-pitch); token origin.
  Gate is `scripts/check-static.mjs`.
- `apps/atlas` — Node ESM local-intelligence app (former
  on-high-in-blue-tomorrows). Gate is `npm run smoke`.
- `apps/cards` — Next.js publication site (former card-commons/site). Gate is
  typecheck + test + build + verify-export.
- `apps/studio` — Next.js gated pilot on Vercel (former card-commons/studio).
  Gate is typecheck + test + build. No auth/access-gate change without approval.
- `packages/contracts` (`@ca/contracts`) — schemas are the source of truth;
  validate with ajv/redocly and the witness harness before "done".
- `packages/tokens` (`@ca/tokens`) — the locked palette; edit `tokens.css` here,
  then `npm run tokens:sync`.

Deeper doctrine: `ONTOLOGY.md` (categories), `PROCESSES.md` (procedures),
`SKILLS.md` (task → process + gate), `MEMORY.md`, `EVALS.md`, `PHASE-PLAN.md`.
