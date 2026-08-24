import { randomUUID } from "node:crypto";
import { normalizeEmail, requireField, hashPassword, verifyPassword } from "../helpers/index.js";
import {
  createSession,
  createUser,
  findSessionWithUser,
  findUserByEmail,
  findUserById,
  revokeSession
} from "../repository/auth.repository.js";
import type { AuthBody, AuthUser, RequestMeta } from "../types/index.js";
import {
  ACCESS_TOKEN_TTL,
  REFRESH_TOKEN_TTL,
  getRefreshTokenExpiresAt,
  hashToken,
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken
} from "../utils/auth-token.js";
import { conflict, unauthorized } from "../utils/http-error.js";

function sanitizeUser({ id, name, email }: AuthUser) {
  return { id, name, email };
}

async function issueTokens(user: AuthUser, meta: RequestMeta) {
  const sessionId = randomUUID();
  const refreshToken = signRefreshToken(user, sessionId);

  await createSession({
    id: sessionId,
    userId: user.id,
    refreshTokenHash: hashToken(refreshToken),
    userAgent: meta.userAgent,
    ipAddress: meta.ipAddress,
    expiresAt: getRefreshTokenExpiresAt()
  });

  return {
    user: sanitizeUser(user),
    accessToken: signAccessToken(user),
    refreshToken,
    tokenType: "Bearer",
    accessTokenExpiresIn: ACCESS_TOKEN_TTL,
    refreshTokenExpiresIn: REFRESH_TOKEN_TTL
  };
}

export async function register(body: AuthBody, meta: RequestMeta) {
  const name = requireField(body, "name");
  const email = normalizeEmail(requireField(body, "email"));
  const password = requireField(body, "password", 6);

  if (await findUserByEmail(email)) {
    throw conflict("E-mail ja cadastrado");
  }

  const user = await createUser({ name, email, passwordHash: await hashPassword(password) });
  return issueTokens(user, meta);
}

export async function login(body: AuthBody, meta: RequestMeta) {
  const email = normalizeEmail(requireField(body, "email"));
  const password = requireField(body, "password");

  const user = await findUserByEmail(email);
  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    throw unauthorized("E-mail ou senha invalidos");
  }

  return issueTokens(user, meta);
}

export async function refresh(body: AuthBody, meta: RequestMeta) {
  const refreshToken = requireField(body, "refreshToken");
  const { sub, jti } = verifyRefreshToken(refreshToken);
  const session = await findSessionWithUser(jti);

  const isValid =
    session &&
    session.userId === sub &&
    !session.revokedAt &&
    session.expiresAt > new Date() &&
    session.refreshTokenHash === hashToken(refreshToken);

  if (!isValid) {
    throw unauthorized("Refresh token invalido");
  }

  const revoked = await revokeSession({ id: session.id, userId: sub, refreshTokenHash: hashToken(refreshToken) });
  if (revoked.count !== 1) {
    throw unauthorized("Refresh token ja utilizado");
  }

  return issueTokens(session.user, meta);
}

export async function logout(body: AuthBody) {
  const refreshToken = requireField(body, "refreshToken");
  const { sub, jti } = verifyRefreshToken(refreshToken);

  await revokeSession({ id: jti, userId: sub, refreshTokenHash: hashToken(refreshToken) });
}

export async function getUserById(userId: string) {
  const user = await findUserById(userId);
  if (!user) throw unauthorized("Usuario nao encontrado");
  return sanitizeUser(user);
}
