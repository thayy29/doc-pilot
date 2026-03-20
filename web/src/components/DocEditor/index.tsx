"use client";

import Button from "../Button";
import {
  cardStyles,
  titleStyles,
  descriptionStyles,
  inputStyles,
  actionsStyles,
  exportButtonStyles,
  saveButtonStyles,
} from "./styles";

type Props = {
  value: string;
  onChange: (value: string) => void;
  onExport?: () => void;
  onSave?: () => void;
  placeholder?: string;
  className?: string;
};

export default function DocEditor({
  value,
  onChange,
  onExport,
  onSave,
  placeholder = "# Runbook (rascunho)…",
  className = "",
}: Props) {
  return (
    <div className={`${cardStyles} ${className}`}>
      <div className={titleStyles}>Editor</div>
      <div className={descriptionStyles}>O texto gerado aparece aqui para revisão.</div>

      <div className="flex items-center justify-between">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={inputStyles}
        />
        <div className={actionsStyles}>
          <Button variant="ghost" onClick={onExport} className={exportButtonStyles}>
            Exportar
          </Button>
          <Button variant="primary" onClick={onSave} className={saveButtonStyles}>
            Salvar
          </Button>
        </div>
      </div>
    </div>
  );
}