export type AuthBody = Record<string, unknown>;

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
};

export type RequestMeta = {
  userAgent?: string;
  ipAddress?: string;
};

export type RefreshTokenPayload = {
  sub: string;
  jti: string;
};
