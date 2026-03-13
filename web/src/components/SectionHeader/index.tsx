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
        <h2 className="text-[15px] font-black leading-[20px] text-black dark:text-white">
          {title}
        </h2>
        {subtitle ? (
          <p className="mt-[4px] text-[11px] font-medium leading-[16px] text-[#333333] dark:text-white/70">
            {subtitle}
          </p>
        ) : null}
      </div>
      {right ? <div className="shrink-0 pt-[1px]">{right}</div> : null}
    </div>
  );
}