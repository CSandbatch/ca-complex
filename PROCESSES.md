# PROCESSES.md — ca-complex

Ordered, repeatable procedures specific to this repo. Which procedure a given
task class runs is in `SKILLS.md`; the procedures themselves are here.

## Run the root gate

The cross-cutting gate plus every workspace's own gate.

1. `npm install` at the root if dependencies have changed.
2. `npm run check`. This runs `check:root`
   (`lint:md` → `validate:schemas` → `validate:openapi` → `tokens:check` →
   `fixtures:check`), then each workspace's `check` via `--workspaces
   --if-present`.
3. Read the actual output. `tokens:check` and `fixtures:check` may print a
   PENDING line and exit 0 while their inputs (the extracted `tokens.css`, the
   registered witnesses) do not yet exist — that is expected during assembly,
   not a pass to hide.
4. Green means every step ran and passed or reported PENDING honestly. Report
   the tail of the output, not a summary.

## Run a workspace gate

To prove work inside one app or package without the whole tree:

1. From the root: `npm run check --workspace <name>` (e.g. `@ca/contracts`), or
   run the workspace's declared gate directly.
2. Static apps: `node scripts/check-static.mjs apps/<app>`.
3. Read the output; fix what it names. Do not loosen a check to make it pass.
4. Finish with the full `npm run check` before claiming done.

## Sync tokens

When the palette source changes (locked-invariant change — needs approval
first):

1. Edit `packages/tokens/tokens.css` only. Never edit an app's generated copy.
2. `npm run tokens:sync` — writes each static app's `public/tokens.css` with the
   GENERATED banner.
3. `npm run tokens:check` — byte-compare; must be green.
4. Commit the source and the regenerated copies together.

## Check fixtures (witness harness)

When an app builder that emits a contract-governed document changes:

1. Ensure the builder is registered in `packages/contracts/witnesses.json`.
2. `npm run fixtures:check` — imports each builder, runs it, validates output
   against schema and checked-in fixture (volatile fields normalized).
3. A drifted fixture or an unregistered builder is a red gate. Regenerate the
   fixture from the builder (never hand-edit it) or register the builder.
4. Full harness lands in U2.8; until then this reports PENDING and exits 0.

## Change a contract

1. Establish the source of truth: schema first, prose second.
2. Make the schema/OpenAPI change in `packages/contracts/`.
3. Update fixtures in the same change — a valid case that exercises the new
   rule and an invalid case that proves the rule rejects.
4. `npm run validate:schemas` and `npm run validate:openapi` green.
5. Sweep consumers (apps that read the contract) and confirm they still
   validate or are updated in the same change.
6. Material change → issue + ADR + maintainer approval.

## Concurrent installs (multi-agent or multi-terminal)

npm workspaces share one root lockfile and one `node_modules/`; concurrent
`npm install` runs can corrupt both. Serialize with the mkdir mutex — mkdir
is atomic, so exactly one holder wins:

```sh
until mkdir .install-lock 2>/dev/null; do sleep 5; done
npm install
rmdir .install-lock   # ALWAYS release, even on failure
```

A stale `.install-lock` with no install running is a crash leftover — remove
it.

## Fresh-clone verification (release-grade proof)

The strongest check this repo has: prove it works from nothing but the
remote. Run before claiming a release-worthy state:

1. `git clone <repo> <short-path>` — on Windows use a SHORT path
   (`C:\t\cs`): Turbopack sourcemap filenames exceed MAX_PATH in deep
   folders.
2. `npm ci`
3. `npm run check` — read the exit code bare; never pipe a gate.

This gate caught the line-ending drift that per-workspace gates structurally
could not (they never see a foreign checkout).
