// check-fixtures.mjs — the witness gate (F2/F3).
//
// Contract: any app that emits a document governed by @ca/contracts registers
// its builder in packages/contracts/witnesses.json. This script imports each
// registered builder, obtains the builder's input the way the app does, runs it
// with the fixture's own fixed timestamp (so output is deterministic), then
// asserts the output (a) validates against the card-document schema and
// (b) deep-equals the checked-in fixture. A registered builder whose output has
// drifted from its schema or fixture — or a kind with no input adapter — is a
// red gate, in root check and in CI.
//
// Design for extension: register the builder + fixture + generator note in
// witnesses.json, then add a per-kind input adapter to INPUT_ADAPTERS below.
// The adapter owns the app-specific knowledge of how the builder's input is
// obtained; witnesses.json documents it in prose (the `generator` field).

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

// scripts/ sits inside packages/contracts; the repo root is three levels up.
const pkgRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const repoRoot = path.resolve(pkgRoot, "..", "..");
const witnessesPath = path.join(pkgRoot, "witnesses.json");

// --- per-kind input adapters -------------------------------------------------
// Each adapter returns the value the app passes to its builder as first arg.
// It is handed the resolved repo root so paths stay relative to ca-complex.
const INPUT_ADAPTERS = {
  // Atlas resolves a seeded mixtape through its graph exactly as apps/atlas's
  // UI does (app.js:18, :115), then hands it to build-mixtape-card.mjs.
  async mixtape_card(root) {
    const dataUrl = pathToFileURL(path.join(root, "apps/atlas/public/signal-atlas-data.js")).href;
    const graphUrl = pathToFileURL(path.join(root, "apps/atlas/public/src/atlas-graph.js")).href;
    const { atlasBuild, atlasFeed, atlasMap } = await import(dataUrl);
    const { createAtlasGraph } = await import(graphUrl);
    const graph = createAtlasGraph({ atlasBuild, atlasFeed, atlasMap });
    const mixtape = graph.mixtapeById("mixtape-frenchmen-after-dark", []);
    if (!mixtape) throw new Error("atlas graph did not resolve 'mixtape-frenchmen-after-dark'");
    return mixtape;
  },
};

// --- schema validation (mirrors validate-schemas.mjs) ------------------------
async function makeValidator() {
  const { default: Ajv2020 } = await import("ajv/dist/2020.js");
  const { default: addFormats } = await import("ajv-formats");
  const schemasDir = path.join(pkgRoot, "schemas");
  const ajv = new Ajv2020({ allErrors: true, strict: true });
  addFormats(ajv);
  for (const name of fs.readdirSync(schemasDir).filter((file) => file.endsWith(".json"))) {
    ajv.addSchema(JSON.parse(fs.readFileSync(path.join(schemasDir, name), "utf8")));
  }
  const validate = ajv.getSchema("https://cardcommons.org/schemas/card-document.schema.json");
  if (!validate) throw new Error("card-document schema was not registered.");
  return validate;
}

// --- order-independent, parsed-JSON deep comparison --------------------------
function canonical(value) {
  if (Array.isArray(value)) return value.map(canonical);
  if (value && typeof value === "object") {
    return Object.keys(value)
      .sort()
      .reduce((out, key) => {
        out[key] = canonical(value[key]);
        return out;
      }, {});
  }
  return value;
}

function firstDiff(builderJson, fixtureJson) {
  const a = builderJson.split("\n");
  const b = fixtureJson.split("\n");
  for (let i = 0; i < Math.max(a.length, b.length); i += 1) {
    if (a[i] !== b[i]) {
      return `  line ${i + 1}:\n    builder: ${a[i] ?? "(none)"}\n    fixture: ${b[i] ?? "(none)"}`;
    }
  }
  return "  (structural mismatch with no line-level difference)";
}

// --- run ---------------------------------------------------------------------
if (!fs.existsSync(witnessesPath)) {
  console.error("fixtures:check: FAIL — packages/contracts/witnesses.json is missing");
  process.exit(1);
}

const witnesses = JSON.parse(fs.readFileSync(witnessesPath, "utf8"));
const kinds = Object.keys(witnesses);

if (kinds.length === 0) {
  console.error("fixtures:check: FAIL — witnesses.json registers no builders");
  process.exit(1);
}

const validate = await makeValidator();
let failures = 0;

for (const kind of kinds) {
  const entry = witnesses[kind];
  try {
    const adapter = INPUT_ADAPTERS[kind];
    if (!adapter) throw new Error(`no input adapter registered for kind '${kind}'`);

    const builderUrl = pathToFileURL(path.join(repoRoot, entry.builder)).href;
    const builderModule = await import(builderUrl);
    const build = builderModule[entry.export];
    if (typeof build !== "function") {
      throw new Error(`builder ${entry.builder} has no export '${entry.export}'`);
    }

    const fixturePath = path.join(repoRoot, entry.fixture);
    const fixture = JSON.parse(fs.readFileSync(fixturePath, "utf8"));

    // Deterministic timestamp: the fixture's own generatedAt. This is the only
    // volatile field in a mixtape_card; fixing it makes the whole document
    // reproducible, so no further normalization is needed.
    const fixedNow = fixture?.metadata?.generatedAt;
    if (!fixedNow) throw new Error(`fixture ${entry.fixture} has no metadata.generatedAt to pin`);

    const input = await adapter(repoRoot);
    const output = build(input, fixedNow);

    // (a) schema
    if (!validate(output)) {
      failures += 1;
      console.error(`✗ ${kind}: builder output fails the card-document schema`);
      console.error(validate.errors);
      continue;
    }

    // (b) fixture deep-equality (order-independent)
    const outJson = JSON.stringify(canonical(output), null, 2);
    const fixJson = JSON.stringify(canonical(fixture), null, 2);
    if (outJson !== fixJson) {
      failures += 1;
      console.error(`✗ ${kind}: builder output differs from ${entry.fixture}`);
      console.error(firstDiff(outJson, fixJson));
      continue;
    }

    console.log(`✓ ${kind}: ${entry.builder} → schema ok, matches ${entry.fixture}`);
  } catch (error) {
    failures += 1;
    console.error(`✗ ${kind}: ${error.message}`);
  }
}

if (failures > 0) {
  console.error(`fixtures:check: ${failures} witness failure(s)`);
  process.exit(1);
}

console.log(`fixtures:check: ${kinds.length} witness(es) verified`);
