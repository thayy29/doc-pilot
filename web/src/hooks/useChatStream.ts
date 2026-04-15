"use client";

import { useState, useCallback, useRef } from "react";

// ─── Types ─────────────────────────────────────────────────────────────────

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  pending?: boolean;
}

export interface StreamStartEvent {
  sessionId: string;
  model: string;
  contextSize: number;
}

export interface StreamDoneEvent {
  messageId: string;
  totalTokens: number;
  contextChunks: number;
}

export interface StreamErrorEvent {
  code: string;
  message: string;
}

export interface UseChatStreamOptions {
  sessionId: string;
  projectId: string;
  /** Chunks RAG máximos (padrão 5) */
  topK?: number;
  /** Threshold de similaridade (padrão 0.7) */
  similarityThreshold?: number;
  onStart?: (event: StreamStartEvent) => void;
  onDone?: (event: StreamDoneEvent) => void;
  onError?: (event: StreamErrorEvent) => void;
}

export interface UseChatStreamReturn {
  messages: ChatMessage[];
  isStreaming: boolean;
  sendMessage: (content: string) => Promise<void>;
  clearMessages: () => void;
  abortStream: () => void;
}

// ─── Hook ───────────────────────────────────────────────────────────────────

/**
 * Hook para consumir o endpoint SSE de Chat RAG.
 *
 * Gerencia o estado de mensagens localmente e integra com
 * o endpoint POST /api/chat/stream via Server-Sent Events.
 */
export function useChatStream({
  sessionId,
  projectId,
  topK = 5,
  similarityThreshold = 0.7,
  onStart,
  onDone,
  onError,
}: UseChatStreamOptions): UseChatStreamReturn {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  const abortStream = useCallback(() => {
    abortControllerRef.current?.abort();
    setIsStreaming(false);
  }, []);

  const sendMessage = useCallback(
    async (content: string) => {
      if (isStreaming || !content.trim() || !sessionId) return;

      const userMessageId = `user-${Date.now()}`;
      const assistantMessageId = `assistant-${Date.now()}`;

      // Adiciona mensagem do usuário imediatamente
      setMessages((prev) => [
        ...prev,
        { id: userMessageId, role: "user", content },
        { id: assistantMessageId, role: "assistant", content: "", pending: true },
      ]);

      setIsStreaming(true);

      const controller = new AbortController();
      abortControllerRef.current = controller;

      try {
        const response = await fetch("/api/chat/stream", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sessionId,
            projectId,
            message: content,
            topK,
            similarityThreshold,
          }),
          signal: controller.signal,
        });

        if (!response.ok) {
          const error = await response.json().catch(() => ({}));
          throw new Error(error?.error?.message ?? `HTTP ${response.status}`);
        }

        if (!response.body) throw new Error("Stream não disponível");

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });

          // Processa eventos SSE acumulados no buffer
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";

          let currentEvent = "";
          for (const line of lines) {
            if (line.startsWith("event: ")) {
              currentEvent = line.slice(7).trim();
            } else if (line.startsWith("data: ")) {
              const raw = line.slice(6).trim();
              try {
                const parsed = JSON.parse(raw);
                handleSSEEvent(currentEvent, parsed);
              } catch {
                // Linha de dados inválida — ignora
              }
            }
          }
        }
      } catch (error) {
        if ((error as Error).name === "AbortError") return;

        const message =
          error instanceof Error ? error.message : "Erro ao conectar com o servidor.";

        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantMessageId
              ? { ...m, content: `⚠️ ${message}`, pending: false }
              : m,
          ),
        );
      } finally {
        setIsStreaming(false);
        abortControllerRef.current = null;
      }

      function handleSSEEvent(event: string, data: unknown) {
        if (typeof data !== "object" || data === null) return;

        switch (event) {
          case "start": {
            onStart?.(data as StreamStartEvent);
            break;
          }

          case "chunk": {
            const { text } = data as { text: string };
            setMessages((prev) =>
              prev.map((m) =>
                m.id === assistantMessageId
                  ? { ...m, content: m.content + text, pending: true }
                  : m,
              ),
            );
            break;
          }

          case "done": {
            const doneEvent = data as StreamDoneEvent;
            setMessages((prev) =>
              prev.map((m) =>
                m.id === assistantMessageId
                  ? { ...m, id: doneEvent.messageId, pending: false }
                  : m,
              ),
            );
            onDone?.(doneEvent);
            break;
          }

          case "error": {
            const errorEvent = data as StreamErrorEvent;
            setMessages((prev) =>
              prev.map((m) =>
                m.id === assistantMessageId
                  ? {
                      ...m,
                      content: `⚠️ ${errorEvent.message}`,
                      pending: false,
                    }
                  : m,
              ),
            );
            onError?.(errorEvent);
            break;
          }
        }
      }
    },
    [isStreaming, sessionId, projectId, topK, similarityThreshold, onStart, onDone, onError],
  );

  return { messages, isStreaming, sendMessage, clearMessages, abortStream };
}
