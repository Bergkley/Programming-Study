import { json, Router } from "express";
import { makeAuthUserController } from "../factory/controller/auth.controller.factory.js";

export const authRoute = Router();
const authController = makeAuthUserController();

authRoute.get(
  "/google/authorization",
  authController.googleAuthorizationController,
);
authRoute.get("/google/login", authController.loginGoogleController);
authRoute.post("/refresh", json(), authController.refreshTokenController);
