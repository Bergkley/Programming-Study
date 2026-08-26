import { badRequest, unauthorized } from "../errors/http-error.js";
import { AuthRepository } from "../repository/auth.repository.js";
import type {
  AuthGoogleResponse,
  GoogleProfile,
  ResponseToken,
} from "../types/index.js";

export class AuthGoogleUseCase {
  constructor(private readonly authRepository: AuthRepository) {}

  getAuthorizationUrl(state?: string): string {
    const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");

    url.searchParams.set("client_id", process.env.GOOGLE_CLIENT_ID ?? "");
    url.searchParams.set("redirect_uri", process.env.GOOGLE_REDIRECT_URI ?? "");
    url.searchParams.set("response_type", "code");
    url.searchParams.set("scope", "openid email profile");
    url.searchParams.set("access_type", "offline");
    url.searchParams.set("prompt", "consent");

    if (state) {
      url.searchParams.set("state", state);
    }

    return url.toString();
  }

  async loginWithGoogle(code: string): Promise<AuthGoogleResponse> {
    const accessToken = await this.getAccessTokenGoogle(code);
    const profile = await this.getProfileGoogle(accessToken);
    const user = await this.authRepository.upsertByGoogleProfile(profile);

    return {
      message: "Login com Google realizado com sucesso",
      user,
    };
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
      headers: {
        "content-type": "application/x-www-form-urlencoded",
      },
      body,
    });

    const payload = (await response.json()) as ResponseToken;

    if (!response.ok || !payload.access_token) {
      throw unauthorized(
        payload.error_description ?? payload.error ?? "Token negado",
      );
    }

    return payload.access_token;
  }

  private async getProfileGoogle(token: string): Promise<GoogleProfile> {
    const response = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: {
        authorization: `Bearer ${token}`,
      },
    });

    const profile = (await response.json()) as GoogleProfile & {
      error?: string;
      error_description?: string;
    };

    if (!response.ok) {
      throw unauthorized(
        profile.error_description ?? profile.error ?? "Erro no getProfileGoogle",
      );
    }

    if (!profile.name || !profile.email) {
      throw badRequest("Perfil nao tem nome ou email", profile);
    }

    return {
      name: profile.name,
      email: profile.email,
    };
  }
}
