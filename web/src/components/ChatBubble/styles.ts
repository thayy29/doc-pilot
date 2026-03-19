export type Variant = "user" | "assistant";

export const baseStyles = "rounded-[14px] border px-4 py-3 text-[12.5px] font-semibold";

export const variantStyles: Record<Variant, string> = {
  user: [
    "ml-auto max-w-[470px]",
    "bg-[#FF5800]/10 border-[#FF5800]/35 text-black",
    "dark:bg-[#FF5800]/[0.18] dark:border-[#FF5800]/60 dark:text-white",
  ].join(" "),
  assistant: [
    "max-w-[898px]",
    "bg-white border-black/10 text-black",
    "dark:bg-[#111418] dark:border-white/[0.12] dark:text-white",
  ].join(" "),
};