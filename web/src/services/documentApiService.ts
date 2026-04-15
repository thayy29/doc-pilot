import apiFetch from "@/lib/apiFetch";

export type DocumentStatus = "PENDING" | "PROCESSING" | "READY" | "FAILED";

export interface DocumentRecord {
  id: string;
  projectId: string;
  title: string;
  fileName: string;
  mimeType: string | null;
  fileSize: number | null;
  status: DocumentStatus;
  sourceUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

const base = (projectId: string) => `/api/projects/${projectId}/documents`;

export const documentApiService = {
  listByProject: (projectId: string): Promise<DocumentRecord[]> =>
    apiFetch<DocumentRecord[]>(base(projectId)),

  getById: (projectId: string, docId: string): Promise<DocumentRecord> =>
    apiFetch<DocumentRecord>(`${base(projectId)}/${docId}`),

  upload: async (
    projectId: string,
    file: File,
    title?: string,
  ): Promise<DocumentRecord> => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("title", title ?? file.name);

    const res = await fetch(base(projectId), {
      method: "POST",
      body: formData,
      // Do NOT set Content-Type — browser sets it with boundary automatically
    });

    const payload = await res.json();
    if (!res.ok) {
      throw new Error(payload?.error?.message ?? "Upload failed");
    }
    return payload.data as DocumentRecord;
  },

  delete: (projectId: string, docId: string): Promise<void> =>
    apiFetch<void>(`${base(projectId)}/${docId}`, { method: "DELETE" }),
};
