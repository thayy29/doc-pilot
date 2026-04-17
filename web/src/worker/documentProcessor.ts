/**
 * Processador de documentos reutilizável.
 *
 * Extrai a lógica de chunking + embedding do worker standalone
 * para poder ser chamado tanto pelo BullMQ worker (Redis)
 * quanto inline pelo DocumentService (sem Redis).
 */
import { prisma } from "@/lib/prisma";

// ─── Config ────────────────────────────────────────────────────────────────

const EMBEDDING_MODEL =
  process.env.OPENAI_EMBEDDING_MODEL ?? "text-embedding-3-small";
const EMBEDDING_DIMENSIONS = Number(
  process.env.OPENAI_EMBEDDING_DIMENSIONS ?? "1536",
);
const MAX_CHUNK_TOKENS = 512;

// ─── Chunking ──────────────────────────────────────────────────────────────

/**
 * Divide texto em chunks respeitando parágrafos e limites de tokens.
 */
export function chunkText(
  text: string,
  maxTokens: number = MAX_CHUNK_TOKENS,
): string[] {
  if (!text || text.trim().length === 0) return [];

  const paragraphs = text.split(/\n{2,}/);
  const chunks: string[] = [];
  let currentChunk = "";

  for (const paragraph of paragraphs) {
    const estimatedTokens = paragraph.split(/\s+/).length;

    // Parágrafo excede maxTokens → dividir por sentenças
    if (estimatedTokens > maxTokens) {
      if (currentChunk.trim()) {
        chunks.push(currentChunk.trim());
        currentChunk = "";
      }

      const sentences = paragraph.split(/(?<=[.!?])\s+/);
      let sentenceChunk = "";

      for (const sentence of sentences) {
        const combined = sentenceChunk
          ? `${sentenceChunk} ${sentence}`
          : sentence;
        if (combined.split(/\s+/).length > maxTokens) {
          if (sentenceChunk.trim()) chunks.push(sentenceChunk.trim());
          sentenceChunk = sentence;
        } else {
          sentenceChunk = combined;
        }
      }

      if (sentenceChunk.trim()) chunks.push(sentenceChunk.trim());
      continue;
    }

    const combined = currentChunk
      ? `${currentChunk}\n\n${paragraph}`
      : paragraph;
    if (combined.split(/\s+/).length > maxTokens) {
      if (currentChunk.trim()) chunks.push(currentChunk.trim());
      currentChunk = paragraph;
    } else {
      currentChunk = combined;
    }
  }

  if (currentChunk.trim()) chunks.push(currentChunk.trim());
  return chunks.length > 0 ? chunks : [text.trim()];
}

// ─── Embeddings ────────────────────────────────────────────────────────────

/**
 * Gera embeddings via OpenAI. Retorna null se OPENAI_API_KEY não estiver
 * configurada (graceful degradation para MVP).
 */
async function generateEmbeddings(
  texts: string[],
): Promise<number[][] | null> {
  if (texts.length === 0) return [];

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.warn(
      "[documentProcessor] OPENAI_API_KEY não configurada — pulando embeddings.",
    );
    return null;
  }

  // Import dinâmico para não falhar se openai não estiver configurado
  const { default: OpenAI } = await import("openai");
  const openai = new OpenAI({ apiKey });

  const batchSize = 20;
  const allEmbeddings: number[][] = [];

  for (let i = 0; i < texts.length; i += batchSize) {
    const batch = texts.slice(i, i + batchSize);
    console.log(
      `  📐 Embedding batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(texts.length / batchSize)}...`,
    );

    const response = await openai.embeddings.create({
      model: EMBEDDING_MODEL,
      input: batch,
      dimensions: EMBEDDING_DIMENSIONS,
    });

    for (const item of response.data) {
      allEmbeddings.push(item.embedding);
    }
  }

  return allEmbeddings;
}

// ─── Pipeline principal ───────────────────────────────────────────────────

