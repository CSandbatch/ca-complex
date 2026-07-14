---
title: "Card Commons: A smaller creative primitive for the web"
description: A product and protocol thesis for portable, editable, publishable, playable web objects.
status: proposal
version: 0.1.0
---

# Card Commons: A smaller creative primitive for the web

## Abstract

The web is technically capable of representing almost any form, yet everyday
creation is still organized around containers that are larger than many ideas:
the website, the page, the publication, the database, the document, or the
application. Each container arrives with assumptions about navigation,
maintenance, design, identity, and ownership. Social platforms reduce those
burdens, but typically do so by making the post legible primarily inside one
service. Visual tools make composition easier, but often leave the result as a
flat artifact whose internal meaning cannot travel.

Card Commons proposes a smaller unit: a structured card that can be authored
once and used as a public page, collection member, serialized episode, game
piece, embed, printable object, or remixable template. The card is neither a
miniature website nor merely an image. It is a versioned document with stable
identity, semantic fields, visual surfaces, relationships, permissions,
provenance, and optional game or publication behavior.

The core design rule is a separation between meaning and appearance. Fields
express what a card means; layers express how that meaning appears; surfaces
adapt the same card to different contexts. Stable identity and immutable
revisions allow a public version to remain reliable while a new draft evolves.
Collections give cards sequence and context without taking ownership of them.
Games give card instances rules and state without changing their source
documents. Remixing creates descendants without mutating ancestors. Artificial
intelligence may propose fields and create assets, but it does not become the
canonical object.

This paper describes the product thesis, protocol model, implementation
boundaries, governance posture, and evidence program for Card Commons version
0.1. It does not claim that cards should replace every page, that demand has
already been proven, or that a new federation standard is immediately
necessary. It makes a narrower bet: for a meaningful set of creative tasks, a
bounded, structured, portable object is a better place to begin.

## 1. The unit shapes the act

Creative software teaches its users what a finished thing is. A word processor
opens a document. A site builder opens a page or theme. A design application
opens a canvas. A newsletter service opens a post. A social service opens a
composer whose output lives in a feed. These units are not neutral. They set
the horizon of the work before the creator has made the first choice.

The website is an especially powerful unit because it is both expressive and
burdensome. A website can contain almost anything, but creating one can imply
information architecture, navigation, hosting, domains, visual systems,
analytics, search behavior, maintenance, and a decision about what future
content belongs there. Modern site builders have compressed much of this work,
and products such as Notion can turn an existing page into a public site with a
few actions [S-007]. The friction has not disappeared so much as moved. The
creator must still decide to make a site or page and must accept the model of
the tool that publishes it.

The social post offers the opposite bargain. It is small, immediate, and
legible to an audience already present. Its form, address, distribution, and
interaction are largely supplied by a platform. This ease can come with a
dependency on the platform's identity, presentation, export, and discovery
systems. IndieWeb practice emerged in part around the desire to own one's
canonical identity and content while optionally syndicating copies elsewhere
[S-003, S-004]. The principle is compelling, but operating a personal site
still asks the creator to adopt a site as the primary container.

Card Commons begins with a question about unit size rather than a declaration
against websites or platforms. What if a creator could publish an object that
was as bounded as a post, as composed as a design, as addressable as a page,
and as reusable as a structured record? What if that object could later join a
larger system without having been born inside it?

The proposed answer is a card.

A physical card has useful affordances that digital products often imitate:
clear boundaries, portability, sequence, collectability, fronts and backs,
roles in a game, and the ability to be held alone or placed among others.
Digital cards already appear across feeds, dashboards, stores, knowledge
systems, and interfaces. In many cases they are only presentation components.
Card Commons makes the card explicit as the authored object itself.

This does not mean every work should fit inside a small rectangle. A
Card Commons card can have a responsive public surface that fills a browser
window, a print surface measured in inches, a compact thumbnail, and a game
surface optimized for a table. Its boundary is conceptual and contractual, not
only geometric. The card is one addressable unit with one revision history.
Its surfaces determine how that unit appears in context.

