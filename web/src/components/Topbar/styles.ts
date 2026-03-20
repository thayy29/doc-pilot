export const containerStyles = [
  "w-full shrink-0",
  "rounded-2xl border border-border",
  "bg-surface",
  "flex flex-wrap items-center gap-2 sm:gap-3 md:gap-4 lg:gap-8",
  "px-3 py-2 sm:px-4 sm:py-3 md:px-6 lg:px-8",
  "md:h-20 md:flex-nowrap md:py-0",
].join(" ");

export const logoTextStyles = "text-lg font-black text-foreground leading-none";

export const logoBarStyles = "h-5 w-2 rounded bg-brand ml-4";

export const projectSelectorStyles = [
  "h-8 min-w-0 flex-1 sm:h-10 sm:max-w-64 md:max-w-80 lg:max-w-96",
  "rounded-xl border border-border-strong",
  "bg-surface",
  "flex items-center",
  "px-3 sm:px-4 md:px-5",
].join(" ");

export const projectSelectorTextStyles = "text-xs font-semibold text-foreground-muted truncate";

export const anchorBaseStyles = [
  "h-10 rounded-xl border",
  "px-5",
  "text-xs font-black",
  "inline-flex items-center justify-center",
  "transition-colors",
  "select-none",
].join(" ");

export const anchorInactiveStyles = "bg-surface border-border-strong text-foreground-muted";

export const anchorActiveStyles = "bg-brand-subtle border-brand-subtle-border text-brand";

export const statusStyles = [
  "h-8 px-4 rounded-lg border",
  "bg-success-subtle border-success-border text-success-text",
  "inline-flex items-center justify-center",
  "text-xs font-black uppercase",
  "tracking-wide",
].join(" ");

export const ctaStyles = [
  "h-10 px-6 rounded-xl",
  "bg-brand",
  "text-xs font-black",
  "text-brand-text",
  "inline-flex items-center justify-center",
].join(" ");
