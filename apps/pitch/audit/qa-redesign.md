# Common Action — Argument Cabinet QA

**Date:** 2026-06-26  
**Target:** Local redesign in `docs/`  
**Publication status:** Deployed to `https://csandbatch.github.io/common-pitch/`
(pre-migration; the app now lives at `apps/pitch` in ca-complex)

## Responsive rendering

| Viewport | HTTP | Page overflow | Console errors | Failed requests |
|---:|---:|---:|---:|---:|
| 320 × 800 | 200 | None | None | None |
| 390 × 844 | 200 | None | None | None |
| 768 × 900 | 200 | None | None | None |
| 1440 × 1000 | 200 | None | None | None |

Horizontal overflow inside each card rail is intentional and locally contained.

## Structure

- One `h1`.
- Thirteen stable argumentative cards.
- No duplicate IDs.
- No broken internal anchors.
- No unlabeled buttons.
- No third-party requests.
- All institutional content remains present in semantic HTML.

## Interaction checks

- Card turns expose the reverse and return focus to the active face.
- Add/remove controls stay synchronized across card faces.
- Hand count and dock update correctly.
- Dossier dialog renders the selected cards.
- Share query restores a two-card hand from `?hand=thesis,climate`.
- Presenter mode opens from the selected hand.
- Right-arrow navigation advances from slide `01 / 02` to `02 / 02`.
- Native dialog escape behavior remains available.

## Captures

- `audit/screens/redesign-desktop.png`
- `audit/screens/redesign-mobile.png`
- `audit/screens/ultraviolet-desktop.png`
- `audit/screens/ultraviolet-mobile.png`

## Ultraviolet palette verification

- Blue/highlighter-yellow revision rendered at 320, 390, 768, and 1440px.
- No document-level horizontal overflow at any tested width.
- Card rails retain intentional local horizontal scrolling.
- Card selection and presenter mode remain operational.
- No page errors or failed requests.

## Theme-switch verification

- “Color change” button is keyboard-operable and exposes `aria-pressed`.
- Default Ultraviolet theme verified at 320, 390, 768, and 1440px.
- Suited Chili theme verified at 320, 390, 768, and 1440px.
- Theme choice persists through `localStorage` after reload.
- Both themes retain exact document width at every tested viewport.
- Suited Chili captures: `audit/screens/suited-chili-desktop.png` and `audit/screens/suited-chili-mobile.png`.
