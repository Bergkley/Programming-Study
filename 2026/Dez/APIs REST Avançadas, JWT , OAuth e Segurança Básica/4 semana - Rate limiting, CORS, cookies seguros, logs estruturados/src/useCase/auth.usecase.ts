import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { badRequest, forbidden, notFound } from "../errors/http-error.js";
import { AuthRepository } from "../repository/auth.repository.js";
import { CreateUser, FindByIdUser, LoginUser, User } from "../types/index.js";

export class AuthUseCase {
  constructor(private readonly authRepository: AuthRepository) {}

  async registerUser(data: CreateUser) {
    if (!data.name || !data.email || !data.password) {
      throw badRequest("Dados incompletos");
    }

    const user = await this.authRepository.createUser({
      name: data.name,
      email: data.email,
      password: await this.hashPassword(String(data.password)),
    });

    return user;
  }

  async loginUser(data: LoginUser) {
    if (!data.email || !data.password) {
      throw badRequest("Dados incompletos");
    }

    const user = await this.authRepository.findUser({
      email: data.email,
    });

    if (!user) {
      throw notFound("Usuario nao encontrado");
    }

    const passwordIsValid = await this.verifyPassword(
      data.password,
      user.password,
    );

    if (!passwordIsValid) {
      throw forbidden("Acesso negado");
    }

    const token = await this.generateToken({
      id: user.id,
      name: user.name,
      email: user.email,
    });

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      token,
    };
  }

  async findById(data: FindByIdUser) {
    if (!data.id) {
      throw notFound("Id nao encontrado");
    }

    const result = await this.authRepository.findByIdUser({
      id: data.id,
    });

    if (!result) {
      throw notFound("Usuario nao encontrado");
    }

    return result;
  }

  private async hashPassword(password: string) {
    const saltRounds = Number(process.env.BCRYPT_SALT_ROUNDS) || 10;

    return bcrypt.hash(password, saltRounds);
  }

  private async verifyPassword(password: string, passwordHash: string) {
    return bcrypt.compare(password, passwordHash);
  }

  private async generateToken(payload: Omit<User, "createdAt" | "updatedAt">) {
    const secret = (process.env.JWT_SECRET || "teste") as jwt.Secret;
    const expireAt = this.getAccessTokenTtl();
    const signOptions: jwt.SignOptions = {
      expiresIn: expireAt,
    };

    return jwt.sign(payload, secret, signOptions);
  }

  private getAccessTokenTtl(): jwt.SignOptions["expiresIn"] {
    const expireAt = process.env.ACCESS_TOKEN_TTL?.trim().replace(/;$/, "");

    return (expireAt || "1h") as jwt.SignOptions["expiresIn"];
  }
}