The proposition can therefore be stated precisely:

> A card is a portable, editable, publishable, playable web object.

Each adjective is necessary. Portable means the source can leave one hosted
service. Editable means its meaning remains available as structure rather than
pixels. Publishable means it can have stable public identity. Playable means
it may participate in rule-bound state without becoming a separate object
type. “Web object” means it can be linked, rendered, embedded, and exchanged
through ordinary web technologies.

## 2. From picture to object

The easiest implementation of a digital card is an image. It is also the
implementation that discards most of the thesis.

Suppose a card says “PASS” in large type on a red background. A PNG preserves
the visible result. It does not reliably preserve that the card is an action,
that its action is to pass, that it is playable, that the visible word is
bound to a message field, that the card belongs to a deck, or that a screen
reader should announce it as a pass action rather than as an unnamed image.
Those facts can be attached externally, but then the image and its meaning
become two records that drift.

A structured card document represents them together:

```json
{
  "card": {
    "kind": "pass_card",
    "title": "Pass",
    "accessibleName": "PASS action card"
  },
  "fields": {
    "message": {
      "dataType": "string",
      "value": "PASS",
      "source": "template"
    }
  },
  "gameData": {
    "role": "pass",
    "playable": true,
    "effects": [{ "type": "pass_turn" }]
  }
}
```

The rendered image is still valuable. It is simply output rather than source.
The same document can produce an image export, accessible HTML, a game
component, and a compact collection preview. A program can validate its role
without optical character recognition. A template can restyle it without
rewriting its meaning.

This is the difference between a card-shaped design and a card-native object.

### 2.1 Fields express meaning

Fields hold semantic values: title, message, prompt text, response text, rank,
suit, image reference, source URL, date, signature, or any kind-specific
property. A field declares a data type and provenance. It may be visible,
hidden, or locked. Hidden does not mean unimportant. A mechanical card value,
canonical source, or issue number can drive behavior even when it does not
appear on the primary surface.

Stable field keys allow templates, renderers, exports, accessibility views,
and game rules to refer to the same meaning. A calling-card template can bind
to `message`, `signature`, and `emblem`. A prompt-card template can bind to
`promptText` while the game engine reads `pickCount`. A translation tool can
propose a new `message` value without moving visual layers.

Fields also give the system a principled place to put generated or imported
content. The source can be `user`, `template`, `import`, `system`,
`game_engine`, or `ai_proposed`. This provenance is not decorative metadata.
It allows a reviewer to distinguish authored content from a suggestion and
lets a host define which sources require confirmation.

### 2.2 Layers express appearance

Layers describe visual presentation: text, image, number, background, border,
symbol, or shape. They belong to a surface, occupy a box, have style, and may
bind to a field. A text layer bound to `message` resolves the field at render
time. It does not keep a private copy of the text.

That rule is small and consequential. Without it, changing a card's message in
a form could leave the thumbnail, print face, and public view inconsistent.
With it, several surfaces can interpret one semantic value according to their
own layout.

Some layers are intentionally decorative. They should declare a presentation
role so assistive technology does not announce ornamental borders and textures
as content. Meaningful images require alternative text in semantic data.
Reading order should be explicit or derived from fields, not guessed from
absolute coordinates.

### 2.3 Surfaces express context

Physical cards encourage a front/back model. Web-native cards need more:

- a primary bounded card;
- a responsive public view;
- a compact thumbnail;
- a game view;
- a social preview;
- an embed;
- print front and back;
- context-specific extensions.

A surface defines dimensions, layout mode, background, ordered layers, and
optional interaction zones. It does not define a new card. Every surface
belongs to one revision of one identity.

The model allows the public surface to be expansive. A text-heavy web card may
read like a short essay when opened directly and like a compact cover inside a
stack. The design does not force all content into poker-card proportions. It
forces every representation to remain accountable to the same object.

### 2.4 Templates join meaning and appearance

A card kind defines semantic intent and behavior. A template defines a
particular visual treatment and set of slots.

