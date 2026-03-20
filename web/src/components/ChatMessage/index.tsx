import ChatBubble from "../ChatBubble";
import { containerStyles, labelStyles, listStyles } from "./styles";

type Message = {
  id: string;
  variant: "user" | "assistant";
  content: string;
  hasSources?: boolean;
};

type Props = {
  messages: Message[];
  className?: string;
};

export default function ChatMessage({
  messages,
  className = "",
}: Props) {
  return (
    <div className={`${containerStyles} ${className}`}>
      <div className="shrink-0">
        <div className={labelStyles}>Conversa</div>
      </div>
      <div className={`${listStyles} min-h-0 flex-1 overflow-y-auto`}>
        {messages.map((msg) => (
          <ChatBubble
            key={msg.id}
            variant={msg.variant}
            content={msg.content}
            hasSources={msg.hasSources}
          />
        ))}
      </div>
    </div>
  );
}