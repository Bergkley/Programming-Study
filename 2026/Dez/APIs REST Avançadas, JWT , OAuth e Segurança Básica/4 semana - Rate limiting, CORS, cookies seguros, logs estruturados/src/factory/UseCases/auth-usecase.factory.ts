import { AuthRepository } from "../../repository/auth.repository.js";
import { AuthUseCase } from "../../useCase/auth.usecase.js";

export function makeAuthUseCase(): AuthUseCase {
  const authRepository = new AuthRepository();

  return new AuthUseCase(authRepository);
}
