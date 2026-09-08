import type AuthRepository from "../../../src/repository/auth.repository.js";
import { AuthUserUseCase } from "../../../src/useCase/auth.usecase.js";
import {
  authEnvMock,
  AuthRepositoryMock,
  makeAuthRepositoryMock,
} from "../../mock/auth.mock.js";

describe("AuthUserUseCase.getAuthorizationGoogle", () => {
  const originEnv = process.env;
  let authUserUseCase: AuthUserUseCase;
  let authRepository: jest.Mocked<AuthRepositoryMock>;

  beforeAll(() => {
    process.env = {
      ...originEnv,
      GOOGLE_CLIENT_ID: authEnvMock.GOOGLE_CLIENT_ID,
      GOOGLE_REDIRECT_URI: authEnvMock.GOOGLE_REDIRECT_URI,
    };

    authRepository = makeAuthRepositoryMock();

    authUserUseCase = new AuthUserUseCase(
      authRepository as unknown as AuthRepository,
    );
  });

  afterAll(() => {
    process.env = originEnv;
  });

  test("should create the Google authorization URL with the required params", () => {
    const authorizationUrl = new URL(
      authUserUseCase.getAuthorizationGoogle(),
    );

    expect(`${authorizationUrl.origin}${authorizationUrl.pathname}`).toBe(
      "https://accounts.google.com/o/oauth2/v2/auth",
    );

    expect(authorizationUrl.searchParams.get("scope")).toBe(
      "openid email profile",
    );

    expect(authorizationUrl.searchParams.get("client_id")).toBe(
      "google-client-id",
    );

    expect(authorizationUrl.searchParams.get("redirect_uri")).toBe(
      "http://localhost:3000/auth/google/callback",
    );

    expect(authorizationUrl.searchParams.get("response_type")).toBe("code");

    expect(authorizationUrl.searchParams.get("access_type")).toBe("offline");

    expect(authorizationUrl.searchParams.get("prompt")).toBe("consent");

    expect(authorizationUrl.searchParams.has("state")).toBe(false);
  });
});
