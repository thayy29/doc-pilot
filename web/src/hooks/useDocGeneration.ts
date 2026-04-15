"use client";

import { useState, useCallback } from "react";
import type { DocTemplate } from "@/lib/docTemplates";

// ─── Types ─────────────────────────────────────────────────────────────────

export type GenerationStatus = "idle" | "generating" | "done" | "error";

export interface GenerationStartEvent {
  templateId: string;
  templateLabel: string;
  contextChunks: number;
  model: string;
}

export interface GenerationDoneEvent {
  totalTokens: number;
  contentLength: number;
}

export interface UseDocGenerationOptions {
  projectId: string;
  onStart?: (event: GenerationStartEvent) => void;
  onDone?: (event: GenerationDoneEvent, fullContent: string) => void;
  onError?: (message: string) => void;
}

export interface UseDocGenerationReturn {
  generate: (templateId: DocTemplate, userContext?: string) => Promise<void>;
  content: string;
  status: GenerationStatus;
  error: string | null;
  reset: () => void;
  abort: () => void;
}

// ─── Hook ───────────────────────────────────────────────────────────────────

/**
 * Hook para geração de documentação via SSE.
 * Consome o endpoint POST /api/projects/[id]/generate.
 *
 * Exemplo de uso:
 * ```tsx
 * const { generate, content, status } = useDocGeneration({ projectId });
 * await generate("README", "Projeto de e-commerce em Next.js");
 * // `content` vai sendo preenchido em tempo real (streaming)
 * ```
 */
export function useDocGeneration({
  projectId,
  onStart,
  onDone,
  onError,
}: UseDocGenerationOptions): UseDocGenerationReturn {
  const [content, setContent] = useState("");
  const [status, setStatus] = useState<GenerationStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [abortController, setAbortController] = useState<AbortController | null>(null);

  const reset = useCallback(() => {
    setContent("");
    setStatus("idle");
    setError(null);
  }, []);

  const abort = useCallback(() => {
    abortController?.abort();
    setStatus("idle");
  }, [abortController]);

  const generate = useCallback(
    async (templateId: DocTemplate, userContext?: string) => {
      if (status === "generating") return;

      setStatus("generating");
      setContent("");
      setError(null);

      const controller = new AbortController();
      setAbortController(controller);
      let accumulated = "";

      try {
        const response = await fetch(`/api/projects/${projectId}/generate`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ templateId, userContext }),
          signal: controller.signal,
        });

        if (!response.ok) {
          const json = await response.json().catch(() => ({}));
          throw new Error(json?.error?.message ?? `Erro HTTP ${response.status}`);
        }

        if (!response.body) throw new Error("Stream indisponível.");

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        let currentEvent = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";

          for (const line of lines) {
            if (line.startsWith("event: ")) {
              currentEvent = line.slice(7).trim();
            } else if (line.startsWith("data: ")) {
              try {
                const data = JSON.parse(line.slice(6).trim());

                switch (currentEvent) {
                  case "start":
                    onStart?.(data as GenerationStartEvent);
                    break;

                  case "chunk": {
                    const text = (data as { text: string }).text;
                    accumulated += text;
                    setContent((prev) => prev + text);
                    break;
                  }

                  case "done": {
                    const doneEvent = data as GenerationDoneEvent;
                    setStatus("done");
                    onDone?.(doneEvent, accumulated);
                    break;
                  }

                  case "error": {
                    const msg = (data as { message: string }).message;
                    setError(msg);
                    setStatus("error");
                    onError?.(msg);
                    break;
                  }
                }
              } catch {
                // linha de dados inválida — ignora
              }
            }
          }
        }

        // Se o stream terminou sem evento "done" explícito
        if (status !== "done" && status !== "error") {
          setStatus("done");
        }
      } catch (err) {
        if ((err as Error).name === "AbortError") {
          setStatus("idle");
          return;
        }
        const msg =
          err instanceof Error ? err.message : "Erro desconhecido na geração.";
        setError(msg);
        setStatus("error");
        onError?.(msg);
      } finally {
        setAbortController(null);
      }
    },
    [projectId, status, onStart, onDone, onError],
  );

  return { generate, content, status, error, reset, abort };
}
