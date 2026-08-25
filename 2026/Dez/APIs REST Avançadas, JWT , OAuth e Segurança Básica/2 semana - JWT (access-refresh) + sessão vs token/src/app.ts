import express from "express";
import { authRouter } from "./routes/auth.routes.js";
import { healthRouter } from "./routes/health.routes.js";
import { errorMiddleware } from "./middlewares/error.middleware.js";
import { notFoundMiddleware } from "./middlewares/not-found.middleware.js";
import { requestIdMiddleware } from "./middlewares/request-id.middleware.js";


export const app = express();

app.use(express.json());
app.use(requestIdMiddleware);

app.use(healthRouter);
app.use("/auth", authRouter);

app.use(notFoundMiddleware);
app.use(errorMiddleware);

