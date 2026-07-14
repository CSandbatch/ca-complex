#!/usr/bin/env node
// Manual, opt-in live smoke test for the OpenRouter image path.
// NEVER run in CI — it spends real credits.
//
// Usage (from the studio/ directory):
//   OPENROUTER_API_KEY=sk-or-... node scripts/smoke-openrouter.mjs
//   node --env-file=.env scripts/smoke-openrouter.mjs            # if key is in .env
//   node scripts/smoke-openrouter.mjs --all                     # every OpenRouter model
//   node scripts/smoke-openrouter.mjs --model openai/gpt-image-1 --edit
//
// It verifies the request shape this app sends, that each model returns a
// decodable image, that gpt-image-1 can produce a transparent emblem, and
// (optionally) that the input_references edit path round-trips.

import { writeFileSync, mkdirSync, readFileSync, existsSync } from "node:fs";
import { imageSize } from "image-size";

const ENDPOINT = "https://openrouter.ai/api/v1/images";
const OUT_DIR = new URL("../.smoke-out/", import.meta.url);

// Mirror of lib/models.ts (kept small + standalone on purpose).
const MODELS = [
  { id: "openai/gpt-image-1", transparency: true },
  { id: "google/gemini-3.1-flash-image", transparency: false },
  { id: "bytedance-seed/seedream-4.5", transparency: false, portraitSize: "1664x2496" },
  { id: "black-forest-labs/flux.2-pro", transparency: false, portraitSize: "1024x1536" },
  { id: "x-ai/grok-imagine-image-quality", transparency: false },
];

function loadKey() {
  if (process.env.OPENROUTER_API_KEY) return process.env.OPENROUTER_API_KEY;
  for (const file of [".env", ".env.local"]) {
    const path = new URL(`../${file}`, import.meta.url);
    if (!existsSync(path)) continue;
    for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
      const match = /^\s*OPENROUTER_API_KEY\s*=\s*(.+?)\s*$/.exec(line);
      if (match) return match[1].replace(/^["']|["']$/g, "");
    }
  }
  return "";
}

const KEY = loadKey();
if (!KEY) {
  console.error("No OPENROUTER_API_KEY found in env or studio/.env(.local). Aborting.");
  process.exit(2);
}

const args = process.argv.slice(2);
const runAll = args.includes("--all");
const runEdit = args.includes("--edit");
const onlyModel = args.includes("--model") ? args[args.indexOf("--model") + 1] : null;

const aspectFor = (role) => (role === "emblem" ? "1:1" : "2:3");
// Match the provider: explicit size for models that ignore aspect_ratio.
const sizingFor = (model, role) =>
  model.portraitSize && role !== "emblem" ? { size: model.portraitSize } : { aspect_ratio: aspectFor(role) };
const generatePrompt = (role) => [
  `Create the ${role} visual layer for a portrait calling card.`,
  role === "emblem"
    ? "A simple arcane night-bloom emblem, centered, elegant linework, transparent background, no text"
    : "Deep nocturne atmosphere, dark indigo and charcoal, subtle cinematic light, no text",
  "Card message: Meet me where the stars begin.",
  "Signature: Aster",
  "Do not render letters, words, signatures, borders, frames, or mockup cards. Return only the visual layer.",
].join("\n");

async function call(body) {
  const started = Date.now();
  const response = await fetch(ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${KEY}`,
      "Content-Type": "application/json",
      "HTTP-Referer": process.env.OPENROUTER_SITE_URL || "https://card-commons.example",
      "X-Title": "Card Commons Studio (smoke test)",
    },
    body: JSON.stringify(body),
  });
  const ms = Date.now() - started;
  if (!response.ok) {
    const detail = (await response.text().catch(() => "")).slice(0, 300);
    throw new Error(`HTTP ${response.status} after ${ms}ms: ${detail}`);
  }
  const payload = await response.json();
  return { payload, ms };
}

function inspect(b64) {
  const bytes = Buffer.from(b64, "base64");
  const dims = imageSize(bytes);
  // PNG IHDR colour type lives at byte 25; 4/6 carry an alpha channel.
  const colourType = dims.type === "png" && bytes.length > 25 ? bytes[25] : null;
  const hasAlpha = colourType === 4 || colourType === 6;
  return { bytes, dims, hasAlpha };
}

mkdirSync(OUT_DIR, { recursive: true });
const results = [];
let firstGenerated = null;

async function generate(model, role) {
  const modelId = model.id;
  const label = `${modelId} · ${role}`;
  try {
    const { payload, ms } = await call({ model: modelId, prompt: generatePrompt(role), ...sizingFor(model, role) });
    const item = payload.data?.[0];
    if (!item?.b64_json) throw new Error("response had no data[0].b64_json");
    const { bytes, dims, hasAlpha } = inspect(item.b64_json);
    const file = new URL(`./${modelId.replace(/\W+/g, "_")}-${role}.${dims.type || "img"}`, OUT_DIR);
    writeFileSync(file, bytes);
    if (!firstGenerated) firstGenerated = { modelId, role, b64: item.b64_json, mime: item.media_type || `image/${dims.type}` };
    const note = role === "emblem" ? (hasAlpha ? "alpha ✓" : "NO ALPHA ✗") : "";
    results.push({ label, ok: true, detail: `${dims.width}x${dims.height} ${dims.type} ${ms}ms ${note}`.trim() });
  } catch (error) {
    results.push({ label, ok: false, detail: String(error.message || error) });
  }
}

async function edit(modelId) {
  const label = `${modelId} · edit`;
  if (!firstGenerated) { results.push({ label, ok: false, detail: "no prior image to edit" }); return; }
  try {
    const { payload, ms } = await call({
      model: modelId,
      prompt: "Edit the background visual layer. Keep the composition but make it quieter and more luminous. Do not render text.",
      input_references: [{ type: "image_url", image_url: { url: `data:${firstGenerated.mime};base64,${firstGenerated.b64}` } }],
      aspect_ratio: "2:3",
    });
    const item = payload.data?.[0];
    if (!item?.b64_json) throw new Error("edit response had no data[0].b64_json");
    const { dims } = inspect(item.b64_json);
    results.push({ label, ok: true, detail: `${dims.width}x${dims.height} ${dims.type} ${ms}ms` });
  } catch (error) {
    results.push({ label, ok: false, detail: String(error.message || error) });
  }
}

const targets = onlyModel ? MODELS.filter((m) => m.id === onlyModel) : runAll ? MODELS : [MODELS[0]];
if (!targets.length) { console.error(`Unknown model: ${onlyModel}`); process.exit(2); }

console.log(`Smoke testing ${targets.length} model(s) against ${ENDPOINT}\n`);
for (const model of targets) {
  await generate(model, "background");
  if (model.transparency) await generate(model, "emblem");
}
if (runEdit) await edit(targets[0].id);

console.log("\nResults:");
for (const row of results) console.log(`  ${row.ok ? "PASS" : "FAIL"}  ${row.label}  —  ${row.detail}`);
console.log(`\nImages written to ${OUT_DIR.pathname}`);
process.exit(results.every((row) => row.ok) ? 0 : 1);
