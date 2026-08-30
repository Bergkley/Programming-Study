import { Router } from "express";
import { makeAuthController } from "../factory/controllers/auth-controller.factory.js";
import { authAuthorizationMiddleware } from "../middlewares/authAutorization.middleware.js";
import { routeLimiter } from "../middlewares/rateLimit.middleware.js";

export const authRoutes = Router();
const authController = makeAuthController();

authRoutes.post("/register", routeLimiter({time:1, limit:1}),authController.registerUserController);
authRoutes.post('/login',routeLimiter({time:1, limit:1}),authController.loginUserController)
authRoutes.get('/me/:id',routeLimiter({time:1, limit:5}),authAuthorizationMiddleware,authController.FindByIdUserController)
