import { Router } from "express";
import { asyncHandler } from "../middlewares/async-handler.js";
import * as productsService from "../services/products.service.js";
import { parseProductListQuery } from "../utils/pagination.js";

export const productsV2Router = Router();

productsV2Router.get(
  "/products",
  asyncHandler(async (request, response) => {
    response.setHeader("X-API-Version", "2");

    const query = parseProductListQuery(request);
    const page = await productsService.listProducts(query, "/v2/products");

    response.status(200).json({
      data: page.data.map(productsService.toProductV2),
      meta: page.meta,
      links: page.links
    });
  })
);

productsV2Router.post(
  "/products",
  asyncHandler(async (request, response) => {
    response.setHeader("X-API-Version", "2");

    const product = await productsService.createProduct(request.body);

    response
      .status(201)
      .location(`/v2/products/${product.id}`)
      .json(productsService.toProductV2(product));
  })
);

productsV2Router.get(
  "/products/:productId",
  asyncHandler(async (request, response) => {
    response.setHeader("X-API-Version", "2");
    const productId = request.params.productId;

    if (!productId) {
      response.status(400).json({
        error: {
          code: "BAD_REQUEST",
          message: "productId e obrigatorio",
          statusCode: 400,
          requestId: response.locals.requestId
        }
      });
      return;
    }

    const product = await productsService.getProduct(productId);

    response.status(200).json(productsService.toProductV2(product));
  })
);

productsV2Router.delete(
  "/products/:productId",
  asyncHandler(async (request, response) => {
    response.setHeader("X-API-Version", "2");
    const productId = request.params.productId;

    if (!productId) {
      response.status(400).json({
        error: {
          code: "BAD_REQUEST",
          message: "productId e obrigatorio",
          statusCode: 400,
          requestId: response.locals.requestId
        }
      });
      return;
    }

    await productsService.deleteProduct(productId);

    response.status(204).send();
  })
);
