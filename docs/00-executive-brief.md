---
title: Executive brief
description: The shortest complete explanation of Card Commons.
status: proposal
version: 0.1.0
---

# Executive brief

## The proposition

Card Commons is a card-native creation and publishing system. It replaces the
blank page or blank canvas with a smaller editorial act: make a card.

A Card Commons card is not a picture of a card. It is a structured object with
stable identity, semantic fields, one or more visual surfaces, revision
history, permissions, relationships, and optional publication or game
behavior. It can render as a compact card, a full-screen public page, a
thumbnail, a game piece, an embed, or a printable artifact without losing its
meaning.

> A card is a portable, editable, publishable, playable web object.

The product creates leverage by letting one object move among contexts. A
calling card can be published at a URL, collected in a historical stack,
classified in a communication system, remixed as a template, and used as an
identity card in a game. A prompt card can be edited in bulk, played in a live
session, shared as a public object, and exported as JSON or PNG.

## The problem

Publishing on the web still asks creators to think in containers larger than
their idea: sites, pages, databases, newsletters, canvases, or applications.
Visual design tools produce attractive output but commonly flatten meaning
into a design artifact. Publishing tools preserve content but constrain it to
their page or post model. Virtual tabletops make cards playable but do not make
them durable publication objects.

Card Commons proposes a narrower primitive that combines:

- the immediacy of a post;
- the composition of a design object;
- the addressability of a web page;
- the collectability of a card;
- the behavior of a game piece; and
- the portability of a versioned document.

This is a product hypothesis, not a claim that cards should replace every web
page. The bet is that a meaningful class of creative work becomes easier when
the first unit is small, bounded, reusable, and structured.

## The first product

The MVP proves four loops:

1. **Make:** choose a card kind and template, fill semantic fields, adjust
   constrained visual layers, and save a revision.
2. **Arrange:** place cards into an ordered stack, deck, or series and edit them
   in grid, list, or table form.
3. **Publish:** pin a revision to a stable URL with a public, unlisted, or
   private visibility policy.
4. **Play and remix:** create a prompt-response game, run a session, and fork
   cards or collections without altering their source.

MVP card kinds are text, image, web, calling, prompt, response, and PASS cards.
MVP collections are stacks, decks, series, and games. The only executable game
type is prompt-response.

The first version deliberately excludes custom domains, a universal game
engine, a marketplace, deep social networking, real-time collaborative
editing, print production, and advanced ontology visualization.

## Why structured cards matter

The distinction between a field and a layer is foundational:

- A **field** says what a card means: `rank = king`,
  `message = "PASS"`, or `promptText = "Why can't I sleep?"`.
- A **layer** says how that meaning appears: a corner label, centered word,
  illustration, border, or background.

This separation makes a card restylable, searchable, accessible, translatable,
validatable, and reusable. A renderer can derive several surfaces from the
same document. A game engine can use semantic values without reading pixels.
An accessibility view can expose fields in a meaningful order. A user can
export the object rather than merely download its appearance.

## Technical shape

The future product is best implemented as a TypeScript web application with:

- a versioned `CardDocument` contract validated by JSON Schema;
- stable card records plus immutable revisions in PostgreSQL;
- a renderer shared by the editor, public pages, games, and exports;
- collections modeled through role-bearing memberships;
- asynchronous asset-generation jobs with explicit provenance;
- a constrained client-side editor with command-based undo and autosave; and
- a server-authoritative prompt-response engine for live sessions.

The protocol package is the durable center. The application is one
implementation of it.

## Risks to test

The most important unknowns are behavioral:

- Does a bounded card feel liberating or merely restrictive?
- Which creator group encounters the problem intensely enough to adopt a new
  primitive?
- Is “publish a card” meaningfully easier than publishing a page or post?
- Do cross-context uses—publish, collect, play, remix—create repeat behavior?
- Which level of visual freedom preserves structure without making cards feel
  generic?
- Will creators accept portable structured data as valuable, or only care
  about the visible artifact?

The delivery plan therefore starts with prototypes and observed user tasks,
not a universal platform.

## Implementation status

As of June 2026, the durable center exists on paper and the first slice exists
in code:

- **Published:** the nine specifications, JSON Schema contracts and fixtures,
  the OpenAPI surface, the whitepaper, and this pitch site.
- **Built, working, and deployed:** a Card Studio that creates the first card
  kind (the calling card) — constrained layer editing, local persistence,
  export, and AI image generation **verified live across six models** through
  OpenRouter, each generation recorded with provider and model provenance. It is
  deployed and running as a gated pilot (access by passcode), with production
  verified end to end.
- **Specified, not yet built:** stacks and collections, publishing to a URL,
  the prompt-response game, and remix.

The immediate next step is user evidence from the working Studio, not more
surface area.

## Invitation

Card Commons needs three kinds of participation: implementers to test the
protocol, creators to test the card-making loop, and research partners to
challenge the category and commercial hypotheses. Version 0.1 is complete
enough to build against and intentionally open enough to change through
evidence.

