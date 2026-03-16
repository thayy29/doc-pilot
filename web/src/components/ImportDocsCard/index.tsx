import Button from "../Button";
import Card from "../Card";

type Props = {
  onUploadHref?: string;
  className?: string;
}

export default function ImportDocsCard({ onUploadHref, className = "" }: Props) {
  return (
    <Card
      variant="subtle"
      className={`min-h-[110px] w-full p-5 ${className}`}
    >
      <div className="flex h-full flex-nowrap items-center justify-between gap-6">
        <div className="min-w-0">
          <div className="text-[13px] font-black text-black dark:text-white">
            Importar documentação
          </div>
          <div className="mt-1 text-[11px] font-medium text-[#333333] dark:text-white/70">
            Aceita: MD, HTML, TXT, OpenAPI, Postman, CSV
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <Button variant="primary" className="w-[120px]">Upload</Button>
          <Button variant="ghost" className="w-[160px]" disabled>Conectar Wiki</Button>
        </div>
      </div>
    </Card>
  )
}