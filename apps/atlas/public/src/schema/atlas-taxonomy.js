// Primary places have map markers and appear in lens section filters.
// Secondary places are GNOCDC canonical neighborhoods with polygon data only.
export const PLACE_CODES = {
  bywater: "BYW",
  marigny: "MRG",
  "st-claude": "STC",
  frenchman: "FRN",
  cbd: "CBD",
  warehouse: "WHS",
  riverfront: "RVR",
  citywide: "CTY",
  "french-quarter": "FRQ",
  "treme-lafitte": "TRE",
  "mid-city": "MID",
  uptown: "UPT",
  "garden-district": "GDN",
  "lower-garden-district": "LGD",
  "lower-ninth-ward": "L9W",
  "irish-channel": "ICH",
};

export const ITEM_TYPES = {
  event: { label: "Event" },
  source: { label: "Source" },
  listing: { label: "Listing" },
  mixtape: { label: "Mixtape" },
};

export const FILTERABLE_ITEM_TYPES = ["event", "source", "listing"];

export const SOURCE_TYPE_MAP = {
  livewire: "event",
  substack: "source",
  newsroom: "source",
  magazine: "source",
};

export const WINDOW_TAXONOMY = {
  all: { label: "All" },
  now: { label: "Now" },
  later: { label: "Later" },
};

export const RUNTIME_WINDOW_BUCKETS = {
  live: "now",
  "72h": "now",
  week: "later",
  archive: "later",
};

export const HERO_LENSES = [
  {
    key: "world",
    label: "World",
    note: "Citywide and civic pressure, read from New Orleans outward.",
  },
  {
    key: "local",
    label: "Local",
    note: "Neighborhood texture, cultural motion, and local reporting in the foreground.",
  },
  {
    key: "classifieds",
    label: "Classifieds",
    note: "What to catch, where to go, and what people are already passing around.",
    detailTitle: "Market",
    detailItems: ["Jobs", "Services", "Practical asks"],
  },
];

export const REACTION_TYPES = [
  { key: "track", label: "Track" },
  { key: "go", label: "Go" },
  { key: "alert", label: "Heads-up" },
  { key: "useful", label: "Useful" },
  { key: "verify", label: "Verify" },
];

export const GRAPH_ENTITY_TYPES = ["event", "venue", "agent", "place", "source", "listing", "mixtape"];

export const TYPE_NOTES = {
  event: "Things happening at a place and time: performances, gatherings, openings.",
  source: "Articles, newsletters, and reporting that cover or reference local events and places.",
  listing: "Standing offers: jobs, services, rentals, and practical asks.",
  mixtape: "Curated sets that bind sources and events into one deliberate editorial sequence.",
};

export const MAP_CONFIG = {
  baseScale: 0.84,
  minScale: 0.45,
  maxScale: 3.2,
  buttonStep: 1.1,
  wheelStep: 0.045,
  doubleClickStep: 1.12,
};

export const PLACE_KEYS = Object.keys(PLACE_CODES);

export const FILTER_GROUPS = [
  {
    key: "window",
    field: "window",
    label: "When",
    options: Object.keys(WINDOW_TAXONOMY),
    labels: Object.fromEntries(Object.entries(WINDOW_TAXONOMY).map(([key, value]) => [key, value.label])),
  },
  {
    key: "type",
    field: "type",
    label: "Type",
    options: ["all", ...FILTERABLE_ITEM_TYPES],
    labels: {
      all: "All",
      ...Object.fromEntries(
        Object.entries(ITEM_TYPES)
          .filter(([key]) => FILTERABLE_ITEM_TYPES.includes(key))
          .map(([key, value]) => [key, value.label])
      ),
    },
  },
];
