import type { Prisma } from "../../generated/prisma/client.js";
import { prisma } from "../database/prisma.js";
import type { CreateProductInput, ProductListQuery } from "../types/products.js";

export async function listProducts(query: ProductListQuery) {
  const skip = (query.page - 1) * query.perPage;
  const orderBy: Prisma.ProductOrderByWithRelationInput = {
    [query.sort]: query.order
  };

  const [data, totalItems] = await prisma.$transaction([
    prisma.product.findMany({
      skip,
      take: query.perPage,
      orderBy
    }),
    prisma.product.count()
  ]);

  return { data, totalItems };
}

export function findProductById(productId: string) {
  return prisma.product.findUnique({
    where: { id: productId }
  });
}

export function findProductByName(name: string) {
  return prisma.product.findUnique({
    where: { name }
  });
}

export function createProduct(productId: string, input: CreateProductInput) {
  return prisma.product.create({
    data: {
      id: productId,
      name: input.name.trim(),
      price: input.price,
      stock: input.stock,
      category: input.category.trim()
    }
  });
}

export async function deleteProduct(productId: string) {
  const product = await findProductById(productId);

  if (!product) {
    return false;
  }

  await prisma.product.delete({
    where: { id: productId }
  });

  return true;
}
