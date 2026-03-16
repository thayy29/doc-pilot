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
    <Card variant="subtle" className={`min-h-[110px] p-5 ${className}`}>
      <div className="flex h-full flex-col justify-between">
        <div>
          <div className="text-[13px] font-black text-black dark:text-white">
            {title}
          </div>
          <div className="mt-1 text-[11px] font-medium text-[#333333] dark:text-white/70">
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