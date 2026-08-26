import { Router } from "express";
import { AuthGoogleController } from "../controllers/authGoogle.controller.js";
import { AuthRepository } from "../repository/auth.repository.js";
import { AuthGoogleUseCase } from "../usecases/auth-google.usecase.js";

export const authRouter = Router();

const authRepository = new AuthRepository();
const authGoogleUseCase = new AuthGoogleUseCase(authRepository);
const authGoogleController = new AuthGoogleController(authGoogleUseCase);

authRouter.get("/google", authGoogleController.googleLoginController);

authRouter.get("/google/callback", authGoogleController.googleCallbackController);
