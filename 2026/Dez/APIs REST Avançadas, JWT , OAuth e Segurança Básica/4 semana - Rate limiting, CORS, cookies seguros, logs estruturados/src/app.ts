import express from "express";
import LoggerRequest from "./middlewares/logging.js";
import { authRoutes } from "./routes/auth.routes.js";
import { errorHandler } from "./middlewares/error-handler.js";
import { configurarCors } from "./config/cors.js";

export default class App {
  public readonly app: express.Application;
  constructor() {
    this.app = express();
    this.middlewares();
    this.routes();
  }

  middlewares() {
    this.app.use(configurarCors());
    this.app.use(express.json());
    this.app.use(LoggerRequest);
  }

  routes() {
    this.app.use("/auth", authRoutes);
    this.app.use(errorHandler);
  }

  public get instance(): express.Application {
    return this.app;
  }
}
