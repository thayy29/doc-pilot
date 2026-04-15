"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useProjects } from "@/hooks/useProjects";
import { formatDate } from "@/utils/formatDate";
import AuthUserMenu from "@/components/AuthUserMenu";
import Topbar from "@/components/Topbar";
import Badge from "@/components/Badge";
import Button from "@/components/Button";
import Card from "@/components/Card";
import NewProjectModal from "@/components/NewProjectModal";

export default function ProjectsPage() {
  const router = useRouter();
  const { projects, createProject, deleteProject, loading, error } =
    useProjects();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null);

  const handleCreateProject = async (name: string) => {
    setCreating(true);
    const project = await createProject({ name });
    setCreating(false);
    setIsModalOpen(false);
    if (project) {
      router.push(`/projects/${project.id}`);
    }
  };

  const handleDeleteProject = async (id: string) => {
    await deleteProject(id);
    setProjectToDelete(null);
  };

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background font-sans">
      <div className="mx-auto flex min-h-0 w-full max-w-7xl flex-1 flex-col overflow-hidden px-3 py-3 sm:px-4 sm:py-4 md:px-6 lg:px-10">
        <Topbar
          projectLabel="DocPilot"
          statusLabel=""
          anchors={[]}
          onNewClick={() => setIsModalOpen(true)}
          rightSlot={<AuthUserMenu />}
        />

        <main className="mt-4 flex-1 overflow-y-auto">
          {/* Header da seção */}
          <div className="mb-6">
            <h1 className="text-2xl font-black text-foreground">Projetos</h1>
            <p className="mt-1 text-sm font-semibold text-foreground-muted">
              Selecione um projeto para gerenciar documentos, fazer perguntas e
              gerar documentação.
            </p>
          </div>

          {/* Estado de erro */}
          {error && (
            <div className="mb-4 rounded-lg bg-destructive/10 px-4 py-3 text-sm font-semibold text-destructive">
              {error}
            </div>
          )}

          {/* Estado de loading */}
          {loading && projects.length === 0 && (
            <div className="flex items-center justify-center py-20">
              <p className="text-sm font-semibold text-foreground-muted">
                Carregando projetos...
              </p>
            </div>
          )}

          {/* Grid de projetos */}
          {!loading && projects.length === 0 && (
            <Card variant="surface" className="p-10 text-center">
              <div className="mx-auto max-w-xs">
                <div className="mb-4 text-4xl">📁</div>
                <h2 className="text-sm font-black text-foreground">
                  Nenhum projeto ainda
                </h2>
                <p className="mt-2 text-xs font-semibold text-foreground-muted">
                  Crie seu primeiro projeto para começar a importar documentos e
                  usar o chat inteligente.
                </p>
                <Button
                  className="mt-6"
                  onClick={() => setIsModalOpen(true)}
                >
                  + Criar primeiro projeto
                </Button>
              </div>
            </Card>
          )}

          {projects.length > 0 && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {projects.map((project) => (
                <Card
                  key={project.id}
                  variant="subtle"
                  className="group cursor-pointer p-5 transition-all hover:shadow-md"
                  onClick={() => router.push(`/projects/${project.id}`)}
                >
                  <div className="flex h-full flex-col justify-between gap-4">
                    <div className="min-w-0">
                      <h2 className="truncate text-sm font-black text-foreground">
                        {project.name}
                      </h2>
                      {project.description && (
                        <p className="mt-1 line-clamp-2 text-xs font-semibold text-foreground-muted">
                          {project.description}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="text-xs font-semibold text-foreground-muted">
                        {formatDate(new Date(project.updatedAt))}
                      </div>
                      <div className="flex items-center gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                        <Button
                          variant="ghost"
                          className="text-xs"
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/projects/${project.id}`);
                          }}
                        >
                          Abrir
                        </Button>
                        <Button
                          variant="ghost"
                          className="text-xs text-destructive hover:text-destructive"
                          onClick={(e) => {
                            e.stopPropagation();
                            setProjectToDelete(project.id);
                          }}
                        >
                          ✕
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}

              {/* Card de criar novo projeto */}
              <Card
                variant="surface"
                className="cursor-pointer border-2 border-dashed border-border p-5 text-center transition-all hover:border-brand hover:shadow-sm"
                onClick={() => setIsModalOpen(true)}
              >
                <div className="flex h-full min-h-25 flex-col items-center justify-center gap-2">
                  <span className="text-2xl font-black text-foreground-muted">
                    +
                  </span>
                  <span className="text-xs font-semibold text-foreground-muted">
                    Novo projeto
                  </span>
                </div>
              </Card>
            </div>
          )}
        </main>
      </div>

      {/* Modal de novo projeto */}
      <NewProjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateProject}
        loading={creating}
      />

      {/* Modal de confirmação de exclusão */}
      {projectToDelete && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/70"
            onClick={() => setProjectToDelete(null)}
          />
          <div className="fixed left-1/2 top-1/2 z-50 w-full max-w-sm -translate-x-1/2 -translate-y-1/2 p-4">
            <Card variant="subtle" className="p-6">
              <div className="space-y-4">
                <div>
                  <h2 className="text-sm font-black text-foreground">
                    Deletar projeto?
                  </h2>
                  <p className="mt-1 text-xs font-semibold text-foreground-muted">
                    Todos os documentos, embeddings e sessões de chat serão
                    removidos permanentemente.
                  </p>
                </div>
                <div className="flex gap-3">
                  <Button
                    className="flex-1 bg-destructive hover:bg-destructive/90"
                    onClick={() => handleDeleteProject(projectToDelete)}
                  >
                    Deletar
                  </Button>
                  <Button
                    variant="ghost"
                    className="flex-1"
                    onClick={() => setProjectToDelete(null)}
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
