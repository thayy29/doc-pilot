import SourceCard from "../SourceCard";
import { containerStyles, listStyles, subtitleStyles, titleStyles } from "./styles";

type Source = {
  id: string;
  title: string;
  link: string;
  href?: string;
};

type Props = {
  sources: Source[];
  className?: string;
};

export default function SourcesPanel({
  sources,
  className = "",
}: Props) {
  return (
    <div className={`${containerStyles} ${className}`}>
      <div className={titleStyles}>Fontes</div>
      <div className={subtitleStyles}>Links do conteúdo usado na resposta.</div>

      <div className={listStyles}>
        {sources.map((source) => (
          <SourceCard
            key={source.id}
            title={source.title}
            link={source.link}
            href={source.href}
          />
        ))}
      </div>
    </div>
  );
}