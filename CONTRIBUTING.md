# Contributing

Card Commons welcomes corrections, implementation feedback, interoperable
examples, research, and carefully scoped proposals.

## Before opening a change

1. Read the [executive brief](docs/00-executive-brief.md) and
   [decision log](DECISIONS.md).
2. Open an issue for changes that alter a normative contract, product scope,
   or governance rule.
3. Separate verified evidence from hypotheses. External claims require a
   source entry and a claim-ledger update.
4. Do not add personal correspondence, private research notes, or generated
   assets without provenance and usage rights.

## Pull requests

- Keep the canonical idea in one document and link to it elsewhere.
- Update JSON Schema fixtures whenever a contract changes.
- Add an architecture decision record for material changes.
- Run `npm run check`.
- Describe compatibility and migration impact.

## Specification changes

Breaking protocol changes increment the minor version during the `0.x`
series. Editorial changes do not. A proposal becomes accepted after:

1. a public issue states the problem and alternatives;
2. at least one maintainer approves the decision;
3. schemas, examples, documentation, and tests agree; and
4. the decision is recorded in `DECISIONS.md`.

