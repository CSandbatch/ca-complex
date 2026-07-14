export const DRAFT_MIXTAPE_ID = "mixtape-draft";
export const DRAFT_MIXTAPE_TITLE = "Your Mixtape";

export const MIXTAPE_SEEDS = [
  {
    id: "mixtape-frenchmen-after-dark",
    title: "Frenchmen After Dark",
    summary: "Frenchmen Street sets, neighborhood writing, and late-hour spillover in one restrained pass.",
    description:
      "A compact run through the Frenchmen corridor: live sets at 30/90, scene writing, and the kind of local texture that reads best together instead of as isolated items.",
    curator: "Signal Atlas",
    updatedAt: "2026-04-01T02:11:06.717401+00:00",
    lenses: ["local", "world", "classifieds"],
    itemIds: [
      "EventManicMixtape",
      "EventAndreLovett",
      "EventFunhouse",
      "ArticleNichesAndTeaches",
      "ArticleWiffOfKings",
    ],
  },
  {
    id: "mixtape-bywater-circuit",
    title: "Bywater Circuit",
    summary: "Bacchanal bookings, neighborhood essays, and a slower local rhythm held in one square.",
    description:
      "This set keeps Bywater in focus through music listings and scene memory. It is less about urgency than about staying oriented to a recurring local circuit.",
    curator: "Signal Atlas",
    updatedAt: "2026-04-01T02:11:06.717401+00:00",
    lenses: ["local", "world"],
    itemIds: [
      "EventNoahYoung",
      "EventJuanTigre",
      "ArticleAnotherNewOrleansStory",
      "ArticleBunnyBread",
      "ArticleJazzFMShow6",
      "ArticleJazzFMShow5",
    ],
  },
  {
    id: "mixtape-city-pressure-file",
    title: "City Pressure File",
    summary: "Citywide events, civic reporting, and food coverage that keep the broader field legible.",
    description:
      "A wider city read that blends cultural motion with reporting pressure. Useful when neighborhood texture is not enough and you need a larger civic picture.",
    curator: "Signal Atlas",
    updatedAt: "2026-04-01T02:11:06.717401+00:00",
    lenses: ["world", "classifieds", "local"],
    itemIds: [
      "EventBigMike",
      "EventSundaySwing",
      "EventBonBonVivant",
      "ArticleOilCoastDamage",
      "ArticleTransWomanRelease",
      "ArticleBestGumbo",
      "ArticleOysterHappyHours",
    ],
  },
];

export function createDraftMixtape(itemIds = []) {
  return {
    id: DRAFT_MIXTAPE_ID,
    title: DRAFT_MIXTAPE_TITLE,
    summary: itemIds.length
      ? `A working set of ${itemIds.length} saved items pulled from the live grid.`
      : "Start a personal set by saving sources and events from the grid.",
    description: itemIds.length
      ? "This is a local draft mixtape stored in the browser. It is intentionally lightweight: a user-curated bridge between feed items and a fuller editorial set."
      : "Use the small Add to Mixtape affordance on event and source cards to collect a lightweight set without leaving the page.",
    curator: "You",
    updatedAt: "2026-04-01T02:11:06.717401+00:00",
    lenses: ["world", "local", "classifieds"],
    itemIds,
    isDraft: true,
  };
}
