import { z } from "zod";

// Estes valores são re-exportados daqui para compatibilidade com código existente.
// A fonte canônica é src/lib/parsers/index.ts
const ACCEPTED_MIME_TYPES = [
  "application/pdf",
  "text/plain",
  "text/markdown",
  "text/html",
  "application/json",
  "application/x-yaml",
  "text/yaml",
  "text/csv",
];

const ACCEPTED_EXTENSIONS = [".pdf", ".txt", ".md", ".html", ".htm", ".json", ".yaml", ".yml", ".csv"];

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

export const uploadDocumentSchema = z.object({
  projectId: z.string().min(1, "projectId is required"),
  title: z.string().min(1).max(200).trim(),
});

export { ACCEPTED_MIME_TYPES, ACCEPTED_EXTENSIONS, MAX_FILE_SIZE_BYTES };
