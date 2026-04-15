export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { type NextRequest } from "next/server";
import { requireAuth } from "@/shared/auth";
import { chatStreamSchema } from "@/shared/validation";
import { chatService, ragService } from "@/server/services";
import { getAnthropicClient, CLAUDE_MODEL, MAX_TOKENS } from "@/lib/anthropic";
import { BadRequestError, NotFoundError } from "@/shared/errors";
import { fail } from "@/shared/http";
import { ZodError } from "zod";
import { AppError } from "@/shared/errors";

// ─── Helpers ───────────────────────────────────────────────────────────────

function encodeSSE(event: string, data: unknown): Uint8Array {
  const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
  return new TextEncoder().encode(payload);
}

// ─── POST /api/chat/stream ─────────────────────────────────────────────────

/**
 * Streaming endpoint do Chat RAG.
 *
 * Pipeline:
 * 1. Autentica o usuário
 * 2. Valida o input (Zod)
 * 3. Valida sessão de chat (pertence ao usuário/projeto)
 * 4. Persiste a mensagem do usuário
 * 5. Executa pipeline RAG (embedding → search → context)
 * 6. Inicia stream com Claude (Anthropic)
 * 7. Transmite tokens via Server-Sent Events
 * 8. Ao finalizar, persiste a resposta completa do assistente
 *
 * Protocolo SSE:
 *   event: start     → { sessionId, model, contextSize }
 *   event: chunk     → { text }                          (repetido N vezes)
 *   event: done      → { messageId, totalTokens }
 *   event: error     → { code, message }
 */
export async function POST(request: NextRequest) {
  // ── 1. Autenticação ─────────────────────────────────────────────────────
  let user: Awaited<ReturnType<typeof requireAuth>>;
  try {
    user = await requireAuth();
  } catch {
    return fail("UNAUTHORIZED", "Autenticação necessária.", 401);
  }

  // ── 2. Parse + Validação ────────────────────────────────────────────────
  let input: ReturnType<typeof chatStreamSchema.parse>;
  try {
    const body = await request.json();
    input = chatStreamSchema.parse(body);
  } catch (error) {
    if (error instanceof ZodError) {
      const details = error.flatten().fieldErrors;
      return fail("VALIDATION_ERROR", "Dados inválidos.", 422, details);
    }
    return fail("BAD_REQUEST", "Body inválido.", 400);
  }

  const { sessionId, message, projectId, topK, similarityThreshold } = input;

  // ── 3. Valida sessão ────────────────────────────────────────────────────
  try {
    await chatService.getSession(sessionId, user.id);
  } catch (error) {
    if (error instanceof NotFoundError) {
      return fail("NOT_FOUND", "Sessão de chat não encontrada.", 404);
    }
    return fail("FORBIDDEN", "Acesso negado à sessão.", 403);
  }

  // ── 4. Persiste mensagem do usuário ─────────────────────────────────────
  try {
    await chatService.addUserMessage(sessionId, user.id, message);
  } catch {
    return fail("INTERNAL_ERROR", "Erro ao salvar mensagem.", 500);
  }

  // ── 5 + 6 + 7 + 8 — RAG + Stream ────────────────────────────────────────
  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: string, data: unknown) => {
        controller.enqueue(encodeSSE(event, data));
      };

      try {
        // ── RAG: embedding → search → context ──────────────────────────
        const ragContext = await ragService.buildContext(
          message,
          projectId,
          topK,
          similarityThreshold,
        );

        send("start", {
          sessionId,
          model: CLAUDE_MODEL,
          contextSize: ragContext.chunks.length,
        });

        // ── Histórico da sessão (últimas 10 mensagens) ─────────────────
        const history = await chatService.listMessages(sessionId, user.id);
        const recentMessages = history.slice(-10);

        const anthropicMessages = recentMessages
          .filter((m) => m.role !== "SYSTEM")
          .map((m) => ({
            role: m.role === "USER" ? ("user" as const) : ("assistant" as const),
            content: m.content,
          }));

        // A mensagem atual ainda não está em anthropicMessages (acabou de ser salva)
        // — já está incluída pois listMessages retorna todas incluindo a recém-salva

        // ── Stream Anthropic ───────────────────────────────────────────
        const anthropic = getAnthropicClient();
        let fullContent = "";
        let inputTokens = 0;
        let outputTokens = 0;

        const claudeStream = await anthropic.messages.create({
          model: CLAUDE_MODEL,
          max_tokens: MAX_TOKENS,
          system: ragContext.systemPrompt,
          messages: anthropicMessages,
          stream: true,
        });

        for await (const event of claudeStream) {
          if (event.type === "content_block_delta") {
            const delta = event.delta;
            if (delta.type === "text_delta") {
              fullContent += delta.text;
              send("chunk", { text: delta.text });
            }
          }

          if (event.type === "message_delta" && event.usage) {
            outputTokens = event.usage.output_tokens;
          }

          if (event.type === "message_start" && event.message.usage) {
            inputTokens = event.message.usage.input_tokens;
          }
        }

        // ── Persiste resposta do assistente ────────────────────────────
        const totalTokens = inputTokens + outputTokens;
        const assistantMessage = await chatService.addAssistantMessage(
          sessionId,
          fullContent,
          totalTokens,
        );

        send("done", {
          messageId: assistantMessage.id,
          totalTokens,
          contextChunks: ragContext.chunks.length,
        });
      } catch (error) {
        const isAppError = error instanceof AppError;
        const code = isAppError ? error.code : "INTERNAL_ERROR";
        const message = isAppError
          ? error.message
          : "Erro interno ao processar resposta.";

        console.error("[chat/stream] Error:", error);
        send("error", { code, message });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
