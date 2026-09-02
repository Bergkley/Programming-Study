import { NextFunction, Request, Response } from "express";
import { AuthUserUseCase } from "../useCase/auth.usecase.js";

export class authUserController {
  constructor(public readonly authUserUseCase: AuthUserUseCase) {}

  googleLoginController = (req: Request, res: Response, _next: NextFunction) => {
    const state =
      typeof req.query.state === "string" ? req.query.state : undefined;

    res.redirect(this.authUserUseCase.getAuthorizationGoogle(state));
  };
}
