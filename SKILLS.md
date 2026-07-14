# SKILLS.md — ca-complex

Task class → which process to run + which gate proves done. The procedures live
in `PROCESSES.md`; the doctrine in `AGENTS.md`.

| Task class | Process | Gate that proves done |
|---|---|---|
| Change an app's behavior or UI logic | Work in the app; follow its `AGENTS.md` | The app's own gate, then `npm run check` |
| Change a static app (`action`, `pitch`) | Edit `public/`; never edit generated `tokens.css` | `node scripts/check-static.mjs apps/<app>`, then `npm run check` |
| Change the palette | Sync tokens (needs approval — locked invariant) | `npm run tokens:check` green, then `npm run check` |
| Change a contract | Change a contract | `validate:schemas` + `validate:openapi` + `fixtures:check`, then `npm run check` |
| Add/change an app builder that emits a contract document | Check fixtures (witness harness) | `npm run fixtures:check`, then `npm run check` |
| Add a dependency to a workspace | State the reason; change the owning `package.json`; let the toolchain write the lockfile | `npm install` clean + `npm run check` |
| Verify the whole repo | Run the root gate | `npm run check` green; `npm run check:browser` for e2e |

## Rules that cut across every task

- Read the target workspace's `AGENTS.md` and its structure before editing.
- Put new logic where the architecture says it goes — thin entry points stay
  thin; focused modules take the weight.
- Generated files (app `tokens.css`, build output, lockfiles) are regenerated
  from their source, never hand-edited.
- The gate is the truth. Run it; report what it returned, output included on
  failure. Never claim a gate passed without a run to quote.
- New logic that inflates the product past its declared shape (extra
  dashboards, mode galleries, scope creep) stops before code — escalate.
- Locked invariants (palette, Studio access gate) and irreversible actions
  (push, delete, `.env`) are the orchestrator's call, not a subagent's.
