import Anthropic from "@anthropic-ai/sdk";

let _anthropic: Anthropic | null = null;

/**
 * Retorna instância singleton do cliente Anthropic (Claude).
 * Inicialização lazy para evitar falhas no build quando a variável não está definida.
 */
export function getAnthropicClient(): Anthropic {
  if (!_anthropic) {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error("ANTHROPIC_API_KEY não está configurada.");
    }
    _anthropic = new Anthropic({ apiKey });
  }
  return _anthropic;
}

export const CLAUDE_MODEL =
  process.env.ANTHROPIC_MODEL ?? "claude-3-5-sonnet-20241022";

export const MAX_TOKENS = Number(process.env.ANTHROPIC_MAX_TOKENS ?? "2048");
