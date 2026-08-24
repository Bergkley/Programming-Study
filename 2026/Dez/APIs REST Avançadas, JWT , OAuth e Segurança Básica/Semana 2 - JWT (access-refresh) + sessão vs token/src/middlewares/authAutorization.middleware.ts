import jwt from "jsonwebtoken";
import type { NextFunction, Request, Response } from "express";
import { unauthorized } from "../utils/http-error.js";

export type AuthenticatedUser = {
  id: string;
  email: string;
  name: string;
};

function getAccessTokenSecret() {
  return process.env.JWT_ACCESS_SECRET ?? process.env.JWT_SECRET ?? "dev-access-secret-change-me";
}

export function authAuthorizationMiddleware(
  request: Request,
  _response: Response,
  next: NextFunction
) {
  const authorizationHeader = request.headers.authorization;

  if (!authorizationHeader) {
    throw unauthorized("Token nao encontrado");
  }

  const [scheme, token] = authorizationHeader.split(" ");

  if (scheme !== "Bearer" || !token) {
    throw unauthorized("Use o formato Authorization: Bearer <token>");
  }

  try {
    const payload = jwt.verify(token, getAccessTokenSecret());

    if (
      typeof payload === "string" ||
      payload.type !== "access" ||
      typeof payload.sub !== "string" ||
      typeof payload.email !== "string" ||
      typeof payload.name !== "string"
    ) {
      throw unauthorized("Token invalido");
    }

    request.user = {
      id: payload.sub,
      email: payload.email,
      name: payload.name
    };
    next();
  } catch {
    throw unauthorized("Token invalido ou expirado");
  }
}

export const requireAuth = authAuthorizationMiddleware;
