import {
  chatSessionRepository,
  projectRepository,
  type ChatMessageRecord,
  type ChatRole,
  type ChatSessionRecord,
} from "@/repositories";
import { ForbiddenError, NotFoundError } from "@/shared/errors";

export class ChatService {
  /**
   * List all sessions for a project owned by the requester.
   */
  async listSessions(
    projectId: string,
    requesterId: string,
  ): Promise<ChatSessionRecord[]> {
    await this.assertProjectAccess(projectId, requesterId);
    return chatSessionRepository.findAllByProject(projectId, requesterId);
  }

  /**
   * Get a single chat session.
   */
  async getSession(
    sessionId: string,
    requesterId: string,
  ): Promise<ChatSessionRecord> {
    const session = await chatSessionRepository.findById(sessionId, requesterId);
    if (!session) throw new NotFoundError("ChatSession");
    return session;
  }

  /**
   * Create a new chat session for a project.
   */
  async createSession(
    projectId: string,
    requesterId: string,
    title?: string,
  ): Promise<ChatSessionRecord> {
    await this.assertProjectAccess(projectId, requesterId);
    return chatSessionRepository.create(projectId, requesterId, title);
  }

  /**
   * Delete a chat session.
   */
  async deleteSession(sessionId: string, requesterId: string): Promise<void> {
    const session = await chatSessionRepository.findById(sessionId, requesterId);
    if (!session) throw new NotFoundError("ChatSession");
    if (session.userId !== requesterId) throw new ForbiddenError();

    const deleted = await chatSessionRepository.delete(sessionId, requesterId);
    if (!deleted) throw new NotFoundError("ChatSession");
  }

  /**
   * List all messages in a session.
   */
  async listMessages(
    sessionId: string,
    requesterId: string,
  ): Promise<ChatMessageRecord[]> {
    const session = await chatSessionRepository.findById(sessionId, requesterId);
    if (!session) throw new NotFoundError("ChatSession");
    return chatSessionRepository.listMessages(sessionId);
  }

  /**
   * Append a user message to a session.
   * (AI response will be handled separately by the streaming layer.)
   */
  async addUserMessage(
    sessionId: string,
    requesterId: string,
    content: string,
  ): Promise<ChatMessageRecord> {
    const session = await chatSessionRepository.findById(sessionId, requesterId);
    if (!session) throw new NotFoundError("ChatSession");
    if (session.userId !== requesterId) throw new ForbiddenError();

    return chatSessionRepository.addMessage(sessionId, "USER", content);
  }

  /**
   * Persist an assistant reply (called after the AI responds).
   */
  async addAssistantMessage(
    sessionId: string,
    content: string,
    tokens?: number,
  ): Promise<ChatMessageRecord> {
    return chatSessionRepository.addMessage(sessionId, "ASSISTANT", content, tokens);
  }

  // -------------------------------------------------------------------------
  // Private helpers
  // -------------------------------------------------------------------------

  private async assertProjectAccess(projectId: string, userId: string) {
    const project = await projectRepository.findById(projectId, userId);
    if (!project) throw new NotFoundError("Project");
    if (project.ownerId !== userId) throw new ForbiddenError();
  }
}

export const chatService = new ChatService();
