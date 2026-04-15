import { OpenAI } from "openai";

let _openai: OpenAI | null = null;

/**
 * Retorna instância singleton do cliente OpenAI.
 * A instanciação é lazy para evitar falha no build quando OPENAI_API_KEY não está definida.
 */
function getClient(): OpenAI {
  if (!_openai) {
    _openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return _openai;
}

export async function getEmbeddings(texts: string[]): Promise<number[][]> {
  if (texts.length === 0) return [];
  const client = getClient();
  const res = await client.embeddings.create({
    model: "text-embedding-3-small",
    input: texts,
  });
  return res.data.map((d) => d.embedding);
}
