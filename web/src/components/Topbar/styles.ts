export const containerStyles = [
  "h-docpilot-76 w-full",
  "rounded-2xl border",
  "bg-white border-black/10",
  "dark:bg-[#111418] dark:border-white/10",
  "flex items-center",
  "px-8", // aproxima x=72 dentro de x=40 (padding ~32)
].join(" ");

export const logoTextStyles = [
  "text-docpilot-18 font-black",
  "text-black dark:text-white",
  "leading-none",
].join(" ");

export const logoBarStyles = ["h-5 w-2 rounded", "bg-brand-500"].join(" ");

export const projectSelectorStyles = [
  "h-docpilot-10 w-docpilot-420",
  "rounded-xl border",
  "bg-white border-black/[.12]",
  "dark:bg-[#111418] dark:border-white/[.14]",
  "flex items-center",
  "px-5",
].join(" ");

export const projectSelectorTextStyles = [
  "text-docpilot-11 font-medium",
  "text-[#333333] dark:text-white/70",
  "truncate",
].join(" ");

export const anchorBaseStyles = [
  "h-10 rounded-xl border",
  "px-5",
  "text-docpilot-11 font-black",
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
  "h-docpilot-8 w-docpilot-108 rounded-docpilot-10 border",
  "bg-[#10B981]/[0.12] border-[#10B981]/[0.40] text-[#065F46]",
  "dark:bg-[#10B981]/[0.16] dark:border-[#10B981]/[0.55] dark:text-[#A7F3D0]",
  "inline-flex items-center justify-center",
  "text-[10.5px] font-black uppercase",
  "tracking-wide",
].join(" ");

export const ctaStyles = [
  "h-docpilot-10 w-docpilot-120 rounded-xl",
  "bg-brand-500",
  "text-docpilot-12 font-black",
  "text-white dark:text-[#111418]",
  "inline-flex items-center justify-center",
].join(" ");
