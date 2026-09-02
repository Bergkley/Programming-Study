import AuthRepository from "../../repository/auth.repository.js";
import { AuthUserUseCase } from "../../useCase/auth.usecase.js";

export function makeAuthUserUseCase(): AuthUserUseCase {
  const authRepository = new AuthRepository();
  return new AuthUserUseCase(authRepository);
}
