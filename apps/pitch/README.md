# @ca/pitch

The argument cabinet: a static, dependency-free interactive deck — 14 cards
across 4 stacks, flip/collect/hand/present, a simulated `/consult` seam.
`public/` deploys as-is.

## Develop

No dev script; this app has no build. Serve `public/` with any static file
server and open it in a browser.

## Gate

```bash
npm run check --workspace @ca/pitch
```

Runs `scripts/check-static.mjs` against this app: the shared-token
single-source rule, no locked-token redefinition, no unmarked stale URL. Pair
it with a manual pass in both color schemes, exercising flip, collect-to-hand,
hand dialog, presenter, and consult-start at 320/390/768/1440px.

## Deploy

Vercel project (static, no build command, `outputDirectory: public`).
Production URL: pending Phase 5.

## Lore

Born as **common-pitch**, the persuasion-instrument half of the org-site
pair, and the origin repo of the shared `ultraviolet` / `suited-chili`
palette now living in `@ca/tokens`. Archived at
<https://github.com/CSandbatch/common-pitch>.
