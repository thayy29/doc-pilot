'use client';

import { useProjects } from "@/hooks/useProjects";
import { formatDate } from "@/utils/formatDate";
import { useState } from "react";
import Badge from "../Badge";
import Button from "../Button";
import Card from "../Card";


type Props = {
  className?: string;
};

export default function ProjectList({ className = "" }: Props) {
  const {
    projects,
    selectedProject,
    selectProject,
    deleteProject,
    loading,
    error,
  } = useProjects();

  const [projectToDelete, setProjectToDelete] = useState<string | null>(null);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <p className="text-xs font-semibold text-foreground-muted">
          Carregando projetos...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg bg-destructive/10 p-3 text-xs text-destructive font-semibold">
        {error}
      </div>
    );
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Grid de Projetos */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        {projects.map((project) => (
          <Card
            key={project.id}
            variant="subtle"
            className="flex-1 min-w-0 p-4 cursor-pointer transition-all hover:shadow-md group"
            onClick={() => selectProject(project.id)}
          >
            <div className="flex h-full flex-col justify-between">
              <div className="min-w-0">
                <div className="text-sm font-black text-foreground truncate">
                  {project.name}
                </div>
                <div className="mt-1 text-xs font-semibold text-foreground-muted">
                  Atualizado: {formatDate(project.updatedAt)}
                </div>
              </div>
              <div className="flex items-center justify-between mt-4">
                <Badge
                  variant={
                    selectedProject?.id === project.id ? "success" : "info"
                  }
                >
                  {selectedProject?.id === project.id
                    ? "Selecionado"
                    : "Inativo"}
                </Badge>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      selectProject(project.id);
                    }}
                  >
                    Abrir
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      setProjectToDelete(project.id);
                    }}
                    className="text-destructive hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    ✕
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Mensagem de Nenhum Projeto */}
      {projects.length === 0 && (
        <Card variant="subtle" className="flex-1 min-w-0 p-4">
          <div className="flex h-full flex-col items-center justify-center py-8 text-center">
            <p className="text-sm font-black text-foreground">
              Nenhum projeto criado
            </p>
            <p className="mt-1 text-xs font-semibold text-foreground-muted">
              Use o botão "+ Novo" no header para criar um projeto
            </p>
          </div>
        </Card>
      )}

      {/* Modal de Confirmação de Deletar */}
      {projectToDelete && (
        <>
          {/* Overlay - Aumentado de /70 para /80 */}
          <div
            className="fixed inset-0 z-40 bg-black/80"
            onClick={() => setProjectToDelete(null)}
          />

          {/* Modal */}
          <div className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 p-4">
            <Card variant="subtle" className="p-6">
              <div className="space-y-4">
                <div>
                  <h2 className="text-sm font-black text-foreground">
                    Deletar projeto?
                  </h2>
                  <p className="mt-1 text-xs font-semibold text-foreground-muted">
                    Esta ação não pode ser desfeita. Todos os dados do projeto serão permanentemente removidos.
                  </p>
                </div>

                <div className="flex gap-3">
                  <Button
                    onClick={() => {
                      deleteProject(projectToDelete);
                      setProjectToDelete(null);
                    }}
                    className="flex-1 bg-destructive hover:bg-destructive/90"
                  >
                    Deletar
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => setProjectToDelete(null)}
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}