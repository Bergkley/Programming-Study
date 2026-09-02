import { Router } from "express";
import { makeAuthUserController } from "../factory/controller/auth.controller.factory.js";

export const authRoute = Router()
const authController = makeAuthUserController()

authRoute.get('/google/login',authController.googleLoginController)