# Claim ledger

Status meanings:

- **Verified:** the linked primary source directly supports the narrow claim.
- **Inferred:** the conclusion combines verified facts with stated reasoning.
- **Hypothesis:** requires user, market, or implementation evidence.

| ID | Status | Claim | Evidence | Use |
| --- | --- | --- | --- | --- |
| C-001 | Verified | ActivityPub defines decentralized social networking through client-to-server and server-to-server APIs. | [S-001](sources.md) | Whitepaper protocol context |
| C-002 | Verified | IndieWeb practice emphasizes owning identity/content and publishing on one's own site first. | [S-003](sources.md), [S-004](sources.md) | Whitepaper ownership context |
| C-003 | Verified | Notion can publish a workspace page as a site and optionally allow visitors to duplicate it. | [S-007](sources.md) | Competitor taxonomy |
| C-004 | Verified | Are.na models individual content as blocks organized in channels and supports export and API access. | [S-008](sources.md), [S-009](sources.md) | Competitor taxonomy |
| C-005 | Verified | PlayingCards.io supports custom cards, import/export, tabletop widgets, and automations. | [S-010](sources.md) | Competitor taxonomy |
| C-006 | Verified | PlayingCards.io describes itself as a synchronized playspace rather than a rules-enforcing card game. | [S-011](sources.md) | Product distinction |
| C-007 | Verified | Substack's publisher flow supports written, audio, and video posts. | [S-012](sources.md) | Publishing taxonomy |
| C-008 | Verified | JSON Schema Draft 2020-12 and OpenAPI 3.1 can describe compatible JSON data contracts. | [S-005](sources.md), [S-006](sources.md) | Contract rationale |
| C-009 | Verified | Next.js can generate static HTML per route through `output: "export"`. | [S-014](sources.md) | Site architecture |
| C-010 | Verified | Accessible carousel guidance requires user controls and keyboard-operable navigation. | [S-015](sources.md), [S-016](sources.md) | Deck implementation |
| C-011 | Inferred | Existing tools usually optimize one of visual creation, page publication, knowledge collection, or live card play rather than one portable object spanning all four. | C-003 through C-007; hands-on comparison still required | Pitch positioning |
| C-012 | Inferred | Separating semantic fields from visual layers makes alternate rendering and machine validation easier than treating an image as source. | Protocol design plus prototype validation required | Core technical thesis |
| C-013 | Hypothesis | A card is a more approachable first publishing unit than a page or site for a meaningful creator segment. | Planned task research | Primary product thesis |
| C-014 | Hypothesis | Reusing one card across publication, collection, play, and remix creates retention. | Planned instrumented pilot | Product loop |
| C-015 | Hypothesis | Template constraints can preserve structure without making creators feel visually restricted. | Planned usability comparison | Editor strategy |
| C-016 | Hypothesis | Users or institutions will pay for hosted collaboration, storage, generation, analytics, domains, and administration around an open protocol. | Planned pricing interviews after product use | Business model |
| C-017 | Hypothesis | Independent publishing, game making, archives/education, or protocol developers can provide an initial market wedge. | Planned segment experiments | Go-to-market |

## Prohibited claims

Until new evidence is added, public materials must not state:

- a total addressable market size;
- that Card Commons is categorically easier than every site builder;
- that competitors cannot export or interoperate;
- that users will pay a particular price;
- that AI-generated assets have unrestricted rights; or
- that Card Commons is already a protocol adopted by independent services.

