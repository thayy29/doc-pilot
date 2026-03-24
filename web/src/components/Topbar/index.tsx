import {
  anchorActiveStyles,
  anchorBaseStyles,
  anchorInactiveStyles,
  containerStyles,
  logoBarStyles,
  logoTextStyles,
  projectSelectorStyles,
  projectSelectorTextStyles,
  statusStyles,
  ctaStyles,
} from "./styles";
import Link from "next/link";
import ThemeToggle from "../ThemeToggle";

type Anchor = {
  key: string;
  label: string;
  active?: boolean;
  href: string;
};

type Props = {
  projectLabel: string;
  statusLabel: string;
  anchors: Anchor[];
  newHref?: string;
  onNewClick?: () => void;
};

export default function Topbar({
  projectLabel,
  statusLabel,
  anchors,
  newHref,
  onNewClick,
}: Props) {
  return (
    <div className={containerStyles}>
      <div className="flex items-center">
        <div className={logoTextStyles}>DocPilot</div>
        <div className={`hidden sm:block ${logoBarStyles}`} />
      </div>
      <div className="flex min-w-0 flex-1 items-center gap-2 sm:flex-none sm:gap-2.5">
        <div className={projectSelectorStyles}>
          <div className={projectSelectorTextStyles}>{projectLabel}</div>
        </div>
        <div className={`hidden md:flex ${statusStyles}`}>{statusLabel}</div>
      </div>
      <div className="hidden items-center gap-2 md:flex">
        {anchors.map((a) => (
          <Link
            key={a.key}
            href={a.href}
            className={[
              anchorBaseStyles,
              a.active ? anchorActiveStyles : anchorInactiveStyles,
            ].join(" ")}
          >
            {a.label}
          </Link>
        ))}
      </div>
      <div className="ml-auto flex items-center gap-2 sm:gap-3">
        <ThemeToggle />
        {/* Usar button se onNewClick for fornecido, senão usar Link */}
        {onNewClick ? (
          <button
            onClick={onNewClick}
            className={ctaStyles}
          >
            <span className="hidden sm:inline">+ Novo</span>
            <span className="sm:hidden">+</span>
          </button>
        ) : (
          <Link href={newHref || "#"} className={ctaStyles}>
            <span className="hidden sm:inline">+ Novo</span>
            <span className="sm:hidden">+</span>
          </Link>
        )}
      </div>
    </div>
  );
}