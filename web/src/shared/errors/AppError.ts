/**
 * Base application error.
 * All domain errors extend this class so API handlers can pattern-match on it.
 */
export class AppError extends Error {
  constructor(
    public readonly message: string,
    public readonly statusCode: number = 500,
    public readonly code: string = "INTERNAL_ERROR",
  ) {
    super(message);
    this.name = this.constructor.name;
    // Restore prototype chain (required when targeting ES5)
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

// ---------------------------------------------------------------------------
// HTTP 400
// ---------------------------------------------------------------------------

export class BadRequestError extends AppError {
  constructor(message = "Bad request") {
    super(message, 400, "BAD_REQUEST");
  }
}

export class ValidationError extends AppError {
  constructor(
    message = "Validation failed",
    public readonly details?: Record<string, string[]>,
  ) {
    super(message, 422, "VALIDATION_ERROR");
  }
}

// ---------------------------------------------------------------------------
// HTTP 401 / 403
// ---------------------------------------------------------------------------

export class UnauthorizedError extends AppError {
  constructor(message = "Unauthorized") {
    super(message, 401, "UNAUTHORIZED");
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "Forbidden") {
    super(message, 403, "FORBIDDEN");
  }
}

// ---------------------------------------------------------------------------
// HTTP 404
// ---------------------------------------------------------------------------

export class NotFoundError extends AppError {
  constructor(resource = "Resource") {
    super(`${resource} not found`, 404, "NOT_FOUND");
  }
}

// ---------------------------------------------------------------------------
// HTTP 409
// ---------------------------------------------------------------------------

export class ConflictError extends AppError {
  constructor(message = "Conflict") {
    super(message, 409, "CONFLICT");
  }
}
