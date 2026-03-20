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
  newHref: string;
};

export default function Topbar({ projectLabel, statusLabel, anchors, newHref }: Props) {
  return (
    <div className={containerStyles}>
      <div className="flex items-center">
        <div className={logoTextStyles}>DocPilot</div>
        <div className={logoBarStyles} />
      </div>
      <div className="flex items-center gap-2.5">
        <div className={projectSelectorStyles}>
          <div className={projectSelectorTextStyles}>{projectLabel}</div>
        </div>
        <div className={statusStyles}>{statusLabel}</div>
      </div>
      <div className="flex items-center gap-2">
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
      <div className="ml-auto flex items-center gap-3">
        <ThemeToggle />
        <Link href={newHref} className={ctaStyles}>
          + Novo
        </Link>
      </div>
    </div>
  );
}
