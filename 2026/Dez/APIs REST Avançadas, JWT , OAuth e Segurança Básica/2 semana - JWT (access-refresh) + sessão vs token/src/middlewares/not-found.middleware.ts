import type { Request, Response } from "express";

export function notFoundMiddleware(_request: Request, response: Response) {
  response.status(404).json({
    error: {
      code: "NOT_FOUND",
      message: "Rota nao encontrada",
      statusCode: 404,
      requestId: response.locals.requestId
    }
  });
}
