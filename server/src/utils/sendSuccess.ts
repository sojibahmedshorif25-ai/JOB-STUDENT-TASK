import { Response } from 'express';
import { ApiResponse } from './ApiResponse';

export const sendSuccess = <T>(
  res: Response,
  statusCode: number,
  message: string,
  data?: T,
  meta?: Record<string, unknown>,
) => {
  res.status(statusCode).json(new ApiResponse<T>(statusCode, message, data, meta));
};
