import { getEmbeddings } from "@/lib/openai";
import { embeddingRepository, type SimilarChunk } from "@/repositories";
import { prisma } from "@/lib/prisma";

// ─── Types ─────────────────────────────────────────────────────────────────

export interface RagContext {
  chunks: SimilarChunk[];
  systemPrompt: string;
}

// ─── Constants ─────────────────────────────────────────────────────────────

const BASE_SYSTEM_PROMPT = `Você é o DocPilot, um assistente especializado em análise e consulta de documentação técnica.

Responda SEMPRE em português brasileiro, de forma clara e objetiva.

Diretrizes:
- Use APENAS as informações do contexto fornecido para responder
- Se a informação não estiver no contexto, diga explicitamente que não encontrou nos documentos
- Cite trechos relevantes quando necessário para embasar sua resposta
- Mantenha respostas concisas mas completas
- Para listas ou passos, use formatação markdown
- Não invente ou suponha informações além do contexto`;

// ─── Service ───────────────────────────────────────────────────────────────

export class RagService {
  /**
   * Executa o pipeline RAG:
   * 1. Se OPENAI_API_KEY disponível → busca vetorial semântica (embeddings)
   * 2. Se não → fallback: carrega chunks diretamente do banco de dados
   * 3. Monta o system prompt com o contexto encontrado
   */
  async buildContext(
    query: string,
    projectId: string,
    topK = 10,
    threshold = 0.3,
  ): Promise<RagContext> {
    let chunks: SimilarChunk[];

    const hasEmbeddingKey = !!process.env.OPENAI_API_KEY || !!process.env.GITHUB_TOKEN;

    if (hasEmbeddingKey) {
      // Pipeline completo: embedding da query → busca vetorial
      try {
        const [queryVector] = await getEmbeddings([query]);
        if (!queryVector || queryVector.length === 0) {
          chunks = [];
        } else {
          chunks = await embeddingRepository.findSimilarChunks(
            queryVector,
            projectId,
            topK,
            threshold,
          );
        }
      } catch (err) {
        console.warn("[RagService] Falha na busca vetorial, usando fallback:", err instanceof Error ? err.message : err);
        chunks = await this.loadChunksFallback(projectId, topK);
      }
    } else {
      // Fallback: carrega chunks direto do banco (sem busca semântica)
      chunks = await this.loadChunksFallback(projectId, topK);
    }

    const systemPrompt = this.buildSystemPrompt(chunks);
    return { chunks, systemPrompt };
  }

  /**
   * Fallback: carrega os primeiros chunks de documentos READY do projeto.
   * Usado quando OPENAI_API_KEY não está configurada ou a busca vetorial falha.
   */
  private async loadChunksFallback(
    projectId: string,
    limit: number,
  ): Promise<SimilarChunk[]> {
    const rows = await prisma.chunk.findMany({
      where: {
        document: {
          projectId,
          status: "READY",
        },
      },
      orderBy: { position: "asc" },
      take: limit,
      select: {
        id: true,
        documentId: true,
        content: true,
        position: true,
      },
    });

    return rows.map((r) => ({
      chunkId: r.id,
      documentId: r.documentId,
      content: r.content,
      position: r.position,
      similarity: 1.0, // fallback — sem score real
    }));
  }

  /**
   * Constrói o system prompt injetando os chunks de contexto.
   */
  private buildSystemPrompt(chunks: SimilarChunk[]): string {
    if (chunks.length === 0) {
      return `${BASE_SYSTEM_PROMPT}

CONTEXTO: Nenhum documento relevante foi encontrado para esta consulta. Informe ao usuário que não há documentação disponível sobre este tema.`;
    }

    const contextBlocks = chunks
      .map((chunk, index) => {
        const similarity = (chunk.similarity * 100).toFixed(1);
        return `[Trecho ${index + 1} — relevância ${similarity}%]\n${chunk.content}`;
      })
      .join("\n\n---\n\n");

    return `${BASE_SYSTEM_PROMPT}

CONTEXTO DOS DOCUMENTOS:
${contextBlocks}

Use apenas as informações acima para responder a pergunta do usuário.`;
  }
}

export const ragService = new RagService();
