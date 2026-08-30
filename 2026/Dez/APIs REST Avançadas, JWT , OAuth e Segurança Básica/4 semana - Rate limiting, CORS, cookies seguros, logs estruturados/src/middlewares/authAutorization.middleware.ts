import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { forbidden, unauthorized } from "../errors/http-error.js";

export type AuthenticatedUser = {
  id: string;
  email: string;
  name: string;
};

function getAccessTokenSecret() {
  return process.env.JWT_SECRET || "teste";
}

function getCookieValue(cookieHeader: string | undefined, cookieName: string) {
  if (!cookieHeader) {
    return undefined;
  }

  const cookies = cookieHeader.split(";").map((cookie) => cookie.trim());
  const cookie = cookies.find((item) => item.startsWith(`${cookieName}=`));

  return cookie?.split("=")[1];
}

export function authAuthorizationMiddleware(
  req: Request,
  _res: Response,
  next: NextFunction,
) {
  const authorizationHeader = req.headers.authorization;
  const cookieToken = getCookieValue(req.headers.cookie, "access_token");

  if (!authorizationHeader && !cookieToken) {
    throw unauthorized("Token nao encontrado");
  }

  const [bearer, authorizationToken] = authorizationHeader?.split(" ") ?? [];
  const token = authorizationToken ?? cookieToken;

  if (authorizationHeader && (!bearer || bearer !== "Bearer")) {
    throw forbidden();
  }

  if (!token) {
    throw unauthorized("Token nao encontrado");
  }

  try {
    const payload = jwt.verify(
      token,
      getAccessTokenSecret(),
    ) as AuthenticatedUser;

    req.user = {
      id: payload.id,
      email: payload.email,
      name: payload.name,
    };

    next();
  } catch {
    next(unauthorized("Token invalido"));
  }
}
