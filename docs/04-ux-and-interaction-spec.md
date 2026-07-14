---
title: UX and interaction specification
description: Information architecture, editor behavior, public views, mobile, and accessibility.
status: proposal
version: 0.1.0
---

# UX and interaction specification

## Experience principle

The user is always editing a card inside a larger card system, never an
unbounded canvas. Every important view keeps structured meaning and visual
appearance legible together.

## MVP information architecture

The signed-in product has four primary destinations:

- **Studio:** create and edit individual cards.
- **Stacks:** arrange stacks, decks, and series.
- **Games:** build and play prompt-response games.
- **Publish:** review public objects, URLs, and exports.

Assets and account settings are secondary destinations. Ontology and system
editing remain future modules.

The dashboard shows recent cards, active collections, draft games, published
objects, search, and a prominent **Create** action. Search covers title, field
text, kind, collection, classification, author, asset, and publication state.

## Creation gateway

The first question is “What are you making?” Options are one card, stack or
deck, game, and series. Each path starts with an opinionated template and
sample content. A user may skip design customization and still obtain a
complete card.

## Card editor

Desktop layout:

```text
┌ title · mode · save state · preview · publish ┐
├ card browser ┬ card surface ┬ inspector       ┤
│ context      │ active view  │ fields/layers  │
├──────────────┴──────────────┴─────────────────┤
│ surfaces · revisions · related cards          │
└────────────────────────────────────────────────┘
```

### Content mode

Presents kind-specific semantic fields, validation, classification, source,
and alternative text. Selecting a field highlights every bound layer. Content
mode is the default for a new card.

### Design mode

Presents the active surface, template slots, layers, typography, imagery,
background, and alignment. The default toolbar contains select, text, image,
background, symbol, number, border, and AI-assist. Semantic values remain
bound to fields.

### Publish mode

Presents validation, visibility, canonical path, preview surfaces, social
metadata, remix policy, export, and publish history. Publish is disabled with
specific reasons rather than a generic error.

## Inspector behavior

With nothing selected, show card kind, status, visibility, template,
classification, collection context, and last revision. With a layer selected,
show its field binding before visual controls. Meaningful image controls
include alt text and rights. Game cards expose role and values. Published
cards expose their pinned revision and public URL.

## Stack builder

- Grid view prioritizes visual scan and drag ordering.
- List view prioritizes sequence and editorial metadata.
- Table view prioritizes bulk creation, copy/paste, validation, and field
  comparison.

All three are views of the same membership data. Reordering must announce the
new position and offer keyboard alternatives. Bulk edits provide a preview and
one reversible transaction.

## Game builder

The prompt-response builder has Setup, Cards, Playtest, and Publish sections.
It shows counts and structural warnings. Playtest uses the production state
machine with a local or isolated session; it is not a separate rules
implementation.

The live game view adapts by role:

- host sees lobby controls and public table state;
- players see public table plus their own private hand;
- spectators see public state only.

## Public views

A public card page foregrounds the selected surface, followed by accessible
content, author, collection memberships, provenance, and permitted remix,
share, and export actions. A stack page supports grid and sequence. A series
adds previous/next and archive. A game page offers description, card counts,
join/start, browse, and remix.

Public views must feel like native destinations, not database records wrapped
around a screenshot.

## Responsive behavior

Mobile creation focuses on fields, template choice, preview, publish, and
gameplay. The desktop inspector becomes a bottom sheet. Full spatial layer
editing may be read-only on small screens, but every layer property remains
editable through form controls. Tables become column-selectable records rather
than horizontally compressed grids.

## Accessibility

- Use semantic headings, forms, buttons, lists, and tables before ARIA.
- Maintain a visible focus indicator and logical focus order.
- Offer keyboard commands for surface and slide navigation without trapping
  `Tab`.
- Announce save, validation, reorder, generation, and publish state changes.
- Provide non-spatial equivalents for drag, resize, crop, and reorder.
- Respect reduced motion; never auto-advance cards or slides.
- Expose card reading order independent of layer coordinates.
- Validate text contrast and non-text interaction contrast.
- Preserve zoom up to 200% without loss of function.

## Empty, loading, and failure states

Every empty state offers one contextual next action. Long operations show
progress and allow safe dismissal. A failed save retains local edits. A failed
generation does not create an asset. A publication error cannot partially
advance the public pointer. Offline edits are either explicitly unsupported or
clearly queued; the interface must not pretend they are saved.

