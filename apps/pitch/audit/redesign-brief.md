# Common Action — Deck Engine Redesign Brief

**Date:** 2026-06-26  
**Status:** Implementation brief

## Source material

The supplied material resolves to two distinct documents:

1. A proposal for a website that acts as a deck engine rather than a linear deck. Its basic unit is an argumentative card with a public front, a provenance-rich back, and multiple possible routes or assembled dossiers.
2. An AI-web-design failure analysis centered on verification debt, generic visual output, weak hierarchy, unsupported claims, inaccessible interactions, excessive dependencies, and the collapse of strategy, design, engineering, and QA into one generation step.

Four supplied copies of the AI-design report were byte-identical.

## Primary task

Let a visitor understand Common Action’s institutional proposition, inspect the source status of its claims, and assemble a shareable explanation suited to their own context.

## Content model

Each argumentative card contains:

- Stable ID
- Type
- Public title
- Front claim
- Expanded explanation
- Source state: verified source or proposed articulation
- Methods or fields implicated
- Add-to-hand state

## Interaction model

- Browse four non-linear stacks: Case, Fields, Methods, Protocols.
- Turn any card to inspect its reverse and provenance.
- Add cards to a temporary “hand.”
- Open the hand as a custom dossier.
- Copy a URL encoding that dossier.
- Present the selected hand full-screen with keyboard navigation.
- Draw a random card to create a non-linear entry point.

## Design rules

- Cards are rhetorical units, not SaaS feature tiles.
- No external dependencies, generated imagery, gradients, glass effects, or ornamental dashboards.
- Distinction comes from typography, chromatic indexing, physical stacking, metadata, and asymmetrical composition.
- Motion explains state changes only.
- Every button has a visible label, keyboard behavior, and focus state.
- The page remains useful with JavaScript disabled; all institutional content stays in the HTML.

## Acceptance criteria

- Semantic landmarks and one `h1`.
- No horizontal page overflow from 320px to 1440px.
- Keyboard-operable card turning, hand building, dialogs, and presentation controls.
- Share URL restores the selected hand.
- No failed requests, console errors, or third-party assets.
- Direct contact remains available without interaction.
- Source and interpretive claims remain visibly distinct.
