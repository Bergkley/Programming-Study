import cors from "cors";

export function configurarCors() {
  return cors({
    origin: "http://localhost:3000",

    methods: ["GET", "POST", "PUT", "DELETE"],

    allowedHeaders: ["Content-Type", "Authorization"],

    // 4. Permite o envio de cookies/sessões entre origens diferentes
    credentials: true,
  });
}
