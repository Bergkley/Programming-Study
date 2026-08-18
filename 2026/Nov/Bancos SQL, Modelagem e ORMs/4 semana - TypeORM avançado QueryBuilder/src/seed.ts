import { AppDataSource, initializeDatabase } from "./data-source";
import { Post } from "./entities/Post";
import { Tag } from "./entities/Tag";
import { User } from "./entities/User";

export async function resetAndSeed(): Promise<void> {
  // dropBeforeSync=true recria apenas o banco local deste projeto.
  await AppDataSource.synchronize(true);

  const userRepository = AppDataSource.getRepository(User);
  const tagRepository = AppDataSource.getRepository(Tag);
  const postRepository = AppDataSource.getRepository(Post);

  const [ana, bruno, carla, diego] = await userRepository.save([
    userRepository.create({
      name: "Ana Lima",
      email: "ana@example.com",
      city: "Recife",
      active: true,
    }),
    userRepository.create({
      name: "Bruno Souza",
      email: "bruno@example.com",
      city: "São Paulo",
      active: true,
    }),
    userRepository.create({
      name: "Carla Mendes",
      email: "carla@example.com",
      city: "Curitiba",
      active: false,
    }),
    userRepository.create({
      name: "Diego Alves",
      email: "diego@example.com",
      city: "São Paulo",
      active: true,
    }),
  ]);

  const [typescript, database, backend] = await tagRepository.save([
    tagRepository.create({ name: "typescript" }),
    tagRepository.create({ name: "database" }),
    tagRepository.create({ name: "backend" }),
  ]);

  await postRepository.save([
    postRepository.create({
      title: "Primeiros passos com TypeORM",
      content: "Entidades, repositórios e DataSource.",
      published: true,
      views: 180,
      author: ana,
      tags: [typescript, database],
    }),
    postRepository.create({
      title: "QueryBuilder sem mistério",
      content: "Filtros, parâmetros e ordenação.",
      published: true,
      views: 320,
      author: ana,
      tags: [typescript, backend],
    }),
    postRepository.create({
      title: "Rascunho sobre migrations",
      content: "Este conteúdo ainda será revisado.",
      published: false,
      views: 15,
      author: ana,
      tags: [database],
    }),
    postRepository.create({
      title: "Índices no SQLite",
      content: "Como os índices ajudam as consultas.",
      published: true,
      views: 95,
      author: bruno,
      tags: [database, backend],
    }),
    postRepository.create({
      title: "APIs com TypeScript",
      content: "Organizando uma aplicação de backend.",
      published: true,
      views: 210,
      author: diego,
      tags: [typescript, backend],
    }),
    postRepository.create({
      title: "Anotações de SQL",
      content: "Consultas que ainda precisam de exemplos.",
      published: false,
      views: 8,
      author: carla,
      tags: [database],
    }),
  ]);

  console.log("Seed concluído: 4 usuários, 6 posts e 3 tags.");
}

async function main(): Promise<void> {
  try {
    await initializeDatabase();
    await resetAndSeed();
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  }
}

if (require.main === module) {
  main().catch((error: unknown) => {
    console.error("Erro ao executar o seed:", error);
    process.exitCode = 1;
  });
}
