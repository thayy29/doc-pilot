import { type NextRequest } from "next/server";
import { requireAuth } from "@/shared/auth";
import { ok, fail, handleError } from "@/shared/http";
import { getDocumentQueue } from "@/lib/documentQueue";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Enfileira documento para processamento assíncrono.
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

    const queue = getDocumentQueue();
    await queue.add("process", { documentId });
    return ok({ queued: true, documentId });
  } catch (error) {
    return handleError(error);
  }
}
