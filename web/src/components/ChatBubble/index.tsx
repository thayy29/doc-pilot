import Badge from "../Badge";
import { baseStyles, variantStyles } from "./styles";

type Variant = "user" | "assistant";

type Props = {
  variant: Variant;
  content: string;
  hasSources?: boolean;
  className?: string;
}

export default function ChatBubble({
  variant,
  content,
  hasSources = false,
  className
}: Props) {
  return (
    <div className={`${baseStyles} ${variantStyles[variant]} ${className}`}>
      <p>{content}</p>

      {variant === "assistant" && hasSources && (
        <div className="mt-2">
          <Badge variant="info">Com fontes</Badge>
        </div>
      )}
    </div>
  );
}