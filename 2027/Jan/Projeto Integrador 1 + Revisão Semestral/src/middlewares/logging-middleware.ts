import { Request, Response, NextFunction } from "express";

export function LoggerRequest(req: Request, res: Response, next: NextFunction) {
  res.on("finish", () => {
    const start = Date.now();

    const duration = Date.now() - start;

    console.log("[LoggerRequest]", {
      timeStamp: new Date().toISOString(),
      method:req.method,
      path:req.path,
      status:req.statusCode ?? req.statusMessage,
      duration
    });
  });
  
  next()
}
