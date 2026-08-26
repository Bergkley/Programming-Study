export class HttpError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly code: string,
    message: string,
    public readonly details?: unknown,
  ) {
    super(message);
  }
}

export function badRequest(message: string, details?: unknown): HttpError {
  return new HttpError(400, "BAD_REQUEST", message, details);
}

export function unauthorized(message = "Nao autenticado"): HttpError {
  return new HttpError(401, "UNAUTHORIZED", message);
}

export function forbidden(message = "Acesso negado"): HttpError {
  return new HttpError(403, "FORBIDDEN", message);
}

export function conflict(message: string): HttpError {
  return new HttpError(409, "CONFLICT", message);
}
