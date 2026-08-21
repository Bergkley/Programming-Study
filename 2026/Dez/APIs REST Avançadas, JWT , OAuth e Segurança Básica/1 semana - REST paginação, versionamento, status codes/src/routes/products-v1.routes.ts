import { Router } from "express";
import { asyncHandler } from "../middlewares/async-handler.js";
import * as productsService from "../services/products.service.js";
import { parseProductListQuery } from "../utils/pagination.js";

export const productsV1Router = Router();

productsV1Router.get(
  "/products",
  asyncHandler(async (request, response) => {
    response.setHeader("X-API-Version", "1");

    const query = parseProductListQuery(request);
    const page = await productsService.listProducts(query, "/v1/products");

    response.status(200).json({
      data: page.data.map(productsService.toProductV1),
      meta: page.meta,
      links: page.links
    });
  })
);
