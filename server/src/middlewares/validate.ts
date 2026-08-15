import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';

export const validate =
  (schema: ZodSchema) =>
  (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const err = new Error('Validation failed') as Error & { issues: unknown; name: string };
      err.issues = result.error.issues;
      err.name = 'ZodError';
      return next(err);
    }
    req.body = result.data;
    next();
  };
