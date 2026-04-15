export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { type NextRequest } from "next/server";
import { chatService } from "@/server/services";
import { requireAuth } from "@/shared/auth";
import { createChatSessionSchema } from "@/shared/validation";
import { ok, created, handleError } from "@/shared/http";

// GET /api/chat/sessions?projectId=xxx
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();
    const projectId = request.nextUrl.searchParams.get("projectId");

    if (!projectId) {
      const { fail } = await import("@/shared/http");
      return fail("BAD_REQUEST", "projectId query param is required", 400);
    }

    const sessions = await chatService.listSessions(projectId, user.id);
    return ok(sessions);
  } catch (error) {
    return handleError(error);
  }
}

// POST /api/chat/sessions → create a new session
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await request.json();
    const input = createChatSessionSchema.parse(body);
    const session = await chatService.createSession(
      input.projectId,
      user.id,
      input.title,
    );
    return created(session);
  } catch (error) {
    return handleError(error);
  }
}
