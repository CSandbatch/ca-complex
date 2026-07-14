import { describe, expect, it } from "vitest";
import { slidePath, slides } from "../../lib/slides";

describe("pitch deck", () => {
  it("contains the required fourteen unique slides", () => {
    expect(slides).toHaveLength(14);
    expect(new Set(slides.map((slide) => slide.number)).size).toBe(14);
    expect(slides.map((slide) => slide.number)).toEqual(
      Array.from({ length: 14 }, (_, index) => index + 1)
    );
  });

  it("creates zero-padded deep-link paths", () => {
    expect(slidePath(1)).toBe("/deck/01");
    expect(slidePath(14)).toBe("/deck/14");
  });

  it("labels commercial statements as hypotheses", () => {
    const roadmap = slides.find((slide) => slide.number === 13);
    expect(roadmap?.body.toLowerCase()).toContain("hypotheses");
  });
});

