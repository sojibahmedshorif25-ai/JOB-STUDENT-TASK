import { NextFunction, Request, Response } from 'express';
import mongoose from 'mongoose';
import { AppError } from '../utils/AppError';
import { env } from '../config/env';

interface MongoError extends Error {
  code?: number;
  keyValue?: Record<string, unknown>;
  errors?: Record<string, { message: string }>;
}

export const errorHandler = (
  err: Error | AppError | MongoError,
  req: Request,
  res: Response,
  _next: NextFunction,
) => {
  let statusCode = 500;
  let message = 'Something went wrong';
  let errors: string[] | undefined;

  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
  } else if (err instanceof mongoose.Error.ValidationError) {
    statusCode = 400;
    message = 'Validation failed';
    errors = Object.values(err.errors).map((e) => e.message);
  } else if (err instanceof mongoose.Error.CastError) {
    statusCode = 400;
    message = 'Invalid id format';
  } else if (err.name === 'ZodError') {
    statusCode = 400;
    message = 'Validation failed';
    const zodErr = err as { issues?: Array<{ path: Array<string | number>; message: string }> };
    errors = (zodErr.issues || []).map(
      (issue) => `${issue.path.join('.')}: ${issue.message}`,
    );
  } else if ((err as MongoError).code === 11000) {
    statusCode = 409;
    const key = (err as MongoError).keyValue;
    const field = key ? Object.keys(key)[0] : 'field';
    message = `${field} already exists`;
  } else if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token. Please login again.';
  } else if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired. Please login again.';
  } else {
    message = err.message || message;
  }

  if (env.nodeEnv === 'development') {
    console.error(err);
  }

  res.status(statusCode).json({
    success: false,
    statusCode,
    message,
    errors,
    stack: env.nodeEnv === 'development' ? err.stack : undefined,
  });
};
