# AGENTS.md — docs/

The 9 canonical specification documents, from the executive brief through the MVP
delivery plan and business hypotheses. This is the normative prose. The site
renders these files directly — they are the single copy.

Files: `00-executive-brief` … `08-research-and-business-hypotheses`, plus
`assets/` (site/studio screenshots).

## Local rules

- **MUST / SHOULD / MAY are normative** — used in their ordinary requirements
  sense. Don't change one to another without treating it as a material change.
- Docs describe the contracts; they are not the source of truth. If a doc and a
  schema disagree, the schema in `../contracts/` wins — fix the doc, or fix the
  schema through the contract process first.
- v0.1.0 is a proposal, not a standard. Don't write it as adopted or final.
- Material scope/protocol changes need an issue + ADR + approval
  (`../CONTRIBUTING.md`, `../DECISIONS.md`). You draft; a maintainer decides.

## Gate

`npm run lint:md`. If the change feeds a site route, also `npm run build:site` +
`npm run verify:pages`. Then the full `npm run check`.

## Gotchas

- `verify:pages` expects certain docs to back specific routes — renaming or
  removing one can break the static export.
- Screenshots in `assets/` are content (CC BY 4.0), not code.

Project doctrine: `../AGENTS.md`.
