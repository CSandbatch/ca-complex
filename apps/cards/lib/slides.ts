export type Slide = {
  number: number;
  kicker: string;
  title: string;
  body: string;
  type:
    | "hero"
    | "contrast"
    | "definition"
    | "loop"
    | "examples"
    | "layers"
    | "journeys"
    | "architecture"
    | "systems"
    | "ai"
    | "landscape"
    | "roadmap"
    | "invitation";
  points?: string[];
  note?: string;
};

export const slides: Slide[] = [
  {
    number: 1,
    kicker: "Card Commons",
    title: "Make a card, not a website.",
    body: "A smaller editorial act for creating, collecting, publishing, playing, and remixing on the web.",
    type: "hero",
    note: "Working thesis · protocol v0.1"
  },
  {
    number: 2,
    kicker: "The problem",
    title: "The unit is often larger than the idea.",
    body: "A site asks for architecture. A canvas asks for design. A platform post asks for allegiance. Many ideas need a bounded object first.",
    type: "contrast",
    points: ["Website → place", "Canvas → artifact", "Post → platform object", "Card → portable object"]
  },
  {
    number: 3,
    kicker: "The thesis",
    title: "A card can be native to the web—not merely pictured on it.",
    body: "The card keeps stable identity, structured meaning, designed surfaces, revision history, and optional behavior.",
    type: "definition",
    points: ["Portable", "Editable", "Publishable", "Playable"]
  },
  {
    number: 4,
    kicker: "The object",
    title: "One source. Many contexts.",
    body: "A CardDocument combines identity, fields, surfaces, relationships, permissions, provenance, and publication or game data.",
    type: "definition",
    points: ["Stable card identity", "Immutable revisions", "Semantic fields", "Visual surfaces", "Policies + provenance"]
  },
  {
    number: 5,
    kicker: "The core loop",
    title: "Make → stack → publish or play → remix.",
    body: "The product earns its place when a card moves through more than one context without losing meaning.",
    type: "loop",
    points: ["Make", "Arrange", "Publish / play", "Remix"]
  },
  {
    number: 6,
    kicker: "Range",
    title: "The same primitive supports very different acts.",
    body: "Kinds define intent. Templates define appearance. Collections and games add context without taking ownership.",
    type: "examples",
    points: ["Calling card", "Web card", "Prompt + response", "PASS action", "Serialized episode"]
  },
  {
    number: 7,
    kicker: "Why structure matters",
    title: "Fields say what it means. Layers say how it looks.",
    body: "Surfaces adapt those bindings to card, public, thumbnail, game, social, and print views.",
    type: "layers",
    points: ["Field: promptText", "Layer: bound typography", "Surface: game", "Surface: public"]
  },
  {
    number: 8,
    kicker: "The MVP",
    title: "Four experiences prove the thesis.",
    body: "Start narrow enough to observe real behavior before building a universal platform.",
    type: "journeys",
    points: ["Create + publish one card", "Build + bulk-edit a stack", "Play a prompt-response game", "Fork without overwriting"],
    note: "Live today: a deployed Card Studio for the first experience (gated pilot)."
  },
  {
    number: 9,
    kicker: "Architecture",
    title: "The protocol is the center; the app is one implementation.",
    body: "Schema, renderer, editor, collections, publishing, and game engine share one canonical document.",
    type: "architecture",
    points: ["Card schema", "Shared renderer", "Immutable revision store", "Authoritative game state", "Replaceable derived assets"]
  },
  {
    number: 10,
    kicker: "Systems",
    title: "Publication gives identity. Games give instances.",
    body: "A public URL pins a revision. A game session creates stateful instances. Neither mutates the source card.",
    type: "systems",
    points: ["Card → revision → publication", "Card → instance → zone", "Collection → membership → role"]
  },
  {
    number: 11,
    kicker: "AI",
    title: "Generate material—not the source of truth.",
    body: "AI may propose fields, art, card backs, and coherent variants. Humans accept outputs into provenance-bearing assets and new revisions.",
    type: "ai",
    points: ["Meaning", "Context", "Generation job", "Review", "Accepted asset"],
    note: "Working today: image generation verified live across six models via OpenRouter."
  },
  {
    number: 12,
    kicker: "Positioning",
    title: "The opportunity sits between existing categories.",
    body: "Visual design, page publishing, knowledge collections, and virtual tabletops each solve part of the journey. The intersection is the test.",
    type: "landscape",
    points: ["Design", "Publish", "Collect", "Play", "Portable structured object"]
  },
  {
    number: 13,
    kicker: "Evidence before scale",
    title: "Prototype the object. Observe the loop. Then choose the wedge.",
    body: "Market, pricing, and segment claims remain hypotheses until task research and repeated use support them.",
    type: "roadmap",
    points: ["Protocol prototype", "Make + publish", "Arrange + play", "Remix + pilot"],
    note: "Step one is real and deployed: a live single-card Studio. Next is user evidence, then the rest of the loop."
  },
  {
    number: 14,
    kicker: "The invitation",
    title: "Make one card. Put it somewhere. Move it again.",
    body: "We are looking for implementers, creators, research partners, and patient capital to test a smaller creative primitive for the web.",
    type: "invitation",
    points: ["Build", "Create", "Research", "Partner"]
  }
];

export function slidePath(number: number): string {
  return `/deck/${String(number).padStart(2, "0")}`;
}

