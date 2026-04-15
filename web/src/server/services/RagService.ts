import { getEmbeddings } from "@/lib/openai";
import { embeddingRepository, type SimilarChunk } from "@/repositories";

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
   * Executa o pipeline RAG completo:
   * 1. Gera embedding da query do usuário
   * 2. Busca chunks semanticamente similares no projeto
   * 3. Monta o system prompt com o contexto encontrado
   *
   * @returns Contexto RAG com chunks e prompt pronto para o LLM
   */
  async buildContext(
    query: string,
    projectId: string,
    topK = 5,
    threshold = 0.7,
  ): Promise<RagContext> {
    // 1. Gera embedding da query
    const [queryVector] = await getEmbeddings([query]);

    if (!queryVector || queryVector.length === 0) {
      return { chunks: [], systemPrompt: BASE_SYSTEM_PROMPT };
    }

    // 2. Busca chunks similares via pgvector
    const chunks = await embeddingRepository.findSimilarChunks(
      queryVector,
      projectId,
      topK,
      threshold,
    );

    // 3. Monta prompt contextualizado
    const systemPrompt = this.buildSystemPrompt(chunks);

    return { chunks, systemPrompt };
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
