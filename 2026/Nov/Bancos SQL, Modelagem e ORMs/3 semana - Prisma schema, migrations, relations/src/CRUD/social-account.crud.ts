import { prisma } from "../prisma";

export interface CreateSocialAccountData {
  userId: number;
  socialMediaId: number;
  username?: string | null;
  accessToken?: string | null;
}

export type UpdateSocialAccountData = Partial<CreateSocialAccountData>;

const socialAccountRelations = {
  user: true,
  socialMedia: true,
  publications: {
    include: {
      post: true,
    },
  },
} as const;

export function createSocialAccount(data: CreateSocialAccountData) {
  return prisma.socialAccount.create({
    data,
    include: socialAccountRelations,
  });
}

export function listSocialAccounts() {
  return prisma.socialAccount.findMany({
    include: socialAccountRelations,
    orderBy: { id: "asc" },
  });
}

export function findSocialAccountById(id: number) {
  return prisma.socialAccount.findUnique({
    where: { id },
    include: socialAccountRelations,
  });
}

export function findSocialAccountByUserAndMedia(
  userId: number,
  socialMediaId: number,
) {
  return prisma.socialAccount.findUnique({
    where: {
      userId_socialMediaId: { userId, socialMediaId },
    },
    include: socialAccountRelations,
  });
}

export function updateSocialAccount(
  id: number,
  data: UpdateSocialAccountData,
) {
  return prisma.socialAccount.update({
    where: { id },
    data,
    include: socialAccountRelations,
  });
}

export function deleteSocialAccount(id: number) {
  return prisma.socialAccount.delete({ where: { id } });
}
