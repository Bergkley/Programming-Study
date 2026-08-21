import type { ValidationIssue } from "../types/products.js";

export class HttpError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly code: string,
    message: string,
    public readonly details?: ValidationIssue[]
  ) {
    super(message);
  }
}

export function badRequest(message: string) {
  return new HttpError(400, "BAD_REQUEST", message);
}

export function notFound(message = "Recurso nao encontrado") {
  return new HttpError(404, "NOT_FOUND", message);
}

export function conflict(message: string) {
  return new HttpError(409, "CONFLICT", message);
}

export function validationError(message: string, details: ValidationIssue[]) {
  return new HttpError(422, "VALIDATION_ERROR", message, details);
}
