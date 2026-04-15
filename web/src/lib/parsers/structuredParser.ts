/**
 * Parser para arquivos JSON e YAML.
 * Converte a estrutura em representação textual legível
 * para que o LLM possa interpretar o conteúdo semanticamente.
 */

function jsonToReadableText(obj: unknown, depth = 0): string {
  const indent = "  ".repeat(depth);

  if (obj === null || obj === undefined) return `${indent}(vazio)`;

  if (typeof obj === "string") return `${indent}${obj}`;
  if (typeof obj === "number" || typeof obj === "boolean") return `${indent}${obj}`;

  if (Array.isArray(obj)) {
    return obj
      .map((item, i) => `${indent}[${i + 1}] ${jsonToReadableText(item, depth + 1).trim()}`)
      .join("\n");
  }

  if (typeof obj === "object") {
    return Object.entries(obj as Record<string, unknown>)
      .map(([key, value]) => {
        const label = `${indent}${key}:`;
        if (typeof value === "object" && value !== null) {
          return `${label}\n${jsonToReadableText(value, depth + 1)}`;
        }
        return `${label} ${value}`;
      })
      .join("\n");
  }

  return `${indent}${String(obj)}`;
}

export async function parseJson(buffer: Buffer): Promise<string> {
  const raw = buffer.toString("utf-8").trim();
  if (!raw) throw new Error("Arquivo JSON está vazio.");

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error("Arquivo JSON inválido.");
  }

  return jsonToReadableText(parsed);
}

export async function parseYaml(buffer: Buffer): Promise<string> {
  // YAML simples: converte key: value em texto legível sem dependência extra
  // Para YAML complexo com anchors/aliases, seria necessário js-yaml
  const raw = buffer.toString("utf-8").trim();
  if (!raw) throw new Error("Arquivo YAML está vazio.");

  // Tenta fazer parse como JSON primeiro (YAML é superset de JSON)
  try {
    const parsed = JSON.parse(raw);
    return jsonToReadableText(parsed);
  } catch {
    // Se não for JSON válido, retorna como texto plano (YAML já é legível)
    return raw;
  }
}
