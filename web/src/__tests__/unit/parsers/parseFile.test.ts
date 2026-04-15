import { describe, it, expect } from "vitest";
import { parseFile, SUPPORTED_EXTENSIONS, MAX_FILE_SIZE_BYTES } from "@/lib/parsers";

describe("parseFile", () => {
  describe("roteamento por extensão", () => {
    it("roteia .txt para plainTextParser", async () => {
      const buffer = Buffer.from("Conteúdo de texto.", "utf-8");
      const result = await parseFile(buffer, "doc.txt");
      expect(result).toBe("Conteúdo de texto.");
    });

    it("roteia .md para plainTextParser", async () => {
      const buffer = Buffer.from("# Título\nConteúdo.", "utf-8");
      const result = await parseFile(buffer, "README.md");
      expect(result).toContain("# Título");
    });

    it("roteia .csv para plainTextParser", async () => {
      const buffer = Buffer.from("col1,col2\nval1,val2", "utf-8");
      const result = await parseFile(buffer, "data.csv");
      expect(result).toContain("col1,col2");
    });

    it("roteia .html para htmlParser", async () => {
      const buffer = Buffer.from("<p>Olá</p>", "utf-8");
      const result = await parseFile(buffer, "page.html");
      expect(result).toContain("Olá");
    });

    it("roteia .htm para htmlParser", async () => {
      const buffer = Buffer.from("<p>Olá</p>", "utf-8");
      const result = await parseFile(buffer, "page.htm");
      expect(result).toContain("Olá");
    });

    it("roteia .json para structuredParser", async () => {
      const buffer = Buffer.from('{"key":"value"}', "utf-8");
      const result = await parseFile(buffer, "config.json");
      expect(result).toContain("key:");
      expect(result).toContain("value");
    });

    it("roteia .yaml para structuredParser", async () => {
      const buffer = Buffer.from("key: value", "utf-8");
      const result = await parseFile(buffer, "config.yaml");
      expect(result).toContain("value");
    });

    it("roteia .yml para structuredParser", async () => {
      const buffer = Buffer.from("key: value", "utf-8");
      const result = await parseFile(buffer, "config.yml");
      expect(result).toContain("value");
    });
  });

  describe("roteamento por MIME type (fallback)", () => {
    it("usa mimeType text/plain quando extensão é desconhecida", async () => {
      const buffer = Buffer.from("Texto puro.", "utf-8");
      const result = await parseFile(buffer, "file.unknownext", "text/plain");
      expect(result).toBe("Texto puro.");
    });

    it("usa mimeType text/markdown para markdown sem extensão", async () => {
      const buffer = Buffer.from("# Header", "utf-8");
      const result = await parseFile(buffer, "file", "text/markdown");
      expect(result).toContain("# Header");
    });
  });

  describe("formato não suportado", () => {
    it("lança erro para extensão desconhecida sem mimeType", async () => {
      const buffer = Buffer.from("conteúdo", "utf-8");
      await expect(parseFile(buffer, "file.docx")).rejects.toThrow(
        "Formato não suportado",
      );
    });

    it("a mensagem de erro lista os formatos aceitos", async () => {
      const buffer = Buffer.from("conteúdo", "utf-8");
      await expect(parseFile(buffer, "arquivo.pptx")).rejects.toThrow(
        ".pdf",
      );
    });
  });

  describe("constantes exportadas", () => {
    it("SUPPORTED_EXTENSIONS inclui PDF", () => {
      expect(SUPPORTED_EXTENSIONS).toContain(".pdf");
    });

    it("SUPPORTED_EXTENSIONS inclui markdown", () => {
      expect(SUPPORTED_EXTENSIONS).toContain(".md");
    });

    it("MAX_FILE_SIZE_BYTES é 10 MB", () => {
      expect(MAX_FILE_SIZE_BYTES).toBe(10 * 1024 * 1024);
    });
  });
});
