import type { Request, Response } from "express";
import { getGoogleAuthorizationUrl, getSavedUsers, loginWithGoogleCode } from "../services/auth.service.js";
import { badRequest } from "../utils/http-error.js";

function queryString(value: unknown) {
  return typeof value === "string" ? value : undefined;
}

export async function googleLoginController(request: Request, response: Response) {
  return response.redirect(getGoogleAuthorizationUrl(queryString(request.query.state)));
}

export async function googleCallbackController(request: Request, response: Response) {
  const providerError = queryString(request.query.error);
  if (providerError) {
    throw badRequest(`Google retornou erro: ${providerError}`);
  }

  const code = queryString(request.query.code);
  if (!code) {
    throw badRequest("Parametro code nao informado pelo Google");
  }

  const result = await loginWithGoogleCode(code);

  return response.status(200).json(result);
}

export async function usersController(_request: Request, response: Response) {
  const result = await getSavedUsers();
  return response.status(200).json(result);
}
