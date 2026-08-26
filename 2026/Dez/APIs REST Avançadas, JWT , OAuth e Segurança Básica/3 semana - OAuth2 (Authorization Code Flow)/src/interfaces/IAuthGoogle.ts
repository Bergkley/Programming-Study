import type { NextFunction, Request, Response } from "express";


export interface IAuthGoogle {
  googleLoginController: (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => void;
  googleCallbackController: (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => Promise<void>;
}
