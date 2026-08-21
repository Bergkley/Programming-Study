import type { Request } from "express";
import type { ProductListQuery, SortField, SortOrder } from "../types/products.js";
import { badRequest } from "./http-error.js";

const sortFields = new Set<SortField>(["name", "price", "createdAt"]);
const sortOrders = new Set<SortOrder>(["asc", "desc"]);

type PaginationLinksInput = {
  path: string;
  query: ProductListQuery;
  totalPages: number;
};

export function parseProductListQuery(request: Request): ProductListQuery {
  const page = Number(request.query.page ?? 1);
  const perPage = Number(request.query.perPage ?? 10);
  const sort = request.query.sort ?? "createdAt";
  const order = request.query.order ?? "desc";

  if (!Number.isInteger(page) || page < 1) {
    throw badRequest("page deve ser maior ou igual a 1");
  }

  if (!Number.isInteger(perPage) || perPage < 1 || perPage > 100) {
    throw badRequest("perPage deve estar entre 1 e 100");
  }

  if (!isSortField(sort)) {
    throw badRequest("sort deve ser name, price ou createdAt");
  }

  if (!isSortOrder(order)) {
    throw badRequest("order deve ser asc ou desc");
  }

  return { page, perPage, sort, order };
}

export function buildPaginationLinks({ path, query, totalPages }: PaginationLinksInput) {
  const createLink = (page: number) => {
    const search = new URLSearchParams({
      page: String(page),
      perPage: String(query.perPage),
      sort: query.sort,
      order: query.order
    });

    return `${path}?${search.toString()}`;
  };

  return {
    self: createLink(query.page),
    first: createLink(1),
    previous: query.page > 1 ? createLink(query.page - 1) : null,
    next: query.page < totalPages ? createLink(query.page + 1) : null,
    last: createLink(totalPages)
  };
}

function isSortField(value: unknown): value is SortField {
  return typeof value === "string" && sortFields.has(value as SortField);
}

function isSortOrder(value: unknown): value is SortOrder {
  return typeof value === "string" && sortOrders.has(value as SortOrder);
}
