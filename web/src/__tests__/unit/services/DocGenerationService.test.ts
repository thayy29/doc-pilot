import { describe, it, expect, vi, beforeEach } from "vitest";
import { DocGenerationService } from "@/server/services/DocGenerationService";

// ─── Mocks ─────────────────────────────────────────────────────────────────

vi.mock("@/lib/openai", () => ({
  getEmbeddings: vi.fn().mockResolvedValue([[0.1, 0.2, 0.3]]),
}));

const mockProject = {
  id: "proj-1",
  name: "DocPilot",
  description: "Um assistente de documentação",
  ownerId: "user-1",
  createdAt: new Date(),
  updatedAt: new Date(),
};

vi.mock("@/repositories", () => ({
  projectRepository: {
    findById: vi.fn(),
  },
  embeddingRepository: {
    findSimilarChunks: vi.fn(),
  },
}));

// ─── Tests ─────────────────────────────────────────────────────────────────

describe("DocGenerationService", () => {
  let service: DocGenerationService;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let mocks: any;

  beforeEach(async () => {
    service = new DocGenerationService();
    mocks = await import("@/repositories");
    vi.clearAllMocks();
  });

  describe("buildGenerationContext()", () => {
    it("lança NotFoundError quando projeto não existe", async () => {
      mocks.projectRepository.findById.mockResolvedValue(null);

      await expect(
        service.buildGenerationContext("proj-x", "user-1", "README"),
      ).rejects.toThrow("Project not found");
    });

    it("lança ForbiddenError quando usuário não é dono", async () => {
      mocks.projectRepository.findById.mockResolvedValue({
        ...mockProject,
        ownerId: "outro-user",
      });

      await expect(
        service.buildGenerationContext("proj-1", "user-1", "README"),
      ).rejects.toThrow();
    });

    it("retorna contexto completo para template README", async () => {
      mocks.projectRepository.findById.mockResolvedValue(mockProject);
      mocks.embeddingRepository.findSimilarChunks.mockResolvedValue([]);

      const result = await service.buildGenerationContext(
        "proj-1",
        "user-1",
        "README",
      );

      expect(result.template.id).toBe("README");
      expect(result.chunks).toHaveLength(0);
      expect(result.systemPrompt).toContain("DocPilot"); // nome do projeto
      expect(result.userPrompt).toContain("README");
    });

    it("inclui userContext na ragQuery quando fornecido", async () => {
      mocks.projectRepository.findById.mockResolvedValue(mockProject);
      mocks.embeddingRepository.findSimilarChunks.mockResolvedValue([]);
      const { getEmbeddings } = await import("@/lib/openai");

      await service.buildGenerationContext(
        "proj-1",
        "user-1",
        "README",
        "API REST de e-commerce",
      );

      expect(getEmbeddings).toHaveBeenCalledWith(
        expect.arrayContaining([expect.stringContaining("API REST de e-commerce")]),
      );
    });

    it("inclui userContext no userPrompt", async () => {
      mocks.projectRepository.findById.mockResolvedValue(mockProject);
      mocks.embeddingRepository.findSimilarChunks.mockResolvedValue([]);

      const result = await service.buildGenerationContext(
        "proj-1",
        "user-1",
        "README",
        "contexto especial",
      );

      expect(result.userPrompt).toContain("contexto especial");
    });

    it("systemPrompt contém a estrutura do template", async () => {
      mocks.projectRepository.findById.mockResolvedValue(mockProject);
      mocks.embeddingRepository.findSimilarChunks.mockResolvedValue([]);

      const result = await service.buildGenerationContext(
        "proj-1",
        "user-1",
        "ADR",
      );

      expect(result.systemPrompt).toContain("Status");
      expect(result.systemPrompt).toContain("Decisão");
    });

    it("usa topK=8 e threshold=0.6 como defaults", async () => {
      mocks.projectRepository.findById.mockResolvedValue(mockProject);
      mocks.embeddingRepository.findSimilarChunks.mockResolvedValue([]);

      await service.buildGenerationContext("proj-1", "user-1", "README");

      expect(mocks.embeddingRepository.findSimilarChunks).toHaveBeenCalledWith(
        expect.any(Array),
        "proj-1",
        8,
        0.6,
      );
    });

    it("systemPrompt menciona placeholder quando não há chunks", async () => {
      mocks.projectRepository.findById.mockResolvedValue(mockProject);
      mocks.embeddingRepository.findSimilarChunks.mockResolvedValue([]);

      const result = await service.buildGenerationContext("proj-1", "user-1", "README");

      expect(result.systemPrompt).toContain("A preencher");
    });
  });
});
