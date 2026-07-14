import { spawn } from "node:child_process";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import process from "node:process";
import { setTimeout as delay } from "node:timers/promises";
import { chromium } from "playwright";

const PORT = Number(process.env.PORT || 4173);
const BASE_URL = `http://127.0.0.1:${PORT}/`;

// This script lives at apps/atlas/scripts/smoke/ — the app dir is two levels up.
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const APP_DIR = path.resolve(__dirname, "../..");
const DEV_SERVER = path.resolve(APP_DIR, "scripts/dev-server.mjs");
const outPath = (name) => path.resolve(APP_DIR, "output", name);

function startServer() {
  const child = spawn(process.execPath, [DEV_SERVER], {
    cwd: APP_DIR,
    env: { ...process.env, PORT: String(PORT) },
    stdio: ["ignore", "pipe", "pipe"],
  });

  let ready = false;
  child.stdout.on("data", (buf) => {
    const text = String(buf);
    if (text.includes("Signal Atlas running on port")) {
      ready = true;
    }
    process.stdout.write(text);
  });
  child.stderr.on("data", (buf) => process.stderr.write(String(buf)));

  return {
    child,
    async waitUntilReady(timeoutMs = 8000) {
      const start = Date.now();
      while (!ready) {
        if (Date.now() - start > timeoutMs) {
          throw new Error("Server did not become ready in time.");
        }
        await delay(100);
      }
    },
    stop() {
      child.kill();
    },
  };
}

async function main() {
  const server = startServer();
  try {
    await server.waitUntilReady();

    const browser = await chromium.launch();
    const page = await browser.newPage({ viewport: { width: 1440, height: 980 }, acceptDownloads: true });

    const consoleErrors = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") {
        consoleErrors.push(msg.text());
      }
    });

    await page.goto(BASE_URL, { waitUntil: "domcontentloaded" });
    await page.waitForSelector("text=Signal Atlas / New Orleans", { timeout: 8000 });
    await page.waitForSelector("text=Sources, events, and curated mixtapes", { timeout: 8000 });
    await page.waitForSelector("text=Classifieds", { timeout: 8000 });
    await page.screenshot({ path: outPath("smoke-home.png"), fullPage: true });

    const firstMixtape = page.locator("[data-open-mixtape]").first();
    await firstMixtape.click();
    await page.waitForSelector("text=Mixtape detail", { timeout: 8000 });
    await page.waitForSelector("text=Read the set card by card", { timeout: 8000 });
    await page.screenshot({ path: outPath("smoke-mixtape.png"), fullPage: true });

    // Open a seeded (non-empty) mixtape and export it as a Card Commons card.
    await page.click("[data-close-mixtape]");
    await page.waitForSelector('[data-open-mixtape="mixtape-frenchmen-after-dark"]', { timeout: 8000 });
    await page.click('[data-open-mixtape="mixtape-frenchmen-after-dark"]');
    await page.waitForSelector("[data-export-mixtape]", { timeout: 8000 });

    const [download] = await Promise.all([
      page.waitForEvent("download", { timeout: 8000 }),
      page.click("[data-export-mixtape]"),
    ]);
    const downloadPath = await download.path();
    const exported = JSON.parse(await readFile(downloadPath, "utf8"));

    const requiredKeys = ["card", "fields", "surfaces", "classifications", "permissions", "metadata", "schemaVersion"];
    for (const key of requiredKeys) {
      if (!(key in exported)) {
        throw new Error(`Exported card is missing required key: ${key}`);
      }
    }
    if (exported.schemaVersion !== "0.1.0") {
      throw new Error(`Exported card has unexpected schemaVersion: ${exported.schemaVersion}`);
    }
    if (exported.card?.kind !== "mixtape_card") {
      throw new Error(`Exported card has unexpected kind: ${exported.card?.kind}`);
    }
    const tracklist = exported.fields?.tracklist?.value;
    if (!Array.isArray(tracklist) || tracklist.length === 0) {
      throw new Error("Exported card tracklist is empty or not an array.");
    }
    const summary = exported.fields?.summary?.value;
    if (typeof summary !== "string" || summary.trim() === "") {
      throw new Error("Exported card summary is empty.");
    }
    console.log("Export assertion passed: mixtape_card CardDocument with non-empty tracklist and summary.");

    await browser.close();

    if (consoleErrors.length) {
      throw new Error(`Console errors detected:\n${consoleErrors.join("\n")}`);
    }

    console.log("Playwright smoke test passed.");
  } finally {
    server.stop();
  }
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
