import Link from "next/link";
import { getAllSpecs } from "@/lib/content";

export const metadata = { title: "Specifications" };

export default function SpecsPage() {
  const specs = getAllSpecs();
  return (
    <main className="index-page">
      <header className="index-hero">
        <p className="eyebrow">Engineering handoff</p>
        <h1>Nine documents.<br />One card model.</h1>
        <p>
          Product, protocol, architecture, interaction, behavior, generation,
          delivery, and research—kept canonical in Markdown.
        </p>
      </header>
      <ol className="document-index">
        {specs.map((spec, index) => (
          <li key={spec.slug}>
            <Link href={`/specs/${spec.slug}`}>
              <span>{String(index).padStart(2, "0")}</span>
              <div>
                <h2>{spec.title}</h2>
                <p>{spec.description}</p>
              </div>
              <b aria-hidden="true">↗</b>
            </Link>
          </li>
        ))}
      </ol>
      <aside className="contract-callout">
        <div>
          <p className="eyebrow">Machine-readable</p>
          <h2>The prose has teeth.</h2>
        </div>
        <p>
          The repository includes JSON Schema 2020-12 contracts, five valid and
          five invalid card fixtures, and an OpenAPI 3.1 service contract.
        </p>
        <a href="https://github.com/CSandbatch/ca-complex/tree/main/packages/contracts">
          Browse contracts →
        </a>
      </aside>
    </main>
  );
}

