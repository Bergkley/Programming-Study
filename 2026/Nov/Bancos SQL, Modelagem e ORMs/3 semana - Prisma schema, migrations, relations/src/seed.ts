import {
  createPost,
  createPostSocialAccount,
  createSocialAccount,
  createSocialMedia,
  createUser,
  findPostSocialAccountByPostAndAccount,
  findSocialAccountByUserAndMedia,
  findSocialMediaByName,
  findUserByEmail,
  getDatabaseSummary,
  listPosts,
  markPostSocialAccountAsPublished,
  updatePost,
  updateSocialAccount,
  updateUser,
} from "./CRUD";
import { prisma } from "./prisma";

const userData = {
  name: "Berg Brasil",
  email: "berg@test.com",
};

const postsData = [
  {
    title: "Bem-vindo ao Berg Brasil",
    content: "Este e o primeiro post do Berg Brasil.",
  },
  {
    title: "Prisma com SQLite",
    content: "Estudando schema, migrations e relacoes com Prisma ORM.",
  },
];

const socialMediaData = [
  { name: "Telegram", username: "bergbrasil" },
  { name: "Instagram", username: "bergbrasil" },
  { name: "Facebook", username: "berg.brasil" },
  { name: "LinkedIn", username: "berg-brasil" },
];

async function seed() {
  const existingUser = await findUserByEmail(userData.email);
  const user = existingUser
    ? await updateUser(existingUser.id, { name: userData.name })
    : await createUser(userData);

  const existingPosts = await listPosts();
  const posts = [];

  for (const postData of postsData) {
    const existingPost = existingPosts.find(
      (post) => post.authorId === user.id && post.title === postData.title,
    );

    const post = existingPost
      ? await updatePost(existingPost.id, {
          ...postData,
          published: true,
        })
      : await createPost({
          ...postData,
          authorId: user.id,
          published: true,
        });

    posts.push(post);
  }

  const socialAccounts = [];

  for (const mediaData of socialMediaData) {
    const existingMedia = await findSocialMediaByName(mediaData.name);
    const socialMedia =
      existingMedia ?? (await createSocialMedia({ name: mediaData.name }));

    const existingAccount = await findSocialAccountByUserAndMedia(
      user.id,
      socialMedia.id,
    );
    const socialAccount = existingAccount
      ? await updateSocialAccount(existingAccount.id, {
          username: mediaData.username,
        })
      : await createSocialAccount({
          userId: user.id,
          socialMediaId: socialMedia.id,
          username: mediaData.username,
        });

    socialAccounts.push(socialAccount);
  }

  for (const post of posts) {
    for (const socialAccount of socialAccounts) {
      const existingPublication =
        await findPostSocialAccountByPostAndAccount(
          post.id,
          socialAccount.id,
        );

      if (existingPublication) {
        await markPostSocialAccountAsPublished(existingPublication.id);
      } else {
        await createPostSocialAccount({
          postId: post.id,
          socialAccountId: socialAccount.id,
          publishedAt: new Date(),
        });
      }
    }
  }

  const summary = await getDatabaseSummary();

  console.log("Seed concluido:", summary);
  console.log("Usuario:", `${user.name} <${user.email}>`);
  console.log(
    "Posts:",
    posts.map((post) => post.title),
  );
  console.log(
    "Redes sociais:",
    socialAccounts.map((account) => account.socialMedia.name),
  );
}

seed()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
