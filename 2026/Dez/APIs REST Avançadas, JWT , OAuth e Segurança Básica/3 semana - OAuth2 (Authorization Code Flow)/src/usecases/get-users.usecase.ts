import { UserRepository } from "../repository/user.repository.js";
import type { UserListItem } from "../types/index.js";

export class GetUsersUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(): Promise<UserListItem[]> {
    return this.userRepository.findAll();
  }
}
