"use client";

import { useState } from "react";
import { useDocuments } from "@/hooks/useDocuments";
import type { ProjectDocument } from "@/hooks/useDocuments";
import type { UploadedDocument } from "@/hooks/useFileUpload";
import Card from "@/components/Card";
import Button from "@/components/Button";
import DocumentStatusBadge from "@/components/DocumentStatusBadge";
import DocumentUpload from "@/components/DocumentUpload";

function formatBytes(bytes: number | null) {
  if (!bytes) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/** Converte o documento retornado pelo upload para o shape local. */
function toProjectDocument(doc: UploadedDocument): ProjectDocument {
  return {
    id: doc.id,
    projectId: doc.projectId,
    title: doc.title,
    fileName: doc.fileName,
    mimeType: doc.mimeType,
    fileSize: doc.fileSize,
    status: (doc.status ?? "PENDING") as ProjectDocument["status"],
    createdAt: doc.createdAt,
    updatedAt: doc.createdAt, // campo não está em UploadedDocument, usa createdAt como fallback
  };
}

type Props = {
  projectId: string;
};

export default function DocumentList({ projectId }: Props) {
  const { documents, loading, error, hasProcessing, addDocument, deleteDocument } =
    useDocuments(projectId);

  const [docToDelete, setDocToDelete] = useState<string | null>(null);

  const handleUploaded = (doc: UploadedDocument) => {
    addDocument(toProjectDocument(doc));
  };

  const handleDelete = async (id: string) => {
    await deleteDocument(id);
    setDocToDelete(null);
  };

  return (
    <div className="space-y-4">
      {/* Upload */}
      <DocumentUpload projectId={projectId} onUploaded={handleUploaded} />

      {/* Indicador de processamento */}
      {hasProcessing && (
        <div className="flex items-center gap-2 rounded-lg bg-warning-subtle px-3 py-2">
          <span className="h-2 w-2 animate-pulse rounded-full bg-warning-text" />
          <p className="text-xs font-semibold text-warning-text">
            Documentos em processamento. Atualizando automaticamente...
          </p>
        </div>
      )}

      {/* Lista de documentos */}
      {loading && documents.length === 0 && (
        <p className="py-4 text-center text-xs font-semibold text-foreground-muted">
          Carregando documentos...
        </p>
      )}

      {!loading && documents.length === 0 && (
        <p className="py-4 text-center text-xs font-semibold text-foreground-muted">
          Nenhum documento ainda. Faça o upload acima.
        </p>
      )}

      {error && (
        <div className="rounded-lg bg-destructive/10 px-3 py-2 text-xs font-semibold text-destructive">
          {error}
        </div>
      )}

      {documents.length > 0 && (
        <div className="space-y-2">
          {documents.map((doc) => (
            <Card
              key={doc.id}
              variant="surface"
              className="group flex items-center justify-between px-4 py-3"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="truncate text-sm font-black text-foreground">
                    {doc.title}
                  </span>
                  <DocumentStatusBadge status={doc.status} />
                </div>
                <div className="mt-0.5 flex items-center gap-2 text-xs font-semibold text-foreground-muted">
                  <span>{doc.fileName}</span>
                  {doc.fileSize !== null && (
                    <>
                      <span>·</span>
                      <span>{formatBytes(doc.fileSize)}</span>
                    </>
                  )}
                </div>
              </div>

              <Button
                variant="ghost"
                className="ml-3 text-xs text-destructive opacity-0 transition-opacity hover:text-destructive group-hover:opacity-100"
                onClick={() => setDocToDelete(doc.id)}
              >
                ✕
              </Button>
            </Card>
          ))}
        </div>
      )}

      {/* Modal de confirmação de exclusão */}
      {docToDelete && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/70"
            onClick={() => setDocToDelete(null)}
          />
          <div className="fixed left-1/2 top-1/2 z-50 w-full max-w-sm -translate-x-1/2 -translate-y-1/2 p-4">
            <Card variant="subtle" className="p-6">
              <div className="space-y-4">
                <div>
                  <h2 className="text-sm font-black text-foreground">
                    Remover documento?
                  </h2>
                  <p className="mt-1 text-xs font-semibold text-foreground-muted">
                    O documento e todos seus embeddings serão removidos.
                  </p>
                </div>
                <div className="flex gap-3">
                  <Button
                    className="flex-1 bg-destructive hover:bg-destructive/90"
                    onClick={() => handleDelete(docToDelete)}
                  >
                    Remover
                  </Button>
                  <Button
                    variant="ghost"
                    className="flex-1"
                    onClick={() => setDocToDelete(null)}
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
