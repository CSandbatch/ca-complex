import Link from "next/link";

export default function NotFound() {
  return (
    <main className="not-found">
      <p className="eyebrow">404 · card not found</p>
      <h1>This object is not in the stack.</h1>
      <Link className="button" href="/">Return home →</Link>
    </main>
  );
}

