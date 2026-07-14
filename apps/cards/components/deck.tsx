"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { slidePath, slides, type Slide } from "@/lib/slides";

function CardStackVisual({ slide }: { slide: Slide }) {
  return (
    <div className={`deck-visual visual-${slide.type}`} aria-hidden="true">
      <div className="visual-orbit orbit-one" />
      <div className="visual-orbit orbit-two" />
      <div className="visual-card card-a"><span>meaning</span></div>
      <div className="visual-card card-b"><span>surface</span></div>
      <div className="visual-card card-c"><span>context</span></div>
      <div className="visual-index">{String(slide.number).padStart(2, "0")}</div>
    </div>
  );
}

export function Deck({ slide }: { slide: Slide }) {
  const router = useRouter();
  const previous = slide.number > 1 ? slidePath(slide.number - 1) : undefined;
  const next = slide.number < slides.length ? slidePath(slide.number + 1) : undefined;

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (["ArrowRight", "PageDown", " "].includes(event.key) && next) {
        event.preventDefault();
        router.push(next);
      }
      if (["ArrowLeft", "PageUp"].includes(event.key) && previous) {
        event.preventDefault();
        router.push(previous);
      }
      if (event.key === "Home") router.push(slidePath(1));
      if (event.key === "End") router.push(slidePath(slides.length));
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [next, previous, router]);

  return (
    <main
      className="deck-shell"
      role="region"
      aria-roledescription="carousel"
      aria-label="Card Commons pitch deck"
    >
      <div className="deck-topline">
        <Link className="deck-brand" href="/">Card Commons</Link>
        <p aria-live="polite">Slide {slide.number} of {slides.length}</p>
        <Link href="/specs">Read the specifications</Link>
      </div>
      <article
        className="deck-slide"
        aria-roledescription="slide"
        aria-label={`${slide.number} of ${slides.length}: ${slide.title}`}
      >
        <div className="deck-copy">
          <p className="eyebrow">{slide.kicker}</p>
          <h1>{slide.title}</h1>
          <p className="deck-body">{slide.body}</p>
          {slide.points && (
            <ul className={`deck-points points-${slide.type}`}>
              {slide.points.map((point, index) => (
                <li key={point}>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  {point}
                </li>
              ))}
            </ul>
          )}
          {slide.note && <p className="deck-note">{slide.note}</p>}
        </div>
        <CardStackVisual slide={slide} />
      </article>
      <nav className="deck-controls" aria-label="Slide controls">
        {previous ? (
          <Link className="deck-arrow" href={previous} aria-label="Previous slide">←</Link>
        ) : (
          <span className="deck-arrow disabled" aria-hidden="true">←</span>
        )}
        <div className="deck-progress" aria-hidden="true">
          <span style={{ width: `${(slide.number / slides.length) * 100}%` }} />
        </div>
        {next ? (
          <Link className="deck-arrow" href={next} aria-label="Next slide">→</Link>
        ) : (
          <Link className="deck-arrow" href="/participate" aria-label="Participate">↗</Link>
        )}
      </nav>
      <p className="deck-help">Arrow keys · space · home · end</p>
    </main>
  );
}

