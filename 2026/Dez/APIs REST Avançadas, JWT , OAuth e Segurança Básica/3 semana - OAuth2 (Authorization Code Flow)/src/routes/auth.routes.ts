import { Router } from "express";
import { googleCallbackController, googleLoginController, usersController } from "../controllers/auth.controller.js";
import { asyncHandler } from "../middlewares/async-handler.js";

export const authRouter = Router();

authRouter.get("/google", asyncHandler(googleLoginController));
authRouter.get("/google/callback", asyncHandler(googleCallbackController));
authRouter.get("/users", asyncHandler(usersController));
