import { NextFunction, Request, Response } from "express";
import { AuthUserUseCase } from "../useCase/auth.usecase.js";
import { badRequest, unauthorized } from "../errors/http-error.js";

type TokenPair = {
  access_token: string;
  refresh_token: string;
};

export class authUserController {
  constructor(public readonly authUserUseCase: AuthUserUseCase) {}

  googleAuthorizationController = (
    req: Request,
    res: Response,
    _next: NextFunction,
  ) => {
    const state =
      typeof req.query.state === "string" ? req.query.state : undefined;

    res.redirect(this.authUserUseCase.getAuthorizationGoogle(state));
  };

  loginGoogleController = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const { code, error } = req.query;

      if (error) {
        throw badRequest("Error ao logar com Google", error);
      }

      if (typeof code !== "string" || !code) {
        throw badRequest("parâmetro code não informado pelo Google");
      }

      const result = await this.authUserUseCase.loginUserWithGoogle(code);
      this.setTokenCookies(res, result);

      return res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  };

  refreshTokenController = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const refreshToken =
        this.getCookieValue(req.headers.cookie, "refresh_token") ??
        (typeof req.body?.refresh_token === "string"
          ? req.body.refresh_token
          : undefined);

      if (!refreshToken) {
        throw unauthorized("Refresh token nao encontrado");
      }

      const tokens = await this.authUserUseCase.refreshUserTokens(refreshToken);
      this.setTokenCookies(res, tokens);

      return res.status(200).json(tokens);
    } catch (error) {
      next(error);
    }
  };

  private setTokenCookies(res: Response, tokens: TokenPair): void {
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax" as const,
    };

    res.cookie("access_token", tokens.access_token, {
      ...cookieOptions,
      path: "/",
    });
    res.cookie("refresh_token", tokens.refresh_token, {
      ...cookieOptions,
      path: "/auth/refresh",
    });
  }

  private getCookieValue(
    cookieHeader: string | undefined,
    cookieName: string,
  ): string | undefined {
    const cookie = cookieHeader
      ?.split(";")
      .map((item) => item.trim())
      .find((item) => item.startsWith(`${cookieName}=`));

    return cookie
      ? decodeURIComponent(cookie.slice(cookieName.length + 1))
      : undefined;
  }
}
