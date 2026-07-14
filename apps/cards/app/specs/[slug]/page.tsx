import type { Metadata } from "next";
import { DocumentShell } from "@/components/document-shell";
import { getSpec, specFiles } from "@/lib/content";

export function generateStaticParams() {
  return specFiles.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const spec = getSpec(slug);
  return { title: spec.title, description: spec.description };
}

export default async function SpecPage({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return (
    <DocumentShell
      document={getSpec(slug)}
      eyebrow="Card Commons specification · v0.1"
      backHref="/specs"
      backLabel="All specifications"
    />
  );
}

