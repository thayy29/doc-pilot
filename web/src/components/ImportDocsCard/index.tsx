import Button from "../Button";
import Card from "../Card";

type Props = {
  onUploadHref?: string;
  className?: string;
}

export default function ImportDocsCard({ className = "" }: Props) {
  return (
    <Card
      variant="subtle"
      className={`flex-1 min-w-0 p-4 ${className}`}
    >
      <div className="flex h-full flex-nowrap items-center justify-between gap-4">
        <div className="min-w-0">
          <div className="text-sm font-black text-foreground">
            Importar documentação
          </div>
          <div className="mt-1 text-xs font-semibold text-foreground-muted">
            Aceita: MD, HTML, TXT, OpenAPI, Postman, CSV
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <Button variant="primary" className="w-28">Upload</Button>
          <Button variant="ghost" className="w-40" disabled>Conectar Wiki</Button>
        </div>
      </div>
    </Card>
  )
}