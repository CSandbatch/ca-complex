"use client";

import { useEffect, useId, useState } from "react";

export function MermaidDiagram({ chart }: { chart: string }) {
  const reactId = useId();
  const [svg, setSvg] = useState<string>("");
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;
    import("mermaid").then(async ({ default: mermaid }) => {
      mermaid.initialize({
        startOnLoad: false,
        theme: "base",
        securityLevel: "strict",
        themeVariables: {
          primaryColor: "#f0ff70",
          primaryTextColor: "#151412",
          primaryBorderColor: "#151412",
          lineColor: "#ef5b3f",
          secondaryColor: "#d9e8ff",
          tertiaryColor: "#fffaf0",
          fontFamily: "Arial, sans-serif"
        }
      });
      try {
        const id = `mermaid-${reactId.replace(/[^a-zA-Z0-9]/g, "")}`;
        const rendered = await mermaid.render(id, chart);
        if (active) setSvg(rendered.svg);
      } catch {
        if (active) setError(true);
      }
    });
    return () => {
      active = false;
    };
  }, [chart, reactId]);

  if (error) {
    return <pre className="diagram-fallback"><code>{chart}</code></pre>;
  }
  if (!svg) {
    return <div className="diagram-loading" aria-label="Diagram loading" />;
  }
  return (
    <figure
      className="mermaid-diagram"
      aria-label="Diagram"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}

