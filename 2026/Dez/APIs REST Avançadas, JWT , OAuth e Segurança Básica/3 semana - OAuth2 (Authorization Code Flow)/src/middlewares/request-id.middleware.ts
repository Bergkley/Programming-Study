import { randomUUID } from "node:crypto";
import type { NextFunction, Request, Response } from "express";

export function requestIdMiddleware(request: Request, response: Response, next: NextFunction) {
  const requestId = request.header("X-Request-Id") ?? randomUUID();

  response.setHeader("X-Request-Id", requestId);
  response.locals.requestId = requestId;

  next();
}
