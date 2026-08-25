export class HttpError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly code: string,
    message: string,
    public readonly details?: unknown
  ) {
    super(message);
  }
}

export function badRequest(message: string, details?: unknown) {
  return new HttpError(400, "BAD_REQUEST", message, details);
}

export function unauthorized(message = "Nao autenticado") {
  return new HttpError(401, "UNAUTHORIZED", message);
}

export function forbidden(message = "Acesso negado") {
  return new HttpError(403, "FORBIDDEN", message);
}

export function conflict(message: string) {
  return new HttpError(409, "CONFLICT", message);
}
