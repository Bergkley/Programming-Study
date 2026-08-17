import { prisma } from "../prisma";

export interface CreatePostData {
  title: string;
  content?: string | null;
  published?: boolean;
  authorId: number;
}

export type UpdatePostData = Partial<CreatePostData>;

const postRelations = {
  author: true,
  publications: {
    include: {
      socialAccount: {
        include: {
          socialMedia: true,
        },
      },
    },
  },
} as const;

export function createPost(data: CreatePostData) {
  return prisma.post.create({
    data,
    include: postRelations,
  });
}

export function listPosts() {
  return prisma.post.findMany({
    include: postRelations,
    orderBy: { id: "asc" },
  });
}

export function findPostById(id: number) {
  return prisma.post.findUnique({
    where: { id },
    include: postRelations,
  });
}

export function updatePost(id: number, data: UpdatePostData) {
  return prisma.post.update({
    where: { id },
    data,
    include: postRelations,
  });
}

export function deletePost(id: number) {
  return prisma.post.delete({ where: { id } });
}
