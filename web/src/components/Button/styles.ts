export const baseStyles = [
  "inline-flex h-10 items-center justify-center gap-2 rounded-xl px-5 text-xs font-black transition-colors",
  "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background",
  "disabled:cursor-not-allowed",
].join(" ");

export const variantStyles = {
  primary: [
    "bg-brand text-brand-text",
    "hover:bg-brand-hover",
    "focus:ring-brand/30",
    "disabled:opacity-50",
  ].join(" "),
  ghost: [
    "bg-surface text-foreground border border-border-strong",
    "hover:bg-subtle",
    "focus:ring-foreground/20",
    "disabled:opacity-50",
  ].join(" "),
} as const;

export type Variant = keyof typeof variantStyles;