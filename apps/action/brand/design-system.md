# Common Action Design System

## Design Thesis

An evidentiary interface: low-entropy chrome, high-dimensional content. The page borrows from research memoranda, field reports, technical standards, and public records without imitating government bureaucracy.

## Palette

The site ships **two locked color schemes** — `ultraviolet` (default) and
`suited-chili` — ported from Common Pitch on 2026-06-26 and switched at runtime.
Canonical token values live in **one place only**: `../AGENTS.md` § Color
Schemes (Locked). This file does not duplicate them.

Token roles (values per scheme in the authoritative table): `--paper` page
ground · `--paper-light` elevated fields · `--ink` primary text · `--ink-muted`
secondary text · `--rule`/`--rule-dark` dividers · `--signal`
active/provisional markers · `--vermilion` exceptions and emphasis.

> The original single palette this document once carried (warm paper
> `#f0eee5`, chartreuse signal `#bedb39`) was superseded by the two-scheme
> system on 2026-06-26 and is recorded in `MEMORY.md`, not here.

## Typography

No external font dependency.

- Display: Georgia with compact tracking.
- Interface and body: modern system sans.
- Metadata: system monospace.

Hierarchy is produced by grid position, rules, measure, case, and register—not by a ladder of arbitrary type sizes.

## Layout

- Maximum canvas: 1,520px.
- Twelve-column desktop grid.
- Visible rules preserve the document metaphor.
- Mobile reading order follows the DOM exactly.
- Paragraph measure is capped near 68 characters.

## Components

- `site-header`: identity, status, and anchor navigation.
- `hero`: thesis, institutional précis, and coordination-loop diagram.
- `register-section`: numbered dossier section.
- `workstream`: indexed field with a precise operational description.
- `capability-matrix`: pressure, method, and institutional-output relation.
- `protocol-grid`: public operating commitments.
- `site-footer`: direct contact, timestamp, and legal state.

## Refusals

No glass effects, rounded card colonies, decorative dashboards, stock photography, generated imagery, or motion without informational purpose.
