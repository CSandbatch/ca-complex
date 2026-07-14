import {
  FILTER_GROUPS,
  HERO_LENSES,
  RUNTIME_WINDOW_BUCKETS,
} from "../schema/atlas-taxonomy.js";

export function windowBucket(item) {
  return RUNTIME_WINDOW_BUCKETS[item.window] || "later";
}

export function lensByKey(key) {
  return HERO_LENSES.find((lens) => lens.key === key) || HERO_LENSES[1];
}

export function groupByKey(key) {
  return FILTER_GROUPS.find((group) => group.key === key);
}

export function labelForGroupValue(key, value) {
  const group = groupByKey(key);
  return group && group.labels[value] ? group.labels[value] : value;
}

export function currentSliceLabel(state) {
  const lens = lensByKey(state.lens);
  const labels = FILTER_GROUPS
    .map((group) => labelForGroupValue(group.key, state.filters[group.key]))
    .filter((value) => value !== "All");
  return [lens.label, ...labels].join(" / ");
}
