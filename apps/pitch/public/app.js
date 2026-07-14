(() => {
  const cards = [...document.querySelectorAll("[data-card-id]")];
  const cardById = new Map(cards.map((card) => [card.dataset.cardId, card]));
  const hand = new Set();

  const handDialog = document.querySelector("[data-hand-dialog]");
  const presenterDialog = document.querySelector("[data-presenter-dialog]");
  const handList = document.querySelector("[data-hand-list]");
  const handEmpty = document.querySelector("[data-hand-empty]");
  const handDock = document.querySelector("[data-hand-dock]");
  const presentButton = document.querySelector("[data-present]");
  const presenterStage = document.querySelector("[data-presenter-stage]");
  const slideProgress = document.querySelector("[data-slide-progress]");
  const statusMessage = document.querySelector("[data-status-message]");
  const themeToggle = document.querySelector("[data-theme-toggle]");

  let statusTimer;
  let activeSlide = 0;
  let presenterCards = [];

  const cleanText = (value) => value.replace(/\s+/g, " ").trim();

  const cardData = (card) => {
    const front = card.querySelector(".card-front");
    const source = front.querySelector(".card-meta span:last-child");
    const claim = front.querySelector(".card-body > p:last-child");

    return {
      id: card.dataset.cardId,
      title: card.dataset.cardTitle,
      type: card.dataset.cardType,
      source: source ? cleanText(source.textContent) : "Source state unavailable",
      claim: claim ? cleanText(claim.textContent) : "",
    };
  };

  const announce = (message) => {
    window.clearTimeout(statusTimer);
    statusMessage.textContent = message;
    statusMessage.classList.add("is-visible");
    statusTimer = window.setTimeout(() => {
      statusMessage.classList.remove("is-visible");
    }, 2400);
  };

  const applyTheme = (theme, persist = true) => {
    const suited = theme === "suited-chili";
    const nextTheme = suited ? "suited-chili" : "ultraviolet";

    document.documentElement.dataset.theme = nextTheme;
    themeToggle.setAttribute("aria-pressed", String(suited));
    themeToggle.title = suited
      ? "Change color to ultraviolet bureaucracy"
      : "Change color to suited chili";

    const themeColor = document.querySelector('meta[name="theme-color"]');
    if (themeColor) {
      themeColor.content = suited ? "#160b0a" : "#0038ff";
    }

    if (persist) {
      try {
        localStorage.setItem("common-pitch-theme", nextTheme);
      } catch {
        // The theme still changes when storage is unavailable.
      }
    }
  };

  const updateSelectionUI = () => {
    cards.forEach((card) => {
      const selected = hand.has(card.dataset.cardId);
      card.classList.toggle("is-selected", selected);
      card.querySelectorAll("[data-collect]").forEach((button) => {
        button.setAttribute("aria-pressed", String(selected));
        button.textContent = selected ? "Remove from hand" : "Add to hand";
      });
    });

    const count = hand.size;
    const displayCount = String(count).padStart(2, "0");

    document.querySelectorAll("[data-hand-count]").forEach((node) => {
      node.textContent = displayCount;
      node.setAttribute(
        "aria-label",
        `${count} ${count === 1 ? "card" : "cards"} selected`
      );
    });

    document.querySelectorAll("[data-dock-count]").forEach((node) => {
      node.textContent = String(count);
    });

    handDock.hidden = count === 0;
    presentButton.disabled = count === 0;
    renderHand();
  };

  const renderHand = () => {
    handList.replaceChildren();
    handEmpty.hidden = hand.size > 0;

    [...hand].forEach((id) => {
      const card = cardById.get(id);
      if (!card) return;

      const data = cardData(card);
      const item = document.createElement("li");
      const title = document.createElement("strong");
      const description = document.createElement("span");
      const remove = document.createElement("button");

      title.textContent = data.title;
      description.textContent = `${data.type} / ${data.source}`;
      remove.type = "button";
      remove.textContent = "Remove";
      remove.dataset.removeCard = id;
      remove.setAttribute("aria-label", `Remove ${data.title} from your hand`);

      item.append(title, description, remove);
      handList.append(item);
    });
  };

  const toggleCard = (id, shouldAnnounce = true) => {
    if (!cardById.has(id)) return;

    if (hand.has(id)) {
      hand.delete(id);
      if (shouldAnnounce) announce(`${cardById.get(id).dataset.cardTitle} removed`);
    } else {
      hand.add(id);
      if (shouldAnnounce) announce(`${cardById.get(id).dataset.cardTitle} added`);
    }

    updateSelectionUI();
  };

  const turnCard = (button) => {
    const card = button.closest("[data-card-id]");
    const front = card.querySelector(".card-front");
    const back = card.querySelector(".card-back");
    const showBack = !front.hidden;

    front.hidden = showBack;
    back.hidden = !showBack;
    card.classList.toggle("is-flipped", showBack);

    card.querySelectorAll("[data-flip]").forEach((control) => {
      control.setAttribute("aria-expanded", String(showBack));
    });

    const destination = showBack ? back : front;
    destination.querySelector("[data-flip]").focus();
  };

  const openHand = () => {
    renderHand();
    handDialog.showModal();
  };

  const buildShareUrl = () => {
    const url = new URL(window.location.href);
    url.hash = "";
    url.search = "";

    if (hand.size > 0) {
      url.searchParams.set("hand", [...hand].join(","));
    }

    return url.toString();
  };

  const copyText = async (text) => {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return;
    }

    const field = document.createElement("textarea");
    field.value = text;
    field.setAttribute("readonly", "");
    field.style.position = "fixed";
    field.style.opacity = "0";
    document.body.append(field);
    field.select();
    document.execCommand("copy");
    field.remove();
  };

  const renderSlide = () => {
    const card = presenterCards[activeSlide];
    if (!card) return;

    const data = cardData(card);
    const slide = document.createElement("article");
    const type = document.createElement("p");
    const title = document.createElement("h2");
    const source = document.createElement("p");

    slide.className = "presenter-slide";
    type.className = "slide-type";
    source.className = "slide-source";

    type.textContent = data.type;
    title.textContent = data.title;
    source.textContent = `${data.source} / ${data.claim}`;

    slide.append(type, title, source);
    presenterStage.replaceChildren(slide);
    slideProgress.textContent = `${String(activeSlide + 1).padStart(2, "0")} / ${String(
      presenterCards.length
    ).padStart(2, "0")}`;
  };

  const openPresenter = () => {
    presenterCards = [...hand]
      .map((id) => cardById.get(id))
      .filter(Boolean);

    if (presenterCards.length === 0) {
      announce("Add at least one card before presenting");
      return;
    }

    activeSlide = 0;
    renderSlide();
    handDialog.close();
    presenterDialog.showModal();
  };

  const moveSlide = (direction) => {
    if (presenterCards.length === 0) return;
    activeSlide =
      (activeSlide + direction + presenterCards.length) % presenterCards.length;
    renderSlide();
  };

  const drawCard = () => {
    const card = cards[Math.floor(Math.random() * cards.length)];
    if (!card) return;

    cards.forEach((item) => item.classList.remove("is-drawn"));
    card.classList.add("is-drawn");
    card.scrollIntoView({ behavior: "smooth", block: "center", inline: "center" });
    window.setTimeout(() => {
      card.querySelector("[data-flip]").focus({ preventScroll: true });
    }, 450);
    announce(`Drawn: ${card.dataset.cardTitle}`);
  };

  // --- Consultation package + mock checkout -------------------------------
  // FIXED dummy price for the mockup. Real pricing is a business input.
  const CONSULT_PRICE = 750;
  const fmtPrice = (n) => `$${n.toLocaleString("en-US")}`;

  const consultDialog = document.querySelector("[data-consult-dialog]");
  const consultBody = document.querySelector("[data-package-body]");
  const consultHeading = document.querySelector("[data-consult-heading]");
  const consultEyebrow = document.querySelector("[data-consult-eyebrow]");
  const slotGrid = document.querySelector("[data-slot-grid]");
  const consultDone = document.querySelector("[data-consult-done]");

  let consultPackage = null;
  let selectedSlot = null;
  let payer = { name: "", email: "" };

  // Compose a structured, source-grounded package from the selected cards.
  // NOTE: this is the simulated generator. To go live, replace the body with a
  // `fetch("<worker>/consult", { method: "POST", body: JSON.stringify({ hand }) })`
  // call returning the same shape; the rest of the flow is unchanged. The Worker
  // calls OpenRouter's free endpoint (OpenAI-compatible
  // https://openrouter.ai/api/v1/chat/completions, a `:free` model, JSON mode);
  // the OpenRouter API key stays in a Worker secret — never in this file.
  const generatePackage = (cards) => {
    const data = cards.map(cardData);
    const byType = (t) => data.filter((c) => c.type === t);

    const fields = byType("Field");
    const methods = byType("Method");
    const protocols = byType("Protocol");
    const framing = data.filter((c) =>
      ["Thesis", "Problem", "Institutional claim"].includes(c.type)
    );

    const list = (arr) => arr.map((c) => c.title);
    const focusAreas = list(fields);
    const capabilities = list(methods);
    const principles = list(protocols);

    const summaryParts = [];
    summaryParts.push(
      `You assembled ${data.length} ${data.length === 1 ? "card" : "cards"} from the Common Action cabinet.`
    );
    if (focusAreas.length) {
      summaryParts.push(
        `The engagement centers on ${focusAreas.join(", ")} as the field${focusAreas.length === 1 ? "" : "s"} of work.`
      );
    }
    if (capabilities.length) {
      summaryParts.push(
        `It would draw on ${capabilities.join(", ").toLowerCase()}.`
      );
    }
    if (!focusAreas.length && !capabilities.length) {
      summaryParts.push(
        "It frames the problem before committing to a field or method — a scoping conversation."
      );
    }

    return {
      summary: summaryParts.join(" "),
      framing: framing.map((c) => ({ title: c.title, claim: c.claim })),
      focusAreas,
      capabilities,
      principles,
      talkingPoints: data.map((c) => ({
        title: c.title,
        type: c.type,
        claim: c.claim,
        source: c.source,
      })),
    };
  };

  const section = (heading, items) => {
    if (!items.length) return "";
    const lis = items.map((t) => `<li>${t}</li>`).join("");
    return `<div class="package-section"><h3>${heading}</h3><ul>${lis}</ul></div>`;
  };

  const renderPackage = (pkg) => {
    const points = pkg.talkingPoints
      .map(
        (p) =>
          `<li><strong>${p.title}</strong> <span class="point-type">${p.type}</span><p>${p.claim}</p></li>`
      )
      .join("");

    consultBody.innerHTML = `
      <p class="package-summary">${pkg.summary}</p>
      ${section("Focus areas", pkg.focusAreas)}
      ${section("Methods in scope", pkg.capabilities)}
      ${section("Working protocols", pkg.principles)}
      <div class="package-section">
        <h3>Discussion points</h3>
        <ul class="package-points">${points}</ul>
      </div>
      <p class="package-disclaimer">Drafted from your selected source-labeled claims. No outcomes, metrics, or engagements are implied beyond what the cards state.</p>
    `;
    document.querySelector("[data-package-price]").textContent = fmtPrice(CONSULT_PRICE);
  };

  const showConsultStep = (name) => {
    consultDialog.querySelectorAll("[data-consult-step]").forEach((el) => {
      el.hidden = el.dataset.consultStep !== name;
    });
    consultDialog.querySelectorAll("[data-progress-step]").forEach((el) => {
      el.classList.toggle("is-active", el.dataset.progressStep === name);
    });
    const labels = {
      loading: ["GENERATING", "Building your package"],
      package: ["PERSONALIZED PACKAGE / DRAFT", "Your consultation package"],
      checkout: ["CHECKOUT / MOCK", "Confirm and pay"],
      schedule: ["SCHEDULE / MOCK", "Pick a time"],
      done: ["CONFIRMED / MOCK", "Booking confirmed"],
    };
    if (labels[name]) {
      consultEyebrow.textContent = labels[name][0];
      consultHeading.textContent = labels[name][1];
    }
  };

  const openConsult = () => {
    const cards = [...hand].map((id) => cardById.get(id)).filter(Boolean);
    if (cards.length === 0) {
      announce("Add at least one card before building a package");
      return;
    }
    handDialog.close();
    selectedSlot = null;
    showConsultStep("loading");
    consultDialog.showModal();

    // Simulated async generation (stands in for the LLM call latency).
    window.setTimeout(() => {
      consultPackage = generatePackage(cards);
      renderPackage(consultPackage);
      showConsultStep("package");
    }, 900);
  };

  const buildOrderSummary = () => {
    const lines = document.querySelector("[data-order-lines]");
    const count = consultPackage ? consultPackage.talkingPoints.length : 0;
    lines.innerHTML = `
      <p class="order-line"><span>Common Action consultation</span><span>${fmtPrice(CONSULT_PRICE)}</span></p>
      <p class="order-line order-line-muted"><span>${count} card${count === 1 ? "" : "s"} in package</span><span>—</span></p>
    `;
    document.querySelector("[data-order-total]").textContent = fmtPrice(CONSULT_PRICE);
    document.querySelector("[data-pay-amount]").textContent = fmtPrice(CONSULT_PRICE);
  };

  const renderSlots = () => {
    const slots = [];
    const date = new Date();
    let added = 0;
    const times = ["10:00", "13:30", "15:00"];
    while (slots.length < 6) {
      date.setDate(date.getDate() + 1);
      const day = date.getDay();
      if (day === 0 || day === 6) continue; // weekdays only
      const label = date.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      });
      const time = times[added % times.length];
      added += 1;
      slots.push({ id: `${label} ${time}`, label, time });
    }
    slotGrid.innerHTML = slots
      .map(
        (s) =>
          `<button type="button" class="slot" data-slot="${s.id}"><span class="slot-day">${s.label}</span><span class="slot-time">${s.time}</span></button>`
      )
      .join("");
  };

  const renderDone = () => {
    const titles = consultPackage
      ? consultPackage.talkingPoints.map((p) => p.title)
      : [];
    consultDone.innerHTML = `
      <p class="done-check" aria-hidden="true">✓</p>
      <p class="done-lead">Consultation booked${payer.name ? ` for ${payer.name}` : ""}.</p>
      <dl class="done-detail">
        <div><dt>When</dt><dd>${selectedSlot || "—"}</dd></div>
        <div><dt>Package</dt><dd>${titles.length} card${titles.length === 1 ? "" : "s"}</dd></div>
        <div><dt>Total charged</dt><dd>${fmtPrice(CONSULT_PRICE)} (mock)</dd></div>
        ${payer.email ? `<div><dt>Confirmation to</dt><dd>${payer.email}</dd></div>` : ""}
      </dl>
      <p class="package-disclaimer">This is a mockup. No payment was taken and no booking was made.</p>
    `;
  };

  const restoreHandFromUrl = () => {
    const params = new URLSearchParams(window.location.search);
    const selected = params.get("hand");
    if (!selected) return;

    selected.split(",").forEach((id) => {
      if (cardById.has(id)) hand.add(id);
    });
  };

  document.addEventListener("click", async (event) => {
    const target = event.target.closest("button");
    if (!target) return;

    if (target.matches("[data-flip]")) {
      turnCard(target);
      return;
    }

    if (target.matches("[data-theme-toggle]")) {
      const nextTheme =
        document.documentElement.dataset.theme === "suited-chili"
          ? "ultraviolet"
          : "suited-chili";
      applyTheme(nextTheme);
      announce(
        nextTheme === "suited-chili"
          ? "Color changed: suited chili"
          : "Color changed: ultraviolet bureaucracy"
      );
      return;
    }

    if (target.matches("[data-collect]")) {
      toggleCard(target.closest("[data-card-id]").dataset.cardId);
      return;
    }

    if (target.matches("[data-add-card]")) {
      const id = target.dataset.addCard;
      if (!hand.has(id)) toggleCard(id);
      return;
    }

    if (target.matches("[data-remove-card]")) {
      toggleCard(target.dataset.removeCard);
      return;
    }

    if (target.matches("[data-open-hand]")) {
      openHand();
      return;
    }

    if (target.matches("[data-clear-hand]")) {
      hand.clear();
      updateSelectionUI();
      announce("Hand cleared");
      return;
    }

    if (target.matches("[data-share]")) {
      try {
        await copyText(buildShareUrl());
        announce("Share link copied");
      } catch {
        announce("Could not copy the link");
      }
      return;
    }

    if (target.matches("[data-present]")) {
      openPresenter();
      return;
    }

    if (target.matches("[data-consult]")) {
      openConsult();
      return;
    }

    if (target.matches("[data-consult-close], [data-consult-finish]")) {
      consultDialog.close();
      return;
    }

    if (target.matches("[data-consult-checkout]")) {
      buildOrderSummary();
      showConsultStep("checkout");
      return;
    }

    if (target.matches("[data-consult-back]")) {
      showConsultStep(target.dataset.consultBack);
      return;
    }

    if (target.matches("[data-consult-pay]")) {
      const form = document.querySelector("[data-mock-pay]");
      payer = {
        name: form.elements.name.value.trim(),
        email: form.elements.email.value.trim(),
      };
      renderSlots();
      showConsultStep("schedule");
      return;
    }

    if (target.matches("[data-slot]")) {
      selectedSlot = target.dataset.slot;
      slotGrid.querySelectorAll("[data-slot]").forEach((b) => {
        b.classList.toggle("is-selected", b === target);
        b.setAttribute("aria-pressed", String(b === target));
      });
      document.querySelector("[data-consult-confirm]").disabled = false;
      return;
    }

    if (target.matches("[data-consult-confirm]")) {
      if (!selectedSlot) return;
      renderDone();
      showConsultStep("done");
      announce("Consultation booked (mock)");
      return;
    }

    if (target.matches("[data-exit-presenter]")) {
      presenterDialog.close();
      return;
    }

    if (target.matches("[data-previous-slide]")) {
      moveSlide(-1);
      return;
    }

    if (target.matches("[data-next-slide]")) {
      moveSlide(1);
      return;
    }

    if (target.matches("[data-draw-card]")) {
      drawCard();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (!presenterDialog.open) return;

    if (event.key === "ArrowRight" || event.key === "PageDown") {
      event.preventDefault();
      moveSlide(1);
    }

    if (event.key === "ArrowLeft" || event.key === "PageUp") {
      event.preventDefault();
      moveSlide(-1);
    }
  });

  restoreHandFromUrl();
  applyTheme(document.documentElement.dataset.theme, false);
  updateSelectionUI();
})();