`calling_card` is a kind. “Nocturne engraved calling card” is a template.
`prompt_card` is a kind. “High-contrast party prompt” is a template. A kind
may require fields and game roles; a template may set default surfaces,
typography, colors, safe areas, and layer bindings.

Separating the two creates useful constraints. A template can be changed
without converting the card into another kind. A host can validate that a
prompt card remains playable even when it is restyled. A designer can publish
a new template that consumes the protocol without changing the core schema.

The product must avoid two symmetrical failures. An unbounded editor becomes a
weaker general-purpose design tool. A rigid form becomes a lifeless database.
Templates and semantic slots provide the middle: strong defaults and coherent
structure with meaningful visual control.

## 3. Identity, revision, and publication

An editable public object needs two notions that are often conflated: the
thing and its current contents.

Card identity is stable. A card has an ID, owner, kind, title, slug, status,
visibility, and revision pointers. A revision is an immutable document. Saving
a meaningful change creates a new revision. Publishing pins a specific
revision.

This arrangement supports a simple but essential promise: editing a draft does
not change what the public sees.

The public URL refers to the card's stable identity, while the publication
record identifies the revision currently served. A creator may prepare a new
surface, replace an image, or correct text without placing a half-complete
state online. Publishing validates the proposed revision, checks its assets and
permissions, then advances the public pointer atomically. If validation or
rendering setup fails, the previous version remains available.

Immutable revisions also clarify remixing. A fork references a source card or
revision but receives a new identity. The fork can evolve without changing its
ancestor. Attribution can point to a stable source state rather than to
whatever happens to be current later.

Revision history is not a complete collaborative editing model. Version 0.1
does not specify operational transformation or conflict-free replicated data
types. It uses optimistic concurrency: a save names the base revision it
edited. If another revision has advanced the draft pointer, the service returns
a conflict and the client offers comparison, reload, or explicit fork.
Silent last-write-wins would undermine trust in a structured artifact.

Publication visibility is distinct from edit authorization. `public` means
discoverable. `unlisted` means reachable through its URL but excluded from
ordinary discovery. `workspace` and `private` restrict reading to authorized
principals. Unlisted is not a security boundary. A public card does not grant
the public permission to modify it.

The protocol describes permissions for exchange, but a service remains
responsible for enforcement. A portable document cannot compel a hostile host
to honor policy. It can make intent explicit and give conforming tools enough
information to behave predictably.

## 4. Collections create systems without creating containers

A card becomes more useful when it can sit near other cards without losing its
own identity.

Card Commons uses one collection model for stacks, decks, series, and games.
The collection has identity, ownership, title, visibility, and ordering. A
membership joins a card to it with a role and optional position.

The membership—not the card—says that an object is the cover of this stack,
episode seven of this series, a response in this game, or a source in this
archive. The same card can carry a different role elsewhere. Removing one
membership does not delete the card.

This resembles the way Are.na describes channels as collections of blocks and
other channels [S-008, S-009], but Card Commons focuses on an authored object
with explicit surfaces, publication state, and optional game semantics. That
is a positioning distinction to test, not a claim of categorical superiority.
Are.na's export, API, presentation, and table capabilities demonstrate that
users already value multiple views and portability within a collection system
[S-008].

### 4.1 Stacks and decks

A stack is a general grouping. A deck implies use as a coherent set and may
add duplicate, back, shuffle, or validation policies. Grid view makes visual
patterns legible. List view emphasizes sequence. Table view exposes shared
fields for bulk creation and editing.

Table view is not administrative garnish. A game maker creating two hundred
response cards should not open two hundred design canvases. Structured fields
make spreadsheet-like authoring possible while the shared template produces
the visual system.

### 4.2 Series

A series is an ordered publication collection. Membership supplies episode or
issue context. Every episode remains an independently addressable card. The
series can expose a latest card, archive, and sequence without converting
episodes into private page fragments.

This model can represent a daily image, card essay, prompt of the week, short
chapter, or serialized game expansion. Notifications and subscriptions can
grow around the series but do not belong in the core card document.

### 4.3 Classification

Collections answer “where is this card used?” Classification answers “what
does this card mean or belong to conceptually?”

