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
      <div className="flex w-docpilot-138 items-center gap-docpilot-3">
        <div className={logoTextStyles}>DocPilot</div>
        <div className="ml-auto">
          <div className={logoBarStyles} />
        </div>
      </div>
      <div className="ml-docpilot-42 flex items-center">
        <div className="flex items-center gap-docpilot-10">
          <div className={projectSelectorStyles}>
            <div className={projectSelectorTextStyles}>{projectLabel}</div>
          </div>
          <div className={statusStyles}>{statusLabel}</div>
        </div>
        <div className="ml-docpilot-22 flex items-center gap-2">
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
      </div>
      <div className="ml-auto">
        <Link href={newHref} className={ctaStyles}>
          + Novo
        </Link>
      </div>

    </div>

  )
}
