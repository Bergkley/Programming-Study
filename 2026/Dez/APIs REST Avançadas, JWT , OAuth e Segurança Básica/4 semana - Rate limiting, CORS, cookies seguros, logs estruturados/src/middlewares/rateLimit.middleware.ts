import rateLimit from "express-rate-limit";

export function routeLimiter({ time = 15, limit = 100, legacyHeaders = false }) {
    return rateLimit({
        windowMs: time * 60 * 1000,
        limit,
        message: {
            status: 429,
                message: 'Muitas requisições vindas deste IP. Tente novamente mais tarde.'
        },
        standardHeaders: 'draft-7',
        legacyHeaders
    })
}