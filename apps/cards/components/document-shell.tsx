import Link from "next/link";
import type { DocumentRecord } from "@/lib/content";
import { MarkdownView } from "./markdown-view";

export function DocumentShell({
  document,
  eyebrow,
  backHref,
  backLabel
}: {
  document: DocumentRecord;
  eyebrow: string;
  backHref?: string;
  backLabel?: string;
}) {
  return (
    <main className="document-shell">
      <header className="document-title">
        <p className="eyebrow">{eyebrow}</p>
        <h1>{document.title}</h1>
        <p>{document.description}</p>
        {backHref && <Link className="text-link" href={backHref}>← {backLabel}</Link>}
      </header>
      <MarkdownView content={document.content} />
    </main>
  );
}

