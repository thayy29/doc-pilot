import { describe, it, expect } from "vitest";
import { parsePlainText } from "@/lib/parsers/plainTextParser";

describe("parsePlainText", () => {
  it("retorna o conteúdo do buffer como string", async () => {
    const content = "Olá mundo, este é um documento de teste.";
    const buffer = Buffer.from(content, "utf-8");

    const result = await parsePlainText(buffer);

    expect(result).toBe(content);
  });

  it("remove espaços em branco no início e fim", async () => {
    const buffer = Buffer.from("   conteúdo   ", "utf-8");
    const result = await parsePlainText(buffer);
    expect(result).toBe("conteúdo");
  });

  it("lança erro para arquivo vazio", async () => {
    const buffer = Buffer.from("   ", "utf-8");
    await expect(parsePlainText(buffer)).rejects.toThrow();
  });

  it("preserva quebras de linha e formatação markdown", async () => {
    const md = "# Título\n\n## Seção\n\n- item 1\n- item 2";
    const buffer = Buffer.from(md, "utf-8");
    const result = await parsePlainText(buffer);
    expect(result).toContain("# Título");
    expect(result).toContain("## Seção");
    expect(result).toContain("- item 1");
  });

  it("suporta caracteres especiais e unicode", async () => {
    const content = "Ação: configuração do ñoño — 100% funcional 🚀";
    const buffer = Buffer.from(content, "utf-8");
    const result = await parsePlainText(buffer);
    expect(result).toBe(content);
  });
});
