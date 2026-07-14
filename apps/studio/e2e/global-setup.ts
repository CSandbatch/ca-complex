import { chromium, type FullConfig } from "@playwright/test";

// Warms Next dev's lazy per-route compilation (gate page, /api/access, and the
// studio chunk) once before the suite, so no individual test pays the full
// cold-compile cost on a fresh CI runner.
export default async function globalSetup(config: FullConfig) {
  const baseURL = config.projects[0]?.use?.baseURL ?? "http://127.0.0.1:3100";
  const browser = await chromium.launch();
  const page = await browser.newPage({ baseURL });
  try {
    await page.goto("/", { timeout: 90000 });
    await page.getByLabel("Passcode").fill("pilot");
    await page.getByRole("button", { name: "Enter studio" }).click();
    await page.getByRole("heading", { name: "Card Studio" }).waitFor({ timeout: 90000 });
  } catch {
    // Warmup is best-effort; the real tests will still report failures.
  } finally {
    await browser.close();
  }
}
