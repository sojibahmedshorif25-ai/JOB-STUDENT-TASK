import rateLimit from 'express-rate-limit';
import { AppError } from '../utils/AppError';

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, _res, next) => next(new AppError('Too many requests, please try again later.', 429)),
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, _res, next) =>
    next(new AppError('Too many login attempts, please try again later.', 429)),
});

export const oauthLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, _res, next) =>
    next(new AppError('Too many OAuth requests, please try again later.', 429)),
});
