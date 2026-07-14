import Link from "next/link";

const objectParts = [
  ["01", "Identity", "A stable card survives every revision and context."],
  ["02", "Meaning", "Typed fields carry content, mechanics, sources, and accessibility."],
  ["03", "Appearance", "Bound layers and surfaces express the card without flattening it."],
  ["04", "Context", "Memberships, publications, games, and remixes add behavior."]
] as const;

const loops = [
  ["Make", "Choose a kind. Fill the fields. Shape a bounded surface."],
  ["Stack", "Arrange cards in a deck, collection, series, or game."],
  ["Publish / play", "Pin a revision to a URL or instantiate it in a session."],
  ["Remix", "Fork the object and preserve its source."]
] as const;

export default function HomePage() {
  return (
    <main>
      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">An open product + protocol proposal</p>
          <h1>Make a card,<br />not a website.</h1>
          <p className="hero-lede">
            Card Commons is a smaller creative primitive for the web: portable,
            editable, publishable, and playable.
          </p>
          <div className="hero-actions">
            <Link className="button" href="/deck/01">Present the idea <span>→</span></Link>
            <Link className="text-link" href="/whitepaper">Read the whitepaper</Link>
          </div>
        </div>
        <div className="hero-stage" aria-label="Three overlapping conceptual cards">
          <div className="hero-card hero-card-one">
            <span className="card-label">PUBLIC / 01</span>
            <strong>A web object<br />with a point of view.</strong>
            <span className="card-foot">stable URL ↗</span>
          </div>
          <div className="hero-card hero-card-two">
            <span className="card-label">GAME / 02</span>
            <strong>The website<br />was replaced by ____.</strong>
            <span className="card-foot">pick 1</span>
          </div>
          <div className="hero-card hero-card-three">
            <span className="card-label">ACTION / 03</span>
            <strong>PASS</strong>
            <span className="card-foot">playable</span>
          </div>
        </div>
      </section>

      <section className="thesis-band" aria-labelledby="thesis-title">
        <p className="eyebrow">The invariant</p>
        <h2 id="thesis-title">A card is a portable, editable,<br />publishable, playable web object.</h2>
        <p>
          Not a screenshot. Not a mini page. A structured object that can move
          among design, publication, collection, play, and remix.
        </p>
      </section>

      <section className="object-section">
        <div className="section-intro">
          <p className="eyebrow">The object</p>
          <h2>One source.<br />Many contexts.</h2>
          <p>
            Meaning and appearance stay connected without becoming the same
            thing. That is the hinge.
          </p>
        </div>
        <div className="object-grid">
          {objectParts.map(([number, title, description]) => (
            <article key={number}>
              <span>{number}</span>
              <h3>{title}</h3>
              <p>{description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="loop-section">
        <div className="loop-heading">
          <p className="eyebrow">The core loop</p>
          <h2>The card earns its place by moving.</h2>
        </div>
        <ol className="loop-list">
          {loops.map(([title, description], index) => (
            <li key={title}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <div>
                <h3>{title}</h3>
                <p>{description}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="proof-section">
        <div>
          <p className="eyebrow">Version 0.1</p>
          <h2>Concrete enough to build.<br />Open enough to test.</h2>
        </div>
        <div className="proof-copy">
          <p>
            Nine engineering specifications, JSON Schema contracts, valid and
            invalid fixtures, an OpenAPI surface, and an evidence-led MVP plan.
          </p>
          <p>
            And a working Card Studio: it creates the first card type today—with
            AI image generation verified live across six models. It is deployed
            and running now as a gated pilot, while the rest of the loop is still
            being built.
          </p>
          <div className="proof-actions">
            <Link className="button button-dark" href="/specs">Open the specs <span>→</span></Link>
            <Link className="text-link" href="/research">Inspect the evidence</Link>
          </div>
        </div>
      </section>

      <section className="closing-call">
        <p className="eyebrow">The invitation</p>
        <h2>Make one card.<br />Put it somewhere.<br />Move it again.</h2>
        <Link className="button" href="/participate">Build with us <span>↗</span></Link>
      </section>
    </main>
  );
}

