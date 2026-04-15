import { rateLimit } from "@/middleware/rateLimit";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { type NextRequest } from "next/server";
import { documentService } from "@/server/services";
import { requireAuth } from "@/shared/auth";
import { ok, created, handleError, fail } from "@/shared/http";
import { uploadDocumentSchema } from "@/shared/validation";
import { MAX_FILE_SIZE_BYTES, SUPPORTED_EXTENSIONS } from "@/lib/parsers";

type ProjectParams = { params: Promise<{ id: string }> };

// GET /api/projects/[id]/documents
export async function GET(_req: NextRequest, { params }: ProjectParams) {
  try {
    const user = await requireAuth();
    const { id: projectId } = await params;
    const documents = await documentService.listByProject(projectId, user.id);
    return ok(documents);
  } catch (error) {
    return handleError(error);
  }
}

// POST /api/projects/[id]/documents
// Content-Type: multipart/form-data
// Fields:
//   file  — File (obrigatório) — PDF, MD, TXT, HTML, JSON, YAML, CSV
//   title — string (opcional, usa nome do arquivo como fallback)
export async function POST(request: NextRequest, { params }: ProjectParams) {
  const limited = rateLimit(request);
  if (limited) return limited;

  try {
    const user = await requireAuth();
    const { id: projectId } = await params;

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const titleField = formData.get("title") as string | null;

    if (!file) {
      return fail("BAD_REQUEST", "Campo 'file' é obrigatório.", 400);
    }

    if (file.size === 0) {
      return fail("BAD_REQUEST", "Arquivo vazio não é permitido.", 400);
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      return fail(
        "FILE_TOO_LARGE",
        `Arquivo excede o limite de ${MAX_FILE_SIZE_BYTES / 1024 / 1024} MB ` +
          `(recebido ${Math.round(file.size / 1024)} KB).`,
        413,
      );
    }

    // Validação de schema (título + projectId)
    const input = uploadDocumentSchema.parse({
      projectId,
      title: titleField?.trim() || file.name,
    });

    // Converte File para Buffer para o parser
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Pipeline completo: parse → salva → enfileira
    const document = await documentService.processUpload(
      user.id,
      {
        projectId: input.projectId,
        title: input.title,
        fileName: file.name,
        mimeType: file.type || undefined,
        fileSize: file.size,
      },
      buffer,
    );

    return created({
      ...document,
      // Não expõe o conteúdo completo na resposta de criação
      content: undefined,
      queued: true,
    });
  } catch (error) {
    return handleError(error);
  }
}

