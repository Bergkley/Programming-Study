import { Brackets, SelectQueryBuilder } from "typeorm";
import { AppDataSource, initializeDatabase } from "./data-source";
import { heading, showSql } from "./console-utils";
import { Post } from "./entities/Post";
import { User } from "./entities/User";
import { resetAndSeed } from "./seed";

type UserFilters = {
  active?: boolean;
  city?: string;
  search?: string;
};

function buildUserSearch(filters: UserFilters): SelectQueryBuilder<User> {
  const query = AppDataSource.getRepository(User).createQueryBuilder("user");

  if (filters.active !== undefined) {
    query.andWhere("user.active = :active", { active: filters.active });
  }

  if (filters.city) {
    query.andWhere("user.city = :city", { city: filters.city });
  }

  if (filters.search) {
    query.andWhere(
      new Brackets((nestedQuery) => {
        nestedQuery
          .where("LOWER(user.name) LIKE LOWER(:search)")
          .orWhere("LOWER(user.email) LIKE LOWER(:search)");
      }),
      { search: `%${filters.search}%` },
    );
  }

  return query.orderBy("user.name", "ASC");
}

async function exampleDynamicFilters(): Promise<void> {
  heading("1. WHERE dinâmico + parâmetros + Brackets");

  const query = buildUserSearch({
    active: true,
    city: "São Paulo",
    search: "a",
  });

  showSql(query);
  console.table(await query.getMany());
}

async function exampleJoins(): Promise<void> {
  heading("2. JOIN entre posts, autores e tags");

  const query = AppDataSource.getRepository(Post)
    .createQueryBuilder("post")
    .innerJoinAndSelect("post.author", "author")
    .leftJoinAndSelect("post.tags", "tag")
    .where("post.published = :published", { published: true })
    .andWhere("post.views >= :minimumViews", { minimumViews: 100 })
    .orderBy("post.views", "DESC");

  showSql(query);

  const posts = await query.getMany();
  console.table(
    posts.map((post) => ({
      title: post.title,
      author: post.author.name,
      views: post.views,
      tags: post.tags.map((tag) => tag.name).join(", "),
    })),
  );
}

async function exampleAggregation(): Promise<void> {
  heading("3. SELECT parcial + COUNT/SUM + GROUP BY + HAVING");

  const query = AppDataSource.getRepository(User)
    .createQueryBuilder("user")
    .leftJoin("user.posts", "post")
    .select("user.id", "userId")
    .addSelect("user.name", "name")
    .addSelect("COUNT(post.id)", "postCount")
    .addSelect(
      "SUM(CASE WHEN post.published = :published THEN post.views ELSE 0 END)",
      "publishedViews",
    )
    .setParameter("published", true)
    .groupBy("user.id")
    .addGroupBy("user.name")
    .having("COUNT(post.id) >= :minimumPosts", { minimumPosts: 1 })
    .orderBy("publishedViews", "DESC");

  showSql(query);
  console.table(await query.getRawMany());
}

async function exampleCountVsCountDistinct(): Promise<void> {
  heading("4. COUNT x COUNT(DISTINCT): efeito de um JOIN 1:N");

  const query = AppDataSource.getRepository(Post)
    .createQueryBuilder("post")
    .innerJoin("post.tags", "tag")
    .select("COUNT(post.id)", "countWithDuplicates")
    .addSelect("COUNT(DISTINCT post.id)", "distinctPostCount")
    .where("post.published = :published", { published: true });

  showSql(query);

  const result = await query.getRawOne<{
    countWithDuplicates: number;
    distinctPostCount: number;
  }>();

  console.table([result]);
  console.log(
    "COUNT conta as linhas produzidas pelo JOIN; COUNT(DISTINCT post.id) conta cada post apenas uma vez.",
  );
}

async function exampleSubquery(): Promise<void> {
  heading("5. Subquery: autores com post popular publicado");

  const popularAuthors = AppDataSource.getRepository(Post)
    .createQueryBuilder("popularPost")
    .select("popularPost.authorId")
    .where("popularPost.published = :isPublished")
    .andWhere("popularPost.views >= :popularViews");

  const query = AppDataSource.getRepository(User)
    .createQueryBuilder("user")
    .where(`user.id IN (${popularAuthors.getQuery()})`)
    .setParameters({ isPublished: true, popularViews: 200 })
    .orderBy("user.name", "ASC");

  showSql(query);
  console.table(await query.getMany());
}

async function examplePagination(): Promise<void> {
  heading("6. Paginação com skip/take e getManyAndCount");

  const page = 2;
  const perPage = 2;
  const query = AppDataSource.getRepository(Post)
    .createQueryBuilder("post")
    .where("post.published = :published", { published: true })
    .orderBy("post.views", "DESC")
    .skip((page - 1) * perPage)
    .take(perPage);

  showSql(query);
  const [posts, total] = await query.getManyAndCount();

  console.log({ page, perPage, total });
  console.table(posts.map(({ id, title, views }) => ({ id, title, views })));
}

async function exampleEntitiesAndRawResults(): Promise<void> {
  heading("7. getMany (entidades) x getRawMany (resultado projetado)");

  const query = AppDataSource.getRepository(Post)
    .createQueryBuilder("post")
    .innerJoin("post.author", "author")
    .select("post.title", "title")
    .addSelect("author.name", "author")
    .addSelect("post.views", "views")
    .where("post.published = :published", { published: true })
    .orderBy("post.views", "DESC");

  showSql(query);
  console.table(await query.getRawMany());
}

export async function runQueryBuilderExamples(): Promise<void> {
  await exampleDynamicFilters();
  await exampleJoins();
  await exampleAggregation();
  await exampleCountVsCountDistinct();
  await exampleSubquery();
  await examplePagination();
  await exampleEntitiesAndRawResults();
}

async function main(): Promise<void> {
  try {
    await initializeDatabase();
    await resetAndSeed();
    await runQueryBuilderExamples();
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  }
}

if (require.main === module) {
  main().catch((error: unknown) => {
    console.error("Erro ao executar as consultas:", error);
    process.exitCode = 1;
  });
}
