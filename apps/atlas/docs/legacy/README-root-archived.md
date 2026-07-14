## What this repository is

This repo is a **static, no-build front-end “local intelligence surface” prototype** called **“Signal Atlas / New Orleans.”** It renders a dashboard-like interface that combines:

- a **place-based map** of New Orleans (stylized SVG polygons + neighborhood markers)
- a **curated feed of “signals”** pulled from a small set of local sources (WWOZ Livewire, Substack writers, local newsrooms, culture/food publications)
- **filters** that let you slice the feed by time window (Now/Later), topic, and source type

It’s intentionally designed to feel like an *instrument panel* (Bloomberg-ish / Swiss grid discipline), not a social “feed.”

## How it works (architecture)

### Runtime (browser)

- **`index.html`**: single-page entry that mounts `#app` and loads `app.js` as an ES module.
- **`app.js`**: all UI + state management in vanilla JS.
  - Maintains a `state` object with filters, selected signal, focused place, and map camera (pan/zoom).
  - Computes a filtered/sorted feed from `atlasFeed`.
  - Renders the whole UI via template strings into `root.innerHTML`.
  - Implements interactions:
    - filter chips
    - selecting a signal
    - focusing a place from map/rows
    - map pan/zoom (wheel + drag + double click)
    - fullscreen toggle
- **`styles.css`**: the visual system (dark blue field, electric yellow accent, grid overlay, Geist/Geist Mono typography, sticky map panel, terminal-ish labels).

### Data (generated)

- **`signal-atlas-data.js`**: generated module exporting:
  - `atlasBuild` (build timestamp, counts, map source)
  - `atlasMap` (SVG viewBox, polygon path list, marker coordinates)
  - `atlasFeed` (normalized list of feed items)

### Build pipeline (Python)

- **`scripts/build_signal_atlas_assets.py`** is the key build tool.
  - Fetches multiple sources (RSS/Atom + a custom HTML scrape for WWOZ Livewire).
  - Normalizes items into a common schema (id/title/url/publishedAt/summary/sourceFamily/category/placeKey/etc).
  - Infers `placeKey` using keyword aliases (`PLACE_ALIASES`) and a default per-source.
  - Assigns `window` (live/72h/week/archive), `state`, `confidence`, and a computed `priority`.
  - Downloads a TIGER/Line shapefile zip (Orleans Parish faces), selects the largest polygons, simplifies points, and converts them into SVG path commands.
  - Writes everything into `signal-atlas-data.js`.

Notably: running `python scripts\build_signal_atlas_assets.py` will **hit the network** and regenerate `signal-atlas-data.js`.

## What the product idea is (based on RESEARCH.md + UI)

The repo is a design/engineering exploration of multiple “product shells” (Signal Atlas, Brass Ledger, Quiet Ministry, etc. referenced in `RESEARCH.md`) with **Signal Atlas** implemented here.

The concept is: **a source-driven, locality-weighted “pressure map” of what’s happening / being reported in New Orleans**, biased toward:

- culture + nightlife + neighborhood writing (the “culture share” metric)
- civic coverage as “pressure”
- place anchors (Bywater / Frenchmen / St. Claude / Marigny / CBD / Warehouse / Riverfront / Citywide)

## How to run it locally

You can open it as static files, but the simplest is a local server (needed for ES modules in many browsers):

- I started one already in the repo: `python -m http.server 8000`
- Then open: **<http://localhost:8000>**

## Repo entrypoints & key files

- `index.html` — entry
- `app.js` — application logic + rendering
- `styles.css` — design system
- `signal-atlas-data.js` — generated assets + feed
- `scripts/build_signal_atlas_assets.py` — generator that fetches sources + builds map/feed
- `RESEARCH.md` — design references and rationale

## `atlasFeed` data dictionary (generated in `scripts/build_signal_atlas_assets.py`)

Each item in `atlasFeed` is a normalized “signal” from a source.

### Identity & linking

- **`id`**: `${sourceId}-${slugified(title)}`. Used for selection (`?signal=` is supported in code, though the current `syncUrl()` only persists filters).
- **`url`**: canonical link out to the original source.

### Core content

- **`title`**: cleaned title text.
- **`summary`**: cleaned + truncated (~240 chars) description/summary.
- **`publishedAt`**: ISO-8601 UTC timestamp (`Z`).

### Source taxonomy

- **`source`**: human label (“WWOZ Livewire”, “Verite News”, etc.).
- **`sourceId`**: machine id (“wwoz-livewire”, “verite”, etc.).
- **`sourceFamily`**: coarse source type (used by the UI filter “Source”):
  - `livewire` (WWOZ calendar scrape)
  - `substack`
  - `newsroom` (local news)
  - `magazine` (culture/food pubs)

### Topic taxonomy

