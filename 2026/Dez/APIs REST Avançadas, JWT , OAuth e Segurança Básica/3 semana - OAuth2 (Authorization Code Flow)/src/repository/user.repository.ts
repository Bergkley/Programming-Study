import { prisma } from "../database/prisma.js";
import type { UserListItem } from "../types/index.js";

export class UserRepository {
  async findAll(): Promise<UserListItem[]> {
    return prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      select: { id: true, name: true, email: true },
    });
  }
}
