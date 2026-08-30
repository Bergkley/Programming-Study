declare module "cors" {
  import type { RequestHandler } from "express";

  type CorsOptions = {
    origin?: string | string[] | boolean;
    methods?: string[];
    allowedHeaders?: string[];
    credentials?: boolean;
  };

  export default function cors(options?: CorsOptions): RequestHandler;
}
