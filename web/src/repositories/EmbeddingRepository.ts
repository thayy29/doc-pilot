import { prisma } from "@/lib/prisma";

// ─── Types ─────────────────────────────────────────────────────────────────

export interface SimilarChunk {
  chunkId: string;
  documentId: string;
  content: string;
  position: number;
  similarity: number;
}

// ─── Repository ────────────────────────────────────────────────────────────

export class EmbeddingRepository {
  /**
   * Persiste um embedding vetorial usando pgvector.
   */
  async createEmbedding(data: {
    chunkId: string;
    vector: number[];
    provider: string;
    model: string;
    dimensions?: number;
  }): Promise<void> {
    const vectorStr = `[${data.vector.join(",")}]`;
    await prisma.$executeRawUnsafe(
      `INSERT INTO "embeddings" ("id", "chunkId", "vector", "provider", "model", "dimensions", "createdAt", "updatedAt")
       VALUES (gen_random_uuid(), $1, $2::vector, $3, $4, $5, now(), now())`,
      data.chunkId,
      vectorStr,
      data.provider,
      data.model,
      data.dimensions ?? 1536,
    );
  }

  /**
   * Busca semântica por similaridade de cosseno via pgvector.
   * Filtra apenas chunks de documentos READY dentro do projeto.
   *
   * @param queryVector  Embedding da query do usuário
   * @param projectId    Limita a busca ao projeto
   * @param topK         Número máximo de resultados (padrão 5)
   * @param threshold    Similaridade mínima 0-1 (padrão 0.7)
   */
  async findSimilarChunks(
    queryVector: number[],
    projectId: string,
    topK = 5,
    threshold = 0.7,
  ): Promise<SimilarChunk[]> {
    const vectorStr = `[${queryVector.join(",")}]`;

    const rows = await prisma.$queryRawUnsafe<SimilarChunk[]>(
      `
      SELECT
        e."chunkId",
        c."documentId",
        c.content,
        c.position,
        1 - (e.vector <=> $1::vector) AS similarity
      FROM "embeddings" e
      JOIN "chunks" c ON c.id = e."chunkId"
      JOIN "documents" d ON d.id = c."documentId"
      WHERE d."projectId" = $2
        AND d.status = 'READY'
        AND 1 - (e.vector <=> $1::vector) >= $3
      ORDER BY e.vector <=> $1::vector
      LIMIT $4
      `,
      vectorStr,
      projectId,
      threshold,
      topK,
    );

    return rows;
  }
}

export const embeddingRepository = new EmbeddingRepository();
