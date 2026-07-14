import { createDraftMixtape, DRAFT_MIXTAPE_ID, MIXTAPE_SEEDS } from "./atlas-mixtapes.js";
import { FILTER_GROUPS, RUNTIME_WINDOW_BUCKETS, SOURCE_TYPE_MAP } from "./schema/atlas-taxonomy.js";

const scoreCache = new Map();

function stableSourceScore(sourceId) {
  if (scoreCache.has(sourceId)) {
    return scoreCache.get(sourceId);
  }

  let hash = 0;
  for (let index = 0; index < sourceId.length; index += 1) {
    hash = (Math.imul(31, hash) + sourceId.charCodeAt(index)) | 0;
  }

  const score = (Math.abs(hash) % 1000) / 1000;
  scoreCache.set(sourceId, score);
  return score;
}

function projectItem(raw) {
  const type = raw.type || SOURCE_TYPE_MAP[raw.sourceFamily] || "event";

  return {
    id: raw.id,
    type,
    title: raw.title,
    summary: raw.summary,
    url: raw.url,
    source: raw.source,
    sourceId: raw.sourceId,
    sourceScore: raw.sourceScore ?? stableSourceScore(raw.sourceId || raw.source || raw.id),
    placeKey: raw.placeKey,
    place: raw.place,
    venue: raw.venue ?? null,
    publishedAt: raw.publishedAt,
    startTime: type === "event" ? (raw.startTime ?? raw.publishedAt) : null,
    endTime: raw.endTime ?? null,
    window: raw.window,
    status: type === "event" ? (raw.status ?? "scheduled") : null,
    participants: raw.participants ?? [],
    refs: raw.refs ?? [],
  };
}

function windowBucket(item) {
  return RUNTIME_WINDOW_BUCKETS[item.window] || "later";
}

function itemType(item) {
  return item.type || SOURCE_TYPE_MAP[item.sourceFamily] || "event";
}

function matchesSectionFilter(item, filter) {
  if (filter.type && itemType(item) !== filter.type) {
    return false;
  }
  if (filter.window && windowBucket(item) !== filter.window) {
    return false;
  }
  if (filter.places && !filter.places.includes(item.placeKey)) {
    return false;
  }
  return true;
}

function matchesFilters(item, filters) {
  return FILTER_GROUPS.every((group) => {
    const value = filters[group.key];
    if (!value || value === "all") {
      return true;
    }

    if (group.key === "window") {
      return windowBucket(item) === value;
    }

    return item[group.field] === value;
  });
}

function applyFilters(items, filters, spec) {
  return items.filter((item) => {
    if (spec && !spec.include.includes(itemType(item))) {
      return false;
    }

    return matchesFilters(item, filters);
  });
}

function sortItems(items, focusPlace = "") {
  return [...items].sort((left, right) => {
    const leftBoost = focusPlace && left.placeKey === focusPlace ? 1 : 0;
    const rightBoost = focusPlace && right.placeKey === focusPlace ? 1 : 0;

    if (rightBoost !== leftBoost) {
      return rightBoost - leftBoost;
    }

    const leftScore = left.sourceScore ?? 0;
    const rightScore = right.sourceScore ?? 0;
    if (rightScore !== leftScore) {
      return rightScore - leftScore;
    }

    return new Date(right.publishedAt) - new Date(left.publishedAt);
  });
}

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

function dominantPlaceKey(items) {
  const counts = new Map();
  items.forEach((item) => {
    counts.set(item.placeKey, (counts.get(item.placeKey) || 0) + 1);
  });

  return [...counts.entries()].sort((left, right) => right[1] - left[1])[0]?.[0] || "";
}

function interleaveMixtapes(feedItems, mixtapes) {
  if (!mixtapes.length) {
    return [...feedItems];
  }

  const insertionPoints = mixtapes.map((_, index) => 2 + index * 4);
  const cards = [];
  let mixtapeIndex = 0;

  feedItems.forEach((item, index) => {
    cards.push(item);
    while (mixtapeIndex < mixtapes.length && insertionPoints[mixtapeIndex] === index + 1) {
      cards.push(mixtapes[mixtapeIndex]);
      mixtapeIndex += 1;
    }
  });

  while (mixtapeIndex < mixtapes.length) {
    cards.push(mixtapes[mixtapeIndex]);
    mixtapeIndex += 1;
  }

  return cards;
}

