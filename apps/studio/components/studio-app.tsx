"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import AccessGate from "./access-gate";
import { assetFromCandidate, assetFromUpload } from "@/lib/assets";
import { getAssets, getSetting, saveAsset, setSetting } from "@/lib/db";
import {
  DEFAULT_MODEL_ID, findModel, IMAGE_MODELS, modelsForRole, resolveModel, supportsRole,
} from "@/lib/models";
import { exportProjectZip, importProjectZip } from "@/lib/portable";
import { useStudioStore } from "@/lib/store";
import { IMAGE_ROLES, layerFor } from "@/lib/template";
import { DEFAULT_TEMPLATE_ID, TEMPLATES, templateFor } from "@/lib/templates";
import type { BlendMode, LayerRole, GenerationCandidate, RightsStatus } from "@/lib/types";
import { validateStudioProject } from "@/lib/validation";

const CardCanvas = dynamic(() => import("./card-canvas"), { ssr: false });

function download(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 500);
}

function defaultPrompt(role: LayerRole) {
  return TEMPLATES[DEFAULT_TEMPLATE_ID].defaultPrompts[role];
}

function Studio() {
  const {
    project, assets, assetUrls, selectedRole, candidate, history, future, hydrated, persistence,
    initialize, dispatch, addAsset, setCandidate, selectRole, undo, redo, reset, replaceFromImport,
  } = useStudioStore();
  const [rights, setRights] = useState<RightsStatus>("unknown");
  const [prompt, setPrompt] = useState(defaultPrompt("emblem"));
  const [instruction, setInstruction] = useState("Keep the composition, but make it quieter and more luminous.");
  const [referenceAssetIds, setReferenceAssetIds] = useState<string[]>([]);
  const [busy, setBusy] = useState("");
  const [notice, setNotice] = useState("");
  const [batch, setBatch] = useState<LayerRole[]>([]);
  const [defaultModelId, setDefaultModelId] = useState<string>(DEFAULT_MODEL_ID);
  const [modelId, setModelId] = useState<string>(DEFAULT_MODEL_ID);
  const [remaining, setRemaining] = useState<number | null>(null);
  const exportPng = useRef<null | (() => Promise<Blob>)>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const zipInput = useRef<HTMLInputElement>(null);

  useEffect(() => { void initialize(); }, [initialize]);
  useEffect(() => { setPrompt(defaultPrompt(selectedRole)); }, [selectedRole]);
  useEffect(() => {
    void (async () => {
      const stored = await getSetting<string>("defaultModelId");
      if (stored && findModel(stored)) { setDefaultModelId(stored); setModelId(stored); }
    })();
    void fetch("/api/access", { cache: "no-store" })
      .then((response) => response.json())
      .then((data) => { if (typeof data.remaining === "number") setRemaining(data.remaining); })
      .catch(() => {});
  }, []);

  const effectiveModel = resolveModel(modelId);
  const roleSupported = supportsRole(effectiveModel, selectedRole);
  const emblemModelId = modelsForRole("emblem")[0]?.id ?? DEFAULT_MODEL_ID;
  const registerExporter = useCallback((fn: () => Promise<Blob>) => { exportPng.current = fn; }, []);
  const selectedLayer = project ? layerFor(project, selectedRole) : undefined;
  const selectedAsset = assets.find((asset) => asset.id === selectedLayer?.assetId);
  const validation = project ? validateStudioProject(project) : null;

  const context = useMemo(() => project ? ({
    message: String(project.card.fields.message.value),
    signature: String(project.card.fields.signature.value),
    templateId: templateFor(project).id,
  }) : null, [project]);

  const requestGeneration = useCallback(async (
    role: LayerRole,
    mode: "generate" | "variant" | "edit" = "generate",
  ) => {
    if (!project || !context) return;
    setBusy(mode === "edit" ? "Editing image…" : `Generating ${role}…`);
    setNotice("");
    try {
      let response: Response;
      if (mode === "edit" || mode === "variant") {
        const source = assets.find((asset) => asset.id === layerFor(project, role)?.assetId);
        if (!source) throw new Error("Choose an image before editing it.");
        const form = new FormData();
        form.set("role", role);
        form.set("instruction", mode === "variant"
          ? `Create a distinct variation of this image for the same ${role} layer. Preserve its core subject and visual language while changing composition and details.`
          : instruction);
        form.set("cardContext", JSON.stringify(context));
        form.set("sourceAssetId", source.id);
        form.set("image", source.blob, `${source.id}.image`);
        form.set("modelId", modelId);
        const references = assets.filter((asset) => referenceAssetIds.includes(asset.id)).slice(0, 3);
        form.set("referenceAssetIds", references.map((asset) => asset.id).join(","));
        references.forEach((asset) => form.append("references", asset.blob, `${asset.id}.image`));
        response = await fetch("/api/images/edit", { method: "POST", body: form });
      } else {
        response = await fetch("/api/images/generate", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ role, prompt: role === selectedRole ? prompt : defaultPrompt(role), cardContext: context, modelId }),
        });
      }
      const body = await response.json();
      if (!response.ok) throw new Error(body.error ?? "Image request failed.");
      if (typeof body.remaining === "number") setRemaining(body.remaining);
      setCandidate(body.candidate as GenerationCandidate);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Image request failed.");
      setBatch([]);
    } finally {
      setBusy("");
    }
  }, [assets, context, instruction, modelId, project, prompt, referenceAssetIds, selectedRole, setCandidate]);

  useEffect(() => {
    if (batch.length && !candidate && !busy) void requestGeneration(batch[0]);
  }, [batch, busy, candidate, requestGeneration]);

  if (!hydrated || !project) return <main className="loading">Restoring your local studio…</main>;

  const template = templateFor(project);

  async function acceptCandidate() {
    if (!candidate) return;
    const asset = assetFromCandidate(candidate);
    await addAsset(asset, candidate.role);
    setCandidate(null);
    if (batch.length) setBatch((items) => items.slice(1));
    setNotice(`${candidate.role} accepted into the local asset library.`);
  }

  function rejectCandidate() {
    const role = candidate?.role;
    setCandidate(null);
    if (batch.length) setBatch((items) => items.slice(1));
    if (role) setNotice(`${role} candidate rejected; it was not saved.`);
  }

  return (
    <main className="studio">
      <header className="topbar">
        <div><p className="eyebrow">Card Commons</p><h1>Card Studio</h1></div>
        <div className="top-actions">
          <span className={`status ${validation?.valid ? "ok" : "bad"}`}>{validation?.valid ? "Valid v0.1.0" : "Needs attention"}</span>
          <span className="save-state">{persistence === "saving" ? "Saving locally…" : persistence === "error" ? "Save blocked" : "Saved locally"}</span>
          {remaining !== null && <span className="save-state" title="Image requests left this session">{remaining} left</span>}
          <button onClick={undo} disabled={!history.length}>Undo</button>
          <button onClick={redo} disabled={!future.length}>Redo</button>
        </div>
      </header>

      <div className="workspace">
        <aside className="panel layers-panel" aria-label="Card content and layers">
          <section>
            <h2>Words</h2>
            <label>Message<textarea value={String(project.card.fields.message.value)}
              onChange={(event) => dispatch({ type: "set-field", field: "message", value: event.target.value })} /></label>
            <label>Signature<input value={String(project.card.fields.signature.value)}
              onChange={(event) => dispatch({ type: "set-field", field: "signature", value: event.target.value })} /></label>
          </section>
          <section>
            <div className="section-heading"><h2>Visual layers</h2>
              <button className="quiet" onClick={() => {
                let missing = IMAGE_ROLES.filter((role) => !layerFor(project, role)?.assetId);
                let skippedEmblem = false;
                if (missing.includes("emblem") && !supportsRole(effectiveModel, "emblem")) {
                  missing = missing.filter((role) => role !== "emblem");
                  skippedEmblem = true;
                }
                if (!missing.length) setNotice(skippedEmblem
                  ? `${effectiveModel.label} cannot make a transparent emblem; switch models to generate it.`
                  : "Every visual layer already has an asset.");
                else {
                  setBatch(missing);
                  if (skippedEmblem) setNotice(`Emblem skipped: ${effectiveModel.label} has no transparency. Switch models for the emblem.`);
                }
              }}>Generate all missing</button>
            </div>
            <div className="layer-list">
              {[...IMAGE_ROLES].reverse().map((role) => {
                const layer = layerFor(project, role)!;
                return (
                  <button key={role} className={selectedRole === role ? "layer active" : "layer"} onClick={() => selectRole(role)}>
                    <span className="layer-swatch">{layer.assetId ? "●" : "○"}</span>
                    <span><strong>{role}</strong><small>{layer.assetId ? "Asset bound" : role === "foreground" ? "Optional" : "Missing"}</small></span>
                    <span aria-label={layer.visible === false ? "hidden" : "visible"}>{layer.visible === false ? "—" : "◉"}</span>
                  </button>
                );
              })}
            </div>
          </section>
          <section>
            <h2>Asset library</h2>
            {assets.length ? <div className="asset-grid">
              {assets.map((asset) => <button key={asset.id} title={`Use as ${selectedRole}`} onClick={() => dispatch({ type: "bind-asset", role: selectedRole, assetId: asset.id })}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={assetUrls[asset.id]} alt={asset.altText} />
              </button>)}
            </div> : <p className="muted">Accepted uploads and generations appear here.</p>}
          </section>
        </aside>

        <section className="canvas-column" aria-label="Card canvas">
          <div className="canvas-viewport">
            <CardCanvas project={project} assetUrls={assetUrls} selectedRole={selectedRole}
              onSelect={selectRole} onCommand={dispatch} onReady={registerExporter} />
          </div>
          <p className="semantic-summary">Preview: {project.card.card.accessibleName}. Visual layers: {
            IMAGE_ROLES.map((role) => `${role} ${layerFor(project, role)?.assetId ? "present" : "empty"}`).join(", ")
          }.</p>
        </section>

        <aside className="panel inspector" aria-label={`${selectedRole} layer inspector`}>
          <section>
            <p className="eyebrow">Selected layer</p><h2 className="role-title">{selectedRole}</h2>
            <label>Upload rights
              <select value={rights} onChange={(event) => setRights(event.target.value as RightsStatus)}>
                <option value="unknown">Unknown</option><option value="owned">I own it</option>
                <option value="licensed">Licensed</option><option value="public_domain">Public domain</option>
              </select>
            </label>
            <input ref={fileInput} className="sr-only" aria-label={`Upload ${selectedRole} image`} type="file" accept="image/png,image/jpeg,image/webp" onChange={async (event) => {
              const file = event.target.files?.[0];
              if (!file) return;
              try { await addAsset(await assetFromUpload(file, selectedRole, rights), selectedRole); setNotice("Upload saved locally."); }
              catch (error) { setNotice(error instanceof Error ? error.message : "Upload failed."); }
              event.target.value = "";
            }} />
            <label>Image model
              <select value={modelId} onChange={(event) => setModelId(event.target.value)}>
                {IMAGE_MODELS.map((model) => (
                  <option key={model.id} value={model.id} disabled={!supportsRole(model, selectedRole)}>
                    {model.label} · {model.costHint}{supportsRole(model, selectedRole) ? "" : " — no transparency"}
                  </option>
                ))}
              </select>
            </label>
            <div className="button-row">
              <button className="quiet" disabled={modelId === defaultModelId}
                onClick={async () => { await setSetting("defaultModelId", modelId); setDefaultModelId(modelId); setNotice(`${effectiveModel.label} set as default model.`); }}>
                Make default
              </button>
            </div>
            {!roleSupported && (
              <p className="model-warning" role="status">
                {effectiveModel.label} cannot render a transparent emblem.{" "}
                <button className="link" onClick={() => setModelId(emblemModelId)}>
                  Switch to {resolveModel(emblemModelId).label}
                </button>
              </p>
            )}
            <div className="button-row">
              <button onClick={() => fileInput.current?.click()}>{selectedAsset ? "Replace" : "Upload"}</button>
              <button onClick={() => void requestGeneration(selectedRole)} disabled={!roleSupported}>Generate</button>
              <button onClick={() => void requestGeneration(selectedRole, "variant")} disabled={!selectedAsset || !roleSupported}>Variant</button>
              <button onClick={() => dispatch({ type: "remove-asset", role: selectedRole })} disabled={!selectedAsset}>Remove</button>
            </div>
            <label>Generation prompt<textarea value={prompt} onChange={(event) => setPrompt(event.target.value)} /></label>
            <label>Edit instruction<textarea value={instruction} onChange={(event) => setInstruction(event.target.value)} /></label>
            {assets.some((asset) => asset.id !== selectedAsset?.id) && (
              <fieldset className="reference-list">
                <legend>Edit references <span>(optional, up to 3)</span></legend>
                {assets.filter((asset) => asset.id !== selectedAsset?.id).map((asset) => (
                  <label className="reference-option" key={asset.id}>
                    <input
                      type="checkbox"
                      checked={referenceAssetIds.includes(asset.id)}
                      disabled={!referenceAssetIds.includes(asset.id) && referenceAssetIds.length >= 3}
                      onChange={(event) => setReferenceAssetIds((ids) =>
                        event.target.checked ? [...ids, asset.id].slice(0, 3) : ids.filter((id) => id !== asset.id))}
                    />
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={assetUrls[asset.id]} alt="" />
                    <span>{asset.role ?? "image"} · {asset.metadata.source}</span>
                  </label>
                ))}
              </fieldset>
            )}
            <button className="wide" onClick={() => void requestGeneration(selectedRole, "edit")} disabled={!selectedAsset || !roleSupported}>Edit current image</button>
          </section>

          <section>
            <h2>Placement</h2>
            <div className="two-col">
              {(["x", "y", "width", "height"] as const).map((key) => <label key={key}>{key}
                <input type="number" min={key === "width" || key === "height" ? 40 : -800} max={1600}
                  value={Math.round(selectedLayer?.box[key] ?? 0)}
                  onChange={(event) => dispatch({ type: "update-layer", role: selectedRole, patch: { box: { [key]: Number(event.target.value) } } })} />
              </label>)}
            </div>
            <label>Opacity <output aria-hidden="true">{Math.round(Number(selectedLayer?.style?.opacity ?? 1) * 100)}%</output>
              <input aria-label="Opacity" type="range" min="0" max="1" step=".05" value={Number(selectedLayer?.style?.opacity ?? 1)}
                onChange={(event) => dispatch({ type: "update-layer", role: selectedRole, patch: { style: { opacity: Number(event.target.value) } } })} />
            </label>
            <div className="two-col">
              {(["cropX", "cropY"] as const).map((key) => <label key={key}>{key === "cropX" ? "Crop X" : "Crop Y"}
                <input type="range" min="0" max="1" step=".05" value={Number(selectedLayer?.style?.[key] ?? .5)}
                  onChange={(event) => dispatch({ type: "update-layer", role: selectedRole, patch: { style: { [key]: Number(event.target.value) } } })} />
              </label>)}
            </div>
            <label>Blend mode<select value={String(selectedLayer?.style?.blendMode ?? "normal")}
              onChange={(event) => dispatch({ type: "update-layer", role: selectedRole, patch: { style: { blendMode: event.target.value as BlendMode } } })}>
              {["normal", "multiply", "screen", "overlay", "soft-light"].map((mode) => <option key={mode}>{mode}</option>)}
            </select></label>
            <label className="check"><input type="checkbox" checked={selectedLayer?.visible !== false}
              onChange={(event) => dispatch({ type: "update-layer", role: selectedRole, patch: { visible: event.target.checked } })} /> Visible</label>
            <div className="button-row">
              <button onClick={() => dispatch({ type: "move-layer", role: selectedRole, direction: "up" })}>Move up</button>
              <button onClick={() => dispatch({ type: "move-layer", role: selectedRole, direction: "down" })}>Move down</button>
            </div>
          </section>

          <section>
            <h2>Portable project</h2>
            <div className="button-row">
              <button onClick={async () => exportPng.current && download(await exportPng.current(), `${template.exportBaseName}.png`)}>Export PNG</button>
              <button onClick={async () => {
                if (!exportPng.current) return;
                download(await exportProjectZip(project, await getAssets(project.assetIds), await exportPng.current()), `${template.exportBaseName}.zip`);
              }}>Export ZIP</button>
              <button onClick={() => zipInput.current?.click()}>Import ZIP</button>
            </div>
            <input ref={zipInput} className="sr-only" aria-label="Import portable ZIP" type="file" accept=".zip,application/zip" onChange={async (event) => {
              const file = event.target.files?.[0];
              if (!file) return;
              try {
                const imported = await importProjectZip(file);
                for (const asset of imported.assets) await saveAsset(asset);
                await replaceFromImport(imported.project, imported.assets);
                setNotice("Portable project imported.");
              } catch (error) { setNotice(error instanceof Error ? error.message : "Import failed."); }
              event.target.value = "";
            }} />
            <button className="danger wide" onClick={() => { if (confirm("Reset this local project and remove its assets?")) void reset(); }}>Reset local project</button>
          </section>
        </aside>
      </div>

      {(busy || notice || batch.length > 0) && <div className="toast" role="status">
        {busy || notice || (batch.length ? `Batch: ${batch.length} layer${batch.length === 1 ? "" : "s"} remaining` : "")}
      </div>}

      {candidate && <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="candidate-title">
        <div className="candidate-card">
          <p className="eyebrow">Review before saving</p><h2 id="candidate-title">{candidate.role} candidate</h2>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={`data:${candidate.mimeType};base64,${candidate.encoded}`} alt={`Generated ${candidate.role} candidate`} />
          <p>Rejecting leaves no project or asset record. Accepting adds provenance and creates an undoable snapshot.</p>
          <details><summary>Provenance</summary><pre>{JSON.stringify(candidate.provenance, null, 2)}</pre></details>
          <div className="button-row end"><button className="quiet" onClick={rejectCandidate}>Reject</button><button onClick={() => void acceptCandidate()}>Accept candidate</button></div>
        </div>
      </div>}
    </main>
  );
}

export default function StudioApp() {
  return <AccessGate><Studio /></AccessGate>;
}
