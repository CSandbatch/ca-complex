import { callingCardTemplate } from "./template";
import type { CardField, CardKind, LayerRole, StudioProject } from "./types";

// A CardTemplate is one concrete card the Studio can create and edit. The Studio
// core is template-agnostic; everything specific to a kind of card — how it
// bootstraps, how its identity strings read, which image roles it exposes, and
// the default generation prompts — lives behind this interface. Calling card is
// the first entry; more kinds slot in without touching the editor core.
export interface CardTemplate {
  /** Stable id recorded in card metadata.templateId. */
  id: string;
  /** The card-document kind this template produces. */
  kind: CardKind;
  /** Human label for the template (used in headings and menus). */
  label: string;
  /** Base filename for exports, e.g. "calling-card" → calling-card.png/.zip. */
  exportBaseName: string;
  /** Builds a fresh, schema-valid project for this template. */
  create(now?: string): StudioProject;
  /** Derives accessibleName + title from the card's fields. */
  identity(fields: Record<string, CardField>): { accessibleName: string; title: string };
  /** Image layer roles this template exposes, back to front. */
  imageRoles: LayerRole[];
  /** Default generation prompts, keyed by image role. */
  defaultPrompts: Record<LayerRole, string>;
}

export const DEFAULT_TEMPLATE_ID = "calling-card-nocturne-v1";

export const TEMPLATES: Record<string, CardTemplate> = {
  [callingCardTemplate.id]: callingCardTemplate,
};

/** Resolve the template for a project by metadata.templateId, falling back to
 *  the default when the id is missing or unknown. */
export function templateFor(project: StudioProject): CardTemplate {
  const id = String(project.card.metadata.templateId ?? "");
  return TEMPLATES[id] ?? TEMPLATES[DEFAULT_TEMPLATE_ID];
}
