import { SafeUser } from 'src/common/types/safe-user.type';

declare global {
  namespace Express {

    interface User extends SafeUser {}  // Required, else taking user from req.user becomes
                                        // impossible
    interface Request {
      user?: User;
      cookies?: { [key: string]: string };
    }

  }
}

export {};