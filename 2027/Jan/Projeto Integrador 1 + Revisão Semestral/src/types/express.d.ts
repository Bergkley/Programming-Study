import { Request } from "express";
import AuthenticatedUser from "./index.ts";

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

export {};
