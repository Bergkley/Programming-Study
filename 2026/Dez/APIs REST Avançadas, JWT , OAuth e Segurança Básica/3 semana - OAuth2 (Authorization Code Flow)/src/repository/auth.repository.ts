import { prisma } from "../database/prisma.js";
import type { GoogleProfile } from "../types/index.js";

export async function saveGoogleUser(profile: GoogleProfile) {
  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [{ googleId: profile.sub }, { email: profile.email }]
    }
  });

  if (existingUser) {
    return prisma.user.update({
      where: { id: existingUser.id },
      data: {
        googleId: profile.sub,
        name: profile.name,
        email: profile.email,
        avatarUrl: profile.picture
      }
    });
  }

  return prisma.user.create({
    data: {
      googleId: profile.sub,
      name: profile.name,
      email: profile.email,
      avatarUrl: profile.picture
    }
  });
}

export function listUsers() {
  return prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      avatarUrl: true,
      createdAt: true,
      updatedAt: true
    }
  });
}