Version 0.1 supports classification assertions: a scheme, path, and role. It
does not require a universal ontology. A card may be classified as
`communication/calling-card`, `game/prompt-response/response`, or
`archive/source/image`. Hosts can offer hierarchical browsing without making
the ontology editor part of the MVP.

More expressive ontology relations remain possible. They should enter the core
only after real implementations need them. A protocol can become unusable by
trying to anticipate every semantic system before creators have made the first
cards.

## 5. Play without turning documents into sessions

The word “playable” introduces state. Card documents should not contain live
game state because the same card template may appear several times, may be
hidden from some players, and may participate in many sessions.

A game is a card collection plus a rules profile. A session is one instance of
play. Every occurrence of a card in a session receives an instance ID.
Instance state includes zone, owner, face state, and position. The source card
remains unchanged.

Version 0.1 intentionally supports one executable profile: a prompt-response
party game. A round reveals a prompt, accepts a configured number of response
instances from eligible players, selects a winner through a judge or vote,
updates score, replenishes hands, and advances until a round or score limit.

This profile is narrow enough to specify and test. It supports prompt,
response, pass, and explanatory rule cards without pretending to be a
universal game language. Arbitrary user-authored code is excluded.

### 5.1 Server authority

Clients submit moves, not replacement state. A move says that a player intends
to submit these response instances at this expected sequence. The server
authenticates the player, checks the phase and permission, applies a
deterministic transition, stores the move and resulting state atomically, and
broadcasts an authorized projection.

This prevents a client from declaring its own score or inspecting another
player's hand. Public table state and private player state must be separate
projections. Reconnection fetches the current authorized projection and
sequence. Retrying a move with the same idempotency key does not apply it
twice.

PlayingCards.io offers a useful adjacent model: its documentation includes
custom cards, imports, exports, tabletop widgets, and automations [S-010].
Its FAQ describes the product as a synchronized playspace rather than a system
that enforces the complete rules of every game [S-011]. Card Commons takes a
different first boundary. It enforces one small rules profile while making
cards durable outside the table.

Neither boundary is universally better. Freeform tabletops support broad human
interpretation. Narrow engines support validation and dependable remote state.
Card Commons can eventually add a freeform table view, but it should not
confuse spatial simulation with the portable card protocol.

### 5.2 Validation before play

Structured cards make deck checks possible. A builder can identify prompts
without pick counts, response cards without visible text, too few responses
for a configured hand size, missing assets, or an unreachable completion
condition.

Validation cannot determine whether a joke is funny or a game is fair. It can
remove mechanical errors that would otherwise appear during play. The system
should distinguish errors, which block a valid session, from warnings, which
invite human review.

## 6. Remixing as lineage, not overwrite

Cards are small enough to invite collecting and recombination. That behavior
becomes trustworthy only when source, permission, and change remain legible.

Card Commons supports several remix modes: none, duplicate, fork with
attribution, fork without public lineage, and template only. A service must
still evaluate copyright, license, privacy, and asset restrictions. A remix
preference inside a document is not a substitute for law or an asset license.

A non-destructive remix creates a new identity. It may copy an allowed source
revision, record lineage, and expose attribution. The source remains intact.
For collections and games, the remixer can choose to reference cards whose
policies allow reuse or fork them into new cards. Memberships are recreated in
the destination context.

Lineage should be useful without becoming coercive. Public ancestry can help
people find origins, variants, and contributors. It can also expose people who
need privacy or become a vector for unwanted association. Hosts may therefore
retain auditable internal lineage while honoring a policy that withholds it
from the public view.

Remixing is also a protocol test. If a card cannot leave one presentation or
be reinterpreted without loss, it is not genuinely portable. A successful
reference implementation should export a card, import it into an independent
tool, render its important fields, and disclose any unsupported extensions.

## 7. AI as materialization, not ontology

Generative systems fit naturally into a card workflow because cards often need
illustrations, backgrounds, variants, icons, and repeated content. They also
create a temptation to reduce the product to “type a prompt, receive a pretty
card.”

