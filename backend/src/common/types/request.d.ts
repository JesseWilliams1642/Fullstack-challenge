import { SafeUser } from 'src/modules/user/types/safe-user.types';

declare global {
  namespace Express {

    interface User extends SafeUser {}  // Required, else taking user from req.user becomes
                                        // impossible
    interface Request {
      user?: User;
    }
  }
}

export {};