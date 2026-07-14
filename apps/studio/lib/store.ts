"use client";

import { create } from "zustand";
import { applyCommand } from "./commands";
import { clearStudio, getAssets, loadProject, saveAsset, saveProject } from "./db";
import { DEFAULT_TEMPLATE_ID, TEMPLATES } from "./templates";
import { validateStudioProject } from "./validation";

function bootstrapProject(): StudioProject {
  return TEMPLATES[DEFAULT_TEMPLATE_ID].create();
}
import type { AssetRecord, LayerRole, EditorCommand, GenerationCandidate, StudioProject } from "./types";

interface StudioState {
  project: StudioProject | null;
  assets: AssetRecord[];
  assetUrls: Record<string, string>;
  selectedRole: LayerRole;
  candidate: GenerationCandidate | null;
  history: StudioProject[];
  future: StudioProject[];
  hydrated: boolean;
  persistence: "idle" | "saving" | "saved" | "error";
  initialize: () => Promise<void>;
  dispatch: (command: EditorCommand) => void;
  addAsset: (asset: AssetRecord, role?: LayerRole) => Promise<void>;
  setCandidate: (candidate: GenerationCandidate | null) => void;
  selectRole: (role: LayerRole) => void;
  undo: () => void;
  redo: () => void;
  reset: () => Promise<void>;
  replaceFromImport: (project: StudioProject, assets: AssetRecord[]) => Promise<void>;
}

let saveTimer: ReturnType<typeof setTimeout> | undefined;
let urls: string[] = [];

function makeUrls(assets: AssetRecord[]) {
  urls.forEach(URL.revokeObjectURL);
  const entries = assets.map((asset) => [asset.id, URL.createObjectURL(asset.blob)]);
  urls = entries.map(([, url]) => url);
  return Object.fromEntries(entries);
}

function schedule(project: StudioProject, set: (state: Partial<StudioState>) => void) {
  if (!validateStudioProject(project).valid) {
    set({ persistence: "error" });
    return;
  }
  set({ persistence: "saving" });
  clearTimeout(saveTimer);
  saveTimer = setTimeout(async () => {
    try {
      await saveProject(project);
      set({ persistence: "saved" });
    } catch {
      set({ persistence: "error" });
    }
  }, 450);
}

export const useStudioStore = create<StudioState>((set, get) => ({
  project: null,
  assets: [],
  assetUrls: {},
  selectedRole: "emblem",
  candidate: null,
  history: [],
  future: [],
  hydrated: false,
  persistence: "idle",
  initialize: async () => {
    const project = (await loadProject()) ?? bootstrapProject();
    const assets = await getAssets(project.assetIds);
    set({ project, assets, assetUrls: makeUrls(assets), hydrated: true, persistence: "saved" });
    if (!(await loadProject())) await saveProject(project);
  },
  dispatch: (command) => {
    const current = get().project;
    if (!current) return;
    const project = applyCommand(current, command);
    set((state) => ({ project, history: [...state.history.slice(-49), current], future: [] }));
    schedule(project, set);
  },
  addAsset: async (asset, role) => {
    await saveAsset(asset);
    const assets = [...get().assets.filter((item) => item.id !== asset.id), asset];
    set({ assets, assetUrls: makeUrls(assets) });
    if (role) get().dispatch({ type: "bind-asset", role, assetId: asset.id });
  },
  setCandidate: (candidate) => set({ candidate }),
  selectRole: (selectedRole) => set({ selectedRole }),
  undo: () => {
    const { project, history, future } = get();
    if (!project || !history.length) return;
    const previous = history.at(-1)!;
    set({ project: previous, history: history.slice(0, -1), future: [project, ...future] });
    schedule(previous, set);
  },
  redo: () => {
    const { project, history, future } = get();
    if (!project || !future.length) return;
    const next = future[0];
    set({ project: next, history: [...history, project], future: future.slice(1) });
    schedule(next, set);
  },
  reset: async () => {
    await clearStudio();
    const project = bootstrapProject();
    await saveProject(project);
    set({ project, assets: [], assetUrls: makeUrls([]), history: [], future: [], candidate: null, persistence: "saved" });
  },
  replaceFromImport: async (project, assets) => {
    await clearStudio();
    for (const asset of assets) await saveAsset(asset);
    await saveProject(project);
    set({ project, assets, assetUrls: makeUrls(assets), history: [], future: [], candidate: null, persistence: "saved" });
  },
}));
