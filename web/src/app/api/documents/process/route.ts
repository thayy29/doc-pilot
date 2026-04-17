import { type NextRequest } from "next/server";
import { requireAuth } from "@/shared/auth";
import { ok, fail, handleError } from "@/shared/http";
import { processDocumentInline } from "@/worker/documentProcessor";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Processa um documento (chunking + embeddings) de forma síncrona.
 * POST /api/documents/process
 * body: { documentId: string }
 */
export async function POST(req: NextRequest) {
  try {
    await requireAuth();
    const { documentId } = await req.json();

    if (!documentId || typeof documentId !== "string") {
      return fail("BAD_REQUEST", "documentId é obrigatório", 400);
    }

    const result = await processDocumentInline(documentId);
    return ok(result);
  } catch (error) {
    return handleError(error);
  }
}
