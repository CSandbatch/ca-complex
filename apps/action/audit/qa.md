# Common Action — Local QA

**Completed:** 2026-06-26  
**Target:** `docs/index.html`

## Viewports

| Width | Result |
|---:|---|
| 320px | Pass — no horizontal overflow |
| 390px | Pass — no horizontal overflow |
| 768px | Pass — no horizontal overflow |
| 1440px | Pass — no horizontal overflow |

## Checks

- One primary `h1`.
- CSS loads without external dependencies.
- Internal navigation targets resolve.
- Anchor navigation was exercised successfully.
- No page errors or failed requests were observed.
- Email address uses an actionable `mailto:` link.
- Desktop and mobile full-page captures completed.
- Reading order follows the document order.
- Skip link and semantic landmarks are present.
- SVG has a title and description.
- Reduced-motion and print rules are present.

## Correction During QA

The long word “comprehension” produced horizontal overflow below 640px. The mobile display scale was reduced while preserving the headline’s editorial hierarchy.

## Captures

- `audit/screens/home-desktop.png`
- `audit/screens/home-mobile.png`
