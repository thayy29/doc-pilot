export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { type NextRequest } from "next/server";
import { projectService } from "@/server/services";
import { requireAuth } from "@/shared/auth";
import { createProjectSchema } from "@/shared/validation";
import { ok, created, handleError } from "@/shared/http";

// GET /api/projects → list all projects for the logged-in user
export async function GET() {
  try {
    const user = await requireAuth();
    const projects = await projectService.listByOwner(user.id);
    return ok(projects);
  } catch (error) {
    return handleError(error);
  }
}

// POST /api/projects → create a new project
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await request.json();
    const input = createProjectSchema.parse(body);
    const project = await projectService.create(user.id, input);
    return created(project);
  } catch (error) {
    return handleError(error);
  }
}
