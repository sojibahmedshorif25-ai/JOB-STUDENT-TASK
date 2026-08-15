import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { Role } from '../types';

export const signToken = (payload: { id: string; role: Role; email: string }): string => {
  return jwt.sign(payload, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn as jwt.SignOptions['expiresIn'],
  });
};

export const verifyToken = (token: string): { id: string; role: Role; email: string } => {
  return jwt.verify(token, env.jwtSecret) as { id: string; role: Role; email: string };
};
