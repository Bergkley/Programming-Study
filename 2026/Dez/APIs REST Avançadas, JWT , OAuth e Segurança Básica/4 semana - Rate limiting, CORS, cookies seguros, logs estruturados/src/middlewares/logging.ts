import { Request, Response, NextFunction } from "express";

export default function LoggerRequest(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const start = Date.now();

  res.on("finish", () => {
    const duration = Date.now() - start;
    console.log('[LoggerRequest]',{
      timestamp: new Date().toISOString(),
      method: req.method,
      path: req.path,
      status: req.statusCode || res.statusMessage,
      duration,
    });
  });

  next();
}
