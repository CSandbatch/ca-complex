---
title: Product requirements
description: Goals, users, journeys, MVP scope, and acceptance criteria.
status: proposal
version: 0.1.0
---

# Product requirements

## Product goal

Enable a person to turn an idea into a structured card, place it in a larger
card system, and publish or play it without building a website or learning a
general-purpose design tool.

The product succeeds when a first-time user can complete the core loop:

```text
make a card → put it somewhere → publish or play it → remix it
```

## Target users and jobs

### Independent creator

Wants to publish a small visual or textual object without establishing an
entire site. Needs a stable URL, a strong visual result, attribution, and easy
sharing.

### Game maker or facilitator

Wants to create many prompt and response cards, validate deck composition,
playtest them online, and share a remixable game. Needs fast bulk editing more
than freeform illustration.

### Archivist, educator, or researcher

Wants to gather discrete artifacts into ordered or thematic collections while
retaining sources, rights, classification, and relationships.

### System designer

Wants a reusable card vocabulary, renderer, and exchange format that can be
implemented outside the hosted product.

These are hypotheses requiring interviews and task observation. The MVP should
recruit across all four groups but measure activation by workflow, not by
self-described persona.

## Required user journeys

### Create and publish one card

1. A signed-in user chooses **One card**.
2. The user selects a kind and template.
3. The editor presents kind-specific fields before visual controls.
4. The user fills required fields and sees an immediate preview.
5. The user optionally changes permitted typography, imagery, and layout.
6. Saving creates or updates a draft revision.
7. Publishing pins a valid revision and assigns a stable URL.
8. The public page offers share, export, and remix actions permitted by policy.

Acceptance: a new user can publish a text or image card in under five minutes
without opening an empty canvas.

### Build a stack

1. A user creates a collection with kind `stack`, `deck`, or `series`.
2. The user adds existing cards or creates cards in context.
3. Grid view supports visual scanning, list view supports sequence, and table
   view supports bulk field editing.
4. Reordering updates membership positions, not card identities.
5. Publishing creates a collection URL and preserves individual card URLs.

Acceptance: one card can belong to multiple collections with independent roles
and positions.

### Build and play a prompt-response game

1. A user creates a game and chooses the prompt-response template.
2. The builder separates prompt, response, and rule cards.
3. Validation reports insufficient cards, missing text, invalid pick counts,
   and unreachable completion conditions.
4. A host starts a session; players join a lobby and receive private hands.
5. The server validates draws, submissions, judging, scoring, and phase
   transitions.
6. A completed session retains an auditable move log without exposing private
   hand state to unauthorized players.

Acceptance: four players can complete three rounds without manual database
changes or state divergence.

### Remix

1. A user activates **Remix** on an object whose policy allows it.
2. The system creates new identities and records source lineage.
3. The source remains unchanged.
4. Attribution appears where required.
5. The remixer can alter fields, surfaces, membership, and permitted assets.

Acceptance: a remix never mutates or republishes the source revision.

## Functional requirements

### Cards

- Stable identity, owner, workspace, kind, slug, state, and visibility.
- Immutable numbered revisions containing validated card documents.
- Draft and published revisions may differ.
- Required-field validation determined by card kind and template.
- JSON import/export and image export.
- Accessible text representation independent of visual layers.

### Editor

- Content, Design, and Publish modes in MVP.
- Field-first editing with layer controls attached to semantic slots.
- Select, text, image, background, symbol, number, and border tools.
- Undo/redo through document commands.
- Autosave that does not create a revision for every pointer movement.
- Clear dirty, saving, saved, conflict, and error states.

### Collections

- Stack, deck, series, and game collection kinds.
- Role-bearing memberships and manual ordering.
- Grid, list, and table views.
- Batch creation and safe bulk updates.
- Validation summaries for game-oriented collections.

### Publication

- Public, unlisted, and private visibility.
- Stable canonical path and pinned revision.
- Metadata and social-preview surface.
- Unpublish without destroying revision history.
- No accidental exposure of draft or workspace-only assets.

### Assets and generation

- Upload, select, replace, crop, and reuse assets.
- Record source, rights, dimensions, creator, and generation provenance.
- Asynchronous generation with queued, running, complete, failed, and
  cancelled states.
- Attach generated output only after explicit user acceptance.

## Quality requirements

- WCAG 2.2 AA is the target for editor and public surfaces.
- Keyboard access covers all creation, publishing, and slide-navigation tasks
  except direct spatial manipulation, which requires equivalent form controls.
- Public pages are server-renderable or statically renderable.
- Saving is idempotent; retries cannot create duplicate revisions.
- Authorization is deny-by-default across workspaces and game secrets.
- A malformed imported document never reaches the renderer.
- Every external asset has a source and rights state, including `unknown`.

## Success measures

Initial measures are behavioral and do not assume market scale:

- time to first valid card;
- share of new users who publish or add a card to a collection;
- cards reused in more than one context;
- completed game playtests;
- remixes that preserve valid lineage;
- import/export round-trip success;
- user-reported control versus constraint;
- failures by validation category.

Targets are set after a baseline prototype study rather than invented in this
specification.

## Non-goals

The MVP is not a Figma replacement, general CMS, domain registrar, universal
game runtime, social network, marketplace, print vendor, or autonomous content
generator. It must not compromise the card protocol to simulate those
products.

