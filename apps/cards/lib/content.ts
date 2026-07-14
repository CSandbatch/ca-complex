import fs from "node:fs";
import path from "node:path";

export type DocumentRecord = {
  slug: string;
  title: string;
  description: string;
  content: string;
};

// apps/cards runs from its workspace dir; canonical prose (docs/, whitepaper/,
// research/) lives at the ca-complex monorepo root, two levels up.
const repositoryRoot = path.resolve(process.cwd(), "..", "..");

export const specFiles = [
  "00-executive-brief",
  "01-product-requirements",
  "02-card-protocol-and-domain-model",
  "03-system-architecture",
  "04-ux-and-interaction-spec",
  "05-publishing-games-and-remixing",
  "06-ai-assets-and-provenance",
  "07-mvp-delivery-plan",
  "08-research-and-business-hypotheses"
] as const;

function readCanonical(relativePath: string, slug: string): DocumentRecord {
  const source = fs.readFileSync(
    path.join(
      /* turbopackIgnore: true */
      repositoryRoot,
      relativePath
    ),
    "utf8"
  );
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  const metadata = Object.fromEntries(
    (match?.[1] ?? "")
      .split(/\r?\n/)
      .map((line) => line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/))
      .filter((entry): entry is RegExpMatchArray => Boolean(entry))
      .map((entry) => [entry[1], entry[2].replace(/^["']|["']$/g, "")])
  );
  return {
    slug,
    title: String(metadata.title ?? slug),
    description: String(metadata.description ?? ""),
    content: match?.[2] ?? source
  };
}

export function getSpec(slug: string): DocumentRecord {
  if (!specFiles.includes(slug as (typeof specFiles)[number])) {
    throw new Error(`Unknown specification: ${slug}`);
  }
  return readCanonical(path.join("docs", `${slug}.md`), slug);
}

export function getAllSpecs(): DocumentRecord[] {
  return specFiles.map(getSpec);
}

export function getWhitepaper(): DocumentRecord {
  return readCanonical(
    path.join("whitepaper", "card-commons.md"),
    "card-commons"
  );
}

export function getResearchDocument(name: "claims" | "sources"): DocumentRecord {
  return readCanonical(path.join("research", `${name}.md`), name);
}
