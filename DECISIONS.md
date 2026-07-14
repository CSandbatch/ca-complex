# Decision log

| ID | Status | Decision | Consequence |
| --- | --- | --- | --- |
| D-001 | Accepted | Use **Card Commons** as the working name. | Naming remains revisable before a product launch. |
| D-002 | Accepted | Treat the card as a structured object, never a canonical flat image. | PNG, SVG, HTML, and print views are derived outputs. |
| D-003 | Accepted | Separate semantic fields from visual layers. | Templates can restyle cards without destroying meaning. |
| D-004 | Accepted | Model revisions separately from stable card identity. | Published versions can remain stable while drafts evolve. |
| D-005 | Accepted | Use a shared collection model for stacks, decks, series, and games. | Membership roles specialize behavior without duplicating cards. |
| D-006 | Accepted | Limit the MVP game engine to prompt-response play. | A universal rules language is deferred. |
| D-007 | Accepted | Treat AI outputs as provenance-bearing assets or proposed structured data. | Generation never silently replaces canonical content. |
| D-008 | Accepted | Publish contracts as JSON Schema 2020-12 and OpenAPI 3.1. | Implementations receive machine-verifiable handoff artifacts. |
| D-009 | Accepted | Build the publication site as a static Next.js export. | GitHub Pages can host it without a server runtime. |
| D-010 | Open | Decide whether protocol identity uses URLs, DIDs, or both after interoperability prototypes. | Version 0.1 uses opaque IDs plus canonical URLs. |
| D-011 | Open | Decide whether federation adopts ActivityPub, Micropub, a purpose-built exchange API, or adapters. | Version 0.1 specifies portable documents, not federation. |
| D-012 | Open | Validate willingness to pay and the correct hosted-service business model. | Commercial statements remain labeled hypotheses. |
| D-013 | Proposed | Add a `mixtape_card` kind: a summary plus a `fields.tracklist` (JSON fieldValue) of source-labeled items, so a Signal Atlas mixtape can export as a portable card. | Additive enum + if/then; existing kinds unaffected. Tracklist entry shape `{id, type, title, source, placeKey, url}` is documented, not schema-enforced in 0.1. Maintainer decides. |

