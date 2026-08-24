import { createHash } from "node:crypto";
import jwt from "jsonwebtoken";
import type { AuthUser, RefreshTokenPayload } from "../types/index.js";
import { unauthorized } from "./http-error.js";

export const ACCESS_TOKEN_TTL = "15m";
export const REFRESH_TOKEN_TTL = "7d";

const REFRESH_TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000;

function getSecret(kind: "access" | "refresh") {
  const envKey = kind === "access" ? "JWT_ACCESS_SECRET" : "JWT_REFRESH_SECRET";
  return process.env[envKey] ?? process.env.JWT_SECRET ?? `dev-${kind}-secret-change-me`;
}

export function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export function getRefreshTokenExpiresAt() {
  return new Date(Date.now() + REFRESH_TOKEN_TTL_MS);
}

export function signAccessToken(user: AuthUser) {
  return jwt.sign({ sub: user.id, email: user.email, name: user.name, type: "access" }, getSecret("access"), {
    expiresIn: ACCESS_TOKEN_TTL
  });
}

export function signRefreshToken(user: AuthUser, sessionId: string) {
  return jwt.sign({ sub: user.id, type: "refresh" }, getSecret("refresh"), {
    expiresIn: REFRESH_TOKEN_TTL,
    jwtid: sessionId
  });
}

export function verifyRefreshToken(refreshToken: string): RefreshTokenPayload {
  try {
    const payload = jwt.verify(refreshToken, getSecret("refresh"));

    if (
      typeof payload === "string" ||
      payload.type !== "refresh" ||
      typeof payload.sub !== "string" ||
      typeof payload.jti !== "string"
    ) {
      throw new Error("invalid payload");
    }

    return {
      sub: payload.sub,
      jti: payload.jti
    };
  } catch {
    throw unauthorized("Refresh token invalido ou expirado");
  }
}
