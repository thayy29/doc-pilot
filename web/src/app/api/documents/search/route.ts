import { type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getEmbeddings } from "@/lib/openai";
import { requireAuth } from "@/shared/auth";
import { ok, fail, handleError } from "@/shared/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Busca vetorial semântica (pgvector ANN).
 *
 * POST /api/documents/search
 * body: { query: string, projectId: string, topK?: number }
 *
 * Fluxo:
 *  1. Gera embedding da query via OpenAI
 *  2. Busca os chunks mais próximos no pgvector
 *  3. Retorna os trechos relevantes
 */
export async function POST(req: NextRequest) {
  try {
    await requireAuth();

    const body = await req.json();
    const { query, projectId, topK = 5 } = body;

    if (!query || typeof query !== "string") {
      return fail("BAD_REQUEST", "query é obrigatório", 400);
    }
    if (!projectId || typeof projectId !== "string") {
      return fail("BAD_REQUEST", "projectId é obrigatório", 400);
    }

    // 1. Gerar embedding da query
    const [queryEmbedding] = await getEmbeddings([query]);
    const vectorLiteral = `[${queryEmbedding.join(",")}]`;

    // 2. Busca ANN no pgvector (inner product distance <#>)
    const results = await prisma.$queryRawUnsafe<
      { chunkId: string; content: string; documentTitle: string; distance: number }[]
    >(
      `SELECT c.id       AS "chunkId",
              c.content,
              d.title    AS "documentTitle",
              (e.vector <#> $1::vector) AS distance
       FROM   "chunks"     c
       JOIN   "embeddings" e ON e."chunkId" = c.id
       JOIN   "documents"  d ON d.id = c."documentId"
       WHERE  d."projectId" = $2
       ORDER  BY distance ASC
       LIMIT  $3`,
      vectorLiteral,
      projectId,
      topK,
    );

    return ok(results);
  } catch (error) {
    return handleError(error);
  }
}
