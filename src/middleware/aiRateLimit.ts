import rateLimit from "express-rate-limit";

export const aiRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10,             // 10 requests per minute per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: "Too many AI requests, please try again later."
  }
});
