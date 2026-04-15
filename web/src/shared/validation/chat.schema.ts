import { z } from "zod";

export const createChatSessionSchema = z.object({
  projectId: z.string().min(1, "projectId is required"),
  title: z.string().max(200).trim().optional(),
});

export const createChatMessageSchema = z.object({
  content: z
    .string()
    .min(1, "Message content must not be empty")
    .max(10_000, "Message too long"),
});

export const chatStreamSchema = z.object({
  sessionId: z.string().min(1, "sessionId is required"),
  message: z
    .string()
    .min(1, "Message must not be empty")
    .max(10_000, "Message too long"),
  projectId: z.string().min(1, "projectId is required"),
  /** Quantos chunks de contexto usar no RAG (default 5) */
  topK: z.number().int().min(1).max(20).optional().default(5),
  /** Limiar de similaridade 0-1 (default 0.7) */
  similarityThreshold: z.number().min(0).max(1).optional().default(0.7),
});

export type CreateChatSessionInput = z.infer<typeof createChatSessionSchema>;
export type CreateChatMessageInput = z.infer<typeof createChatMessageSchema>;
export type ChatStreamInput = z.infer<typeof chatStreamSchema>;
