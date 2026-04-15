/**
 * Parser para arquivos HTML.
 * Remove tags HTML e retorna apenas o texto visível.
 * Não requer dependências externas.
 */
export async function parseHtml(buffer: Buffer): Promise<string> {
  const raw = buffer.toString("utf-8");

  const text = raw
    // Remove scripts e styles completamente
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    // Substitui tags de bloco por quebra de linha
    .replace(/<\/?(p|div|h[1-6]|li|br|tr|th|td|blockquote|pre)[^>]*>/gi, "\n")
    // Remove todas as demais tags
    .replace(/<[^>]+>/g, " ")
    // Decodifica entidades HTML básicas
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ")
    // Normaliza espaços múltiplos e linhas em branco
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  if (!text) throw new Error("Arquivo HTML não contém texto visível.");

  return text;
}
