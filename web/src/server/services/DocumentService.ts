import {
  documentRepository,
  projectRepository,
  type DocumentRecord,
} from "@/repositories";
import {
  BadRequestError,
  ForbiddenError,
  NotFoundError,
  ValidationError,
} from "@/shared/errors";
import {
  SUPPORTED_EXTENSIONS,
  SUPPORTED_MIME_TYPES,
  MAX_FILE_SIZE_BYTES,
  parseFile,
} from "@/lib/parsers";
import { getDocumentQueue } from "@/lib/documentQueue";
import path from "path";

export interface UploadDocumentInput {
  projectId: string;
  title: string;
  fileName: string;
  mimeType?: string;
  fileSize?: number;
}

export class DocumentService {
  /**
   * List all documents for a project — validates ownership.
   */
  async listByProject(
    projectId: string,
    requesterId: string,
  ): Promise<DocumentRecord[]> {
    await this.assertProjectAccess(projectId, requesterId);
    return documentRepository.findAllByProject(projectId);
  }

  /**
   * Get a single document by id within a project.
   */
  async getById(
    id: string,
    projectId: string,
    requesterId: string,
  ): Promise<DocumentRecord> {
    await this.assertProjectAccess(projectId, requesterId);
    const doc = await documentRepository.findById(id, projectId);
    if (!doc) throw new NotFoundError("Document");
    return doc;
  }

  /**
   * Registra o documento no banco sem processar o conteúdo.
   * Útil para fluxos onde o arquivo será processado depois.
   */
  async registerUpload(
    requesterId: string,
    input: UploadDocumentInput,
  ): Promise<DocumentRecord> {
    await this.assertProjectAccess(input.projectId, requesterId);
    this.validateFile(input.fileName, input.mimeType, input.fileSize);

    return documentRepository.create({
      projectId: input.projectId,
      title: input.title,
      fileName: input.fileName,
      mimeType: input.mimeType,
      fileSize: input.fileSize,
    });
  }

  /**
   * Pipeline completo de upload:
   * 1. Valida permissão e arquivo
   * 2. Persiste o documento (status PENDING)
   * 3. Faz parse do buffer (PDF/MD/TXT/HTML/JSON/YAML)
   * 4. Salva o conteúdo extraído no documento
   * 5. Enfileira o documento para geração de embeddings
   *
   * @returns Documento criado com status PENDING (worker processará em background)
   */
  async processUpload(
    requesterId: string,
    input: UploadDocumentInput,
    fileBuffer: Buffer,
  ): Promise<DocumentRecord> {
    await this.assertProjectAccess(input.projectId, requesterId);
    this.validateFile(input.fileName, input.mimeType, input.fileSize);

    // 1. Cria o registro do documento
    const document = await documentRepository.create({
      projectId: input.projectId,
      title: input.title,
      fileName: input.fileName,
      mimeType: input.mimeType,
      fileSize: input.fileSize,
    });

    // 2. Parse do conteúdo (pode lançar erro — documento fica PENDING)
    let extractedText: string;
    try {
      extractedText = await parseFile(fileBuffer, input.fileName, input.mimeType);
    } catch (error) {
      await documentRepository.updateStatus(document.id, "FAILED");
      const msg = error instanceof Error ? error.message : "Falha no parse do arquivo.";
      throw new BadRequestError(msg);
    }

    // 3. Persiste o texto extraído
    const updatedDoc = await documentRepository.saveContent(document.id, extractedText);

    // 4. Enfileira para geração de embeddings (assíncrono)
    try {
      const queue = getDocumentQueue();
      await queue.add("process", { documentId: document.id });
    } catch {
      // Redis pode estar indisponível — log do erro mas não falha o upload
      console.warn(
        `[DocumentService] Falha ao enfileirar documento ${document.id}. ` +
          "Processe manualmente via POST /api/documents/process",
      );
    }

    return updatedDoc;
  }

  /**
   * Delete a document — validates project ownership.
   */
  async delete(
    id: string,
    projectId: string,
    requesterId: string,
  ): Promise<void> {
    await this.assertProjectAccess(projectId, requesterId);

    const deleted = await documentRepository.delete(id, projectId);
    if (!deleted) throw new NotFoundError("Document");
  }

  // -------------------------------------------------------------------------
  // Private helpers
  // -------------------------------------------------------------------------

  private async assertProjectAccess(projectId: string, userId: string) {
    const project = await projectRepository.findById(projectId, userId);
    if (!project) throw new NotFoundError("Project");
    if (project.ownerId !== userId) throw new ForbiddenError();
  }

  private validateFile(
    fileName: string,
    mimeType?: string,
    fileSize?: number,
  ): void {
    const ext = path.extname(fileName).toLowerCase() as (typeof SUPPORTED_EXTENSIONS)[number];

    if (!SUPPORTED_EXTENSIONS.includes(ext)) {
      throw new ValidationError(
        `Extensão "${ext}" não suportada. Formatos aceitos: ${SUPPORTED_EXTENSIONS.join(", ")}`,
      );
    }

    if (mimeType && !SUPPORTED_MIME_TYPES.includes(mimeType as (typeof SUPPORTED_MIME_TYPES)[number])) {
      throw new BadRequestError(`MIME type "${mimeType}" não é aceito.`);
    }

    if (fileSize !== undefined && fileSize > MAX_FILE_SIZE_BYTES) {
      throw new BadRequestError(
        `Arquivo excede o limite de ${MAX_FILE_SIZE_BYTES / 1024 / 1024} MB ` +
          `(recebido ${Math.round(fileSize / 1024)} KB).`,
      );
    }
  }
}

export const documentService = new DocumentService();

