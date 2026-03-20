export const baseStyles = "rounded-2xl border border-border";

export const variantStyles = {
  surface: "bg-surface",
  subtle: "bg-subtle",
} as const;

export type Variant = keyof typeof variantStyles;