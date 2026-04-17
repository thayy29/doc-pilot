import { OpenAI } from "openai";

let _openai: OpenAI | null = null;

/**
 * Retorna instância singleton do cliente OpenAI (ou GitHub Models como fallback).
 * A instanciação é lazy para evitar falha no build quando nenhuma key está definida.
 */
function getClient(): OpenAI {
  if (!_openai) {
    const useGitHub = !process.env.OPENAI_API_KEY && !!process.env.GITHUB_TOKEN;
    _openai = useGitHub
      ? new OpenAI({
          baseURL: "https://models.inference.ai.azure.com",
          apiKey: process.env.GITHUB_TOKEN,
        })
      : new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return _openai;
}

export async function getEmbeddings(texts: string[]): Promise<number[][]> {
  if (texts.length === 0) return [];

  const apiKey = process.env.OPENAI_API_KEY || process.env.GITHUB_TOKEN;
  if (!apiKey) return [];

  const client = getClient();
  const res = await client.embeddings.create({
    model: "text-embedding-3-small",
    input: texts,
  });
  return res.data.map((d) => d.embedding);
}
