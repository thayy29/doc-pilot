"use client";

import { useCallback, useEffect, useState } from "react";
import { projectApiService } from "@/services/projectApiService";
import type { Project, CreateProjectInput, UpdateProjectInput } from "@/services/projectApiService";

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

  // -------------------------------------------------------------------------
  // Load projects on mount + restore selection from localStorage
  // -------------------------------------------------------------------------

  useEffect(() => {
    loadProjects();
    const savedId = localStorage.getItem(SELECTED_PROJECT_KEY);
    if (savedId) {
      setState((prev) => ({ ...prev, selectedProjectId: savedId }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // -------------------------------------------------------------------------
  // Actions
  // -------------------------------------------------------------------------

  const loadProjects = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const projects = await projectApiService.listAll();
      setState((prev) => ({ ...prev, projects, loading: false }));
    } catch (err) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: err instanceof Error ? err.message : "Erro ao carregar projetos",
      }));
    }
  }, []);

  const createProject = useCallback(
    async (input: CreateProjectInput): Promise<Project | null> => {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      try {
        const project = await projectApiService.create(input);
        setState((prev) => ({
          ...prev,
          projects: [project, ...prev.projects],
          selectedProjectId: project.id,
          loading: false,
        }));
        localStorage.setItem(SELECTED_PROJECT_KEY, project.id);
        return project;
      } catch (err) {
        setState((prev) => ({
          ...prev,
          loading: false,
          error: err instanceof Error ? err.message : "Erro ao criar projeto",
        }));
        return null;
      }
    },
    [],
  );

  const updateProject = useCallback(
    async (id: string, input: UpdateProjectInput): Promise<Project | null> => {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      try {
        const updated = await projectApiService.update(id, input);
        setState((prev) => ({
          ...prev,
          projects: prev.projects.map((p) => (p.id === id ? updated : p)),
          loading: false,
        }));
        return updated;
      } catch (err) {
        setState((prev) => ({
          ...prev,
          loading: false,
          error: err instanceof Error ? err.message : "Erro ao atualizar projeto",
        }));
        return null;
      }
    },
    [],
  );

  const deleteProject = useCallback(async (projectId: string): Promise<void> => {
    try {
      await projectApiService.delete(projectId);
      setState((prev) => ({
        ...prev,
        projects: prev.projects.filter((p) => p.id !== projectId),
        selectedProjectId:
          prev.selectedProjectId === projectId ? null : prev.selectedProjectId,
      }));
      if (localStorage.getItem(SELECTED_PROJECT_KEY) === projectId) {
        localStorage.removeItem(SELECTED_PROJECT_KEY);
      }
    } catch (err) {
      setState((prev) => ({
        ...prev,
        error: err instanceof Error ? err.message : "Erro ao deletar projeto",
      }));
    }
  }, []);

  const selectProject = useCallback((projectId: string) => {
    setState((prev) => ({ ...prev, selectedProjectId: projectId, error: null }));
    localStorage.setItem(SELECTED_PROJECT_KEY, projectId);
  }, []);

  // -------------------------------------------------------------------------
  // Derived state
  // -------------------------------------------------------------------------

  const selectedProject =
    state.projects.find((p) => p.id === state.selectedProjectId) ?? null;

  return {
    projects: state.projects,
    selectedProject,
    loading: state.loading,
    error: state.error,
    loadProjects,
    createProject,
    updateProject,
    deleteProject,
    selectProject,
  };
}

