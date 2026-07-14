import { IMAGE_ROLES, layerFor } from "./template";
import { templateFor } from "./templates";
import type { EditorCommand, StudioProject } from "./types";

function copy(project: StudioProject): StudioProject {
  return structuredClone(project);
}

export function applyCommand(project: StudioProject, command: EditorCommand, now = new Date().toISOString()): StudioProject {
  const next = copy(project);
  const surface = next.card.surfaces[0];
  if (command.type === "set-field") {
    next.card.fields[command.field].value = command.value;
    const identity = templateFor(next).identity(next.card.fields);
    next.card.card.accessibleName = identity.accessibleName;
    next.card.card.title = identity.title;
  } else if (command.type === "bind-asset") {
    const layer = layerFor(next, command.role);
    if (!layer) throw new Error(`Unknown layer: ${command.role}`);
    layer.assetId = command.assetId;
    next.card.fields[`${command.role}Asset`].value = command.assetId;
    if (!next.assetIds.includes(command.assetId)) next.assetIds.push(command.assetId);
    const existing = next.card.assets.find((asset) => asset.role === command.role);
    if (existing) existing.assetId = command.assetId;
    else next.card.assets.push({ assetId: command.assetId, role: command.role });
  } else if (command.type === "remove-asset") {
    const layer = layerFor(next, command.role);
    if (!layer) throw new Error(`Unknown layer: ${command.role}`);
    delete layer.assetId;
    next.card.fields[`${command.role}Asset`].value = "";
    next.card.assets = next.card.assets.filter((asset) => asset.role !== command.role);
  } else if (command.type === "update-layer") {
    const layer = layerFor(next, command.role);
    if (!layer) throw new Error(`Unknown layer: ${command.role}`);
    if ("box" in command.patch) layer.box = { ...layer.box, ...(command.patch.box as object) };
    if ("style" in command.patch) layer.style = { ...layer.style, ...(command.patch.style as object) };
    if ("visible" in command.patch) layer.visible = Boolean(command.patch.visible);
  } else if (command.type === "move-layer") {
    const roleOrder = surface.layers
      .filter((layer) => IMAGE_ROLES.includes(layer.style?.role as never))
      .map((layer) => layer.style?.role as typeof command.role);
    const current = roleOrder.indexOf(command.role);
    const target = command.direction === "up" ? current + 1 : current - 1;
    if (target >= 0 && target < roleOrder.length) {
      const a = surface.layers.findIndex((layer) => layer.style?.role === roleOrder[current]);
      const b = surface.layers.findIndex((layer) => layer.style?.role === roleOrder[target]);
      [surface.layers[a], surface.layers[b]] = [surface.layers[b], surface.layers[a]];
    }
  }
  next.updatedAt = now;
  return next;
}

export function collectReferencedAssetIds(project: StudioProject): string[] {
  return [...new Set(project.card.assets.map((entry) => entry.assetId))];
}
