export const baseStyles = [
  "inline-flex h-6 items-center justify-center rounded-lg border px-3 whitespace-nowrap",
  "text-xs font-black leading-none tracking-wide uppercase",
].join(" ");

export const variantStyles = {
  success: "bg-success-subtle border-success-border text-success-text",
  warning: "bg-warning-subtle border-warning-border text-warning-text",
  info: "bg-info-subtle border-info-border text-info-text",
  error: "bg-destructive/10 border-destructive/20 text-destructive",
} as const;

export type Variant = keyof typeof variantStyles;
