import { prisma } from "../prisma";

export async function getDatabaseSummary() {
  const [users, posts, socialMedia, socialAccounts, publications] =
    await Promise.all([
      prisma.user.count(),
      prisma.post.count(),
      prisma.socialMedia.count(),
      prisma.socialAccount.count(),
      prisma.postSocialAccount.count(),
    ]);

  return { users, posts, socialMedia, socialAccounts, publications };
}
