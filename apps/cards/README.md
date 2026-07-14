# @ca/cards

The Card Commons publication site: a Next.js app exported static. Renders the
14-slide pitch deck plus the specs, whitepaper, and research — all read at
build time from the ca-complex root (`docs/`, `whitepaper/`, `research/`);
nothing here is a source of truth.

## Develop

```bash
npm run dev --workspace @ca/cards
```

## Gate

```bash
npm run check --workspace @ca/cards
```

Runs `typecheck` → `test` (vitest) → `build` (static export) →
`verify:export` (asserts the 7 static routes exist and are non-empty).
Browser end-to-end (`test:e2e`, axe accessibility included) runs in the root
`npm run check:browser`, not in `check`.

## Deploy

Vercel project (`framework: nextjs`, static export). Production URL: pending
Phase 5 (`app/layout.tsx` carries the `CANONICAL-CUTOVER` placeholder until
then).

## Lore

Born as **card-commons**' `site/` — the publication half of the Card Commons
repo, alongside `apps/studio`. Archived at
<https://github.com/CSandbatch/card-commons>.