That version would abandon the strongest idea.

Card Commons treats generated output as proposed data or provenance-bearing
assets. A user can request an emblem for a calling card. The system builds
context from the card kind, message, classification, target slot, dimensions,
and collection style. A provider returns candidate images. Those candidates
enter review. Accepting one creates an asset record and a new card revision
that binds the asset to the emblem field or layer.

The process is:

```text
card meaning → explicit generation context → provider job → candidate output
→ provenance and safety checks → human acceptance → asset → new card revision
```

The card remains editable. The prompt, model, settings, references, rights
state, and acceptance actor remain inspectable according to privacy policy.
Rejecting a candidate changes nothing.

Structured text generation can be even more native. A user might ask for fifty
response cards. The useful output is fifty proposed `responseText` fields in
fifty valid documents or draft rows, not fifty unrelated images. The shared
template can render them consistently. A user can review, edit, classify, and
remove duplicates before saving.

Collection-level generation can propose a card back, visual style, or missing
illustrations. Its evaluation should focus on coherence, attachment to the
right slots, editability, accessibility, provenance, latency, and cost—not
novelty alone.

Generation also enlarges the safety surface. Source assets may lack rights.
Prompts may include private workspace content. Outputs may imitate people or
contain unsafe material. Provider retention policies differ. Generated
alternative text may be confidently wrong. The protocol therefore represents
unknown rights explicitly and requires user review before publication.

“AI-generated” is not alternative text. It does not describe an image to a
reader. It is provenance.

## 8. An open protocol posture

Card Commons can be a useful product without becoming a universal standard.
The protocol posture serves three practical goals:

1. creators can export structured source rather than only output;
2. the editor, renderer, game engine, and public views share one contract; and
3. independent implementations can test whether the object is truly portable.

Version 0.1 uses JSON Schema Draft 2020-12 for documents and OpenAPI 3.1 for an
illustrative service contract. OpenAPI 3.1 aligns its schema model with JSON
Schema 2020-12 and provides a language-independent way for humans and tools to
understand an HTTP interface [S-005, S-006].

The card schema defines stable identity data, fields, classifications,
surfaces, relations, game data, publication data, asset references,
permissions, remix policy, and metadata. It includes examples that must
validate and targeted examples that must fail. Conformance starts with
deterministic behavior, not a logo.

### 8.1 Extensions and evolution

Producers will need custom fields, relation types, metadata, and surfaces.
Extensions should be namespaced and must not redefine core meanings. Consumers
should tolerate unknown extensions while being honest about what they cannot
preserve.

Schema versions follow semantic versioning. During `0.x`, a minor release may
break compatibility with migration notes. A `1.0` release should require at
least two independent implementations that exchange and render the same card
documents successfully. Premature stability would turn current guesses into
permanent complexity.

### 8.2 Federation is open

The web already has protocols for publishing and social exchange. ActivityPub
is a W3C Recommendation defining decentralized social networking through
client-to-server and server-to-server APIs [S-001]. The W3C Social Web work
also identifies Micropub as a publishing protocol [S-002]. IndieWeb practice
offers extensive experience with canonical URLs and syndication [S-003,
S-004].

Card Commons should learn from and interoperate with these systems where
appropriate. It should not declare a new federation protocol before the object
model and user loop are proven.

Several paths remain open:

- publish cards through Micropub-compatible adapters;
- represent public card activity through ActivityStreams and ActivityPub;
- syndicate rendered summaries while preserving a canonical card URL;
- exchange complete card documents through a purpose-built import/export API;
- support decentralized identifiers later if identity requirements justify
  them.

Version 0.1 decides none of these as mandatory. It specifies a portable
document and stable publication semantics. Federation should be chosen through
working prototypes and compatibility evidence.

## 9. Product architecture

The future hosted product can begin as a modular monolith. A Next.js
application can provide authenticated workflows and public routes. PostgreSQL
can store stable relational identity, ownership, memberships, publication
pointers, sessions, and jobs while retaining complete revision documents in
JSONB. Object storage can hold immutable assets and derived renders. A worker
can process image export, metadata extraction, and generation. A realtime
gateway can broadcast game projections.

