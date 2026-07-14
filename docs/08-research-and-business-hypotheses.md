---
title: Research and business hypotheses
description: Evidence program, competitor taxonomy, audiences, and commercial experiments.
status: research
version: 0.1.0
---

# Research and business hypotheses

This document separates what should be tested from what is currently known.
No market-size estimate is asserted.

## Research questions

1. Which users experience “the unit is too large” as a frequent publishing or
   creation problem?
2. Does card structure improve reuse enough to matter?
3. Which first wedge—publishing, games, archives, or education—produces the
   strongest repeated loop?
4. What visual constraint feels productive?
5. Do users value portable exports and lineage before lock-in becomes a
   problem?
6. Who pays: individual creators, collaborative workspaces, institutions,
   audiences, or hosts?

## Competitor taxonomy

The project overlaps several categories without claiming that any one
competitor offers the same model:

| Category | Representative evidence | Card Commons distinction to test |
| --- | --- | --- |
| Visual design | Canva creates visual artifacts and websites | structured object remains meaningful across render contexts |
| Page publishing | Notion publishes workspace pages as sites | the atomic unit is a portable card rather than a workspace page |
| Serialized publishing | Substack publishes posts, newsletters, audio, and video | cards can also compose games, collections, and protocol exports |
| Knowledge collection | Are.na connects blocks in channels | cards add authored surfaces, publication state, and optional play |
| Virtual tabletop | PlayingCards.io provides customizable synchronized play spaces | cards persist as addressable publishing objects outside sessions |
| Open social protocols | ActivityPub exchanges social activities between services | Card Commons first specifies the portable object and leaves federation open |

These are positioning hypotheses based on current product documentation.
Competitive research must include hands-on task comparison, pricing, export,
rights, APIs, and switching behavior.

## Interview program

Recruit 4–6 participants in each initial workflow:

- independent visual/text publisher;
- party-game designer or facilitator;
- educator, archivist, or collection maker;
- developer interested in portable content.

Use observed tasks, not concept interviews alone:

1. publish one bounded idea;
2. create 20 related objects;
3. change their shared visual identity;
4. reuse one object in another context;
5. export and explain ownership;
6. remix another person's object.

Record time, failure, workaround, confidence, and return intent. Do not ask
participants whether the abstract idea is “good.”

## Commercial hypotheses

### Hosted workspace subscription

Hypothesis: creators and small teams will pay for private workspaces, expanded
storage, generation credits, advanced templates, custom domains, analytics,
and collaboration while the protocol and local tools remain open.

### Institution and education plan

Hypothesis: schools, archives, workshops, and cultural organizations value
managed groups, moderation, durable collections, role controls, provenance,
and export guarantees.

### Transactional services

Hypothesis: print fulfillment, premium generation, and paid template or game
distribution can become optional services. A marketplace is not an MVP
assumption because it creates moderation, rights, payment, and discovery costs
before core retention is known.

### Open-core boundary

The proposed open boundary is:

- open protocol, schemas, examples, import/export, reference renderer, and
  basic self-host path;
- paid hosted operations, collaboration, administration, storage, generation,
  analytics, domains, and institutional controls.

This boundary must be tested for trust and sustainability. It is not yet a
pricing commitment.

## Experiments

| Experiment | Evidence sought | Decision |
| --- | --- | --- |
| Concierge card publishing | repeat use after first published card | whether publishing is a viable wedge |
| 100-card game build | time saved by table editing and validation | whether game creation is a viable wedge |
| Cross-context reuse | one card used in public, collection, and game views | whether portability creates visible value |
| Export test | successful import by an independent prototype | whether protocol investment is real |
| Pricing interviews after use | tradeoffs against actual workflow value | which capabilities belong in paid hosting |

## Evidence discipline

Every externally checkable statement used in the website or deck maps to
[`research/claims.md`](../research/claims.md). Claims are `verified`,
`inferred`, or `hypothesis`. A source confirms what another system does; it
does not prove demand for Card Commons.

