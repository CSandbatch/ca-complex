# @ca/studio

Card Studio is a private-pilot editor built on a card-template registry
(`lib/templates.ts`); it ships one template today, `calling-card-nocturne-v1`.
It is a separate, server-capable Next.js app living at `apps/studio` in the
ca-complex monorepo; `apps/cards` (the publication site) is static and
independent.

## Local development

Copy `.env.example` to `.env.local`. For interface work without image charges,
set `STUDIO_MOCK_IMAGES=true`. The development fallback passcode is
`card-commons`; production refuses to start protected operations without
explicit secrets.

```bash
npm run dev --workspace @ca/studio
```

The editor opens at <http://localhost:3100>. Cards and accepted binary assets
are stored in browser IndexedDB. They are never uploaded unless an asset is
explicitly sent as the source or reference for an image edit.

## Image models

Generation runs through OpenRouter's unified image API, with the direct OpenAI
API kept as one option. A global default model is persisted locally and can be
overridden per generation from the inspector. Selectable models:

| Model | OpenRouter ID | Edit refs | Transparent emblem |
| --- | --- | --- | --- |
| OpenAI GPT-Image | `openai/gpt-image-1` | 16 | ✅ |
| Gemini Flash Image (Nano Banana) | `google/gemini-3.1-flash-image` | 14 | ❌ |
| Seedream 4.5 | `bytedance-seed/seedream-4.5` | 14 | ❌ |
| FLUX.2 Pro | `black-forest-labs/flux.2-pro` | 8 | ❌ |
| Grok Imagine | `x-ai/grok-imagine-image-quality` | 3 | ❌ |
| OpenAI GPT-Image (direct) | OpenAI API (`gpt-image-2`) | 16 | ✅ |

The emblem layer needs a transparent background, so it is gated to
transparency-capable models; the UI offers a one-click switch when the selected
model cannot produce it.

## Production variables

- `OPENROUTER_API_KEY`: server-only OpenRouter credential (most models).
- `OPENROUTER_SITE_URL`: optional attribution header sent to OpenRouter.
- `OPENAI_API_KEY`: server-only OpenAI credential (direct GPT-Image option only).
- `OPENAI_IMAGE_MODEL`: direct-path model, defaults to `gpt-image-2`.
- `PILOT_ACCESS_HASH`: lowercase SHA-256 hex digest of the shared passcode.
- `SESSION_SIGNING_SECRET`: a random secret of at least 32 bytes.
- `PILOT_IMAGE_ALLOWANCE`: images per 8-hour session (1–200, default 20).
- `STUDIO_MOCK_IMAGES`: leave unset or `false`.

See [DEPLOYMENT.md](DEPLOYMENT.md) for the full Vercel pilot checklist.

## Live smoke test

Before sharing the pilot, confirm the OpenRouter path end to end. From this
directory with `OPENROUTER_API_KEY` set:

```bash
npm run smoke:openrouter            # default model: background + transparent emblem
npm run smoke:openrouter -- --all   # every OpenRouter model
npm run smoke:openrouter -- --edit  # also exercise the edit (input_references) path
```

It verifies each model returns a decodable image, that the emblem run has an
alpha channel, and that the request shape is accepted. It spends real credits
and is never run in CI.

**Verified live (2026-06):** all six models generate; `openai/gpt-image-1`
produces a true transparent emblem (alpha confirmed). GPT-Image, Gemini, and
Grok honor `aspect_ratio: "2:3"`; Seedream and FLUX ignore it, so the provider
sends them an explicit portrait `size` instead (FLUX `1024x1536`, Seedream
`1664x2496`) to get portrait output. The `input_references` edit path
round-trips on GPT-Image.

Set the deployed Studio URL as the `NEXT_PUBLIC_STUDIO_URL` Vercel project
variable on `apps/cards`; its publication build uses it for the Studio link.

The cookie session lasts eight hours and permits 20 successful image requests.
This is pilot-level abuse resistance, not an account or billing system.

## Verification

```bash
npm run typecheck --workspace @ca/studio
npm run test --workspace @ca/studio
npm run build --workspace @ca/studio
npm run test:e2e --workspace @ca/studio
```

CI uses the deterministic mock provider and never invokes a paid image model.
Live-provider smoke tests are intentionally manual.

## Deploy

The existing `card-commons-studio` Vercel project relinks to this monorepo at
root directory `apps/studio`; production environment variables ride along
unchanged. See `DEPLOYMENT.md` for the full checklist. Production URL: pending
Phase 5 (relink not yet performed).

## Lore

Born as **card-commons**' `studio/` — the editor half of the Card Commons
repo, alongside `apps/cards`. Archived at
<https://github.com/CSandbatch/card-commons>.
