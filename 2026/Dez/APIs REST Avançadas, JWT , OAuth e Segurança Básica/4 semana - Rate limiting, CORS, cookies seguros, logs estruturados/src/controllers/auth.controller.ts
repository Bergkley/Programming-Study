import type { NextFunction, Request, Response } from "express";
import { notFound } from "../errors/http-error.js";
import { AuthUseCase } from "../useCase/auth.usecase.js";

export class AuthController {
  constructor(private readonly authUseCase: AuthUseCase) {}

  registerUserController = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { name, email, password } = req.body;
      const result = await this.authUseCase.registerUser({
        name,
        email,
        password,
      });

      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  };

  loginUserController = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { email, password } = req.body;

      const result = await this.authUseCase.loginUser({ email, password });

      res.cookie("access_token", result.token, {
        httpOnly: true,
        secure: false,
        sameSite: "lax",
        maxAge: 15 * 60 * 1000,
      });

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  FindByIdUserController = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { id } = req.params;

      if (!id) {
        throw notFound("Id nao encontrado");
      }

      const result = await this.authUseCase.findById({ id });

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };
}
