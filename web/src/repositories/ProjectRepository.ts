import { prisma } from "@/lib/prisma";
import type { CreateProjectInput, UpdateProjectInput } from "@/shared/validation";

export type ProjectRecord = {
  id: string;
  name: string;
  description: string | null;
  ownerId: string;
  createdAt: Date;
  updatedAt: Date;
};

export interface IProjectRepository {
  findById(id: string, ownerId: string): Promise<ProjectRecord | null>;
  findAllByOwner(ownerId: string): Promise<ProjectRecord[]>;
  create(ownerId: string, input: CreateProjectInput): Promise<ProjectRecord>;
  update(id: string, ownerId: string, input: UpdateProjectInput): Promise<ProjectRecord | null>;
  delete(id: string, ownerId: string): Promise<boolean>;
}

export class ProjectRepository implements IProjectRepository {
  async findById(id: string, ownerId: string): Promise<ProjectRecord | null> {
    return prisma.project.findFirst({
      where: { id, ownerId },
    });
  }

  async findAllByOwner(ownerId: string): Promise<ProjectRecord[]> {
    return prisma.project.findMany({
      where: { ownerId },
      orderBy: { updatedAt: "desc" },
    });
  }

  async create(ownerId: string, input: CreateProjectInput): Promise<ProjectRecord> {
    return prisma.project.create({
      data: {
        name: input.name,
        description: input.description,
        ownerId,
      },
    });
  }

  async update(
    id: string,
    ownerId: string,
    input: UpdateProjectInput,
  ): Promise<ProjectRecord | null> {
    const exists = await prisma.project.findFirst({ where: { id, ownerId } });
    if (!exists) return null;

    return prisma.project.update({
      where: { id },
      data: {
        ...(input.name !== undefined && { name: input.name }),
        ...(input.description !== undefined && { description: input.description }),
      },
    });
  }

  async delete(id: string, ownerId: string): Promise<boolean> {
    const exists = await prisma.project.findFirst({ where: { id, ownerId } });
    if (!exists) return false;

    await prisma.project.delete({ where: { id } });
    return true;
  }
}

// Singleton — shared across hot-reload in development
export const projectRepository = new ProjectRepository();
