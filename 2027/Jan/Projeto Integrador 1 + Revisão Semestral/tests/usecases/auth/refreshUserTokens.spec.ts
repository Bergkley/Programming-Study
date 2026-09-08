import jwt from "jsonwebtoken";
import {
  authEnvMock,
  authUserMock,
  makeAuthRepositoryMock,
  makeRefreshTokenMock,
  type AuthRepositoryMock,
} from "../../mock/auth.mock.js";
import AuthRepository from "../../../src/repository/auth.repository.js";
import { AuthUserUseCase } from "../../../src/useCase/auth.usecase.js";

describe("AuthUserUseCase.refreshUserTokens", () => {
  const originEnv = process.env;
  let authUserUseCase: AuthUserUseCase;
  let authRepository: jest.Mocked<AuthRepositoryMock>;
  beforeEach(() => {
    process.env = {
      ...originEnv,
      ...authEnvMock,
    };

    authRepository = makeAuthRepositoryMock();
    authUserUseCase = new AuthUserUseCase(authRepository);
  });

  afterEach(() => {
    process.env = originEnv;
    jest.clearAllMocks();
  });

  test("should create new access and refresh tokens from a valid refresh token", async () => {
    const refreshToken = makeRefreshTokenMock();

    authRepository.getUser.mockResolvedValue(authUserMock);

    const result = await authUserUseCase.refreshUserTokens(refreshToken);

    expect(authRepository.getUser).toHaveBeenCalledWith({
      id: authUserMock.id,
    });

   expect(result).toEqual({
      access_token: expect.any(String),
      refresh_token: expect.any(String),
    });

    expect(result.refresh_token).not.toBe(refreshToken);

    expect(jwt.verify(result.access_token, authEnvMock.JWT_ACCESS_SECRET)).toEqual(
      expect.objectContaining({
        id: authUserMock.id,
        name: authUserMock.name,
        email: authUserMock.email,
        type: "access",
      }),
    );
    expect(jwt.verify(result.refresh_token, authEnvMock.JWT_REFRESH_SECRET)).toEqual(
      expect.objectContaining({
        id: authUserMock.id,
        name: authUserMock.name,
        email: authUserMock.email,
        type: "refresh",
      }),
    );

    
  });

  test("should throw unauthorized when refresh token is invalid", () => {
    try {
      authUserUseCase.refreshUserTokens('invalid-refresh')
    } catch (error) {
       expect(error).toEqual(
        expect.objectContaining({
          statusCode: 401,
          code: "UNAUTHORIZED",
          message: "Refresh token invalido ou expirado",
        }),
      );
    }
  })
});
