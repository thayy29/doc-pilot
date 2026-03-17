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
      className={`min-h-docpilot-110 w-full p-docpilot-5 ${className}`}
    >
      <div className="flex h-full flex-nowrap items-center justify-between gap-6">
        <div className="min-w-0">
          <div className="text-docpilot-13 font-black text-black dark:text-white">
            Importar documentação
          </div>
          <div className="mt-docpilot-1 text-docpilot-11 font-medium text-[#333333] dark:text-white/70">
            Aceita: MD, HTML, TXT, OpenAPI, Postman, CSV
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <Button variant="primary" className="w-docpilot-120">Upload</Button>
          <Button variant="ghost" className="w-docpilot-160" disabled>Conectar Wiki</Button>
        </div>
      </div>
    </Card>
  )
}