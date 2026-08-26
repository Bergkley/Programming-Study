import type { NextFunction, Request, Response } from "express";
import { GetUsersUseCase } from "../usecases/get-users.usecase.js";

export class UserController {
  constructor(private readonly getUsersUseCase: GetUsersUseCase) {}

  getUsersController = async (
    _req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const result = await this.getUsersUseCase.execute();

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
}
