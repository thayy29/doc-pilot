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
        <h2 className="text-base font-black leading-5 text-foreground">
          {title}
        </h2>
        {subtitle ? (
          <p className="mt-1 text-xs font-semibold leading-4 text-foreground-muted">
            {subtitle}
          </p>
        ) : null}
      </div>
      {right ? <div className="shrink-0">{right}</div> : null}
    </div>
  );
}