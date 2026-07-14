import { MAP_CONFIG, PLACE_CODES } from "../schema/atlas-taxonomy.js";

export function createMapController({ root, state }) {
  function handlePointerDown(event) {
    const viewport = event.target.closest("[data-map-viewport]");
    if (!viewport || event.button !== 0) {
      return;
    }

    state.dragging = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      originX: state.mapX,
      originY: state.mapY,
    };

    viewport.setPointerCapture(event.pointerId);
  }

  function handlePointerMove(event) {
    if (!state.dragging || state.dragging.pointerId !== event.pointerId) {
      return;
    }

    state.mapX = state.dragging.originX + (event.clientX - state.dragging.startX);
    state.mapY = state.dragging.originY + (event.clientY - state.dragging.startY);
    applyMapTransform();
  }

  function handlePointerUp(event) {
    if (!state.dragging || state.dragging.pointerId !== event.pointerId) {
      return;
    }

    state.dragging = null;
    applyMapTransform();
  }

  function handleMapWheel(event) {
    const viewport = event.target.closest("[data-map-viewport]");
    if (!viewport) {
      return;
    }

    event.preventDefault();
    const direction = event.deltaY < 0 ? 1 + MAP_CONFIG.wheelStep : 1 - MAP_CONFIG.wheelStep;
    state.mapScale = Math.max(MAP_CONFIG.minScale, Math.min(MAP_CONFIG.maxScale, state.mapScale * direction));
    applyMapTransform();
  }

  function handleMapDoubleClick(event) {
    const viewport = event.target.closest("[data-map-viewport]");
    if (!viewport) {
      return;
    }

    event.preventDefault();
    state.mapScale = Math.min(state.mapScale * MAP_CONFIG.doubleClickStep, MAP_CONFIG.maxScale);
    applyMapTransform();
  }

  function resetMapCamera() {
    state.mapScale = MAP_CONFIG.baseScale;
    state.mapX = 0;
    state.mapY = 0;
  }

  function toggleMapFullscreen() {
    const panel = document.getElementById("atlas-map-panel");
    if (!panel) {
      return;
    }

    if (document.fullscreenElement === panel) {
      document.exitFullscreen();
      return;
    }

    if (panel.requestFullscreen) {
      panel.requestFullscreen();
    }
  }

  function applyMapTransform() {
    const canvas = root.querySelector(".atlas-map-canvas");
    const zoom = root.querySelector("[data-map-zoom]");
    const viewport = root.querySelector("[data-map-viewport]");
    if (!canvas || !zoom || !viewport) {
      return;
    }

    const maxOffsetX = Math.max(0, (viewport.clientWidth * (state.mapScale - 1)) / 2);
    const maxOffsetY = Math.max(0, (viewport.clientHeight * (state.mapScale - 1)) / 2);
    state.mapX = Math.max(-maxOffsetX, Math.min(maxOffsetX, state.mapX));
    state.mapY = Math.max(-maxOffsetY, Math.min(maxOffsetY, state.mapY));
    canvas.style.transform = `translate(${state.mapX}px, ${state.mapY}px) scale(${state.mapScale})`;
    zoom.textContent = `${Math.round(state.mapScale * 100)}%`;
  }

  function handleMapAction(action) {
    if (action === "zoom-in") {
      state.mapScale = Math.min(state.mapScale * MAP_CONFIG.buttonStep, MAP_CONFIG.maxScale);
      applyMapTransform();
      return true;
    }
    if (action === "zoom-out") {
      state.mapScale = Math.max(state.mapScale / MAP_CONFIG.buttonStep, MAP_CONFIG.minScale);
      applyMapTransform();
      return true;
    }
    if (action === "fit-map") {
      resetMapCamera();
      applyMapTransform();
      return true;
    }
    if (action === "toggle-fullscreen") {
      toggleMapFullscreen();
      return true;
    }

    return false;
  }

  return {
    handleMapAction,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    handleMapWheel,
    handleMapDoubleClick,
    resetMapCamera,
    toggleMapFullscreen,
    applyMapTransform,
  };
}

