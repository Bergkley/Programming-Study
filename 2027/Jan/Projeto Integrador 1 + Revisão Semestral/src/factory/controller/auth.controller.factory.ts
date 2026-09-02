import { authUserController } from "../../controller/auth.controller.js";
import { makeAuthUserUseCase } from "../useCase/auth.useCase.factory.js";

export function makeAuthUserController(): authUserController {
  return new authUserController(makeAuthUserUseCase());
}
