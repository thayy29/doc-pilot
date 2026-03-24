import { projectService } from "@/services/projectService";
import type { CreateProjectInput, Project } from "@/types";

import { useCallback, useEffect, useState } from "react";

interface UseProjectsState {
  projects: Project[];
  selectedProjectId: string | null;
  loading: boolean;
  error: string | null;
}

const SELECTED_PROJECT_KEY = "doc-pilot:selectedProjectId";

export function useProjects() {
  const [state, setState] = useState<UseProjectsState>({
    projects: [],
    selectedProjectId: null,
    loading: false,
    error: null,
  });

  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (!isInitialized) {
      loadProjects();
      // restaurar projeto selecionado do localStorage
      const savedProjectId = localStorage.getItem(SELECTED_PROJECT_KEY);
      if (savedProjectId) {
        setState((prev) => ({
          ...prev,
          selectedProjectId: savedProjectId,
        }));
        setIsInitialized(true);
      }
    }
  }, [isInitialized]);

  // carregar todos os projetos
  const loadProjects = useCallback(() => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const projects = projectService.listAll();
      setState((prev) => ({
        ...prev,
        projects,
        loading: false,
      }));
    } catch (error) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error:
          error instanceof Error ? error.message : "Erro ao carregar projetos",
      }));
    }
  }, []);

  // criar novo projeto

  const createProject = useCallback((input: CreateProjectInput) => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const project = projectService.create(input);
      setState((prev) => ({
        ...prev,
        projects: [...prev.projects, project],
        selectedProjectId: project.id,
        loading: false,
      }));

      // persistir seleção
      localStorage.setItem(SELECTED_PROJECT_KEY, project.id);
      return project;
    } catch (error) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : "Erro ao criar projeto",
      }));
      return null;
    }
  }, []);

  // selecionar projeto
  const selectProject = useCallback((projectId: string) => {
    const project = projectService.getById(projectId);
    if (!project) {
      setState((prev) => ({
        ...prev,
        selectedProjectId: projectId,
      }));
      return;
    }

    setState((prev) => ({
      ...prev,
      selectedProjectId: projectId,
      error: null,
    }));

    // persistir seleção no localStorage
    localStorage.setItem(SELECTED_PROJECT_KEY, projectId);
  }, []);

  // obter projeto selecionado

  const selectedProject =
    state.projects.find((p) => p.id === state.selectedProjectId) || null;

  const deleteProject = useCallback(
    (projectId: string) => {
      try {
        projectService.delete(projectId);
        setState((prev) => ({
          ...prev,
          projects: prev.projects.filter((p) => p.id !== projectId),
          selectedProjectId:
            prev.selectedProjectId === projectId
              ? null
              : prev.selectedProjectId,
        }));

        // limpar localStorage se era o projeto selecionado
        if (state.selectedProjectId === projectId) {
          localStorage.removeItem(SELECTED_PROJECT_KEY);
        }
      } catch (error) {
        setState((prev) => ({
          ...prev,
          error:
            error instanceof Error ? error.message : "Erro ao deletar projeto",
        }));
      }
    },
    [state.selectedProjectId],
  );

  return {
    projects: state.projects,
    selectedProject,
    loading: state.loading,
    error: state.error,
    loadProjects,
    createProject,
    selectProject,
    deleteProject,
  };
}