The central packages are more important than the deployment diagram:

- `card-schema` defines and migrates documents;
- `card-renderer` turns one document and surface key into accessible output;
- `editor` issues typed commands against an in-memory document;
- `collections` manages context and order;
- `publishing` validates and pins revisions;
- `game-engine` validates prompt-response moves;
- `assets` manages provenance and delivery;
- `generation` adapts providers and review; and
- `identity-access` enforces workspace and object policy.

The renderer must not depend on editor state. Public pages, thumbnails, games,
and exports need the same interpretation. The game engine must not infer
mechanics from pixels. Generation adapters must not live inside UI components.
These separations keep one card legible throughout the system.

Static and cached public rendering matters because the card is a web object,
not merely a view available after application boot. The hosted product should
produce stable metadata, canonical links, accessible HTML, and replaceable
image derivatives. The public card remains available even if an optional
interactive enhancement fails.

### 9.1 Security boundaries

Portability does not lessen the need for access control. Every mutation checks
actor, action, object, workspace, and state. A public object is not publicly
editable. An unlisted URL is not a secret. Asset delivery cannot bypass card
visibility. Exports receive the same authorization as views.

Live games require player-specific state. The server must never send another
player's hidden cards to a client and merely hide them with CSS. Moves require
sequence and idempotency checks. Random choices use server-controlled state
and can be audited by authorized operators.

Uploads and generated outputs are untrusted. File extensions do not establish
type. Images and SVGs can carry malicious content. A safe pipeline quarantines
uploads, sniffs type, scans content, strips unsafe active behavior, assigns
immutable storage keys, and serves through constrained origins or content
policies.

### 9.2 Operational recoverability

Stable identity and publication create an obligation to recover. Backups must
cover relational data and asset manifests. Derived renders need not be backed
up if they can be rebuilt from pinned revisions and assets. Restore tests
matter more than backup success notifications.

Structured logs should correlate requests, users, objects, revisions, jobs,
and sessions. Metrics should expose save conflicts, validation failures,
publish latency, render failures, generation cost, and invalid game moves.
Audit records cover permission changes, publication, sensitive exports,
generation acceptance, and deletion.

## 10. Interface: the card workbench

The interface should make the product model visible without asking users to
learn it as theory.

The main editor is a card workbench. The card occupies the center. A contextual
browser shows nearby cards or the current collection. An inspector reveals
fields, layers, and publication state. A bottom tray can expose surfaces,
revisions, and related cards. The top bar communicates title, save state,
preview, and publication.

The MVP has three editor modes:

- Content edits fields, source, classification, and accessibility.
- Design edits the active surface and permitted layers.
- Publish reviews validation, visibility, URL, previews, policy, and export.

The system should not place classification beside rectangle drawing as if they
were equivalent operations. Semantic structure belongs in content and system
controls. Visual tools create or alter layers. Field binding is visible when a
layer is selected.

Creation begins with intent: one card, a stack or deck, a game, or a series.
The user chooses a kind and template before seeing the editor. This avoids the
anxiety of a blank canvas and lets the system present relevant fields.

The stack builder provides grid, list, and table views because visual browsing,
editorial sequence, and bulk data entry are different tasks. The game builder
provides setup, cards, playtest, and publish. The public interface foregrounds
the card, not a dashboard frame.

On mobile, field editing, template choice, publishing, browsing, remixing, and
play should remain first class. Precise spatial editing can be desktop-first,
but every property needs a non-spatial form control. A pointer-only editor
would contradict the structured model and exclude keyboard and assistive
technology users.

## 11. Accessibility as a protocol benefit

Accessibility is often treated as a rendering checklist. Structure allows it
to become an object property.

Every card has an accessible name. Meaningful images have alternative text.
Fields provide a semantic reading sequence independent of absolute visual
position. Game roles provide descriptions of behavior. Interaction zones have
equivalent controls. A renderer can expose the same meaning in accessible HTML
even when a decorative surface is visually complex.

