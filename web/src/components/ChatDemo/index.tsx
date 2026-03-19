"use client";

import { useState } from "react";
import ChatSection from "../ChatSection";
import SectionHeader from "../SectionHeader";

const mockMessages = [
  {
    id: "1",
    variant: "user" as const,
    content: "Como rodo o projeto localmente?",
  },
  {
    id: "2",
    variant: "assistant" as const,
    content: "Passos: Node 18+ • configurar .env • npm i • npm run dev",
    hasSources: true,
  },
];

const mockSources = [
  { id: "1", title: "Runbook • Setup Local", link: "Confluence /page/123" },
  { id: "2", title: "Env Vars", link: "Confluence /page/456" },
  { id: "3", title: "Troubleshooting", link: "Confluence /page/789" },
];

export default function ChatDemo() {
  const [inputValue, setInputValue] = useState("");
  const [messages, setMessages] = useState(mockMessages);

  const handleSend = () => {
    if (!inputValue.trim()) return;

    setMessages((prev) => [
      ...prev,
      { id: String(Date.now()), variant: "user" as const, content: inputValue },
    ]);
    setInputValue("");
  };

  return (
    <div className="mt-10 w-full">
      <SectionHeader
        title="Chat"
        subtitle="Pergunte e receba resposta com fontes."
      />
      <div className="mt-4">
        <ChatSection
          messages={messages}
          sources={mockSources}
          inputValue={inputValue}
          onInputChange={setInputValue}
          onSend={handleSend}
        />
      </div>
    </div>
  );
}