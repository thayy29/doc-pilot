import { cardStyles, titleStyles, linkStyles } from "./styles";
type Props = {
  title: string;
  link: string;
  href?: string;
  className?: string;
};
export default function SourceCard({
  title,
  link,
  href,
  className = "",
}: Props) {
  const content = (
    <>
      <div className={titleStyles}>{title}</div>
      <div className={linkStyles}>{link}</div>
    </>
  );
  if (href) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={`${cardStyles} block ${className}`}>
        {content}
      </a>
    );
  }
  return (
    <div className={`${cardStyles} ${className}`}>
      {content}
    </div>
  );
}