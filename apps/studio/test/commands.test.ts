import { describe, expect, it } from "vitest";
import { applyCommand, collectReferencedAssetIds } from "@/lib/commands";
import { createCallingCardProject, layerFor } from "@/lib/template";
import { validateStudioProject } from "@/lib/validation";

describe("calling-card commands", () => {
  it("creates a schema-valid v0.1.0 project", () => {
    const project = createCallingCardProject("2026-01-01T00:00:00.000Z");
    expect(validateStudioProject(project)).toMatchObject({ valid: true });
    expect(project.card.metadata.templateId).toBe("calling-card-nocturne-v1");
  });

  it("updates text and its semantic summary", () => {
    const project = applyCommand(createCallingCardProject(), { type: "set-field", field: "message", value: "Come find me." });
    expect(project.card.fields.message.value).toBe("Come find me.");
    expect(project.card.card.accessibleName).toContain("Come find me.");
    expect(validateStudioProject(project).valid).toBe(true);
  });

  it("falls back to the default template's identity for an unknown templateId", () => {
    const base = createCallingCardProject();
    base.card.metadata.templateId = "does-not-exist";
    const project = applyCommand(base, { type: "set-field", field: "message", value: "Signal received." });
    expect(project.card.card.accessibleName).toBe("Calling card: Signal received., signed Your name");
    expect(project.card.card.title).toBe("Signal received.");
  });

  it("binds, reuses, transforms, and removes stable assets", () => {
    let project = createCallingCardProject();
    project = applyCommand(project, { type: "bind-asset", role: "background", assetId: "asset-one" });
    project = applyCommand(project, { type: "bind-asset", role: "emblem", assetId: "asset-one" });
    expect(collectReferencedAssetIds(project)).toEqual(["asset-one"]);
    project = applyCommand(project, {
      type: "update-layer", role: "emblem",
      patch: { box: { x: 101, width: 280 }, style: { opacity: 0.55, cropX: 0.2 } },
    });
    expect(layerFor(project, "emblem")?.box).toMatchObject({ x: 101, width: 280 });
    expect(layerFor(project, "emblem")?.style).toMatchObject({ opacity: 0.55, cropX: 0.2 });
    project = applyCommand(project, { type: "remove-asset", role: "emblem" });
    expect(layerFor(project, "emblem")?.assetId).toBeUndefined();
    expect(layerFor(project, "background")?.assetId).toBe("asset-one");
  });

  it("only reorders image layers within their constrained band", () => {
    const project = createCallingCardProject();
    const moved = applyCommand(project, { type: "move-layer", role: "foreground", direction: "up" });
    const roles = moved.card.surfaces[0].layers.map((layer) => layer.style?.role).filter(Boolean);
    expect(roles).toEqual(["background", "texture", "emblem", "foreground"]);
    expect(moved.card.surfaces[0].layers.at(-1)?.id).toBe("layer-border");
  });
});
