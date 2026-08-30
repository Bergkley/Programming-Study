import { prisma } from "../database/prisma.js";
import { conflict } from "../errors/http-error.js";
import { Prisma } from "../generated/prisma/client.js";
import { CreateUser, FindByIdUser, FindUser, User } from "../types/index.js";

export class AuthRepository {
  async createUser(user: CreateUser): Promise<User> {
    try {
      return await prisma.user.create({
        data: {
          name: user.name,
          email: user.email,
          password: user.password,
        },
        select: {
          id: true,
          name: true,
          email: true,
          createdAt: true,
          updatedAt: true,
        },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        throw conflict("Usuario ja cadastrado");
      }

      throw new Error("Erro ao criar usuario");
    }
  }

  async findUser(
    data: FindUser,
  ): Promise<(User & { password: string }) | null> {
    return prisma.user.findUnique({
      where: {
        email: String(data.email),
      },
      select: {
        id: true,
        email: true,
        name: true,
        password: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async findByIdUser(
    data: FindByIdUser,
  ): Promise<(User) | null> {
    return prisma.user.findUnique({
      where: {
        id: String(data.id),
      },
      select: {
        id: true,
        email: true,
        name: true,
        password: false,
        createdAt: true,
        updatedAt: true,
      },
    });
  }
}
