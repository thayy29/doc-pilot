import { describe, it, expect } from "vitest";
import { parseHtml } from "@/lib/parsers/htmlParser";

describe("parseHtml", () => {
  it("extrai texto de HTML simples", async () => {
    const html = "<html><body><p>Olá mundo</p></body></html>";
    const result = await parseHtml(Buffer.from(html, "utf-8"));
    expect(result).toContain("Olá mundo");
  });

  it("remove tags HTML", async () => {
    const html = "<h1>Título</h1><p>Parágrafo com <strong>negrito</strong></p>";
    const result = await parseHtml(Buffer.from(html, "utf-8"));
    expect(result).not.toContain("<h1>");
    expect(result).not.toContain("<strong>");
    expect(result).toContain("Título");
    expect(result).toContain("Parágrafo com");
    expect(result).toContain("negrito");
  });

  it("remove conteúdo de scripts e styles", async () => {
    const html = `
      <html>
        <head>
          <style>body { color: red; }</style>
          <script>alert('xss')</script>
        </head>
        <body><p>Conteúdo real</p></body>
      </html>`;
    const result = await parseHtml(Buffer.from(html, "utf-8"));
    expect(result).not.toContain("color: red");
    expect(result).not.toContain("alert");
    expect(result).toContain("Conteúdo real");
  });

  it("decodifica entidades HTML básicas", async () => {
    const html = "<p>A &amp; B &lt;tag&gt; &quot;quoted&quot; &nbsp;espaço</p>";
    const result = await parseHtml(Buffer.from(html, "utf-8"));
    expect(result).toContain("A & B");
    expect(result).toContain("<tag>");
    expect(result).toContain('"quoted"');
  });

  it("lança erro para HTML sem texto visível", async () => {
    const html = "<html><head><style>body{}</style></head><body></body></html>";
    await expect(parseHtml(Buffer.from(html, "utf-8"))).rejects.toThrow();
  });
});
