"use client";

import { useState } from "react";
import DocsSection from "../DocSection";
import SectionHeader from "../SectionHeader";

const mockTemplates = [
  {
    id: "runbook",
    title: "Runbook",
    description: "Como rodar + env vars + troubleshooting",
  },
  {
    id: "architecture",
    title: "Arquitetura",
    description: "Componentes + integrações + visão geral",
  },
];

export default function DocsDemo() {
  const [editorValue, setEditorValue] = useState("");

  const handleGenerate = (templateId: string) => {
    const template = mockTemplates.find((t) => t.id === templateId);
    if (template) {
      setEditorValue(`# ${template.title} (rascunho)…`);
    }
  };

  const handleExport = () => {
    console.log("Exportar:", editorValue);
  };

  const handleSave = () => {
    console.log("Salvar:", editorValue);
  };

  return (
    <div className="flex shrink-0 flex-col">
      <SectionHeader
        title="Gerar Docs"
        subtitle="Gere um rascunho, revise e exporte."
      />
      <div className="mt-3">
        <DocsSection
          templates={mockTemplates}
          editorValue={editorValue}
          onEditorChange={setEditorValue}
          onGenerate={handleGenerate}
          onExport={handleExport}
          onSave={handleSave}
        />
      </div>
    </div>
  );
}