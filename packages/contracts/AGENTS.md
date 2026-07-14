# AGENTS.md — @ca/contracts

The machine-verifiable handoff for the whole complex: JSON Schemas, one OpenAPI
file, fixtures, and the witness harness. Everything here is the **source of
truth**. Docs describe these; these don't describe docs. JSON Schema is 2020-12,
OpenAPI is 3.1 (D-008).

Consumed as a package (`@ca/contracts`) by the apps that emit card documents.
No deploy target — this is a library. No runtime dependencies of its own; `ajv`
and `ajv-formats` come from the root workspace.

Layout:

- `schemas/*.schema.json` — card-document, asset, collection, game,
  publication, generation-job, definitions.
- `openapi.yaml` — the API contract.
- `examples/valid/*` — must validate. `examples/invalid/*` — must fail.
- `witnesses.json` — registry of app builders that emit contract-governed
  documents. Each entry maps a card kind to its `builder`, `export`, `fixture`,
  and a `generator` note describing how the builder's input is obtained.
- `scripts/validate-schemas.mjs` — the ajv fixture gate.
- `scripts/check-fixtures.mjs` — the witness gate (F2/F3): imports each
  registered builder, obtains its input via a per-kind adapter, runs it with the
  fixture's own `metadata.generatedAt` (the sole volatile field), then asserts
  the output validates against the card-document schema and deep-equals the
  fixture. Add a kind: register it in `witnesses.json` and add its input adapter.

## Local rules

- Change a schema → update fixtures in the same change. Add or adjust an
  `invalid/` case that exercises the new rule, not just a `valid/` one.
- Never edit a doc to reflect a contract change without editing the contract.
  Schema first, prose second.
- Any app that emits a contract-governed document registers its builder in
  `witnesses.json`; `check-fixtures.mjs` proves the builder's output still
  matches schema and fixture (witness rule, F2/F3).
- Material contract changes need an issue + ADR + maintainer approval
  (`../../CONTRIBUTING.md`, `../../DECISIONS.md`). You draft; a maintainer
  decides.

## Gate

`npm run validate:schemas` (ajv) **and** `npm run validate:openapi` (redocly)
**and** `npm run fixtures:check` (witnesses) — all green before "done". These
run inside the root `check:root` gate; run the full `npm run check` before
claiming done.

## Gotchas

- The validator runs ajv in `strict: true` — an unknown keyword or bad format is
  a hard failure, not a warning.
- `valid/` files must pass and `invalid/` must fail; a fixture in the wrong
  folder breaks the gate even if the schema is fine.
- `validate-schemas.mjs` resolves paths from the package root; keep it inside
  `packages/contracts/scripts/`.

Repo doctrine: `../../AGENTS.md`.
