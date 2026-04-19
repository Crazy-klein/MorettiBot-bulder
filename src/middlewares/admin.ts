import { Request, Response, NextFunction } from 'express';

export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (req.session && (req.session as any).isAdmin) {
    return next();
  }
  res.status(403).render('error', { 
    message: 'Accès refusé. Droits administrateur requis.',
    error: { status: 403 }
  });
};
