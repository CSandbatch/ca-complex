import { openDB, type DBSchema } from "idb";
import type { AssetRecord, StudioProject } from "./types";

interface StudioDatabase extends DBSchema {
  projects: { key: string; value: StudioProject };
  assets: { key: string; value: AssetRecord };
  settings: { key: string; value: unknown };
}

const DB_NAME = "card-commons-studio";
const PROJECT_KEY = "current";

function db() {
  return openDB<StudioDatabase>(DB_NAME, 1, {
    upgrade(database) {
      database.createObjectStore("projects");
      database.createObjectStore("assets", { keyPath: "id" });
      database.createObjectStore("settings");
    },
  });
}

export async function saveProject(project: StudioProject) {
  return (await db()).put("projects", structuredClone(project), PROJECT_KEY);
}

export async function loadProject() {
  return (await db()).get("projects", PROJECT_KEY);
}

export async function saveAsset(asset: AssetRecord) {
  return (await db()).put("assets", asset);
}

export async function getAsset(id: string) {
  return (await db()).get("assets", id);
}

export async function getAssets(ids?: string[]) {
  const all = await (await db()).getAll("assets");
  return ids ? all.filter((asset) => ids.includes(asset.id)) : all;
}

export async function getSetting<T>(key: string): Promise<T | undefined> {
  return (await db()).get("settings", key) as Promise<T | undefined>;
}

export async function setSetting(key: string, value: unknown) {
  return (await db()).put("settings", value, key);
}

export async function clearStudio() {
  const database = await db();
  const transaction = database.transaction(["projects", "assets"], "readwrite");
  await Promise.all([transaction.objectStore("projects").clear(), transaction.objectStore("assets").clear()]);
  await transaction.done;
}
