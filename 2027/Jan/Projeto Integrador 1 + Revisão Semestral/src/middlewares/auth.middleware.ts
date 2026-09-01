import { NextFunction, Request, Response } from "express";
import { forbidden, unauthorized } from "../errors/http-error.js";
import jwt from "jsonwebtoken";
import { AuthenticatedUser } from "../types/index.js";

function getCookieValue(cookieHeader: string | undefined, cookieName: string) {
  if (!cookieHeader) return undefined;

  const cookies = cookieHeader.split(";").map((cookie) => cookie.trim());

  const cookieAuthorization = cookies.find((item) =>
    item.startsWith(`${cookieName}=`),
  );

  return cookieAuthorization?.split("=")[1];
}

export function authAuthorizationMiddleware(
  req: Request,
  _res: Response,
  next: NextFunction,
) {
  const authorizationHeader = req.headers.authorization;
  const cookieAuthorizationHeader = getCookieValue(
    req.headers.cookie,
    "acess_token",
  );

  if (!authorizationHeader || !cookieAuthorizationHeader)
    throw unauthorized("Token não encontrado");

  const [bearer, authorizationToken] = authorizationHeader?.split(" ") ?? [];

  const token = authorizationHeader || cookieAuthorizationHeader;

  if (authorizationHeader && (!bearer || bearer !== "Bearer")) {
    throw forbidden();
  }

  if (!token) {
    throw unauthorized("Token não encontrado");
  }

  try {
    const verifyToken = jwt.verify(token, process.env.JWT_SECRET || "") as AuthenticatedUser;

    req.user = {
        id: verifyToken.id,
        name:verifyToken.name,
        email:verifyToken.email
    }

    next()
    
  } catch (error: any) {
    next(unauthorized(typeof error === "string" ? error : "token invalido"));
  }
}
