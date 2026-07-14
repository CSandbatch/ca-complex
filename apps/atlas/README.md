# @ca/atlas

Signal Atlas: a static-first local-intelligence surface for New Orleans — one
map, one feed, one visual system, collapsing local reporting, neighborhood
writing, live events, and curated Mixtapes into one place-driven reading
environment. Node ESM, no build step.

## Develop

```bash
npm run dev --workspace @ca/atlas
```

Runs `scripts/dev-server.mjs`, a static file server over `public/` (dev and
smoke use only — nothing server-side ships to production).

## Gate

```bash
npm run smoke --workspace @ca/atlas
```

Playwright loads the app, opens a Mixtape, exports a `mixtape_card`, and
asserts the downloaded CardDocument shape. `npm run check` aliases this.

## Deploy

Vercel project (static, no build command, `outputDirectory: public`).
Production URL: pending Phase 5.

## Lore

Born on Replit as **on-high-in-blue-tomorrows**, the app that first carried
the name Signal Atlas. Archived at
<https://github.com/St-Expedite-Press/on-high-in-blue-tomorrows>.