export function createAtlasGraph({ atlasBuild, atlasFeed, atlasMap }) {
  const items = atlasFeed.map(projectItem);
  const byId = new Map(items.map((item) => [item.id, item]));

  function query({ lens, filters, specs, focusPlace = "" }) {
    const spec = specs?.[lens];
    return sortItems(applyFilters(items, filters, spec), focusPlace);
  }

  function sections({ spec, items: feedItems }) {
    if (!spec) {
      return [];
    }

    return spec.sections.map((section) => ({
      ...section,
      items: feedItems
        .filter((item) => matchesSectionFilter(item, section.filter ?? {}))
        .slice(0, section.limit ?? 4),
    }));
  }

  function selected({ items: feedItems, state }) {
    if (!feedItems.length) {
      return null;
    }

    if (state.selectedId) {
      const found = feedItems.find((item) => item.id === state.selectedId);
      if (found) {
        return found;
      }
    }

    if (state.focusPlace) {
      const found = feedItems.find((item) => item.placeKey === state.focusPlace);
      if (found) {
        return found;
      }
    }

    return feedItems[0];
  }

  function placePressure({ items: feedItems }) {
    const counts = new Map();
    feedItems.forEach((item) => {
      counts.set(item.placeKey, (counts.get(item.placeKey) || 0) + 1);
    });

    return [...counts.entries()]
      .map(([key, count]) => ({
        value: key,
        label: atlasMap.markers[key]?.label || key,
        count,
      }))
      .sort((left, right) => right.count - left.count || left.label.localeCompare(right.label));
  }

  function linkedPlace({ items: feedItems, focusPlaceKey }) {
    const rows = placePressure({ items: feedItems });
    const key = focusPlaceKey || rows[0]?.value || "";
    const label = atlasMap.markers[key]?.label || "New Orleans";
    const placeItems = key ? feedItems.filter((item) => item.placeKey === key) : [];

    return { key, label, count: placeItems.length, items: placeItems.slice(0, 4) };
  }

  function placeLabel(placeKey) {
    return placeKey && atlasMap.markers[placeKey] ? atlasMap.markers[placeKey].label : "New Orleans";
  }

  function cultureShare(feedItems) {
    if (!feedItems.length) {
      return 0;
    }
    const count = feedItems.filter((item) => itemType(item) === "event").length;
    return Math.round((count / feedItems.length) * 100);
  }

  function rowsByField(feedItems, field, labels = {}) {
    const counts = new Map();
    feedItems.forEach((item) => {
      const value = item[field];
      counts.set(value, (counts.get(value) || 0) + 1);
    });

    return [...counts.entries()]
      .map(([value, count]) => ({ value, label: labels[value] || value, count }))
      .sort((left, right) => right.count - left.count || left.label.localeCompare(right.label));
  }

  function signalTitle({ items: feedItems, lensLabel }) {
    const rows = placePressure({ items: feedItems });
    return rows[0]
      ? `${rows[0].label} is setting the pace in the ${lensLabel.toLowerCase()} read.`
      : "Nothing is active in this view.";
  }

  function resolveMixtape(seed) {
    const resolvedItems = seed.itemIds.map((itemId) => byId.get(itemId)).filter(Boolean);
    const placeKeys = unique(resolvedItems.map((item) => item.placeKey));
    const sourceNames = unique(resolvedItems.map((item) => item.source));
    const leadPlaceKey = dominantPlaceKey(resolvedItems);
    const eventCount = resolvedItems.filter((item) => item.type === "event").length;
    const sourceCount = resolvedItems.filter((item) => item.type === "source").length;

    return {
      ...seed,
      type: "mixtape",
      items: resolvedItems,
      previewItems: resolvedItems.slice(0, 5),
      leadPlaceKey,
      leadPlaceLabel: placeLabel(leadPlaceKey),
      placeKeys,
      sourceNames,
      itemCount: resolvedItems.length,
      eventCount,
      sourceCount,
      placeCount: placeKeys.length,
      publishedAt: seed.updatedAt || atlasBuild.generatedAt,
    };
  }

  function mixtapeLibrary(draftItemIds = []) {
    return [...MIXTAPE_SEEDS, createDraftMixtape(draftItemIds)].map(resolveMixtape);
  }

  function mixtapes({ lens, filters, specs, focusPlace = "", draftItemIds = [] }) {
    const spec = specs?.[lens];

    return mixtapeLibrary(draftItemIds)
      .map((mixtape) => {
        const matchingItems = applyFilters(mixtape.items, filters, spec);
        const placeMatch = !focusPlace || matchingItems.some((item) => item.placeKey === focusPlace) || mixtape.leadPlaceKey === focusPlace;
        const lensMatch = mixtape.lenses?.includes(lens) ?? true;
        const isDraft = mixtape.id === DRAFT_MIXTAPE_ID;

        return {
          ...mixtape,
          matchingItems,
          previewItems: (matchingItems.length ? matchingItems : mixtape.items).slice(0, 5),
          isVisible: isDraft || (lensMatch && placeMatch && matchingItems.length > 0),
        };
      })
      .filter((mixtape) => mixtape.isVisible)
      .sort((left, right) => {
        if (left.id === DRAFT_MIXTAPE_ID || right.id === DRAFT_MIXTAPE_ID) {
          if (left.id === DRAFT_MIXTAPE_ID && right.id !== DRAFT_MIXTAPE_ID) {
            return -1;
          }
          if (right.id === DRAFT_MIXTAPE_ID && left.id !== DRAFT_MIXTAPE_ID) {
            return 1;
          }
        }

        return right.matchingItems.length - left.matchingItems.length || new Date(right.publishedAt) - new Date(left.publishedAt);
      });
  }

  function mainGridCards({ lens, filters, specs, focusPlace = "", draftItemIds = [] }) {
    const feedItems = query({ lens, filters, specs, focusPlace });
    const visibleMixtapes = mixtapes({ lens, filters, specs, focusPlace, draftItemIds });
    return interleaveMixtapes(feedItems, visibleMixtapes);
  }

  function classifiedsRail({ filters, specs, focusPlace = "" }) {
    const railItems = query({ lens: "classifieds", filters, specs, focusPlace });
    const railSections = sections({ spec: specs?.classifieds, items: railItems }).filter((section) => section.items.length);
    return { items: railItems, sections: railSections };
  }

  function mixtapeById(id, draftItemIds = []) {
    return mixtapeLibrary(draftItemIds).find((mixtape) => mixtape.id === id) ?? null;
  }

  return {
    query,
    sections,
    selected,
    placePressure,
    linkedPlace,
    placeLabel,
    cultureShare,
    rowsByField,
    signalTitle,
    mixtapes,
    mixtapeById,
    mainGridCards,
    classifiedsRail,
    getById: (id) => byId.get(id) ?? null,
  };
}
