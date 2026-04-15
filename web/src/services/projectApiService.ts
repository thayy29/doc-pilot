import apiFetch from "@/lib/apiFetch";

export interface Project {
  id: string;
  name: string;
  description?: string | null;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProjectInput {
  name: string;
  description?: string;
}

export interface UpdateProjectInput {
  name?: string;
  description?: string | null;
}

const BASE = "/api/projects";

export const projectApiService = {
  listAll: (): Promise<Project[]> =>
    apiFetch<Project[]>(BASE),

  getById: (id: string): Promise<Project> =>
    apiFetch<Project>(`${BASE}/${id}`),

  create: (input: CreateProjectInput): Promise<Project> =>
    apiFetch<Project>(BASE, {
      method: "POST",
      body: JSON.stringify(input),
    }),

  update: (id: string, input: UpdateProjectInput): Promise<Project> =>
    apiFetch<Project>(`${BASE}/${id}`, {
      method: "PATCH",
      body: JSON.stringify(input),
    }),

  delete: (id: string): Promise<void> =>
    apiFetch<void>(`${BASE}/${id}`, { method: "DELETE" }),
};
