export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { type NextRequest } from "next/server";
import { ZodError } from "zod";
import { requireAuth } from "@/shared/auth";
import { docGenerationSchema } from "@/shared/validation";
import { docGenerationService } from "@/server/services";
import { AppError } from "@/shared/errors";
import { fail, ok } from "@/shared/http";
import { listTemplates, type DocTemplate } from "@/lib/docTemplates";

// ─── Helpers ───────────────────────────────────────────────────────────────

function encodeSSE(event: string, data: unknown): Uint8Array {
  return new TextEncoder().encode(
    `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`,
  );
}

// ─── GET /api/projects/[id]/generate ───────────────────────────────────────

/**
 * Lista todos os templates de documentação disponíveis.
 * Não requer conteúdo específico do projeto.
 */
export async function GET() {
  try {
    await requireAuth();
    const templates = listTemplates().map(({ id, label, description }) => ({
      id,
      label,
      description,
    }));
    return ok(templates);
  } catch (error) {
    if (error instanceof AppError) {
      return fail(error.code, error.message, error.statusCode);
    }
    return fail("INTERNAL_ERROR", "Erro ao listar templates.", 500);
  }
}

// ─── POST /api/projects/[id]/generate ──────────────────────────────────────

/**
 * Geração de documentação via Claude com streaming SSE.
 *
 * Pipeline:
 * 1. Autentica e valida input
 * 2. DocGenerationService monta contexto RAG + prompts do template
 * 3. Claude gera o documento via streaming
 * 4. Tokens transmitidos em tempo real via SSE
 *
 * Protocolo SSE:
 *   event: start   → { templateId, templateLabel, contextChunks, model }
 *   event: chunk   → { text }
 *   event: done    → { totalTokens, contentLength }
 *   event: error   → { code, message }
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  // 1. Auth
  let user: Awaited<ReturnType<typeof requireAuth>>;
  try {
    user = await requireAuth();
  } catch {
    return fail("UNAUTHORIZED", "Autenticação necessária.", 401);
  }

  // 2. Parse + Validação
  let input: ReturnType<typeof docGenerationSchema.parse>;
  try {
    const body = await request.json();
    input = docGenerationSchema.parse(body);
  } catch (error) {
    if (error instanceof ZodError) {
      return fail("VALIDATION_ERROR", "Dados inválidos.", 422, error.flatten().fieldErrors);
    }
    return fail("BAD_REQUEST", "Body inválido.", 400);
  }

  const { id: projectId } = await params;
  const { templateId, userContext, topK, similarityThreshold } = input;

  // 3. Streaming SSE
  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: string, data: unknown) =>
        controller.enqueue(encodeSSE(event, data));

      try {
        // Detecta LLM disponível
        const hasAnthropic = !!process.env.ANTHROPIC_API_KEY;
        const hasOpenAI = !!process.env.OPENAI_API_KEY;
        if (!hasAnthropic && !hasOpenAI) {
          send("error", {
            code: "NO_LLM_CONFIGURED",
            message: "Configure ANTHROPIC_API_KEY ou OPENAI_API_KEY no .env.",
          });
          return;
        }

        // Monta contexto: RAG + prompts do template
        const context = await docGenerationService.buildGenerationContext(
          projectId,
          user.id,
          templateId as DocTemplate,
          userContext,
          topK,
          similarityThreshold,
        );

        const modelName = hasAnthropic
          ? (process.env.ANTHROPIC_MODEL ?? "claude-3-5-sonnet-20241022")
          : (process.env.OPENAI_CHAT_MODEL ?? "gpt-4o-mini");

        send("start", {
          templateId,
          templateLabel: context.template.label,
          contextChunks: context.chunks.length,
          model: modelName,
        });

        let fullContent = "";
        let totalTokens = 0;

        if (hasAnthropic) {
          const { getAnthropicClient, CLAUDE_MODEL, MAX_TOKENS } =
            await import("@/lib/anthropic");
          const anthropic = getAnthropicClient();
          let inputTokens = 0;
          let outputTokens = 0;

          const claudeStream = await anthropic.messages.create({
            model: CLAUDE_MODEL,
            max_tokens: MAX_TOKENS,
            system: context.systemPrompt,
            messages: [{ role: "user", content: context.userPrompt }],
            stream: true,
          });

          for await (const event of claudeStream) {
            if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
              fullContent += event.delta.text;
              send("chunk", { text: event.delta.text });
            }
            if (event.type === "message_start") {
              inputTokens = event.message.usage.input_tokens;
            }
            if (event.type === "message_delta" && event.usage) {
              outputTokens = event.usage.output_tokens;
            }
          }
          totalTokens = inputTokens + outputTokens;
        } else {
          const { OpenAI } = await import("openai");
          const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

          const openaiStream = await openai.chat.completions.create({
            model: process.env.OPENAI_CHAT_MODEL ?? "gpt-4o-mini",
            max_tokens: Number(process.env.OPENAI_MAX_TOKENS ?? "2048"),
            messages: [
              { role: "system", content: context.systemPrompt },
              { role: "user", content: context.userPrompt },
            ],
            stream: true,
          });

          for await (const chunk of openaiStream) {
            const delta = chunk.choices[0]?.delta?.content;
            if (delta) {
              fullContent += delta;
              send("chunk", { text: delta });
            }
          }
        }

        send("done", {
          totalTokens,
          contentLength: fullContent.length,
        });
      } catch (error) {
        const isApp = error instanceof AppError;
        send("error", {
          code: isApp ? error.code : "INTERNAL_ERROR",
          message: isApp ? error.message : "Erro interno ao gerar documento.",
        });
        console.error("[generate] Error:", error);
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
