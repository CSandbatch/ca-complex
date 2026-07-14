## Legacy README (archived)

This file preserves the older repository overview that previously lived at the repo root as `README`.
It may describe earlier architecture decisions that are no longer current.

---

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

## How to run it locally

You can open it as static files, but the simplest is a local server (needed for ES modules in many browsers):

- I started one already in the repo: `python -m http.server 8000`
- Then open: **<http://localhost:8000>**
