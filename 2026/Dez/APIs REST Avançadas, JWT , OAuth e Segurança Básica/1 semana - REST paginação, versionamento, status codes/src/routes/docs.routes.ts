import { Router } from "express";
import swaggerUi from "swagger-ui-express";
import { openApiDocument } from "../openapi.js";

export const docsRouter = Router();

docsRouter.get("/openapi.json", (_request, response) => {
  response.status(200).json(openApiDocument);
});

docsRouter.use("/docs", swaggerUi.serve, swaggerUi.setup(openApiDocument));
