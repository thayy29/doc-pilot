import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { AppError } from "@/shared/errors";

// ---------------------------------------------------------------------------
// Payload shapes
// ---------------------------------------------------------------------------

export interface ApiSuccess<T> {
  ok: true;
  data: T;
}

export interface ApiError {
  ok: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

export function ok<T>(data: T, status = 200): NextResponse<ApiSuccess<T>> {
  return NextResponse.json({ ok: true, data }, { status });
}

export function created<T>(data: T): NextResponse<ApiSuccess<T>> {
  return ok(data, 201);
}

export function noContent(): NextResponse<null> {
  return new NextResponse(null, { status: 204 });
}

export function fail(
  code: string,
  message: string,
  status: number,
  details?: unknown,
): NextResponse<ApiError> {
  return NextResponse.json(
    { ok: false, error: { code, message, details } },
    { status },
  );
}

// ---------------------------------------------------------------------------
// Central error handler — use in every route handler
// ---------------------------------------------------------------------------

export function handleError(error: unknown): NextResponse<ApiError> {
  // Known application errors
  if (error instanceof AppError) {
    return fail(error.code, error.message, error.statusCode);
  }

  // Zod validation errors
  if (error instanceof ZodError) {
    const details: Record<string, string[]> = {};
    for (const issue of error.issues) {
      const path = issue.path.join(".");
      details[path] = [...(details[path] ?? []), issue.message];
    }
    return fail("VALIDATION_ERROR", "Validation failed", 422, details);
  }

  // Unexpected errors — log and return generic message
  console.error("[Unhandled API Error]", error);
  return fail("INTERNAL_ERROR", "An unexpected error occurred", 500);
}
