import { Router } from "express";
import { UserController } from "../controllers/user.controller.js";
import { UserRepository } from "../repository/user.repository.js";
import { GetUsersUseCase } from "../usecases/get-users.usecase.js";

const userRepository = new UserRepository();
const getUsersUseCase = new GetUsersUseCase(userRepository);
const userController = new UserController(getUsersUseCase);

export const userRouter = Router();

userRouter.get("/", userController.getUsersController);
