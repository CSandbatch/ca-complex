import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { TEMPLATES } from "@/lib/templates";
import { authorizeImageRequest, selectModel, validateImageBytes } from "@/lib/server/guards";
import { imageProvider } from "@/lib/server/provider";
import { setSessionCookie } from "@/lib/server/session";

const contextSchema = z.object({
  message: z.string().max(1000),
  signature: z.string().max(300),
  templateId: z.string().refine((id) => id in TEMPLATES, "Unknown template."),
});
const roles = ["background", "texture", "emblem", "foreground"] as const;

// Image edits can take ~35s; claim the platform's allowed ceiling.
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  const auth = authorizeImageRequest(request);
  if (!auth.ok) return auth.error;
  let form: FormData;
  try { form = await request.formData(); }
  catch { return NextResponse.json({ error: "Invalid multipart request." }, { status: 400 }); }
  const role = form.get("role");
  const instruction = form.get("instruction");
  const sourceAssetId = form.get("sourceAssetId");
  const source = form.get("image");
  if (typeof role !== "string" || !roles.includes(role as typeof roles[number]) ||
      typeof instruction !== "string" || instruction.length < 3 || instruction.length > 4000 ||
      typeof sourceAssetId !== "string" || !(source instanceof File)) {
    return NextResponse.json({ error: "Edit request is invalid." }, { status: 400 });
  }
  let cardContext;
  try { cardContext = contextSchema.parse(JSON.parse(String(form.get("cardContext")))); }
  catch { return NextResponse.json({ error: "Card context is invalid." }, { status: 400 }); }
  const modelField = form.get("modelId");
  const modelId = typeof modelField === "string" && modelField ? modelField : undefined;
  const selection = selectModel(modelId, role as typeof roles[number]);
  if (!selection.ok) return selection.error;
  const files = [source, ...form.getAll("references").filter((item): item is File => item instanceof File)].slice(0, 4);
  const referenceAssetIds = String(form.get("referenceAssetIds") ?? "").split(",").filter(Boolean).slice(0, 3);
  try {
    const images = await Promise.all(files.map(async (file) => {
      const bytes = new Uint8Array(await file.arrayBuffer());
      validateImageBytes(bytes, file.type);
      return { bytes, mimeType: file.type };
    }));
    const candidate = await imageProvider(selection.model.id).edit({
      role: role as typeof roles[number], instruction, sourceAssetId, referenceAssetIds, cardContext, modelId: selection.model.id,
    }, images);
    const remaining = auth.session.remaining - 1;
    const response = NextResponse.json({ candidate, remaining }, { headers: { "Cache-Control": "no-store" } });
    setSessionCookie(response, { ...auth.session, remaining });
    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (message.includes("must be") || message.includes("accepted") || message.includes("invalid")) {
      return NextResponse.json({ error: message }, { status: 400, headers: { "Cache-Control": "no-store" } });
    }
    const status = typeof error === "object" && error && "status" in error ? Number(error.status) : 500;
    const moderation = status === 400 && String(error).toLowerCase().includes("safety");
    return NextResponse.json(
      { error: moderation ? "The provider declined that edit request." : "The image provider could not complete the edit." },
      { status: moderation ? 422 : status === 429 ? 429 : 502, headers: { "Cache-Control": "no-store" } },
    );
  }
}
