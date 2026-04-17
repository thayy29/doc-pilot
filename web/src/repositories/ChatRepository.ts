import { prisma } from "@/lib/prisma";
import type { ChatRole } from "@prisma/client";

export type { ChatRole };

export type ChatSessionRecord = {
  id: string;
  projectId: string;
  userId: string;
  title: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type ChatMessageRecord = {
  id: string;
  sessionId: string;
  role: ChatRole;
  content: string;
  tokens: number | null;
  createdAt: Date;
};

export interface IchatSessionRepository {
  findById(id: string, userId: string): Promise<ChatSessionRecord | null>;
  findAllByProject(projectId: string, userId: string): Promise<ChatSessionRecord[]>;
  create(projectId: string, userId: string, title?: string): Promise<ChatSessionRecord>;
  delete(id: string, userId: string): Promise<boolean>;
  addMessage(
    sessionId: string,
    role: ChatRole,
    content: string,
    tokens?: number,
  ): Promise<ChatMessageRecord>;
  listMessages(sessionId: string): Promise<ChatMessageRecord[]>;
}

export class ChatSessionRepository implements IchatSessionRepository {
  async findById(id: string, userId: string): Promise<ChatSessionRecord | null> {
    return prisma.chatSession.findFirst({ where: { id, userId } });
  }

  async findAllByProject(
    projectId: string,
    userId: string,
  ): Promise<ChatSessionRecord[]> {
    return prisma.chatSession.findMany({
      where: { projectId, userId },
      orderBy: { updatedAt: "desc" },
      include: { _count: { select: { messages: true } } },
    });
  }

  async create(
    projectId: string,
    userId: string,
    title?: string,
  ): Promise<ChatSessionRecord> {
    return prisma.chatSession.create({
      data: { projectId, userId, title },
    });
  }

  async delete(id: string, userId: string): Promise<boolean> {
    const exists = await prisma.chatSession.findFirst({ where: { id, userId } });
    if (!exists) return false;

    await prisma.chatSession.delete({ where: { id } });
    return true;
  }

  async addMessage(
    sessionId: string,
    role: ChatRole,
    content: string,
    tokens?: number,
  ): Promise<ChatMessageRecord> {
    const message = await prisma.chatMessage.create({
      data: { sessionId, role, content, tokens },
    });

    // Bump session updatedAt so it sorts correctly
    await prisma.chatSession.update({
      where: { id: sessionId },
      data: { updatedAt: new Date() },
    });

    return message;
  }

  async listMessages(sessionId: string): Promise<ChatMessageRecord[]> {
    return prisma.chatMessage.findMany({
      where: { sessionId },
      orderBy: { createdAt: "asc" },
    });
  }
}

export const chatSessionRepository = new ChatSessionRepository();
