import { getEmbeddings } from "@/lib/openai";
import { embeddingRepository } from "@/repositories";
import { projectRepository } from "@/repositories";
import { getTemplate, type DocTemplate, type TemplateDefinition } from "@/lib/docTemplates";
import { ForbiddenError, NotFoundError } from "@/shared/errors";
import type { SimilarChunk } from "@/repositories";
import { prisma } from "@/lib/prisma";

// ─── Types ─────────────────────────────────────────────────────────────────

export interface DocGenerationContext {
  template: TemplateDefinition;
  chunks: SimilarChunk[];
  /** System prompt final com template + contexto RAG injetados */
  systemPrompt: string;
  /** Mensagem do usuário enviada ao Claude */
  userPrompt: string;
}

// ─── Service ───────────────────────────────────────────────────────────────

export class DocGenerationService {
  /**
   * Valida acesso ao projeto e monta o contexto completo para geração.
   * Separa lógica de negócio do handler HTTP.
   */
  async buildGenerationContext(
    projectId: string,
    requesterId: string,
    templateId: DocTemplate,
    userContext?: string,
    topK = 8,
    threshold = 0.6,
  ): Promise<DocGenerationContext> {
    // 1. Valida acesso ao projeto
    const project = await projectRepository.findById(projectId, requesterId);
    if (!project) throw new NotFoundError("Project");
    if (project.ownerId !== requesterId) throw new ForbiddenError();

    // 2. Obtém definição do template
    const template = getTemplate(templateId);

    // 3. Pipeline RAG: embedding da query do template → chunks similares
    const ragQuery = userContext
      ? `${template.ragQuery}. ${userContext}`
      : template.ragQuery;

    let chunks: SimilarChunk[] = [];

    if (process.env.OPENAI_API_KEY) {
      try {
        const [queryVector] = await getEmbeddings([ragQuery]);
        if (queryVector?.length) {
          chunks = await embeddingRepository.findSimilarChunks(queryVector, projectId, topK, threshold);
        }
      } catch {
        // Fallback abaixo
      }
    }

    // Fallback: carrega chunks direto do banco
    if (chunks.length === 0) {
      const rows = await prisma.chunk.findMany({
        where: { document: { projectId, status: "READY" } },
        orderBy: { position: "asc" },
        take: topK,
        select: { id: true, documentId: true, content: true, position: true },
      });
      chunks = rows.map((r) => ({
        chunkId: r.id,
        documentId: r.documentId,
        content: r.content,
        position: r.position,
        similarity: 1.0,
      }));
    }

    // 4. Monta os prompts com contexto injetado
    const systemPrompt = this.buildSystemPrompt(template, project.name, chunks);
    const userPrompt = this.buildUserPrompt(template, userContext);

    return { template, chunks, systemPrompt, userPrompt };
  }

  // ─── Private ─────────────────────────────────────────────────────────────

  private buildSystemPrompt(
    template: TemplateDefinition,
    projectName: string,
    chunks: SimilarChunk[],
  ): string {
    const contextSection =
      chunks.length > 0
        ? chunks
            .map((c, i) => `[Trecho ${i + 1} — relevância ${(c.similarity * 100).toFixed(1)}%]\n${c.content}`)
            .join("\n\n---\n\n")
        : "Nenhum documento encontrado no projeto. Gere a estrutura do template com placeholders indicando onde o conteúdo deve ser inserido.";

    return `${template.systemPrompt}

PROJETO: "${projectName}"

ESTRUTURA ESPERADA DO DOCUMENTO:
${template.structure}

CONTEÚDO DOS DOCUMENTOS DO PROJETO:
${contextSection}

INSTRUÇÕES FINAIS:
- Preencha a estrutura acima com base no conteúdo dos documentos
- Substitua todos os placeholders [colchetes] pelo conteúdo real
- Se faltar informação para uma seção, omita-a ou indique "[A preencher]"
- Retorne APENAS o documento em markdown, sem explicações adicionais`;
  }

  private buildUserPrompt(template: TemplateDefinition, userContext?: string): string {
    const base = `Gere um ${template.label} completo para este projeto.`;
    return userContext ? `${base}\n\nContexto adicional fornecido:\n${userContext}` : base;
  }
}

export const docGenerationService = new DocGenerationService();
