import { prisma } from "../database/prisma.js";
import type { GoogleProfile, User } from "../types/index.js";

export class AuthRepository {
  async upsertByGoogleProfile(user: GoogleProfile): Promise<User> {
    return prisma.user.upsert({
      where: {
        email: user.email,
      },
      update: {
        name: user.name,
      },
      create: {
        name: user.name,
        email: user.email,
      },
    });
  }
}

