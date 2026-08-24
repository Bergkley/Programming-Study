import { Router } from "express";
import {
  loginController,
  logoutController,
  meController,
  refreshController,
  registerController
} from "../controllers/auth.controller.js";
import { requireAuth } from "../middlewares/authAutorization.middleware.js";
import { asyncHandler } from "../middlewares/async-handler.js";

export const authRouter = Router();

authRouter.post("/register", asyncHandler(registerController));
authRouter.post("/login", asyncHandler(loginController));
authRouter.post("/refresh", asyncHandler(refreshController));
authRouter.post("/logout", asyncHandler(logoutController));
authRouter.get("/me", requireAuth, asyncHandler(meController));
