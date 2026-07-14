import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("landing page exposes the core thesis and primary journeys", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Make a card");
  await expect(page.getByRole("link", { name: /Present the idea/ })).toBeVisible();
  await expect(page.getByText(/portable, editable,/).first()).toBeVisible();
});

test("deck supports deep links and keyboard or touch navigation", async ({ page }, testInfo) => {
  await page.goto("/deck/04/");
  await expect(page.getByText("Slide 4 of 14")).toBeVisible();
  await expect(page.getByRole("heading", { level: 1 })).toContainText("One source");
  if (testInfo.project.name === "mobile") {
    await page.getByRole("link", { name: "Next slide" }).click();
  } else {
    await page.keyboard.press("ArrowRight");
  }
  await expect(page).toHaveURL(/\/deck\/05\/?$/);
  if (testInfo.project.name === "desktop") {
    await page.keyboard.press("End");
    await expect(page).toHaveURL(/\/deck\/14\/?$/);
    await page.keyboard.press("Home");
    await expect(page).toHaveURL(/\/deck\/01\/?$/);
  }
});

test("deck remains usable with reduced motion", async ({ browser }) => {
  const context = await browser.newContext({ reducedMotion: "reduce" });
  const page = await context.newPage();
  await page.goto("/deck/11/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Generate material");
  await expect(page.getByRole("link", { name: "Next slide" })).toBeVisible();
  await context.close();
});

test("documentation renders canonical diagrams and tables", async ({ page }) => {
  await page.goto("/specs/03-system-architecture/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("System architecture");
  await expect(page.getByText("Recommended topology")).toBeVisible();
  await expect(page.locator(".mermaid-diagram, .diagram-loading")).toBeVisible();
});

test("key public pages have no serious axe violations", async ({ page }) => {
  for (const route of ["/", "/deck/01/", "/specs/", "/whitepaper/"]) {
    await page.goto(route);
    const results = await new AxeBuilder({ page })
      .disableRules(["color-contrast"])
      .analyze();
    const serious = results.violations.filter(
      (violation) => violation.impact === "serious" || violation.impact === "critical"
    );
    expect(serious, `${route}: ${JSON.stringify(serious, null, 2)}`).toEqual([]);
  }
});
