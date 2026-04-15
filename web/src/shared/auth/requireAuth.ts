import { auth } from "@/auth";
import { UnauthorizedError } from "@/shared/errors";

/**
 * Returns the current session user or throws UnauthorizedError.
 * Use inside route handlers that require authentication.
 *
 * @example
 * const user = await requireAuth();
 */
export async function requireAuth() {
  const session = await auth();

  if (!session?.user?.id) {
    throw new UnauthorizedError();
  }

  return session.user as { id: string; name?: string | null; email?: string | null };
}
