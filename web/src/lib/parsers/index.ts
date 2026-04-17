import path from "path";
import { parsePlainText } from "./plainTextParser";
import { parsePdf } from "./pdfParser";
import { parseHtml } from "./htmlParser";
import { parseJson, parseYaml } from "./structuredParser";

// ─── Types ─────────────────────────────────────────────────────────────────

export const SUPPORTED_MIME_TYPES = [
  "application/pdf",
  "text/plain",
  "text/plain",
  "text/markdown",
  "text/html",
  "application/json",
  "application/x-yaml",
  "text/yaml",
  "text/csv",
] as const;

export const SUPPORTED_EXTENSIONS = [
  ".pdf",
  ".txt",
  ".md",
  ".ts",
  ".js",
  ".tsx",
  ".jsx",
  ".py",
  ".java",
  ".go",
  ".rs",
  ".html",
  ".htm",
  ".json",
  ".yaml",
  ".yml",
  ".toml",
  ".xml",
  ".env",
  ".csv",
  ".sql",
  ".sh",
  ".dockerfile",
] as const;

export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

export type SupportedMimeType = (typeof SUPPORTED_MIME_TYPES)[number];

// ─── Main ───────────────────────────────────────────────────────────────────

/**
 * Recebe o buffer do arquivo e infere o parser correto pelo
 * nome do arquivo ou MIME type. Retorna o texto extraído.
 *
 * @throws Error se o formato não for suportado ou a extração falhar
 */
export async function parseFile(
  buffer: Buffer,
  fileName: string,
  mimeType?: string,
): Promise<string> {
  const ext = path.extname(fileName).toLowerCase();

  // PDF — prioriza extensão pois mime types podem variar
  if (ext === ".pdf" || mimeType === "application/pdf") {
    return parsePdf(buffer);
  }

  // HTML
  if (ext === ".html" || ext === ".htm" || mimeType === "text/html") {
    return parseHtml(buffer);
  }

  // JSON
  if (ext === ".json" || mimeType === "application/json") {
    return parseJson(buffer);
  }

  // YAML
  if (
    ext === ".yaml" ||
    ext === ".yml" ||
    mimeType === "application/x-yaml" ||
    mimeType === "text/yaml"
  ) {
    return parseYaml(buffer);
  }

  // Texto plano: código-fonte, configs, markdown, CSV, SQL, scripts
  const plainTextExts = [
    ".txt", ".md", ".csv",
    ".ts", ".js", ".tsx", ".jsx",
    ".py", ".java", ".go", ".rs",
    ".toml", ".xml", ".env",
    ".sql", ".sh", ".dockerfile",
  ];
  const plainTextMimes = ["text/plain", "text/markdown", "text/csv"];

  if (plainTextExts.includes(ext) || plainTextMimes.includes(mimeType ?? "")) {
    return parsePlainText(buffer);
  }

  throw new Error(
    `Formato não suportado: "${ext || mimeType}". ` +
      `Formatos aceitos: ${SUPPORTED_EXTENSIONS.join(", ")}`,
  );
}
