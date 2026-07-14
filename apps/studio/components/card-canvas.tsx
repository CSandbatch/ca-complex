"use client";

import { useEffect, useMemo, useRef } from "react";
import { Group, Image as KonvaImage, Layer, Rect, Stage, Text, Transformer } from "react-konva";
import type Konva from "konva";
import useImage from "use-image";
import { CANVAS, layerFor } from "@/lib/template";
import type { CardLayer, LayerRole, EditorCommand, StudioProject } from "@/lib/types";

interface Props {
  project: StudioProject;
  assetUrls: Record<string, string>;
  selectedRole: LayerRole;
  onSelect: (role: LayerRole) => void;
  onCommand: (command: EditorCommand) => void;
  onReady: (exportPng: () => Promise<Blob>) => void;
}

function coverCrop(image: HTMLImageElement, layer: CardLayer) {
  const style = layer.style ?? {};
  const targetRatio = layer.box.width / layer.box.height;
  const imageRatio = image.width / image.height;
  let width = image.width;
  let height = image.height;
  if (imageRatio > targetRatio) width = height * targetRatio;
  else height = width / targetRatio;
  const x = (image.width - width) * Number(style.cropX ?? 0.5);
  const y = (image.height - height) * Number(style.cropY ?? 0.5);
  return { x, y, width, height };
}

function ImageNode({
  layer, url, selected, onSelect, onCommand,
}: {
  layer: CardLayer; url?: string; selected: boolean;
  onSelect: () => void; onCommand: Props["onCommand"];
}) {
  const [image] = useImage(url ?? "");
  const node = useRef<Konva.Image>(null);
  const transformer = useRef<Konva.Transformer>(null);
  const role = layer.style?.role as LayerRole;
  useEffect(() => {
    if (selected && node.current && transformer.current) {
      transformer.current.nodes([node.current]);
      transformer.current.getLayer()?.batchDraw();
    }
  }, [selected]);
  if (!image || layer.visible === false) return null;
  return (
    <>
      <KonvaImage
        ref={node}
        id={layer.id}
        image={image}
        x={layer.box.x}
        y={layer.box.y}
        width={layer.box.width}
        height={layer.box.height}
        crop={coverCrop(image, layer)}
        opacity={Number(layer.style?.opacity ?? 1)}
        globalCompositeOperation={String(layer.style?.blendMode ?? "normal") as GlobalCompositeOperation}
        draggable={role !== "background" && role !== "texture"}
        onClick={onSelect}
        onTap={onSelect}
        dragBoundFunc={(position) => ({
          x: Math.max(-layer.box.width * 0.75, Math.min(CANVAS.width - layer.box.width * 0.25, position.x)),
          y: Math.max(-layer.box.height * 0.75, Math.min(CANVAS.height - layer.box.height * 0.25, position.y)),
        })}
        onDragEnd={(event) => onCommand({ type: "update-layer", role, patch: { box: { x: event.target.x(), y: event.target.y() } } })}
        onTransformEnd={() => {
          const shape = node.current!;
          const scaleX = shape.scaleX();
          const scaleY = shape.scaleY();
          shape.scale({ x: 1, y: 1 });
          onCommand({
            type: "update-layer", role,
            patch: { box: { x: shape.x(), y: shape.y(), width: Math.max(40, shape.width() * scaleX), height: Math.max(40, shape.height() * scaleY) } },
          });
        }}
      />
      {selected && role !== "background" && role !== "texture" && (
        <Transformer
          ref={transformer}
          rotateEnabled={false}
          flipEnabled={false}
          boundBoxFunc={(oldBox, newBox) => newBox.width < 40 || newBox.height < 40 ? oldBox : newBox}
          anchorStroke="#f4c36d"
          borderStroke="#f4c36d"
        />
      )}
    </>
  );
}

export default function CardCanvas({ project, assetUrls, selectedRole, onSelect, onCommand, onReady }: Props) {
  const stage = useRef<Konva.Stage>(null);
  const surface = project.card.surfaces[0];
  const layers = useMemo(() => surface.layers, [surface.layers]);
  useEffect(() => {
    onReady(async () => {
      if (!stage.current) throw new Error("Canvas is not ready.");
      const uri = stage.current.toDataURL({ pixelRatio: 2, mimeType: "image/png" });
      return fetch(uri).then((response) => response.blob());
    });
  }, [onReady]);
  return (
    <div className="canvas-shell">
      <Stage ref={stage} width={CANVAS.width} height={CANVAS.height} className="card-stage">
        <Layer>
          <Rect width={CANVAS.width} height={CANVAS.height} fill={surface.background.color} />
          {layers.map((layer) => {
            const role = layer.style?.role as LayerRole | undefined;
            if (layer.kind === "image" && role) {
              return (
                <ImageNode
                  key={layer.id}
                  layer={layer}
                  url={layer.assetId ? assetUrls[layer.assetId] : undefined}
                  selected={role === selectedRole}
                  onSelect={() => onSelect(role)}
                  onCommand={onCommand}
                />
              );
            }
            if (layer.kind === "text" && layer.visible !== false) {
              const field = project.card.fields[layer.fieldKey!];
              return (
                <Text
                  key={layer.id}
                  x={layer.box.x} y={layer.box.y} width={layer.box.width} height={layer.box.height}
                  text={String(field.value)} fontFamily={String(layer.style?.fontFamily)}
                  fontSize={Number(layer.style?.fontSize)} fill={String(layer.style?.fill)}
                  align={String(layer.style?.align) as "center"} lineHeight={Number(layer.style?.lineHeight ?? 1)}
                  letterSpacing={Number(layer.style?.letterSpacing ?? 0)}
                />
              );
            }
            if (layer.kind === "border") {
              // The border is presentation-only with no handlers. Konva hit-tests
              // fill the whole Rect region even when it is unfilled, so this
              // topmost group would otherwise swallow pointer events meant for the
              // layers beneath it (e.g. dragging the emblem). Opt it out of hits.
              return (
                <Group key={layer.id} listening={false}>
                  <Rect x={layer.box.x} y={layer.box.y} width={layer.box.width} height={layer.box.height}
                    stroke={String(layer.style?.stroke)} strokeWidth={Number(layer.style?.strokeWidth)} />
                  <Rect x={layer.box.x + 12} y={layer.box.y + 12} width={layer.box.width - 24} height={layer.box.height - 24}
                    stroke={String(layer.style?.insetStroke)} strokeWidth={1} />
                </Group>
              );
            }
            return null;
          })}
        </Layer>
      </Stage>
      <div className="canvas-empty" aria-hidden="true">
        {["background", "texture", "foreground", "emblem"].map((role) =>
          !layerFor(project, role as LayerRole)?.assetId ? <span key={role}>{role}</span> : null)}
      </div>
    </div>
  );
}
