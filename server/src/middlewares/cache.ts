import { Request, Response, NextFunction } from 'express';

export const publicCache = (maxAgeSeconds: number = 60) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (req.method === 'GET' && !req.headers.authorization) {
      res.set(
        'Cache-Control',
        `public, max-age=${maxAgeSeconds}, s-maxage=${maxAgeSeconds * 2}, stale-while-revalidate=300`
      );
    }
    next();
  };
};
