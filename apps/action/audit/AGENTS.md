# audit/ — source-site evidence and QA record

The evidentiary record: `content-inventory.md`, `design-inventory.md`,
`qa.md`, and `screens/` (desktop and mobile captures). This is the paper
trail that proves the rebuild didn't invent anything.

## Local rules

- Every claim in `content-inventory.md` traces to the live source
  (<https://www.common-action.org/>) or is marked as proposed articulation, not
  verified fact.
- `qa.md` entries are dated and record actually observed results, not intent.

## Gate

Re-running an audit or QA pass: serve `docs/` on 8770 (see `../AGENTS.md`),
capture desktop and mobile, and write the result into `qa.md` in the same
format as its existing entries.

## Gotchas

- `screens/` holds binary captures — don't hand-edit them; regenerate.
- If the live source site has changed since the last audit, say so before
  reusing old inventory as current fact.

Project doctrine: `../AGENTS.md`.
