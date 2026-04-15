export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { type NextRequest } from "next/server";
import { documentService } from "@/server/services";
import { requireAuth } from "@/shared/auth";
import { ok, noContent, handleError } from "@/shared/http";

type Params = { params: Promise<{ id: string; docId: string }> };

// GET /api/projects/[id]/documents/[docId]
export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const user = await requireAuth();
    const { id: projectId, docId } = await params;
    const document = await documentService.getById(docId, projectId, user.id);
    return ok(document);
  } catch (error) {
    return handleError(error);
  }
}

// DELETE /api/projects/[id]/documents/[docId]
export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const user = await requireAuth();
    const { id: projectId, docId } = await params;
    await documentService.delete(docId, projectId, user.id);
    return noContent();
  } catch (error) {
    return handleError(error);
  }
}
