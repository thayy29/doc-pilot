/**
 * Parser para arquivos DOCX (Microsoft Word).
 * Usa mammoth para extrair texto puro.
 */
export async function parseDocx(buffer: Buffer): Promise<string> {
  const mammoth = await import("mammoth");
  const result = await mammoth.extractRawText({ buffer });
  const text = result.value?.trim();
  if (!text) throw new Error("Não foi possível extrair texto do DOCX.");
  return text;
}
