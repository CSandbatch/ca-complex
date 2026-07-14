# Card Studio — pilot deployment checklist

The Studio is a server-capable Next.js app that lives in the **ca-complex**
monorepo at `apps/studio/` and deploys as its own Vercel project, separate from
the other apps in the complex. It is not rebuilt from scratch on Vercel: the
**existing** `card-commons-studio` Vercel project is **relinked** to ca-complex
(Phase 5), so its production environment variables ride along untouched — no
secret is re-entered by hand.

## 1. Generate secrets

```bash
# Passcode hash (share the plaintext passcode with pilot users out of band):
printf '%s' 'your-shared-passcode' | sha256sum    # -> PILOT_ACCESS_HASH

# Session signing secret (>= 32 bytes):
openssl rand -hex 32                               # -> SESSION_SIGNING_SECRET
```

## 2. Relink the Vercel project

The Studio already has a live Vercel project. Rather than importing a new one,
repoint the existing project at the monorepo:

- Git repository: **ca-complex** (`CSandbatch/ca-complex`).
- **Root Directory**: `apps/studio`.
- Framework preset: Next.js (already declared in `vercel.json`).
- Build/install commands: defaults.
- Confirm the production environment variables (§3) survived the relink —
  they are attached to the project, not the repo, so they should still be
  listed. If a fresh import is unavoidable, re-enter them from your own vault;
  they are never committed to the repo.

## 3. Environment variables (Production)

| Variable | Required | Notes |
| --- | --- | --- |
| `OPENROUTER_API_KEY` | Yes | Powers the five OpenRouter models. |
| `OPENROUTER_SITE_URL` | Optional | Attribution header; set to the deployed URL. |
| `OPENAI_API_KEY` | Only for the direct GPT-Image option | Server-only. |
| `OPENAI_IMAGE_MODEL` | Optional | Direct path model; defaults to `gpt-image-2`. |
| `PILOT_ACCESS_HASH` | Yes | SHA-256 hex of the shared passcode. |
| `SESSION_SIGNING_SECRET` | Yes | Random 32+ byte secret. |
| `PILOT_IMAGE_ALLOWANCE` | Optional | Images per 8-hour session (1–200, default 20). |
| `STUDIO_MOCK_IMAGES` | Leave unset | Must never be `true` in production. |

## 4. Smoke test before sharing the passcode

From `apps/studio/`, with `OPENROUTER_API_KEY` set:

```bash
npm run smoke:openrouter            # default model: background + transparent emblem
npm run smoke:openrouter -- --all   # every OpenRouter model (spends more credits)
npm run smoke:openrouter -- --edit  # also exercise the input_references edit path
```

Confirm: each model returns a decodable image, the emblem run reports `alpha ✓`,
and the request shape (`aspect_ratio`) is accepted. If a model rejects
`aspect_ratio`, adjust the body in `lib/server/provider.ts` (and the script).
This step spends real credits and is intentionally never run in CI.

## 5. Link the cards site to the live Studio

The publication site now ships as the `apps/cards` app in this same monorepo.
Set its `NEXT_PUBLIC_STUDIO_URL` (Vercel project environment variable) to the
deployed Studio URL and redeploy `apps/cards`. The site header reads it to show
the Studio link.

## 6. Pre-share security checklist

- [ ] `STUDIO_MOCK_IMAGES` is unset in production.
- [ ] `PILOT_ACCESS_HASH` and `SESSION_SIGNING_SECRET` are set (the app refuses
      protected operations in production without them).
- [ ] Passcode shared out of band; not committed anywhere.
- [ ] `PILOT_IMAGE_ALLOWANCE` set to a budget you are comfortable spending per
      session (the only built-in cost cap).
- [ ] A spending limit is configured on the OpenRouter account itself.
- [ ] Smoke test passed against the production key.
