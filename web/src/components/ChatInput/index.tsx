import Button from "../Button";
import { buttonStyles, containerStyles, inputStyles } from "./styles";

type Props = {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export default function ChatInput({
  value,
  onChange,
  onSend,
  placeholder = "Pergunte algo",
  disabled = false,
  className = "",

}: Props) {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  }

  return (
    <div className={`${containerStyles} ${className}`}>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        className={inputStyles}
      />
      <Button
        variant="primary"
        onClick={onSend}
        disabled={disabled || !value.trim()}
        className={buttonStyles}
      >
        Enviar
      </Button>
    </div>
  )
}