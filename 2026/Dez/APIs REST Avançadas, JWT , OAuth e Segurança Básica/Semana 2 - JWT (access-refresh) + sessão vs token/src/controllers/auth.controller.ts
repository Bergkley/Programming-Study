import type { Request, Response } from "express";
import { getUserById, login, logout, refresh, register } from "../services/auth.service.js";
import { unauthorized } from "../utils/http-error.js";

function metaFromRequest(request: Request) {
  return {
    userAgent: request.get("user-agent"),
    ipAddress: request.ip
  };
}

export async function registerController(request: Request, response: Response) {
  const result = await register(request.body, metaFromRequest(request));

  return response.status(201).json(result);
}

export async function loginController(request: Request, response: Response) {
  const result = await login(request.body, metaFromRequest(request));

  return response.status(200).json(result);
}

export async function refreshController(request: Request, response: Response) {
  const result = await refresh(request.body, metaFromRequest(request));

  return response.status(200).json(result);
}

export async function logoutController(request: Request, response: Response) {
  await logout(request.body);

  return response.status(204).send();
}

export async function meController(request: Request, response: Response) {
  if (!request.user) {
    throw unauthorized();
  }

  const user = await getUserById(request.user.id);

  return response.status(200).json({ user });
}
