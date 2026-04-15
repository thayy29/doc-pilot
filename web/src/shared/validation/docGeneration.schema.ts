import { z } from "zod";
import { DOC_TEMPLATES } from "@/lib/docTemplates";

export const docGenerationSchema = z.object({
  /** ID do template a ser gerado */
  templateId: z.enum(
    Object.values(DOC_TEMPLATES) as [string, ...string[]],
    { error: "Template inválido." },
  ),
  /** Contexto adicional fornecido pelo usuário (opcional) */
  userContext: z
    .string()
    .max(2000, "Contexto adicional muito longo (máx. 2000 caracteres).")
    .optional(),
  /** Número de chunks RAG a usar (default 8 — mais contexto para geração) */
  topK: z.number().int().min(1).max(20).optional().default(8),
  /** Threshold de similaridade para o RAG (default 0.6 — mais abrangente) */
  similarityThreshold: z.number().min(0).max(1).optional().default(0.6),
});

export type DocGenerationInput = z.infer<typeof docGenerationSchema>;
