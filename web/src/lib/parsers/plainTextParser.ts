/**
 * Parser para arquivos de texto plano e Markdown.
 * Retorna o conteúdo sem processamento adicional — Markdown
 * é preservado como texto para que o chunking e embeddings
 * possam trabalhar sobre o conteúdo semântico.
 */
export async function parsePlainText(buffer: Buffer): Promise<string> {
  const text = buffer.toString("utf-8").trim();
  if (!text) throw new Error("Arquivo de texto está vazio.");
  return text;
}
