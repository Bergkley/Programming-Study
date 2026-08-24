import { createHash, randomBytes, randomUUID, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import jwt from "jsonwebtoken";
import {
  createSession,
  createUser,
  findSessionWithUser,
  findUserByEmail,
  findUserById,
  revokeSession
} from "../repository/auth.repository.js";
import { badRequest, conflict, unauthorized } from "../utils/http-error.js";

const scrypt = promisify(scryptCallback);
const accessTokenExpiresIn = "15m";
const refreshTokenExpiresIn = "7d";
const refreshTokenTtlInMs = 7 * 24 * 60 * 60 * 1000;

type AuthBody = Record<string, unknown>;

type AuthUser = {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
};

type RequestMeta = {
  userAgent?: string;
  ipAddress?: string;
};

type RefreshTokenPayload = {
  sub: string;
  jti: string;
};

function getAccessTokenSecret() {
  return process.env.JWT_ACCESS_SECRET ?? process.env.JWT_SECRET ?? "dev-access-secret-change-me";
}

function getRefreshTokenSecret() {
  return process.env.JWT_REFRESH_SECRET ?? process.env.JWT_SECRET ?? "dev-refresh-secret-change-me";
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function readRequiredString(body: AuthBody, field: string) {
  const value = body[field];

  if (typeof value !== "string" || value.trim().length === 0) {
    throw badRequest(`Campo ${field} e obrigatorio`);
  }

  return value.trim();
}

function readPassword(body: AuthBody) {
  const password = readRequiredString(body, "password");

  if (password.length < 6) {
    throw badRequest("A senha precisa ter pelo menos 6 caracteres");
  }

  return password;
}

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const derivedKey = (await scrypt(password, salt, 64)) as Buffer;

  return `scrypt:${salt}:${derivedKey.toString("hex")}`;
}

async function verifyPassword(password: string, passwordHash: string) {
  const parts = passwordHash.split(":");

  if (parts.length !== 3 || parts[0] !== "scrypt") {
    return false;
  }

  const salt = parts[1];
  const storedHash = parts[2];

  if (!salt || !storedHash) {
    return false;
  }

  const derivedKey = (await scrypt(password, salt, 64)) as Buffer;
  const storedKey = Buffer.from(storedHash, "hex");

  if (derivedKey.length !== storedKey.length) {
    return false;
  }

  return timingSafeEqual(derivedKey, storedKey);
}

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

function refreshTokenExpiresAt() {
  return new Date(Date.now() + refreshTokenTtlInMs);
}

function sanitizeUser(user: AuthUser) {
  return {
    id: user.id,
    name: user.name,
    email: user.email
  };
}

function signAccessToken(user: AuthUser) {
  return jwt.sign(
    {
      sub: user.id,
      email: user.email,
      name: user.name,
      type: "access"
    },
    getAccessTokenSecret(),
    { expiresIn: accessTokenExpiresIn }
  );
}

function signRefreshToken(user: AuthUser, sessionId: string) {
  return jwt.sign(
    {
      sub: user.id,
      type: "refresh"
    },
    getRefreshTokenSecret(),
    {
      expiresIn: refreshTokenExpiresIn,
      jwtid: sessionId
    }
  );
}

async function createRefreshSession(user: AuthUser, meta: RequestMeta) {
  const sessionId = randomUUID();
  const refreshToken = signRefreshToken(user, sessionId);

  await createSession({
    id: sessionId,
    userId: user.id,
    refreshTokenHash: hashToken(refreshToken),
    userAgent: meta.userAgent,
    ipAddress: meta.ipAddress,
    expiresAt: refreshTokenExpiresAt()
  });

  return refreshToken;
}

async function issueTokens(user: AuthUser, meta: RequestMeta) {
  const accessToken = signAccessToken(user);
  const refreshToken = await createRefreshSession(user, meta);

  return {
    user: sanitizeUser(user),
    accessToken,
    refreshToken,
    tokenType: "Bearer",
    accessTokenExpiresIn,
    refreshTokenExpiresIn
  };
}

function verifyRefreshToken(refreshToken: string): RefreshTokenPayload {
  try {
    const payload = jwt.verify(refreshToken, getRefreshTokenSecret());

    if (
      typeof payload === "string" ||
      payload.type !== "refresh" ||
      typeof payload.sub !== "string" ||
      typeof payload.jti !== "string"
    ) {
      throw unauthorized("Refresh token invalido");
    }

    return {
      sub: payload.sub,
      jti: payload.jti
    };
  } catch {
    throw unauthorized("Refresh token invalido ou expirado");
  }
}

export async function register(body: AuthBody, meta: RequestMeta) {
  const name = readRequiredString(body, "name");
  const email = normalizeEmail(readRequiredString(body, "email"));
  const password = readPassword(body);

  const alreadyExists = await findUserByEmail(email);

  if (alreadyExists) {
    throw conflict("E-mail ja cadastrado");
  }

  const user = await createUser({
    name,
    email,
    passwordHash: await hashPassword(password)
  });

  return issueTokens(user, meta);
}

export async function login(body: AuthBody, meta: RequestMeta) {
  const email = normalizeEmail(readRequiredString(body, "email"));
  const password = readRequiredString(body, "password");

  const user = await findUserByEmail(email);

  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    throw unauthorized("E-mail ou senha invalidos");
  }

  return issueTokens(user, meta);
}

export async function refresh(body: AuthBody, meta: RequestMeta) {
  const refreshToken = readRequiredString(body, "refreshToken");
  const payload = verifyRefreshToken(refreshToken);
  const session = await findSessionWithUser(payload.jti);

  if (
    !session ||
    session.userId !== payload.sub ||
    session.revokedAt ||
    session.expiresAt <= new Date() ||
    session.refreshTokenHash !== hashToken(refreshToken)
  ) {
    throw unauthorized("Refresh token invalido");
  }

  const revokedSession = await revokeSession({
    id: session.id,
    userId: payload.sub,
    refreshTokenHash: hashToken(refreshToken)
  });

  if (revokedSession.count !== 1) {
    throw unauthorized("Refresh token ja utilizado");
  }

  return issueTokens(session.user, meta);
}

export async function logout(body: AuthBody) {
  const refreshToken = readRequiredString(body, "refreshToken");
  const payload = verifyRefreshToken(refreshToken);

  await revokeSession({
    id: payload.jti,
    userId: payload.sub,
    refreshTokenHash: hashToken(refreshToken)
  });
}

export async function getUserById(userId: string) {
  const user = await findUserById(userId);

  if (!user) {
    throw unauthorized("Usuario nao encontrado");
  }

  return sanitizeUser(user);
}
