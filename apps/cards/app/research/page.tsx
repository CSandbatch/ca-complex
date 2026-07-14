import { MarkdownView } from "@/components/markdown-view";
import { getResearchDocument } from "@/lib/content";

export const metadata = { title: "Research and evidence" };

export default function ResearchPage() {
  const claims = getResearchDocument("claims");
  const sources = getResearchDocument("sources");
  return (
    <main className="document-shell research-shell">
      <header className="document-title">
        <p className="eyebrow">Evidence before scale</p>
        <h1>Claims with receipts.<br />Hypotheses with labels.</h1>
        <p>
          Product capability claims use primary sources. Demand, pricing, and
          market assertions remain hypotheses until research supports them.
        </p>
      </header>
      <MarkdownView content={claims.content} />
      <MarkdownView content={sources.content} />
    </main>
  );
}

