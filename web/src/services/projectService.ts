import type { CreateProjectInput } from "@/types";
import type { Project, UpdateProjectInput } from "@/types/project";

// mock data - simulando banco de dados local

const mockProjects: Project[] = [
  {
    id: "project-1",
    name: "Documentação API REST",
    createdAt: new Date("2026-03-01"),
    updatedAt: new Date("2026-03-15"),
  },
  {
    id: "project-2",
    name: "Guia de Integração",
    createdAt: new Date("2026-03-05"),
    updatedAt: new Date("2026-03-20"),
  },
  {
    id: "project-3",
    name: "Manual do Usuário",
    createdAt: new Date("2026-03-10"),
    updatedAt: new Date("2026-03-22"),
  },
];

// armazenando em memória
const projects: Map<string, Project> = new Map(
  mockProjects.map((p) => [p.id, p]),
);

export const projectService = {
  // criar novo projeto
  create: (input: CreateProjectInput): Project => {
    const id = `proj-${Date.now()}`;
    const now = new Date();
    const project: Project = {
      id,
      name: input.name,
      createdAt: now,
      updatedAt: now,
    };
    projects.set(id, project);
    return project;
  },

  // obter projeto por id
  getById: (id: string): Project | null => {
    return projects.get(id) ?? null;
  },

  // listar todos os projetos
  listAll: (): Project[] => {
    return Array.from(projects.values()).sort(
      (a, b) => b.updatedAt.getTime() - a.updatedAt.getTime(),
    );
  },

  // atualizar projeto
  update: (id: string, input: UpdateProjectInput): Project | null => {
    const project = projects.get(id);
    if (!project) return null;

    const updated: Project = {
      ...project,
      ...input,
      updatedAt: new Date(),
    };
    projects.set(id, updated);
    return updated;
  },

  delete: (id: string): boolean => {
    return projects.delete(id);
  },
};
