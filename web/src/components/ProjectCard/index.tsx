import Badge from "../Badge";
import Button from "../Button";
import Card from "../Card";

type BadgeVariant = "success" | "warning" | "info";
type Props = {
  title: string;
  source: string;
  pages: number;
  badgeVariant: BadgeVariant;
  badgeLabel: string;
  onOpenHref?: string;
  className?: string;
};

export default function ProjectCard({ title,
  source,
  pages,
  badgeVariant,
  badgeLabel,
  className = "", }: Props) {
  return (
    <Card variant="subtle" className={`min-h-docpilot-110 p-docpilot-5 ${className}`}>
      <div className="flex h-full flex-col justify-between">
        <div>
          <div className="text-docpilot-13 font-black text-black dark:text-white">
            {title}
          </div>
          <div className="mt-docpilot-1 text-docpilot-11 font-medium text-[#333333] dark:text-white/70">
            Fonte: {source} • {pages} páginas
          </div>
        </div>
        <div className="flex items-center justify-between">
          <Badge variant={badgeVariant}>{badgeLabel}</Badge>
          <Button variant="ghost">Abrir</Button>
        </div>
      </div>
    </Card>
  )
}