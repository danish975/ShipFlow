import { Request, Response, NextFunction } from 'express';
import { UserRole } from '../types';
import { ApiError } from '../utils/ApiError';

export const authorize = (...roles: UserRole[]) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(ApiError.unauthorized('Authentication required'));
    }

    if (!roles.includes(req.user.role as UserRole)) {
      return next(ApiError.forbidden('You do not have permission to perform this action'));
    }

    next();
  };
};
