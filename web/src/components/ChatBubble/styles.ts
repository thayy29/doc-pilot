export type Variant = "user" | "assistant";

export const baseStyles = "rounded-xl border px-3 py-1.5 text-sm font-semibold text-foreground";

export const variantStyles: Record<Variant, string> = {
  user: "ml-auto max-w-[80%] bg-brand-subtle border-brand-subtle-border",
  assistant: "max-w-full bg-surface border-border",
};