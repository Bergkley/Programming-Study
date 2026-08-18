import "reflect-metadata";
import path from "node:path";
import { DataSource } from "typeorm";
import { Post } from "./entities/Post";
import { Tag } from "./entities/Tag";
import { User } from "./entities/User";

export const AppDataSource = new DataSource({
  type: "better-sqlite3",
  database: path.join(__dirname, "..", "data", "study.sqlite"),
  entities: [User, Post, Tag],

  // Conveniente somente para estudo. Em produção, use migrations.
  synchronize: true,
  logging: false,
});

export async function initializeDatabase(): Promise<DataSource> {
  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize();
  }

  return AppDataSource;
}