export function renderMap({ items, focusPlaceKey, atlasMap }) {
  const markerCounts = new Map();
  items.forEach((item) => {
    markerCounts.set(item.placeKey, (markerCounts.get(item.placeKey) || 0) + 1);
  });

  const activePlaces = [...markerCounts.entries()]
    .filter(([placeKey, count]) => count > 0 && atlasMap.markers[placeKey])
    .sort((left, right) => right[1] - left[1]);

  const anchorKey = focusPlaceKey || activePlaces[0]?.[0] || "citywide";
  const anchor = atlasMap.markers[anchorKey] || atlasMap.markers.citywide;

  const routeMarkup = focusPlaceKey
    ? ""
    : activePlaces
        .filter(([placeKey]) => placeKey !== anchorKey)
        .slice(0, 3)
        .map(([placeKey], index) => {
          const target = atlasMap.markers[placeKey];
          const direction = target.x > anchor.x ? 1 : -1;
          const controlX = (anchor.x + target.x) / 2 + direction * (30 + index * 12);
          const controlY = Math.min(anchor.y, target.y) - (54 + index * 16);
          return `<path d="M${anchor.x} ${anchor.y} Q${controlX} ${controlY} ${target.x} ${target.y}"></path>`;
        })
        .join("");

  const markerMarkup = Object.keys(atlasMap.markers)
    .map((key) => {
      const marker = atlasMap.markers[key];
      const count = markerCounts.get(key) || 0;
      const active = key === focusPlaceKey;
      const markerClass = `${count ? "is-active" : "is-idle"} ${active ? "is-focus" : ""}`.trim();
      const code = PLACE_CODES[key] || marker.label.slice(0, 3).toUpperCase();
      const showLabel = count > 0 || active;
      const tagText = `${code} ${marker.label}`;
      const tagWidth = Math.max(46, tagText.length * 6.2 + 18);
      const ringRadius = count ? 14 + Math.min(count, 4) * 2.2 : 11;

      return `
        <g class="atlas-map__marker ${markerClass}" data-place-focus="${key}" tabindex="0">
          <circle class="atlas-map__marker-ring" cx="${marker.x}" cy="${marker.y}" r="${ringRadius}"></circle>
          <circle class="atlas-map__marker-core" cx="${marker.x}" cy="${marker.y}" r="5.5"></circle>
          ${
            count
              ? `
                <circle class="atlas-map__marker-badge" cx="${marker.x + 16}" cy="${marker.y - 14}" r="10"></circle>
                <text class="atlas-map__marker-count" x="${marker.x + 16}" y="${marker.y - 10}">${count}</text>
              `
              : ""
          }
          ${
            showLabel
              ? `
                <rect class="atlas-map__marker-tag" x="${marker.x + 10}" y="${marker.y + 10}" width="${tagWidth}" height="16" rx="8"></rect>
                <text class="atlas-map__marker-label" x="${marker.x + 18}" y="${marker.y + 21}">${tagText}</text>
              `
              : ""
          }
        </g>
      `;
    })
    .join("");

  // Build named neighborhood polygons from GNOCDC data if available
  const neighborhoodMarkup = atlasMap.neighborhoods
    ? atlasMap.neighborhoods
        .map((n) => {
          const isFocus = n.id === focusPlaceKey || n.placeKey === focusPlaceKey;
          const count = markerCounts.get(n.id) || markerCounts.get(n.placeKey) || 0;
          const hasItems = count > 0;
          const cls = [
            "atlas-map__neighborhood",
            hasItems ? "is-active" : "is-idle",
            isFocus ? "is-focus" : "",
          ]
            .filter(Boolean)
            .join(" ");
          const paths = n.d.map((d) => `<path d="${d}"></path>`).join("");
          const focusAttr = n.placeKey ? `data-place-focus="${n.placeKey}"` : "";
          return `<g class="${cls}" ${focusAttr} aria-label="${n.label}">${paths}</g>`;
        })
        .join("")
    : atlasMap.paths.map((path) => `<path d="${path}"></path>`).join("");

  return `
    <svg class="atlas-map-svg" viewBox="${atlasMap.viewBox}" role="img" aria-label="Signal Atlas map of New Orleans source pressure">
      <defs>
        <pattern id="atlas-grid" width="34" height="34" patternUnits="userSpaceOnUse">
          <path d="M 34 0 L 0 0 0 34" fill="none" stroke="currentColor" stroke-width="0.45" opacity="0.14"></path>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#atlas-grid)"></rect>
      <g class="atlas-map__field">
        ${neighborhoodMarkup}
      </g>
      <g class="atlas-map__routes">${routeMarkup}</g>
      <g class="atlas-map__markers">${markerMarkup}</g>
    </svg>
  `;
}
