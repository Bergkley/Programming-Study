import express from "express";
import { authRouter } from "./routes/auth.routes.js";
import { healthRouter } from "./routes/health.routes.js";
import { userRouter } from "./routes/users.routes.js";
import { errorHandler } from "./middlewares/error-handler.js";

const app = express();

app.use(express.json());
app.use(healthRouter);
app.use("/auth", authRouter);
app.use("/user", userRouter);

app.use(errorHandler);

export default app;

