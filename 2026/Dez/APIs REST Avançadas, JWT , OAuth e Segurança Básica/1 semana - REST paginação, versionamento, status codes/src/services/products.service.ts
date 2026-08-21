import { randomUUID } from "node:crypto";
import type { Product } from "../../generated/prisma/client.js";
import * as productsRepository from "../repositories/products.repository.js";
import type { CreateProductInput, ProductListQuery, ValidationIssue } from "../types/products.js";
import { conflict, notFound, validationError } from "../utils/http-error.js";
import { buildPaginationLinks } from "../utils/pagination.js";

export async function listProducts(query: ProductListQuery, path: string) {
  const { data, totalItems } = await productsRepository.listProducts(query);
  const totalPages = Math.max(Math.ceil(totalItems / query.perPage), 1);

  return {
    data,
    meta: {
      page: query.page,
      perPage: query.perPage,
      totalItems,
      totalPages,
      hasNextPage: query.page < totalPages,
      hasPreviousPage: query.page > 1
    },
    links: buildPaginationLinks({ path, query, totalPages })
  };
}

export async function getProduct(productId: string) {
  const product = await productsRepository.findProductById(productId);

  if (!product) {
    throw notFound("Produto nao encontrado");
  }

  return product;
}

export async function createProduct(input: unknown) {
  const productInput = validateCreateProductInput(input);
  const existingProduct = await productsRepository.findProductByName(productInput.name.trim());

  if (existingProduct) {
    throw conflict("Ja existe um produto com esse nome");
  }

  return productsRepository.createProduct(`prd_${randomUUID().slice(0, 8)}`, productInput);
}

export async function deleteProduct(productId: string) {
  const deleted = await productsRepository.deleteProduct(productId);

  if (!deleted) {
    throw notFound("Produto nao encontrado");
  }
}

export function toProductV1(product: Product) {
  return {
    id: product.id,
    name: product.name,
    price: product.price
  };
}

export function toProductV2(product: Product) {
  return {
    id: product.id,
    name: product.name,
    price: product.price,
    stock: product.stock,
    category: product.category,
    createdAt: product.createdAt.toISOString(),
    links: {
      self: `/v2/products/${product.id}`
    }
  };
}

function validateCreateProductInput(input: unknown): CreateProductInput {
  const body = input as Partial<CreateProductInput>;
  const errors: ValidationIssue[] = [];
  const name = body.name;
  const price = body.price;
  const stock = body.stock;
  const category = body.category;
  const normalizedName = typeof name === "string" ? name.trim() : "";
  const normalizedCategory = typeof category === "string" ? category.trim() : "";
  const normalizedPrice = Number(price);
  const normalizedStock = Number(stock);

  if (normalizedName.length < 3) {
    errors.push({ field: "name", message: "name deve ter pelo menos 3 caracteres" });
  }

  if (typeof price !== "number" || price <= 0) {
    errors.push({ field: "price", message: "price deve ser maior que zero" });
  }

  if (!Number.isInteger(stock) || normalizedStock < 0) {
    errors.push({ field: "stock", message: "stock deve ser um inteiro maior ou igual a zero" });
  }

  if (normalizedCategory.length < 2) {
    errors.push({ field: "category", message: "category deve ter pelo menos 2 caracteres" });
  }

  if (errors.length > 0) {
    throw validationError("Dados invalidos para criar produto", errors);
  }

  return {
    name: normalizedName,
    price: normalizedPrice,
    stock: normalizedStock,
    category: normalizedCategory
  };
}
