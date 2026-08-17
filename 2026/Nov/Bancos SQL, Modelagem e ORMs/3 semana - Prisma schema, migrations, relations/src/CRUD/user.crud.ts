import { prisma } from "../prisma";

export interface CreateUserData {
  name: string;
  email: string;
}

export type UpdateUserData = Partial<CreateUserData>;

const userRelations = {
  posts: true,
  socialAccounts: {
    include: {
      socialMedia: true,
    },
  },
} as const;

export function createUser(data: CreateUserData) {
  return prisma.user.create({ data });
}

export function listUsers() {
  return prisma.user.findMany({
    include: userRelations,
    orderBy: { id: "asc" },
  });
}

export function findUserById(id: number) {
  return prisma.user.findUnique({
    where: { id },
    include: userRelations,
  });
}

export function findUserByEmail(email: string) {
  return prisma.user.findUnique({
    where: { email },
    include: userRelations,
  });
}

export function updateUser(id: number, data: UpdateUserData) {
  return prisma.user.update({
    where: { id },
    data,
    include: userRelations,
  });
}

export function deleteUser(id: number) {
  return prisma.user.delete({ where: { id } });
}
