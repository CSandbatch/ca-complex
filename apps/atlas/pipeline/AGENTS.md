# pipeline/ — data regeneration

`load-data.js` regenerates the checked-in runtime `signal-atlas-data.js` from an
`Atlas_Graph` export. It reads `../../Atlas_Graph/exports/signals.json`,
recomputes `atlasBuild` stats (input count, publication and family counts,
culture share), and writes `atlasBuild`, `atlasMap`, and `atlasFeed`.

## Local rules

- This is the preferred, network-free data generator. Run it with
  `npm run pipeline` from the repo root.
- `Atlas_Graph` must be a sibling directory. If the export is missing, stop and
  report — do not hand-author feed data.
- Keep the output deterministic and human-inspectable. The generated file header
  says "do not edit by hand" — honor it everywhere.
- The heavier network-based generator is `scripts/build_signal_atlas_assets.py`;
  use it only to rebuild map geometry or re-scrape sources.

## Gate

After regenerating, run `npm run smoke` from the repo root. Commit the new
`signal-atlas-data.js` only if smoke passes.

## Gotchas

- Regeneration overwrites the entire runtime module. Preserve a checkpoint before
  a large data change (archive branches exist — see `../MEMORY.md`).

Project doctrine: `../AGENTS.md`
