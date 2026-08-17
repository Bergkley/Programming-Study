import { prisma } from "../prisma";

export interface CreateSocialMediaData {
  name: string;
}

export type UpdateSocialMediaData = Partial<CreateSocialMediaData>;

const socialMediaRelations = {
  socialAccounts: {
    include: {
      user: true,
    },
  },
} as const;

export function createSocialMedia(data: CreateSocialMediaData) {
  return prisma.socialMedia.create({ data });
}

export function listSocialMedia() {
  return prisma.socialMedia.findMany({
    include: socialMediaRelations,
    orderBy: { id: "asc" },
  });
}

export function findSocialMediaById(id: number) {
  return prisma.socialMedia.findUnique({
    where: { id },
    include: socialMediaRelations,
  });
}

export function findSocialMediaByName(name: string) {
  return prisma.socialMedia.findUnique({
    where: { name },
    include: socialMediaRelations,
  });
}

export function updateSocialMedia(id: number, data: UpdateSocialMediaData) {
  return prisma.socialMedia.update({
    where: { id },
    data,
    include: socialMediaRelations,
  });
}

export function deleteSocialMedia(id: number) {
  return prisma.socialMedia.delete({ where: { id } });
}
