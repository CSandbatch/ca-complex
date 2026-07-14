import { atlasBuild, atlasFeed, atlasMap } from "./signal-atlas-data.js";
import { createAtlasGraph } from "./src/atlas-graph.js";
import { createMapController } from "./src/ui/map.js";
import { createRenderer } from "./src/ui/render.js";
import { downloadMixtapeCard } from "./src/ui/export.js";
import { LENS_SPECS } from "./src/schema/lens-specs.js";
import {
  addToDraftMixtape,
  closeMixtape,
  createAppState,
  openMixtape,
  reactionStateKey,
  removeFromDraftMixtape,
  resetFilters,
  syncUrl,
} from "./src/ui/state.js";

const graph = createAtlasGraph({ atlasBuild, atlasFeed, atlasMap });

const root = document.getElementById("app");
const state = createAppState(window.location.search);

const mapController = createMapController({ root, state });
const renderer = createRenderer({
  root,
  state,
  atlasBuild,
  graph,
  atlasMap,
  atlasSpecs: LENS_SPECS,
  applyMapTransform: mapController.applyMapTransform,
});

function render() {
  renderer.render();
}

function handleRootClick(event) {
  const lensButton = event.target.closest("[data-lens]");
  if (lensButton) {
    const nextLens = lensButton.dataset.lens;
    if (nextLens && nextLens !== state.lens) {
      state.lens = nextLens;
      state.selectedId = "";
      state.focusPlace = "";
      if (state.view === "mixtape") {
        closeMixtape(state);
      }
      syncUrl(state);
      render();
    }
    return;
  }

  const filterOption = event.target.closest("[data-filter-key]");
  if (filterOption) {
    const key = filterOption.dataset.filterKey;
    const value = filterOption.dataset.filterValue;
    if (state.filters[key] !== value) {
      state.filters[key] = value;
      state.selectedId = "";
      state.focusPlace = "";
      syncUrl(state);
      render();
    }
    return;
  }

  const resetButton = event.target.closest("[data-reset-filters]");
  if (resetButton) {
    resetFilters(state);
    state.selectedId = "";
    state.focusPlace = "";
    syncUrl(state);
    render();
    return;
  }

  const reactionButton = event.target.closest("[data-reaction-item][data-reaction-key]");
  if (reactionButton) {
    const itemId = reactionButton.dataset.reactionItem;
    const reactionKey = reactionButton.dataset.reactionKey;
    const reactionId = reactionStateKey(itemId, reactionKey);
    state.reactions[reactionId] = !state.reactions[reactionId];
    render();
    return;
  }

  const clearFocus = event.target.closest("[data-clear-focus]");
  if (clearFocus) {
    state.selectedId = "";
    state.focusPlace = "";
    render();
    return;
  }

  const closeMixtapeButton = event.target.closest("[data-close-mixtape]");
  if (closeMixtapeButton) {
    closeMixtape(state);
    syncUrl(state);
    render();
    return;
  }

  const openMixtapeButton = event.target.closest("[data-open-mixtape]");
  if (openMixtapeButton) {
    openMixtape(state, openMixtapeButton.dataset.openMixtape);
    syncUrl(state);
    render();
    return;
  }

  const exportMixtapeButton = event.target.closest("[data-export-mixtape]");
  if (exportMixtapeButton) {
    const mixtape = graph.mixtapeById(exportMixtapeButton.dataset.exportMixtape, state.draftMixtapeItemIds);
    if (mixtape) {
      downloadMixtapeCard(mixtape);
    }
    return;
  }

  const addToMixtapeButton = event.target.closest("[data-add-to-mixtape]");
  if (addToMixtapeButton) {
    if (addToDraftMixtape(state, addToMixtapeButton.dataset.addToMixtape)) {
      render();
    }
    return;
  }

  const removeFromMixtapeButton = event.target.closest("[data-remove-from-mixtape]");
  if (removeFromMixtapeButton) {
    if (removeFromDraftMixtape(state, removeFromMixtapeButton.dataset.removeFromMixtape)) {
      render();
    }
    return;
  }

  const signalButton = event.target.closest("[data-select-signal]");
  if (signalButton) {
    state.selectedId = signalButton.dataset.selectSignal;
    state.focusPlace = signalButton.dataset.placeKey || "";
    render();
    return;
  }

  const placeButton = event.target.closest("[data-place-focus]");
  if (placeButton) {
    const nextPlace = placeButton.dataset.placeFocus;
    if (state.focusPlace === nextPlace) {
      state.selectedId = "";
      state.focusPlace = "";
      render();
      return;
    }

    const filteredFeed = graph.query({ lens: state.lens, filters: state.filters, specs: LENS_SPECS, focusPlace: "" });
    state.focusPlace = nextPlace;
    const placeSignal = filteredFeed.find((item) => item.placeKey === nextPlace);
    state.selectedId = placeSignal ? placeSignal.id : "";
    render();
    return;
  }

  const mapAction = event.target.closest("[data-map-action]");
  if (mapAction) {
    if (mapController.handleMapAction(mapAction.dataset.mapAction)) {
      return;
    }
  }
}

root.addEventListener("click", handleRootClick);
root.addEventListener("wheel", mapController.handleMapWheel, { passive: false });
root.addEventListener("dblclick", mapController.handleMapDoubleClick);
root.addEventListener("pointerdown", mapController.handlePointerDown);
window.addEventListener("pointermove", mapController.handlePointerMove);
window.addEventListener("pointerup", mapController.handlePointerUp);
window.addEventListener("pointercancel", mapController.handlePointerUp);
document.addEventListener("fullscreenchange", mapController.applyMapTransform);

render();
