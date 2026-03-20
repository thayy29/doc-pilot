"use client";

import DocTemplateCard from "../DocTemplateCard";
import DocEditor from "../DocEditor";
import { containerStyles } from "./styles";

type Template = {
  id: string;
  title: string;
  description: string;
};

type Props = {
  templates: Template[];
  editorValue: string;
  onEditorChange: (value: string) => void;
  onGenerate: (templateId: string) => void;
  onExport?: () => void;
  onSave?: () => void;
  className?: string;
};

export default function DocsSection({
  templates,
  editorValue,
  onEditorChange,
  onGenerate,
  onExport,
  onSave,
  className = "",
}: Props) {
  return (
    <div className={`${containerStyles} ${className}`}>
      {templates.map((template) => (
        <DocTemplateCard
          key={template.id}
          title={template.title}
          description={template.description}
          onGenerate={() => onGenerate(template.id)}
        />
      ))}
      <DocEditor
        value={editorValue}
        onChange={onEditorChange}
        onExport={onExport}
        onSave={onSave}
      />
    </div>
  );
}