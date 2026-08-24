import type { NextFunction, Request, Response } from "express";
import { HttpError } from "../utils/http-error.js";

export function errorMiddleware(
  error: unknown,
  _request: Request,
  response: Response,
  next: NextFunction
) {
  if (response.headersSent) {
    return next(error);
  }

  if (error instanceof HttpError) {
    return response.status(error.statusCode).json({
      error: {
        code: error.code,
        message: error.message,
        statusCode: error.statusCode,
        requestId: response.locals.requestId
      },
      ...(error.details ? { details: error.details } : {})
    });
  }

  if (error instanceof SyntaxError) {
    return response.status(400).json({
      error: {
        code: "BAD_REQUEST",
        message: "JSON invalido no corpo da requisicao",
        statusCode: 400,
        requestId: response.locals.requestId
      }
    });
  }

  console.error(error);

  return response.status(500).json({
    error: {
      code: "INTERNAL_SERVER_ERROR",
      message: "Erro inesperado no servidor",
      statusCode: 500,
      requestId: response.locals.requestId
    }
  });
}
