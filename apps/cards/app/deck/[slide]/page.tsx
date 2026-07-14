import { notFound } from "next/navigation";
import { Deck } from "@/components/deck";
import { slides } from "@/lib/slides";

export function generateStaticParams() {
  return slides.map((slide) => ({
    slide: String(slide.number).padStart(2, "0")
  }));
}

export default async function DeckSlidePage({
  params
}: {
  params: Promise<{ slide: string }>;
}) {
  const { slide: slideParam } = await params;
  const number = Number(slideParam);
  const slide = slides.find((item) => item.number === number);
  if (!slide) notFound();
  return <Deck slide={slide} />;
}

