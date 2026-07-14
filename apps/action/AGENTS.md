# AGENTS.md — @ca/action

## Mission

The evidentiary brochure: a single-page public memorandum presenting Common
Action's thesis, fields, capabilities, and protocols as a calm, document-like
reading experience. Former repo: `common-action` (final SHA `eadd810`, see
`../../MIGRATION.md`). Sister app `@ca/pitch` is the same organization with a
different posture — persuasion instrument vs. this app's evidentiary brochure.

## Layout

- `public/` — the deployed site: `index.html`, `styles.css`, `app.js`,
  `tokens.css` (generated, see below).
- `brand/design-system.md` — the visual/interaction spec `public/` implements.
- `audit/` — source-content inventory and the visual QA record.

## Locked invariants

- **Palette lives in `@ca/tokens` (`../../packages/tokens/tokens.css`) —
  never redefine `--paper`, `--paper-light`, `--ink`, `--ink-muted`, `--rule`,
  `--rule-dark`, `--signal`, `--vermilion`, or `--grid-line` here.** Edit the
  source and run `npm run tokens:sync` from the repo root; this app's
  `public/tokens.css` is generated — don't hand-edit it. App-local tokens
  (`--sans`, `--serif`, `--mono`, `--page-gutter`, `--section-gap`) stay in
  `public/styles.css`.
- `public/app.js` is the color-scheme switcher only — no other client
  behavior. Site is otherwise static, dependency-free, buildless.
- `public/index.html` must link `tokens.css` before `styles.css`.

## Sanctioned correction

The 2026-06-26 port of the palette into this app's predecessor copied the
wrong suited-chili `--vermilion` (`#ff4b1f`, an older Common Pitch value).
`@ca/tokens` carries the corrected value, `#e52614`, which this app now
inherits via `tokens:sync` — user-approved, not a silent drift.

## Canonical-cutover note

`public/index.html`'s canonical trio (`og:url`, `link rel="canonical"`, the
JSON-LD `url` field) and the Card Commons link still point at
`www.common-action.org` / `csandbatch.github.io`. Each is marked
`<!-- CANONICAL-CUTOVER -->` — real Vercel/production URLs land at Phase 5.
DNS cutover is tracked in `ca-vault kb/lore/domain-cutover.md`.

## Gate

`npm run check --workspace @ca/action` (= `node ../../scripts/check-static.mjs
apps/action`, run from the repo root). Verifies the token single-source rule,
link order, no locked-token redefinition, and no unmarked stale URL. Visual
QA: serve `public/` and look — both color schemes, phone and desktop widths,
reduced motion, print.

Repo doctrine: `../../AGENTS.md`.
