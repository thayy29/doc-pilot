import { describe, it, expect, vi, beforeEach } from "vitest";
import { RagService } from "@/server/services/RagService";

// ─── Mocks ─────────────────────────────────────────────────────────────────

vi.mock("@/lib/openai", () => ({
  getEmbeddings: vi.fn().mockResolvedValue([[0.1, 0.2, 0.3]]),
}));

vi.mock("@/repositories", () => ({
  embeddingRepository: {
    findSimilarChunks: vi.fn(),
  },
}));

// ─── Helpers ───────────────────────────────────────────────────────────────

function makeChunk(overrides = {}) {
  return {
    chunkId: "chunk-1",
    documentId: "doc-1",
    content: "Conteúdo do chunk de teste.",
    position: 0,
    similarity: 0.85,
    ...overrides,
  };
}

// ─── Tests ─────────────────────────────────────────────────────────────────

describe("RagService", () => {
  let service: RagService;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let mockEmbeddingRepo: any;

  beforeEach(async () => {
    service = new RagService();
    const { embeddingRepository } = await import("@/repositories");
    mockEmbeddingRepo = embeddingRepository;
    vi.clearAllMocks();
  });

  describe("buildContext()", () => {
    it("retorna chunks e systemPrompt quando há resultados RAG", async () => {
      const chunks = [makeChunk(), makeChunk({ chunkId: "chunk-2", similarity: 0.75 })];
      mockEmbeddingRepo.findSimilarChunks.mockResolvedValue(chunks);

      const result = await service.buildContext("Como instalar?", "project-1");

      expect(result.chunks).toHaveLength(2);
      expect(result.systemPrompt).toContain("Conteúdo do chunk de teste");
      expect(result.systemPrompt).toContain("85.0%");
    });

    it("retorna systemPrompt informando ausência de docs quando não há chunks", async () => {
      mockEmbeddingRepo.findSimilarChunks.mockResolvedValue([]);

      const result = await service.buildContext("pergunta qualquer", "project-empty");

      expect(result.chunks).toHaveLength(0);
      expect(result.systemPrompt).toContain("Nenhum documento");
    });

    it("respeita os parâmetros topK e threshold", async () => {
      mockEmbeddingRepo.findSimilarChunks.mockResolvedValue([]);

      await service.buildContext("query", "proj", 10, 0.5);

      expect(mockEmbeddingRepo.findSimilarChunks).toHaveBeenCalledWith(
        expect.any(Array),
        "proj",
        10,
        0.5,
      );
    });

    it("usa topK=5 e threshold=0.7 como defaults", async () => {
      mockEmbeddingRepo.findSimilarChunks.mockResolvedValue([]);

      await service.buildContext("query", "proj");

      expect(mockEmbeddingRepo.findSimilarChunks).toHaveBeenCalledWith(
        expect.any(Array),
        "proj",
        5,
        0.7,
      );
    });

    it("systemPrompt contém a query do usuário contextualizada", async () => {
      mockEmbeddingRepo.findSimilarChunks.mockResolvedValue([makeChunk()]);

      const result = await service.buildContext("Como instalar o projeto?", "proj");

      expect(result.systemPrompt).toContain("DocPilot");
      expect(result.systemPrompt).toContain("CONTEXTO DOS DOCUMENTOS");
    });

    it("inclui similaridade formatada no systemPrompt", async () => {
      mockEmbeddingRepo.findSimilarChunks.mockResolvedValue([
        makeChunk({ similarity: 0.9234 }),
      ]);

      const result = await service.buildContext("query", "proj");

      expect(result.systemPrompt).toContain("92.3%");
    });
  });
});
