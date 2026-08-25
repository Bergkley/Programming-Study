import { listUsers, saveGoogleUser } from "../repository/auth.repository.js";
import type { AuthUser, GoogleProfile } from "../types/index.js";
import { badRequest, unauthorized } from "../utils/http-error.js";

function sanitizeUser({ id, name, email }: AuthUser) {
  return { id, name, email };
}

function requiredEnv(name: string) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Variavel de ambiente ${name} nao configurada`);
  }
  return value;
}

export function getGoogleAuthorizationUrl(state?: string) {
  const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  url.searchParams.set("client_id", requiredEnv("GOOGLE_CLIENT_ID"));
  url.searchParams.set("redirect_uri", requiredEnv("GOOGLE_REDIRECT_URI"));
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", "openid email profile");
  url.searchParams.set("access_type", "offline");
  url.searchParams.set("prompt", "consent");

  if (state) {
    url.searchParams.set("state", state);
  }

  return url.toString();
}

async function exchangeCodeForAccessToken(code: string) {
  console.log('code', code)
  const body = new URLSearchParams({
    code,
    client_id: requiredEnv("GOOGLE_CLIENT_ID"),
    client_secret: requiredEnv("GOOGLE_CLIENT_SECRET"),
    redirect_uri: requiredEnv("GOOGLE_REDIRECT_URI"),
    grant_type: "authorization_code"
  });

  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: {
      "content-type": "application/x-www-form-urlencoded"
    },
    body
  });

  const payload = (await response.json()) as {
    access_token?: string;
    error?: string;
    error_description?: string;
  };

  if (!response.ok || !payload.access_token) {
    throw unauthorized(payload.error_description ?? payload.error ?? "Codigo OAuth invalido");
  }

  return payload.access_token;
}

async function getGoogleProfile(accessToken: string): Promise<GoogleProfile> {
  const response = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
    headers: {
      authorization: `Bearer ${accessToken}`
    }
  });

  const profile = (await response.json()) as GoogleProfile & { error?: string; error_description?: string };

  if (!response.ok) {
    throw unauthorized(profile.error_description ?? profile.error ?? "Nao foi possivel ler o perfil do Google");
  }

  if (!profile.sub || !profile.email || !profile.name) {
    throw badRequest("Perfil do Google incompleto");
  }

  if (profile.email_verified === false) {
    throw unauthorized("E-mail do Google ainda nao verificado");
  }

  return profile;
}

export async function loginWithGoogleCode(code: string) {
  const accessToken = await exchangeCodeForAccessToken(code);
  const profile = await getGoogleProfile(accessToken);
  const user = await saveGoogleUser(profile);

  return {
    message: "Login com Google realizado com sucesso",
    user: sanitizeUser(user)
  };
}

export async function getSavedUsers() {
  const users = await listUsers();
  return { users: users.map(sanitizeUser) };
}
