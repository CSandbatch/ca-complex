# AGENTS.md — @ca/studio

## Mission

Card Studio: a server-capable Next.js app (dev on :3100) live as a **gated
pilot** on Vercel. It ships **one** template today — a calling card — stores the
work-in-progress in browser IndexedDB, and exports a 1500×2100 PNG plus a
portable ZIP. It is a narrow slice, not the eventual publishing/stack/game app.
The existing Vercel project is relinked to this monorepo at root directory
`apps/studio` (see `DEPLOYMENT.md`); its production secrets ride along.

## Locked — approval required

- **Do not change the access gate, session signing, or the image allowance
  without explicit approval.** They are the pilot's abuse resistance and are
  security-in-scope (`../../GOVERNANCE.md` / `../../SECURITY.md`). Stop and ask.
- **Server-only secrets stay server-only** (`lib/server/`). The env contract, by
  name only — values are the user's and never enter the repo:
  `OPENROUTER_API_KEY`, `OPENROUTER_SITE_URL`, `OPENAI_API_KEY`,
  `OPENAI_IMAGE_MODEL`, `PILOT_ACCESS_HASH`, `SESSION_SIGNING_SECRET`,
  `PILOT_IMAGE_ALLOWANCE`, `STUDIO_MOCK_IMAGES`. Never log or expose them; never
  edit `.env*` without approval. `STUDIO_MOCK_IMAGES` must never be `true` in
  production.
- **Export filenames are contract.** Both derive from `exportBaseName`
  (`lib/template.ts`): `calling-card.png` and `calling-card.zip`; the e2e export
  test asserts the PNG name. Don't rename.
- AI outputs are provenance-bearing assets (D-007): accepted assets record
  provider + model; rejected candidates leave no trace. Keep that.

## Template registry

The card-template registry (`lib/templates.ts`) ships exactly one template today
— the calling card — and that is the whole product surface. Do not add template
kinds or mode galleries here. Card **kinds** and their document contracts are
governed by `@ca/contracts` (`packages/contracts/schemas`); `lib/validation.ts`
validates against those schemas. Contract changes happen there, not here.

## Gate

Run from the complex root before claiming done:

- `npm run check --workspace @ca/studio` — `typecheck` (tsc) → `test` (vitest,
  mock provider + `fake-indexeddb`) → `build` (next build).
- `npm run test:e2e --workspace @ca/studio` — Playwright, chromium + mobile,
  self-configuring env (mock images, passcode `pilot`). The drag test needs a
  wide viewport; it is part of the gate.

Both are wired into the complex root gate (`check` and `check:browser`).

## Gotchas

- **Never** run a paid image model in CI or tests. `npm run smoke:openrouter`
  spends real credits — manual only, with approval and a live key.
- The emblem layer needs transparency and is gated to transparency-capable
  models. Don't remove that gate.
- Config lives beside this file: `README.md`, `DEPLOYMENT.md`, `.env.example`.

Repo doctrine: `../../AGENTS.md`.