- **`category`**: one of `music | nightlife | neighborhood | civic | food`.
  - This is chosen per-source in `SOURCE_CONFIG` (not inferred per-item).

### Place mapping

- **`placeKey`**: one of the map marker keys (`bywater`, `frenchmen`, `st-claude`, `marigny`, `cbd`, `warehouse`, `riverfront`, `citywide`).
  - Computed by `infer_place()` using keyword hits against a corpus of `(title + summary + venue + source label)` vs `PLACE_ALIASES`.
  - Falls back to `default_place` for that source.
- **`place`**: the marker label for the key (“Bywater”, “CBD”, …). Used in UI copy.

### Time semantics: `window` + `state`

- **`window`**: coarse freshness bucket computed from **NOW (build time)** vs item published time.
  - `live` → within 24 hours
  - `72h` → within 72 hours
  - `week` → within 7 days
  - `archive` → older

- **`state`**: a label derived from `window`, used for narrative semantics:
  - `live` → `live`
  - `72h` → `fresh`
  - `week` → `tracked`
  - `archive` → `stale`

Important nuance: the UI’s “When” filter is **not** these raw windows. In `app.js`:

- `windowBucket(item)` maps `live` and `72h` → **Now**
- `week` and `archive` → **Later**

### Scoring: `confidence` and `priority`

- **`confidence`**: a number (clamped 56–98) representing “trust/strength” of the signal, computed from:
  - base by `sourceFamily`: `livewire 94, newsroom 88, magazine 80, substack 74`
  - modifier by `window`: `live +2, 72h +0, week -4, archive -10`

- **`priority`**: the main ordering score for the UI.
  - Starts from the source’s configured `base_priority`.
  - Adds a **topic bonus** (music highest):
    - `music +8, nightlife +7, food +5, neighborhood +4, civic +2`
  - Adds a **freshness bonus**:
    - `live +8, 72h +4, week +0, archive -10`
  - Clamped to at least 40.

In `app.js`, after filtering, items are sorted by:

1) focused-place boost (if you’ve focused a place)
2) `priority` descending
3) `publishedAt` most recent first

### Local framing

- **`whyLocal`**: a short, templated justification string derived from `sourceId`/category and the inferred place label.


## Quick render/state flow diagram (`app.js`)

Here’s the mental model of how the page operates.

```text
Browser loads index.html
  -> app.js imports { atlasBuild, atlasFeed, atlasMap }
  -> state initialized
       - filters from URL params (window/category/family)
       - selectedId from ?signal=
       - focusPlace from ?place=
       - map camera (scale/x/y)
  -> event listeners attached (click, wheel, dblclick, pointer drag)
  -> render()

render()
  feed = getFilteredFeed()
        - apply filters (When/Topic/Source)
        - sort by: focus boost -> priority -> recency

  selected = selectedSignal(feed)
        - prefer state.selectedId
        - else prefer focusPlace
        - else feed[0]

  focusPlaceKey = derived
        - explicit focusPlace OR selected.placeKey OR busiest place

  compute aggregates
        - placePressureRows (counts by placeKey)
        - familyRows (counts by sourceFamily)
        - sourceRows (counts by source)
        - cultureWeight (% in culture categories)

  root.innerHTML = big template
        - header metrics
        - filter chips w/ counts (getFilterOptionCount)
        - map panel (renderMap)
            - markers with counts
            - optional route lines to top 3 areas
            - toolbar + footer lists
        - sections (sectionData)
        - selected story panel
        - stream list
        - source mix panel

  applyMapTransform()
        - sets CSS transform on .atlas-map-canvas
```

### Interaction handlers (high level)

- **Click routing** (`handleRootClick`) uses `closest()` + `data-*` attributes:
  - filter chip → update `state.filters`, clear selection/focus, `syncUrl()`, `render()`
  - reset filters → restore defaults, clear focus, `syncUrl()`, `render()`
  - select signal → set `state.selectedId` + `state.focusPlace`, `render()`
  - focus place (from map marker or row bar) → toggle `state.focusPlace`, pick a signal in that place, `render()`
  - map buttons → zoom in/out/fit/fullscreen

- **Map camera**:
  - wheel / dblclick → adjust `state.mapScale` within min/max, then `applyMapTransform()`
  - pointer drag → updates `state.mapX/Y` while dragging, then `applyMapTransform()`


## Two small observations (optional, but useful)

1) `syncUrl()` currently only persists filters, not `signal`/`place`. Yet state reads them on load. If you want deep-linking to a selected signal/place, you’d extend `syncUrl()`.
2) `build_feed()` does `items.sort(...)` and then immediately `items = sorted(...)` with the same key; one of those is redundant.

If you’d like, I can turn the above into a proper `README.md` for the repo (how to run, regenerate data, and field definitions).
