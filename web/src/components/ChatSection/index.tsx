"use client";

import ChatMessage from "../ChatMessage";
import ChatInput from "../ChatInput";
import SourcesPanel from "../SourcesPanel";
import { containerStyles, chatPanelStyles, sourcesPanelStyles } from "./styles";


type Message = {
  id: string;
  variant: "user" | "assistant";
  content: string;
  hasSources?: boolean;
};

type Source = {
  id: string;
  title: string;
  link: string;
  href?: string;
};

type Props = {
  messages: Message[];
  sources: Source[];
  inputValue: string;
  onInputChange: (value: string) => void;
  onSend: () => void;
  className?: string;
};

export default function ChatSection({
  messages,
  sources,
  inputValue,
  onInputChange,
  onSend,
  className = "",
}: Props) {
  return (
    <div className={`${containerStyles} ${className}`}>
      <div className={chatPanelStyles}>
        <ChatMessage messages={messages} className="min-h-0 flex-1 overflow-y-auto" />
        <div className="mt-3 shrink-0">
          <ChatInput
            value={inputValue}
            onChange={onInputChange}
            onSend={onSend}
          />
        </div>
      </div>
      <div className={sourcesPanelStyles}>
        <SourcesPanel sources={sources} className="min-h-0 flex-1" />
      </div>
    </div>
  );
}