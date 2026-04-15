"use client";

import { useCallback, useEffect, useState } from "react";
import apiFetch from "@/lib/apiFetch";

// ─── Types ──────────────────────────────────────────────────────────────────

export interface ChatSession {
  id: string;
  projectId: string;
  title: string | null;
  createdAt: string;
  updatedAt: string;
}

interface UseChatSessionsState {
  sessions: ChatSession[];
  activeSesssionId: string | null;
  loading: boolean;
  error: string | null;
}

// ─── Hook ───────────────────────────────────────────────────────────────────

/**
 * Hook para gerenciar sessões de chat de um projeto.
 */
export function useChatSessions(projectId: string) {
  const [state, setState] = useState<UseChatSessionsState>({
    sessions: [],
    activeSesssionId: null,
    loading: false,
    error: null,
  });

  const loadSessions = useCallback(async () => {
    if (!projectId) return;
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const sessions = await apiFetch<ChatSession[]>(
        `/api/chat/sessions?projectId=${projectId}`,
      );
      setState((prev) => ({ ...prev, sessions, loading: false }));
    } catch (err) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error:
          err instanceof Error ? err.message : "Erro ao carregar sessões de chat",
      }));
    }
  }, [projectId]);

  const createSession = useCallback(
    async (title?: string): Promise<ChatSession | null> => {
      try {
        const session = await apiFetch<ChatSession>("/api/chat/sessions", {
          method: "POST",
          body: JSON.stringify({ projectId, title: title ?? "Nova conversa" }),
        });
        setState((prev) => ({
          ...prev,
          sessions: [session, ...prev.sessions],
          activeSesssionId: session.id,
        }));
        return session;
      } catch (err) {
        setState((prev) => ({
          ...prev,
          error:
            err instanceof Error ? err.message : "Erro ao criar sessão de chat",
        }));
        return null;
      }
    },
    [projectId],
  );

  const deleteSession = useCallback(async (sessionId: string) => {
    try {
      await apiFetch(`/api/chat/sessions/${sessionId}`, {
        method: "DELETE",
      });
      setState((prev) => ({
        ...prev,
        sessions: prev.sessions.filter((s) => s.id !== sessionId),
        activeSesssionId:
          prev.activeSesssionId === sessionId
            ? (prev.sessions.find((s) => s.id !== sessionId)?.id ?? null)
            : prev.activeSesssionId,
      }));
    } catch (err) {
      setState((prev) => ({
        ...prev,
        error:
          err instanceof Error ? err.message : "Erro ao deletar sessão",
      }));
    }
  }, []);

  const selectSession = useCallback((sessionId: string) => {
    setState((prev) => ({ ...prev, activeSesssionId: sessionId }));
  }, []);

  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  const activeSession =
    state.sessions.find((s) => s.id === state.activeSesssionId) ?? null;

  return {
    sessions: state.sessions,
    activeSession,
    loading: state.loading,
    error: state.error,
    loadSessions,
    createSession,
    deleteSession,
    selectSession,
  };
}
