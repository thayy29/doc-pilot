export const baseStyles = [
  "rounded-2xl border",
].join(" ");

export const variantStyles = {
  surface: [
    "bg-white border-black/10",
    "dark:bg-[#111418] dark:border-white/10",
  ].join(" "),
  subtle: [
    "bg-black/[0.03] border-black/10",
    "dark:bg-white/[0.04] dark:border-white/10",
  ].join(" "),
} as const;

export type Variant = keyof typeof variantStyles;