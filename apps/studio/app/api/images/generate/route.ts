import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { TEMPLATES } from "@/lib/templates";
import { authorizeImageRequest, selectModel } from "@/lib/server/guards";
import { imageProvider } from "@/lib/server/provider";
import { setSessionCookie } from "@/lib/server/session";

const requestSchema = z.object({
  role: z.enum(["background", "texture", "emblem", "foreground"]),
  prompt: z.string().trim().min(3).max(4000),
  cardContext: z.object({
    message: z.string().max(1000),
    signature: z.string().max(300),
    templateId: z.string().refine((id) => id in TEMPLATES, "Unknown template."),
  }),
  variantOfAssetId: z.string().max(200).optional(),
  modelId: z.string().max(120).optional(),
});

// Image generation can take ~35s; claim the platform's allowed ceiling.
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  const auth = authorizeImageRequest(request);
  if (!auth.ok) return auth.error;
  let parsed;
  try { parsed = requestSchema.safeParse(await request.json()); }
  catch { return NextResponse.json({ error: "Invalid JSON." }, { status: 400 }); }
  if (!parsed.success) return NextResponse.json({ error: "Generation request is invalid.", details: parsed.error.flatten() }, { status: 400 });
  const selection = selectModel(parsed.data.modelId, parsed.data.role);
  if (!selection.ok) return selection.error;
  try {
    const candidate = await imageProvider(selection.model.id).generate(parsed.data);
    const remaining = auth.session.remaining - 1;
    const response = NextResponse.json({ candidate, remaining }, { headers: { "Cache-Control": "no-store" } });
    setSessionCookie(response, { ...auth.session, remaining });
    return response;
  } catch (error) {
    const status = typeof error === "object" && error && "status" in error ? Number(error.status) : 500;
    const moderation = status === 400 && String(error).toLowerCase().includes("safety");
    return NextResponse.json(
      { error: moderation ? "The provider declined that image request." : "The image provider could not complete the request." },
      { status: moderation ? 422 : status === 429 ? 429 : 502, headers: { "Cache-Control": "no-store" } },
    );
  }
}
