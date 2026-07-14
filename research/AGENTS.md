# AGENTS.md — research/

The claim ledger: `claims.md` and `sources.md`. This surface exists to keep
**evidence and hypothesis apart**. It backs the site's `/research` route and is
where any external claim must be sourced.

## Local rules

- **Never blur evidence and hypothesis.** A claim is verified only with a source
  entry in `sources.md`; otherwise it's a labeled hypothesis. This is the house
  standard the whole repo leans on (`../SOUL.md` non-negotiables, if present).
- External claims → source entry + claim-ledger update, per `../CONTRIBUTING.md`.
- Business hypotheses (willingness to pay, model shape — D-012) stay labeled as
  hypotheses, not results.
- Never invent partners, metrics, publications, or quotes. If it isn't sourced,
  mark it unsourced or leave it out.

## Gate

`npm run lint:md`, then `npm run build:site` + `npm run verify:pages` (the
`/research` route must render). Then the full `npm run check`.

## Gotchas

- Don't add personal correspondence or private notes here (`../CONTRIBUTING.md`).
- Content, CC BY 4.0.

Project doctrine: `../AGENTS.md`.