This does not make accessibility automatic. Authors can still write poor
alternative text, templates can create insufficient contrast, and a renderer
can mishandle focus. It does make defects more identifiable and gives tools a
place to validate them.

The same principle guides the web pitch deck in this repository. W3C guidance
for carousel-like interfaces emphasizes controls, keyboard operation,
announced changes, and user control over movement [S-015, S-016]. The deck does
not auto-advance. It supports buttons, arrow keys, direct slide URLs, reduced
motion, and a readable narrative outside slide mode.

## 12. Positioning without a false category claim

Card Commons crosses categories that already contain capable products.
Positioning should begin by understanding them accurately.

Canva represents visual creation and now includes website-making capabilities
[S-013]. Notion turns pages into sites and supports public duplication
[S-007]. Substack gives publishers one workflow for written, audio, and video
posts [S-012]. Are.na connects blocks in collections and offers export, API,
presentation, table, collaboration, and subscription features [S-008].
PlayingCards.io offers customizable shared tables and game tools [S-010,
S-011]. Open social and IndieWeb protocols address ownership, publication,
syndication, and federation [S-001 through S-004].

The Card Commons hypothesis is not that these products lack cards, structure,
export, or publishing. It is that a useful gap may exist at their intersection:
one authored object whose structured source can move among visual publication,
collection, serialization, play, and remix.

That distinction must survive hands-on comparison. If a target user's existing
tool already completes the whole job with less friction, Card Commons should
not manufacture a category boundary through vocabulary. Research must compare
real tasks, exports, APIs, pricing, rights, collaboration, and switching.

The strongest initial wedge is unknown. Independent publishers may value a
bounded object with a stable URL. Game makers may value bulk authoring plus
play. Educators and archivists may value collections, provenance, and
portability. Developers may value the schema while ordinary creators do not
care. The project should resist selecting a market through aesthetic affinity
alone.

## 13. Evidence before scale

The primary thesis is a hypothesis: a card is a more approachable first unit
than a site or page for a meaningful segment.

Testing it requires observed tasks. Concept interviews will produce polite
enthusiasm for a vivid idea. They will not show whether a person can create,
understand, publish, and reuse a structured card.

The first research program should recruit independent publishers, game makers,
educators or archivists, and developers. Each participant should attempt to:

1. publish one bounded idea;
2. create twenty related objects;
3. change their shared visual treatment;
4. reuse one object in another context;
5. export it and explain what they own; and
6. remix another person's object.

Researchers should record time, failures, workarounds, confidence, and whether
the participant returns to create again. They should compare the task with an
existing product the participant already uses.

The first product milestones should follow evidence:

1. protocol fixtures and two compatible renderers;
2. make and publish one card;
3. create and bulk-edit collections;
4. play one prompt-response profile;
5. remix and export;
6. run a creator pilot.

Each stage has a stop condition. If users cannot understand structured cards
without extensive explanation, the model needs simplification. If they create
once and only download an image, cross-context value is not visible. If game
exceptions overwhelm the narrow profile, the rules boundary needs correction.
If protocol work generates debate but no interoperable prototype, the project
is standardizing imagination rather than behavior.

No market-size number belongs in the deck until a defensible category,
customer, and source exist. A large adjacent market does not prove a reachable
market for this product.

## 14. Sustainability and the commons

An open protocol still needs sustainable hosting, moderation, support, and
development. The proposed commercial boundary is an open core of schemas,
examples, import/export, a reference renderer, and a basic self-host path,
surrounded by paid hosted operations.

Potential hosted value includes:

- private collaborative workspaces;
- storage and delivery;
- advanced templates;
- generation credits and controls;
- analytics;
- custom domains;
- administration, moderation, and audit;
- institutional identity and retention;
- managed realtime games; and
- print or transactional services.

These are hypotheses, not a pricing page.

Are.na provides one relevant precedent for a user-supported knowledge
collection service: its own product page describes subscriptions, exports, an
API, and a business model oriented around paying members [S-008]. That example
shows possibility, not transferability. Card Commons must test which users
receive enough recurring value to pay.

