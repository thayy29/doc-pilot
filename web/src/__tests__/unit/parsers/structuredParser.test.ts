import { describe, it, expect } from "vitest";
import { parseJson, parseYaml } from "@/lib/parsers/structuredParser";

describe("parseJson", () => {
  it("converte objeto JSON em texto legível", async () => {
    const obj = { name: "DocPilot", version: "1.0", active: true };
    const buffer = Buffer.from(JSON.stringify(obj), "utf-8");

    const result = await parseJson(buffer);

    expect(result).toContain("name:");
    expect(result).toContain("DocPilot");
    expect(result).toContain("version:");
    expect(result).toContain("1");
    expect(result).toContain("active:");
    expect(result).toContain("true");
  });

  it("processa arrays com índices", async () => {
    const arr = ["item1", "item2", "item3"];
    const buffer = Buffer.from(JSON.stringify(arr), "utf-8");

    const result = await parseJson(buffer);

    expect(result).toContain("[1]");
    expect(result).toContain("item1");
    expect(result).toContain("[3]");
    expect(result).toContain("item3");
  });

  it("processa estruturas aninhadas", async () => {
    const nested = { project: { name: "Test", tags: ["api", "backend"] } };
    const buffer = Buffer.from(JSON.stringify(nested), "utf-8");

    const result = await parseJson(buffer);

    expect(result).toContain("project:");
    expect(result).toContain("name:");
    expect(result).toContain("Test");
    expect(result).toContain("api");
  });

  it("lança erro para JSON inválido", async () => {
    const buffer = Buffer.from("{ invalid json }", "utf-8");
    await expect(parseJson(buffer)).rejects.toThrow("JSON inválido");
  });

  it("lança erro para buffer vazio", async () => {
    const buffer = Buffer.from("", "utf-8");
    await expect(parseJson(buffer)).rejects.toThrow();
  });
});

describe("parseYaml", () => {
  it("retorna conteúdo YAML como texto", async () => {
    const yaml = "name: DocPilot\nversion: 1.0\nactive: true";
    const buffer = Buffer.from(yaml, "utf-8");

    const result = await parseYaml(buffer);

    // YAML simples retorna como texto plano (legível pelo LLM)
    expect(result).toContain("DocPilot");
    expect(result).toContain("1.0");
  });

  it("lança erro para buffer vazio", async () => {
    const buffer = Buffer.from("   ", "utf-8");
    await expect(parseYaml(buffer)).rejects.toThrow();
  });
});
