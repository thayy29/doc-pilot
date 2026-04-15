export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { type NextRequest } from "next/server";
import { chatService } from "@/server/services";
import { requireAuth } from "@/shared/auth";
import { createChatMessageSchema } from "@/shared/validation";
import { ok, created, handleError } from "@/shared/http";

type Params = { params: Promise<{ sessionId: string }> };

// GET /api/chat/sessions/[sessionId]/messages
export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const user = await requireAuth();
    const { sessionId } = await params;
    const messages = await chatService.listMessages(sessionId, user.id);
    return ok(messages);
  } catch (error) {
    return handleError(error);
  }
}

// POST /api/chat/sessions/[sessionId]/messages → add user message
export async function POST(request: NextRequest, { params }: Params) {
  try {
    const user = await requireAuth();
    const { sessionId } = await params;
    const body = await request.json();
    const { content } = createChatMessageSchema.parse(body);
    const message = await chatService.addUserMessage(sessionId, user.id, content);
    return created(message);
  } catch (error) {
    return handleError(error);
  }
}
