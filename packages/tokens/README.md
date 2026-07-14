# @ca/tokens

The single source of the locked color **palette** for the complex: nine
custom properties per scheme (`--paper`, `--paper-light`, `--ink`,
`--ink-muted`, `--rule`, `--rule-dark`, `--signal`, `--vermilion`,
`--grid-line`), under the canonical doctrine names, in one `ultraviolet`
`:root` block and one `[data-theme="suited-chili"]` block. `tokens.css` here is
the one authoritative copy. The two buildless static apps (`action`, `pitch`)
carry generated copies at `apps/<app>/public/tokens.css`.

Palette only. Fonts, spacing/gutter tokens, and pitch's additional UI-only
custom properties (`--carbon`, `--blue`, `--nav-rule`, etc.) are **not** part
of the locked invariant and stay app-local in each app's own stylesheet.

## Locked invariant

The palette is a **locked invariant**. The nine token values and the two
scheme names (`ultraviolet`, `suited-chili`) are shared across apps and are not
changed without explicit user approval. `tokens.css` was extracted from
common-pitch's `styles.css` (`:root` + `[data-theme="suited-chili"]`), the
declared origin, mapping pitch's `--control-line`→`--rule`, `--line`→
`--rule-dark`, and `--blue-electric`→`--vermilion`. A historical desync was
found during extraction (2026-07-12/13, U2.2) — reported to and resolved by the
user; see U2.2's escalation record. One residual discrepancy remains and is
recorded there rather than silently corrected: common-action's own shipped
`suited-chili` `--vermilion` (`#ff4b1f`) does not equal pitch's
`--blue-electric` in that scheme (`#e52614`) — it instead equals pitch's
separate `--blue` token. The extracted value here follows the agreed mapping
(pitch `--blue-electric`), not common-action's shipped value.

## Edit protocol

1. Edit `tokens.css` in this package. Never edit an app's `public/tokens.css` —
   those are generated and carry a `GENERATED` banner.
2. Run `npm run tokens:sync` from the repo root to propagate the change into
   each static app's `public/tokens.css`.
3. The root gate runs `npm run tokens:check` (byte-compare); drift is a red
   gate. CI runs the same check.

This ends the old manual two-repo palette sync permanently.

## Status

`tokens.css` was extracted in U2.2 (palette-only, doctrine names). `tokens:sync`
and `tokens:check` now read a real source; they still PENDING-skip any target
app whose directory doesn't exist yet (`apps/action`, `apps/pitch` arrive in
U2.3/U2.4).
