import { NextFunction, Request, Response } from 'express';
import { verifyToken } from '../utils/token';
import { AppError } from '../utils/AppError';
import { Role } from '../types';

export const protect = (req: Request, _res: Response, next: NextFunction) => {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) {
      return next(new AppError('Not authorized. Please login.', 401));
    }
    const token = header.split(' ')[1];
    const decoded = verifyToken(token);
    req.user = { id: decoded.id, role: decoded.role, email: decoded.email };
    next();
  } catch {
    next(new AppError('Not authorized. Please login.', 401));
  }
};

export const authorize =
  (...roles: Role[]) =>
  (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(new AppError('You do not have permission to perform this action', 403));
    }
    next();
  };
