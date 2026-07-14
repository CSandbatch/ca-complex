"use client";

import { useEffect, useState } from "react";

export default function AccessGate({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<"locked" | "open">("locked");
  const [passcode, setPasscode] = useState("");
  const [error, setError] = useState("");
  useEffect(() => {
    fetch("/api/access", { cache: "no-store" })
      .then((response) => response.ok ? response.json() : { authenticated: false })
      .then((data) => setStatus(data.authenticated ? "open" : "locked"))
      .catch(() => setStatus("locked"));
  }, []);
  if (status === "open") return <>{children}</>;
  return (
    <main className="gate">
      <form
        className="gate-card"
        onSubmit={async (event) => {
          event.preventDefault();
          setError("");
          const response = await fetch("/api/access", {
            method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ passcode }),
          });
          if (response.ok) setStatus("open");
          else setError("That passcode did not open the pilot.");
        }}
      >
        <p className="eyebrow">Private pilot</p>
        <h1>Enter Card Commons Studio</h1>
        <p>Your card and accepted assets stay in this browser. Image generation is the only server-backed action.</p>
        <label>Passcode<input type="password" value={passcode} onChange={(event) => setPasscode(event.target.value)} required /></label>
        {error && <p className="error" role="alert">{error}</p>}
        <button type="submit">Enter studio</button>
      </form>
    </main>
  );
}
