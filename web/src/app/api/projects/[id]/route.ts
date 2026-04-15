export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { type NextRequest } from "next/server";
import { projectService } from "@/server/services";
import { requireAuth } from "@/shared/auth";
import { updateProjectSchema } from "@/shared/validation";
import { ok, noContent, handleError } from "@/shared/http";

type Params = { params: Promise<{ id: string }> };

// GET /api/projects/[id]
export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const user = await requireAuth();
    const { id } = await params;
    const project = await projectService.getById(id, user.id);
    return ok(project);
  } catch (error) {
    return handleError(error);
  }
}

// PATCH /api/projects/[id]
export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const user = await requireAuth();
    const { id } = await params;
    const body = await request.json();
    const input = updateProjectSchema.parse(body);
    const project = await projectService.update(id, user.id, input);
    return ok(project);
  } catch (error) {
    return handleError(error);
  }
}

// DELETE /api/projects/[id]
export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const user = await requireAuth();
    const { id } = await params;
    await projectService.delete(id, user.id);
    return noContent();
  } catch (error) {
    return handleError(error);
  }
}
