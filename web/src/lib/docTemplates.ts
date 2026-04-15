// ─── Template Types ────────────────────────────────────────────────────────

export const DOC_TEMPLATES = {
  README: "README",
  ADR: "ADR",
  API_REFERENCE: "API_REFERENCE",
  TUTORIAL: "TUTORIAL",
  CHANGELOG: "CHANGELOG",
} as const;

export type DocTemplate = (typeof DOC_TEMPLATES)[keyof typeof DOC_TEMPLATES];

export interface TemplateDefinition {
  id: DocTemplate;
  label: string;
  description: string;
  /** Pergunta para busca semântica no RAG */
  ragQuery: string;
  /** System prompt especializado para este tipo de documento */
  systemPrompt: string;
  /** Estrutura esperada em markdown para guiar o modelo */
  structure: string;
}

// ─── Template Definitions ──────────────────────────────────────────────────

export const TEMPLATE_DEFINITIONS: Record<DocTemplate, TemplateDefinition> = {
  README: {
    id: "README",
    label: "README",
    description: "Documentação principal do projeto: visão geral, instalação e uso.",
    ragQuery:
      "visão geral do projeto, instalação, configuração, como usar, requisitos, tecnologias",
    systemPrompt: `Você é um engenheiro de software sênior especializado em documentação técnica.
Gere um README.md completo e profissional baseado EXCLUSIVAMENTE nos documentos fornecidos.
Escreva em português brasileiro. Use markdown com formatação clara.
Não invente informações — se não houver dados suficientes para uma seção, omita-a.`,
    structure: `# [Nome do Projeto]

> [Breve descrição em uma linha]

## Visão Geral
[Descrição do que é o projeto e qual problema resolve]

## Funcionalidades
- [Funcionalidade 1]
- [Funcionalidade 2]

## Pré-requisitos
- [Requisito 1]
- [Requisito 2]

## Instalação
\`\`\`bash
[comandos de instalação]
\`\`\`

## Configuração
[Instruções de configuração]

## Como Usar
[Exemplos de uso]

## Tecnologias
- [Tecnologia 1]
- [Tecnologia 2]

## Contribuindo
[Como contribuir com o projeto]

## Licença
[Informações de licença]`,
  },

  ADR: {
    id: "ADR",
    label: "ADR (Architecture Decision Record)",
    description: "Registro de decisão arquitetural com contexto, decisão e consequências.",
    ragQuery:
      "decisões técnicas, arquitetura, tecnologias escolhidas, trade-offs, motivações técnicas",
    systemPrompt: `Você é um arquiteto de software experiente.
Gere um ADR (Architecture Decision Record) estruturado baseado nos documentos fornecidos.
Identifique as principais decisões arquiteturais presentes na documentação.
Escreva em português brasileiro. Use markdown.`,
    structure: `# ADR: [Título da Decisão]

**Status:** Aceito  
**Data:** [Data]  
**Decisores:** [Quem decidiu]

## Contexto
[Situação que levou à necessidade desta decisão]

## Problema
[Qual problema ou necessidade esta decisão endereça]

## Decisão
[A decisão tomada, de forma clara e concisa]

## Alternativas Consideradas
### Opção A: [Nome]
- **Prós:** [...]
- **Contras:** [...]

### Opção B: [Nome]
- **Prós:** [...]
- **Contras:** [...]

## Consequências
### Positivas
- [Benefício 1]

### Negativas / Trade-offs
- [Trade-off 1]

## Notas
[Informações adicionais relevantes]`,
  },

  API_REFERENCE: {
    id: "API_REFERENCE",
    label: "Referência de API",
    description: "Documentação técnica de endpoints, parâmetros e exemplos.",
    ragQuery:
      "endpoints, rotas, métodos HTTP, parâmetros, request, response, autenticação, API",
    systemPrompt: `Você é um especialista em documentação de APIs REST.
Gere uma referência técnica de API completa baseada nos documentos fornecidos.
Documente todos os endpoints encontrados com seus métodos, parâmetros e exemplos.
Escreva em português brasileiro. Use markdown com blocos de código.`,
    structure: `# Referência da API

## Autenticação
[Como autenticar nas requisições]

## Base URL
\`\`\`
https://[domínio]/api
\`\`\`

## Endpoints

### [Recurso 1]

#### \`GET /[recurso]\`
**Descrição:** [O que faz]

**Parâmetros de Query:**
| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|-------------|-----------|
| [param]   | string | Não | [descrição] |

**Resposta de Sucesso (200):**
\`\`\`json
{
  "ok": true,
  "data": {}
}
\`\`\`

**Erros Comuns:**
| Status | Código | Descrição |
|--------|--------|-----------|
| 401 | UNAUTHORIZED | Token inválido |
| 404 | NOT_FOUND | Recurso não encontrado |`,
  },

  TUTORIAL: {
    id: "TUTORIAL",
    label: "Tutorial Passo a Passo",
    description: "Guia prático com passos sequenciais para completar uma tarefa.",
    ragQuery:
      "como fazer, passo a passo, configuração, setup, início rápido, tutorial, guia",
    systemPrompt: `Você é um technical writer experiente em criar tutoriais didáticos.
Gere um tutorial passo a passo claro e prático baseado nos documentos fornecidos.
Cada passo deve ser acionável e ter exemplos concretos.
Escreva em português brasileiro. Use markdown com numeração de passos.`,
    structure: `# Tutorial: [Título]

## Introdução
[O que o leitor vai aprender e por quê é útil]

## Pré-requisitos
Antes de começar, certifique-se de ter:
- [ ] [Requisito 1]
- [ ] [Requisito 2]

## Tempo Estimado
[X minutos / horas]

## Passo 1: [Nome do Passo]
[Descrição do que fazer]

\`\`\`bash
[Exemplo de comando ou código]
\`\`\`

> 💡 **Dica:** [Dica útil opcional]

## Passo 2: [Nome do Passo]
[Continua...]

## Verificação
Como confirmar que funcionou:
\`\`\`
[Saída esperada]
\`\`\`

## Próximos Passos
- [O que aprender depois]
- [Recurso relacionado]`,
  },

  CHANGELOG: {
    id: "CHANGELOG",
    label: "Changelog",
    description: "Histórico de mudanças, versões e atualizações do projeto.",
    ragQuery:
      "mudanças, versões, atualizações, novas funcionalidades, correções, breaking changes, releases",
    systemPrompt: `Você é um engenheiro de software que segue o formato Keep a Changelog (keepachangelog.com).
Gere um CHANGELOG estruturado baseado nos documentos fornecidos.
Organize as mudanças por versão e tipo (Added, Changed, Fixed, Removed, Security).
Escreva em português brasileiro. Use markdown.`,
    structure: `# Changelog

Todas as mudanças notáveis neste projeto são documentadas aqui.

Formato baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/).

## [Não Lançado]
### Adicionado
- [Nova funcionalidade]

## [X.Y.Z] - YYYY-MM-DD
### Adicionado
- [Funcionalidade nova]

### Alterado
- [Mudança em funcionalidade existente]

### Corrigido
- [Correção de bug]

### Removido
- [Funcionalidade removida]

### Segurança
- [Correção de vulnerabilidade]`,
  },
};

// ─── Helpers ───────────────────────────────────────────────────────────────

export function getTemplate(id: DocTemplate): TemplateDefinition {
  return TEMPLATE_DEFINITIONS[id];
}

export function listTemplates(): TemplateDefinition[] {
  return Object.values(TEMPLATE_DEFINITIONS);
}
