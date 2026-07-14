# AGENTS.md — apps/pitch

## What this is

The argument cabinet: a static, dependency-free interactive deck (former
common-pitch). `public/index.html` + `public/styles.css` + `public/app.js` +
`public/tokens.css` deploy as-is to a Vercel static project (`vercel.json`,
`outputDirectory: public`, no build). `brand/` is the design-system spec;
`audit/` is source-site/QA evidence. Not a library — deploys directly.

## Locked invariants

- **Palette lives in `@ca/tokens` alone.** `public/tokens.css` is GENERATED
  (`npm run tokens:sync` from repo root) — never hand-edit it, never redefine
  `--paper --paper-light --ink --ink-muted --rule --rule-dark --signal
  --vermilion --grid-line` in `public/styles.css`. This app was the palette's
  origin repo; `styles.css` now aliases its own historical names to the
  tokens instead: `--control-line: var(--rule)`, `--line: var(--rule-dark)`,
  `--blue-electric: var(--vermilion)`. Touch the alias block only if the
  underlying token names change upstream — not to restyle anything.
- **Deck DOM contract.** `public/app.js` moved untouched from common-pitch and
  is load-bearing on exact selectors — never rename or remove: `[data-card-id]`
  (14 cards, 4 stacks — the `INDEX / 14 CARDS / 04 STACKS` label in
  `index.html` must stay truthful), `[data-flip]`, `[data-collect]`,
  `[data-hand-count]`, `[data-open-hand]`, `[data-hand-dialog]`,
  `[data-hand-list]`, `[data-present]`, `[data-presenter-dialog]`,
  `[data-exit-presenter]`, `[data-slide-progress]`, `[data-consult]`,
  `[data-consult-dialog]`, `[data-consult-step]`, `[data-theme-toggle]`,
  `[data-status-message]`. `cardData()` reads `.card-front .card-meta
  span:last-child` and `.card-front .card-body > p:last-child` — a markup
  change inside `.argument-card` that breaks those selectors breaks the deck
  silently. Any HTML/CSS restructuring gets a full flip/collect/hand/present/
  consult pass before it ships.
- **The `/consult` seam is simulated, not live.** `public/app.js` generates
  the consultation package client-side; checkout and scheduling are a mockup
  (fake price, fake pay form, fake slots). The intended backend is a
  Cloudflare Worker calling OpenRouter's free endpoint — no such call exists
  today. Never claim this flow is live; wiring a real backend is new work,
  not a fix.
- Both color schemes (`ultraviolet` default, `suited-chili`) are locked.
  Switcher persists to `localStorage["common-pitch-theme"]`.

## Gate

```sh
npm run check          # from apps/pitch/, or:
node ../../scripts/check-static.mjs apps/pitch   # from repo root
```

Static QA (no automated e2e here): serve `public/` on 8772, exercise flip,
collect-to-hand, hand dialog, presenter, and consult-start in both schemes,
check 320/390/768/1440px for overflow.

## Canonical-cutover note

`index.html`'s canonical trio (`og:url`, `link[rel=canonical]`,
`application/ld+json` `url`) and the Card Commons cross-link (P4 card,
`card-unit`) still point at the pre-migration URLs
(`www.common-action.org`, `csandbatch.github.io/card-commons`), each marked
`<!-- CANONICAL-CUTOVER -->`. Real URLs land in Phase 5 (U5.2); the marker
comments are what `check-static.mjs` allows to stay stale until then.

## Gotchas

- `styles.css`'s alias block sits at the top of the file, above the app-local
  UI tokens (`--carbon`, `--paper-dark`, `--blue`, `--blue-deep`, etc., which
  are NOT shared and stay defined here).
- `npm run tokens:sync --check` (root `tokens:check`) fails the build if
  `public/tokens.css` drifts from `packages/tokens/tokens.css` — re-run sync,
  don't hand-patch.

Repo doctrine: `../../AGENTS.md`.
