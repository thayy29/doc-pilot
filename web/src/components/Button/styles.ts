export const baseStyles = [
  "inline-flex h-10 items-center justify-center gap-2 rounded-xl px-5 text-xs font-black transition-colors",
  "focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-[#0B0D10]",
  "disabled:cursor-not-allowed",
].join(" ");

export const variantStyles = {
  primary: [
    "bg-brand-500 text-white dark:text-[#111418]",
    "hover:bg-brand-600",
    "focus:ring-brand-300 dark:focus:ring-brand-700",
    "disabled:bg-brand-300 disabled:text-white/70 dark:disabled:bg-brand-700 dark:disabled:text-[#111418]/50",
  ].join(" "),
  ghost: [
    "bg-white text-black border border-black/[.12] dark:bg-[#111418] dark:text-white dark:border-white/[.14]",
    "hover:bg-black/[.04] dark:hover:bg-white/[.08]",
    "focus:ring-black/20 dark:focus:ring-white/20",
    "disabled:text-black/40 dark:disabled:text-white/40 disabled:bg-white dark:disabled:bg-[#111418]",
  ].join(" "),
} as const
export type Variant = keyof typeof variantStyles;