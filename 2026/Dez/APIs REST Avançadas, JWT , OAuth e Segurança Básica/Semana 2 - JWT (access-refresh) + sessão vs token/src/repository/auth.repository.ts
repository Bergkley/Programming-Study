import { prisma } from "../database/prisma.js";

type CreateUserInput = {
  name: string;
  email: string;
  passwordHash: string;
};

type CreateSessionInput = {
  id: string;
  userId: string;
  refreshTokenHash: string;
  userAgent?: string;
  ipAddress?: string;
  expiresAt: Date;
};

type RevokeSessionInput = {
  id: string;
  userId: string;
  refreshTokenHash: string;
};

export function findUserByEmail(email: string) {
  return prisma.user.findUnique({
    where: { email }
  });
}

export function findUserById(id: string) {
  return prisma.user.findUnique({
    where: { id }
  });
}

export function createUser(data: CreateUserInput) {
  return prisma.user.create({
    data
  });
}

export function createSession(data: CreateSessionInput) {
  return prisma.session.create({
    data
  });
}

export function findSessionWithUser(id: string) {
  return prisma.session.findUnique({
    where: { id },
    include: { user: true }
  });
}

export function revokeSession(data: RevokeSessionInput) {
  return prisma.session.updateMany({
    where: {
      id: data.id,
      userId: data.userId,
      refreshTokenHash: data.refreshTokenHash,
      revokedAt: null
    },
    data: {
      revokedAt: new Date()
    }
  });
}
