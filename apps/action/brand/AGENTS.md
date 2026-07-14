# brand/ — design-system spec

`design-system.md`: the visual and interaction specification — the source of
truth for tokens, type scale, spacing, and component rules that `docs/`
implements.

## Local rules

- This file documents `docs/`'s implementation; it doesn't run anything.
  Update it when `docs/styles.css` changes for a real reason — don't let it
  drift into fiction.
- Color tokens documented here must match `../AGENTS.md` § Color Schemes
  (Locked) verbatim. If they diverge, `AGENTS.md`'s table is authoritative —
  fix this file, not the other way round.

## Gate

No build here. The check is a diff: read `design-system.md` against
`../docs/styles.css` and confirm the tokens and component rules still match.

## Gotchas

- Don't sketch a new palette or token here "to try it out." Locked schemes
  need approval before they exist anywhere — including as a draft in this
  file.

Project doctrine: `../AGENTS.md`.
