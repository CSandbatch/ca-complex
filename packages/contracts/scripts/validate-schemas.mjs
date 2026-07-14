import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";

// scripts/ sits inside packages/contracts; the package root is one level up.
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const schemasDir = path.join(root, "schemas");
const examplesDir = path.join(root, "examples");
const ajv = new Ajv2020({ allErrors: true, strict: true });
addFormats(ajv);

for (const name of fs.readdirSync(schemasDir).filter((file) => file.endsWith(".json"))) {
  const schema = JSON.parse(fs.readFileSync(path.join(schemasDir, name), "utf8"));
  ajv.addSchema(schema);
}

const validate = ajv.getSchema("https://cardcommons.org/schemas/card-document.schema.json");
if (!validate) throw new Error("CardDocument schema was not registered.");

let failures = 0;

for (const expectation of ["valid", "invalid"]) {
  const directory = path.join(examplesDir, expectation);
  for (const name of fs.readdirSync(directory).filter((file) => file.endsWith(".json"))) {
    const document = JSON.parse(fs.readFileSync(path.join(directory, name), "utf8"));
    const result = validate(document);
    const expected = expectation === "valid";
    if (result !== expected) {
      failures += 1;
      console.error(`${expectation}/${name}: expected ${expected}, received ${result}`);
      console.error(validate.errors);
    } else {
      console.log(`✓ ${expectation}/${name}`);
    }
  }
}

if (failures > 0) process.exit(1);

