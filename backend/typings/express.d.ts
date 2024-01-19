// Models
import { UserType } from '../src/api/v1/types';

declare module 'express-session' {
  interface SessionData {
    user: UserType | undefined;
  }
}

declare global {
  namespace Express {
    interface Request {
      user: UserType | undefined;
    }
  }
}
export {};
