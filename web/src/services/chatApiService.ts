import apiFetch from "@/lib/apiFetch";

export type ChatRole = "USER" | "ASSISTANT" | "SYSTEM";

export interface ChatSession {
  id: string;
  projectId: string;
  userId: string;
  title: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ChatMessage {
  id: string;
  sessionId: string;
  role: ChatRole;
  content: string;
  tokens: number | null;
  createdAt: string;
}

const SESSIONS_BASE = "/api/chat/sessions";

export const chatApiService = {
  listSessions: (projectId: string): Promise<ChatSession[]> =>
    apiFetch<ChatSession[]>(`${SESSIONS_BASE}?projectId=${projectId}`),

  getSession: (sessionId: string): Promise<ChatSession> =>
    apiFetch<ChatSession>(`${SESSIONS_BASE}/${sessionId}`),

  createSession: (projectId: string, title?: string): Promise<ChatSession> =>
    apiFetch<ChatSession>(SESSIONS_BASE, {
      method: "POST",
      body: JSON.stringify({ projectId, title }),
    }),

  deleteSession: (sessionId: string): Promise<void> =>
    apiFetch<void>(`${SESSIONS_BASE}/${sessionId}`, { method: "DELETE" }),

  listMessages: (sessionId: string): Promise<ChatMessage[]> =>
    apiFetch<ChatMessage[]>(`${SESSIONS_BASE}/${sessionId}/messages`),

  sendMessage: (sessionId: string, content: string): Promise<ChatMessage> =>
    apiFetch<ChatMessage>(`${SESSIONS_BASE}/${sessionId}/messages`, {
      method: "POST",
      body: JSON.stringify({ content }),
    }),
};
