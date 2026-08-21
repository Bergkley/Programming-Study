export type SortField = "name" | "price" | "createdAt";
export type SortOrder = "asc" | "desc";

export type ProductListQuery = {
  page: number;
  perPage: number;
  sort: SortField;
  order: SortOrder;
};

export type CreateProductInput = {
  name: string;
  price: number;
  stock: number;
  category: string;
};

export type ValidationIssue = {
  field: string;
  message: string;
};
