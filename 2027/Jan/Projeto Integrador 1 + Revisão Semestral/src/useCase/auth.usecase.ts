import { unauthorized } from "../errors/http-error.js";
import AuthRepository from "../repository/auth.repository.js";
import { CreateUser, ResponseToken, User } from "../types/index.js";
import jwt, { JwtPayload, SignOptions } from "jsonwebtoken";
import { randomUUID } from "node:crypto";

type AuthTokenPayload = JwtPayload & {
  id: number;
  name: string;
  email: string;
  type: "access" | "refresh";
};

export class AuthUserUseCase {
  constructor(public readonly authRepository: AuthRepository) {}

  getAuthorizationGoogle(state?: string): string {
    const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");

    url.searchParams.set("scope", "openid email profile");
    url.searchParams.set("client_id", process.env.GOOGLE_CLIENT_ID ?? "");
    url.searchParams.set("redirect_uri", process.env.GOOGLE_REDIRECT_URI ?? "");
    url.searchParams.set("response_type", "code");
    url.searchParams.set("access_type", "offline");
    url.searchParams.set("prompt", "consent");

    if (state) {
      url.searchParams.set("state", state);
    }

    return url.toString();
  }

  async loginUserWithGoogle(code: string) {
    const accessTokenGoogle = await this.getAccessTokenGoogle(code);
    const getProfileUserGoogle =
      await this.getProfileUserGoogle(accessTokenGoogle);
    const user = await this.authRepository.upsertByUser({
      name: getProfileUserGoogle.name,
      email: getProfileUserGoogle.email,
    });

    const { accessToken, refreshToken } = this.generateTokens(user);

    return {
      message: "Login Realizado com sucesso",
      user,
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  }

  refreshUserTokens(refreshToken: string) {
    let payload: AuthTokenPayload;

    try {
      const decodedToken = jwt.verify(
        refreshToken,
        this.getJwtSecret("JWT_REFRESH_SECRET"),
        { algorithms: ["HS256"] },
      );

      if (
        typeof decodedToken === "string" ||
        decodedToken.type !== "refresh" ||
        typeof decodedToken.id !== "number"
      ) {
        throw new Error("Refresh token invalido");
      }

      payload = decodedToken as AuthTokenPayload;
    } catch {
      throw unauthorized("Refresh token invalido ou expirado");
    }

    return this.authRepository.getUser({ id: payload.id }).then((user) => {
      const { accessToken, refreshToken: newRefreshToken } =
        this.generateTokens(user);

      return {
        access_token: accessToken,
        refresh_token: newRefreshToken,
      };
    });
  }

  private async getAccessTokenGoogle(code: string): Promise<string> {
    const body = new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID ?? "",
      client_secret: process.env.GOOGLE_CLIENT_SECRET ?? "",
      redirect_uri: process.env.GOOGLE_REDIRECT_URI ?? "",
      grant_type: "authorization_code",
    });

    const response = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      body,
      headers: {
        "content-type": "application/x-www-form-urlencoded",
      },
    });

    const payload = (await response.json()) as ResponseToken;

    if (!response.ok || !payload.access_token) {
      throw unauthorized(
        payload.error_description ?? payload.error ?? "Token do google negado",
      );
    }

    return payload.access_token;
  }

  private async getProfileUserGoogle(accessToken: string) {
    const response = await fetch(
      "https://www.googleapis.com/oauth2/v3/userinfo",
      {
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
      },
    );

    const profile = (await response.json()) as CreateUser & {
      error?: string;
      error_description?: string;
    };

    if (!response.ok || !profile) {
      throw unauthorized(
        profile.error_description ??
          profile.error ??
          "Erro no getProfileUserGoogle",
      );
    }

    return profile;
  }

  private generateTokens(data: User) {
    const options: SignOptions = {
      expiresIn: (process.env.ACCESS_TOKEN_TTL ||
        "15m") as SignOptions["expiresIn"],
      algorithm: "HS256",
    };

    const accessToken = jwt.sign(
      { id: data.id, name: data.name, email: data.email, type: "access" },
      this.getJwtSecret("JWT_ACCESS_SECRET"),
      options,
    );

    const refreshToken = jwt.sign(
      { id: data.id, name: data.name, email: data.email, type: "refresh" },
      this.getJwtSecret("JWT_REFRESH_SECRET"),
      {
        expiresIn: (process.env.REFRESH_TOKEN_TTL ||
          "7d") as SignOptions["expiresIn"],
        algorithm: "HS256",
        jwtid: randomUUID(),
      },
    );

    return { accessToken, refreshToken };
  }

  private getJwtSecret(
    name: "JWT_ACCESS_SECRET" | "JWT_REFRESH_SECRET",
  ): string {
    const secret = process.env[name];

    if (!secret) {
      throw new Error(`A variavel de ambiente ${name} nao foi configurada`);
    }

    return secret;
  }
}
