import { prisma } from "../prisma";

export interface CreatePostSocialAccountData {
  postId: number;
  socialAccountId: number;
  publishedAt?: Date | null;
}

export type UpdatePostSocialAccountData =
  Partial<CreatePostSocialAccountData>;

const postSocialAccountRelations = {
  post: {
    include: {
      author: true,
    },
  },
  socialAccount: {
    include: {
      user: true,
      socialMedia: true,
    },
  },
} as const;

export function createPostSocialAccount(data: CreatePostSocialAccountData) {
  return prisma.postSocialAccount.create({
    data,
    include: postSocialAccountRelations,
  });
}

export function listPostSocialAccounts() {
  return prisma.postSocialAccount.findMany({
    include: postSocialAccountRelations,
    orderBy: { id: "asc" },
  });
}

export function findPostSocialAccountById(id: number) {
  return prisma.postSocialAccount.findUnique({
    where: { id },
    include: postSocialAccountRelations,
  });
}

export function findPostSocialAccountByPostAndAccount(
  postId: number,
  socialAccountId: number,
) {
  return prisma.postSocialAccount.findUnique({
    where: {
      postId_socialAccountId: { postId, socialAccountId },
    },
    include: postSocialAccountRelations,
  });
}

export function updatePostSocialAccount(
  id: number,
  data: UpdatePostSocialAccountData,
) {
  return prisma.postSocialAccount.update({
    where: { id },
    data,
    include: postSocialAccountRelations,
  });
}

export function markPostSocialAccountAsPublished(
  id: number,
  publishedAt = new Date(),
) {
  return updatePostSocialAccount(id, { publishedAt });
}

export function deletePostSocialAccount(id: number) {
  return prisma.postSocialAccount.delete({ where: { id } });
}
