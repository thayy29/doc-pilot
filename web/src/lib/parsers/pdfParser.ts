/**
 * Parser para arquivos PDF.
 * Usa pdf-parse para extrair texto de todas as páginas.
 */
export async function parsePdf(buffer: Buffer): Promise<string> {
  // Importação dinâmica para evitar problemas com o build do Next.js
  // pdf-parse usa fs internamente — deve rodar apenas no servidor
  const pdfParseModule = await import("pdf-parse");
  // Suporta tanto CJS (.default) quanto ESM direto
  const pdfParse =
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (pdfParseModule as any).default ?? pdfParseModule;

  const result = await pdfParse(buffer);

  const text = result.text?.trim();
  if (!text) throw new Error("Não foi possível extrair texto do PDF.");

  return text;
}
