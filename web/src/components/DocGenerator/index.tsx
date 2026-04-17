"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { useDocGeneration } from "@/hooks/useDocGeneration";
import { listTemplates } from "@/lib/docTemplates";
import type { DocTemplate } from "@/lib/docTemplates";
import Card from "@/components/Card";
import Button from "@/components/Button";
import Badge from "@/components/Badge";

type Props = {
  projectId: string;
};

const templates = listTemplates();

export default function DocGenerator({ projectId }: Props) {
  const [selectedTemplate, setSelectedTemplate] =
    useState<DocTemplate | null>(null);
  const [userContext, setUserContext] = useState("");

  const { generate, content, status, error, reset, abort } = useDocGeneration({
    projectId,
    onDone: (_event, fullContent) => {
      console.info("[DocGenerator] geração concluída, tamanho:", fullContent.length);
    },
  });

  const isGenerating = status === "generating";
  const isDone = status === "done";
  const isError = status === "error";

  const handleGenerate = () => {
    if (!selectedTemplate || isGenerating) return;
    generate(selectedTemplate, userContext || undefined);
  };

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(content);
  };

  const handleReset = () => {
    reset();
    setSelectedTemplate(null);
    setUserContext("");
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      {/* Seleção de template */}
      {!isGenerating && !isDone && (
        <div className="space-y-4">
          <div>
            <h3 className="text-xs font-black text-foreground-muted uppercase tracking-wide">
              Escolha o tipo de documento
            </h3>
            <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {templates.map((tpl) => (
                <button
                  key={tpl.id}
                  onClick={() => setSelectedTemplate(tpl.id)}
                  className={[
                    "rounded-xl border p-4 text-left transition-all",
                    selectedTemplate === tpl.id
                      ? "border-brand bg-brand/5"
                      : "border-border hover:border-brand/40 hover:bg-subtle",
                  ].join(" ")}
                >
                  <div className="text-sm font-black text-foreground">
                    {tpl.label}
                  </div>
                  <div className="mt-1 text-xs font-semibold text-foreground-muted line-clamp-2">
                    {tpl.description}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Contexto adicional */}
          {selectedTemplate && (
            <div>
              <label className="text-xs font-black text-foreground-muted uppercase tracking-wide">
                Contexto adicional (opcional)
              </label>
              <textarea
                value={userContext}
                onChange={(e) => setUserContext(e.target.value)}
                placeholder="Ex: Foque nos endpoints de autenticação e nos erros mais comuns..."
                rows={3}
                className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm font-semibold text-foreground placeholder-foreground-muted focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand resize-none"
              />
            </div>
          )}

          {selectedTemplate && (
            <Button
              onClick={handleGenerate}
              disabled={!selectedTemplate}
              className="w-full sm:w-auto"
            >
              Gerar documento
            </Button>
          )}
        </div>
      )}

      {/* Estado de geração */}
      {isGenerating && (
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 animate-pulse rounded-full bg-brand" />
              <span className="text-sm font-semibold text-foreground-muted">
                Gerando documento...
              </span>
            </div>
            <Button variant="ghost" className="text-xs" onClick={abort}>
              Cancelar
            </Button>
          </div>
          {content && (
            <div className="min-h-0 flex-1 overflow-y-auto rounded-xl border border-border bg-subtle p-6">
              <article className="prose prose-sm prose-neutral dark:prose-invert max-w-none text-foreground">
                <ReactMarkdown>{content}</ReactMarkdown>
              </article>
              <span className="inline-block h-4 w-0.5 animate-blink bg-foreground align-middle ml-0.5" />
            </div>
          )}
        </div>
      )}

      {/* Documento gerado */}
      {isDone && content && (
        <div className="flex min-h-0 flex-1 flex-col gap-3">
          {/* Actions */}
          <div className="flex shrink-0 items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant="success">Documento gerado</Badge>
              <span className="text-xs font-semibold text-foreground-muted">
                {content.length.toLocaleString("pt-BR")} caracteres
              </span>
            </div>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                className="text-xs"
                onClick={handleCopyToClipboard}
              >
                Copiar
              </Button>
              <Button variant="ghost" className="text-xs" onClick={handleReset}>
                Gerar outro
              </Button>
            </div>
          </div>

          {/* Preview do conteúdo */}
          <div className="min-h-0 flex-1 overflow-y-auto rounded-xl border border-border bg-subtle p-6">
            <article className="prose prose-sm prose-neutral dark:prose-invert max-w-none text-foreground">
              <ReactMarkdown>{content}</ReactMarkdown>
            </article>
          </div>
        </div>
      )}

      {/* Estado de erro */}
      {isError && error && (
        <Card variant="surface" className="border-destructive/20 bg-destructive/5 p-4">
          <p className="text-xs font-semibold text-destructive">{error}</p>
          <Button
            variant="ghost"
            className="mt-3 text-xs"
            onClick={handleReset}
          >
            Tentar novamente
          </Button>
        </Card>
      )}
    </div>
  );
}
