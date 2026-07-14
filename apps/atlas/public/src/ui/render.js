import { DRAFT_MIXTAPE_ID } from "../atlas-mixtapes.js";
import { FILTER_GROUPS, HERO_LENSES, PLACE_CODES, TYPE_NOTES } from "../schema/atlas-taxonomy.js";
import { reactionStateKey } from "./state.js";
import {
  currentSliceLabel,
  groupByKey,
  labelForGroupValue,
  lensByKey,
  windowBucket,
} from "./filters.js";
import { renderMap } from "./map.js";

export function createRenderer({ root, state, atlasBuild, graph, atlasMap, atlasSpecs, applyMapTransform }) {
  const buildTime = new Date(atlasBuild.generatedAt);
  const relativeFormatter = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
  const buildStampFormatter = new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
  const longDateFormatter = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  });

  function formatRelativeDate(dateString) {
    const target = new Date(dateString);
    const minutes = Math.round((target - buildTime) / 60000);

    if (Math.abs(minutes) < 60) {
      return relativeFormatter.format(Math.round(minutes || 0), "minute");
    }
    if (Math.abs(minutes) < 24 * 60) {
      return relativeFormatter.format(Math.round(minutes / 60), "hour");
    }
    if (Math.abs(minutes) < 7 * 24 * 60) {
      return relativeFormatter.format(Math.round(minutes / (24 * 60)), "day");
    }

    return longDateFormatter.format(target);
  }

  function buildStamp() {
    return buildStampFormatter.format(buildTime);
  }

  function itemSeed(value) {
    return [...value].reduce((total, char, index) => (total + char.charCodeAt(0) * (index + 3)) % 997, 0);
  }

  function reactionBaseCount(item, reactionKey) {
    const seed = itemSeed(`${item.id}:${reactionKey}`);
    const type = item.type;

    if (reactionKey === "track") {
      return 3 + Math.floor((item.sourceScore ?? 0.5) * 10) + (seed % 4);
    }

    if (reactionKey === "go") {
      const eventBias = type === "event" ? 4 : 1;
      const timeBias = windowBucket(item) === "now" ? 3 : 1;
      return eventBias + timeBias + (seed % 3);
    }

    if (reactionKey === "alert") {
      const sourceBias = type === "source" ? 4 : 1;
      return sourceBias + (seed % 3);
    }

    if (reactionKey === "useful") {
      const scoreBias = (item.sourceScore ?? 0.5) >= 0.7 ? 4 : 2;
      const writerBias = type === "source" ? 2 : 0;
      return scoreBias + writerBias + (seed % 3);
    }

    if (reactionKey === "verify") {
      const listingBias = type === "listing" ? 3 : 1;
      const ageBias = windowBucket(item) === "later" ? 2 : 0;
      return listingBias + ageBias + (seed % 3);
    }

    return 1 + (seed % 3);
  }

  function reactionCount(item, reactionKey) {
    const active = state.reactions[reactionStateKey(item.id, reactionKey)] ? 1 : 0;
    return reactionBaseCount(item, reactionKey) + active;
  }

  function renderReactionRow(item, extraClass = "") {
    const rowClass = ["reaction-row", extraClass].filter(Boolean).join(" ");
    return `
      <div class="${rowClass}">
        ${[
          { key: "track", label: "Track" },
          { key: "go", label: "Go" },
          { key: "alert", label: "Heads-up" },
        ]
          .map((reaction) => {
            const active = Boolean(state.reactions[reactionStateKey(item.id, reaction.key)]);
            return `
              <button class="reaction-chip ${active ? "is-active" : ""}" data-reaction-item="${item.id}" data-reaction-key="${reaction.key}" type="button">
                <span>${reaction.label}</span>
                <strong>${reactionCount(item, reaction.key)}</strong>
              </button>
            `;
          })
          .join("")}
      </div>
    `;
  }

  function itemPlaceLabel(item) {
    return item.type === "event" && item.venue ? item.venue : item.place;
  }

  function itemTimeDisplay(item) {
    const timeRef = item.type === "event" && item.startTime ? item.startTime : item.publishedAt;
    return `<time datetime="${timeRef}">${formatRelativeDate(timeRef)}</time>`;
  }

  function addButtonLabel(item) {
    return state.draftMixtapeItemIds.includes(item.id) ? "Saved" : "Add to Mixtape";
  }

  function renderSignalCard(item, activePlaceKey = "", options = {}) {
    const {
      compact = false,
      removable = false,
      showSummary = true,
      surface = "grid",
    } = options;
    const linkedClass = activePlaceKey && item.placeKey === activePlaceKey ? " is-linked" : "";
    const compactClass = compact ? " signal-card--compact" : "";
    const type = item.type;
    const typeLabel = labelForGroupValue("type", type);
    const inDraft = state.draftMixtapeItemIds.includes(item.id);
    const participantLine = type === "event" && item.participants.length
      ? `<p class="signal-card__participants">${item.participants.map((participant) => participant.name ?? participant).join(", ")}</p>`
      : "";

    return `
      <article class="signal-card signal-card--${type}${linkedClass}${compactClass}">
        <button class="signal-card__button" data-select-signal="${item.id}" data-place-key="${item.placeKey}" type="button">
          <div class="signal-card__top">
            <span>${item.source}</span>
            ${itemTimeDisplay(item)}
          </div>
          <strong>${item.title}</strong>
          ${showSummary ? `<p>${item.summary}</p>` : ""}
          ${participantLine}
          <div class="signal-card__meta">
            <span class="place-pill">${PLACE_CODES[item.placeKey] || "NOLA"}</span>
            <span>${itemPlaceLabel(item)}</span>
            <span>${labelForGroupValue("window", windowBucket(item))}</span>
            <span class="type-pill type-pill--${type}">${typeLabel}</span>
          </div>
        </button>
        <div class="card-actions card-actions--${surface}">
          ${(type === "event" || type === "source")
            ? `<button class="mini-action ${inDraft ? "is-active" : ""}" data-add-to-mixtape="${item.id}" type="button">${addButtonLabel(item)}</button>`
            : ""}
          ${removable ? `<button class="mini-action" data-remove-from-mixtape="${item.id}" type="button">Remove</button>` : ""}
          <a class="mini-link" href="${item.url}" target="_blank" rel="noreferrer">Open source</a>
        </div>
      </article>
    `;
  }

  function renderMixtapeCard(mixtape) {
    const previewMarkup = mixtape.previewItems.length
      ? mixtape.previewItems
          .map(
            (item) => `
              <div class="mixtape-strip__item">
                <span>${labelForGroupValue("type", item.type)}</span>
                <strong>${item.title}</strong>
                <small>${item.source}</small>
              </div>
            `
          )
          .join("")
      : `
          <div class="mixtape-strip__item mixtape-strip__item--empty">
            <span>Draft</span>
            <strong>Save a few source or event cards to start a personal set.</strong>
            <small>The draft lives locally in this browser.</small>
          </div>
        `;

    return `
      <article class="mixtape-card ${mixtape.id === DRAFT_MIXTAPE_ID ? "mixtape-card--draft" : ""}">
        <button class="mixtape-card__button" data-open-mixtape="${mixtape.id}" type="button">
          <div class="mixtape-card__top">
            <span>${mixtape.curator}</span>
            <time datetime="${mixtape.publishedAt}">${formatRelativeDate(mixtape.publishedAt)}</time>
          </div>
          <strong>${mixtape.title}</strong>
          <p>${mixtape.summary}</p>
          <div class="mixtape-card__stats">
            <span>${mixtape.itemCount} items</span>
            <span>${mixtape.eventCount} events</span>
            <span>${mixtape.sourceCount} sources</span>
            <span>${mixtape.leadPlaceLabel}</span>
          </div>
          <div class="mixtape-strip">
            ${previewMarkup}
          </div>
        </button>
      </article>
    `;
  }

  function renderGridCard(card, activePlaceKey) {
    if (card.type === "mixtape") {
      return renderMixtapeCard(card);
    }

    return renderSignalCard(card, activePlaceKey);
  }

  function renderHeroBar() {
    const activeLens = lensByKey(state.lens);

    return `
      <section class="panel panel--hero-bar">
        <div class="hero-bar__active">
          <div class="micro-label">Read mode</div>
          <strong>${activeLens.label}</strong>
          <span class="hero-bar__note">${activeLens.note}</span>
        </div>
        <div class="hero-bar__segments">
          ${HERO_LENSES.map((lens) => {
            const active = lens.key === state.lens;
            const count = graph.query({ lens: lens.key, filters: state.filters, specs: atlasSpecs, focusPlace: "" }).length;
            return `
              <button class="hero-segment ${active ? "is-active" : ""}" data-lens="${lens.key}" type="button">
                <span>${lens.label}</span>
                <strong>${count}</strong>
              </button>
            `;
          }).join("")}
        </div>
      </section>
    `;
  }

  function renderPageBar(mixtape) {
    return `
      <section class="panel panel--page-bar">
        <button class="inline-action" data-close-mixtape type="button">Back to grid</button>
        <div class="page-bar__copy">
          <div class="micro-label">Mixtape detail</div>
          <strong>${mixtape?.title || "Mixtape"}</strong>
          <span>${mixtape?.itemCount || 0} curated items in one continuous read.</span>
        </div>
      </section>
    `;
  }

  function renderFiltersPanel(feed, focusPlaceKey, hasPinnedPlace) {
    const nowCount = feed.filter((item) => windowBucket(item) === "now").length;
    const laterCount = feed.length - nowCount;
    const lens = lensByKey(state.lens);
    const placeLabel = graph.placeLabel(focusPlaceKey);

    return `
      <section class="panel panel--filters">
        <div class="filters-head">
          <div>
            <div class="micro-label">Refine this read</div>
            <h2>Keep the map and grid in the same sentence.</h2>
          </div>
          <p>${hasPinnedPlace ? `${placeLabel} is still pinned across the visible field.` : `${placeLabel} is setting the pace right now. Tighten the time or type filter when you need a cleaner read.`}</p>
        </div>

        <div class="filters-grid">
          ${FILTER_GROUPS.map(
            (group) => `
              <section class="filter-group">
                <div class="micro-label">${group.label}</div>
                <div class="filter-group__options">
                  ${group.options
                    .map((option) => {
                      const count = graph.query({ lens: state.lens, filters: { ...state.filters, [group.key]: option }, specs: atlasSpecs, focusPlace: "" }).length;
                      const active = state.filters[group.key] === option;
                      return `
                        <button class="filter-chip ${active ? "is-active" : ""} ${option === "all" ? "is-muted" : ""}" data-filter-key="${group.key}" data-filter-value="${option}" type="button" ${!active && count === 0 ? "disabled" : ""}>
                          <span>${group.labels[option]}</span>
                          <strong>${count}</strong>
                        </button>
                      `;
                    })
                    .join("")}
                </div>
              </section>
            `
          ).join("")}
        </div>

        <div class="filters-summary">
          <span class="dock-pill">${currentSliceLabel(state)}</span>
          <span class="dock-pill">${nowCount} in Now</span>
          <span class="dock-pill">${laterCount} in Later</span>
          ${hasPinnedPlace ? `<button class="inline-action" data-clear-focus type="button">Clear ${placeLabel}</button>` : ""}
          <button class="inline-action" data-reset-filters type="button">Reset filters</button>
        </div>
      </section>
    `;
  }

  function renderRowBars(rows, options = {}) {
    const { interactive = false, activeValue = "" } = options;

    if (!rows.length) {
      return `<div class="empty-state">Nothing is active in this view.</div>`;
    }

    const maxCount = rows[0].count || 1;
    return rows
      .map((row) => {
        const tag = interactive ? "button" : "div";
        const data = interactive ? ` data-place-focus="${row.value}" type="button"` : "";
        const active = interactive && row.value === activeValue ? "is-active" : "";
        const code = interactive ? `<span class="place-pill">${PLACE_CODES[row.value] || "NOLA"}</span>` : "";
        return `
          <${tag} class="row-bar ${active}"${data}>
            <div class="row-bar__meta">
              <span>${code}${row.label}</span>
              <strong>${row.count}</strong>
            </div>
            <div class="row-bar__track"><i style="width:${(row.count / maxCount) * 100}%"></i></div>
          </${tag}>
        `;
      })
      .join("");
  }

  function renderLinkedPlace(items, focusPlaceKey) {
    const linked = graph.linkedPlace({ items, focusPlaceKey });

    if (!linked.key || !linked.count) {
      return `
        <section class="map-footer__column map-details">
          <div class="micro-label">Mapped stories</div>
          <strong>Nothing is active yet.</strong>
          <p>Widen the filters to bring items back onto the map.</p>
        </section>
      `;
    }

    return `
      <section class="map-footer__column map-details">
        <div class="map-details__head">
          <div>
            <div class="micro-label">Mapped stories</div>
            <h3>${linked.label}</h3>
          </div>
          <span class="dock-pill">${linked.count} items here</span>
        </div>
        <p>${linked.count === 1 ? "This is the only visible item tied to this area." : "These are the visible feed items tied to this area right now."}</p>
        <div class="map-details__list">
          ${linked.items
            .map(
              (item) => `
                <button class="map-mini-card" data-select-signal="${item.id}" data-place-key="${item.placeKey}" type="button">
                  <div class="map-mini-card__top">
                    <span>${PLACE_CODES[item.placeKey] || "NOLA"} / ${item.source}</span>
                    ${itemTimeDisplay(item)}
                  </div>
                  <strong>${item.title}</strong>
                  <p>${item.summary}</p>
                </button>
              `
            )
            .join("")}
        </div>
      </section>
    `;
  }

  function renderSelectedSignal(signal) {
    if (!signal) {
      return `
        <article class="panel panel--selected">
          <div class="panel-header">
            <div>
              <div class="micro-label">Item in focus</div>
              <h3>Nothing matches this view</h3>
            </div>
            <p>Broaden the filters to repopulate the grid and rail.</p>
          </div>
        </article>
      `;
    }

    const type = signal.type;
    const typeLabel = labelForGroupValue("type", type);

    return `
      <article class="panel panel--selected panel--selected--${type}">
        <div class="panel-header">
          <div>
            <div class="micro-label">${typeLabel} in focus</div>
            <h3>${signal.title}</h3>
          </div>
          <p>${signal.source} / ${itemPlaceLabel(signal)}</p>
        </div>
        <p class="selected-deck">${signal.summary}</p>
        <div class="tag-row">
          <span class="type-pill type-pill--${type}">${typeLabel}</span>
          <span>${labelForGroupValue("window", windowBucket(signal))}</span>
          <span>${PLACE_CODES[signal.placeKey] || "NOLA"}</span>
        </div>
        <div class="selected-grid">
          <div>
            <span>When</span>
            <strong>${buildStampFormatter.format(new Date(signal.type === "event" && signal.startTime ? signal.startTime : signal.publishedAt))}</strong>
          </div>
          <div>
            <span>Why it matters</span>
            <strong>${TYPE_NOTES[type] || "Part of the live local field."}</strong>
          </div>
        </div>
        ${renderReactionRow(signal, "reaction-row--selected")}
        <div class="selected-actions">
          <button class="inline-action" data-place-focus="${signal.placeKey}" type="button">Show ${signal.place} on the map</button>
          ${(type === "event" || type === "source")
            ? `<button class="inline-action" data-add-to-mixtape="${signal.id}" type="button">${addButtonLabel(signal)}</button>`
            : ""}
          <a class="inline-link" href="${signal.url}" target="_blank" rel="noreferrer">Open original source</a>
        </div>
      </article>
    `;
  }

  function renderFieldPanel(typeRows, sourceRows) {
    return `
      <article class="panel panel--field">
        <div class="panel-header">
          <div>
            <div class="micro-label">Field mix</div>
            <h3>What is holding this read together</h3>
          </div>
          <p>Counts below update directly from the visible source and event feed.</p>
        </div>

        <div class="field-grid">
          <section>
            <div class="micro-label">Types</div>
            <div class="row-bar-list">${renderRowBars(typeRows)}</div>
          </section>
          <section>
            <div class="micro-label">Publications</div>
            <div class="row-bar-list">${renderRowBars(sourceRows)}</div>
          </section>
        </div>
      </article>
    `;
  }

  function renderClassifiedsRail(rail, focusPlaceKey) {
    return `
      <aside class="panel panel--classifieds">
        <div class="panel-header panel-header--rail">
          <div>
            <div class="micro-label">Dedicated rail</div>
            <h3>Classifieds</h3>
          </div>
          <p>Kept out of the main grid so practical circulation stays legible without taking over the whole page.</p>
        </div>

        <div class="classifieds-rail">
          ${rail.sections.length
            ? rail.sections
                .map(
                  (section) => `
                    <section class="classifieds-block">
                      <div class="classifieds-block__head">
                        <span>${section.title}</span>
                        <strong>${section.items.length}</strong>
                      </div>
                      <div class="classifieds-block__list">
                        ${section.items.map((item) => renderSignalCard(item, focusPlaceKey, { compact: true, showSummary: true, surface: "rail" })).join("")}
                      </div>
                    </section>
                  `
                )
                .join("")
            : `<div class="empty-state">The rail is quiet under the current filter mix.</div>`}
        </div>
      </aside>
    `;
  }

  function renderHeaderCopy({ cultureWeight, nowCount, topPlace }) {
    return `
      <div class="atlas-header__copy">
        <div class="micro-label">Signal Atlas / New Orleans</div>
        <h1>What New Orleans is paying attention to right now.</h1>
        <p>Signal Atlas brings together neighborhood writing, live music, civic reporting, and practical local circulation in one restrained editorial surface.</p>
        <div class="headline-strip">
          <span>built ${buildStamp()}</span>
          <span>${atlasBuild.inputCount} runtime items</span>
          <span>${atlasBuild.publicationCount} publications</span>
          <span>${atlasBuild.familyCount} source families</span>
        </div>
        <div class="header-metrics-strip">
          <div class="metric-compact">
            <div class="micro-label">View</div>
            <strong>${currentSliceLabel(state)}</strong>
          </div>
          <div class="metric-compact">
            <div class="micro-label">Culture</div>
            <strong>${cultureWeight}%</strong>
          </div>
          <div class="metric-compact">
            <div class="micro-label">Now</div>
            <strong>${nowCount}</strong>
          </div>
          <div class="metric-compact">
            <div class="micro-label">Top area</div>
            <strong>${topPlace ? topPlace.label : "—"}</strong>
          </div>
        </div>
      </div>
    `;
  }

  function renderHeaderMap({ feed, focusPlaceKey }) {
    return `
      <div class="atlas-header__map" id="atlas-map-panel">
        <div class="map-toolbar">
          <div class="map-toolbar__left">
            <button class="map-button" data-map-action="zoom-out" type="button">-</button>
            <button class="map-button" data-map-action="zoom-in" type="button">+</button>
            <button class="map-button" data-map-action="fit-map" type="button">overview</button>
            <button class="map-button" data-map-action="toggle-fullscreen" type="button">full map</button>
          </div>
          <div class="map-toolbar__right">
            <span class="dock-pill" data-map-zoom>${Math.round(state.mapScale * 100)}%</span>
            <span class="dock-pill">${atlasMap.neighborhoods ? `${atlasMap.neighborhoods.length} neighborhoods` : `${atlasMap.paths.length} polygons`}</span>
            <span class="dock-pill">${feed.length} visible items</span>
          </div>
        </div>
        <div class="atlas-map-viewport" data-map-viewport>
          <div class="atlas-map-canvas">${renderMap({ items: feed, focusPlaceKey, atlasMap })}</div>
        </div>
      </div>
    `;
  }

  function renderHomeLayout({ feed, focusPlaceKey, selected, cards, rail, typeRows, sourceRows }) {
    const placePressureRows = graph.placePressure({ items: feed });

    return `
      <main class="atlas-home-view">
        <section class="atlas-home-stage">
          <div class="atlas-home-main">
            ${renderHeaderCopy({
              cultureWeight: graph.cultureShare(feed),
              nowCount: feed.filter((item) => windowBucket(item) === "now").length,
              topPlace: placePressureRows[0],
            })}

            ${renderSelectedSignal(selected)}

            <section class="panel panel--content-grid">
              <div class="panel-header">
                <div>
                  <div class="micro-label">Main grid</div>
                  <h2>Sources, events, and curated mixtapes</h2>
                </div>
                <p>Everything here stays preview-sized. Mixtapes remain single-square cards that open into a fuller read.</p>
              </div>
              <div class="content-grid">
                ${cards.length ? cards.map((card) => renderGridCard(card, focusPlaceKey)).join("") : `<div class="empty-state">Nothing matches this view. Reset filters to bring the field back.</div>`}
              </div>
            </section>
          </div>

          <div class="atlas-home-rail">
            ${renderHeaderMap({ feed, focusPlaceKey })}
            ${renderClassifiedsRail(rail, focusPlaceKey)}
          </div>
        </section>

        <section class="atlas-home-bottom">
          <div class="map-footer">
            <section class="map-footer__column">
              <div class="micro-label">Basemap</div>
              <a href="${atlasBuild.mapSource}" target="_blank" rel="noreferrer">Orleans Parish TIGER/Line faces polygons</a>
              <p class="map-note">The visible markers, grid, and classifieds rail are all derived from the same filtered runtime.</p>
            </section>

            <section class="map-footer__column">
              <div class="micro-label">Activity by area</div>
              <div class="row-bar-list">${renderRowBars(placePressureRows, { interactive: true, activeValue: focusPlaceKey })}</div>
            </section>

            ${renderLinkedPlace(feed, focusPlaceKey)}
          </div>

          ${renderFieldPanel(typeRows, sourceRows)}
        </section>
      </main>
    `;
  }

  function renderMixtapeDetail(mixtape) {
    if (!mixtape) {
      return `
        <main class="mixtape-page">
          <article class="panel">
            <div class="panel-header">
              <div>
                <div class="micro-label">Mixtape detail</div>
                <h2>Mixtape not found</h2>
              </div>
              <p>The requested curated set is missing from the current runtime.</p>
            </div>
          </article>
        </main>
      `;
    }

    const placeRows = graph.rowsByField(
      mixtape.items.map((item) => ({ ...item, placeLabel: graph.placeLabel(item.placeKey) })),
      "placeLabel"
    );

    return `
      <main class="mixtape-page">
        <section class="panel panel--mixtape-detail">
          <div class="mixtape-detail__mast">
            <div>
              <div class="micro-label">Mixtape</div>
              <h2>${mixtape.title}</h2>
            </div>
            <div class="mixtape-detail__meta">
              <span>${mixtape.curator}</span>
              <span>${mixtape.itemCount} items</span>
              <span>${mixtape.placeCount} places</span>
              <span>${formatRelativeDate(mixtape.publishedAt)}</span>
            </div>
          </div>
          <p class="mixtape-detail__deck">${mixtape.description}</p>
          <div class="tag-row">
            <span>${mixtape.eventCount} events</span>
            <span>${mixtape.sourceCount} sources</span>
            <span>${mixtape.leadPlaceLabel}</span>
            <span>${mixtape.sourceNames.slice(0, 3).join(" / ")}</span>
          </div>
        </section>

        <div class="mixtape-detail__layout">
          <section class="panel panel--content-grid">
            <div class="panel-header">
              <div>
                <div class="micro-label">Curated items</div>
                <h3>Read the set card by card</h3>
              </div>
              <p>${mixtape.id === DRAFT_MIXTAPE_ID ? "This draft can be edited in place." : "These stay as previews here; open individual sources when you need the full original."}</p>
            </div>
            <div class="content-grid content-grid--detail">
              ${mixtape.items.length
                ? mixtape.items.map((item) => renderSignalCard(item, mixtape.leadPlaceKey, { removable: mixtape.id === DRAFT_MIXTAPE_ID })).join("")
                : `<div class="empty-state">No items are saved in this mixtape yet.</div>`}
            </div>
          </section>

          <aside class="mixtape-detail__side">
            <article class="panel panel--mixtape-side">
              <div class="panel-header panel-header--rail">
                <div>
                  <div class="micro-label">Place pressure</div>
                  <h3>Where this set clusters</h3>
                </div>
                <p>The same place spine remains visible here, but applied to one curated sequence.</p>
              </div>
              <div class="row-bar-list">${renderRowBars(placeRows)}</div>
            </article>

            <article class="panel panel--mixtape-side">
              <div class="panel-header panel-header--rail">
                <div>
                  <div class="micro-label">Source mix</div>
                  <h3>Who is carrying it</h3>
                </div>
                <p>${mixtape.id === DRAFT_MIXTAPE_ID ? "This draft stays in your browser. Export it as a portable card (JSON) with the control below." : "Curated from the checked-in runtime. Export this set as a portable card (JSON) with the control below."}</p>
              </div>
              <div class="field-notes">
                ${mixtape.sourceNames
                  .map(
                    (source) => `
                      <article>
                        <span>${source}</span>
                        <p>${mixtape.items.filter((item) => item.source === source).length} item${mixtape.items.filter((item) => item.source === source).length === 1 ? "" : "s"} in this set.</p>
                      </article>
                    `
                  )
                  .join("")}
              </div>
              <button class="inline-action" type="button" data-export-mixtape="${mixtape.id}">Export as card (JSON)</button>
            </article>
          </aside>
        </div>
      </main>
    `;
  }

  function render() {
    const feed = graph.query({ lens: state.lens, filters: state.filters, specs: atlasSpecs, focusPlace: state.focusPlace });
    const selected = graph.selected({ items: feed, state });
    const rail = graph.classifiedsRail({ filters: state.filters, specs: atlasSpecs, focusPlace: state.focusPlace });
    const cards = graph.mainGridCards({
      lens: state.lens,
      filters: state.filters,
      specs: atlasSpecs,
      focusPlace: state.focusPlace,
      draftItemIds: state.draftMixtapeItemIds,
    });
    const mixtape = state.view === "mixtape" ? graph.mixtapeById(state.mixtapeId, state.draftMixtapeItemIds) : null;
    const placePressureRows = graph.placePressure({ items: feed });
    const hasPinnedPlace = Boolean(state.focusPlace || state.selectedId);
    const focusPlaceKey =
      state.focusPlace ||
      (state.selectedId && selected ? selected.placeKey : "") ||
      (state.view === "mixtape" && mixtape ? mixtape.leadPlaceKey : "") ||
      placePressureRows[0]?.value ||
      (selected ? selected.placeKey : "") ||
      "";
    const nowCount = feed.filter((item) => windowBucket(item) === "now").length;
    const sourceRows = graph.rowsByField(feed, "source").slice(0, 6);
    const typeRows = graph.rowsByField(feed, "type", groupByKey("type").labels);
    const topPlace = placePressureRows[0];
    const cultureWeight = graph.cultureShare(feed);

    root.innerHTML = `
      <div class="atlas-app ${state.view === "mixtape" ? "atlas-app--mixtape" : ""}">
        ${state.view === "mixtape"
          ? `
              <header class="atlas-header">
                ${renderHeaderCopy({ cultureWeight, nowCount, topPlace })}
                ${renderHeaderMap({ feed, focusPlaceKey })}
              </header>

              <div class="atlas-controls">
                ${renderPageBar(mixtape)}
              </div>

              ${renderMixtapeDetail(mixtape)}
            `
          : `
              ${renderHomeLayout({ feed, focusPlaceKey, selected, cards, rail, typeRows, sourceRows })}

              <div class="atlas-controls atlas-controls--bottom">
                ${renderHeroBar()}
                ${renderFiltersPanel(feed, focusPlaceKey, hasPinnedPlace)}
              </div>
            `}
      </div>
    `;

    applyMapTransform();
  }

  return { render };
}
