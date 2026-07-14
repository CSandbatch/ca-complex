import { DocumentShell } from "@/components/document-shell";
import { getWhitepaper } from "@/lib/content";

export const metadata = {
  title: "Whitepaper",
  description: "A product and protocol thesis for card-native web objects."
};

export default function WhitepaperPage() {
  return (
    <DocumentShell
      document={getWhitepaper()}
      eyebrow="Whitepaper · proposal · v0.1"
    />
  );
}

