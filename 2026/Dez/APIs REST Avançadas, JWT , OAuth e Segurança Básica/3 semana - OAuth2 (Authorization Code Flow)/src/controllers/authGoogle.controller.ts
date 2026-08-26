import type { NextFunction, Request, Response } from "express";
import { badRequest } from "../errors/http-error.js";
import type { IAuthGoogle } from "../interfaces/IAuthGoogle.js";
import { AuthGoogleUseCase } from "../usecases/auth-google.usecase.js";

export class AuthGoogleController implements IAuthGoogle {
  constructor(private readonly authGoogleUseCase: AuthGoogleUseCase) {}

  googleLoginController = (
    req: Request,
    res: Response,
    _next: NextFunction,
  ): void => {
    const state =
      typeof req.query.state === "string" ? req.query.state : undefined;

    res.redirect(this.authGoogleUseCase.getAuthorizationUrl(state));
  }

  googleCallbackController = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      if (req.query?.error) {
        throw badRequest("Erro ao logar com Google", req.query);
      }

      const code =
        typeof req.query.code === "string" ? req.query.code : undefined;

      if (!code) {
        throw badRequest("Parametro code nao informado pelo Google");
      }

      const result = await this.authGoogleUseCase.loginWithGoogle(code);

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
}
