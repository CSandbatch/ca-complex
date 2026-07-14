import { FILTER_GROUPS, HERO_LENSES, MAP_CONFIG } from "../schema/atlas-taxonomy.js";
import { DRAFT_MIXTAPE_ID } from "../atlas-mixtapes.js";

const DRAFT_MIXTAPE_STORAGE_KEY = "signal-atlas:draft-mixtape";

function readFilter(params, key) {
  const group = FILTER_GROUPS.find((item) => item.key === key);
  const value = params.get(key);
  return group && group.options.includes(value) ? value : "all";
}

function readLens(params) {
  const value = params.get("lens");
  return HERO_LENSES.some((lens) => lens.key === value) ? value : "local";
}

function readView(params) {
  return params.get("view") === "mixtape" ? "mixtape" : "home";
}

function readDraftMixtapeIds() {
  try {
    const raw = window.localStorage.getItem(DRAFT_MIXTAPE_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((value) => typeof value === "string") : [];
  } catch {
    return [];
  }
}

export function createAppState(search = window.location.search) {
  const params = new URLSearchParams(search);

  return {
    lens: readLens(params),
    view: readView(params),
    mixtapeId: params.get("mixtape") || "",
    filters: {
      window: readFilter(params, "window"),
      type: readFilter(params, "type"),
    },
    selectedId: params.get("signal") || "",
    focusPlace: params.get("place") || "",
    reactions: {},
    draftMixtapeItemIds: readDraftMixtapeIds(),
    mapScale: MAP_CONFIG.baseScale,
    mapX: 0,
    mapY: 0,
    dragging: null,
  };
}

export function reactionStateKey(itemId, reactionKey) {
  return `${itemId}:${reactionKey}`;
}

export function currentFilters(state, overrides = {}) {
  return {
    lens: Object.prototype.hasOwnProperty.call(overrides, "lens") ? overrides.lens : state.lens,
    window: Object.prototype.hasOwnProperty.call(overrides, "window") ? overrides.window : state.filters.window,
    type: Object.prototype.hasOwnProperty.call(overrides, "type") ? overrides.type : state.filters.type,
  };
}

export function syncUrl(state, pathname = window.location.pathname) {
  const next = new URLSearchParams();

  if (state.lens !== "local") {
    next.set("lens", state.lens);
  }

  FILTER_GROUPS.forEach((group) => {
    const value = state.filters[group.key];
    if (value !== "all") {
      next.set(group.key, value);
    }
  });

  if (state.view === "mixtape" && state.mixtapeId) {
    next.set("view", "mixtape");
    next.set("mixtape", state.mixtapeId);
  }

  const query = next.toString();
  const nextUrl = query ? `${pathname}?${query}` : pathname;
  window.history.replaceState({}, "", nextUrl);
}

export function resetFilters(state) {
  state.filters = { window: "all", type: "all" };
}

export function openMixtape(state, mixtapeId) {
  state.view = "mixtape";
  state.mixtapeId = mixtapeId;
}

export function closeMixtape(state) {
  state.view = "home";
  state.mixtapeId = "";
}

export function draftMixtapeContains(state, itemId) {
  return state.draftMixtapeItemIds.includes(itemId);
}

export function addToDraftMixtape(state, itemId) {
  if (!itemId || draftMixtapeContains(state, itemId)) {
    return false;
  }
  state.draftMixtapeItemIds = [...state.draftMixtapeItemIds, itemId];
  persistDraftMixtape(state);
  return true;
}

export function removeFromDraftMixtape(state, itemId) {
  const nextIds = state.draftMixtapeItemIds.filter((id) => id !== itemId);
  if (nextIds.length === state.draftMixtapeItemIds.length) {
    return false;
  }
  state.draftMixtapeItemIds = nextIds;
  persistDraftMixtape(state);
  if (state.mixtapeId === DRAFT_MIXTAPE_ID && !state.draftMixtapeItemIds.length) {
    state.selectedId = "";
  }
  return true;
}

export function persistDraftMixtape(state) {
  try {
    window.localStorage.setItem(DRAFT_MIXTAPE_STORAGE_KEY, JSON.stringify(state.draftMixtapeItemIds));
  } catch {
    // Ignore storage failures and keep the in-memory draft alive for the session.
  }
}