export interface ProcessResult {
  documentId: string;
  chunksCreated: number;
  embeddingsCreated: number;
  status: "READY" | "FAILED";
}

/**
 * Processa um documento: chunking → embeddings → persiste.
 * Pode ser chamado inline (sem Redis) ou pelo worker.
 */
export async function processDocumentInline(
  documentId: string,
): Promise<ProcessResult> {
  console.log(`\n📄 [inline] Processando documento: ${documentId}`);

  const document = await prisma.document.findUnique({
    where: { id: documentId },
  });

  if (!document) {
    throw new Error(`Documento ${documentId} não encontrado.`);
  }

  // Marca como PROCESSING
  await prisma.document.update({
    where: { id: documentId },
    data: { status: "PROCESSING" },
  });

  try {
    const content = document.content;

    if (!content || content.trim().length === 0) {
      console.warn("  ⚠️  Documento sem conteúdo — marcando como READY");
      await prisma.document.update({
        where: { id: documentId },
        data: { status: "READY" },
      });
      return {
        documentId,
        chunksCreated: 0,
        embeddingsCreated: 0,
        status: "READY",
      };
    }

    // 1. Chunking
    const chunkTexts = chunkText(content);
    console.log(`  ✂️  Chunks: ${chunkTexts.length}`);

    // 2. Limpa chunks antigos (re-processamento)
    const existingChunks = await prisma.chunk.findMany({
      where: { documentId },
      select: { id: true },
    });

    if (existingChunks.length > 0) {
      await prisma.embedding.deleteMany({
        where: { chunkId: { in: existingChunks.map((c) => c.id) } },
      });
      await prisma.chunk.deleteMany({ where: { documentId } });
      console.log("  🗑️  Chunks antigos removidos");
    }

    // 3. Persiste chunks
    const createdChunks = await Promise.all(
      chunkTexts.map((text, index) =>
        prisma.chunk.create({
          data: {
            content: text,
            position: index,
            tokenCount: text.split(/\s+/).length,
            documentId,
          },
        }),
      ),
    );
    console.log(`  💾 Chunks salvos: ${createdChunks.length}`);

    // 4. Embeddings (graceful se OpenAI não estiver configurada)
    let embeddingsCreated = 0;
    const embeddings = await generateEmbeddings(chunkTexts);

    if (embeddings && embeddings.length === createdChunks.length) {
      console.log("  💾 Salvando embeddings...");
      for (let i = 0; i < createdChunks.length; i++) {
        const vectorStr = `[${embeddings[i].join(",")}]`;
        await prisma.$executeRawUnsafe(
          `INSERT INTO "embeddings" ("id", "chunkId", "vector", "provider", "model", "dimensions", "createdAt", "updatedAt")
           VALUES (gen_random_uuid(), $1, $2::vector, $3, $4, $5, NOW(), NOW())`,
          createdChunks[i].id,
          vectorStr,
          "openai",
          EMBEDDING_MODEL,
          EMBEDDING_DIMENSIONS,
        );
      }
      embeddingsCreated = embeddings.length;
      console.log(`  ✅ Embeddings salvos: ${embeddingsCreated}`);
    } else {
      console.warn(
        "  ⚠️  Embeddings não gerados — documento ficará READY sem busca vetorial",
      );
    }

    // 5. Marca como READY
    await prisma.document.update({
      where: { id: documentId },
      data: { status: "READY" },
    });
    console.log("  ✅ Status: READY\n");

    return {
      documentId,
      chunksCreated: createdChunks.length,
      embeddingsCreated,
      status: "READY",
    };
  } catch (error) {
    console.error(
      `  ❌ Erro:`,
      error instanceof Error ? error.message : error,
    );
    await prisma.document.update({
      where: { id: documentId },
      data: { status: "FAILED" },
    });
    return {
      documentId,
      chunksCreated: 0,
      embeddingsCreated: 0,
      status: "FAILED",
    };
  }
}
