# @ca/action

The evidentiary brochure: a single-page public memorandum presenting Common
Action's thesis, fields, capabilities, and protocols. Static, buildless,
dependency-free — `public/` deploys as-is.

## Develop

No dev script; this app has no build. Serve `public/` with any static file
server and open it in a browser.

## Gate

```bash
npm run check --workspace @ca/action
```

Runs `scripts/check-static.mjs` against this app: the shared-token
single-source rule, link order, no locked-token redefinition, no unmarked
stale URL. Pair it with a visual pass — both color schemes, phone and desktop
widths, reduced motion, print.

## Deploy

Vercel project (static, no build command, `outputDirectory: public`).
Production URL: pending Phase 5.

## Lore

Born as **common-action**, the public-facing half of the org-site pair —
the evidentiary memorandum against `apps/pitch`'s argument cabinet. Archived
at <https://github.com/CSandbatch/common-action>.