The name “Commons” creates a governance obligation. It should not be used to
suggest that every card is free of rights, that every hosted decision is made
collectively, or that openness alone guarantees equitable participation.
Version 0.1 uses maintainer-led governance with public decisions. A mature
protocol should move toward multiple implementers, disclosed conflicts of
interest, and governance that cannot be controlled solely by one hosted
vendor.

Content and code have different licensing needs. This repository uses MIT for
software and Creative Commons Attribution 4.0 for prose and visual content.
Individual cards and assets require their own rights state. A permissive
protocol does not erase the rights of card creators.

Moderation is also part of sustainability. Public remixing can propagate abuse
as easily as creativity. Hosts need reports, blocking, takedown, appeal,
session controls, and a way to prevent lineage from becoming harassment.
Portable exports should retain provenance and material moderation notices
where safe use depends on them.

## 15. Open questions

The protocol is intentionally incomplete in several important areas.

### Identity

Opaque IDs plus canonical URLs are sufficient for one host. Cross-host identity
may later require URLs as identifiers, decentralized identifiers, signed
documents, or a mapping layer. The choice should follow synchronization and
trust requirements.

### Federation

ActivityPub, Micropub, IndieWeb syndication, and a purpose-built exchange API
are plausible integration paths. Working adapters should precede a mandate.

### Collaborative editing

Immutable revisions and optimistic concurrency support ordinary editing but
not simultaneous multiplayer composition. Collaboration may eventually use
operation logs or CRDTs. That complexity should not enter the protocol until
the editor workflow demands it.

### Rules

Prompt-response play proves that cards can participate in executable systems.
A general rules language raises questions about determinism, safety, tooling,
debugging, versioning, and host trust. Version 0.1 does not solve them.

### Ontologies

Classification paths provide enough structure for an MVP. Rich semantic
relations, shared vocabularies, inference, and governance may become valuable,
but they can also make basic creation feel like cataloging.

### Payments and ownership

Paid cards, games, memberships, and marketplaces introduce entitlements,
refunds, taxes, fraud, regional rules, creator payouts, and license
enforcement. None should be smuggled into the MVP through a “marketplace”
label.

### Long-term preservation

Stable URLs and portable JSON improve durability but do not guarantee it.
Asset archiving, content-addressed storage, link rot, migration, legal removal,
and institutional stewardship require a preservation policy beyond the core
schema.

## 16. Conclusion

Card Commons begins with a modest observation: the size of a creative unit
changes who begins, what they make, and how the result can move.

The website is a place. It invites architecture, navigation, maintenance, and
continued ownership. The post is immediate but often belongs most naturally to
its platform. The visual design is expressive but may become a flattened
artifact. The game card is playable but may cease to exist meaningfully
outside the table.

A structured card can be an object among these systems.

It can carry semantic fields and designed surfaces. It can retain stable
identity while revisions evolve. It can stand alone at a URL or join several
collections. It can become an episode without losing its own address. It can
enter a session as one or many instances. It can be forked without being
overwritten. It can accept generated material without confusing generation
with authorship. It can leave one service as a document another tool can
understand.

The value of this model is not established by the elegance of its schema. It
will be established if creators can make something faster, feel ownership over
it, use it in more than one context, and return to make another. It will be
established technically if independent tools can exchange the same card
without silently discarding its meaning. It will be established socially if
remix and collection create connection without sacrificing attribution,
privacy, or control.

Version 0.1 is therefore both a specification and an experiment. It defines
enough to build: card documents, fields, layers, surfaces, revisions,
collections, publication, prompt-response play, remix policy, assets,
generation jobs, and accessible rendering. It defers the areas where evidence
is weak: universal rules, federation, advanced ontologies, marketplaces, and
market scale.

The invitation is simple:

Make one card. Put it somewhere. Publish or play it. Move it to another tool.
Then decide whether the web feels a little smaller—and a little more yours.

## References

Reference IDs resolve to the maintained
[source register](../research/sources.md). Claims and their evidence status are
tracked in the [claim ledger](../research/claims.md).

