import jwt, { type SignOptions } from "jsonwebtoken";
import type AuthRepository from "../../src/repository/auth.repository.js";
import type { User } from "../../src/types/index.js";

export type AuthRepositoryMock = jest.Mocked<
  Pick<AuthRepository, "getUser" | "upsertByUser">
>;

export const authEnvMock = {
  GOOGLE_CLIENT_ID: "google-client-id",
  GOOGLE_CLIENT_SECRET: "google-client-secret",
  GOOGLE_REDIRECT_URI: "http://localhost:3000/auth/google/callback",
  JWT_ACCESS_SECRET: "access-secret",
  JWT_REFRESH_SECRET: "refresh-secret",
  ACCESS_TOKEN_TTL: "15m",
  REFRESH_TOKEN_TTL: "7d",
};

export const googleCodeMock = "google-code";
export const googleAccessTokenMock = "google-access-token";

export const authUserMock: User = {
  id: 1,
  name: "Google User",
  email: "google.user@example.com",
  createdAt: new Date("2026-01-01T00:00:00.000Z"),
  updatedAt: new Date("2026-01-01T00:00:00.000Z"),
};

export function makeAuthRepositoryMock(): AuthRepositoryMock {
  return {
    getUser: jest.fn(),
    upsertByUser: jest.fn(),
  };
}

export function makeGoogleAccessTokenResponseMock(): Response {
  return {
    ok: true,
    json: async () => ({ access_token: googleAccessTokenMock }),
  } as Response;
}

export function makeGoogleProfileResponseMock(): Response {
  return {
    ok: true,
    json: async () => ({
      name: authUserMock.name,
      email: authUserMock.email,
    }),
  } as Response;
}

export function makeRefreshTokenMock(user = authUserMock): string {
  return jwt.sign(
    {
      id: user.id,
      name: user.name,
      email: user.email,
      type: "refresh",
    },
    authEnvMock.JWT_REFRESH_SECRET,
    {
      algorithm: "HS256",
      expiresIn: authEnvMock.REFRESH_TOKEN_TTL as SignOptions["expiresIn"],
    },
  );
}
