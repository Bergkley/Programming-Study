import type { AuthBody } from "../types/index.js";
import { badRequest } from "../utils/http-error.js";

export function requireField(body: AuthBody, field: string, minLength = 1) {
  const value = body[field];
  const trimmed = typeof value === "string" ? value.trim() : "";

  if (trimmed.length < minLength) {
    throw badRequest(
      minLength > 1 ? `Campo ${field} precisa ter pelo menos ${minLength} caracteres` : `Campo ${field} e obrigatorio`
    );
  }

  return trimmed;
}

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}
