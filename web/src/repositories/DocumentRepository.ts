import { prisma } from "@/lib/prisma";
import type { DocumentStatus } from "@prisma/client";

export type { DocumentStatus };

export type DocumentRecord = {
  id: string;
  projectId: string;
  title: string;
  fileName: string;
  mimeType: string | null;
  fileSize: number | null;
  content: string | null;
  status: DocumentStatus;
  sourceUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export interface CreateDocumentInput {
  projectId: string;
  title: string;
  fileName: string;
  mimeType?: string;
  fileSize?: number;
  content?: string;
}

export interface IDocumentRepository {
  findById(id: string, projectId: string): Promise<DocumentRecord | null>;
  findAllByProject(projectId: string): Promise<DocumentRecord[]>;
  create(input: CreateDocumentInput): Promise<DocumentRecord>;
  updateStatus(id: string, status: DocumentStatus): Promise<DocumentRecord>;
  saveContent(id: string, content: string): Promise<DocumentRecord>;
  delete(id: string, projectId: string): Promise<boolean>;
}

export class DocumentRepository implements IDocumentRepository {
  async findById(id: string, projectId: string): Promise<DocumentRecord | null> {
    return prisma.document.findFirst({ where: { id, projectId } });
  }

  async findAllByProject(projectId: string): Promise<DocumentRecord[]> {
    return prisma.document.findMany({
      where: { projectId },
      orderBy: { createdAt: "desc" },
    });
  }

  async create(input: CreateDocumentInput): Promise<DocumentRecord> {
    return prisma.document.create({
      data: {
        projectId: input.projectId,
        title: input.title,
        fileName: input.fileName,
        mimeType: input.mimeType,
        fileSize: input.fileSize,
        content: input.content,
        status: "PENDING",
      },
    });
  }

  async updateStatus(id: string, status: DocumentStatus): Promise<DocumentRecord> {
    return prisma.document.update({ where: { id }, data: { status } });
  }

  /**
   * Persiste o texto extraído do arquivo no documento.
   */
  async saveContent(id: string, content: string): Promise<DocumentRecord> {
    return prisma.document.update({ where: { id }, data: { content } });
  }

  async delete(id: string, projectId: string): Promise<boolean> {
    const exists = await prisma.document.findFirst({ where: { id, projectId } });
    if (!exists) return false;

    await prisma.document.delete({ where: { id } });
    return true;
  }
}

export const documentRepository = new DocumentRepository();
