import type { AuthenticatedUser } from "../middlewares/authAutorization.middleware.js";

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

export {};
