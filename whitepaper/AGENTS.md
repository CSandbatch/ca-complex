# AGENTS.md — whitepaper/

The long-form argument for Card Commons: `card-commons.md`. One canonical copy;
the site renders it at `/whitepaper`. Content, licensed CC BY 4.0
(`../LICENSE-CONTENT.md`).

## Local rules

- One canonical idea, one place. Don't duplicate spec prose from `../docs/` here
  or vice versa — link instead. Keep the pieces from drifting.
- Claims about evidence vs. hypothesis stay separate and labeled. External
  claims need a source entry and a claim-ledger update in `../research/`
  (`../CONTRIBUTING.md`).
- Never invent numbers, partners, endorsements, or outcomes. v0.1.0 is a
  proposal.

## Gate

`npm run lint:md`, then `npm run build:site` + `npm run verify:pages` (the
`/whitepaper` route must render and be non-empty). Then the full `npm run check`.

## Gotchas

- The word count and structure are load-bearing for the site's whitepaper page;
  a broken heading structure can affect rendering.

Project doctrine: `../AGENTS.md`.
