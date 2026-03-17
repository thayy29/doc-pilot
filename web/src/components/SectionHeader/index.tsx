import type { ReactNode } from "react";

type Props = {
  title: string;
  subtitle?: string;
  right?: ReactNode;
  className?: string;
};

export default function SectionHeader({
  title,
  subtitle,
  right,
  className = "",
}: Props) {
  return (
    <div className={`flex w-full items-start justify-between gap-4 ${className}`}>
      <div className="min-w-0">
        <h2 className="text-docpilot-15 font-black leading-docpilot-20 text-black dark:text-white">
          {title}
        </h2>
        {subtitle ? (
          <p className="mt-docpilot-1 text-docpilot-11 font-medium leading-docpilot-16 text-[#333333] dark:text-white/70">
            {subtitle}
          </p>
        ) : null}
      </div>
      {right ? <div className="shrink-0 pt-docpilot-1">{right}</div> : null}
    </div>
  );
}