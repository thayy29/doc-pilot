export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { type NextRequest } from "next/server";
import { signUpSchema } from "@/shared/validation";
import { authService } from "@/server/services";
import { created, fail, handleError } from "@/shared/http";
import { ZodError } from "zod";

/**
 * POST /api/auth/signup
 *
 * Registra um novo usuário com nome, e-mail e senha.
 * A senha é armazenada como hash bcrypt (12 rounds).
 *
 * Body: { name, email, password }
 * Returns: { id, name, email }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const input = signUpSchema.parse(body);
    const user = await authService.signUp(input);
    return created({ id: user.id, name: user.name, email: user.email });
  } catch (error) {
    if (error instanceof ZodError) {
      const details = error.flatten().fieldErrors;
      return fail("VALIDATION_ERROR", "Dados inválidos.", 422, details);
    }
    return handleError(error);
  }
}
