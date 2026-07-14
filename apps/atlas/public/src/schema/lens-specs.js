// Render instruction payloads — one per lens.
// Each spec is the authoritative source for what the UI renders, how items
// are ordered, and how named content sections are populated.
//
// Spec shape:
//   include  — item types allowed in the main feed for this lens
//   order    — primary sort field + direction
//   sections — ordered list of named content slots, each with:
//                id, title, note, limit,
//                filter: { type?, window?, places? }
//
// Section filters are declarative. The resolver in clusters.js applies them.
// All fields are optional — an empty filter matches all items in the feed.

export const LENS_SPECS = {
  world: {
    include: ["source", "event"],
    order: { field: "sourceScore", dir: "desc" },
    sections: [
      {
        id: "world-sources",
        title: "In the news",
        note: "Local reporting and writing with the strongest outward pull.",
        filter: { type: "source" },
        limit: 4,
      },
      {
        id: "world-citywide",
        title: "Citywide events",
        note: "Events operating at city scale rather than neighborhood scale.",
        filter: { type: "event", places: ["citywide", "cbd", "riverfront", "french-quarter"] },
        limit: 4,
      },
      {
        id: "world-later",
        title: "Coming up",
        note: "Things worth keeping in view over the next few days.",
        filter: { window: "later" },
        limit: 4,
      },
    ],
  },

  local: {
    include: ["event", "source"],
    order: { field: "sourceScore", dir: "desc" },
    sections: [
      {
        id: "local-tonight",
        title: "Tonight",
        note: "Events happening now or imminently.",
        filter: { type: "event", window: "now" },
        limit: 4,
      },
      {
        id: "local-writing",
        title: "Neighborhood writing",
        note: "Local sources carrying scene memory and block-level texture.",
        filter: { type: "source", places: ["bywater", "marigny", "frenchman", "st-claude", "treme-lafitte", "mid-city", "garden-district", "irish-channel", "lower-garden-district", "lower-ninth-ward", "uptown"] },
        limit: 4,
      },
      {
        id: "local-later",
        title: "Later this week",
        note: "Events to keep around even if you are not acting on them tonight.",
        filter: { type: "event", window: "later" },
        limit: 4,
      },
    ],
  },

  classifieds: {
    include: ["event", "listing", "source"],
    order: { field: "sourceScore", dir: "desc" },
    sections: [
      {
        id: "classifieds-live",
        title: "Live now",
        note: "Events with immediate value — what to catch tonight.",
        filter: { type: "event", window: "now" },
        limit: 4,
      },
      {
        id: "classifieds-listings",
        title: "Listings",
        note: "Jobs, services, and standing offers.",
        filter: { type: "listing" },
        limit: 4,
      },
      {
        id: "classifieds-ahead",
        title: "Coming up",
        note: "Events and listings worth planning around.",
        filter: { window: "later" },
        limit: 4,
      },
    ],
  },
};
