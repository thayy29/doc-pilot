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
    <Card variant="subtle" className={`flex-1 min-w-0 p-4 ${className}`}>
      <div className="flex h-full flex-col justify-between">
        <div>
          <div className="text-sm font-black text-foreground truncate">
            {title}
          </div>
          <div className="mt-1 text-xs font-semibold text-foreground-muted">
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