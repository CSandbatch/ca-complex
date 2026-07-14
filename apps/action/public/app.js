// Common Action — color scheme switcher.
// Two schemes ported from Common Pitch: "ultraviolet" (default) and
// "suited-chili". This is the only client-side behavior on the page; the
// site remains otherwise static and dependency-free.
(() => {
  const themeToggle = document.querySelector("[data-theme-toggle]");
  if (!themeToggle) return;

  const STORAGE_KEY = "common-action-theme";
  const THEME_COLORS = {
    ultraviolet: "#eef1f6",
    "suited-chili": "#f0e2cb",
  };

  const announce = (message) => {
    let region = document.querySelector("[data-theme-status]");
    if (!region) {
      region = document.createElement("p");
      region.setAttribute("data-theme-status", "");
      region.setAttribute("role", "status");
      region.setAttribute("aria-live", "polite");
      region.style.position = "absolute";
      region.style.width = "1px";
      region.style.height = "1px";
      region.style.overflow = "hidden";
      region.style.clip = "rect(0 0 0 0)";
      document.body.appendChild(region);
    }
    region.textContent = message;
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
      themeColor.content = THEME_COLORS[nextTheme];
    }

    if (persist) {
      try {
        localStorage.setItem(STORAGE_KEY, nextTheme);
      } catch {
        // The theme still changes when storage is unavailable.
      }
    }
  };

  themeToggle.addEventListener("click", () => {
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
  });

  applyTheme(document.documentElement.dataset.theme, false);
})();
