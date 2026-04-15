"use client";

import { useCallback, useRef, useState } from "react";
import { useFileUpload } from "@/hooks/useFileUpload";
import type { UploadedDocument } from "@/hooks/useFileUpload";
import Button from "@/components/Button";
import Card from "@/components/Card";

type Props = {
  projectId: string;
  onUploaded?: (doc: UploadedDocument) => void;
};

export default function DocumentUpload({ projectId, onUploaded }: Props) {
  const { upload, status, progress, error, acceptedFormats, reset } =
    useFileUpload({
      projectId,
      onSuccess: (doc) => {
        onUploaded?.(doc);
        setTimeout(reset, 3000);
      },
    });

  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFile = useCallback(
    (file: File) => {
      if (status === "uploading") return;
      upload(file);
    },
    [status, upload],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile],
  );

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    // Reset o input para permitir re-upload do mesmo arquivo
    e.target.value = "";
  };

  const isUploading = status === "uploading";
  const isSuccess = status === "success";
  const isError = status === "error";

  return (
    <div className="space-y-3">
      {/* Área de drag & drop */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => !isUploading && inputRef.current?.click()}
        className={[
          "flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-8 transition-all",
          isDragging
            ? "border-brand bg-brand/5"
            : "border-border hover:border-brand/50 hover:bg-subtle",
          isUploading ? "pointer-events-none opacity-60" : "",
        ].join(" ")}
      >
        <input
          ref={inputRef}
          type="file"
          accept={acceptedFormats}
          onChange={handleInputChange}
          className="hidden"
          disabled={isUploading}
        />

        {isUploading ? (
          <div className="flex w-full flex-col items-center gap-3">
            <div className="text-sm font-semibold text-foreground-muted">
              Enviando... {progress}%
            </div>
            <div className="h-1.5 w-full max-w-xs rounded-full bg-border">
              <div
                className="h-1.5 rounded-full bg-brand transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        ) : isSuccess ? (
          <div className="flex flex-col items-center gap-2">
            <span className="text-2xl">✅</span>
            <p className="text-sm font-semibold text-foreground">
              Documento enviado com sucesso!
            </p>
            <p className="text-xs font-semibold text-foreground-muted">
              Processamento em fila...
            </p>
          </div>
        ) : (
          <>
            <span className="text-3xl">📄</span>
            <div className="text-center">
              <p className="text-sm font-black text-foreground">
                Arraste um arquivo ou{" "}
                <span className="text-brand underline">clique para selecionar</span>
              </p>
              <p className="mt-1 text-xs font-semibold text-foreground-muted">
                PDF, TXT, MD, HTML, JSON, YAML, CSV — até 10 MB
              </p>
            </div>
          </>
        )}
      </div>

      {/* Mensagem de erro */}
      {isError && error && (
        <Card variant="surface" className="border-destructive/20 bg-destructive/5 px-4 py-3">
          <p className="text-xs font-semibold text-destructive">{error}</p>
          <Button
            variant="ghost"
            className="mt-2 text-xs"
            onClick={reset}
          >
            Tentar novamente
          </Button>
        </Card>
      )}
    </div>
  );
}
