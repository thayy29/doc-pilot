export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { type NextRequest } from "next/server";
import { chatService } from "@/server/services";
import { requireAuth } from "@/shared/auth";
import { ok, noContent, handleError } from "@/shared/http";

type Params = { params: Promise<{ sessionId: string }> };

// GET /api/chat/sessions/[sessionId]
export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const user = await requireAuth();
    const { sessionId } = await params;
    const session = await chatService.getSession(sessionId, user.id);
    return ok(session);
  } catch (error) {
    return handleError(error);
  }
}

// DELETE /api/chat/sessions/[sessionId]
export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const user = await requireAuth();
    const { sessionId } = await params;
    await chatService.deleteSession(sessionId, user.id);
    return noContent();
  } catch (error) {
    return handleError(error);
  }
}
