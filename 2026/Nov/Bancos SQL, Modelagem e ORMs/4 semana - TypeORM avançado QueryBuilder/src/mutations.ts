import { AppDataSource, initializeDatabase } from "./data-source";
import { heading, showSql } from "./console-utils";
import { Post } from "./entities/Post";
import { Tag } from "./entities/Tag";
import { User } from "./entities/User";
import { resetAndSeed } from "./seed";

export async function runMutationExamples(): Promise<void> {
  heading("8. INSERT com InsertQueryBuilder");

  const insertQuery = AppDataSource.createQueryBuilder()
    .insert()
    .into(Post)
    .values({
      title: "Post temporário criado pelo QueryBuilder",
      content: "Usado para praticar INSERT, relação, UPDATE e DELETE.",
      published: false,
      views: 0,
      authorId: 2,
    });

  showSql(insertQuery);
  const insertResult = await insertQuery.execute();
  const insertedPostId = Number(insertResult.identifiers[0].id);
  console.log("Post inserido com id:", insertedPostId);

  heading("9. RelationQueryBuilder: adicionando tag sem carregar o post");

  const backendTag = await AppDataSource.getRepository(Tag)
    .createQueryBuilder("tag")
    .where("tag.name = :name", { name: "backend" })
    .getOneOrFail();

  await AppDataSource.createQueryBuilder()
    .relation(Post, "tags")
    .of(insertedPostId)
    .add(backendTag.id);

  console.log(`Tag '${backendTag.name}' ligada ao post ${insertedPostId}.`);

  heading("10. UPDATE com expressão SQL");

  const updateQuery = AppDataSource.createQueryBuilder()
    .update(Post)
    .set({ published: true, views: () => '"views" + 10' })
    .where("id = :id", { id: insertedPostId });

  showSql(updateQuery);
  const updateResult = await updateQuery.execute();
  console.log("Linhas atualizadas:", updateResult.affected);

  const updatedPost = await AppDataSource.getRepository(Post)
    .createQueryBuilder("post")
    .leftJoinAndSelect("post.tags", "tag")
    .where("post.id = :id", { id: insertedPostId })
    .getOneOrFail();

  console.log({
    title: updatedPost.title,
    published: updatedPost.published,
    views: updatedPost.views,
    tags: updatedPost.tags.map((tag) => tag.name),
  });

  heading("11. DELETE com DeleteQueryBuilder");

  const deleteQuery = AppDataSource.createQueryBuilder()
    .delete()
    .from(Post)
    .where("id = :id", { id: insertedPostId });

  showSql(deleteQuery);
  const deleteResult = await deleteQuery.execute();
  console.log("Linhas removidas:", deleteResult.affected);

  const remainingUsers = await AppDataSource.getRepository(User).count();
  const remainingPosts = await AppDataSource.getRepository(Post).count();
  console.log({ remainingUsers, remainingPosts });
}

async function main(): Promise<void> {
  try {
    await initializeDatabase();
    await resetAndSeed();
    await runMutationExamples();
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  }
}

if (require.main === module) {
  main().catch((error: unknown) => {
    console.error("Erro ao executar as mutações:", error);
    process.exitCode = 1;
  });
}
