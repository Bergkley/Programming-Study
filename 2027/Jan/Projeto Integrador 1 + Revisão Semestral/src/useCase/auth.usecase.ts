import AuthRepository from "../repository/auth.repository.js";

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
}
