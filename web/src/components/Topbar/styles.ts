export const containerStyles = [
  "h-[76px] w-full",
  "rounded-2xl border",
  "bg-white border-black/10",
  "dark:bg-[#111418] dark:border-white/10",
  "flex items-center",
  "px-8", // aproxima x=72 dentro de x=40 (padding ~32)
].join(" ");

export const logoTextStyles = [
  "text-[18px] font-black",
  "text-black dark:text-white",
  "leading-none",
].join(" ");

export const logoBarStyles = [
  "h-5 w-2 rounded",
  "bg-brand-500",
].join(" ");

export const projectSelectorStyles = [
  "h-10 w-[420px]",
  "rounded-xl border",
  "bg-white border-black/[.12]",
  "dark:bg-[#111418] dark:border-white/[.14]",
  "flex items-center",
  "px-5",
].join(" ");

export const projectSelectorTextStyles = [
  "text-[11px] font-medium",
  "text-[#333333] dark:text-white/70",
  "truncate",
].join(" ");

export const anchorBaseStyles = [
  "h-10 rounded-xl border",
  "px-5",
  "text-[11px] font-black",
  "inline-flex items-center justify-center",
  "transition-colors",
  "select-none",
].join(" ");

export const anchorInactiveStyles = [
  "bg-white border-black/[.12] text-[#333333]",
  "dark:bg-[#111418] dark:border-white/[.14] dark:text-white/[.78]",
].join(" ");

export const anchorActiveStyles = [
  "bg-brand-500/10 border-brand-500/35 text-brand-500",
  "dark:bg-brand-500/[.14] dark:border-brand-500/[.55] dark:text-brand-500",
].join(" ");

export const statusStyles = [
  "h-8 w-[108px] rounded-[10px] border",
  "bg-[#10B981]/[0.12] border-[#10B981]/[0.40] text-[#065F46]",
  "dark:bg-[#10B981]/[0.16] dark:border-[#10B981]/[0.55] dark:text-[#A7F3D0]",
  "inline-flex items-center justify-center",
  "text-[10.5px] font-black uppercase",
  "tracking-wide",
].join(" ");

export const ctaStyles = [
  "h-10 w-[120px] rounded-xl",
  "bg-brand-500",
  "text-[12px] font-black",
  "text-white dark:text-[#111418]",
  "inline-flex items-center justify-center",
].join(" ");