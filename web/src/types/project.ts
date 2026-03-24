export interface Project {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export type CreateProjectInput = Omit<
  Project,
  "id" | "createdAt" | "updatedAt"
>;
export type UpdateProjectInput = Partial<Omit<Project, "id" | "createdAt">>;
