// Express
import { NextFunction, Request, Response } from 'express';
// Constants, Helpers & Types
import { ResponseCode } from '../types/enum';

// authentication checker middleware
export const authenticateUser = (req: Request, res: Response, next: NextFunction) => {
  const user = req.session?.user;
  if (user) {
    req.user = user;
    next();
  } else {
    res.status(401).json({
      code: ResponseCode.UNAUTHENTICATED,
      message: 'User not authenticated.',
    });
  }
};
