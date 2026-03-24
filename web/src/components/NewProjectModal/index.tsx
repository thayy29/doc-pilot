'use client';

import { useState } from "react";
import Button from "../Button";
import Card from "../Card";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (name: string) => void;
  loading?: boolean;
};

export default function NewProjectModal({
  isOpen,
  onClose,
  onSubmit,
  loading = false,
}: Props) {
  const [projectName, setProjectName] = useState("");

  const handleSubmit = () => {
    if (projectName.trim()) {
      onSubmit(projectName);
      setProjectName("");
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay - Aumentado de /50 para /70 */}
      <div
        className="fixed inset-0 z-40 bg-black/70"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 p-4">
        <Card variant="subtle" className="p-6">
          <div className="space-y-4">
            <div>
              <h2 className="text-sm font-black text-foreground">
                Criar novo projeto
              </h2>
              <p className="mt-1 text-xs font-semibold text-foreground-muted">
                Digite um nome descritivo para seu novo projeto
              </p>
            </div>

            <input
              type="text"
              placeholder="Ex: Cliente X • Billing API"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter" && !loading) handleSubmit();
              }}
              disabled={loading}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-semibold placeholder-foreground-muted focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50"
              autoFocus
            />

            <div className="flex gap-3">
              <Button
                onClick={handleSubmit}
                disabled={!projectName.trim() || loading}
                className="flex-1"
              >
                {loading ? "Criando..." : "Criar"}
              </Button>
              <Button
                variant="ghost"
                onClick={onClose}
                disabled={loading}
                className="flex-1"
              >
                Cancelar
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </>
  );
}