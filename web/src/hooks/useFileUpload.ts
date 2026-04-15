"use client";

import { useState, useCallback } from "react";

// ─── Types ─────────────────────────────────────────────────────────────────

export type UploadStatus = "idle" | "uploading" | "success" | "error";

export interface UploadedDocument {
  id: string;
  projectId: string;
  title: string;
  fileName: string;
  mimeType: string | null;
  fileSize: number | null;
  status: string;
  createdAt: string;
  _meta?: {
    queued: boolean;
    supportedFormats: string[];
  };
}

export interface UseFileUploadOptions {
  projectId: string;
  onSuccess?: (document: UploadedDocument) => void;
  onError?: (message: string) => void;
}

export interface UseFileUploadReturn {
  upload: (file: File, title?: string) => Promise<void>;
  status: UploadStatus;
  progress: number;
  error: string | null;
  uploadedDocument: UploadedDocument | null;
  reset: () => void;
  /** Formatos de arquivo aceitos para uso no atributo `accept` do input */
  acceptedFormats: string;
}

// Formatos suportados pelo backend
const SUPPORTED_EXTENSIONS = [
  ".pdf",
  ".txt",
  ".md",
  ".html",
  ".htm",
  ".json",
  ".yaml",
  ".yml",
  ".csv",
];

const ACCEPTED_INPUT = SUPPORTED_EXTENSIONS.join(",");

const MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

// ─── Hook ───────────────────────────────────────────────────────────────────

/**
 * Hook para upload de documentos com parse automático no servidor.
 *
 * Exemplo de uso:
 * ```tsx
 * const { upload, status, error } = useFileUpload({ projectId });
 *
 * <input type="file" accept={acceptedFormats} onChange={(e) => {
 *   const file = e.target.files?.[0];
 *   if (file) upload(file);
 * }} />
 * ```
 */
export function useFileUpload({
  projectId,
  onSuccess,
  onError,
}: UseFileUploadOptions): UseFileUploadReturn {
  const [status, setStatus] = useState<UploadStatus>("idle");
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [uploadedDocument, setUploadedDocument] = useState<UploadedDocument | null>(null);

  const reset = useCallback(() => {
    setStatus("idle");
    setProgress(0);
    setError(null);
    setUploadedDocument(null);
  }, []);

  const upload = useCallback(
    async (file: File, title?: string) => {
      // Validação client-side antes de enviar
      const ext = "." + file.name.split(".").pop()?.toLowerCase();
      if (!SUPPORTED_EXTENSIONS.includes(ext)) {
        const msg = `Formato "${ext}" não suportado. Use: ${SUPPORTED_EXTENSIONS.join(", ")}`;
        setError(msg);
        setStatus("error");
        onError?.(msg);
        return;
      }

      if (file.size > MAX_SIZE_BYTES) {
        const msg = `Arquivo muito grande. Limite: ${MAX_SIZE_BYTES / 1024 / 1024} MB.`;
        setError(msg);
        setStatus("error");
        onError?.(msg);
        return;
      }

      if (file.size === 0) {
        const msg = "O arquivo está vazio.";
        setError(msg);
        setStatus("error");
        onError?.(msg);
        return;
      }

      setStatus("uploading");
      setProgress(10);
      setError(null);

      try {
        const formData = new FormData();
        formData.append("file", file);
        if (title) formData.append("title", title);

        setProgress(30);

        const response = await fetch(`/api/projects/${projectId}/documents`, {
          method: "POST",
          body: formData,
        });

        setProgress(80);

        const json = await response.json();

        if (!response.ok || !json.ok) {
          throw new Error(json?.error?.message ?? `Erro HTTP ${response.status}`);
        }

        setProgress(100);
        setStatus("success");
        setUploadedDocument(json.data);
        onSuccess?.(json.data);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Erro desconhecido ao fazer upload.";
        setError(message);
        setStatus("error");
        onError?.(message);
      }
    },
    [projectId, onSuccess, onError],
  );

  return {
    upload,
    status,
    progress,
    error,
    uploadedDocument,
    reset,
    acceptedFormats: ACCEPTED_INPUT,
  };
}
