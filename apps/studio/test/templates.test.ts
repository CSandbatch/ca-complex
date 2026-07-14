import { describe, expect, it } from "vitest";
import { DEFAULT_TEMPLATE_ID, TEMPLATES, templateFor } from "@/lib/templates";
import { validateStudioProject } from "@/lib/validation";

describe("card template registry", () => {
  it("is internally consistent", () => {
    expect(Object.keys(TEMPLATES).length).toBeGreaterThan(0);
    expect(TEMPLATES[DEFAULT_TEMPLATE_ID]).toBeDefined();
    for (const [id, template] of Object.entries(TEMPLATES)) {
      expect(template.id).toBe(id);
      expect(template.label.length).toBeGreaterThan(0);
      expect(template.exportBaseName.length).toBeGreaterThan(0);
      expect(template.imageRoles.length).toBeGreaterThan(0);
      for (const role of template.imageRoles) {
        expect(typeof template.defaultPrompts[role]).toBe("string");
      }
    }
  });

  it("creates a schema-valid v0.1.0 project for every template", () => {
    for (const template of Object.values(TEMPLATES)) {
      const project = template.create("2026-01-01T00:00:00.000Z");
      expect(validateStudioProject(project).valid).toBe(true);
      expect(project.card.card.kind).toBe(template.kind);
      expect(project.card.metadata.templateId).toBe(template.id);
    }
  });

  it("exposes calling-card as the default with exportBaseName calling-card", () => {
    const template = TEMPLATES[DEFAULT_TEMPLATE_ID];
    expect(template.id).toBe("calling-card-nocturne-v1");
    expect(template.kind).toBe("calling_card");
    expect(template.exportBaseName).toBe("calling-card");
  });

  it("resolves by metadata.templateId and falls back to the default", () => {
    const known = TEMPLATES[DEFAULT_TEMPLATE_ID].create();
    expect(templateFor(known).id).toBe(DEFAULT_TEMPLATE_ID);
    known.card.metadata.templateId = "unknown-template-id";
    expect(templateFor(known).id).toBe(DEFAULT_TEMPLATE_ID);
  });
});
