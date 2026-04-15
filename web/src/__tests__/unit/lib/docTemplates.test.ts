import { describe, it, expect } from "vitest";
import {
  DOC_TEMPLATES,
  listTemplates,
  getTemplate,
  TEMPLATE_DEFINITIONS,
} from "@/lib/docTemplates";

describe("docTemplates", () => {
  describe("DOC_TEMPLATES", () => {
    it("contém todos os templates esperados", () => {
      expect(DOC_TEMPLATES.README).toBe("README");
      expect(DOC_TEMPLATES.ADR).toBe("ADR");
      expect(DOC_TEMPLATES.API_REFERENCE).toBe("API_REFERENCE");
      expect(DOC_TEMPLATES.TUTORIAL).toBe("TUTORIAL");
      expect(DOC_TEMPLATES.CHANGELOG).toBe("CHANGELOG");
    });
  });

  describe("listTemplates()", () => {
    it("retorna todos os 5 templates", () => {
      const templates = listTemplates();
      expect(templates).toHaveLength(5);
    });

    it("cada template tem os campos obrigatórios", () => {
      const templates = listTemplates();
      for (const t of templates) {
        expect(t).toHaveProperty("id");
        expect(t).toHaveProperty("label");
        expect(t).toHaveProperty("description");
        expect(t).toHaveProperty("ragQuery");
        expect(t).toHaveProperty("systemPrompt");
        expect(t).toHaveProperty("structure");
      }
    });

    it("nenhum campo está vazio", () => {
      const templates = listTemplates();
      for (const t of templates) {
        expect(t.label.length).toBeGreaterThan(0);
        expect(t.description.length).toBeGreaterThan(0);
        expect(t.ragQuery.length).toBeGreaterThan(0);
        expect(t.systemPrompt.length).toBeGreaterThan(0);
        expect(t.structure.length).toBeGreaterThan(0);
      }
    });
  });

  describe("getTemplate()", () => {
    it("retorna o template correto por ID", () => {
      const readme = getTemplate("README");
      expect(readme.id).toBe("README");
      expect(readme.label).toBe("README");
    });

    it("retorna template ADR com estrutura correta", () => {
      const adr = getTemplate("ADR");
      expect(adr.structure).toContain("Status");
      expect(adr.structure).toContain("Contexto");
      expect(adr.structure).toContain("Decisão");
    });

    it("retorna template API_REFERENCE com estrutura de endpoints", () => {
      const api = getTemplate("API_REFERENCE");
      expect(api.structure).toContain("Endpoints");
      expect(api.structure).toContain("GET");
    });

    it("retorna template CHANGELOG com formato Keep a Changelog", () => {
      const changelog = getTemplate("CHANGELOG");
      expect(changelog.structure).toContain("Adicionado");
      expect(changelog.structure).toContain("Corrigido");
    });

    it("o systemPrompt do README menciona português", () => {
      const readme = getTemplate("README");
      expect(readme.systemPrompt).toContain("português");
    });
  });

  describe("TEMPLATE_DEFINITIONS", () => {
    it("todos os IDs do enum estão nas definições", () => {
      for (const key of Object.values(DOC_TEMPLATES)) {
        expect(TEMPLATE_DEFINITIONS).toHaveProperty(key);
      }
    });
  });
});
