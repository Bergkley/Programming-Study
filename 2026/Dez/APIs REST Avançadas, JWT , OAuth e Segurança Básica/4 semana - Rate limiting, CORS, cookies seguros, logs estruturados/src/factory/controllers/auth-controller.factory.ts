import { AuthController } from "../../controllers/auth.controller.js";
import { makeAuthUseCase } from "../UseCases/auth-usecase.factory.js";

export function makeAuthController(): AuthController {
  return new AuthController(makeAuthUseCase());
}
