import jwt from "jsonwebtoken";
import {
  authEnvMock,
  authUserMock,
  googleAccessTokenMock,
  googleCodeMock,
  makeAuthRepositoryMock,
  makeGoogleAccessTokenResponseMock,
  makeGoogleProfileResponseMock,
  type AuthRepositoryMock,
} from "../../mock/auth.mock.js";
import type AuthRepository from "../../../src/repository/auth.repository.js";
import { AuthUserUseCase } from "../../../src/useCase/auth.usecase.js";

describe("AuthUserUseCase.loginUserWithGoogle", () => {
  const originalEnv = process.env;
  const originalFetch = global.fetch;

  let authRepository: jest.Mocked<AuthRepositoryMock>;
  let authUserUseCase: AuthUserUseCase;
  let fetchMock: jest.MockedFunction<typeof fetch>;

  beforeEach(() => {
    process.env = {
      ...originalEnv,
      ...authEnvMock,
    };

    authRepository = makeAuthRepositoryMock();

    fetchMock = jest.fn() as jest.MockedFunction<typeof fetch>;
    global.fetch = fetchMock;

    authUserUseCase = new AuthUserUseCase(
      authRepository as unknown as AuthRepository,
    );
  });

  afterEach(() => {
    process.env = originalEnv;
    global.fetch = originalFetch;
    jest.clearAllMocks();
  });

  test("should login user with Google profile and return access and refresh tokens", async () => {
    fetchMock
      .mockResolvedValueOnce(makeGoogleAccessTokenResponseMock())
      .mockResolvedValueOnce(makeGoogleProfileResponseMock());

    authRepository.upsertByUser.mockResolvedValue(authUserMock);

    const result = await authUserUseCase.loginUserWithGoogle(googleCodeMock);

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock).toHaveBeenNthCalledWith(
      1,
      "https://oauth2.googleapis.com/token",
      expect.objectContaining({
        method: "POST",
        headers: {
          "content-type": "application/x-www-form-urlencoded",
        },
      }),
    );

    const tokenRequest = fetchMock.mock.calls[0]?.[1] as RequestInit;
    const tokenRequestBody = tokenRequest.body as URLSearchParams;

    expect(tokenRequestBody.get("code")).toBe(googleCodeMock);
    expect(tokenRequestBody.get("client_id")).toBe(authEnvMock.GOOGLE_CLIENT_ID);
    expect(tokenRequestBody.get("client_secret")).toBe(
      authEnvMock.GOOGLE_CLIENT_SECRET,
    );
    expect(tokenRequestBody.get("redirect_uri")).toBe(
      authEnvMock.GOOGLE_REDIRECT_URI,
    );
    expect(tokenRequestBody.get("grant_type")).toBe("authorization_code");

    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      "https://www.googleapis.com/oauth2/v3/userinfo",
      {
        headers: {
          authorization: `Bearer ${googleAccessTokenMock}`,
        },
      },
    );

    expect(authRepository.upsertByUser).toHaveBeenCalledWith({
      name: authUserMock.name,
      email: authUserMock.email,
    });
    expect(result).toEqual({
      message: "Login Realizado com sucesso",
      user: authUserMock,
      access_token: expect.any(String),
      refresh_token: expect.any(String),
    });

    expect(jwt.verify(result.access_token, authEnvMock.JWT_ACCESS_SECRET)).toEqual(
      expect.objectContaining({
        id: authUserMock.id,
        name: authUserMock.name,
        email: authUserMock.email,
        type: "access",
      }),
    );
    expect(
      jwt.verify(result.refresh_token, authEnvMock.JWT_REFRESH_SECRET),
    ).toEqual(
      expect.objectContaining({
        id: authUserMock.id,
        name: authUserMock.name,
        email: authUserMock.email,
        type: "refresh",
      }),
    );
  });
});
