import fs from "node:fs";
import path from "node:path";

const output = path.resolve(import.meta.dirname, "..", "out");
const required = [
  "index.html",
  path.join("deck", "01", "index.html"),
  path.join("deck", "14", "index.html"),
  path.join("specs", "index.html"),
  path.join("whitepaper", "index.html"),
  path.join("research", "index.html"),
  path.join("participate", "index.html")
];

for (const relative of required) {
  const target = path.join(output, relative);
  if (!fs.existsSync(target) || fs.statSync(target).size === 0) {
    throw new Error(`Missing static route: ${relative}`);
  }
}

console.log(`✓ verified ${required.length} static routes`);
