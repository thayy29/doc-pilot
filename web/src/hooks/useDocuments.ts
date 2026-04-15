"use client";

import { useCallback, useEffect, useState } from "react";
import apiFetch from "@/lib/apiFetch";

// ─── Types ──────────────────────────────────────────────────────────────────

export type DocumentStatus =
  | "PENDING"
  | "PROCESSING"
  | "READY"
  | "FAILED";

export interface ProjectDocument {
  id: string;
  projectId: string;
  title: string;
  fileName: string;
  mimeType: string | null;
  fileSize: number | null;
  status: DocumentStatus;
  createdAt: string;
  updatedAt: string;
}

interface UseDocumentsState {
  documents: ProjectDocument[];
  loading: boolean;
  error: string | null;
}

// ─── Hook ───────────────────────────────────────────────────────────────────

/**
 * Hook para gerenciar documentos de um projeto.
 * Faz polling automático enquanto algum documento estiver em processamento.
 */
export function useDocuments(projectId: string) {
  const [state, setState] = useState<UseDocumentsState>({
    documents: [],
    loading: false,
    error: null,
  });

  const loadDocuments = useCallback(async () => {
    if (!projectId) return;
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const docs = await apiFetch<ProjectDocument[]>(
        `/api/projects/${projectId}/documents`,
      );
      setState({ documents: docs, loading: false, error: null });
    } catch (err) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error:
          err instanceof Error ? err.message : "Erro ao carregar documentos",
      }));
    }
  }, [projectId]);

  const deleteDocument = useCallback(
    async (docId: string) => {
      try {
        await apiFetch(`/api/projects/${projectId}/documents/${docId}`, {
          method: "DELETE",
        });
        setState((prev) => ({
          ...prev,
          documents: prev.documents.filter((d) => d.id !== docId),
        }));
      } catch (err) {
        setState((prev) => ({
          ...prev,
          error:
            err instanceof Error ? err.message : "Erro ao deletar documento",
        }));
      }
    },
    [projectId],
  );

  const addDocument = useCallback((doc: ProjectDocument) => {
    setState((prev) => ({
      ...prev,
      documents: [doc, ...prev.documents],
    }));
  }, []);

  const refreshDocument = useCallback(
    async (docId: string) => {
      try {
        const updated = await apiFetch<ProjectDocument>(
          `/api/projects/${projectId}/documents/${docId}`,
        );
        setState((prev) => ({
          ...prev,
          documents: prev.documents.map((d) =>
            d.id === docId ? updated : d,
          ),
        }));
        return updated;
      } catch {
        return null;
      }
    },
    [projectId],
  );

  // Carrega na montagem
  useEffect(() => {
    loadDocuments();
  }, [loadDocuments]);

  // Polling automático quando há documentos em processamento
  useEffect(() => {
    const hasProcessing = state.documents.some(
      (d) => d.status === "PENDING" || d.status === "PROCESSING",
    );
    if (!hasProcessing) return;

    const interval = setInterval(() => {
      loadDocuments();
    }, 5000);

    return () => clearInterval(interval);
  }, [state.documents, loadDocuments]);

  const hasProcessing = state.documents.some(
    (d) => d.status === "PENDING" || d.status === "PROCESSING",
  );

  return {
    documents: state.documents,
    loading: state.loading,
    error: state.error,
    hasProcessing,
    loadDocuments,
    deleteDocument,
    addDocument,
    refreshDocument,
  };
}
