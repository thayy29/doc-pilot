"use client";

import { useEffect, useRef, useState } from "react";
import { useChatStream } from "@/hooks/useChatStream";
import { useChatSessions } from "@/hooks/useChatSessions";
import ChatInput from "@/components/ChatInput";
import ChatBubble from "@/components/ChatBubble";
import Button from "@/components/Button";
import Card from "@/components/Card";

type Props = {
  projectId: string;
};

export default function ChatWindow({ projectId }: Props) {
  const {
    sessions,
    activeSession,
    loading: sessionsLoading,
    createSession,
    deleteSession,
    selectSession,
    loadSessions,
  } = useChatSessions(projectId);

  const [inputValue, setInputValue] = useState("");
  const [initializingSession, setInitializingSession] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Cria uma sessão inicial se não existir nenhuma
  useEffect(() => {
    if (!sessionsLoading && sessions.length === 0 && !initializingSession) {
      setInitializingSession(true);
      createSession("Nova conversa").finally(() =>
        setInitializingSession(false),
      );
    }
  }, [sessionsLoading, sessions.length, createSession, initializingSession]);

  // sessionId só é passado quando existe sessão ativa — evita request com string vazia
  const activeSessionId = activeSession?.id ?? "";

  const { messages, isStreaming, sendMessage, clearMessages, loadMessages } = useChatStream({
    sessionId: activeSessionId,
    projectId,
    onDone: () => {
      // Recarrega sessões para atualizar título e contagem de mensagens
      loadSessions();
    },
  });

  // Carrega mensagens da sessão ativa ao montar ou quando a sessão muda
  useEffect(() => {
    if (activeSessionId) {
      loadMessages(activeSessionId);
    }
  }, [activeSessionId, loadMessages]);

  // Auto-scroll para a última mensagem
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!inputValue.trim() || !activeSessionId || isStreaming) return;
    sendMessage(inputValue);
    setInputValue("");
  };

  const handleNewSession = async () => {
    clearMessages();
    await createSession("Nova conversa");
  };

  if (sessionsLoading || initializingSession) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="text-xs font-semibold text-foreground-muted">
          Iniciando chat...
        </p>
      </div>
    );
  }

  // Filtra: mostra apenas sessões com mensagens + a sessão ativa
  const visibleSessions = sessions.filter(
    (s) =>
      s.id === activeSession?.id ||
      ((s as unknown as { _count?: { messages: number } })._count?.messages ?? 0) > 0,
  );

  return (
    <div className="flex min-h-0 flex-1 gap-3">
      {/* Sidebar de sessões — sempre visível */}
      <div className="flex w-48 shrink-0 flex-col gap-1 overflow-y-auto border-r border-border pr-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-black text-foreground-muted uppercase tracking-wide">
            Conversas
          </span>
          <Button variant="ghost" className="text-xs px-2 py-1" onClick={handleNewSession}>
            +
          </Button>
        </div>
        {visibleSessions.length === 0 && (
          <p className="text-xs text-foreground-muted">Nenhuma conversa ainda.</p>
        )}
        {visibleSessions.map((session) => (
            <button
              key={session.id}
              onClick={() => {
                selectSession(session.id);
                loadMessages(session.id);
              }}
              className={[
                "group flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-xs font-semibold transition-all",
                activeSession?.id === session.id
                  ? "bg-brand/10 text-brand"
                  : "text-foreground-muted hover:bg-subtle",
              ].join(" ")}
            >
              <span className="truncate">
                {session.title ?? "Nova conversa"}
              </span>
              <span
                role="button"
                tabIndex={0}
                onClick={(e) => {
                  e.stopPropagation();
                  deleteSession(session.id);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.stopPropagation();
                    deleteSession(session.id);
                  }
                }}
                className="ml-1 opacity-0 transition-opacity group-hover:opacity-100 text-destructive cursor-pointer"
              >
                ✕
              </span>
            </button>
          ))}
        </div>

      {/* Painel principal */}
      <div className="flex min-h-0 flex-1 flex-col gap-3">
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between">
          <div className="text-xs font-black text-foreground-muted uppercase tracking-wide">
            {activeSession?.title ?? "Chat"}
            {isStreaming && (
              <span className="ml-2 inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-brand align-middle" />
            )}
          </div>
        </div>

        {/* Mensagens */}
        <div className="min-h-0 flex-1 overflow-y-auto">
          {messages.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
              <span className="text-4xl">💬</span>
              <div>
                <p className="text-sm font-black text-foreground">
                  Faça uma pergunta
                </p>
                <p className="mt-1 text-xs font-semibold text-foreground-muted">
                  O chat usa seus documentos para responder com precisão.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-3 pb-2">
              {messages
                .filter((msg) => msg.role === "user" || msg.content !== "")
                .map((msg) => (
                <ChatBubble
                  key={msg.id}
                  variant={msg.role === "user" ? "user" : "assistant"}
                  content={msg.content}
                />
              ))}
              {/* Spinner de streaming */}
              {isStreaming &&
                messages[messages.length - 1]?.role === "assistant" &&
                messages[messages.length - 1]?.content === "" && (
                  <Card variant="surface" className="max-w-xs px-4 py-3">
                    <div className="flex gap-1">
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-foreground-muted [animation-delay:0ms]" />
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-foreground-muted [animation-delay:150ms]" />
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-foreground-muted [animation-delay:300ms]" />
                    </div>
                  </Card>
                )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input */}
        <div className="shrink-0">
          <ChatInput
            value={inputValue}
            onChange={setInputValue}
            onSend={handleSend}
            placeholder="Pergunte algo sobre seus documentos..."
            disabled={isStreaming || !activeSession}
          />
        </div>
      </div>
    </div>
  );
}
