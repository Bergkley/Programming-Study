import { NextFunction,Request,Response } from "express";
import { HttpError } from "../errors/http-error.js";

export function errorHandler(
  error: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,) {

    if (error instanceof HttpError) {
      const responseBoby = {
        code: error.code,
        message: error.message,
        ...(error.details !== undefined ? { details: error.details } : {}),
      }

      res.status(error.statusCode).json(responseBoby);
    }

    res.status(500).json({
      message: error.message || "Erro interno no servidor",
    });
  }