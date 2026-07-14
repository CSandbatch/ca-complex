---
title: Publishing, games, and remixing
description: Behavioral specifications for context, public identity, play, and lineage.
status: proposal
version: 0.1.0
---

# Publishing, games, and remixing

## Collections

A collection groups cards without owning them. `stack`, `deck`, `series`, and
`game` specialize a shared model. Membership supplies context through:

- `position` for manual order;
- `role` such as member, cover, episode, prompt, response, or rule;
- collection-specific metadata; and
- attribution to the actor who added the card.

Removing membership MUST NOT delete the card. A card MAY appear more than once
only when the collection policy permits duplicates; game sessions use instance
IDs instead of duplicate memberships.

## Publishing

A publication binds a subject and revision to a stable path. Subjects are
cards, collections, games, series, profiles, or later ontology views.

Publishing MUST be atomic:

1. authorize the actor;
2. validate the subject and pinned revision;
3. verify referenced asset availability and visibility;
4. reserve or confirm the path;
5. update the publication pointer; and
6. enqueue replaceable derived renders.

If any authoritative step fails, the previous public version remains live.
Changing a draft never changes public output until publish succeeds.
Unpublishing removes discovery and public delivery but retains private history
and audit records according to retention policy.

## Prompt-response game

Version 0.1 defines one game profile:

- one prompt is revealed each round;
- each eligible player submits the configured number of response instances;
- a judge or configured vote selects a winner;
- the winner receives points;
- play continues until a score or round limit is reached.

Required zones are prompt deck, response deck, player hands, table, discard,
and score. Required phases are setup, reveal prompt, submit responses, judge,
score, replenish, and complete.

Game cards use semantic roles:

- prompt: supplies `promptText` and `pickCount`;
- response: supplies `responseText`;
- pass: declines or skips according to game policy;
- rule: explains a rule but cannot execute arbitrary code in v0.1.

The server MUST reject moves from the wrong actor, phase, or sequence. Each
card occurrence receives a session-scoped instance ID. Public state MUST not
reveal hidden instance-to-card mappings.

## Validation

Before playtest or publication, the builder checks:

- at least one valid prompt;
- enough responses to deal the configured hand size;
- positive player and round or score bounds;
- prompt pick counts compatible with available hands;
- no missing visible text;
- all referenced cards and assets available to the game;
- a reachable completion condition; and
- no duplicate card identity where duplicates are forbidden.

Warnings may identify repetition, imbalance, or weak deck size, but subjective
quality remains a human decision.

## Remix policy

Supported modes are:

- `none`;
- `duplicate`;
- `fork_with_attribution`;
- `fork_without_public_lineage`; and
- `template_only`.

Services MUST still respect copyright, license, privacy, and asset restrictions
even when a document's remix policy is permissive. A remix policy is an
author's product preference, not a complete legal license.

Forking creates new object IDs, copies a permitted revision, records source
IDs internally, and exposes attribution when required. Collections and games
are remixed by creating a new collection, then either referencing permitted
source cards or forking them according to the selected strategy.

## Serialization

A series is an ordered collection with optional issue numbers, cadence,
archive visibility, and subscription hooks. Each episode remains a card with
its own URL. Publishing a new episode does not mutate older episodes. Cadence
is descriptive in v0.1; notification delivery is outside the protocol core.

## Moderation and abuse

Public hosting requires reporting, blocking, takedown, and appeal processes.
Remix lineage must not become a harassment vector. Hosts MAY hide public
lineage while retaining private audit data. Game hosts need controls to remove
players and end sessions. Content policy is deployment-specific, but portable
exports SHOULD retain provenance and moderation notices that affect safe use.

