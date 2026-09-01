import express from "express";
import { errorHandler } from "./middlewares/error-handle.middleware.js";
import { LoggerRequest } from "./middlewares/logging-middleware.js";


export default class App {
    public app: express.Application;

    constructor() {
        this.app = express();
        this.middlewares();
        this.routes();
    }

    private middlewares(): void {
       this.app.use(LoggerRequest) 
    }

    private routes(): void {

        this.app.use(errorHandler)
    }

    public get instance(): express.Application {
        return this.app;
    }
}