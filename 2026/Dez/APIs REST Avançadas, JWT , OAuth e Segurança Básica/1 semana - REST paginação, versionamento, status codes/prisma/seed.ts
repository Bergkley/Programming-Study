import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import Database from "better-sqlite3";
import { PrismaClient } from "../generated/prisma/client.js";

const databaseUrl = process.env.DATABASE_URL ?? "file:./dev.db";

const prisma = new PrismaClient({
  adapter: new PrismaBetterSqlite3({
    url: databaseUrl
  })
});

const products = [
  {
    id: "prd_001",
    name: "Mechanical Keyboard",
    price: 349.9,
    stock: 12,
    category: "peripherals",
    createdAt: new Date("2026-12-01T10:00:00.000Z")
  },
  {
    id: "prd_002",
    name: "USB-C Dock",
    price: 259.9,
    stock: 30,
    category: "accessories",
    createdAt: new Date("2026-12-02T10:00:00.000Z")
  },
  {
    id: "prd_003",
    name: "Noise Cancelling Headset",
    price: 599.9,
    stock: 8,
    category: "audio",
    createdAt: new Date("2026-12-03T10:00:00.000Z")
  },
  {
    id: "prd_004",
    name: "4K Monitor",
    price: 1899.9,
    stock: 5,
    category: "displays",
    createdAt: new Date("2026-12-04T10:00:00.000Z")
  },
  {
    id: "prd_005",
    name: "Ergonomic Mouse",
    price: 199.9,
    stock: 20,
    category: "peripherals",
    createdAt: new Date("2026-12-05T10:00:00.000Z")
  },
  {
    id: "prd_006",
    name: "Webcam Full HD",
    price: 229.9,
    stock: 15,
    category: "video",
    createdAt: new Date("2026-12-06T10:00:00.000Z")
  },
  {
    id: "prd_007",
    name: "Laptop Stand",
    price: 149.9,
    stock: 18,
    category: "accessories",
    createdAt: new Date("2026-12-07T10:00:00.000Z")
  }
];

async function main() {
  createProductTable();

  for (const product of products) {
    await prisma.product.upsert({
      where: { id: product.id },
      create: product,
      update: {
        name: product.name,
        price: product.price,
        stock: product.stock,
        category: product.category,
        createdAt: product.createdAt
      }
    });
  }

  console.log(`Seed completed with ${products.length} products.`);
}

function createProductTable() {
  const database = new Database(databaseUrl.replace("file:", ""));

  database.exec(`
    CREATE TABLE IF NOT EXISTS "Product" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "name" TEXT NOT NULL,
      "price" REAL NOT NULL,
      "stock" INTEGER NOT NULL,
      "category" TEXT NOT NULL,
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" DATETIME NOT NULL
    );

    CREATE UNIQUE INDEX IF NOT EXISTS "Product_name_key" ON "Product"("name");
    CREATE INDEX IF NOT EXISTS "Product_name_idx" ON "Product"("name");
    CREATE INDEX IF NOT EXISTS "Product_price_idx" ON "Product"("price");
    CREATE INDEX IF NOT EXISTS "Product_createdAt_idx" ON "Product"("createdAt");
  `);

  database.close();
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
