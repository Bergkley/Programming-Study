import express from "express";
import { errorMiddleware } from "./middlewares/error.middleware.js";
import { notFoundMiddleware } from "./middlewares/not-found.middleware.js";
import { requestIdMiddleware } from "./middlewares/request-id.middleware.js";
import { docsRouter } from "./routes/docs.routes.js";
import { healthRouter } from "./routes/health.routes.js";
import { productsV1Router } from "./routes/products-v1.routes.js";
import { productsV2Router } from "./routes/products-v2.routes.js";

export const app = express();

app.use(express.json());
app.use(requestIdMiddleware);

app.use(docsRouter);
app.use(healthRouter);
app.use("/v1", productsV1Router);
app.use("/v2", productsV2Router);

app.use(notFoundMiddleware);
app.use(errorMiddleware);
