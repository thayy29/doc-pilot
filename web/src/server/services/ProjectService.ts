import { projectRepository } from "@/repositories";
import { ForbiddenError, NotFoundError } from "@/shared/errors";
import type { CreateProjectInput, UpdateProjectInput } from "@/shared/validation";
import type { ProjectRecord } from "@/repositories";

export class ProjectService {
  /**
   * List all projects owned by a user.
   */
  async listByOwner(ownerId: string): Promise<ProjectRecord[]> {
    return projectRepository.findAllByOwner(ownerId);
  }

  /**
   * Get a single project — ensures ownership.
   */
  async getById(id: string, requesterId: string): Promise<ProjectRecord> {
    const project = await projectRepository.findById(id, requesterId);
    if (!project) throw new NotFoundError("Project");
    return project;
  }

  /**
   * Create a new project for the authenticated user.
   */
  async create(ownerId: string, input: CreateProjectInput): Promise<ProjectRecord> {
    return projectRepository.create(ownerId, input);
  }

  /**
   * Update a project — only the owner can update.
   */
  async update(
    id: string,
    requesterId: string,
    input: UpdateProjectInput,
  ): Promise<ProjectRecord> {
    const existing = await projectRepository.findById(id, requesterId);
    if (!existing) throw new NotFoundError("Project");
    if (existing.ownerId !== requesterId) throw new ForbiddenError();

    const updated = await projectRepository.update(id, requesterId, input);
    if (!updated) throw new NotFoundError("Project");
    return updated;
  }

  /**
   * Delete a project — only the owner can delete.
   */
  async delete(id: string, requesterId: string): Promise<void> {
    const existing = await projectRepository.findById(id, requesterId);
    if (!existing) throw new NotFoundError("Project");
    if (existing.ownerId !== requesterId) throw new ForbiddenError();

    await projectRepository.delete(id, requesterId);
  }
}

export const projectService = new ProjectService();
