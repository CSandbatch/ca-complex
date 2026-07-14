# ONTOLOGY.md — ca-complex

The operating categories of this repo. Nouns, not procedures. What a thing *is*
here — how work moves through it lives in `PROCESSES.md`.

## Workspace

A member of the npm-workspaces tree: an entry under `apps/*` or `packages/*`
with its own `package.json`. Each workspace stands as its own unit of work,
declares its own gate, and is a node in the registry graph. The root is not a
workspace; it is the container that runs the cross-cutting gate and fans out to
the members.

## App

A deployable workspace under `apps/`. Named by function (`action`, `pitch`,
`atlas`, `cards`, `studio`), package name `@ca/<id>`. Each app deploys to its
own Vercel project. Two shapes:

- **Static** (`action`, `pitch`, `atlas`) — no build, or a dev-only server;
  `public/` is served as-is. Austerity is the point.
- **Built** (`cards`, `studio`) — Next.js; a build step produces the deployed
  artifact.

## Package

A non-deployable workspace under `packages/` — a shared library other workspaces
consume. `@ca/contracts` (the machine contracts) and `@ca/tokens` (the palette).
A package has no deploy target.

## Contract

A machine-verifiable definition in `@ca/contracts`: a JSON Schema, the OpenAPI
file, or a fixture. Contracts are the source of truth — docs describe them, they
do not describe docs. A contract change lands with its fixtures, including an
invalid case that exercises the new rule.

## Token

A locked color-system value in `@ca/tokens`. The `ultraviolet` and
`suited-chili` schemes. Tokens have exactly one source (`packages/tokens/
tokens.css`) and are propagated to static apps as generated copies. Changing a
token value or a scheme name is a locked-invariant change requiring approval.

## Witness

A registered builder (in `packages/contracts/witnesses.json`) that emits a
document governed by a contract. The witness harness proves the builder's output
still matches its schema and its checked-in fixture. An unregistered builder or
a drifted fixture is a red gate.

## Gate

The check that proves work is done. Each workspace declares its own
(`fw:gateCommand`); the root `check` runs the cross-cutting `check:root` plus
every workspace gate. Browser gates (`check:browser`) run separately. "The gate
is the truth" — a claim of done without a green gate run is not done.
