export const baseStyles = [
  "inline-flex h-docpilot-6 items-center justify-center rounded-docpilot-9 border px-docpilot-4 whitespace-nowrap",
  "text-[10.5px] font-black leading-none tracking-wide uppercase",
].join(" ");

export const variantStyles = {
  success: [
    "bg-[#10B981]/[0.12] border-[#10B981]/[0.40] text-[#065F46]",
    "dark:bg-[#10B981]/[0.16] dark:border-[#10B981]/[0.55] dark:text-[#A7F3D0]",
  ].join(" "),
  warning: [
    "bg-[#F59E0B]/[0.14] border-[#F59E0B]/[0.45] text-[#92400E]",
    "dark:bg-[#F59E0B]/[0.18] dark:border-[#F59E0B]/[0.60] dark:text-[#FDE68A]",
  ].join(" "),
  info: [
    "bg-[#3B82F6]/[0.10] border-[#3B82F6]/[0.35] text-[#1D4ED8]",
    "dark:bg-[#3B82F6]/[0.16] dark:border-[#3B82F6]/[0.55] dark:text-[#BFDBFE]",
  ].join(" "),
} as const;

export type Variant = keyof typeof variantStyles;
