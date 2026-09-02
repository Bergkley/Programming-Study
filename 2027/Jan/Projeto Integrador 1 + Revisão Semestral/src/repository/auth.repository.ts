import { prisma } from "../database/prisma.js";
import { CreateUser, FindUserById, User } from "../types/index.js";
export default class AuthRepository {
  async upsertByUser(user: CreateUser): Promise<User> {
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

  async getUser(data: FindUserById): Promise<User> {
    if (!data.id) {
      throw new Error("É necessário fornecer o id");
    }
    return prisma.user.findUniqueOrThrow({
      where: {
        id: data.id,
      },
    });
  }
}
