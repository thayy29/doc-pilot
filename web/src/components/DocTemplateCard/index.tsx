import Button from "../Button";
import { cardStyles, titleStyles, descriptionStyles, buttonStyles } from "./styles";

type Props = {
  title: string;
  description: string;
  onGenerate?: () => void;
  className?: string;
};

export default function DocTemplateCard({
  title,
  description,
  onGenerate,
  className = "",
}: Props) {
  return (
    <div className={`${cardStyles} ${className}`}>
      <div className={titleStyles}>{title}</div>
      <div className={descriptionStyles}>{description}</div>
      <Button variant="primary" onClick={onGenerate} className={buttonStyles}>
        Gerar
      </Button>
    </div>
  );
}