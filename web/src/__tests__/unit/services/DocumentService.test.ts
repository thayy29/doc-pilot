import { describe, it, expect, vi, beforeEach } from "vitest";
import { DocumentService } from "@/server/services/DocumentService";

// ─── Mocks ─────────────────────────────────────────────────────────────────

vi.mock("@/repositories", () => ({
  documentRepository: {
    findById: vi.fn(),
    findAllByProject: vi.fn(),
    create: vi.fn(),
    updateStatus: vi.fn(),
    saveContent: vi.fn(),
    delete: vi.fn(),
  },
  projectRepository: {
    findById: vi.fn(),
  },
}));

vi.mock("@/lib/parsers", async () => {
  const actual = await vi.importActual("@/lib/parsers");
  return {
    ...actual,
    parseFile: vi.fn().mockResolvedValue("conteúdo extraído"),
  };
});

vi.mock("@/lib/documentQueue", () => ({
  getDocumentQueue: vi.fn().mockReturnValue({
    add: vi.fn().mockResolvedValue({}),
  }),
}));

// ─── Tests ─────────────────────────────────────────────────────────────────

describe("DocumentService", () => {
  let service: DocumentService;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let mocks: any;

  beforeEach(async () => {
    service = new DocumentService();
    mocks = await import("@/repositories");
    vi.clearAllMocks();
  });

  describe("validateFile (via processUpload)", () => {
    const validProject = {
      id: "proj-1",
      name: "Test",
      description: null,
      ownerId: "user-1",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const validDoc = {
      id: "doc-1",
      projectId: "proj-1",
      title: "Doc",
      fileName: "readme.md",
      mimeType: "text/markdown",
      fileSize: 1000,
      content: null,
      status: "PENDING" as const,
      sourceUrl: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it("aceita arquivo .pdf", async () => {
      mocks.projectRepository.findById.mockResolvedValue(validProject);
      mocks.documentRepository.create.mockResolvedValue(validDoc);
      mocks.documentRepository.saveContent.mockResolvedValue({
        ...validDoc,
        content: "texto extraído",
      });

      await expect(
        service.processUpload(
          "user-1",
          { projectId: "proj-1", title: "Doc", fileName: "doc.pdf" },
          Buffer.from("fake pdf"),
        ),
      ).resolves.toBeDefined();
    });

    it("aceita arquivo .md", async () => {
      mocks.projectRepository.findById.mockResolvedValue(validProject);
      mocks.documentRepository.create.mockResolvedValue(validDoc);
      mocks.documentRepository.saveContent.mockResolvedValue({
        ...validDoc,
        content: "# Markdown",
      });

      await expect(
        service.processUpload(
          "user-1",
          { projectId: "proj-1", title: "Doc", fileName: "readme.md" },
          Buffer.from("# Markdown"),
        ),
      ).resolves.toBeDefined();
    });

    it("rejeita extensão .docx com ValidationError", async () => {
      mocks.projectRepository.findById.mockResolvedValue(validProject);

      await expect(
        service.processUpload(
          "user-1",
          { projectId: "proj-1", title: "Doc", fileName: "report.docx" },
          Buffer.from("conteúdo"),
        ),
      ).rejects.toThrow("docx");
    });

    it("rejeita arquivo maior que 10 MB", async () => {
      mocks.projectRepository.findById.mockResolvedValue(validProject);
      const overSizeBytes = 11 * 1024 * 1024;

      await expect(
        service.processUpload(
          "user-1",
          {
            projectId: "proj-1",
            title: "Doc",
            fileName: "big.txt",
            fileSize: overSizeBytes,
          },
          Buffer.alloc(overSizeBytes),
        ),
      ).rejects.toThrow("limite");
    });

    it("lança NotFoundError quando projeto não existe", async () => {
      mocks.projectRepository.findById.mockResolvedValue(null);

      await expect(
        service.processUpload(
          "user-1",
          { projectId: "nao-existe", title: "Doc", fileName: "doc.txt" },
          Buffer.from("texto"),
        ),
      ).rejects.toThrow("Project not found");
    });

    it("lança ForbiddenError quando usuário não é dono do projeto", async () => {
      mocks.projectRepository.findById.mockResolvedValue({
        ...validProject,
        ownerId: "outro-user",
      });

      await expect(
        service.processUpload(
          "user-1",
          { projectId: "proj-1", title: "Doc", fileName: "doc.txt" },
          Buffer.from("texto"),
        ),
      ).rejects.toThrow();
    });
  });

  describe("listByProject()", () => {
    it("retorna documentos do projeto", async () => {
      const project = {
        id: "proj-1",
        name: "Test",
        description: null,
        ownerId: "user-1",
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const docs = [
        {
          id: "doc-1",
          projectId: "proj-1",
          title: "Doc 1",
          fileName: "doc1.txt",
          mimeType: null,
          fileSize: null,
          content: null,
          status: "READY" as const,
          sourceUrl: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mocks.projectRepository.findById.mockResolvedValue(project);
      mocks.documentRepository.findAllByProject.mockResolvedValue(docs);

      const result = await service.listByProject("proj-1", "user-1");

      expect(result).toHaveLength(1);
      expect(result[0].title).toBe("Doc 1");
    });
  });
});
